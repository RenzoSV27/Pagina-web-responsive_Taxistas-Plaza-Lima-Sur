document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('servicios');

    const id = Navegacion.obtenerParametro('id');
    if (!id) {
        mostrarMensaje('mensaje-detalle', 'Servicio no especificado.', 'error');
        return;
    }

    const servicio = await ServicioServicios.obtenerDetalleServicio(id);
    if (!servicio) {
        mostrarMensaje('mensaje-detalle', 'Servicio no encontrado.', 'error');
        return;
    }

    document.getElementById('titulo-servicio').textContent = `${servicio.tienda} — ${servicio.tipo}`;
    document.getElementById('subtitulo-servicio').textContent = `${servicio.origen} → ${servicio.destino}`;

    const contenedor = document.getElementById('contenido-detalle');
    contenedor.innerHTML = `
        <div class="tarjeta">
            <div class="detalle-grid">
                <div>
                    <h2>Información del envío</h2>
                    <ul class="lista-detalle">
                        <li><strong>Producto</strong> <span>${servicio.producto}</span></li>
                        <li><strong>Peso</strong> <span>${servicio.peso}</span></li>
                        <li><strong>Origen</strong> <span>${servicio.origen}</span></li>
                        <li><strong>Destino</strong> <span>${servicio.destino}</span></li>
                        <li><strong>Distancia</strong> <span>${servicio.distancia}</span></li>
                        <li><strong>Tiempo estimado</strong> <span>${servicio.tiempoEstimado}</span></li>
                    </ul>
                </div>
                <div>
                    <h2>Cliente y tarifa</h2>
                    <ul class="lista-detalle">
                        <li><strong>Cliente</strong> <span>${servicio.cliente}</span></li>
                        <li><strong>Teléfono</strong> <span>${servicio.telefonoCliente}</span></li>
                        <li><strong>Notas</strong> <span>${servicio.notas}</span></li>
                        <li><strong>Tarifa</strong> <span class="tarifa">${formatearMoneda(servicio.tarifa)}</span></li>
                    </ul>
                </div>
            </div>
            <div class="acciones-flujo">
                <a href="../servicios.html" class="boton-secundario">Volver</a>
                <button type="button" class="boton-primario" id="btn-aceptar-servicio">Aceptar servicio</button>
            </div>
        </div>`;

    if (typeof Animaciones !== 'undefined') {
        Animaciones.entradaPagina('#contenido-detalle');
    }

    document.getElementById('btn-aceptar-servicio').addEventListener('click', async () => {
        const resultado = await ServicioServicios.aceptarServicio(id);
        if (resultado.exito) {
            window.location.href = 'aceptado.html';
        } else {
            mostrarMensaje('mensaje-detalle', resultado.mensaje || 'No se pudo aceptar el servicio.', 'error');
        }
    });
});
