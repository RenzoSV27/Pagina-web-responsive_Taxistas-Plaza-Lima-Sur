const ServicioAyuda = {
    async obtenerPreguntasFrecuentes() {
        return ApiCliente.get('/ayuda/faq');
    },

    async enviarMensajeSoporte(datos) {
        try {
            const autenticado = ServicioAutenticacion.estaAutenticado();
            const ruta = autenticado ? '/ayuda/soporte' : '/ayuda/soporte/publico';
            const resultado = await ApiCliente.post(ruta, datos);
            return { exito: true, mensaje: resultado.mensaje };
        } catch (error) {
            return { exito: false, mensaje: error.message };
        }
    }
};

const ServicioPreferencias = {
    async obtenerPreferencias() {
        return ApiCliente.get('/preferencias');
    },

    async actualizarPreferencias(datos) {
        const resultado = await ApiCliente.put('/preferencias', datos);
        return { exito: true, preferencias: resultado.preferencias };
    }
};
