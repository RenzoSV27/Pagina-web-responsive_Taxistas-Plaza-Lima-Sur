const ServicioAdmin = {
    async obtenerResumen() {
        return ApiCliente.get('/admin/resumen');
    },

    async listarTaxistas() {
        return ApiCliente.get('/admin/taxistas');
    },

    async crearTaxista(datos) {
        return ApiCliente.post('/admin/taxistas', datos);
    },

    async actualizarTaxista(id, datos) {
        return ApiCliente.put(`/admin/taxistas/${id}`, datos);
    },

    async eliminarTaxista(id) {
        return ApiCliente.delete(`/admin/taxistas/${id}`);
    },

    async listarServicios(estado) {
        const query = estado ? `?estado=${encodeURIComponent(estado)}` : '';
        return ApiCliente.get(`/admin/servicios${query}`);
    },

    async crearServicio(datos) {
        return ApiCliente.post('/admin/servicios', datos);
    },

    async actualizarServicio(id, datos) {
        return ApiCliente.put(`/admin/servicios/${id}`, datos);
    },

    async cancelarServicio(id) {
        return ApiCliente.patch(`/admin/servicios/${id}/cancelar`, {});
    },

    async eliminarServicio(id) {
        return ApiCliente.delete(`/admin/servicios/${id}`);
    }
};
