@echo off
setlocal
echo =======================================================
echo   Ayudar Trazable - Generador de APK para Android
echo =======================================================
echo.
echo 1. Generar / Recompilar APK en la nube con EAS Build
echo 2. Ver estado de la compilacion actual
echo 3. Abrir panel de Expo en el navegador
echo.
set /p opt="Elige una opcion (1, 2 o 3): "

if "%opt%"=="1" goto opt1
if "%opt%"=="2" goto opt2
if "%opt%"=="3" goto opt3
goto invalid

:opt1
echo.
echo =======================================================
echo   Iniciando compilacion de instalador APK con EAS Build
echo =======================================================
echo.
call npx eas-cli build -p android --profile preview
goto end

:opt2
echo.
echo =======================================================
echo   Consultando estado del APK...
echo =======================================================
echo.
call npx eas-cli build:list --limit 1
goto end

:opt3
echo.
echo Abriendo el panel de Expo...
start https://expo.dev/accounts/nt_alex8v/projects/ayudar-trazable/builds
goto end

:invalid
echo Opcion invalida. Por favor ingresa 1, 2 o 3.

:end
pause
