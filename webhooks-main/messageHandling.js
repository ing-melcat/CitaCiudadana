const fs = require("fs");
const {
  setPhoneNumberId,
  enviarTexto,
  enviarMenuPrincipal,
  enviarMenuEspecialidades,
  enviarTramites,
  enviarConfirmacionCita
} = require("./whatsappTemplates");

function normalizarTextoEntrada(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

module.exports = async (req, res) => {
  const data = req.body;

  try {
    // Soporte para el chatbot del proyecto (Frontend en React)
    if (data && data.userId && data.message !== undefined) {
      const webText = normalizarTextoEntrada(data.message);
      const isGreeting = ["hola", "hi", "buenos", "buenas", "iniciar", "menu"].some(s => webText.includes(s));
      
      let responseText = "";
      if (isGreeting || webText === "") {
        responseText = "¡Hola! Soy tu Asistente Médico virtual. 🤖\nPuedo ayudarte con pre-diagnósticos médicos. Descríbeme tus síntomas (ej. tengo dolor de cabeza y fiebre).";
      } else if (webText.length > 10 && !webText.includes(" ")) {
        responseText = `Buscando información para la clave catastral: ${webText.toUpperCase()}...\n✅ No se registran adeudos para esta clave en el periodo actual.`;
      } else {
        // --- MOTOR LIGERO DE PRE-DIAGNÓSTICO BASADO EN PESOS ---
        const enfermedadesBase = [
          { nombre: "Infección Respiratoria (Gripe/Resfriado)", sintomas: { "fiebre": 3, "tos": 3, "cabeza": 1, "moco": 2, "garganta": 2, "cuerpo": 1 } },
          { nombre: "Posible Dengue o Infección Viral", sintomas: { "fiebre": 3, "musculo": 3, "cuerpo": 3, "ojos": 2, "cabeza": 1, "manchas": 2, "sarpullido": 2 } },
          { nombre: "Migraña", sintomas: { "cabeza": 3, "luz": 2, "ruido": 2, "nausea": 1, "mareo": 1, "vision": 2 } },
          { nombre: "Problema Gastrointestinal", sintomas: { "estomago": 3, "panza": 3, "diarrea": 3, "vomito": 3, "nausea": 2, "fiebre": 1 } },
          { nombre: "Infección Urinaria", sintomas: { "orinar": 3, "ardor": 3, "vejiga": 2, "sangre": 2, "fiebre": 1 } },
          { nombre: "Ansiedad / Estrés", sintomas: { "pecho": 2, "respirar": 2, "nervios": 3, "corazon": 2, "taquicardia": 2, "miedo": 2 } }
        ];

        let resultados = [];
        for (let enf of enfermedadesBase) {
            let puntaje = 0;
            let puntajeMaximo = Object.values(enf.sintomas).reduce((a, b) => a + b, 0);
            
            for (let [sintoma, peso] of Object.entries(enf.sintomas)) {
                if (webText.includes(sintoma)) puntaje += peso;
            }

            if (puntaje > 0) {
                resultados.push({ nombre: enf.nombre, probabilidad: Math.round((puntaje / puntajeMaximo) * 100) });
            }
        }

        resultados.sort((a, b) => b.probabilidad - a.probabilidad);

        if (resultados.length > 0) {
          let diagnosticos = resultados.slice(0, 2).map(r => `• *${r.nombre}* (Similitud: ${r.probabilidad}%)`).join("\n");
          responseText = `🧠 **Análisis de Síntomas completado:**\n\nSegún tus síntomas, encontramos estas posibles coincidencias:\n${diagnosticos}\n\n⚠️ *Aviso: Esto es solo un análisis estadístico automatizado y no sustituye una consulta médica real. Por favor, agenda una cita en la App.*`;
        } else {
          responseText = "🤔 No logro identificar un patrón claro con esos síntomas. Por favor, sé un poco más específico (ej. 'me duele la cabeza y tengo nauseas'), o agenda una cita con medicina general para una revisión completa.";
        }
      }
      
      return res.json({ text: responseText });
    }

    const incomingPhoneNumberId = data?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
    setPhoneNumberId(incomingPhoneNumberId);

    const message = data?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message || !message.from) return res.status(200).send("EVENT_RECEIVED");

    const from = message.from;

    // Determinar la entrada del usuario
    let text = "";
    let payloadId = "";

    if (message.type === "text") {
      text = normalizarTextoEntrada(message.text?.body);
    } else if (message.type === "interactive") {
      const interactive = message.interactive;
      payloadId = interactive?.button_reply?.id || interactive?.list_reply?.id || "";
    }

    const isGreeting = ["hola", "hi", "buenos", "buenas", "iniciar", "menu"].some(s => text.includes(s));

    // FLUJO PREMIUM INTERACTIVO
    if (payloadId) {
      switch (payloadId) {
        case "menu_citas":
          await enviarMenuEspecialidades(from);
          break;
        case "menu_ia":
          await enviarTexto(from, "🤖 *IA Médica*: Por favor, descríbeme tus síntomas brevemente y analizaré la situación (recuerda que esto es un pre-diagnóstico y no sustituye a un médico profesional).");
          break;
        case "menu_tramites":
          await enviarTramites(from);
          break;
        case "menu_inicio":
          await enviarMenuPrincipal(from);
          break;
        case "tramite_predial":
          await enviarTexto(from, "Para consultar su adeudo predial, por favor envíe su *Clave Catastral* de 16 dígitos.");
          break;
        case "tramite_agua":
          await enviarTexto(from, "Esta funcionalidad se encuentra en mantenimiento 🛠️.");
          break;
        case "cita_medgeneral":
          await enviarConfirmacionCita(from, "Medicina General");
          break;
        case "cita_pediatria":
          await enviarConfirmacionCita(from, "Pediatría");
          break;
        case "cita_cardio":
          await enviarConfirmacionCita(from, "Cardiología");
          break;
        case "cita_derma":
          await enviarConfirmacionCita(from, "Dermatología");
          break;
        case "cita_confirmar":
          await enviarTexto(from, "🎉 ¡Tu cita ha sido confirmada exitosamente! Te esperamos. Para volver al menú, escribe 'menu'.");
          break;
        case "cita_cancelar":
          await enviarTexto(from, "Operación cancelada. Escribe 'menu' para ver las opciones principales.");
          break;
        default:
          await enviarMenuPrincipal(from);
      }
    } else if (isGreeting || text === "") {
      await enviarMenuPrincipal(from);
    } else if (text.length > 10 && !text.includes(" ")) {
      // Posible clave catastral
      await enviarTexto(from, `Buscando información para la clave: ${text.toUpperCase()}...`);
      setTimeout(async () => {
        await enviarTexto(from, "✅ No se registran adeudos para esta clave catastral en el periodo actual. ¡Gracias por contribuir!");
      }, 2000);
    } else {
      // Modo IA WhatsApp
      await enviarTexto(from, "🧠 Analizando tu caso...");
      setTimeout(async () => {
        const enfermedadesBase = [
          { nombre: "Infección Respiratoria", sintomas: { "fiebre": 3, "tos": 3, "cabeza": 1, "moco": 2, "garganta": 2, "cuerpo": 1 } },
          { nombre: "Posible Dengue", sintomas: { "fiebre": 3, "musculo": 3, "cuerpo": 3, "ojos": 2, "cabeza": 1, "manchas": 2, "sarpullido": 2 } },
          { nombre: "Migraña", sintomas: { "cabeza": 3, "luz": 2, "ruido": 2, "nausea": 1, "mareo": 1, "vision": 2 } },
          { nombre: "Problema Gastrointestinal", sintomas: { "estomago": 3, "panza": 3, "diarrea": 3, "vomito": 3, "nausea": 2, "fiebre": 1 } }
        ];

        let resultados = [];
        for (let enf of enfermedadesBase) {
            let puntaje = 0;
            let puntajeMaximo = Object.values(enf.sintomas).reduce((a, b) => a + b, 0);
            
            for (let [sintoma, peso] of Object.entries(enf.sintomas)) {
                if (text.includes(sintoma)) puntaje += peso;
            }

            if (puntaje > 0) {
                resultados.push({ nombre: enf.nombre, probabilidad: Math.round((puntaje / puntajeMaximo) * 100) });
            }
        }

        resultados.sort((a, b) => b.probabilidad - a.probabilidad);

        if (resultados.length > 0) {
          let diagnosticos = resultados.slice(0, 2).map(r => `• *${r.nombre}* (${r.probabilidad}%)`).join("\n");
          await enviarTexto(from, `📋 Según tus síntomas, hay coincidencias con:\n${diagnosticos}\n\n⚠️ Recuerda que esto no sustituye una valoración profesional. Agenda tu cita enviando la palabra *menú*.`);
        } else {
          await enviarTexto(from, "🤔 No logro identificar tus síntomas. Por favor, sé más específico o envía la palabra *menú* para agendar una cita médica presencial.");
        }
      }, 2000);
    }

    return res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("Error procesando mensaje:", error.message);
    return res.status(200).send("EVENT_RECEIVED");
  }
};
