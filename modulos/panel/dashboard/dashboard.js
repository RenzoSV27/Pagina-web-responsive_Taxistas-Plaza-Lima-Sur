document.addEventListener('DOMContentLoaded', async () => {
    LayoutApp.inicializar('dashboard');

    const raiz = document.body.dataset.rutaRaiz || '';
    const parametroExito = Navegacion.obtenerParametro('exito');
    if (parametroExito === 'entrega') {
        mostrarMensaje('mensaje-dashboard', '¡Entrega confirmada! El servicio se completó correctamente.', 'exito');
    }

    const resumen = await ServicioServicios.obtenerResumenDia();
    const rejilla = document.getElementById('rejilla-estadisticas');
    if (rejilla) {
        rejilla.innerHTML = `
            <article class="tarjeta tarjeta-estadistica estadistica--azul">
                <span class="estadistica-icono" aria-hidden="true">📋</span>
                <h3>Servicios hoy</h3>
                <span class="estadistica-valor">${resumen.serviciosHoy}</span>
            </article>
            <article class="tarjeta tarjeta-estadistica estadistica--verde">
                <span class="estadistica-icono" aria-hidden="true">✅</span>
                <h3>Completados</h3>
                <span class="estadistica-valor">${resumen.completados}</span>
            </article>
            <article class="tarjeta tarjeta-estadistica estadistica--ambar">
                <span class="estadistica-icono" aria-hidden="true">💰</span>
                <h3>Ganancias</h3>
                <span class="estadistica-valor">${formatearMoneda(resumen.ganancias)}</span>
            </article>
            <article class="tarjeta tarjeta-estadistica estadistica--estado">
                <span class="estadistica-icono" aria-hidden="true">🟢</span>
                <h3>Estado</h3>
                <span class="insignia-estado">${resumen.estado}</span>
            </article>`;
    }

    const activo = ServicioServicios.obtenerServicioActivo();
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
        cuerpo.innerHTML = historial.slice(0, 3).map((item) => `
            <tr>
                <td data-label="Fecha">${formatearFecha(item.fecha)}</td>
                <td data-label="Tienda">${item.tienda}</td>
                <td data-label="Destino">${item.destino}</td>
                <td data-label="Tarifa">${formatearMoneda(item.tarifa)}</td>
                <td data-label="Estado"><span class="pildora-estado pildora-estado--${item.estado}">${item.estado}</span></td>
            </tr>`).join('');
    }
});
