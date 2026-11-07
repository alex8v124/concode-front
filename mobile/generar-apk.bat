@echo off
echo =======================================================
echo   Ayudar Trazable - Generador de APK para Android
echo =======================================================
echo.
echo 1. Generar APK en la nube con EAS Build (Recomendado, no requiere Android Studio)
echo 2. Generar APK local con Gradle (Requiere Android SDK / Android Studio)
echo.
set /p opt="Elige una opcion (1 o 2): "

if "%opt%"=="1" (
    echo.
    echo Iniciando compilacion de instalador APK con EAS Build...
    echo (Si no has iniciado sesion en Expo, te solicitara crear una cuenta gratuita)
    echo.
    npx eas-cli build -p android --profile preview
) else if "%opt%"=="2" (
    echo.
    echo Iniciando compilacion local con Gradle...
    cd android
    call gradlew.bat assembleRelease
    echo.
    echo Si la compilacion fue exitosa, tu APK estara en:
    echo mobile\android\app\build\outputs\apk\release\
    cd ..
) else (
    echo Opcion invalida.
)

pause
