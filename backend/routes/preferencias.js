const express = require('express');
const { consultarUno, ejecutar } = require('../config/db');
const { mapearPreferencias } = require('../utils/mappers');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.get('/', autenticar, async (req, res) => {
    try {
        const preferencias = await consultarUno(
            'SELECT * FROM dbo.preferencias_taxista WHERE taxista_id = @taxistaId',
            { taxistaId: req.taxistaId }
        );
        res.json(mapearPreferencias(preferencias));
    } catch (error) {
        console.error('Error al obtener preferencias:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener preferencias.' });
    }
});

router.put('/', autenticar, async (req, res) => {
    try {
        const {
            notifServiciosCercanos,
            notifConfirmacionPagos,
            notifActualizacionesSistema,
            notifRecordatoriosServicio
        } = req.body;

        await ejecutar(`
            UPDATE dbo.preferencias_taxista SET
                notif_servicios_cercanos = @notifServiciosCercanos,
                notif_confirmacion_pagos = @notifConfirmacionPagos,
                notif_actualizaciones_sistema = @notifActualizacionesSistema,
                notif_recordatorios_servicio = @notifRecordatoriosServicio
            WHERE taxista_id = @taxistaId
        `, {
            taxistaId: req.taxistaId,
            notifServiciosCercanos: notifServiciosCercanos ? 1 : 0,
            notifConfirmacionPagos: notifConfirmacionPagos ? 1 : 0,
            notifActualizacionesSistema: notifActualizacionesSistema ? 1 : 0,
            notifRecordatoriosServicio: notifRecordatoriosServicio ? 1 : 0
        });

        const preferencias = await consultarUno(
            'SELECT * FROM dbo.preferencias_taxista WHERE taxista_id = @taxistaId',
            { taxistaId: req.taxistaId }
        );

        res.json({ exito: true, preferencias: mapearPreferencias(preferencias) });
    } catch (error) {
        console.error('Error al actualizar preferencias:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar preferencias.' });
    }
});

module.exports = router;
