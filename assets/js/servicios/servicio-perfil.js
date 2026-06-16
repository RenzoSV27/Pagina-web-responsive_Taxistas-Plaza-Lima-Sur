const ServicioPerfil = {
    RETRASO_MS: 300,

    async simularRetraso() {
        return new Promise((resolver) => setTimeout(resolver, this.RETRASO_MS));
    },

    async obtenerPerfil() {
        await this.simularRetraso();
        const guardado = Almacenamiento.obtener(Almacenamiento.CLAVES.PERFIL);
        return guardado ? { ...DATOS_EJEMPLO.taxista, ...guardado } : { ...DATOS_EJEMPLO.taxista };
    },

    async actualizarPerfil(datos) {
        await this.simularRetraso();
        const actual = await this.obtenerPerfil();
        const actualizado = { ...actual, ...datos };
        Almacenamiento.guardar(Almacenamiento.CLAVES.PERFIL, {
            nombre: actualizado.nombre,
            telefono: actualizado.telefono,
            placa: actualizado.placa,
            vehiculo: actualizado.vehiculo
        });
        return { exito: true, perfil: actualizado };
    }
};
