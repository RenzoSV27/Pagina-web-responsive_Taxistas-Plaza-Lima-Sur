document.addEventListener('DOMContentLoaded', () => {
    if (typeof Animaciones !== 'undefined') Animaciones.autenticacion();

    if (ServicioAutenticacion.estaAutenticado()) {
        window.location.href = ServicioAutenticacion.obtenerRutaPanel();
        return;
    }

    const formulario = document.getElementById('formulario-login');
    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        boton.disabled = true;

        const correo = document.getElementById('correo').value.trim();
        const contrasena = document.getElementById('contrasena').value;

        const resultado = await ServicioAutenticacion.iniciarSesion(correo, contrasena);

        if (resultado.exito) {
            mostrarMensaje('mensaje-login', 'Ingresando...', 'exito');
            window.location.href = ServicioAutenticacion.obtenerRutaPanel();
        } else {
            mostrarMensaje('mensaje-login', resultado.mensaje, 'error');
            boton.disabled = false;
        }
    });
});

function mostrarMensaje(id, texto, tipo) {
    const el = document.getElementById(id);
    el.textContent = texto;
    el.className = `mensaje-formulario mensaje-formulario--${tipo}`;
    el.hidden = false;
}
