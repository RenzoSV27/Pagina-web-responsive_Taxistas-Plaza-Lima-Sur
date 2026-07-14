document.addEventListener('DOMContentLoaded', () => {
    if (typeof Animaciones !== 'undefined') Animaciones.autenticacion();

    const formulario = document.getElementById('formulario-recuperar');
    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        boton.disabled = true;

        const correo = document.getElementById('correo').value.trim();
        const resultado = await ServicioAutenticacion.recuperarContrasena(correo);
        const mensaje = document.getElementById('mensaje-recuperar');

        mensaje.textContent = resultado.mensaje;
        mensaje.className = `mensaje-formulario mensaje-formulario--${resultado.exito ? 'exito' : 'error'}`;
        mensaje.hidden = false;
        boton.disabled = false;
    });
});
