document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('servicios');

    const activo = await ServicioServicios.requerirServicioActivo([ServicioServicios.ETAPAS.EN_CURSO]);
    if (!activo) {
        await redirigirSiHayServicioActivo();
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

    document.getElementById('btn-ir-destino').addEventListener('click', async () => {
        await ServicioServicios.avanzarEtapa(ServicioServicios.ETAPAS.DESTINO);
        window.location.href = 'destino.html';
    });
});

async function redirigirSiHayServicioActivo() {
    const actual = await ServicioServicios.obtenerServicioActivo();
    if (!actual) return;
    const raiz = document.body.dataset.rutaRaiz || '';
    const rutas = {
        [ServicioServicios.ETAPAS.ACEPTADO]: 'modulos/panel/servicio/aceptado.html',
        [ServicioServicios.ETAPAS.RECOGIDA]: 'modulos/panel/servicio/recogida.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_RECOGIDA]: 'modulos/panel/servicio/confirmacion-recogida.html',
        [ServicioServicios.ETAPAS.DESTINO]: 'modulos/panel/servicio/destino.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_ENTREGA]: 'modulos/panel/servicio/confirmacion-entrega.html'
    };
    const ruta = rutas[actual.etapa];
    if (ruta) window.location.href = raiz + ruta;
}
