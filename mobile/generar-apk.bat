@echo off
setlocal
echo =======================================================
echo   Ayudar Trazable - Generador de APK para Android
echo =======================================================
echo.
echo 1. Iniciar sesion con tu NAVEGADOR (Recomendado - 1 clic si usaste Google/GitHub)
echo 2. Generar el APK en la nube con EAS Build
echo 3. Iniciar sesion con Access Token de Expo (Alternativa rapida)
echo.
set /p opt="Elige una opcion (1, 2 o 3): "

if "%opt%"=="1" goto opt1
if "%opt%"=="2" goto opt2
if "%opt%"=="3" goto opt3
goto invalid

:opt1
echo.
echo =======================================================
echo   Abriendo navegador para autorizar sesion en Expo...
echo =======================================================
echo Como ya tienes tu sesion abierta en Chrome, solo dale a "Authorize/Log in".
echo.
call npx eas-cli login
echo.
echo Ahora que iniciaste sesion, vuelve a ejecutar este script y elige la Opcion 2.
goto end

:opt2
echo.
echo =======================================================
echo   Iniciando compilacion de instalador APK con EAS Build
echo =======================================================
echo.
call npx eas-cli build -p android --profile preview
goto end

:opt3
echo.
echo =======================================================
echo   Iniciar sesion con Access Token
echo =======================================================
echo Ve a: https://expo.dev/accounts/nt_alex8v/settings/access-tokens
echo Genera un token, copialo y pegalo aqui abajo.
echo.
set /p token="Pega tu token de Expo: "
set EXPO_TOKEN=%token%
echo Token configurado temporalmente. Iniciando compilacion...
call npx eas-cli build -p android --profile preview
goto end

:invalid
echo Opcion invalida. Por favor ingresa 1, 2 o 3.

:end
pause
