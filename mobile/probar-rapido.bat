@echo off
setlocal enabledelayedexpansion
title DeBarrio - Modo Desarrollo Instantaneo (USB / Expo Go)

set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools"

echo =======================================================
echo   DeBarrio - Prueba Instantanea por USB / Expo Go
echo =======================================================
echo.
echo [1/2] Verificando celular conectado por cable USB (adb)...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" devices
echo.
echo IMPORTANTE:
echo  - Si tu celular aparece en la lista como "device", cuando cargue
echo    el menu de abajo solo presiona la tecla "a" para abrir la app
echo    directamente por el cable USB.
echo  - Si dice "unauthorized", mira la pantalla de tu celular y acepta
echo    el cartel "Permitir depuracion por USB".
echo  - Si la lista sale vacia, activa "Depuracion por USB" en Opciones
echo    de desarrollador de tu celular (y elige modo "Transferencia de archivos").
echo.
echo [2/2] Iniciando servidor de recarga instantanea (0 min de espera)...
echo.
call npx expo start
pause
