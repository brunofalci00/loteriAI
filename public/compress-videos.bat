@echo off
REM ========================================
REM Script de Compressao de Videos - Loter.IA
REM Reduz videos de ~29MB para ~3-5MB
REM ========================================

echo.
echo ====================================
echo  COMPRESSAO DE VIDEOS - Loter.IA
echo ====================================
echo.

REM Verifica se FFmpeg esta instalado
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] FFmpeg nao encontrado!
    echo.
    echo Por favor, instale FFmpeg:
    echo 1. Baixe: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
    echo 2. Extraia para C:\ffmpeg
    echo 3. Adicione C:\ffmpeg\bin ao PATH
    echo.
    pause
    exit /b 1
)

echo [OK] FFmpeg encontrado!
echo.

REM Criar pasta para videos originais (backup)
if not exist "originals" mkdir originals

echo Iniciando compressao...
echo.

REM ========================================
REM Comprimir IMG_4762.mp4 (29MB -> ~4MB)
REM ========================================
if exist "IMG_4762.mp4" (
    echo [1/4] Comprimindo IMG_4762.mp4...
    copy /Y "IMG_4762.mp4" "originals\IMG_4762_original.mp4" >nul
    ffmpeg -i "IMG_4762.mp4" -c:v libx264 -crf 28 -preset slow -vf "scale=1280:-2" -c:a aac -b:a 128k -movflags +faststart "IMG_4762_compressed.mp4" -y
    if %ERRORLEVEL% EQU 0 (
        move /Y "IMG_4762_compressed.mp4" "IMG_4762.mp4" >nul
        echo [OK] IMG_4762.mp4 comprimido!
    )
    echo.
)

REM ========================================
REM Comprimir IMG_4783.mp4 (29MB -> ~4MB)
REM ========================================
if exist "IMG_4783.mp4" (
    echo [2/4] Comprimindo IMG_4783.mp4...
    copy /Y "IMG_4783.mp4" "originals\IMG_4783_original.mp4" >nul
    ffmpeg -i "IMG_4783.mp4" -c:v libx264 -crf 28 -preset slow -vf "scale=1280:-2" -c:a aac -b:a 128k -movflags +faststart "IMG_4783_compressed.mp4" -y
    if %ERRORLEVEL% EQU 0 (
        move /Y "IMG_4783_compressed.mp4" "IMG_4783.mp4" >nul
        echo [OK] IMG_4783.mp4 comprimido!
    )
    echo.
)

REM ========================================
REM Comprimir IMG_4791.mp4 (17MB -> ~3MB)
REM ========================================
if exist "IMG_4791.mp4" (
    echo [3/4] Comprimindo IMG_4791.mp4...
    copy /Y "IMG_4791.mp4" "originals\IMG_4791_original.mp4" >nul
    ffmpeg -i "IMG_4791.mp4" -c:v libx264 -crf 28 -preset slow -vf "scale=1280:-2" -c:a aac -b:a 128k -movflags +faststart "IMG_4791_compressed.mp4" -y
    if %ERRORLEVEL% EQU 0 (
        move /Y "IMG_4791_compressed.mp4" "IMG_4791.mp4" >nul
        echo [OK] IMG_4791.mp4 comprimido!
    )
    echo.
)

REM ========================================
REM Comprimir IMG_4792.mp4 (18MB -> ~3MB)
REM ========================================
if exist "IMG_4792.mp4" (
    echo [4/4] Comprimindo IMG_4792.mp4...
    copy /Y "IMG_4792.mp4" "originals\IMG_4792_original.mp4" >nul
    ffmpeg -i "IMG_4792.mp4" -c:v libx264 -crf 28 -preset slow -vf "scale=1280:-2" -c:a aac -b:a 128k -movflags +faststart "IMG_4792_compressed.mp4" -y
    if %ERRORLEVEL% EQU 0 (
        move /Y "IMG_4792_compressed.mp4" "IMG_4792.mp4" >nul
        echo [OK] IMG_4792.mp4 comprimido!
    )
    echo.
)

echo.
echo ====================================
echo  COMPRESSAO CONCLUIDA!
echo ====================================
echo.
echo Originais salvos em: originals\
echo.
echo Comparacao de tamanhos:
dir IMG_4762.mp4 IMG_4783.mp4 IMG_4791.mp4 IMG_4792.mp4 | findstr "mp4"
echo.
echo Reducao esperada: 75-85%%
echo Tempo de carregamento: 4min -> 30seg
echo.
pause
