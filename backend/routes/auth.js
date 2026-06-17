const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { consultarUno, ejecutar } = require('../config/db');
const { mapearTaxista } = require('../utils/mappers');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

const DIAS_SESION = 7;

function crearSesionRespuesta(taxista, token) {
    return {
        taxistaId: String(taxista.id),
        correo: taxista.correo,
        nombre: taxista.nombre,
        token,
        iniciadaEn: new Date().toISOString()
    };
}

async function crearSesion(taxistaId) {
    const token = uuidv4();
    const expiraEn = new Date();
    expiraEn.setDate(expiraEn.getDate() + DIAS_SESION);

    await ejecutar(`
        INSERT INTO dbo.sesiones (taxista_id, token, expira_en)
        VALUES (@taxistaId, @token, @expiraEn)
    `, { taxistaId, token, expiraEn });

    const taxista = await consultarUno(
        'SELECT id, nombre, correo FROM dbo.taxistas WHERE id = @taxistaId',
        { taxistaId }
    );

    return crearSesionRespuesta(taxista, token);
}

router.post('/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ exito: false, mensaje: 'Correo y contraseña son obligatorios.' });
        }

        const taxista = await consultarUno(
            'SELECT * FROM dbo.taxistas WHERE correo = @correo',
            { correo: correo.trim().toLowerCase() }
        );

        if (!taxista) {
            return res.status(401).json({ exito: false, mensaje: 'Correo o contraseña incorrectos.' });
        }

        const valida = await bcrypt.compare(contrasena, taxista.contrasena_hash);
        if (!valida) {
            return res.status(401).json({ exito: false, mensaje: 'Correo o contraseña incorrectos.' });
        }

        const sesion = await crearSesion(taxista.id);
        res.json({ exito: true, sesion });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al iniciar sesión.' });
    }
});

router.post('/registro', async (req, res) => {
    try {
        const { nombre, dni, telefono, placa, correo, contrasena, vehiculo, aceptaTerminos } = req.body;

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

        const existente = await consultarUno(
            'SELECT id FROM dbo.taxistas WHERE correo = @correo OR dni = @dni',
            { correo: correoNormalizado, dni }
        );

        if (existente) {
            return res.status(409).json({ exito: false, mensaje: 'Ya existe un taxista con ese correo o DNI.' });
        }

        const hash = await bcrypt.hash(contrasena, 10);

        const resultado = await ejecutar(`
            INSERT INTO dbo.taxistas (nombre, dni, telefono, correo, contrasena_hash, placa, vehiculo, acepta_terminos)
            OUTPUT INSERTED.id
            VALUES (@nombre, @dni, @telefono, @correo, @hash, @placa, @vehiculo, @aceptaTerminos)
        `, {
            nombre: nombre.trim(),
            dni,
            telefono: telefono.trim(),
            correo: correoNormalizado,
            hash,
            placa: placa.trim(),
            vehiculo: (vehiculo || 'Por registrar').trim(),
            aceptaTerminos: aceptaTerminos ? 1 : 0
        });

        const taxistaId = resultado.recordset[0].id;

        await ejecutar(`
            INSERT INTO dbo.preferencias_taxista (taxista_id)
            VALUES (@taxistaId)
        `, { taxistaId });

        const sesion = await crearSesion(taxistaId);
        res.status(201).json({ exito: true, sesion });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al registrar el taxista.' });
    }
});

router.post('/recuperar-contrasena', async (req, res) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({ exito: false, mensaje: 'Ingresa tu correo electrónico.' });
        }

        const taxista = await consultarUno(
            'SELECT id FROM dbo.taxistas WHERE correo = @correo',
            { correo: correo.trim().toLowerCase() }
        );

        if (taxista) {
            const token = uuidv4();
            const expiraEn = new Date();
            expiraEn.setHours(expiraEn.getHours() + 24);

            await ejecutar(`
                INSERT INTO dbo.tokens_recuperacion_contrasena (taxista_id, token, expira_en)
                VALUES (@taxistaId, @token, @expiraEn)
            `, { taxistaId: taxista.id, token, expiraEn });
        }

        res.json({
            exito: true,
            mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.'
        });
    } catch (error) {
        console.error('Error en recuperar contraseña:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al procesar la solicitud.' });
    }
});

router.post('/cambiar-contrasena', autenticar, async (req, res) => {
    try {
        const { contrasenaActual, contrasenaNueva, confirmacion } = req.body;

        if (!contrasenaActual || !contrasenaNueva || !confirmacion) {
            return res.status(400).json({ exito: false, mensaje: 'Completa todos los campos.' });
        }

        if (contrasenaNueva !== confirmacion) {
            return res.status(400).json({ exito: false, mensaje: 'Las contraseñas nuevas no coinciden.' });
        }

        if (contrasenaNueva.length < 6) {
            return res.status(400).json({ exito: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        const taxista = await consultarUno(
            'SELECT contrasena_hash FROM dbo.taxistas WHERE id = @id',
            { id: req.taxistaId }
        );

        const valida = await bcrypt.compare(contrasenaActual, taxista.contrasena_hash);
        if (!valida) {
            return res.status(401).json({ exito: false, mensaje: 'La contraseña actual es incorrecta.' });
        }

        const hash = await bcrypt.hash(contrasenaNueva, 10);
        await ejecutar(
            'UPDATE dbo.taxistas SET contrasena_hash = @hash WHERE id = @id',
            { hash, id: req.taxistaId }
        );

        res.json({ exito: true, mensaje: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al cambiar la contraseña.' });
    }
});

router.post('/logout', autenticar, async (req, res) => {
    try {
        const token = req.headers.authorization.slice(7);
        await ejecutar(
            'UPDATE dbo.sesiones SET activa = 0 WHERE token = @token',
            { token }
        );
        res.json({ exito: true });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al cerrar sesión.' });
    }
});

router.get('/sesion', autenticar, async (req, res) => {
    res.json({
        taxistaId: String(req.taxistaId),
        correo: req.sesion.correo,
        nombre: req.sesion.nombre,
        iniciadaEn: new Date().toISOString()
    });
});

module.exports = router;
