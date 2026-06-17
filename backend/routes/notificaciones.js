const express = require('express');
const { consultar, ejecutar } = require('../config/db');
const { mapearNotificacion } = require('../utils/mappers');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.get('/', autenticar, async (req, res) => {
    try {
        const filas = await consultar(`
            SELECT * FROM dbo.notificaciones
            WHERE taxista_id = @taxistaId
            ORDER BY fecha DESC
        `, { taxistaId: req.taxistaId });
        res.json(filas.map(mapearNotificacion));
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener notificaciones.' });
    }
});

router.get('/no-leidas', autenticar, async (req, res) => {
    try {
        const resultado = await consultar(`
            SELECT COUNT(*) AS total FROM dbo.notificaciones
            WHERE taxista_id = @taxistaId AND leida = 0
        `, { taxistaId: req.taxistaId });
        res.json({ total: resultado[0]?.total || 0 });
    } catch (error) {
        console.error('Error al contar notificaciones:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al contar notificaciones.' });
    }
});

router.patch('/:id/leida', autenticar, async (req, res) => {
    try {
        await ejecutar(`
            UPDATE dbo.notificaciones SET leida = 1
            WHERE id = @id AND taxista_id = @taxistaId
        `, { id: Number(req.params.id), taxistaId: req.taxistaId });

        const filas = await consultar(`
            SELECT * FROM dbo.notificaciones
            WHERE taxista_id = @taxistaId
            ORDER BY fecha DESC
        `, { taxistaId: req.taxistaId });

        res.json(filas.map(mapearNotificacion));
    } catch (error) {
        console.error('Error al marcar notificación:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al marcar la notificación.' });
    }
});

module.exports = router;
