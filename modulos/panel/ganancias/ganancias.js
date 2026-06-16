document.addEventListener('DOMContentLoaded', async () => {
    LayoutApp.inicializar('ganancias');

    const ganancias = await ServicioServicios.obtenerGanancias();

    const rejilla = document.getElementById('rejilla-ganancias');
    if (rejilla) {
        rejilla.innerHTML = `
            <article class="tarjeta tarjeta-estadistica estadistica--azul">
                <span class="estadistica-icono" aria-hidden="true">📅</span>
                <h3>Hoy</h3>
                <span class="estadistica-valor">${formatearMoneda(ganancias.hoy)}</span>
            </article>
            <article class="tarjeta tarjeta-estadistica estadistica--verde">
                <span class="estadistica-icono" aria-hidden="true">📊</span>
                <h3>Semana</h3>
                <span class="estadistica-valor">${formatearMoneda(ganancias.semana)}</span>
            </article>
            <article class="tarjeta tarjeta-estadistica estadistica--ambar">
                <span class="estadistica-icono" aria-hidden="true">📈</span>
                <h3>Mes</h3>
                <span class="estadistica-valor">${formatearMoneda(ganancias.mes)}</span>
            </article>
            <article class="tarjeta tarjeta-estadistica estadistica--estado">
                <span class="estadistica-icono" aria-hidden="true">⏳</span>
                <h3>Pendiente de pago</h3>
                <span class="estadistica-valor">${formatearMoneda(ganancias.pendientePago)}</span>
            </article>`;
    }

    const maxMonto = Math.max(...ganancias.desgloseSemanal.map((d) => d.monto));
    const grafico = document.getElementById('grafico-semanal');
    if (grafico) {
        grafico.innerHTML = ganancias.desgloseSemanal.map((dia) => {
            const altura = maxMonto > 0 ? Math.round((dia.monto / maxMonto) * 100) : 0;
            return `
                <div class="barra-grafico">
                    <div class="barra-grafico-relleno" style="height:${altura}%" title="${formatearMoneda(dia.monto)}"></div>
                    <span class="barra-grafico-etiqueta">${dia.dia}</span>
                </div>`;
        }).join('');
    }

    const cuerpo = document.getElementById('cuerpo-pagos');
    if (cuerpo) {
        cuerpo.innerHTML = ganancias.ultimosPagos.map((pago) => `
            <tr>
                <td data-label="Fecha">${formatearFecha(pago.fecha)}</td>
                <td data-label="Monto">${formatearMoneda(pago.monto)}</td>
                <td data-label="Método">${pago.metodo}</td>
            </tr>`).join('');
    }
});
