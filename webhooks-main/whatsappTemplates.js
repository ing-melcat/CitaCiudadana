const axios = require("./httpClient");
const fs = require("fs");
const { whatsappGraphVersion, whatsappAccessToken, whatsappPhoneNumberId } = require("./config");

const graphApiVersion = whatsappGraphVersion;
const accessToken = whatsappAccessToken;
let currentPhoneNumberId = whatsappPhoneNumberId;

function getHeaders() {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

function procesarNumero(to) {
  if (!to) throw new Error("Numero de destinatario no valido");
  return to.startsWith("521") ? to.replace(/^521/, "52") : to;
}

function setPhoneNumberId(phoneNumberId) {
  if (phoneNumberId) {
    currentPhoneNumberId = String(phoneNumberId).trim();
  }
}

async function enviarPayload(payload) {
  const url = `https://graph.facebook.com/${graphApiVersion}/${currentPhoneNumberId}/messages`;
  try {
    const response = await axios.post(url, payload, { headers: getHeaders(), timeout: 15000 });
    console.log("Mensaje interactivo enviado:", response.data);
  } catch (error) {
    console.error("Error enviando mensaje:", error.response?.data || error.message);
  }
}

async function enviarTexto(to, text) {
  await enviarPayload({
    messaging_product: "whatsapp",
    to: procesarNumero(to),
    type: "text",
    text: { body: text },
  });
}

async function enviarMenuPrincipal(to) {
  await enviarPayload({
    messaging_product: "whatsapp",
    to: procesarNumero(to),
    type: "interactive",
    interactive: {
      type: "button",
      header: { type: "text", text: "✨ CitaCiudadana Premium" },
      body: { text: "Bienvenido a su portal ciudadano inteligente.\n\n¿En qué podemos ayudarle el día de hoy?" },
      footer: { text: "Seleccione una opción rápida 👇" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "menu_citas", title: "📅 Agendar Cita" } },
          { type: "reply", reply: { id: "menu_ia", title: "🤖 Asesor IA" } },
          { type: "reply", reply: { id: "menu_tramites", title: "🏛 Trámites" } }
        ]
      }
    }
  });
}

async function enviarMenuEspecialidades(to) {
  await enviarPayload({
    messaging_product: "whatsapp",
    to: procesarNumero(to),
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "🩺 Especialidades" },
      body: { text: "Contamos con los mejores especialistas de la salud. Por favor, seleccione el área de su interés:" },
      footer: { text: "CitaCiudadana - Salud" },
      action: {
        button: "Ver Especialidades",
        sections: [
          {
            title: "Médicas Generales",
            rows: [
              { id: "cita_medgeneral", title: "Medicina General", description: "Atención primaria" },
              { id: "cita_pediatria", title: "Pediatría", description: "Salud infantil" }
            ]
          },
          {
            title: "Especialidades",
            rows: [
              { id: "cita_cardio", title: "Cardiología", description: "Salud del corazón" },
              { id: "cita_derma", title: "Dermatología", description: "Cuidado de la piel" }
            ]
          }
        ]
      }
    }
  });
}

async function enviarTramites(to) {
  await enviarPayload({
    messaging_product: "whatsapp",
    to: procesarNumero(to),
    type: "interactive",
    interactive: {
      type: "button",
      header: { type: "text", text: "🏛 Trámites de Gobierno" },
      body: { text: "Gestiona tus pagos y contribuciones desde la comodidad de tu WhatsApp." },
      action: {
        buttons: [
          { type: "reply", reply: { id: "tramite_predial", title: "🏠 Consulta Predial" } },
          { type: "reply", reply: { id: "tramite_agua", title: "💧 Pago de Agua" } },
          { type: "reply", reply: { id: "menu_inicio", title: "⬅️ Volver" } }
        ]
      }
    }
  });
}

async function enviarConfirmacionCita(to, especialidad) {
  await enviarPayload({
    messaging_product: "whatsapp",
    to: procesarNumero(to),
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `Excelente. Hemos pre-registrado tu cita para *${especialidad}*.\n\n¿Deseas confirmar este horario para el día de mañana a las 10:00 AM?` },
      action: {
        buttons: [
          { type: "reply", reply: { id: "cita_confirmar", title: "✅ Confirmar" } },
          { type: "reply", reply: { id: "cita_cancelar", title: "❌ Cancelar" } }
        ]
      }
    }
  });
}

module.exports = {
  setPhoneNumberId,
  enviarTexto,
  enviarMenuPrincipal,
  enviarMenuEspecialidades,
  enviarTramites,
  enviarConfirmacionCita
};
