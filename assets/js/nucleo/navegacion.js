const Navegacion = {
    obtenerParametro(nombre) {
        const parametros = new URLSearchParams(window.location.search);
        return parametros.get(nombre);
    },

    irA(ruta) {
        window.location.href = ruta;
    },

    rutasPublicas: {
        landing: '/index.html',
        inicioSesion: '/modulos/autenticacion/login.html',
        registro: '/modulos/autenticacion/registro.html',
        recuperarContrasena: '/modulos/autenticacion/recuperar.html',
        terminos: '/modulos/legal/terminos.html',
        privacidad: '/modulos/legal/privacidad.html',
        centroAyuda: '/modulos/ayuda/centro-ayuda.html',
        soporte: '/modulos/ayuda/soporte.html'
    },

    rutasPanel: {
        dashboard: '/modulos/panel/dashboard.html',
        servicios: '/modulos/panel/servicios.html',
        detalleServicio: '/modulos/panel/servicio/detalle.html',
        servicioAceptado: '/modulos/panel/servicio/aceptado.html',
        puntoRecogida: '/modulos/panel/servicio/recogida.html',
        confirmacionRecogida: '/modulos/panel/servicio/confirmacion-recogida.html',
        servicioEnCurso: '/modulos/panel/servicio/en-curso.html',
        destinoEntrega: '/modulos/panel/servicio/destino.html',
        confirmacionEntrega: '/modulos/panel/servicio/confirmacion-entrega.html',
        historial: '/modulos/panel/historial.html',
        ganancias: '/modulos/panel/ganancias.html',
        notificaciones: '/modulos/panel/notificaciones.html',
        perfil: '/modulos/perfil/perfil.html',
        editarPerfil: '/modulos/perfil/editar.html',
        cambioContrasena: '/modulos/perfil/contrasena.html',
        configuracion: '/modulos/configuracion/configuracion.html'
    },

    irADetalleServicio(id) {
        this.irA(`${this.rutasPanel.detalleServicio}?id=${encodeURIComponent(id)}`);
    },

    resolverRuta(rutaAbsoluta) {
        if (rutaAbsoluta.startsWith('/')) {
            const segmentos = window.location.pathname.split('/');
            const profundidad = segmentos.filter(Boolean).length;
            const prefijo = profundidad > 0 ? '../'.repeat(profundidad) : '';
            return prefijo + rutaAbsoluta.slice(1);
        }
        return rutaAbsoluta;
    }
};
