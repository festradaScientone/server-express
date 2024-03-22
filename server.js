const express = require('express');
const qrcode = require('qrcode');
const { Client, LocalAuth , MessageMedia, Location} = require('whatsapp-web.js');
var body_parser = require('body-parser');

require('dotenv').config();

const app = express();
app.use(body_parser.urlencoded({extended:true}));
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

app.post('/instance_id/messages/chat', function (req, res) {
    console.log('req.body', req.body);

    const number = req.body.number|| '';

    const Body_msg  = req.body.Body_msg|| '';
  
    console.log(number);
    console.log(Body_msg)
    const chatId = number.substring(1)+ "@c.us";
    console.log('chatId',chatId)
    whatsapp.sendMessage(chatId, Body_msg);
    res.send('Send message Done');
});

///{INSTANCE_ID}/messages/image
app.post('/instance_id/messages/image', async function (req, res) {
    console.log('req.body', req.body);

    const number = req.body.number|| '';
    const imageUrl  = req.body.imageUrl|| '';
    const imageCaption  = req.body.imageCaption|| '';

    const media = await MessageMedia.fromUrl(imageUrl);
    media.mimetype = "image/png";
    media.filename = "CustomImageName.png";
    console.log(number);
    //console.log(Body_msg)
    const chatId = number.substring(1)+ "@c.us";
    console.log('chatId',chatId)
    whatsapp.sendMessage(chatId, media, {caption: "Image from backend"})
    res.send('Send message Done');
});

//messages/location
app.post('/instance_id/messages/location', async function (req, res) {
    console.log('req.body', req.body);
    
    const number = req.body.number || '';
    const latitude = parseFloat(req.body.latitude) || 0;;
    const longitude  = parseFloat(req.body.longitude) || 0;;
    const description  = req.body.description || '';

    const location = new Location(latitude, longitude);
    const chatId = number.substring(1)+ "@c.us";
    console.log('chatId',chatId)
    whatsapp.sendMessage(chatId, location);
    res.send('Send message Done');
});

whatsapp.on('ready', () => {
    console.log('¡WhatsApp está listo!');
    qrCodeData = null; // Limpia el código QR ya que no es necesario después de la autenticación
});

whatsapp.on('error', (error) => {
    console.error('Error en el cliente de WhatsApp:', error);
});


// Escucha de mensajes entrantes
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
