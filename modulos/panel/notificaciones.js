document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('notificaciones');
    await renderizarNotificaciones();
});

async function renderizarNotificaciones() {
    const notificaciones = await ServicioNotificaciones.obtenerNotificaciones();
    const noLeidas = notificaciones.filter((n) => !n.leida).length;
    const contador = document.getElementById('contador-notificaciones');

    if (contador) {
        contador.textContent = noLeidas > 0
            ? `${noLeidas} notificación${noLeidas !== 1 ? 'es' : ''} sin leer`
            : 'Todas las notificaciones están leídas';
    }

    const lista = document.getElementById('lista-notificaciones');
    if (!lista) return;

    if (notificaciones.length === 0) {
        lista.innerHTML = '<li class="mensaje-formulario mensaje-formulario--info">No tienes notificaciones.</li>';
        if (typeof Animaciones !== 'undefined') Animaciones.revelarContenido(lista);
        return;
    }

    lista.innerHTML = notificaciones.map((notif) => `
        <li>
            <button type="button" class="item-notificacion${notif.leida ? '' : ' item-notificacion--no-leida'}"
                data-id="${notif.id}" aria-label="${notif.titulo}">
                <span class="notificacion-icono" aria-hidden="true">${obtenerIcono(notif.tipo)}</span>
                <div class="notificacion-contenido">
                    <h4>${notif.titulo}</h4>
                    <p>${notif.mensaje}</p>
                    <span class="notificacion-fecha">${formatearFechaHora(notif.fecha)}</span>
                </div>
            </button>
        </li>`).join('');

    lista.querySelectorAll('.item-notificacion').forEach((boton) => {
        boton.addEventListener('click', async () => {
            const id = boton.dataset.id;
            if (!id) return;
            await ServicioNotificaciones.marcarComoLeida(id);
            await LayoutApp.actualizarBadgeNotificaciones();
            await renderizarNotificaciones();
        });
    });
}

function obtenerIcono(tipo) {
    const iconos = {
        servicio: '📋',
        pago: '💰',
        info: 'ℹ️',
        sistema: '⚙️'
    };
    return iconos[tipo] || '🔔';
}
