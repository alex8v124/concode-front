# Regla de Compilación de Builds / APKs

NUNCA ejecutar comandos de compilación en la nube (como `eas build`, `npx eas-cli build`, etc.) de forma automática.
SIEMPRE se debe consultar y pedir confirmación explícita al usuario antes de lanzar la generación de cualquier archivo APK o build en la nube, para evitar agotar la cuota mensual de intentos del plan de Expo.
