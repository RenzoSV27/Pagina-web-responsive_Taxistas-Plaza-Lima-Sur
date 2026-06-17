document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('servicios');

    const etapasPermitidas = [
        ServicioServicios.ETAPAS.ACEPTADO,
        ServicioServicios.ETAPAS.RECOGIDA
    ];
    let activo = await ServicioServicios.requerirServicioActivo(etapasPermitidas);
    if (!activo) {
        await redirigirSiHayServicioActivo();
        return;
    }

    if (activo.etapa === ServicioServicios.ETAPAS.ACEPTADO) {
        activo = await ServicioServicios.avanzarEtapa(ServicioServicios.ETAPAS.RECOGIDA);
    }

    const { servicio, etapa } = activo;
    LayoutApp.renderizarBarraProgreso(etapa);

    document.getElementById('direccion-recogida').textContent = servicio.origen;
    document.getElementById('texto-direccion').textContent = servicio.origen;

    document.getElementById('btn-como-llegar').addEventListener('click', () => {
        const coords = servicio.coordenadasRecogida;
        if (coords) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`, '_blank');
        }
    });

    document.getElementById('btn-confirmar-recogida').addEventListener('click', async () => {
        await ServicioServicios.avanzarEtapa(ServicioServicios.ETAPAS.CONFIRMACION_RECOGIDA);
        window.location.href = '../confirmacion-recogida/confirmacion-recogida.html';
    });
});

async function redirigirSiHayServicioActivo() {
    const actual = await ServicioServicios.obtenerServicioActivo();
    if (!actual) return;
    const raiz = document.body.dataset.rutaRaiz || '';
    const rutas = {
        [ServicioServicios.ETAPAS.ACEPTADO]: 'modulos/panel/servicio-aceptado/servicio-aceptado.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_RECOGIDA]: 'modulos/panel/confirmacion-recogida/confirmacion-recogida.html',
        [ServicioServicios.ETAPAS.EN_CURSO]: 'modulos/panel/servicio-en-curso/servicio-en-curso.html',
        [ServicioServicios.ETAPAS.DESTINO]: 'modulos/panel/destino-entrega/destino-entrega.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_ENTREGA]: 'modulos/panel/confirmacion-entrega/confirmacion-entrega.html'
    };
    const ruta = rutas[actual.etapa];
    if (ruta) window.location.href = raiz + ruta;
}
