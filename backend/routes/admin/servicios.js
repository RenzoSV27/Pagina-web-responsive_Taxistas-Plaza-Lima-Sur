const express = require('express');
const { consultar, consultarUno, ejecutar } = require('../../config/db');
const { mapearServicioAdmin } = require('../../utils/mappers');
const { autenticar, requiereAdmin } = require('../../middleware/auth');

const router = express.Router();

router.use(autenticar, requiereAdmin);

const ESTADOS_SERVICIO = ['disponible', 'asignado', 'completado', 'cancelado'];

const COORDS_LIMA_SUR = {
    latRecogida: -12.1550,
    lngRecogida: -76.9820,
    latEntrega: -12.1200,
    lngEntrega: -76.9900
};

function validarCamposServicio(datos) {
    const campos = ['tienda', 'origen', 'destino', 'producto', 'peso', 'tarifa', 'cliente', 'telefonoCliente'];
    for (const campo of campos) {
        if (datos[campo] === undefined || datos[campo] === null || String(datos[campo]).trim() === '') {
            return `El campo "${campo}" es obligatorio.`;
        }
    }
    if (Number(datos.tarifa) < 0) {
        return 'La tarifa no puede ser negativa.';
    }
    return null;
}

async function liberarServicioAsignado(servicioId) {
    const activo = await consultarUno(
        'SELECT taxista_id FROM dbo.servicios_activos WHERE servicio_id = @servicioId',
        { servicioId }
    );

    if (activo) {
        await ejecutar(
            'DELETE FROM dbo.servicios_activos WHERE servicio_id = @servicioId',
            { servicioId }
        );
        await ejecutar(
            'UPDATE dbo.taxistas SET estado = N\'disponible\' WHERE id = @taxistaId AND estado = N\'ocupado\'',
            { taxistaId: activo.taxista_id }
        );
    }

    await ejecutar(`
        UPDATE dbo.servicios
        SET estado = N'cancelado', taxista_id = NULL
        WHERE id = @servicioId AND estado = N'asignado'
    `, { servicioId });
}

async function obtenerServicioAdmin(id) {
    return consultarUno(`
        SELECT s.*, t.nombre AS taxista_nombre
        FROM dbo.servicios s
        LEFT JOIN dbo.taxistas t ON t.id = s.taxista_id
        WHERE s.id = @id
    `, { id });
}

