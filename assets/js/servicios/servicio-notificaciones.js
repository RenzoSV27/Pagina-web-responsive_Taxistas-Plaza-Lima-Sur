const ServicioNotificaciones = {
    RETRASO_MS: 250,

    async simularRetraso() {
        return new Promise((resolver) => setTimeout(resolver, this.RETRASO_MS));
    },

    obtenerNotificacionesLocales() {
        const guardadas = Almacenamiento.obtener(Almacenamiento.CLAVES.NOTIFICACIONES);
        return guardadas || [...DATOS_EJEMPLO.notificaciones];
    },

    guardarNotificaciones(notificaciones) {
        Almacenamiento.guardar(Almacenamiento.CLAVES.NOTIFICACIONES, notificaciones);
    },

    async obtenerNotificaciones() {
        await this.simularRetraso();
        return this.obtenerNotificacionesLocales();
    },

    async marcarComoLeida(id) {
        await this.simularRetraso();
        const lista = this.obtenerNotificacionesLocales();
        const actualizada = lista.map((n) =>
            n.id === id ? { ...n, leida: true } : n
        );
        this.guardarNotificaciones(actualizada);
        return actualizada;
    },

    contarNoLeidas() {
        return this.obtenerNotificacionesLocales().filter((n) => !n.leida).length;
    }
};
