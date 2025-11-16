const express = require('express');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const app = express()
// Import all environmental keys from .env
require('dotenv').config()

// Middleware
// To allow the frontend to call the backend since they're on different ports
// TODO: Need to restrict it later to allow only responding to the frontend address
app.use(cors())
// To automatically parse any incoming JSON
app.use(express.json())

// Root page
app.get('/', (req, res) => {
    res.send('<h1>Hello from your Express server!</h1>');
});

app.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.file);
    res.json({message: "UPLOADED SUCCESSFULLY"})
});

// Starting the server on designated port
app.listen(process.env.PORT, () => {
    console.log(`Server up and running on http://localhost:${process.env.PORT}`)
})

