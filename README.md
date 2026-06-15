# CitaCiudadana

Aplicacion web estatica con backend Node.js para recibir webhooks de WhatsApp Cloud API.

## Ejecutar el frontend con el backend

```bash
cd webhooks-main
copy .env.example .env
npm start
```

Despues abre:

```text
http://localhost:3000
```

El servidor tambien expone:

```text
GET  /health
GET  /webhook
POST /webhook
GET  /pago/:number
```

## Configuracion

Edita `webhooks-main/.env` con tus datos reales:

```text
VERIFY_TOKEN=test123
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
PUBLIC_BASE_URL=https://tu-url-publica.ngrok-free.app
GOV_API_BASE_URL=...
GOV_API_LOGIN_URL=...
GOV_API_USERNAME=...
GOV_API_PASSWORD=...
```

En Meta Developers configura el callback del webhook como:

```text
https://tu-url-publica.ngrok-free.app/webhook
```

El token de verificacion debe coincidir exactamente con `VERIFY_TOKEN`.
