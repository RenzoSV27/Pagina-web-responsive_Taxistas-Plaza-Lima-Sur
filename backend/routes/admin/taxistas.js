const express = require('express');
const bcrypt = require('bcryptjs');
const { consultar, consultarUno, ejecutar } = require('../../config/db');
const { mapearTaxista } = require('../../utils/mappers');
const { autenticar, requiereAdmin } = require('../../middleware/auth');
const { esAdmin, obtenerCorreosAdmin } = require('../../utils/roles');

const router = express.Router();

router.use(autenticar, requiereAdmin);

const ESTADOS_TAXISTA = ['disponible', 'ocupado', 'inactivo'];

function filtrarTaxistas(filas) {
    const correosAdmin = obtenerCorreosAdmin();
    return filas.filter((fila) => !correosAdmin.includes(fila.correo.toLowerCase()));
}

router.get('/', async (req, res) => {
    try {
        const filas = await consultar(`
            SELECT * FROM dbo.taxistas
            ORDER BY nombre ASC
        `);
        res.json(filtrarTaxistas(filas).map(mapearTaxista));
    } catch (error) {
        console.error('Error al listar taxistas:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener taxistas.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const taxista = await consultarUno(
            'SELECT * FROM dbo.taxistas WHERE id = @id',
            { id: Number(req.params.id) }
        );

        if (!taxista || esAdmin(taxista.correo)) {
            return res.status(404).json({ exito: false, mensaje: 'Taxista no encontrado.' });
        }

        res.json(mapearTaxista(taxista));
    } catch (error) {
        console.error('Error al obtener taxista:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener el taxista.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nombre, dni, telefono, placa, correo, contrasena, vehiculo, licencia, estado } = req.body;

        if (!nombre || !dni || !telefono || !placa || !correo || !contrasena) {
            return res.status(400).json({ exito: false, mensaje: 'Completa todos los campos obligatorios.' });
        }

        if (contrasena.length < 6) {
            return res.status(400).json({ exito: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        if (!/^\d{8}$/.test(dni)) {
            return res.status(400).json({ exito: false, mensaje: 'El DNI debe tener 8 dígitos.' });
        }

        const correoNormalizado = correo.trim().toLowerCase();

        if (esAdmin(correoNormalizado)) {
            return res.status(403).json({ exito: false, mensaje: 'No se puede registrar un taxista con correo de administrador.' });
        }

        const existente = await consultarUno(
            'SELECT id FROM dbo.taxistas WHERE correo = @correo OR dni = @dni',
            { correo: correoNormalizado, dni }
        );

        if (existente) {
            return res.status(409).json({ exito: false, mensaje: 'Ya existe un taxista con ese correo o DNI.' });
        }

        const estadoFinal = ESTADOS_TAXISTA.includes(estado) ? estado : 'disponible';
        const hash = await bcrypt.hash(contrasena, 10);

        const resultado = await ejecutar(`
            INSERT INTO dbo.taxistas (nombre, dni, telefono, correo, contrasena_hash, placa, vehiculo, licencia, estado, acepta_terminos)
            OUTPUT INSERTED.id
            VALUES (@nombre, @dni, @telefono, @correo, @hash, @placa, @vehiculo, @licencia, @estado, 1)
        `, {
            nombre: nombre.trim(),
            dni,
            telefono: telefono.trim(),
            correo: correoNormalizado,
            hash,
            placa: placa.trim(),
            vehiculo: (vehiculo || 'Por registrar').trim(),
            licencia: licencia ? licencia.trim() : null,
            estado: estadoFinal
        });

        const taxistaId = resultado.recordset[0].id;

        await ejecutar(`
            INSERT INTO dbo.preferencias_taxista (taxista_id)
            VALUES (@taxistaId)
        `, { taxistaId });

        const taxista = await consultarUno(
            'SELECT * FROM dbo.taxistas WHERE id = @id',
            { id: taxistaId }
        );

        res.status(201).json({ exito: true, taxista: mapearTaxista(taxista) });
    } catch (error) {
        console.error('Error al crear taxista:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al crear el taxista.' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nombre, dni, telefono, placa, correo, contrasena, vehiculo, licencia, estado } = req.body;

        const actual = await consultarUno(
            'SELECT * FROM dbo.taxistas WHERE id = @id',
            { id }
        );

        if (!actual || esAdmin(actual.correo)) {
            return res.status(404).json({ exito: false, mensaje: 'Taxista no encontrado.' });
        }

        if (!nombre || !dni || !telefono || !placa || !correo) {
            return res.status(400).json({ exito: false, mensaje: 'Completa todos los campos obligatorios.' });
        }

        if (!/^\d{8}$/.test(dni)) {
            return res.status(400).json({ exito: false, mensaje: 'El DNI debe tener 8 dígitos.' });
        }

        const correoNormalizado = correo.trim().toLowerCase();

        if (esAdmin(correoNormalizado)) {
            return res.status(403).json({ exito: false, mensaje: 'No se puede asignar un correo de administrador.' });
        }

        const duplicado = await consultarUno(
            'SELECT id FROM dbo.taxistas WHERE (correo = @correo OR dni = @dni) AND id <> @id',
            { correo: correoNormalizado, dni, id }
        );

        if (duplicado) {
            return res.status(409).json({ exito: false, mensaje: 'Ya existe otro taxista con ese correo o DNI.' });
        }

        const estadoFinal = ESTADOS_TAXISTA.includes(estado) ? estado : actual.estado;

        if (contrasena) {
            if (contrasena.length < 6) {
                return res.status(400).json({ exito: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
            }
            const hash = await bcrypt.hash(contrasena, 10);
            await ejecutar(`
                UPDATE dbo.taxistas SET
                    nombre = @nombre, dni = @dni, telefono = @telefono, correo = @correo,
                    placa = @placa, vehiculo = @vehiculo, licencia = @licencia,
                    estado = @estado, contrasena_hash = @hash
                WHERE id = @id
            `, {
                nombre: nombre.trim(),
                dni,
                telefono: telefono.trim(),
                correo: correoNormalizado,
                placa: placa.trim(),
                vehiculo: (vehiculo || actual.vehiculo).trim(),
                licencia: licencia ? licencia.trim() : null,
                estado: estadoFinal,
                hash,
                id
            });
        } else {
            await ejecutar(`
                UPDATE dbo.taxistas SET
                    nombre = @nombre, dni = @dni, telefono = @telefono, correo = @correo,
                    placa = @placa, vehiculo = @vehiculo, licencia = @licencia, estado = @estado
                WHERE id = @id
            `, {
                nombre: nombre.trim(),
                dni,
                telefono: telefono.trim(),
                correo: correoNormalizado,
                placa: placa.trim(),
                vehiculo: (vehiculo || actual.vehiculo).trim(),
                licencia: licencia ? licencia.trim() : null,
                estado: estadoFinal,
                id
            });
        }

        const taxista = await consultarUno(
            'SELECT * FROM dbo.taxistas WHERE id = @id',
            { id }
        );

        res.json({ exito: true, taxista: mapearTaxista(taxista) });
    } catch (error) {
        console.error('Error al actualizar taxista:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar el taxista.' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const taxista = await consultarUno(
            'SELECT * FROM dbo.taxistas WHERE id = @id',
            { id }
        );

        if (!taxista || esAdmin(taxista.correo)) {
            return res.status(404).json({ exito: false, mensaje: 'Taxista no encontrado.' });
        }

        const servicioActivo = await consultarUno(
            'SELECT id FROM dbo.servicios_activos WHERE taxista_id = @id',
            { id }
        );

        if (servicioActivo) {
            return res.status(409).json({
                exito: false,
                mensaje: 'No se puede eliminar un taxista con un servicio activo. Cancélelo primero.'
            });
        }

        await ejecutar('DELETE FROM dbo.taxistas WHERE id = @id', { id });

        res.json({ exito: true, mensaje: 'Taxista eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar taxista:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al eliminar el taxista.' });
    }
});

module.exports = router;
