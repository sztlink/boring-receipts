@echo off
setlocal enabledelayedexpansion
call "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\Common7\Tools\VsDevCmd.bat" -arch=x64 -host_arch=x64
if errorlevel 1 exit /b 10
set "PATH=C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64;C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin;%PATH%"
set "SRC=C:\Users\user\boring\kvdtype-source-build-20260523\llama.cpp"
set "BUILD=C:\Users\user\boring\kvdtype-source-build-v8-b9286-vs2019-pdlpatch-20260523\build"
set "NVCC=C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v11.8/bin/nvcc.exe"
set "RC=C:/Program Files (x86)/Windows Kits/10/bin/10.0.22621.0/x64/rc.exe"
set "MT=C:/Program Files (x86)/Windows Kits/10/bin/10.0.22621.0/x64/mt.exe"
if exist "%BUILD%" rmdir /s /q "%BUILD%"
mkdir "C:\Users\user\boring\kvdtype-source-build-v8-b9286-vs2019-pdlpatch-20260523" 2>nul
cd /d "%SRC%"
git rev-parse --short HEAD
git diff -- ggml/src/ggml-cuda/common.cuh
where rc
where mt
where cl
where nvcc
cl 2>&1 | findstr /C:"Version"
cmake -S . -B "%BUILD%" -G "NMake Makefiles" -DCMAKE_BUILD_TYPE=Release -DGGML_CUDA=ON -DLLAMA_CURL=OFF -DCMAKE_CUDA_COMPILER="%NVCC%" -DCMAKE_RC_COMPILER="%RC%" -DCMAKE_MT="%MT%" -DCMAKE_CUDA_ARCHITECTURES=86
if errorlevel 1 exit /b 20
cmake --build "%BUILD%" --config Release
if errorlevel 1 exit /b 30
exit /b 0
