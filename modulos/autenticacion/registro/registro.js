document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario-registro');
    const boton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        boton.disabled = true;

        const datos = {
            nombre: document.getElementById('nombre').value.trim(),
            dni: document.getElementById('dni').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            placa: document.getElementById('placa').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            contrasena: document.getElementById('contrasena').value,
            aceptaTerminos: document.getElementById('acepta-terminos').checked
        };

        const resultado = await ServicioAutenticacion.registrarTaxista(datos);
        const mensaje = document.getElementById('mensaje-registro');

        if (resultado.exito) {
            mensaje.textContent = 'Cuenta creada. Redirigiendo...';
            mensaje.className = 'mensaje-formulario mensaje-formulario--exito';
            mensaje.hidden = false;
            const raiz = document.body.dataset.rutaRaiz;
            setTimeout(() => {
                window.location.href = `${raiz}modulos/panel/dashboard/dashboard.html`;
            }, 600);
        } else {
            mensaje.textContent = resultado.mensaje;
            mensaje.className = 'mensaje-formulario mensaje-formulario--error';
            mensaje.hidden = false;
            boton.disabled = false;
        }
    });
});
