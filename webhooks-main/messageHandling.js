const axios = require("./httpClient");
const path = require("path");
const fs = require("fs");
const { obtenerTokenGobierno } = require("./obtenerToken");
const {
  setPhoneNumberId,
  enviarPlantillaWhatsApp,
  enviarPlantillaSolicitarClaveCatastral,
  enviarPlantillaWhatsApp2,
  enviarPlantillaOrdenPago,
  enviarPlantillaConsultaPredial,
  enviarPlantillaErrorGenerico,
  enviarPlantillaImagenTlaquepaque,
  enviarPlantillaPago,
} = require("./whatsappTemplates");
const config = require("./config");

const apiUrlPadron = config.govApiPadronUrl;
const apiUrlGenerarPDF = config.govApiGenerarPdfUrl;
const apiUrlLiquidacion = config.govApiLiquidacionUrl;
const apiUrlGetDocument = config.govApiDocumentUrl;
const publicBaseUrl = config.publicBaseUrl;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let currentAuthToken = "";

function normalizarTextoEntrada(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function peticionGobierno(method, url, data = null) {
  if (!url) {
    throw new Error("Configura GOV_API_BASE_URL o la URL especifica de la API de gobierno en .env");
  }

  if (!currentAuthToken) {
    const token = await obtenerTokenGobierno();
    currentAuthToken = `Bearer ${token}`;
  }

  try {
    return await axios({
      method,
      url,
      data,
      headers: {
        Authorization: currentAuthToken,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("Token gobierno vencido. Renovando...");
      const newToken = await obtenerTokenGobierno(true);
      currentAuthToken = `Bearer ${newToken}`;

      return await axios({
        method,
        url,
        data,
        headers: {
          Authorization: currentAuthToken,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      });
    }

    throw error;
  }
}

module.exports = async (req, res) => {
  const data = req.body;

  try {
    fs.appendFileSync(
      "debug_post_log.txt",
      `${new Date().toISOString()} - POST Request: ${JSON.stringify(data)}\n`
    );

    const incomingPhoneNumberId =
      data?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
    const incomingDisplayPhone =
      data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
    setPhoneNumberId(incomingPhoneNumberId);

    const message = data?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    fs.appendFileSync(
      "webhook_inbound_log.txt",
      `${new Date().toISOString()} phone_number_id=${incomingPhoneNumberId || "n/a"} display_phone=${
        incomingDisplayPhone || "n/a"
      } has_message=${Boolean(message)}\n`
    );

    if (!message) {
      return res.status(200).send("EVENT_RECEIVED");
    }

    const from = message.from;
    if (!from) {
      return res.status(200).send("EVENT_RECEIVED");
    }

    const text =
      message.type === "text" && typeof message.text?.body === "string"
        ? normalizarTextoEntrada(message.text.body)
        : "";
    const buttonPayload = (
      message.button?.payload ||
      message.interactive?.button_reply?.id ||
      message.interactive?.button_reply?.title ||
      message.interactive?.list_reply?.id ||
      message.interactive?.list_reply?.title ||
      ""
    )
      .toString();
    const normalizedButtonPayload = normalizarTextoEntrada(buttonPayload);

    const palabrasClaveSaludo = [
      "hola",
      "hi",
      "buen dia",
      "buenos dias",
      "saludos",
      "iniciar",
      "que tal",
      "buenas",
      "buenas tardes",
      "buenas noches",
      "hey",
      "hello",
      "welcome",
      "bienvenido",
      "que onda",
      "como estas",
    ];

    let action = "";
    let extractedValue = "";

    if (palabrasClaveSaludo.some((s) => text.includes(s))) {
      action = "saludo";
    } else if (text.includes("realizar pago") || normalizedButtonPayload === "realizar pago") {
      action = "calculo_prediales";
    } else if (text.includes("predial") || normalizedButtonPayload === "predial") {
      action = "solicitar_predial";
    } else if (text.includes("crear orden de pago") || normalizedButtonPayload === "crear orden de pago") {
      action = "confirmar_pago";
    } else if (/^pago:\w+$/i.test(text)) {
      extractedValue = text.split(":")[1].trim();
      action = "orden_pago";
    } else if (/^ver:(\w+)$/i.test(text)) {
      extractedValue = text.split(":")[1].trim();
      action = "consulta_predial";
    } else if (/^orden:(\w+)$/i.test(text)) {
      extractedValue = text.split(":")[1].trim();
      action = "pagos_finales";
    } else if (text.length > 5 && !text.includes(" ")) {
      extractedValue = text.toUpperCase();
      action = "consulta_predial";
    }

    switch (action) {
      case "saludo":
        await enviarPlantillaWhatsApp(from, "saludo_inicial");
        break;
      case "solicitar_predial":
        await enviarPlantillaSolicitarClaveCatastral(from);
        break;
      case "confirmar_pago":
        await enviarPlantillaWhatsApp2(from, "confirmar_pago", [extractedValue || "S/N"]);
        break;
      case "calculo_prediales":
        await enviarPlantillaImagenTlaquepaque(from);
        break;
      case "orden_pago":
        await handleOrdenPago(from, extractedValue);
        break;
      case "consulta_predial":
        await handleConsultaPredial(from, extractedValue);
        break;
      case "pagos_finales":
        await handlePagosFinales(from, extractedValue);
        break;
      default:
        console.log("No se encontro una accion correspondiente.");
        await enviarPlantillaWhatsApp2(from, "ayuda", [
          "No entendi su mensaje.",
          "Escriba 'predial' para iniciar su consulta.",
          "Tambien puede enviar directamente su clave catastral.",
        ]);
        break;
    }

    return res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("Error procesando el mensaje:", error.message);
    return res.status(200).send("EVENT_RECEIVED");
  }
};

async function handleOrdenPago(from, extractedValue) {
  try {
    const payload = { liquidaciones: extractedValue };
    console.log(`Generando orden para: ${extractedValue}`);

    const responseGenerar = await peticionGobierno("POST", apiUrlGenerarPDF, payload);

    if (JSON.stringify(responseGenerar.data).includes("Index: 0")) {
      await enviarPlantillaWhatsApp2(from, "error", ["No se encontraron adeudos pendientes."]);
      return;
    }

    const folioLiquidacion = responseGenerar.data?.liquidacion;
    if (!folioLiquidacion) {
      throw new Error("La API no devolvio un folio valido.");
    }

    await delay(4000);

    const urlDetalle = `${apiUrlLiquidacion}/${folioLiquidacion}`;
    const responseDetalle = await peticionGobierno("GET", urlDetalle);

    const idReal = responseDetalle.data?.id;
    if (!idReal) {
      throw new Error(`No se pudo recuperar el ID interno para el folio ${folioLiquidacion}.`);
    }

    const responsePDF = await peticionGobierno("GET", `${apiUrlGetDocument}/${idReal}`);
    const pdfBase64 = responsePDF.data?.objeto || responsePDF.data?.reporte;

    if (!pdfBase64) {
      throw new Error("El PDF no se genero correctamente.");
    }

    const buffer = Buffer.from(pdfBase64, "base64");
    const timestamp = new Date().toISOString().replace(/[:\-T.]/g, "").slice(0, 14);
    const fileName = `Orden-${folioLiquidacion}-${timestamp}.pdf`;

    const pdfDir = path.join(__dirname, "public", "pdfs");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const filePath = path.join(pdfDir, fileName);
    fs.writeFileSync(filePath, buffer);
    console.log(`PDF generado: ${fileName}`);

    const fileUrl = `${publicBaseUrl}/public/pdfs/${fileName}`;
    await enviarPlantillaOrdenPago(from, extractedValue, fileUrl);
  } catch (error) {
    console.error("Error handleOrdenPago:", error.message);
    await enviarPlantillaErrorGenerico(from, "Hubo un problema generando su documento. Intente nuevamente.");
  }
}

async function handleConsultaPredial(from, extractedValue) {
  const claveConsultada = String(extractedValue || "").trim();
  const urlConsulta = `${apiUrlPadron}/${claveConsultada}`;

  try {
    console.log(`Consultando padron: ${urlConsulta}`);
    const response = await peticionGobierno("GET", urlConsulta);

    let resultado = response.data;

    if (resultado === "" || resultado == null) {
      throw new Error("Sin resultados en la consulta.");
    }

    if (Array.isArray(resultado)) {
      resultado = resultado[0];
    }

    const padron = resultado?.padron || resultado || {};
    const ultimoRecibo = resultado?.ultimoRecibo || {};

    if (!padron || Object.keys(padron).length === 0) {
      throw new Error("Sin datos de padron para la clave consultada.");
    }

    const ultimoPeriodoPagado = ultimoRecibo?.ultimoAnio
      ? `${ultimoRecibo.ultimoAnio}/${ultimoRecibo.ultimoMes || ""}`.replace(/\/$/, "")
      : resultado?.ultimo_periodo_pagado || "Sin informacion";

    const nombreContribuyente =
      padron?.propietario ||
      padron?.nombre ||
      resultado?.nombre_ne ||
      resultado?.nombre ||
      "Propietario no disponible";

    const direccionContribuyente =
      padron?.domicilio ||
      padron?.ubicacion ||
      resultado?.direccion_ne ||
      resultado?.direccion ||
      "Direccion no disponible";

    const localidadContribuyente =
      padron?.municipio || resultado?.localidad_ne || resultado?.localidad || "Cuautitlan";

    const parameters = [
      padron?.cveCatastral || claveConsultada,
      ultimoPeriodoPagado,
      nombreContribuyente,
      direccionContribuyente,
      localidadContribuyente,
    ];

    await enviarPlantillaConsultaPredial(from, parameters);
  } catch (error) {
    console.error("Error en consulta_predial:", error.message);
    await enviarPlantillaErrorGenerico(from, "No encontramos informacion para esa clave.");
  }
}

async function handlePagosFinales(from, extractedValue) {
  try {
    const urlLiq = `${apiUrlLiquidacion}/${extractedValue}`;
    const response = await peticionGobierno("GET", urlLiq);

    const liquidacion = response.data;
    const enlacePago = `https://grp.cuautitlan.gob.mx/pasarela/pago/${liquidacion.numeroLiquidacion}`;

    await enviarPlantillaPago(
      from,
      liquidacion.numeroLiquidacion,
      liquidacion.total.toFixed(2),
      enlacePago
    );
  } catch (error) {
    console.error("Error en pagos_finales:", error.message);
    await enviarPlantillaErrorGenerico(from, "No se encontro informacion de pago.");
  }
}
