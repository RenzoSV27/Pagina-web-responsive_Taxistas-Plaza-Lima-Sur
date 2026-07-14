const express = require('express');
const { consultar, consultarUno, ejecutar, sql } = require('../config/db');
const {
    mapearServicio,
    mapearHistorial,
    mapearPago,
    capitalizarEstado,
    obtenerEtiquetaDia,
    formatearFecha
} = require('../utils/mappers');
const { autenticar, requiereTaxista } = require('../middleware/auth');

const router = express.Router();

router.use(autenticar, requiereTaxista);

const ETAPAS_VALIDAS = [
    'aceptado',
    'recogida',
    'confirmacion-recogida',
    'en-curso',
    'destino',
    'confirmacion-entrega'
];

async function obtenerServicioActivoCompleto(taxistaId) {
    const activo = await consultarUno(`
        SELECT
            sa.etapa,
            sa.actualizado_en AS activo_actualizado_en,
            s.id,
            s.tienda,
            s.tipo,
            s.prioridad,
            s.origen,
            s.destino,
            s.producto,
            s.peso,
            s.tarifa,
            s.distancia,
            s.tiempo_estimado,
            s.cliente,
            s.telefono_cliente,
            s.notas,
            s.latitud_recogida,
            s.longitud_recogida,
            s.latitud_entrega,
            s.longitud_entrega
        FROM dbo.servicios_activos sa
        INNER JOIN dbo.servicios s ON s.id = sa.servicio_id
        WHERE sa.taxista_id = @taxistaId
    `, { taxistaId });

    if (!activo) return null;

    const fechaActivo = activo.activo_actualizado_en || activo.actualizado_en;
    const actualizadoEn = fechaActivo && !Number.isNaN(new Date(fechaActivo).getTime())
        ? new Date(fechaActivo).toISOString()
        : new Date().toISOString();

    return {
        servicio: mapearServicio(activo),
        etapa: activo.etapa,
        actualizadoEn
    };
}

router.get('/disponibles', async (req, res) => {
    try {
        const filas = await consultar(`
            SELECT * FROM dbo.servicios
            WHERE estado = N'disponible'
            ORDER BY prioridad DESC, creado_en ASC
        `);
        res.json(filas.map(mapearServicio));
    } catch (error) {
        console.error('Error al listar servicios:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener servicios disponibles.' });
    }
});

router.get('/resumen-dia', async (req, res) => {
    try {
        const resumen = await consultarUno(`
            SELECT
                COUNT(*) AS servicios_hoy,
                SUM(CASE WHEN estado = N'completado' THEN 1 ELSE 0 END) AS completados,
                ISNULL(SUM(CASE WHEN estado = N'completado' THEN tarifa ELSE 0 END), 0) AS ganancias
            FROM dbo.historial_servicios
            WHERE taxista_id = @taxistaId AND fecha = CAST(GETDATE() AS DATE)
        `, { taxistaId: req.taxistaId });

        const taxista = await consultarUno(
            'SELECT estado FROM dbo.taxistas WHERE id = @id',
            { id: req.taxistaId }
        );

        res.json({
            serviciosHoy: resumen?.servicios_hoy || 0,
            completados: resumen?.completados || 0,
            ganancias: Number(resumen?.ganancias || 0),
            estado: capitalizarEstado(taxista?.estado)
        });
    } catch (error) {
        console.error('Error en resumen del día:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener el resumen del día.' });
    }
});

router.get('/historial', async (req, res) => {
    try {
        const filas = await consultar(`
            SELECT * FROM dbo.historial_servicios
            WHERE taxista_id = @taxistaId
            ORDER BY fecha DESC, id DESC
        `, { taxistaId: req.taxistaId });
        res.json(filas.map(mapearHistorial));
    } catch (error) {
        console.error('Error en historial:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener el historial.' });
    }
});

