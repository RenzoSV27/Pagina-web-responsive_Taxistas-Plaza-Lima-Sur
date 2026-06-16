document.addEventListener('DOMContentLoaded', () => {
    LayoutApp.inicializar('servicios');

    const activo = ServicioServicios.requerirServicioActivo([ServicioServicios.ETAPAS.EN_CURSO]);
    if (!activo) {
        redirigirSiHayServicioActivo();
        return;
    }

    const { servicio, etapa } = activo;
    LayoutApp.renderizarBarraProgreso(etapa);
    document.getElementById('destino-servicio').textContent = `Destino: ${servicio.destino}`;

    let segundos = 0;
    const elementoTemporizador = document.getElementById('temporizador');
    setInterval(() => {
        segundos += 1;
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        elementoTemporizador.textContent =
            `${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
    }, 1000);

    document.getElementById('btn-ir-destino').addEventListener('click', () => {
        ServicioServicios.avanzarEtapa(ServicioServicios.ETAPAS.DESTINO);
        window.location.href = '../destino-entrega/destino-entrega.html';
    });
});

function redirigirSiHayServicioActivo() {
    const actual = ServicioServicios.obtenerServicioActivo();
    if (!actual) return;
    const raiz = document.body.dataset.rutaRaiz || '';
    const rutas = {
        [ServicioServicios.ETAPAS.ACEPTADO]: 'modulos/panel/servicio-aceptado/servicio-aceptado.html',
        [ServicioServicios.ETAPAS.RECOGIDA]: 'modulos/panel/punto-recogida/punto-recogida.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_RECOGIDA]: 'modulos/panel/confirmacion-recogida/confirmacion-recogida.html',
        [ServicioServicios.ETAPAS.DESTINO]: 'modulos/panel/destino-entrega/destino-entrega.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_ENTREGA]: 'modulos/panel/confirmacion-entrega/confirmacion-entrega.html'
    };
    const ruta = rutas[actual.etapa];
    if (ruta) window.location.href = raiz + ruta;
}
