document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('historial');

    const historial = await ServicioServicios.obtenerHistorial();
    const cuerpo = document.getElementById('cuerpo-historial');

    if (!cuerpo) return;

    if (historial.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="5">No hay servicios en el historial.</td></tr>';
        return;
    }

    cuerpo.innerHTML = historial.map((item) => `
        <tr>
            <td data-label="Fecha">${formatearFecha(item.fecha)}</td>
            <td data-label="Tienda">${item.tienda}</td>
            <td data-label="Destino">${item.destino}</td>
            <td data-label="Tarifa">${formatearMoneda(item.tarifa)}</td>
            <td data-label="Estado"><span class="pildora-estado pildora-estado--${item.estado}">${item.estado}</span></td>
        </tr>`).join('');
});
