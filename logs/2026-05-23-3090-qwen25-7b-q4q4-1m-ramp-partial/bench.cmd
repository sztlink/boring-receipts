@echo off
setlocal enabledelayedexpansion
set "BIN=C:\Users\user\boring\kvdtype-source-build-v8-b9286-vs2019-pdlpatch-20260523\build\bin"
set "MODEL=C:\Users\user\boring\models\Qwen2.5-7B-Instruct-Q4_K_M.gguf"
set "OUT=C:\Users\user\boring\context-ramp-1m-qwen25-7b-v3-20260523"
if not exist "%OUT%" mkdir "%OUT%"
cd /d "%BIN%"

echo R16_V3_START %DATE% %TIME% > "%OUT%\run.log"
echo MODEL=%MODEL% >> "%OUT%\run.log"
echo BIN=%BIN% >> "%OUT%\run.log"
nvidia-smi --query-gpu=name,driver_version,memory.used,memory.total,utilization.gpu,temperature.gpu,power.draw --format=csv > "%OUT%\nvidia-smi-before.csv"
"%BIN%\llama-cli.exe" --version > "%OUT%\llama-cli-version.txt" 2>&1
"%BIN%\llama-bench.exe" --help > "%OUT%\llama-bench-help.txt" 2>&1

set "ANY_FAIL=0"
for %%D in (131072 262144 524288 786432 1048576) do (
  echo DEPTH %%D START %DATE% %TIME% >> "%OUT%\run.log"
  "%BIN%\llama-bench.exe" -m "%MODEL%" -ngl 99 -fa 1 -ctk q4_0 -ctv q4_0 -p 32 -n 16 -d %%D -r 1 -o jsonl > "%OUT%\q4q4-depth-%%D.jsonl" 2> "%OUT%\q4q4-depth-%%D.stderr.txt"
  set "EC=!ERRORLEVEL!"
  echo DEPTH %%D EXIT !EC! >> "%OUT%\run.log"
  nvidia-smi --query-gpu=name,driver_version,memory.used,memory.total,utilization.gpu,temperature.gpu,power.draw --format=csv > "%OUT%\nvidia-smi-after-%%D.csv"
  if not "!EC!"=="0" (
    set "ANY_FAIL=1"
    echo STOP_AFTER_FAIL %%D >> "%OUT%\run.log"
    goto after_depths
  )
)

:after_depths
echo ANY_FAIL !ANY_FAIL! >> "%OUT%\run.log"
if "!ANY_FAIL!"=="0" (
  echo USABLE_262K_START %DATE% %TIME% >> "%OUT%\run.log"
  "%BIN%\llama-bench.exe" -m "%MODEL%" -ngl 99 -fa 1 -ctk q4_0 -ctv q4_0 -p 128 -n 64 -d 262144 -r 1 -o jsonl > "%OUT%\q4q4-usable-262144.jsonl" 2> "%OUT%\q4q4-usable-262144.stderr.txt"
  echo USABLE_262K_EXIT !ERRORLEVEL! >> "%OUT%\run.log"
)
nvidia-smi --query-gpu=name,driver_version,memory.used,memory.total,utilization.gpu,temperature.gpu,power.draw --format=csv > "%OUT%\nvidia-smi-after.csv"
echo R16_V3_DONE %DATE% %TIME% >> "%OUT%\run.log"
exit /b 0
