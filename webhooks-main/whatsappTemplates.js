const axios = require("./httpClient");
const fs = require("fs");
const {
  whatsappGraphVersion,
  whatsappAccessToken,
  whatsappPhoneNumberId,
} = require("./config");

const graphApiVersion = whatsappGraphVersion;
const accessToken = whatsappAccessToken;
const defaultPhoneNumberId = whatsappPhoneNumberId;
let currentPhoneNumberId = defaultPhoneNumberId;

function looksLikeJwt(token) {
  if (!token) return false;
  const parts = token.split(".");
  return parts.length === 3;
}

console.log(
  `[whatsappTemplates] loaded graph=${graphApiVersion} token_source=${
    accessToken ? "env" : "missing"
  } phone_id_source=${currentPhoneNumberId ? "env" : "missing"}`
);
if (!accessToken) {
  console.warn(
    "[whatsappTemplates] warning: missing WHATSAPP_ACCESS_TOKEN in .env"
  );
}
if (looksLikeJwt(accessToken)) {
  console.error(
    "[whatsappTemplates] token format warning: token looks like JWT and is likely not a Meta Graph access token."
  );
}

function getMessagesUrl() {
  if (!currentPhoneNumberId) {
    throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID");
  }
  return `https://graph.facebook.com/${graphApiVersion}/${currentPhoneNumberId}/messages`;
}

function getHeaders() {
  if (!accessToken) {
    throw new Error("Missing WHATSAPP_ACCESS_TOKEN");
  }
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
  const clean = String(phoneNumberId || "").trim();
  if (!clean) return;
  if (clean !== currentPhoneNumberId) {
    console.log(
      `[whatsappTemplates] phone_number_id updated from ${currentPhoneNumberId || "none"} to ${clean}`
    );
  }
  currentPhoneNumberId = clean;
  validarAccesoPhoneNumber(clean);
}

async function validarAccesoPhoneNumber(phoneNumberId) {
  try {
    const response = await axios.get(`https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}`, {
      params: { fields: "id,display_phone_number" },
      headers: getHeaders(),
      timeout: 10000,
    });
    console.log(
      "[whatsappTemplates] phone access OK:",
      response.data?.id || "no-id",
      response.data?.display_phone_number || "no-display-phone"
    );
  } catch (error) {
    const status = error.response?.status;
    const details = error.response?.data || error.message;
    console.error(
      `[whatsappTemplates] phone access FAILED for phone_number_id=${phoneNumberId}:`,
      status,
      details
    );
  }
}

async function validarCredencialesMeta() {
  try {
    const response = await axios.get(`https://graph.facebook.com/${graphApiVersion}/me`, {
      headers: getHeaders(),
      timeout: 10000,
    });
    console.log("[whatsappTemplates] token check OK:", response.data?.id || "no-id");
  } catch (error) {
    const status = error.response?.status;
    const details = error.response?.data || error.message;
    console.error("[whatsappTemplates] token check FAILED:", status, details);
  }
  if (currentPhoneNumberId) {
    await validarAccesoPhoneNumber(currentPhoneNumberId);
  }
}

validarCredencialesMeta();

async function enviarPayload(payload) {
  const url = getMessagesUrl();
  try {
    const response = await axios.post(url, payload, {
      headers: getHeaders(),
      timeout: 15000,
    });
    logExitoso(url, payload, response.data);
  } catch (error) {
    logError(url, payload, error);
  }
}

async function enviarMensajeTexto(to, bodyText) {
  const payload = {
    messaging_product: "whatsapp",
    to: procesarNumero(to),
    type: "text",
    text: { body: bodyText },
  };
  await enviarPayload(payload);
}

async function enviarPayloadTemplate(to, templateName, components = []) {
  const payload = {
    messaging_product: "whatsapp",
    to: procesarNumero(to),
    type: "template",
    template: {
      name: templateName,
      language: { code: "es_MX" },
      components,
    },
  };
  await enviarPayload(payload);
}

async function enviarPlantillaWhatsApp(to) {
  const texto =
    "Bienvenido al Asistente Digital del Municipio de Cuautitlan.\n\nPara consultar su adeudo escriba la palabra: predial. Tambien puede ingresar directamente su clave catastral.";
  await enviarMensajeTexto(to, texto);
}

async function enviarPlantillaSolicitarClaveCatastral(to) {
  const texto =
    "Perfecto. Para consultar su adeudo predial, por favor envie su clave catastral.";
  await enviarMensajeTexto(to, texto);
}

async function enviarPlantillaWhatsApp2(to, templateName, templateParameters = []) {
  const texto = `Estimado contribuyente, le compartimos la siguiente informacion:\n\n${templateParameters.join("\n")}`;
  await enviarMensajeTexto(to, texto);
}

async function enviarPlantillaOrdenPago(to, orden, reference) {
  const texto = `Orden de Pago Generada (Cuautitlan)\n\nNumero de Orden: ${orden}\n\nPuede descargar su formato en el siguiente enlace:\n${reference}`;
  await enviarMensajeTexto(to, texto);
}

async function enviarPlantillaConsultaPredial(to, parameters) {
  const texto = `Resultado de Consulta Predial\n\nClave Catastral: ${parameters[0]}\nUltimo Periodo Pagado: ${parameters[1]}\nNombre: ${parameters[2]}\nDireccion: ${parameters[3]}\nLocalidad: ${parameters[4]}`;
  await enviarMensajeTexto(to, texto);
}

async function enviarPlantillaErrorGenerico(to, errorMessage) {
  const texto = `Lo sentimos, ocurrio un error en el sistema: ${errorMessage}. Por favor intente mas tarde.`;
  await enviarMensajeTexto(to, texto);
}

async function enviarPlantillaImagenTlaquepaque(to) {
  const texto = "Calculando su predial para el municipio de Cuautitlan. Por favor espere un momento...";
  await enviarMensajeTexto(to, texto);
}

async function enviarPlantillaPago(to, orden, amount, reference) {
  const texto = `Detalle de Pago\n\nOrden: ${orden}\nMonto: $${amount}\nEnlace de pago: ${reference}`;
  await enviarMensajeTexto(to, texto);
}

function logExitoso(url, payload, responseData) {
  const logMessage = `${new Date().toISOString()} - URL: ${url}\nEnviado: ${JSON.stringify(
    payload
  )}\nRespuesta: ${JSON.stringify(responseData)}\n`;
  fs.appendFileSync("template_log.txt", logMessage);
  console.log("Mensaje enviado exitosamente:", responseData);
}

function logError(url, payload, error) {
  const status = error.response?.status;
  const errorData = error.response?.data || error.message;
  const graphCode = error.response?.data?.error?.code;
  const graphSubcode = error.response?.data?.error?.error_subcode;
  const logMessage = `${new Date().toISOString()} - URL: ${url}\nError enviando: ${JSON.stringify(
    payload
  )}\nStatus: ${status || "n/a"}\nGraphCode: ${graphCode || "n/a"}\nGraphSubcode: ${
    graphSubcode || "n/a"
  }\nError: ${JSON.stringify(errorData)}\n`;
  fs.appendFileSync("template_log.txt", logMessage);
  console.error("Error enviando mensaje:", errorData);
}

module.exports = {
  setPhoneNumberId,
  enviarPlantillaWhatsApp,
  enviarPlantillaSolicitarClaveCatastral,
  enviarPlantillaWhatsApp2,
  enviarPlantillaOrdenPago,
  enviarPlantillaConsultaPredial,
  enviarPlantillaErrorGenerico,
  enviarPlantillaImagenTlaquepaque,
  enviarPlantillaPago,
};
