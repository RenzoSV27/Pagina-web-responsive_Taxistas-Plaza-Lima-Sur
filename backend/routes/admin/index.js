const express = require('express');
const taxistasRoutes = require('./taxistas');
const serviciosRoutes = require('./servicios');
const { consultarUno } = require('../../config/db');
const { autenticar, requiereAdmin } = require('../../middleware/auth');
const { obtenerCorreosAdmin } = require('../../utils/roles');

const router = express.Router();

router.get('/resumen', autenticar, requiereAdmin, async (req, res) => {
    try {
        const correosAdmin = obtenerCorreosAdmin();
        const placeholders = correosAdmin.map((_, i) => `@admin${i}`).join(', ');
        const params = {};
        correosAdmin.forEach((correo, i) => {
            params[`admin${i}`] = correo;
        });

        const filtroAdmin = correosAdmin.length
            ? `AND correo NOT IN (${placeholders})`
            : '';

        const taxistas = await consultarUno(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN estado = N'disponible' THEN 1 ELSE 0 END) AS disponibles,
                SUM(CASE WHEN estado = N'ocupado' THEN 1 ELSE 0 END) AS ocupados,
                SUM(CASE WHEN estado = N'inactivo' THEN 1 ELSE 0 END) AS inactivos
            FROM dbo.taxistas
            WHERE 1=1 ${filtroAdmin}
        `, params);

        const servicios = await consultarUno(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN estado = N'disponible' THEN 1 ELSE 0 END) AS disponibles,
                SUM(CASE WHEN estado = N'asignado' THEN 1 ELSE 0 END) AS asignados,
                SUM(CASE WHEN estado = N'completado' THEN 1 ELSE 0 END) AS completados,
                SUM(CASE WHEN estado = N'cancelado' THEN 1 ELSE 0 END) AS cancelados
            FROM dbo.servicios
        `);

        res.json({
            taxistas: {
                total: taxistas?.total || 0,
                disponibles: taxistas?.disponibles || 0,
                ocupados: taxistas?.ocupados || 0,
                inactivos: taxistas?.inactivos || 0
            },
            servicios: {
                total: servicios?.total || 0,
                disponibles: servicios?.disponibles || 0,
                asignados: servicios?.asignados || 0,
                completados: servicios?.completados || 0,
                cancelados: servicios?.cancelados || 0
            }
        });
    } catch (error) {
        console.error('Error en resumen admin:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener el resumen.' });
    }
});

router.use('/taxistas', taxistasRoutes);
router.use('/servicios', serviciosRoutes);

module.exports = router;
