const express = require('express');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');

require('dotenv').config();

const app = express();

// Configuración de WhatsApp
const whatsapp = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'yourFolderName' // Asegúrate de reemplazar 'yourFolderName' con la ruta de tu carpeta de autenticación
    }),
    puppeteer: { headless: true }, // Asegura que Puppeteer, que usa WhatsApp Web JS internamente, corra en modo headless
});

let qrCodeData; // Variable para almacenar los datos del código QR

whatsapp.on('qr', qrData => {
    console.log('QR Received', qrData);
    qrCodeData = qrData; // Almacena los datos del código QR
});

whatsapp.on('ready', () => {
    console.log('¡WhatsApp está listo!');
    qrCodeData = null; // Limpia el código QR ya que no es necesario después de la autenticación
});

whatsapp.on('message', async message => {
    if (message.body === "hello" || message.body === "Hello") {
        message.reply("Hello scientone from ec2 aws");
    }
});

// Ruta para mostrar el código QR
app.get('/qr', async (req, res) => {
    if (qrCodeData) {
        try {
            const qrImageBuffer = await qrcode.toBuffer(qrCodeData);
            res.set('Content-Type', 'image/png');
            res.send(qrImageBuffer);
        } catch (error) {
            console.error('Error al generar el código QR:', error);
            res.status(500).send('Error interno del servidor');
        }
    } else {
        res.send('El código QR ya no es necesario o aún no está disponible. Espera un momento o verifica si WhatsApp ya está autenticado.');
    }
});

// Iniciar el cliente de WhatsApp
whatsapp.initialize();

// Iniciar el servidor Express
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
