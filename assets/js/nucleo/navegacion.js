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
        inicioSesion: '/modulos/autenticacion/inicio-sesion/inicio-sesion.html',
        registro: '/modulos/autenticacion/registro/registro.html',
        recuperarContrasena: '/modulos/autenticacion/recuperar-contrasena/recuperar-contrasena.html',
        terminos: '/modulos/legal/terminos-condiciones/terminos-condiciones.html',
        privacidad: '/modulos/legal/politica-privacidad/politica-privacidad.html',
        centroAyuda: '/modulos/ayuda/centro-ayuda/centro-ayuda.html',
        soporte: '/modulos/ayuda/soporte-contacto/soporte-contacto.html'
    },

    rutasPanel: {
        dashboard: '/modulos/panel/dashboard/dashboard.html',
        servicios: '/modulos/panel/servicios-disponibles/servicios-disponibles.html',
        detalleServicio: '/modulos/panel/detalle-servicio/detalle-servicio.html',
        servicioAceptado: '/modulos/panel/servicio-aceptado/servicio-aceptado.html',
        puntoRecogida: '/modulos/panel/punto-recogida/punto-recogida.html',
        confirmacionRecogida: '/modulos/panel/confirmacion-recogida/confirmacion-recogida.html',
        servicioEnCurso: '/modulos/panel/servicio-en-curso/servicio-en-curso.html',
        destinoEntrega: '/modulos/panel/destino-entrega/destino-entrega.html',
        confirmacionEntrega: '/modulos/panel/confirmacion-entrega/confirmacion-entrega.html',
        historial: '/modulos/panel/historial/historial.html',
        ganancias: '/modulos/panel/ganancias/ganancias.html',
        notificaciones: '/modulos/panel/notificaciones/notificaciones.html',
        perfil: '/modulos/perfil/perfil-taxista/perfil-taxista.html',
        editarPerfil: '/modulos/perfil/editar-perfil/editar-perfil.html',
        cambioContrasena: '/modulos/perfil/cambio-contrasena/cambio-contrasena.html',
        configuracion: '/modulos/configuracion/configuracion/configuracion.html'
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
