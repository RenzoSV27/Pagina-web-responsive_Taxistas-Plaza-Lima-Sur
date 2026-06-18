document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('servicios');

    const activo = await ServicioServicios.requerirServicioActivo([ServicioServicios.ETAPAS.CONFIRMACION_ENTREGA]);
    if (!activo) {
        await redirigirSiHayServicioActivo();
        return;
    }

    const { servicio, etapa } = activo;
    LayoutApp.renderizarBarraProgreso(etapa);
    document.getElementById('resumen-entrega').textContent =
        `${servicio.producto} para ${servicio.cliente} — ${servicio.destino}`;

    const checkbox = document.getElementById('confirmar-entrega');
    const btnFinalizar = document.getElementById('btn-finalizar');

    checkbox.addEventListener('change', () => {
        btnFinalizar.disabled = !checkbox.checked;
    });

    document.getElementById('formulario-entrega').addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (!checkbox.checked) return;

        btnFinalizar.disabled = true;
        const resultado = await ServicioServicios.confirmarEntrega();
        if (resultado.exito) {
            window.location.href = '../dashboard.html?exito=entrega';
        } else {
            mostrarMensaje('mensaje-entrega', resultado.mensaje || 'No se pudo confirmar la entrega.', 'error');
            btnFinalizar.disabled = false;
        }
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
        [ServicioServicios.ETAPAS.EN_CURSO]: 'modulos/panel/servicio/en-curso.html',
        [ServicioServicios.ETAPAS.DESTINO]: 'modulos/panel/servicio/destino.html'
    };
    const ruta = rutas[actual.etapa];
    if (ruta) window.location.href = raiz + ruta;
}
