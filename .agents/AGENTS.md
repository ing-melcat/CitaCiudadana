# 🏥 Proyecto: CitaCiudadana (Beta Oficial)

## 📌 Contexto General
**CitaCiudadana** es una aplicación móvil (construida con tecnologías web) diseñada para facilitar la agenda de citas médicas en sistemas de salud pública, eliminando filas y tiempos de espera inciertos. Integra inteligencia artificial para hacer pre-diagnósticos basados en síntomas.

## 🛠️ Stack Tecnológico
- **Frontend:** React 19 + TypeScript + Vite.
- **Móvil/Empaquetado:** Ionic Capacitor v8.
- **Backend/Autenticación:** Firebase (Auth con Google `signInWithCredential` y Firestore para base de datos).
- **Estilos:** Vanilla CSS con alta prioridad en el diseño UI/UX (Glassmorphism, sombras, animaciones suaves).
- **Entorno de Desarrollo:** Termux (Android).

## 🏗️ Arquitectura y Estado Actual
La aplicación comenzó como un monolito en `src/pages/MainApp.tsx` que usaba renderizado condicional basado en una variable de estado (`screen === 1`, `screen === 2`, etc.).
Actualmente estamos en un **proceso de refactorización incremental (Reactor Doctor)**, con las siguientes reglas estrictas:
1. **Modularización Segura:** Todo código extraído de `MainApp.tsx` debe ir a `src/components/screens/` pasándole las *props* necesarias. NUNCA se debe romper la UI o las animaciones existentes al hacer esto.
2. **Componentes Extraídos hasta ahora:** `IntroScreens`, `TermsScreen`, `PrivacyScreen`, `SupportScreen`.
3. **Motor Heurístico:** La lógica de diagnóstico de la IA fue abstraída al hook personalizado `src/hooks/useHeuristics.ts`. Este motor soporta 10 especialidades médicas usando RegEx para evitar falsos positivos y ponderación por palabras clave.

## 🚀 Hitos Importantes Logrados (No revertir)
- **Seguridad:** Los tokens de Webhooks (ej. n8n o APIs de IA) ya NO están harcodeados. Siempre usar `import.meta.env.VITE_WEBHOOK_TOKEN`.
- **Accesibilidad (a11y):** Los botones principales y tarjetas customizadas usan etiquetas `aria-label`, `role="button"` y `tabIndex={0}`. Se debe mantener este estándar en futuros componentes.
- **Reprogramación de Citas:** Al editar una cita existente (usando `editingApptId`), se utiliza `setDoc(docRef, data, { merge: true })` en Firestore para evitar duplicar documentos.

## ⚠️ Reglas de Interacción para el Agente (IA)
- **Cuidado con Dependencias:** Existen conflictos de dependencias entre `@capacitor/core` (v8) y `@codetrix-studio/capacitor-google-auth` (v6). Evita correr `npm install` global o modificar el `package.json` sin avisar, porque rompe el entorno.
- **UI de Alta Calidad:** El usuario ("ing-melcat") tiene un estándar extremadamente alto de diseño visual. Cualquier refactorización lógica NO debe alterar nombres de clases CSS, iconos SVG ni animaciones.
- **Testing Rápido:** Si necesitas proveer el archivo compilado para el dispositivo local (Termux), siempre copialo a `/storage/emulated/0/Download/` para que el usuario pueda instalar el APK directamente.
