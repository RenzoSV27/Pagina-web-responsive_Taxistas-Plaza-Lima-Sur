const ServicioAutenticacion = {
    RETRASO_MS: 400,

    async simularRetraso() {
        return new Promise((resolver) => setTimeout(resolver, this.RETRASO_MS));
    },

    async iniciarSesion(correo, contrasena) {
        await this.simularRetraso();
        const demo = DATOS_EJEMPLO.credencialesDemo;
        if (correo === demo.correo && contrasena === demo.contrasena) {
            const sesion = {
                taxistaId: DATOS_EJEMPLO.taxista.id,
                correo,
                nombre: DATOS_EJEMPLO.taxista.nombre,
                iniciadaEn: new Date().toISOString()
            };
            Almacenamiento.guardar(Almacenamiento.CLAVES.SESION, sesion);
            return { exito: true, sesion };
        }
        return { exito: false, mensaje: 'Correo o contraseña incorrectos.' };
    },

    async registrarTaxista(datos) {
        await this.simularRetraso();
        if (!datos.nombre || !datos.correo || !datos.contrasena) {
            return { exito: false, mensaje: 'Completa todos los campos obligatorios.' };
        }
        const sesion = {
            taxistaId: 'tx-nuevo',
            correo: datos.correo,
            nombre: datos.nombre,
            iniciadaEn: new Date().toISOString()
        };
        Almacenamiento.guardar(Almacenamiento.CLAVES.SESION, sesion);
        return { exito: true, sesion };
    },

    async recuperarContrasena(correo) {
        await this.simularRetraso();
        if (!correo) {
            return { exito: false, mensaje: 'Ingresa tu correo electrónico.' };
        }
        return { exito: true, mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.' };
    },

    async cambiarContrasena(actual, nueva, confirmacion) {
        await this.simularRetraso();
        if (!actual || !nueva || !confirmacion) {
            return { exito: false, mensaje: 'Completa todos los campos.' };
        }
        if (nueva !== confirmacion) {
            return { exito: false, mensaje: 'Las contraseñas nuevas no coinciden.' };
        }
        if (nueva.length < 6) {
            return { exito: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' };
        }
        return { exito: true, mensaje: 'Contraseña actualizada correctamente.' };
    },

    obtenerSesionActual() {
        return Almacenamiento.obtener(Almacenamiento.CLAVES.SESION);
    },

    estaAutenticado() {
        return Boolean(this.obtenerSesionActual());
    },

    cerrarSesion() {
        Almacenamiento.limpiarSesion();
        const raiz = document.body?.dataset.rutaRaiz || '';
        window.location.href = `${raiz}index.html`;
    },

    requerirSesion() {
        if (!this.estaAutenticado()) {
            const raiz = document.body?.dataset.rutaRaiz || '';
            window.location.href = `${raiz}modulos/autenticacion/inicio-sesion/inicio-sesion.html`;
            return false;
        }
        return true;
    }
};
