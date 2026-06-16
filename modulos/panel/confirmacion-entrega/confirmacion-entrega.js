document.addEventListener('DOMContentLoaded', () => {
    LayoutApp.inicializar('servicios');

    const activo = ServicioServicios.requerirServicioActivo([ServicioServicios.ETAPAS.CONFIRMACION_ENTREGA]);
    if (!activo) {
        redirigirSiHayServicioActivo();
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
            window.location.href = '../dashboard/dashboard.html?exito=entrega';
        } else {
            mostrarMensaje('mensaje-entrega', resultado.mensaje || 'No se pudo confirmar la entrega.', 'error');
            btnFinalizar.disabled = false;
        }
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
        [ServicioServicios.ETAPAS.EN_CURSO]: 'modulos/panel/servicio-en-curso/servicio-en-curso.html',
        [ServicioServicios.ETAPAS.DESTINO]: 'modulos/panel/destino-entrega/destino-entrega.html'
    };
    const ruta = rutas[actual.etapa];
    if (ruta) window.location.href = raiz + ruta;
}
