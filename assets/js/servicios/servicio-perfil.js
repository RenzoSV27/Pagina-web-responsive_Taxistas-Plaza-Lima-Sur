const ServicioPerfil = {
    async obtenerPerfil() {
        try {
            return await ApiCliente.get('/perfil');
        } catch (error) {
            throw error;
        }
    },

    async actualizarPerfil(datos) {
        try {
            const resultado = await ApiCliente.put('/perfil', datos);
            return { exito: true, perfil: resultado.perfil };
        } catch (error) {
            return { exito: false, mensaje: error.message };
        }
    }
};
