document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('configuracion');

    const checkboxes = {
        notifServiciosCercanos: document.getElementById('notif-servicios'),
        notifConfirmacionPagos: document.getElementById('notif-pagos'),
        notifActualizacionesSistema: document.getElementById('notif-sistema'),
        notifRecordatoriosServicio: document.getElementById('notif-recordatorios')
    };

    const mensaje = document.getElementById('mensaje-configuracion');

    try {
        const preferencias = await ServicioPreferencias.obtenerPreferencias();
        checkboxes.notifServiciosCercanos.checked = preferencias.notifServiciosCercanos;
        checkboxes.notifConfirmacionPagos.checked = preferencias.notifConfirmacionPagos;
        checkboxes.notifActualizacionesSistema.checked = preferencias.notifActualizacionesSistema;
        checkboxes.notifRecordatoriosServicio.checked = preferencias.notifRecordatoriosServicio;
    } catch {
        mostrarMensaje('mensaje-configuracion', 'No se pudieron cargar las preferencias.', 'error');
    }

    Object.entries(checkboxes).forEach(([clave, input]) => {
        if (!input) return;
        input.disabled = false;
        input.addEventListener('change', async () => {
            try {
                const datos = {
                    notifServiciosCercanos: checkboxes.notifServiciosCercanos.checked,
                    notifConfirmacionPagos: checkboxes.notifConfirmacionPagos.checked,
                    notifActualizacionesSistema: checkboxes.notifActualizacionesSistema.checked,
                    notifRecordatoriosServicio: checkboxes.notifRecordatoriosServicio.checked
                };
                await ServicioPreferencias.actualizarPreferencias(datos);
                if (mensaje) {
                    mensaje.textContent = 'Preferencias guardadas.';
                    mensaje.className = 'mensaje-formulario mensaje-formulario--exito';
                    mensaje.hidden = false;
                }
            } catch {
                if (mensaje) {
                    mensaje.textContent = 'No se pudieron guardar las preferencias.';
                    mensaje.className = 'mensaje-formulario mensaje-formulario--error';
                    mensaje.hidden = false;
                }
            }
        });
    });
});
