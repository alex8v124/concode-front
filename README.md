# concode-front

# Ayudar Trazable - Red Vecinal Conectada y Segura 🏘️🇵🇪

> **"Tu barrio, conectado. Una red de vecinos reales, a pocas cuadras de tu casa."**  
> Aplicación comunal vecinal con verificación de identidad civil (DNI / RENIEC), geolocalización por cuadrantes protegidos (PostGIS) y alertas de emergencia en tiempo real (WSS / FCM).

---

## 📱 Flujo de Pantallas de la Comuna Vecinal (Figma 1 al 8)

El diseño visual ha sido construido para ser **simple, accesible y entendible para cualquier vecino o vecina**, con tipografía clara de alto contraste, botones táctiles grandes y explicaciones tranquilizadoras:

1. **1 · Bienvenida (`WelcomeScreen`)**
   - Presentación amigable con distintivo: *"Comunidad cerrada, verificada con DNI"*.
   - Botón primario *"Iniciar sesión"* (Verde bosque) y secundario *"Registrarse"*.
2. **2 · Iniciar sesión (`LoginScreen`)**
   - Marco de escaneo biométrico con esquinas amarillas.
   - Campo para celular peruano (9 dígitos) con texto: *"Te enviaremos un código de 4 dígitos por mensaje de texto."*
3. **3 · Registro: Tus datos - Paso 1 de 3 (`RegisterStep1Screen`)**
   - Lector de DNI dentro del recuadro.
   - Campos de Nombre, Apellido, Edad, Sexo y Nro. de DNI (con soporte de autollenado por OCR).
   - Botón *"📍 Activar mapa"* y botón *"Registrar"* condicional con aviso: *"Se habilita al guardar tu domicilio en el mapa"*.
4. **4 · Tu domicilio: Ubica tu casa - Paso 2 de 3 (`DomicilioMapScreen`)**
   - Plano interactivo del cuadrante con pin arrastrable verde.
   - Mensaje de privacidad vecinal: *"Solo vecinos verificados de tu cuadrante verán tu zona."*
   - Asignación de dirección y botón *"Guardar domicilio"*.
5. **5 · Confirma tus datos - Paso 3 de 3 (`RegisterStep3ConfirmScreen`)**
   - Estado exitoso *"✓ DNI leído correctamente"*.
   - Insignias *"Autollenado"* en los datos civiles (Ana María Quispe Ramos, 34 años, Femenino, DNI).
   - Botón *"📍 Domicilio guardado"* y botón principal *"Registrar"* destacado en amarillo vibrante.
6. **6 · Verificación OTP (`OtpVerificationScreen`)**
   - 4 casillas de dígitos grandes con avance automático.
   - Temporizador de reenvío: *"Reenviar código en 0:30"*.
   - Notificación de SMS simulado (*1234*) para pruebas instantáneas.
7. **7 · No pudimos leer tu DNI (`OcrErrorScreen`)**
   - Círculo de aviso suave durazno con 3 consejos claros:
     - 💡 *Busca buena luz y evita reflejos*
     - 📄 *Coloca el DNI plano y completo*
     - 📷 *Limpia el lente de la cámara*
   - Acciones: *"Intentar de nuevo"* e *"Ingresar mis datos a mano"*.
8. **8 · ¡Bienvenida al barrio! (`WelcomeSuccessScreen`)**
   - Insignia verde con check de victoria y explosión de confeti.
   - Mensaje: *"Tu identidad y tu domicilio están verificados. Ya eres parte de tu comunidad."*
   - Distintivo: *"🛡️ Vecina verificada"*.
   - Botón: *"Entrar a mi barrio"*.
9. **★ · El Barrio en Vivo (`BarrioHomeScreen`)**
   - Panel vecinal activo: Botón de Pánico / SOS Vecinal, cuadrante activo, red de vecinos protegidos y alertas ciudadanas en tiempo real.

---

## 🏛️ Arquitectura Tecnológica

Corresponde a la especificación técnica de **Ayudar Trazable**:

