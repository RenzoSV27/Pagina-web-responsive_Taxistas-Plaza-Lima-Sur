const ServicioServicios = {
    ETAPAS: {
        ACEPTADO: 'aceptado',
        RECOGIDA: 'recogida',
        CONFIRMACION_RECOGIDA: 'confirmacion-recogida',
        EN_CURSO: 'en-curso',
        DESTINO: 'destino',
        CONFIRMACION_ENTREGA: 'confirmacion-entrega',
        COMPLETADO: 'completado'
    },

    async obtenerServiciosDisponibles() {
        return ApiCliente.get('/servicios/disponibles');
    },

    async obtenerDetalleServicio(id) {
        try {
            return await ApiCliente.get(`/servicios/${id}`);
        } catch (error) {
            if (error.estado === 404) return null;
            throw error;
        }
    },

    async obtenerResumenDia() {
        return ApiCliente.get('/servicios/resumen-dia');
    },

    async obtenerHistorial() {
        return ApiCliente.get('/servicios/historial');
    },

    async obtenerGanancias() {
        return ApiCliente.get('/servicios/ganancias');
    },

    _guardarCacheActivo(activo) {
        if (activo) {
            Almacenamiento.guardar(Almacenamiento.CLAVES.SERVICIO_ACTIVO, activo);
        } else {
            Almacenamiento.eliminar(Almacenamiento.CLAVES.SERVICIO_ACTIVO);
        }
    },

    async obtenerServicioActivo() {
        try {
            const activo = await ApiCliente.get('/servicios/activo');
            this._guardarCacheActivo(activo);
            return activo;
        } catch {
            this._guardarCacheActivo(null);
            return null;
        }
    },

    async aceptarServicio(id) {
        try {
            const resultado = await ApiCliente.post(`/servicios/${id}/aceptar`, {});
            const activo = {
                servicio: resultado.servicio,
                etapa: this.ETAPAS.ACEPTADO,
                actualizadoEn: new Date().toISOString()
            };
            this._guardarCacheActivo(activo);
            return { exito: true, servicio: resultado.servicio };
        } catch (error) {
            return { exito: false, mensaje: error.message };
        }
    },

    async avanzarEtapa(etapa) {
        const activo = await ApiCliente.patch('/servicios/activo/etapa', { etapa });
        this._guardarCacheActivo(activo);
        return activo;
    },

    async confirmarRecogida() {
        const activo = await ApiCliente.post('/servicios/activo/confirmar-recogida', {});
        this._guardarCacheActivo(activo);
        return activo;
    },

    async confirmarEntrega() {
        try {
            const resultado = await ApiCliente.post('/servicios/activo/confirmar-entrega', {});
            this._guardarCacheActivo(null);
            return { exito: true, servicio: resultado.servicio };
        } catch (error) {
            return { exito: false, mensaje: error.message };
        }
    },

    async requerirServicioActivo(etapasPermitidas) {
        const activo = await this.obtenerServicioActivo();
        if (!activo) {
            const raiz = document.body?.dataset.rutaRaiz || '';
            window.location.href = `${raiz}modulos/panel/servicios-disponibles/servicios-disponibles.html`;
            return null;
        }
        if (etapasPermitidas && !etapasPermitidas.includes(activo.etapa)) {
            return null;
        }
        return activo;
    },

    obtenerUrlEtapa(etapa) {
        const raiz = document.body?.dataset.rutaRaiz || '';
        const rutas = {
            [this.ETAPAS.ACEPTADO]: 'modulos/panel/servicio-aceptado/servicio-aceptado.html',
            [this.ETAPAS.RECOGIDA]: 'modulos/panel/punto-recogida/punto-recogida.html',
            [this.ETAPAS.CONFIRMACION_RECOGIDA]: 'modulos/panel/confirmacion-recogida/confirmacion-recogida.html',
            [this.ETAPAS.EN_CURSO]: 'modulos/panel/servicio-en-curso/servicio-en-curso.html',
            [this.ETAPAS.DESTINO]: 'modulos/panel/destino-entrega/destino-entrega.html',
            [this.ETAPAS.CONFIRMACION_ENTREGA]: 'modulos/panel/confirmacion-entrega/confirmacion-entrega.html'
        };
        return `${raiz}${rutas[etapa] || 'modulos/panel/servicios-disponibles/servicios-disponibles.html'}`;
    },

    async redirigirAServicioActivo() {
        const actual = await this.obtenerServicioActivo();
        if (!actual) return false;
        window.location.href = this.obtenerUrlEtapa(actual.etapa);
        return true;
    },

    obtenerProgresoEtapa(etapa) {
        const orden = [
            this.ETAPAS.ACEPTADO,
            this.ETAPAS.RECOGIDA,
            this.ETAPAS.CONFIRMACION_RECOGIDA,
            this.ETAPAS.EN_CURSO,
            this.ETAPAS.DESTINO,
            this.ETAPAS.CONFIRMACION_ENTREGA
        ];
        const indice = orden.indexOf(etapa);
        return indice >= 0 ? Math.round(((indice + 1) / orden.length) * 100) : 0;
    }
};
