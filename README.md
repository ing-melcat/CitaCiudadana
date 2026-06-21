# 🏥 CitaCiudadana Beta Oficial

CitaCiudadana es una aplicación diseñada para facilitar la agenda de citas médicas en sistemas de salud pública, eliminando filas y tiempos de espera mediante Inteligencia Artificial.

## 🛠️ Stack Tecnológico
* **Frontend:** React 19 + TypeScript + Vite
* **UI/UX:** Vanilla CSS, Framer Motion (animaciones fluidas, glassmorphism)
* **Empaquetado Móvil:** Ionic Capacitor v8
* **Backend:** Firebase (Google Auth + Firestore)

## 🚀 Estado Actual del Proyecto (Lo que llevamos hasta ahora)
La aplicación ha pasado por una intensa fase de "pulido" y refactorización. Aquí está el resumen exacto de dónde nos quedamos para que puedas retomar el proyecto sin perder el hilo:

### 1. Motor Heurístico Inteligente (Completado)
* **Ubicación:** `src/hooks/useHeuristics.ts`
* Ya no está harcodeado en el `MainApp.tsx`. Ahora es un *Custom Hook* que procesa los síntomas del paciente usando Expresiones Regulares (RegEx) para detectar palabras clave y asignar un peso.
* Soporta **10 especialidades médicas** (Cardiología, Dermatología, Odontología, Psicología, etc.).

### 2. Pantalla de Agendar Cita (ScheduleScreen) (Completado)
* **Ubicación:** `src/components/screens/ScheduleScreen.tsx`
* **Calendario Dinámico:** Calcula automáticamente los días y meses (ya no está fijo en "Octubre 2025"). Puedes viajar al futuro y al pasado.
* **Bloques de Hora:** Los pacientes ahora pueden elegir un bloque de hora exacto (ej. 08:00 AM, 03:00 PM) junto con el día.
* **Animaciones Premium:** Todo el calendario cuenta con efectos *bounce* y feedback visual impulsado por `framer-motion`.

### 3. Reprogramación de Citas en Firestore (Completado)
* **Ubicación:** `saveAppointment` dentro de `MainApp.tsx`
* En lugar de borrar y crear nuevas citas, agregamos la capacidad de editar la fecha/hora conservando la información anterior del paciente. Esto se logra enviando el comando `{ merge: true }` a Firebase usando un `editingApptId`.

### 4. Modularización Segura
* Empezamos a partir el archivo gigantesco `MainApp.tsx` en componentes más pequeños dentro de la carpeta `src/components/screens/`.
* Ya están extraídas: `IntroScreens`, `TermsScreen`, `PrivacyScreen`, `SupportScreen` y `ScheduleScreen`.
* **Regla de Oro:** Al extraer componentes, **jamás** rompemos el diseño CSS o las clases existentes.

### 5. Accesibilidad (a11y) y Seguridad (Completado)
* La aplicación ya cuenta con atributos `aria-label`, `role` y `tabIndex` para usuarios con debilidad visual en Android.
* Eliminamos los tokens expuestos en código plano (ahora usa Variables de Entorno `.env`).

---

## 📝 Próximos Pasos (Para cuando llegues a la Uni)
Cuando retomes el proyecto desde otra terminal, aquí tienes la ruta sugerida de lo que falta por pulir:

1. **Continuar Modularizando:** Falta extraer las pantallas de Autenticación (Login, Registro, Recuperar Contraseña) y las pantallas del Dashboard (Menú lateral, Chat de emergencias).
2. **Contexto Global (React Context / Zustand):** Para terminar la modularización, habrá que sacar los estados (`useState` como el `darkMode`, `language`, `profileData`) de `MainApp.tsx` hacia un `AppContext` para evitar pasar tantas *props* a los componentes.
3. **Conectar ChatGPT/n8n al Chat de Emergencias:** La pantalla 12 (`screen12`) tiene la interfaz de chat lista, falta inyectarle la API de OpenAI.

---

## 💻 Comandos Útiles
* **Levantar servidor local:** `npm run dev`
* **Compilar APK de prueba:** 
  ```bash
  npm run build
  npx cap sync android
  cd android && ./gradlew assembleDebug
  ```

> **Nota para IAs:** Revisa el archivo `.agents/AGENTS.md` para las directrices estrictas de este entorno de desarrollo.
