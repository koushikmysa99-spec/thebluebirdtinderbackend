const express = require('express');
const authapi = require('./Auth/authService');
const cors = require("cors");
// index.js - Basic Express server to check server start

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/auth', authapi);
app.use(cors());

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/health', (req, res) => {
    res.send('OK');
});

const server = app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});