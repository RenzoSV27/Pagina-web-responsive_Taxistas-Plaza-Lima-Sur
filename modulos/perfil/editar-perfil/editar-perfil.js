document.addEventListener('DOMContentLoaded', async () => {
    LayoutApp.inicializar('perfil');

    const perfil = await ServicioPerfil.obtenerPerfil();
    document.getElementById('nombre').value = perfil.nombre;
    document.getElementById('telefono').value = perfil.telefono;
    document.getElementById('placa').value = perfil.placa;
    document.getElementById('vehiculo').value = perfil.vehiculo;

    const formulario = document.getElementById('formulario-editar-perfil');
    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        boton.disabled = true;

        const datos = {
            nombre: document.getElementById('nombre').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            placa: document.getElementById('placa').value.trim(),
            vehiculo: document.getElementById('vehiculo').value.trim()
        };

        if (!datos.nombre || !datos.telefono || !datos.placa || !datos.vehiculo) {
            mostrarMensaje('mensaje-editar-perfil', 'Completa todos los campos.', 'error');
            boton.disabled = false;
            return;
        }

        const resultado = await ServicioPerfil.actualizarPerfil(datos);

        if (resultado.exito) {
            mostrarMensaje('mensaje-editar-perfil', 'Perfil actualizado. Redirigiendo…', 'exito');
            const raiz = document.body.dataset.rutaRaiz;
            setTimeout(() => {
                window.location.href = `${raiz}modulos/perfil/perfil-taxista/perfil-taxista.html`;
            }, 600);
        } else {
            mostrarMensaje('mensaje-editar-perfil', 'No se pudo actualizar el perfil.', 'error');
            boton.disabled = false;
        }
    });
});
