document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('servicios');

    const activo = await ServicioServicios.requerirServicioActivo([ServicioServicios.ETAPAS.CONFIRMACION_RECOGIDA]);
    if (!activo) {
        await redirigirSiHayServicioActivo();
        return;
    }

    const { servicio, etapa } = activo;
    LayoutApp.renderizarBarraProgreso(etapa);
    document.getElementById('titulo-producto').textContent = `${servicio.producto} — ${servicio.tienda}`;

    const checkbox = document.getElementById('confirmar-recogida');
    const btnConfirmar = document.getElementById('btn-confirmar');

    checkbox.addEventListener('change', () => {
        btnConfirmar.disabled = !checkbox.checked;
    });

    document.getElementById('formulario-recogida').addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (!checkbox.checked) return;

        btnConfirmar.disabled = true;
        await ServicioServicios.confirmarRecogida();
        window.location.href = 'en-curso.html';
    });
});

async function redirigirSiHayServicioActivo() {
    const actual = await ServicioServicios.obtenerServicioActivo();
    if (!actual) return;
    const raiz = document.body.dataset.rutaRaiz || '';
    const rutas = {
        [ServicioServicios.ETAPAS.ACEPTADO]: 'modulos/panel/servicio/aceptado.html',
        [ServicioServicios.ETAPAS.RECOGIDA]: 'modulos/panel/servicio/recogida.html',
        [ServicioServicios.ETAPAS.EN_CURSO]: 'modulos/panel/servicio/en-curso.html',
        [ServicioServicios.ETAPAS.DESTINO]: 'modulos/panel/servicio/destino.html',
        [ServicioServicios.ETAPAS.CONFIRMACION_ENTREGA]: 'modulos/panel/servicio/confirmacion-entrega.html'
    };
    const ruta = rutas[actual.etapa];
    if (ruta) window.location.href = raiz + ruta;
}