router.get('/ganancias', async (req, res) => {
    try {
        const taxistaId = req.taxistaId;

        const totales = await consultarUno(`
            SELECT
                ISNULL(SUM(CASE WHEN h.fecha = CAST(GETDATE() AS DATE) AND h.estado = N'completado' THEN h.tarifa ELSE 0 END), 0) AS hoy,
                ISNULL(SUM(CASE WHEN h.fecha >= DATEADD(DAY, -6, CAST(GETDATE() AS DATE)) AND h.estado = N'completado' THEN h.tarifa ELSE 0 END), 0) AS semana,
                ISNULL(SUM(CASE WHEN YEAR(h.fecha) = YEAR(GETDATE()) AND MONTH(h.fecha) = MONTH(GETDATE()) AND h.estado = N'completado' THEN h.tarifa ELSE 0 END), 0) AS mes
            FROM dbo.historial_servicios h
            WHERE h.taxista_id = @taxistaId
        `, { taxistaId });

        const pendiente = await consultarUno(`
            SELECT ISNULL(SUM(monto), 0) AS total
            FROM dbo.pagos
            WHERE taxista_id = @taxistaId AND estado = N'pendiente'
        `, { taxistaId });

        const desgloseFilas = await consultar(`
            SELECT h.fecha, ISNULL(SUM(h.tarifa), 0) AS monto
            FROM dbo.historial_servicios h
            WHERE h.taxista_id = @taxistaId
              AND h.estado = N'completado'
              AND h.fecha >= DATEADD(DAY, -6, CAST(GETDATE() AS DATE))
            GROUP BY h.fecha
            ORDER BY h.fecha ASC
        `, { taxistaId });

        const mapaDesglose = {};
        desgloseFilas.forEach((fila) => {
            mapaDesglose[formatearFecha(fila.fecha)] = Number(fila.monto);
        });

        const desgloseSemanal = [];
        for (let i = 6; i >= 0; i--) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - i);
            const clave = formatearFecha(fecha);
            desgloseSemanal.push({
                dia: obtenerEtiquetaDia(fecha),
                monto: mapaDesglose[clave] || 0
            });
        }

        const pagos = await consultar(`
            SELECT TOP 10 fecha, monto, metodo
            FROM dbo.pagos
            WHERE taxista_id = @taxistaId AND estado = N'procesado'
            ORDER BY fecha DESC
        `, { taxistaId });

        res.json({
            hoy: Number(totales?.hoy || 0),
            semana: Number(totales?.semana || 0),
            mes: Number(totales?.mes || 0),
            pendientePago: Number(pendiente?.total || 0),
            desgloseSemanal,
            ultimosPagos: pagos.map(mapearPago)
        });
    } catch (error) {
        console.error('Error en ganancias:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener las ganancias.' });
    }
});

router.get('/activo', async (req, res) => {
    try {
        const activo = await obtenerServicioActivoCompleto(req.taxistaId);
        res.json(activo);
    } catch (error) {
        console.error('Error al obtener servicio activo:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener el servicio activo.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const servicio = await consultarUno(
            'SELECT * FROM dbo.servicios WHERE id = @id',
            { id: Number(req.params.id) }
        );

        if (!servicio) {
            return res.status(404).json(null);
        }

        res.json(mapearServicio(servicio));
    } catch (error) {
        console.error('Error al obtener detalle:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener el servicio.' });
    }
});

router.post('/:id/aceptar', async (req, res) => {
    const taxistaId = req.taxistaId;
    const servicioId = Number(req.params.id);

    try {
        const activoExistente = await consultarUno(
            'SELECT id FROM dbo.servicios_activos WHERE taxista_id = @taxistaId',
            { taxistaId }
        );

        if (activoExistente) {
            return res.status(409).json({ exito: false, mensaje: 'Ya tienes un servicio activo.' });
        }

        const servicio = await consultarUno(
            'SELECT * FROM dbo.servicios WHERE id = @id AND estado = N\'disponible\'',
            { id: servicioId }
        );

        if (!servicio) {
            return res.status(404).json({ exito: false, mensaje: 'Servicio no encontrado.' });
        }

        await ejecutar(`
            UPDATE dbo.servicios
            SET estado = N'asignado', taxista_id = @taxistaId
            WHERE id = @servicioId AND estado = N'disponible'
        `, { taxistaId, servicioId });

        await ejecutar(`
            INSERT INTO dbo.servicios_activos (servicio_id, taxista_id, etapa)
            VALUES (@servicioId, @taxistaId, N'aceptado')
        `, { servicioId, taxistaId });

        await ejecutar(
            'UPDATE dbo.taxistas SET estado = N\'ocupado\' WHERE id = @taxistaId',
            { taxistaId }
        );

        await ejecutar(`
            INSERT INTO dbo.notificaciones (taxista_id, titulo, mensaje, tipo)
            VALUES (@taxistaId, N'Servicio aceptado', @mensaje, N'servicio')
        `, { taxistaId, mensaje: `Has aceptado un servicio de ${servicio.tienda}.` });

        const servicioActualizado = await consultarUno(
            'SELECT * FROM dbo.servicios WHERE id = @id',
            { id: servicioId }
        );
        res.json({ exito: true, servicio: mapearServicio(servicioActualizado) });
    } catch (error) {
        console.error('Error al aceptar servicio:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al aceptar el servicio.' });
    }
});

