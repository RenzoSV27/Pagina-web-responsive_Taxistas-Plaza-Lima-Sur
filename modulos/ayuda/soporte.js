document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario-soporte');
    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        boton.disabled = true;

        const nombre = document.getElementById('nombre').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const asunto = document.getElementById('asunto').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        const el = document.getElementById('mensaje-soporte');

        if (!nombre || !correo || !asunto || !mensaje) {
            el.textContent = 'Completa todos los campos.';
            el.className = 'mensaje-formulario mensaje-formulario--error';
            el.hidden = false;
            boton.disabled = false;
            return;
        }

        const resultado = await ServicioAyuda.enviarMensajeSoporte({ nombre, correo, asunto, mensaje });

        if (resultado.exito) {
            el.textContent = resultado.mensaje;
            el.className = 'mensaje-formulario mensaje-formulario--exito';
            el.hidden = false;
            formulario.reset();
        } else {
            el.textContent = resultado.mensaje;
            el.className = 'mensaje-formulario mensaje-formulario--error';
            el.hidden = false;
        }

        boton.disabled = false;
    });
});
