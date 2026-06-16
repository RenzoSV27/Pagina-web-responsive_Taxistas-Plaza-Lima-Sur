document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario-soporte');
    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        boton.disabled = true;

        const nombre = document.getElementById('nombre').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const asunto = document.getElementById('asunto').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        if (!nombre || !correo || !asunto || !mensaje) {
            const el = document.getElementById('mensaje-soporte');
            el.textContent = 'Completa todos los campos.';
            el.className = 'mensaje-formulario mensaje-formulario--error';
            el.hidden = false;
            boton.disabled = false;
            return;
        }

        const el = document.getElementById('mensaje-soporte');
        el.textContent = '¡Mensaje enviado! Nuestro equipo te responderá en un plazo de 24 horas hábiles.';
        el.className = 'mensaje-formulario mensaje-formulario--exito';
        el.hidden = false;
        formulario.reset();
        boton.disabled = false;
    });
});
