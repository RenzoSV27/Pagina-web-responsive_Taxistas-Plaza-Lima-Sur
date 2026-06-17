const express = require('express');
const { consultarUno, ejecutar } = require('../config/db');
const { mapearTaxista } = require('../utils/mappers');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.get('/', autenticar, async (req, res) => {
    try {
        const taxista = await consultarUno(
            'SELECT * FROM dbo.taxistas WHERE id = @id',
            { id: req.taxistaId }
        );

        if (!taxista) {
            return res.status(404).json({ exito: false, mensaje: 'Taxista no encontrado.' });
        }

        res.json(mapearTaxista(taxista));
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener el perfil.' });
    }
});

router.put('/', autenticar, async (req, res) => {
    try {
        const { nombre, telefono, placa, vehiculo } = req.body;

        if (!nombre || !telefono || !placa || !vehiculo) {
            return res.status(400).json({ exito: false, mensaje: 'Completa todos los campos.' });
        }

        await ejecutar(`
            UPDATE dbo.taxistas
            SET nombre = @nombre, telefono = @telefono, placa = @placa, vehiculo = @vehiculo
            WHERE id = @id
        `, {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            placa: placa.trim(),
            vehiculo: vehiculo.trim(),
            id: req.taxistaId
        });

        const taxista = await consultarUno(
            'SELECT * FROM dbo.taxistas WHERE id = @id',
            { id: req.taxistaId }
        );

        res.json({ exito: true, perfil: mapearTaxista(taxista) });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar el perfil.' });
    }
});

module.exports = router;
