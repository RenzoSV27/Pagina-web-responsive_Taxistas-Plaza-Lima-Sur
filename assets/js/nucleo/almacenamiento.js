const Almacenamiento = {
    CLAVES: {
        SESION: 'taxi-plaza-sesion',
        SERVICIO_ACTIVO: 'taxi-plaza-servicio-activo',
        ACCESIBILIDAD: 'taxi-plaza-accesibilidad',
        NOTIFICACIONES: 'taxi-plaza-notificaciones',
        PERFIL: 'taxi-plaza-perfil'
    },

    obtener(clave) {
        try {
            const valor = localStorage.getItem(clave);
            return valor ? JSON.parse(valor) : null;
        } catch {
            return null;
        }
    },

    guardar(clave, valor) {
        localStorage.setItem(clave, JSON.stringify(valor));
    },

    eliminar(clave) {
        localStorage.removeItem(clave);
    },

    limpiarSesion() {
        this.eliminar(this.CLAVES.SESION);
        this.eliminar(this.CLAVES.SERVICIO_ACTIVO);
    }
};
