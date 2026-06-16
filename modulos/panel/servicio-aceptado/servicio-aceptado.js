document.addEventListener('DOMContentLoaded', () => {
    LayoutApp.inicializar('servicios');

    const activo = ServicioServicios.requerirServicioActivo([ServicioServicios.ETAPAS.ACEPTADO]);
    if (!activo) {
        redirigirSiHayServicioActivo();
        return;
    }

    const { servicio, etapa } = activo;
    LayoutApp.renderizarBarraProgreso(etapa);

    document.getElementById('resumen-servicio').innerHTML = `
        <h2>${servicio.tienda} — ${servicio.producto}</h2>
        <ul class="lista-detalle">
            <li><strong>Origen</strong> <span>${servicio.origen}</span></li>
            <li><strong>Destino</strong> <span>${servicio.destino}</span></li>
            <li><strong>Cliente</strong> <span>${servicio.cliente}</span></li>
            <li><strong>Tarifa</strong> <span class="tarifa">${formatearMoneda(servicio.tarifa)}</span></li>
        </ul>`;

    document.getElementById('btn-ir-recogida').addEventListener('click', () => {
        ServicioServicios.avanzarEtapa(ServicioServicios.ETAPAS.RECOGIDA);
        window.location.href = '../punto-recogida/punto-recogida.html';
    });
});

function redirigirSiHayServicioActivo() {
    const actual = ServicioServicios.obtenerServicioActivo();
    if (!actual) return;
    const raiz = document.body.dataset.rutaRaiz || '';
    const rutas = {
        [ServicioServicios.ETAPAS.RECOGIDA]: 'modulos/panel/punto-recogida/punto-recogida.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_RECOGIDA]: 'modulos/panel/confirmacion-recogida/confirmacion-recogida.html',
        [ServicioServicios.ETAPAS.EN_CURSO]: 'modulos/panel/servicio-en-curso/servicio-en-curso.html',
        [ServicioServicios.ETAPAS.DESTINO]: 'modulos/panel/destino-entrega/destino-entrega.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_ENTREGA]: 'modulos/panel/confirmacion-entrega/confirmacion-entrega.html'
    };
    const ruta = rutas[actual.etapa];
    if (ruta) window.location.href = raiz + ruta;
}
