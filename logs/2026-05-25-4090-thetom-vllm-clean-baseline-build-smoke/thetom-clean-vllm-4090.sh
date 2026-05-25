#!/usr/bin/env bash
set -Eeuo pipefail

STAMP="20260525-$(date +%H%M%S)"
LAB=/home/felipe/vllm-lab
SRC="$LAB/vllm-turboquant-clean-20260525"
VENV="$LAB/venv-tq-clean-20260525"
LOGDIR="$LAB/clean-baseline-logs"
LOG="$LOGDIR/thetom-clean-build-smoke-$STAMP.log"
SERVER_LOG="$LOGDIR/thetom-clean-server-$STAMP.log"
PIDFILE="$LOGDIR/thetom-clean-server.pid"
UPSTREAM="https://github.com/TheTom/vllm-turboquant.git"
COMMIT="36fc048255d0bbdab05811d667182a965fe05936"
PORT=11436
MODEL="Qwen/Qwen2.5-7B-Instruct"

mkdir -p "$LOGDIR"
exec > >(tee -a "$LOG") 2>&1

log(){ echo "[$(date -Is)] $*"; }

log "THETOM_CLEAN_BASELINE_BEGIN"
log "LOG=$LOG"
log "SERVER_LOG=$SERVER_LOG"
log "SRC=$SRC"
log "VENV=$VENV"
log "COMMIT=$COMMIT"
log "PORT=$PORT"

log "HOST_INFO"
hostname || true
uname -a || true
free -h | sed -n '1,2p' || true
df -h "$LAB" | tail -1 || true
nvidia-smi --query-gpu=name,driver_version,memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv,noheader || true

log "PORT_PREFLIGHT"
if ss -ltn "sport = :$PORT" | grep -q ":$PORT"; then
  log "FAIL port_$PORT_already_listening"
  ss -ltnp "sport = :$PORT" || true
  exit 10
fi

log "CREATE_CLEAN_CHECKOUT"
rm -rf "$SRC"
git clone "$UPSTREAM" "$SRC"
cd "$SRC"
git checkout "$COMMIT"
log "GIT_HEAD=$(git rev-parse HEAD)"
log "GIT_STATUS_START"
git status --short
log "GIT_STATUS_END"
if [ -e vllm/v1/attention/evidence_paged_kv ]; then
  log "FAIL found_evidence_paged_kv_in_clean_checkout"
  exit 11
fi

log "CREATE_CLEAN_VENV"
rm -rf "$VENV"
~/.local/bin/uv venv "$VENV" --python 3.12

log "INSTALL_CUDA_TORCH_DEPS"
export UV_CACHE_DIR=/home/felipe/.cache/uv-tq-clean-20260525
~/.local/bin/uv pip install --python "$VENV/bin/python" \
  "nvidia-cuda-nvcc==13.0.88" \
  "nvidia-cuda-crt==13.0.88" \
  "nvidia-cuda-runtime==13.0.96" \
  "nvidia-nvvm==13.0.88" \
  "nvidia-cuda-cccl<13.1"
~/.local/bin/uv pip install --python "$VENV/bin/python" \
  --index-url https://download.pytorch.org/whl/cu130 \
  "torch==2.11.0" torchvision torchaudio
~/.local/bin/uv pip install --python "$VENV/bin/python" \
  "cmake>=3.26.1" ninja "packaging>=24.2" "setuptools>=77.0.3,<81.0.0" \
  "setuptools-scm>=8.0" wheel jinja2 numpy

export CU=$VENV/lib/python3.12/site-packages/nvidia/cu13
(
  cd "$CU/lib"
  for f in lib*.so.*; do
    [ -e "$f" ] || continue
    base=$(echo "$f" | sed -E 's/\.so\.[0-9].*$/.so/')
    [ ! -e "$base" ] && ln -s "$f" "$base" || true
  done
  ln -sf /usr/lib/wsl/lib/libcuda.so.1 libcuda.so
  mkdir -p stubs
  ln -sf /usr/lib/wsl/lib/libcuda.so.1 stubs/libcuda.so
)
[ ! -e "$CU/lib64" ] && ln -s lib "$CU/lib64"

export CUDA_HOME=$CU
export CUDA_PATH=$CUDA_HOME
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib:/usr/lib/wsl/lib:${LD_LIBRARY_PATH:-}
export LIBRARY_PATH=$CUDA_HOME/lib:/usr/lib/wsl/lib:${LIBRARY_PATH:-}
export CMAKE_LIBRARY_PATH=/usr/lib/wsl/lib
export MAX_JOBS=4
export TORCH_CUDA_ARCH_LIST=8.9
export NVCC_THREADS=1
export HF_HOME=/home/felipe/hf-cache

