const fs = require("fs");
const { verifyToken } = require("./config");

module.exports = (req, res) => {
  const hubVerifyToken = req.query["hub.verify_token"];
  const hubChallenge = req.query["hub.challenge"];

  fs.appendFileSync(
    "debug_get_log.txt",
    `${new Date().toISOString()} - GET Request: ${JSON.stringify(req.query)}\n`
  );

  if (hubVerifyToken === verifyToken) {
    res.status(200).send(hubChallenge);
  } else {
    fs.appendFileSync(
      "debug_get_log.txt",
      `${new Date().toISOString()} - Token Incorrecto: ${hubVerifyToken}\n`
    );
    res.status(403).send("Verificacion fallida");
  }
};
