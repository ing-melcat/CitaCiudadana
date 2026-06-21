const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/webhook', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = req.headers['x-token'];
    
    // Verificamos el token (clave: citaciudadana2024)
    if (authHeader !== 'Bearer citaciudadana2024' && token !== 'citaciudadana2024') {
        console.log('Intento no autorizado');
        return res.status(401).json({ error: 'No autorizado' });
    }

    const { message, userId } = req.body;
    console.log(`[Usuario ${userId}]: ${message}`);

    // Respuesta simulada del Asistente
    const responseText = `(Respuesta desde Webhook): He analizado tu mensaje "${message}". Por favor proporciona más detalles o consulta a un médico especialista si el problema persiste.`;

    res.json({
        text: responseText
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Webhook mock corriendo en http://localhost:${PORT}`);
    console.log('Esperando mensajes en POST /webhook...');
});
