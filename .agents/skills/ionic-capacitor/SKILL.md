---
name: Ionic and Capacitor App Development
description: Specialized instructions and best practices for scaffolding and developing cross-platform mobile applications using Ionic Framework and Capacitor.
---

# Ionic and Capacitor App Development Skill

When the user asks you to build, scaffold, or modify an app using Ionic and Capacitor, adhere strictly to the following workflow and guidelines:

## Core Principles
1. **Framework Choice:** Default to **Ionic with React** and **TypeScript** unless the user specifies otherwise. It provides a robust, highly-supported ecosystem.
2. **UI/UX Aesthetics:** Always utilize Ionic's pre-built UI components (`IonCard`, `IonButton`, `IonHeader`, `IonContent`, etc.) to ensure a native-like look and feel. Ensure rich, modern aesthetics. Override default variables in `variables.css` to give the app a premium, custom feel.
3. **Capacitor for Native:** Use official `@capacitor/*` plugins (e.g., `@capacitor/camera`, `@capacitor/geolocation`, `@capacitor/preferences`) for native hardware interactions.

## Scaffold Workflow
When creating a new Ionic/Capacitor project, execute the following steps via terminal:
1. Scaffold the project non-interactively: `npx -y @ionic/cli start AppName blank --type=react --capacitor`
2. Navigate into the folder: `cd AppName`
3. Install required native plugins if the user asked for features (e.g. `npm install @capacitor/camera`).
4. Initialize and sync Capacitor: `npx cap sync`

## Architecture & Styles
* `src/pages/`: Keep main screen views here.
* `src/components/`: Extract smaller, reusable UI elements here.
* `src/theme/variables.css`: Use this to define modern color palettes (e.g., sleek dark modes, vibrant primary colors, Google Fonts).

## Execution Reminders
- Never deliver an app that looks basic. It must have a "WOW" factor.
- For running the app locally in web mode, use `npm run dev` or `npm start`.
- Building Android/iOS binaries requires explicit user instruction, focus first on web-view perfection.
