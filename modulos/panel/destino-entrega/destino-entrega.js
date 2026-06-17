document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('servicios');

    const activo = await ServicioServicios.requerirServicioActivo([ServicioServicios.ETAPAS.DESTINO]);
    if (!activo) {
        await redirigirSiHayServicioActivo();
        return;
    }

    const { servicio, etapa } = activo;
    LayoutApp.renderizarBarraProgreso(etapa);

    document.getElementById('contenido-destino').innerHTML = `
        <div class="detalle-grid">
            <div>
                <h2>Dirección de entrega</h2>
                <p class="direccion-destacada">${servicio.destino}</p>
                <ul class="lista-detalle">
                    <li><strong>Producto</strong> <span>${servicio.producto}</span></li>
                    <li><strong>Peso</strong> <span>${servicio.peso}</span></li>
                    <li><strong>Tarifa</strong> <span class="tarifa">${formatearMoneda(servicio.tarifa)}</span></li>
                </ul>
            </div>
            <div>
                <h2>Datos del cliente</h2>
                <ul class="lista-detalle">
                    <li><strong>Nombre</strong> <span>${servicio.cliente}</span></li>
                    <li><strong>Teléfono</strong> <span>${servicio.telefonoCliente}</span></li>
                    <li><strong>Notas</strong> <span>${servicio.notas}</span></li>
                </ul>
            </div>
        </div>`;

    document.getElementById('btn-confirmar-entrega').addEventListener('click', async () => {
        await ServicioServicios.avanzarEtapa(ServicioServicios.ETAPAS.CONFIRMACION_ENTREGA);
        window.location.href = '../confirmacion-entrega/confirmacion-entrega.html';
    });
});

async function redirigirSiHayServicioActivo() {
    const actual = await ServicioServicios.obtenerServicioActivo();
    if (!actual) return;
    const raiz = document.body.dataset.rutaRaiz || '';
    const rutas = {
        [ServicioServicios.ETAPAS.ACEPTADO]: 'modulos/panel/servicio-aceptado/servicio-aceptado.html',
        [ServicioServicios.ETAPAS.RECOGIDA]: 'modulos/panel/punto-recogida/punto-recogida.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_RECOGIDA]: 'modulos/panel/confirmacion-recogida/confirmacion-recogida.html',
        [ServicioServicios.ETAPAS.EN_CURSO]: 'modulos/panel/servicio-en-curso/servicio-en-curso.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_ENTREGA]: 'modulos/panel/confirmacion-entrega/confirmacion-entrega.html'
    };
    const ruta = rutas[actual.etapa];
    if (ruta) window.location.href = raiz + ruta;
}
