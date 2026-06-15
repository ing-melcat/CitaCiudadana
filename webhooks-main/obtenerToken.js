const axios = require("./httpClient");
const {
  govApiLoginUrl,
  govApiUsername,
  govApiPassword,
} = require("./config");

async function obtenerTokenGobierno() {
  if (!govApiLoginUrl || !govApiUsername || !govApiPassword) {
    throw new Error(
      "Configura GOV_API_LOGIN_URL, GOV_API_USERNAME y GOV_API_PASSWORD en webhooks-main/.env"
    );
  }

  const credentials = {
    username: govApiUsername,
    password: govApiPassword,
  };

  try {
    console.log("Solicitando nuevo token al Gobierno...");

    const response = await axios.post(govApiLoginUrl, credentials);
    const token = response.data.id_token;
    if (!token) {
      throw new Error("La respuesta del gobierno no contenia un id_token.");
    }

    console.log("Token renovado con exito.");
    return token;
  } catch (error) {
    console.error("Error critico obteniendo token:", error.message);
    if (error.response) {
      console.log("Datos error:", error.response.data);
    }
    throw error;
  }
}

module.exports = { obtenerTokenGobierno };
