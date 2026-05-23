@echo off
setlocal enabledelayedexpansion
set "BIN=C:\Users\user\boring\kvdtype-source-build-v8-b9286-vs2019-pdlpatch-20260523\build\bin"
set "MODEL=C:\Users\user\boring\models\Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf"
set "OUT=C:\Users\user\boring\kvdtype-source-build-v8-b9286-vs2019-pdlpatch-20260523\bench-20260523"
if not exist "%OUT%" mkdir "%OUT%"
cd /d "%BIN%"
nvidia-smi --query-gpu=name,driver_version,memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv > "%OUT%\nvidia-smi-before.csv"
"%BIN%\llama-cli.exe" --version > "%OUT%\llama-cli-version.txt" 2>&1
"%BIN%\llama-bench.exe" --help > "%OUT%\llama-bench-help.txt" 2>&1

for %%V in (f16-f16 q8_0-q8_0 q8_0-q4_0) do (
  if "%%V"=="f16-f16" set "CTK=f16"& set "CTV=f16"
  if "%%V"=="q8_0-q8_0" set "CTK=q8_0"& set "CTV=q8_0"
  if "%%V"=="q8_0-q4_0" set "CTK=q8_0"& set "CTV=q4_0"
  echo RUN %%V !DATE! !TIME! > "%OUT%\%%V.stderr.txt"
  "%BIN%\llama-bench.exe" -m "%MODEL%" -ngl 99 -fa 1 -ctk !CTK! -ctv !CTV! -p 512 -n 128 -r 5 -o jsonl > "%OUT%\%%V.jsonl" 2>> "%OUT%\%%V.stderr.txt"
  echo EXIT !ERRORLEVEL! >> "%OUT%\%%V.stderr.txt"
  nvidia-smi --query-gpu=name,driver_version,memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv > "%OUT%\nvidia-smi-after-%%V.csv"
)

nvidia-smi --query-gpu=name,driver_version,memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv > "%OUT%\nvidia-smi-after.csv"
exit /b 0
