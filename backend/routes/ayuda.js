const express = require('express');
const { consultar, ejecutar } = require('../config/db');
const { mapearPreferencias } = require('../utils/mappers');
const { autenticar, requiereTaxista } = require('../middleware/auth');

const router = express.Router();

router.get('/faq', async (req, res) => {
    try {
        const filas = await consultar(`
            SELECT pregunta, respuesta FROM dbo.preguntas_frecuentes
            WHERE activa = 1
            ORDER BY orden ASC, id ASC
        `);
        res.json(filas);
    } catch (error) {
        console.error('Error al obtener FAQ:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener preguntas frecuentes.' });
    }
});

router.post('/soporte', autenticar, requiereTaxista, async (req, res) => {
    try {
        const { nombre, correo, asunto, mensaje } = req.body;

        if (!nombre || !correo || !asunto || !mensaje) {
            return res.status(400).json({ exito: false, mensaje: 'Completa todos los campos.' });
        }

        await ejecutar(`
            INSERT INTO dbo.mensajes_soporte (taxista_id, nombre, correo, asunto, mensaje)
            VALUES (@taxistaId, @nombre, @correo, @asunto, @mensaje)
        `, {
            taxistaId: req.taxistaId,
            nombre: nombre.trim(),
            correo: correo.trim(),
            asunto: asunto.trim(),
            mensaje: mensaje.trim()
        });

        res.json({
            exito: true,
            mensaje: '¡Mensaje enviado! Nuestro equipo te responderá en un plazo de 24 horas hábiles.'
        });
    } catch (error) {
        console.error('Error al enviar soporte:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al enviar el mensaje.' });
    }
});

router.post('/soporte/publico', async (req, res) => {
    try {
        const { nombre, correo, asunto, mensaje } = req.body;

        if (!nombre || !correo || !asunto || !mensaje) {
            return res.status(400).json({ exito: false, mensaje: 'Completa todos los campos.' });
        }

        await ejecutar(`
            INSERT INTO dbo.mensajes_soporte (taxista_id, nombre, correo, asunto, mensaje)
            VALUES (NULL, @nombre, @correo, @asunto, @mensaje)
        `, {
            nombre: nombre.trim(),
            correo: correo.trim(),
            asunto: asunto.trim(),
            mensaje: mensaje.trim()
        });

        res.json({
            exito: true,
            mensaje: '¡Mensaje enviado! Nuestro equipo te responderá en un plazo de 24 horas hábiles.'
        });
    } catch (error) {
        console.error('Error al enviar soporte público:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al enviar el mensaje.' });
    }
});

module.exports = router;