router.get('/', async (req, res) => {
    try {
        const { estado } = req.query;
        let query = `
            SELECT s.*, t.nombre AS taxista_nombre
            FROM dbo.servicios s
            LEFT JOIN dbo.taxistas t ON t.id = s.taxista_id
        `;
        const params = {};

        if (estado && ESTADOS_SERVICIO.includes(estado)) {
            query += ' WHERE s.estado = @estado';
            params.estado = estado;
        }

        query += ' ORDER BY s.creado_en DESC';

        const filas = await consultar(query, params);
        res.json(filas.map(mapearServicioAdmin));
    } catch (error) {
        console.error('Error al listar servicios:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener servicios.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const servicio = await obtenerServicioAdmin(Number(req.params.id));

        if (!servicio) {
            return res.status(404).json({ exito: false, mensaje: 'Servicio no encontrado.' });
        }

        res.json(mapearServicioAdmin(servicio));
    } catch (error) {
        console.error('Error al obtener servicio:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener el servicio.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const datos = req.body;
        const errorValidacion = validarCamposServicio(datos);

        if (errorValidacion) {
            return res.status(400).json({ exito: false, mensaje: errorValidacion });
        }

        const coordsRecogida = datos.coordenadasRecogida || {};
        const coordsEntrega = datos.coordenadasEntrega || {};

        const resultado = await ejecutar(`
            INSERT INTO dbo.servicios (
                tienda, tipo, prioridad, origen, destino, producto, peso,
                tarifa, distancia, tiempo_estimado, cliente, telefono_cliente, notas,
                latitud_recogida, longitud_recogida, latitud_entrega, longitud_entrega, estado
            )
            OUTPUT INSERTED.id
            VALUES (
                @tienda, @tipo, @prioridad, @origen, @destino, @producto, @peso,
                @tarifa, @distancia, @tiempoEstimado, @cliente, @telefonoCliente, @notas,
                @latRecogida, @lngRecogida, @latEntrega, @lngEntrega, N'disponible'
            )
        `, {
            tienda: datos.tienda.trim(),
            tipo: (datos.tipo || 'Entrega').trim(),
            prioridad: datos.prioridad ? 1 : 0,
            origen: datos.origen.trim(),
            destino: datos.destino.trim(),
            producto: datos.producto.trim(),
            peso: String(datos.peso).trim(),
            tarifa: Number(datos.tarifa),
            distancia: (datos.distancia || '—').trim(),
            tiempoEstimado: (datos.tiempoEstimado || '—').trim(),
            cliente: datos.cliente.trim(),
            telefonoCliente: String(datos.telefonoCliente).trim(),
            notas: datos.notas ? datos.notas.trim() : null,
            latRecogida: Number(coordsRecogida.lat ?? COORDS_LIMA_SUR.latRecogida),
            lngRecogida: Number(coordsRecogida.lng ?? COORDS_LIMA_SUR.lngRecogida),
            latEntrega: Number(coordsEntrega.lat ?? COORDS_LIMA_SUR.latEntrega),
            lngEntrega: Number(coordsEntrega.lng ?? COORDS_LIMA_SUR.lngEntrega)
        });

        const servicioId = resultado.recordset[0].id;
        const servicio = await obtenerServicioAdmin(servicioId);

        res.status(201).json({ exito: true, servicio: mapearServicioAdmin(servicio) });
    } catch (error) {
        console.error('Error al crear servicio:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al crear el servicio.' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const actual = await consultarUno(
            'SELECT * FROM dbo.servicios WHERE id = @id',
            { id }
        );

        if (!actual) {
            return res.status(404).json({ exito: false, mensaje: 'Servicio no encontrado.' });
        }

        if (actual.estado === 'completado') {
            return res.status(409).json({ exito: false, mensaje: 'No se puede editar un servicio completado.' });
        }

        const datos = { ...actual, ...req.body };
        const errorValidacion = validarCamposServicio({
            tienda: datos.tienda,
            origen: datos.origen,
            destino: datos.destino,
            producto: datos.producto,
            peso: datos.peso,
            tarifa: datos.tarifa,
            cliente: datos.cliente,
            telefonoCliente: datos.telefono_cliente || datos.telefonoCliente
        });

        if (errorValidacion) {
            return res.status(400).json({ exito: false, mensaje: errorValidacion });
        }

        const coordsRecogida = req.body.coordenadasRecogida || {};
        const coordsEntrega = req.body.coordenadasEntrega || {};

        await ejecutar(`
            UPDATE dbo.servicios SET
                tienda = @tienda,
                tipo = @tipo,
                prioridad = @prioridad,
                origen = @origen,
                destino = @destino,
                producto = @producto,
                peso = @peso,
                tarifa = @tarifa,
                distancia = @distancia,
                tiempo_estimado = @tiempoEstimado,
                cliente = @cliente,
                telefono_cliente = @telefonoCliente,
                notas = @notas,
                latitud_recogida = @latRecogida,
                longitud_recogida = @lngRecogida,
                latitud_entrega = @latEntrega,
                longitud_entrega = @lngEntrega
            WHERE id = @id
        `, {
            id,
            tienda: String(datos.tienda).trim(),
            tipo: String(datos.tipo || 'Entrega').trim(),
            prioridad: datos.prioridad ? 1 : 0,
            origen: String(datos.origen).trim(),
            destino: String(datos.destino).trim(),
            producto: String(datos.producto).trim(),
            peso: String(datos.peso).trim(),
            tarifa: Number(datos.tarifa),
            distancia: String(datos.distancia || '—').trim(),
            tiempoEstimado: String(datos.tiempo_estimado || datos.tiempoEstimado || '—').trim(),
            cliente: String(datos.cliente).trim(),
            telefonoCliente: String(datos.telefono_cliente || datos.telefonoCliente).trim(),
            notas: datos.notas ? String(datos.notas).trim() : null,
            latRecogida: Number(coordsRecogida.lat ?? actual.latitud_recogida),
            lngRecogida: Number(coordsRecogida.lng ?? actual.longitud_recogida),
            latEntrega: Number(coordsEntrega.lat ?? actual.latitud_entrega),
            lngEntrega: Number(coordsEntrega.lng ?? actual.longitud_entrega)
        });

        const servicio = await obtenerServicioAdmin(id);
        res.json({ exito: true, servicio: mapearServicioAdmin(servicio) });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar el servicio.' });
    }
});

router.patch('/:id/cancelar', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const servicio = await consultarUno(
            'SELECT * FROM dbo.servicios WHERE id = @id',
            { id }
        );

        if (!servicio) {
            return res.status(404).json({ exito: false, mensaje: 'Servicio no encontrado.' });
        }

        if (servicio.estado === 'completado') {
            return res.status(409).json({ exito: false, mensaje: 'No se puede cancelar un servicio completado.' });
        }

        if (servicio.estado === 'cancelado') {
            return res.status(409).json({ exito: false, mensaje: 'El servicio ya está cancelado.' });
        }

        if (servicio.estado === 'asignado') {
            await liberarServicioAsignado(id);
        } else {
            await ejecutar(
                'UPDATE dbo.servicios SET estado = N\'cancelado\' WHERE id = @id',
                { id }
            );
        }

        const actualizado = await obtenerServicioAdmin(id);
        res.json({ exito: true, servicio: mapearServicioAdmin(actualizado) });
    } catch (error) {
        console.error('Error al cancelar servicio:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al cancelar el servicio.' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const servicio = await consultarUno(
            'SELECT * FROM dbo.servicios WHERE id = @id',
            { id }
        );

        if (!servicio) {
            return res.status(404).json({ exito: false, mensaje: 'Servicio no encontrado.' });
        }

        if (servicio.estado === 'asignado') {
            await liberarServicioAsignado(id);
        }

        if (servicio.estado === 'completado') {
            return res.status(409).json({
                exito: false,
                mensaje: 'No se puede eliminar un servicio completado. Use cancelar si aplica.'
            });
        }

        await ejecutar('DELETE FROM dbo.servicios WHERE id = @id', { id });

        res.json({ exito: true, mensaje: 'Servicio eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al eliminar el servicio.' });
    }
});

module.exports = router;
