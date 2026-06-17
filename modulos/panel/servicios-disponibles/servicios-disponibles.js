document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('servicios');

    const servicios = await ServicioServicios.obtenerServiciosDisponibles();
    const contador = document.getElementById('contador-servicios');
    const rejilla = document.getElementById('rejilla-servicios');

    if (contador) {
        contador.textContent = `${servicios.length} servicio${servicios.length !== 1 ? 's' : ''} disponible${servicios.length !== 1 ? 's' : ''}`;
    }

    if (!rejilla) return;

    if (servicios.length === 0) {
        rejilla.innerHTML = '<p class="mensaje-formulario mensaje-formulario--info">No hay servicios disponibles en este momento.</p>';
        return;
    }

    rejilla.innerHTML = servicios.map((servicio) => `
        <a href="../detalle-servicio/detalle-servicio.html?id=${encodeURIComponent(servicio.id)}" class="tarjeta tarjeta-servicio">
            <div class="tarjeta-servicio-cabecera">
                <h3>${servicio.tienda}</h3>
                <span class="etiqueta-servicio${servicio.prioridad ? ' etiqueta-servicio--prioridad' : ''}">${servicio.prioridad ? 'Prioridad' : servicio.tipo}</span>
            </div>
            <ul class="lista-meta">
                <li>📍 ${servicio.origen} → ${servicio.destino}</li>
                <li>📦 ${servicio.producto} (${servicio.peso})</li>
                <li>🛣️ ${servicio.distancia} · ⏱️ ${servicio.tiempoEstimado}</li>
            </ul>
            <p class="tarifa">${formatearMoneda(servicio.tarifa)}</p>
        </a>`).join('');
});
