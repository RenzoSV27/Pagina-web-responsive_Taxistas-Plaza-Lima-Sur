const ServicioNotificaciones = {
    async obtenerNotificaciones() {
        return ApiCliente.get('/notificaciones');
    },

    async marcarComoLeida(id) {
        return ApiCliente.patch(`/notificaciones/${id}/leida`, {});
    },

    async contarNoLeidas() {
        try {
            const resultado = await ApiCliente.get('/notificaciones/no-leidas');
            return resultado.total;
        } catch {
            return 0;
        }
    }
};
