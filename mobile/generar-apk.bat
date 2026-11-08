@echo off
setlocal enabledelayedexpansion
title VECI - Generador de APK Android (EAS Build)

:menu
cls
echo =======================================================
echo     VECI (Ayudar Trazable) - Generador de APK Android
echo =======================================================
echo.
echo  [1] Iniciar sesion con tu NAVEGADOR (Recomendado para PCs nuevas)
echo  [2] Generar / Compilar instalador APK en la nube
echo  [3] Iniciar sesion con Access Token de Expo
echo  [4] Ver usuario actual conectado (whoami)
echo  [5] Consultar estado y descarga del ultimo APK
echo  [6] Abrir panel de compilaciones en el navegador
echo  [7] Salir
echo.
set /p opt="Elige una opcion (1-7): "

if "%opt%"=="1" goto opt1
if "%opt%"=="2" goto opt2
if "%opt%"=="3" goto opt3
if "%opt%"=="4" goto opt4
if "%opt%"=="5" goto opt5
if "%opt%"=="6" goto opt6
if "%opt%"=="7" goto salir
goto invalid

:opt1
echo.
echo =======================================================
echo   Iniciando sesion con el navegador...
echo =======================================================
echo Se abrira una pestana en tu navegador para autorizar con
echo Google, GitHub o correo con 1 solo clic.
echo.
call npx eas-cli login -b
echo.
pause
goto menu

:opt2
echo.
echo =======================================================
echo   Iniciando compilacion de instalador APK con EAS Build
echo =======================================================
echo.
call npx eas-cli build -p android --profile preview
echo.
pause
goto menu

:opt3
echo.
echo =======================================================
echo   Iniciar sesion mediante Access Token de Expo
echo =======================================================
echo Puedes generar un token gratis en:
echo https://expo.dev/accounts/nt_alex8v/settings/access-tokens
echo.
set /p token="Pega tu token de Expo: "
if not "!token!"=="" (
    set EXPO_TOKEN=!token!
    echo Token configurado exitosamente para esta sesion.
) else (
    echo No ingresaste ningun token.
)
echo.
pause
goto menu

:opt4
echo.
echo =======================================================
echo   Usuario conectado actualmente en Expo:
echo =======================================================
call npx eas-cli whoami
echo.
pause
goto menu

:opt5
echo.
echo =======================================================
echo   Ultimas compilaciones y enlaces de descarga:
echo =======================================================
call npx eas-cli build:list --limit 3
echo.
pause
goto menu

:opt6
echo.
echo Abriendo el panel de Expo en tu navegador...
start https://expo.dev/accounts/nt_alex8v/projects/ayudar-trazable/builds
goto menu

:invalid
echo.
echo Opcion invalida. Por favor ingresa un numero del 1 al 7.
echo.
pause
goto menu

:salir
echo Saliendo...
exit /b 0
