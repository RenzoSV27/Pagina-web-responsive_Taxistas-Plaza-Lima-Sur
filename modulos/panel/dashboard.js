document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('dashboard');

    const parametroExito = Navegacion.obtenerParametro('exito');
    if (parametroExito === 'entrega') {
        mostrarMensaje('mensaje-dashboard', '¡Entrega confirmada! El servicio se completó correctamente.', 'exito');
    }

    try {
        const resumen = await ServicioServicios.obtenerResumenDia();
        const rejilla = document.getElementById('rejilla-estadisticas');
        if (rejilla) {
            rejilla.innerHTML = `
            <div class="col">
            <article class="tarjeta tarjeta-estadistica estadistica--azul h-100">
                <span class="estadistica-icono" aria-hidden="true">📋</span>
                <h3>Servicios hoy</h3>
                <span class="estadistica-valor">${resumen.serviciosHoy}</span>
            </article>
            </div>
            <div class="col">
            <article class="tarjeta tarjeta-estadistica estadistica--verde h-100">
                <span class="estadistica-icono" aria-hidden="true">✅</span>
                <h3>Completados</h3>
                <span class="estadistica-valor">${resumen.completados}</span>
            </article>
            </div>
            <div class="col">
            <article class="tarjeta tarjeta-estadistica estadistica--ambar h-100">
                <span class="estadistica-icono" aria-hidden="true">💰</span>
                <h3>Ganancias</h3>
                <span class="estadistica-valor">${formatearMoneda(resumen.ganancias)}</span>
            </article>
            </div>
            <div class="col">
            <article class="tarjeta tarjeta-estadistica estadistica--estado h-100">
                <span class="estadistica-icono" aria-hidden="true">🟢</span>
                <h3>Estado</h3>
                <span class="insignia-estado">${resumen.estado}</span>
            </article>
            </div>`;
        }

        const activo = await ServicioServicios.obtenerServicioActivo();
        const aviso = document.getElementById('aviso-servicio-activo');
        if (activo && aviso) {
            const urlContinuar = ServicioServicios.obtenerUrlEtapa(activo.etapa);
            aviso.innerHTML = `
            <p><strong>Tienes un servicio en curso</strong> — ${activo.servicio.tienda}: ${activo.servicio.destino}</p>
            <p><a href="${urlContinuar}">Continuar flujo del servicio →</a></p>`;
            aviso.hidden = false;
        }

        const historial = await ServicioServicios.obtenerHistorial();
        const cuerpo = document.getElementById('cuerpo-historial-reciente');
        if (cuerpo) {
            cuerpo.innerHTML = historial.length === 0
                ? '<tr><td colspan="5">No hay servicios recientes.</td></tr>'
                : historial.slice(0, 3).map((item) => `
            <tr>
                <td data-label="Fecha">${formatearFecha(item.fecha)}</td>
                <td data-label="Tienda">${item.tienda}</td>
                <td data-label="Destino">${item.destino}</td>
                <td data-label="Tarifa">${formatearMoneda(item.tarifa)}</td>
                <td data-label="Estado"><span class="pildora-estado pildora-estado--${item.estado}">${item.estado}</span></td>
            </tr>`).join('');
        }

        if (typeof Animaciones !== 'undefined') {
            Animaciones.listaDinamica(rejilla);
            Animaciones.listaDinamica(cuerpo);
            if (aviso && !aviso.hidden) Animaciones.entradaPagina('#aviso-servicio-activo');
        }
    } catch (error) {
        mostrarMensaje('mensaje-dashboard', error.message || 'No se pudo cargar el dashboard.', 'error');
    }
});
