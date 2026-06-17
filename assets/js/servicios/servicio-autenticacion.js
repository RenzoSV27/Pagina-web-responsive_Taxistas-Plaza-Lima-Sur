const ServicioAutenticacion = {
    async iniciarSesion(correo, contrasena) {
        try {
            const resultado = await ApiCliente.post('/auth/login', { correo, contrasena });
            Almacenamiento.guardar(Almacenamiento.CLAVES.SESION, resultado.sesion);
            return { exito: true, sesion: resultado.sesion };
        } catch (error) {
            return { exito: false, mensaje: error.message };
        }
    },

    async registrarTaxista(datos) {
        if (!datos.nombre || !datos.correo || !datos.contrasena) {
            return { exito: false, mensaje: 'Completa todos los campos obligatorios.' };
        }

        try {
            const resultado = await ApiCliente.post('/auth/registro', {
                nombre: datos.nombre,
                dni: datos.dni,
                telefono: datos.telefono,
                placa: datos.placa,
                correo: datos.correo,
                contrasena: datos.contrasena,
                aceptaTerminos: datos.aceptaTerminos
            });
            Almacenamiento.guardar(Almacenamiento.CLAVES.SESION, resultado.sesion);
            return { exito: true, sesion: resultado.sesion };
        } catch (error) {
            return { exito: false, mensaje: error.message };
        }
    },

    async recuperarContrasena(correo) {
        if (!correo) {
            return { exito: false, mensaje: 'Ingresa tu correo electrónico.' };
        }

        try {
            const resultado = await ApiCliente.post('/auth/recuperar-contrasena', { correo });
            return { exito: true, mensaje: resultado.mensaje };
        } catch (error) {
            return { exito: false, mensaje: error.message };
        }
    },

    async cambiarContrasena(actual, nueva, confirmacion) {
        if (!actual || !nueva || !confirmacion) {
            return { exito: false, mensaje: 'Completa todos los campos.' };
        }
        if (nueva !== confirmacion) {
            return { exito: false, mensaje: 'Las contraseñas nuevas no coinciden.' };
        }
        if (nueva.length < 6) {
            return { exito: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' };
        }

        try {
            const resultado = await ApiCliente.post('/auth/cambiar-contrasena', {
                contrasenaActual: actual,
                contrasenaNueva: nueva,
                confirmacion
            });
            return { exito: true, mensaje: resultado.mensaje };
        } catch (error) {
            return { exito: false, mensaje: error.message };
        }
    },

    obtenerSesionActual() {
        return Almacenamiento.obtener(Almacenamiento.CLAVES.SESION);
    },

    estaAutenticado() {
        return Boolean(this.obtenerSesionActual()?.token);
    },

    async cerrarSesion() {
        try {
            if (this.estaAutenticado()) {
                await ApiCliente.post('/auth/logout', {});
            }
        } catch {
            // Ignorar errores al cerrar sesión en el servidor
        }
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
