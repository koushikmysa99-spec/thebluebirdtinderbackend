const express = require('express');
const authapi = require('./Auth/authService');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS should be applied before routes
app.use(cors({
    origin: "*",  // or "http://localhost:3000" during dev
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes come after CORS
app.use('/auth', authapi);

app.set("trust proxy", 1);

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