log "VERSIONS_BEFORE_BUILD"
"$VENV/bin/python" - <<'PY'
import torch, sys, importlib.metadata as md
print('python', sys.version)
print('torch', torch.__version__, torch.__file__)
for p in ['torch','torchvision','torchaudio']:
    try: print(p, md.version(p))
    except Exception as e: print(p, e)
PY
nvcc --version | sed -n '1,4p'

log "BUILD_VLLM_BEGIN"
~/.local/bin/uv pip install --python "$VENV/bin/python" --no-build-isolation -e "$SRC"
log "BUILD_VLLM_END"

log "IMPORT_SMOKE"
"$VENV/bin/python" - <<'PY'
import torch, vllm
print('torch_after', torch.__version__, torch.__file__)
print('vllm_after', vllm.__version__, vllm.__file__)
from vllm import LLM, SamplingParams
print('TQ_IMPORT_OK')
PY

log "START_CLEAN_SERVER"
# Clean upstream env only: TriAttention settings retained, no sztlink EPKV vars exported.
export VLLM_TRIATT_ENABLED=1
export VLLM_TRIATT_HYBRID=2
export VLLM_TRIATT_BUDGET=2048
export VLLM_TRIATT_PREFIX=128
export VLLM_TRIATT_WINDOW=128
export VLLM_TRIATT_SEGMENTS=8
export VLLM_TRIATT_N_LAYERS=28
export VLLM_TRIATT_N_HEADS=28
export VLLM_TRIATT_N_KV_HEADS=4
export VLLM_TRIATT_HEAD_DIM=128
export VLLM_TRIATT_ROPE_THETA=1000000.0
unset VLLM_EPKV_HOOK VLLM_EPKV_RUNTIME_HOOK VLLM_EPKV_LOGIT_BIAS VLLM_EPKV_LOGIT_POLICY_FILE || true

cd "$SRC"
nohup "$VENV/bin/python" -m vllm.entrypoints.openai.api_server \
  --host 0.0.0.0 \
  --port "$PORT" \
  --model "$MODEL" \
  --served-model-name thetom-clean qwen2.5-7b-tq-clean \
  --kv-cache-dtype turboquant_k8v4 \
  --max-model-len 8192 \
  --gpu-memory-utilization 0.82 \
  --enforce-eager \
  --hf-overrides '{"rope_scaling":{"rope_type":"yarn","factor":4.0,"original_max_position_embeddings":32768}}' \
  --generation-config vllm \
  --disable-uvicorn-access-log \
  > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PIDFILE"
log "CLEAN_SERVER_PID=$SERVER_PID"

log "WAIT_HEALTH"
for i in $(seq 1 180); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    log "FAIL server_exited_before_health"
    tail -120 "$SERVER_LOG" || true
    exit 12
  fi
  if curl -fsS --max-time 2 "http://127.0.0.1:$PORT/health" >/tmp/thetom-clean-health.txt 2>/tmp/thetom-clean-health.err; then
    log "HEALTH_OK attempt=$i"
    break
  fi
  if [ "$i" = 180 ]; then
    log "FAIL health_timeout"
    tail -160 "$SERVER_LOG" || true
    exit 13
  fi
  sleep 5
done

log "MODELS"
curl -fsS --max-time 10 "http://127.0.0.1:$PORT/v1/models" | tee "$LOGDIR/thetom-clean-models-$STAMP.json"

log "CHAT_SMOKE"
cat > "$LOGDIR/thetom-clean-chat-request-$STAMP.json" <<'JSON'
{"model":"thetom-clean","messages":[{"role":"user","content":"Compute 17 * 23. Answer with just the number."}],"temperature":0,"max_tokens":16}
JSON
curl -fsS --max-time 120 "http://127.0.0.1:$PORT/v1/chat/completions" \
  -H 'content-type: application/json' \
  --data-binary "@$LOGDIR/thetom-clean-chat-request-$STAMP.json" \
  | tee "$LOGDIR/thetom-clean-chat-response-$STAMP.json"

log "GPU_AFTER_SMOKE"
nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv,noheader || true
log "THETOM_CLEAN_BASELINE_READY pid=$SERVER_PID port=$PORT log=$LOG server_log=$SERVER_LOG"
