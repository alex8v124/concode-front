@echo off
setlocal
echo =======================================================
echo   Ayudar Trazable - Generador de APK para Android
echo =======================================================
echo.
echo 1. Generar APK en la nube con EAS Build (Recomendado, no requiere Android Studio)
echo 2. Generar APK local con Gradle (Requiere tener instalado Android Studio / SDK)
echo.
set /p opt="Elige una opcion (1 o 2): "

if "%opt%"=="1" goto opt1
if "%opt%"=="2" goto opt2
goto invalid

:opt1
echo.
echo =======================================================
echo   Iniciando compilacion de instalador APK con EAS Build
echo =======================================================
echo Si aun no tienes cuenta de Expo (es 100%% gratuita),
echo ingresa tu email para crearla o acceder.
echo.
call npx eas-cli build -p android --profile preview
goto end

:opt2
echo.
echo =======================================================
echo   Iniciando compilacion local con Gradle
echo =======================================================
echo.
if not defined ANDROID_HOME (
    if not exist "%LOCALAPPDATA%\Android\Sdk" (
        echo [AVISO] No se detecto Android SDK en tu computadora.
        echo Para compilar localmente necesitas tener instalado Android Studio
        echo o definir la variable ANDROID_HOME.
        echo.
        echo Recomendacion: Usa la Opcion 1 que compila en la nube gratis.
        echo.
        pause
        goto end
    )
)
cd android
call gradlew.bat assembleRelease
echo.
echo Si la compilacion fue exitosa, tu APK estara en:
echo mobile\android\app\build\outputs\apk\release\
cd ..
goto end

:invalid
echo Opcion invalida. Por favor ingresa 1 o 2.

:end
pause
