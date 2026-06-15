const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");

function loadLocalEnv() {
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith("#")) return;

    const separatorIndex = cleanLine.indexOf("=");
    if (separatorIndex === -1) return;

    const key = cleanLine.slice(0, separatorIndex).trim();
    let value = cleanLine.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

loadLocalEnv();

function env(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
}

function joinUrl(base, pathName) {
  const cleanBase = String(base || "").replace(/\/+$/, "");
  const cleanPath = String(pathName || "").replace(/^\/+/, "");
  if (!cleanBase) return "";
  return `${cleanBase}/${cleanPath}`;
}

const govApiBaseUrl = env("GOV_API_BASE_URL");

module.exports = {
  port: Number(env("PORT")) || 3000,
  publicBaseUrl: env("PUBLIC_BASE_URL"),
  verifyToken: env("VERIFY_TOKEN") || "test123",
  whatsappGraphVersion: env("WHATSAPP_GRAPH_VERSION") || "v21.0",
  whatsappAccessToken: env("WHATSAPP_ACCESS_TOKEN", "WHATSAPP_TOKEN"),
  whatsappPhoneNumberId: env("WHATSAPP_PHONE_NUMBER_ID", "PHONE_NUMBER_ID"),
  govApiBaseUrl,
  govApiLoginUrl: env("GOV_API_LOGIN_URL"),
  govApiUsername: env("GOV_API_USERNAME"),
  govApiPassword: env("GOV_API_PASSWORD"),
  govApiAuthToken: env("GOV_API_AUTH_TOKEN"),
  govApiPadronUrl: env("GOV_API_PADRON_URL") || joinUrl(govApiBaseUrl, "padron-catastral-2-s/get-by-cveCat"),
  govApiGenerarPdfUrl:
    env("GOV_API_GENERAR_PDF_URL") || joinUrl(govApiBaseUrl, "generar-liquidacion-pago-linea-api"),
  govApiLiquidacionUrl: env("GOV_API_LIQUIDACION_URL") || joinUrl(govApiBaseUrl, "liquidacions/numero"),
  govApiDocumentUrl:
    env("GOV_API_DOCUMENT_URL") || joinUrl(govApiBaseUrl, "liquidacions/predial/document"),
};
