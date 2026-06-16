document.addEventListener('DOMContentLoaded', () => {
    LayoutApp.inicializar('perfil');

    const formulario = document.getElementById('formulario-cambio-contrasena');
    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        boton.disabled = true;

        const actual = document.getElementById('contrasena-actual').value;
        const nueva = document.getElementById('contrasena-nueva').value;
        const confirmacion = document.getElementById('contrasena-confirmar').value;

        const resultado = await ServicioAutenticacion.cambiarContrasena(actual, nueva, confirmacion);

        if (resultado.exito) {
            mostrarMensaje('mensaje-cambio-contrasena', resultado.mensaje, 'exito');
            formulario.reset();
        } else {
            mostrarMensaje('mensaje-cambio-contrasena', resultado.mensaje, 'error');
        }

        boton.disabled = false;
    });
});
