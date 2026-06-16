document.addEventListener('DOMContentLoaded', () => {
    if (ServicioAutenticacion.estaAutenticado()) {
        const raiz = document.body.dataset.rutaRaiz;
        window.location.href = `${raiz}modulos/panel/dashboard/dashboard.html`;
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
            const raiz = document.body.dataset.rutaRaiz;
            window.location.href = `${raiz}modulos/panel/dashboard/dashboard.html`;
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
