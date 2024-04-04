const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Configuración básica de Express
app.set('view engine', 'ejs');

// Utiliza express.static para servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// URL de conexión a la base de datos en la nube
const url = 'mongodb+srv://analauris2103:GHKh6SrUeaigN09o@cluster0.qcjtn9u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Reemplaza esto con tu URL de conexión

// Nombre de la base de datos y colección
const dbName = 'EjemploBD';
const collectionName = 'ejemplo';

// Ruta para mostrar los datos en una tabla HTML
app.get('/', async function(req, res) {
    try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });
        console.log("Connected successfully to MongoDB Atlas");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const docs = await collection.find({}).toArray();
        res.render('index', { datos: docs });

        client.close(); // Cierra la conexión después de renderizar
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        res.status(500).send('Error connecting to MongoDB');
    }
});

// Ruta para generar el informe en PDF
app.get('/generar-informe-pdf', async function(req, res) {
    try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });
        console.log("Connected successfully to MongoDB Atlas");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const docs = await collection.find({}).toArray();

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        
        // Establecer el nombre del archivo de salida
        const filename = 'informe.pdf';

        // Crear el contenido del documento PDF
        doc.pipe(fs.createWriteStream(filename));

        // Agregar contenido al PDF
        doc.fontSize(16).text('Informe de Datos', { align: 'center' });
        
        // Agregar los datos al PDF
        docs.forEach((docData, index) => {
            // Aquí puedes personalizar cómo se agregan los datos al PDF
            // Por ejemplo, puedes dibujar una tabla con los datos
            // Para ello, puedes usar las funciones de PDFKit para dibujar celdas y bordes
            // Consulta la documentación de PDFKit para más detalles: http://pdfkit.org/docs/getting_started.html
            doc.fontSize(12).text(`Documento ${index + 1}: ${JSON.stringify(docData)}`);
        });

        // Finalizar y cerrar el documento PDF
        doc.end();

        // Redireccionar al usuario para descargar el PDF
        res.download(filename);

        client.close(); // Cierra la conexión después de enviar el PDF
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        res.status(500).send('Error connecting to MongoDB');
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
