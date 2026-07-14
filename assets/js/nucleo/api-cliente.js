const ApiCliente = {
    async peticion(ruta, opciones = {}) {
        const sesion = Almacenamiento.obtener(Almacenamiento.CLAVES.SESION);
        const encabezados = {
            'Content-Type': 'application/json',
            ...(opciones.headers || {})
        };

        if (sesion?.token) {
            encabezados.Authorization = `Bearer ${sesion.token}`;
        }

        const respuesta = await fetch(`${ConfigApi.URL_BASE}${ruta}`, {
            ...opciones,
            headers: encabezados
        });

        let datos = null;
        const texto = await respuesta.text();
        if (texto) {
            try {
                datos = JSON.parse(texto);
            } catch {
                datos = texto;
            }
        }

        if (!respuesta.ok) {
            const mensaje = datos?.mensaje || 'Error en la solicitud.';
            const error = new Error(mensaje);
            error.estado = respuesta.status;
            error.datos = datos;
            throw error;
        }

        return datos;
    },

    get(ruta) {
        return this.peticion(ruta, { method: 'GET' });
    },

    post(ruta, cuerpo) {
        return this.peticion(ruta, {
            method: 'POST',
            body: JSON.stringify(cuerpo)
        });
    },

    put(ruta, cuerpo) {
        return this.peticion(ruta, {
            method: 'PUT',
            body: JSON.stringify(cuerpo)
        });
    },

    patch(ruta, cuerpo) {
        return this.peticion(ruta, {
            method: 'PATCH',
            body: JSON.stringify(cuerpo)
        });
    },

    delete(ruta) {
        return this.peticion(ruta, { method: 'DELETE' });
    }
};
