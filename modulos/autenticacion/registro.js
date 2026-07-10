document.addEventListener('DOMContentLoaded', () => {
    if (typeof Animaciones !== 'undefined') Animaciones.autenticacion();

    const formulario = document.getElementById('formulario-registro');
    const boton = formulario.querySelector('button[type="submit"]');
    const mensaje = document.getElementById('mensaje-registro');

    const mostrarMensaje = (texto, tipo = 'error') => {
        mensaje.textContent = texto;
        mensaje.className = `mensaje-formulario mensaje-formulario--${tipo}`;
        mensaje.hidden = false;
    };

    const limpiarErrores = () => {
        document.querySelectorAll('.grupo-campo input').forEach((input) => {
            input.classList.remove('input-error');
        });
    };

    const marcarCampo = (input) => {
        input.classList.add('input-error');
        input.focus();
    };

    const validarFormulario = () => {
        const nombre = document.getElementById('nombre').value.trim();
        const dni = document.getElementById('dni').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const placa = document.getElementById('placa').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const contrasena = document.getElementById('contrasena').value;
        const aceptaTerminos = document.getElementById('acepta-terminos').checked;

        limpiarErrores();

        if (nombre.length < 2) {
            marcarCampo(document.getElementById('nombre'));
            return 'Ingresa tu nombre completo.';
        }

        if (!/^\d{8}$/.test(dni)) {
            marcarCampo(document.getElementById('dni'));
            return 'El DNI debe tener 8 dígitos.';
        }

        if (!/^\+?\d{7,15}$/.test(telefono.replace(/\s+/g, ''))) {
            marcarCampo(document.getElementById('telefono'));
            return 'Ingresa un teléfono válido.';
        }

        if (!/^[A-Za-z0-9-]{3,8}$/.test(placa)) {
            marcarCampo(document.getElementById('placa'));
            return 'La placa debe tener un formato válido, por ejemplo ABC-123.';
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            marcarCampo(document.getElementById('correo'));
            return 'Ingresa un correo electrónico válido.';
        }

        if (contrasena.length < 6) {
            marcarCampo(document.getElementById('contrasena'));
            return 'La contraseña debe tener al menos 6 caracteres.';
        }

        if (!aceptaTerminos) {
            marcarCampo(document.getElementById('acepta-terminos'));
            return 'Debes aceptar los términos y condiciones para continuar.';
        }

        return null;
    };

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        mensaje.hidden = true;
        boton.disabled = true;

        const error = validarFormulario();
        if (error) {
            mostrarMensaje(error, 'error');
            boton.disabled = false;
            return;
        }

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

        if (resultado.exito) {
            mostrarMensaje('Cuenta creada. Redirigiendo...', 'exito');
            const raiz = document.body.dataset.rutaRaiz;
            setTimeout(() => {
                window.location.href = `${raiz}modulos/panel/dashboard.html`;
            }, 600);
        } else {
            mostrarMensaje(resultado.mensaje, 'error');
            boton.disabled = false;
        }
    });
});
