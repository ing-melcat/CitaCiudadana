<div align="center">
  <img src="https://raw.githubusercontent.com/Leyito-Reyes/CitaCiudadana_Completo/main/App/CitaCiudadana/public/favicon.png" alt="CitaCiudadana Logo" width="120" />
  <h1>Cita Ciudadana</h1>
  <p><strong>Plataforma integral para agendamiento de citas médicas e interacción ciudadana.</strong></p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white" alt="Ionic" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp API" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</div>

<br />

## 📖 Descripción del Proyecto

**Cita Ciudadana** es una solución tecnológica moderna que facilita el proceso de agendamiento de citas médicas. El ecosistema está compuesto por dos pilares fundamentales:
1. **Aplicación Móvil (Frontend):** Desarrollada con Ionic, React y Capacitor. Ofrece una interfaz moderna, fluida y con micro-interacciones diseñadas para una experiencia de usuario (UX) premium.
2. **Bot de WhatsApp (Backend):** Servidor Node.js integrado con la Cloud API de Meta, que permite a los usuarios agendar citas directamente desde un chat de WhatsApp de forma automatizada.

---

## ✨ Características Principales

### 📱 Frontend (App)
- **UI/UX Moderna:** Interfaz minimalista y modular con animaciones fluidas (Slide Up Fade, escalado en botones) y unificación tipográfica.
- **Geolocalización:** Integración de mapas interactivos embebidos para visualizar hospitales/clínicas cercanos, junto con accesos directos a la navegación (Google Maps).
- **Gestión de Citas:** Módulo completo para explorar especialistas, ver disponibilidad y programar citas.
- **Autenticación:** Soporte para inicio de sesión seguro, incluyendo Google Auth.

### 🤖 Backend (Bot de WhatsApp)
- **Automatización de Mensajería:** Recepción y envío de mensajes automatizados utilizando plantillas de WhatsApp.
- **Webhooks Seguros:** Verificación de tokens y seguridad robusta para la comunicación bidireccional con Meta.

---

## 🏗️ Arquitectura del Repositorio

El proyecto se divide en dos directorios principales:

```text
CitaCiudadana_Completo/
├── App/CitaCiudadana/     # Código fuente de la App Móvil (Ionic/React)
└── webhooks-main/         # Código fuente del Backend y Bot de WhatsApp (Node.js)
```

---

## 🚀 Guía de Instalación y Uso

### 1. Requisitos Previos
- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) o yarn
- Cuenta de [Ngrok](https://ngrok.com/) o [Localtunnel](https://theboroer.github.io/localtunnel-www/)
- Cuenta en [Meta for Developers](https://developers.facebook.com/) con la API de WhatsApp Cloud configurada.

---

### 2. Configurar y Activar el Bot de WhatsApp (Backend)

El bot necesita ejecutarse localmente y exponerse a internet para que Meta pueda enviar los eventos (webhooks).

#### Paso 1: Iniciar el servidor local
```bash
cd webhooks-main
# Copia el archivo de ejemplo para configurar tus variables de entorno
cp .env.example .env

# Instala las dependencias y levanta el servidor
npm install
node webhook.js
```
El servidor Node.js comenzará a escuchar en el puerto **3000**.

#### Paso 2: Exponer el puerto al exterior
Abre una nueva terminal e inicia Ngrok utilizando tu dominio reservado:
```bash
ngrok http --url=tu-dominio.ngrok-free.dev 3000
```
*(Si prefieres usar localtunnel, ejecuta: `lt --port 3000 --subdomain tu-subdominio`)*

#### Paso 3: Configurar Meta Developers
1. Dirígete a tu panel de **Meta for Developers** > Configuración de WhatsApp > Configuración.
2. En la sección **Webhook**, haz clic en *Editar*.
3. En **URL de devolución de llamada**, ingresa la URL de tu túnel seguida de `/webhook` (Ej. `https://tu-dominio.ngrok-free.dev/webhook`).
4. En **Token de verificación**, ingresa el mismo valor que configuraste en tu variable `VERIFY_TOKEN` dentro del archivo `.env`.
5. Haz clic en Verificar y guardar.

> ⚠️ **Nota:** Si detienes Ngrok o reinicias tu equipo, deberás volver a ejecutar los pasos 1 y 2 para que el bot siga recibiendo mensajes.

---

### 3. Ejecutar la App Móvil (Frontend)

Para correr la aplicación web localmente en modo desarrollo:

```bash
cd App/CitaCiudadana
npm install
npm run dev
```

#### Compilación de APK (Android)
Si deseas compilar la aplicación para dispositivos Android:

```bash
# Construir los assets para producción
npm run build

# Sincronizar con el proyecto de Capacitor
npx cap sync android

# Generar el APK en modo Debug
cd android
./gradlew assembleDebug
```
El APK generado estará disponible en la ruta:
`App/CitaCiudadana/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🤝 Contribuciones

Las solicitudes de extracción (Pull Requests) son bienvenidas. Para cambios importantes, abre un "Issue" primero para discutir qué te gustaría cambiar.

Asegúrate de actualizar las pruebas según corresponda.