```
+-----------------------------------------------------------------------------------+
|  CLIENTE (Android APK & Web Preview)                                              |
|  - React Native (Expo) / React + TypeScript                                       |
|  - ML Kit (OCR para DNI peruano)                                                  |
|  - expo-location & Leaflet (Mapas y cuadrantes)                                   |
|  - SQLite / MMKV (Almacenamiento local seguro)                                    |
+-----------------------------------------------------------------------------------+
             │ (HTTPS / REST)                   ▲ (WSS / WebSockets)
             ▼                                  │
+-----------------------------------------------------------------------------------+
|  BACKEND (Servicios Core en Cloud Container)                                      |
|  - Node.js / Express / NestJS Modular                                             |
|  - Auth Service (Verificación RENIEC + Twilio OTP 4 dígitos)                      |
|  - Geo Service (Geocodificación y cálculo de cuadrantes)                          |
|  - Emergencias Service (Broadcast WebSocket en tiempo real)                       |
+-----------------------------------------------------------------------------------+
             │                                  ▲
             ▼                                  │
+-----------------------------------------------------------------------------------+
|  BASE DE DATOS (Supabase)                                                         |
|  - PostgreSQL 15 + PostGIS (ST_Contains, ST_SetSRID, ST_MakePoint)                |
|  - Row Level Security (RLS) para privacidad de cuadrantes vecinales               |
|  - Realtime & Storage                                                             |
+-----------------------------------------------------------------------------------+
             │
             ▼
+-----------------------------------------------------------------------------------+
|  SERVICIOS EXTERNOS CONECTADOS                                                    |
|  - RENIEC (Validación de identidad civil peruana)                                 |
|  - Twilio (OTP SMS de 4 dígitos y WhatsApp)                                       |
|  - Google Maps / Carto (Cartografía de cuadrantes)                                |
|  - FCM (Notificaciones Push para botón de pánico)                                 |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Probar el Prototipo Interactivo en el Navegador (Recomendado)
Para experimentar las 8 pantallas de forma interactiva con el marco de celular:

```bash
cd client
npm run dev
```
Abre en tu navegador `http://localhost:5173` para navegar pantalla por pantalla, simular escaneo con la cámara o con datos de prueba, arrastrar el pin en el mapa y verificar con SMS.

### 2. Ejecutar el Servidor Backend
```bash
cd server
npm run dev
```
El servidor arrancará en `http://localhost:3001` con endpoints para `/api/auth/ocr-scan`, `/api/auth/send-otp`, `/api/geo/resolve-pin` y el WebSocket de alertas.

### 3. Código Nativo Móvil y Generación de APK (Android)
El código de la aplicación nativa React Native con Expo se encuentra en la carpeta `/mobile`.

#### 📲 Descargar el Instalador APK Directo:
Puedes instalar la aplicación de inmediato en cualquier celular Android:
- **[Descargar instalador APK (.apk)](https://expo.dev/artifacts/eas/7yJY8VhtmJk4bsajSLc5KJem8QYvRaKK-MmMdowskas.apk)**
- **[Escanear código QR en Expo Dashboard](https://expo.dev/accounts/nt_alex8v/projects/ayudar-trazable/builds/82a88b0c-b40e-4078-8f33-bfb9643382cb)**

#### 🛠️ Cómo compilar el APK desde cualquier PC:
En la raíz del proyecto (o dentro de `/mobile`) simplemente ejecuta:
```cmd
generar-apk.bat
```
El menú interactivo te ofrece:
1. **`[1] Iniciar sesión con tu NAVEGADOR`**: Abre tu navegador para iniciar sesión con Google/GitHub o correo en 1 solo clic (ideal para PCs nuevas).
2. **`[2] Generar / Compilar instalador APK en la nube`**: Compila el instalador `.apk` en los servidores de EAS sin necesidad de instalar Android Studio ni configurar variables de entorno.
3. **`[3] Iniciar sesión con Access Token de Expo`**: Si prefieres usar un token (`EXPO_TOKEN`).
4. **`[4] Ver usuario actual (whoami)`** / **`[5] Descargar último APK compilado`**.

### 4. Base de Datos Supabase (PostgreSQL + PostGIS)
- El esquema completo con tablas, índices espaciales, triggers y políticas RLS está en:  
  `database/schema.sql`
- Los datos semilla de cuadrantes y vecinos de Lima en:  
  `database/seed.sql`
