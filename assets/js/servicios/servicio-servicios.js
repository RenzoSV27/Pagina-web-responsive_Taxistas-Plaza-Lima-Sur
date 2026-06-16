const ServicioServicios = {
    RETRASO_MS: 300,
    ETAPAS: {
        ACEPTADO: 'aceptado',
        RECOGIDA: 'recogida',
        CONFIRMACION_RECOGIDA: 'confirmacion-recogida',
        EN_CURSO: 'en-curso',
        DESTINO: 'destino',
        CONFIRMACION_ENTREGA: 'confirmacion-entrega',
        COMPLETADO: 'completado'
    },

    async simularRetraso() {
        return new Promise((resolver) => setTimeout(resolver, this.RETRASO_MS));
    },

    async obtenerServiciosDisponibles() {
        await this.simularRetraso();
        return [...DATOS_EJEMPLO.serviciosDisponibles];
    },

    async obtenerDetalleServicio(id) {
        await this.simularRetraso();
        return DATOS_EJEMPLO.serviciosDisponibles.find((s) => s.id === id) || null;
    },

    async obtenerResumenDia() {
        await this.simularRetraso();
        return { ...DATOS_EJEMPLO.resumenDia };
    },

    async obtenerHistorial() {
        await this.simularRetraso();
        return [...DATOS_EJEMPLO.historial];
    },

    async obtenerGanancias() {
        await this.simularRetraso();
        return { ...DATOS_EJEMPLO.ganancias };
    },

    obtenerServicioActivo() {
        return Almacenamiento.obtener(Almacenamiento.CLAVES.SERVICIO_ACTIVO);
    },

    guardarServicioActivo(servicio, etapa) {
        Almacenamiento.guardar(Almacenamiento.CLAVES.SERVICIO_ACTIVO, {
            servicio,
            etapa,
            actualizadoEn: new Date().toISOString()
        });
    },

    async aceptarServicio(id) {
        await this.simularRetraso();
        const servicio = await this.obtenerDetalleServicio(id);
        if (!servicio) {
            return { exito: false, mensaje: 'Servicio no encontrado.' };
        }
        this.guardarServicioActivo(servicio, this.ETAPAS.ACEPTADO);
        return { exito: true, servicio };
    },

    avanzarEtapa(etapa) {
        const activo = this.obtenerServicioActivo();
        if (!activo) return null;
        this.guardarServicioActivo(activo.servicio, etapa);
        return this.obtenerServicioActivo();
    },

    async confirmarRecogida() {
        await this.simularRetraso();
        return this.avanzarEtapa(this.ETAPAS.EN_CURSO);
    },

    async confirmarEntrega() {
        await this.simularRetraso();
        const activo = this.obtenerServicioActivo();
        if (!activo) return { exito: false, mensaje: 'No hay servicio activo.' };
        Almacenamiento.eliminar(Almacenamiento.CLAVES.SERVICIO_ACTIVO);
        return { exito: true, servicio: activo.servicio };
    },

    requerirServicioActivo(etapasPermitidas) {
        const activo = this.obtenerServicioActivo();
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

    redirigirAServicioActivo() {
        const actual = this.obtenerServicioActivo();
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