router.patch('/activo/etapa', async (req, res) => {
    try {
        const { etapa } = req.body;

        if (!ETAPAS_VALIDAS.includes(etapa)) {
            return res.status(400).json({ exito: false, mensaje: 'Etapa no válida.' });
        }

        const activo = await consultarUno(
            'SELECT id FROM dbo.servicios_activos WHERE taxista_id = @taxistaId',
            { taxistaId: req.taxistaId }
        );

        if (!activo) {
            return res.status(404).json({ exito: false, mensaje: 'No hay servicio activo.' });
        }

        await ejecutar(`
            UPDATE dbo.servicios_activos SET etapa = @etapa WHERE taxista_id = @taxistaId
        `, { etapa, taxistaId: req.taxistaId });

        const resultado = await obtenerServicioActivoCompleto(req.taxistaId);
        res.json(resultado);
    } catch (error) {
        console.error('Error al avanzar etapa:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar la etapa.' });
    }
});

router.post('/activo/confirmar-recogida', async (req, res) => {
    try {
        const activo = await consultarUno(
            'SELECT id FROM dbo.servicios_activos WHERE taxista_id = @taxistaId',
            { taxistaId: req.taxistaId }
        );

        if (!activo) {
            return res.status(404).json({ exito: false, mensaje: 'No hay servicio activo.' });
        }

        await ejecutar(`
            UPDATE dbo.servicios_activos SET etapa = N'en-curso' WHERE taxista_id = @taxistaId
        `, { taxistaId: req.taxistaId });

        const resultado = await obtenerServicioActivoCompleto(req.taxistaId);
        res.json(resultado);
    } catch (error) {
        console.error('Error al confirmar recogida:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al confirmar la recogida.' });
    }
});

router.post('/activo/confirmar-entrega', async (req, res) => {
    const taxistaId = req.taxistaId;

    try {
        const activo = await consultarUno(`
            SELECT sa.id AS activo_id, sa.servicio_id, sa.etapa,
                   s.tienda, s.destino, s.tarifa
            FROM dbo.servicios_activos sa
            INNER JOIN dbo.servicios s ON s.id = sa.servicio_id
            WHERE sa.taxista_id = @taxistaId
        `, { taxistaId });

        if (!activo) {
            return res.status(404).json({ exito: false, mensaje: 'No hay servicio activo.' });
        }

        const servicio = await consultarUno(
            'SELECT * FROM dbo.servicios WHERE id = @id',
            { id: activo.servicio_id }
        );

        await ejecutar(`
            UPDATE dbo.servicios SET estado = N'completado' WHERE id = @servicioId
        `, { servicioId: activo.servicio_id });

        await ejecutar(`
            INSERT INTO dbo.historial_servicios (taxista_id, servicio_id, fecha, tienda, destino, tarifa, estado, completado_en)
            VALUES (@taxistaId, @servicioId, CAST(GETDATE() AS DATE), @tienda, @destino, @tarifa, N'completado', SYSDATETIME())
        `, {
            taxistaId,
            servicioId: activo.servicio_id,
            tienda: activo.tienda,
            destino: activo.destino,
            tarifa: activo.tarifa
        });

        await ejecutar(
            'DELETE FROM dbo.servicios_activos WHERE taxista_id = @taxistaId',
            { taxistaId }
        );

        await ejecutar(`
            UPDATE dbo.taxistas
            SET estado = N'disponible', viajes_totales = viajes_totales + 1
            WHERE id = @taxistaId
        `, { taxistaId });

        await ejecutar(`
            INSERT INTO dbo.notificaciones (taxista_id, titulo, mensaje, tipo)
            VALUES (@taxistaId, N'Servicio completado', @mensaje, N'info')
        `, { taxistaId, mensaje: `Entrega en ${activo.destino} finalizada correctamente.` });

        res.json({ exito: true, servicio: mapearServicio(servicio) });
    } catch (error) {
        console.error('Error al confirmar entrega:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al confirmar la entrega.' });
    }
});

module.exports = router;
