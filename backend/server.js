require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { obtenerPool } = require('./config/db');

const authRoutes = require('./routes/auth');
const perfilRoutes = require('./routes/perfil');
const serviciosRoutes = require('./routes/servicios');
const notificacionesRoutes = require('./routes/notificaciones');
const ayudaRoutes = require('./routes/ayuda');
const preferenciasRoutes = require('./routes/preferencias');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const raizProyecto = path.join(__dirname, '..');

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
    try {
        await obtenerPool();
        res.json({ estado: 'ok', baseDatos: process.env.DB_NAME });
    } catch (error) {
        res.status(503).json({ estado: 'error', mensaje: error.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/ayuda', ayudaRoutes);
app.use('/api/preferencias', preferenciasRoutes);
app.use('/api/admin', adminRoutes);

app.use(express.static(raizProyecto));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    const rutaIndex = path.join(raizProyecto, 'index.html');
    if (req.accepts('html')) {
        return res.sendFile(rutaIndex);
    }
    next();
});

app.use((req, res) => {
    res.status(404).json({ exito: false, mensaje: 'Recurso no encontrado.' });
});

app.use((error, req, res, next) => {
    console.error('Error no controlado:', error);
    res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
    console.log(`API en http://localhost:${PORT}/api/health`);

    obtenerPool()
        .then(() => console.log(`Conectado a SQL Server (${process.env.DB_NAME})`))
        .catch((error) => console.error('No se pudo conectar a SQL Server:', error.message));
});
