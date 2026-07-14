function mapearTaxista(fila) {
    if (!fila) return null;
    return {
        id: String(fila.id),
        nombre: fila.nombre,
        dni: fila.dni,
        telefono: fila.telefono,
        correo: fila.correo,
        placa: fila.placa,
        vehiculo: fila.vehiculo,
        licencia: fila.licencia,
        calificacion: Number(fila.calificacion),
        viajesTotales: fila.viajes_totales,
        fotoUrl: fila.foto_url,
        estado: fila.estado,
        fechaRegistro: formatearFecha(fila.fecha_registro)
    };
}

function mapearServicio(fila) {
    if (!fila) return null;
    return {
        id: String(fila.id),
        tienda: fila.tienda,
        tipo: fila.tipo,
        prioridad: Boolean(fila.prioridad),
        origen: fila.origen,
        destino: fila.destino,
        producto: fila.producto,
        peso: fila.peso,
        tarifa: Number(fila.tarifa),
        distancia: fila.distancia,
        tiempoEstimado: fila.tiempo_estimado,
        cliente: fila.cliente,
        telefonoCliente: fila.telefono_cliente,
        notas: fila.notas || '',
        coordenadasRecogida: {
            lat: Number(fila.latitud_recogida),
            lng: Number(fila.longitud_recogida)
        },
        coordenadasEntrega: {
            lat: Number(fila.latitud_entrega),
            lng: Number(fila.longitud_entrega)
        }
    };
}

function mapearServicioAdmin(fila) {
    if (!fila) return null;
    return {
        ...mapearServicio(fila),
        estado: fila.estado,
        taxistaId: fila.taxista_id ? String(fila.taxista_id) : null,
        taxistaNombre: fila.taxista_nombre || null,
        creadoEn: fila.creado_en ? new Date(fila.creado_en).toISOString() : null,
        actualizadoEn: fila.actualizado_en ? new Date(fila.actualizado_en).toISOString() : null
    };
}

function mapearHistorial(fila) {
    return {
        id: String(fila.id),
        fecha: formatearFecha(fila.fecha),
        destino: fila.destino,
        tarifa: Number(fila.tarifa),
        estado: fila.estado,
        tienda: fila.tienda
    };
}

function mapearNotificacion(fila) {
    return {
        id: String(fila.id),
        titulo: fila.titulo,
        mensaje: fila.mensaje,
        tipo: fila.tipo,
        leida: Boolean(fila.leida),
        fecha: new Date(fila.fecha).toISOString()
    };
}

function mapearPago(fila) {
    return {
        fecha: formatearFecha(fila.fecha),
        monto: Number(fila.monto),
        metodo: fila.metodo
    };
}

function mapearPreferencias(fila) {
    if (!fila) {
        return {
            notifServiciosCercanos: true,
            notifConfirmacionPagos: true,
            notifActualizacionesSistema: false,
            notifRecordatoriosServicio: true
        };
    }
    return {
        notifServiciosCercanos: Boolean(fila.notif_servicios_cercanos),
        notifConfirmacionPagos: Boolean(fila.notif_confirmacion_pagos),
        notifActualizacionesSistema: Boolean(fila.notif_actualizaciones_sistema),
        notifRecordatoriosServicio: Boolean(fila.notif_recordatorios_servicio)
    };
}

function formatearFecha(valor) {
    if (!valor) return null;
    if (valor instanceof Date) {
        return valor.toISOString().split('T')[0];
    }
    return String(valor).split('T')[0];
}

function capitalizarEstado(estado) {
    if (!estado) return 'Disponible';
    return estado.charAt(0).toUpperCase() + estado.slice(1);
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function obtenerEtiquetaDia(fecha) {
    const d = new Date(fecha);
    return DIAS_SEMANA[d.getDay()];
}

module.exports = {
    mapearTaxista,
    mapearServicio,
    mapearServicioAdmin,
    mapearHistorial,
    mapearNotificacion,
    mapearPago,
    mapearPreferencias,
    capitalizarEstado,
    obtenerEtiquetaDia,
    formatearFecha
};
