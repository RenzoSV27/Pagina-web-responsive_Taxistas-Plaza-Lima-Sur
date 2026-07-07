document.addEventListener('DOMContentLoaded', () => {
    if (!ServicioAutenticacion.requerirSesion()) return;

    if (!ServicioAutenticacion.esAdmin()) {
        window.location.href = ServicioAutenticacion.obtenerRutaPanel();
        return;
    }

    const sesion = ServicioAutenticacion.obtenerSesionActual();
    document.getElementById('nombre-admin').textContent = sesion.nombre;

    document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
        ServicioAutenticacion.cerrarSesion();
    });

    inicializarTabs();
    inicializarServicios();
    inicializarTaxistas();
    cargarResumen();
});

function mostrarMensaje(texto, tipo = 'exito') {
    const el = document.getElementById('mensaje-admin');
    el.textContent = texto;
    el.className = `mensaje-admin mensaje-admin--${tipo}`;
    el.hidden = false;
    setTimeout(() => { el.hidden = true; }, 4000);
}

function inicializarTabs() {
    const tabs = document.querySelectorAll('.admin-tabs button');
    const panelServicios = document.getElementById('panel-servicios');
    const panelTaxistas = document.getElementById('panel-taxistas');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => {
                t.classList.remove('activo');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('activo');
            tab.setAttribute('aria-selected', 'true');

            const esServicios = tab.dataset.tab === 'servicios';
            panelServicios.hidden = !esServicios;
            panelTaxistas.hidden = esServicios;
        });
    });
}

async function cargarResumen() {
    try {
        const resumen = await ServicioAdmin.obtenerResumen();
        const contenedor = document.getElementById('resumen-admin');
        contenedor.innerHTML = `
            <div class="tarjeta-resumen"><strong>${resumen.servicios.disponibles}</strong><span>Viajes disponibles</span></div>
            <div class="tarjeta-resumen"><strong>${resumen.servicios.asignados}</strong><span>En curso</span></div>
            <div class="tarjeta-resumen"><strong>${resumen.servicios.completados}</strong><span>Completados</span></div>
            <div class="tarjeta-resumen"><strong>${resumen.taxistas.total}</strong><span>Taxistas</span></div>
            <div class="tarjeta-resumen"><strong>${resumen.taxistas.disponibles}</strong><span>Taxistas disponibles</span></div>
        `;
    } catch (error) {
        console.error(error);
    }
}

function badgeEstado(estado) {
    return `<span class="estado-badge estado-${estado}">${estado}</span>`;
}

function inicializarServicios() {
    const form = document.getElementById('form-servicio');
    const tbody = document.querySelector('#tabla-servicios tbody');
    const filtro = document.getElementById('filtro-estado-servicio');

    document.getElementById('btn-nuevo-servicio').addEventListener('click', () => {
        form.reset();
        document.getElementById('servicio-id').value = '';
        form.hidden = false;
    });

    document.getElementById('btn-cancelar-servicio-form').addEventListener('click', () => {
        form.hidden = true;
    });

    filtro.addEventListener('change', () => cargarServicios());

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('servicio-id').value;
        const datos = {
            tienda: document.getElementById('servicio-tienda').value,
            origen: document.getElementById('servicio-origen').value,
            destino: document.getElementById('servicio-destino').value,
            producto: document.getElementById('servicio-producto').value,
            peso: document.getElementById('servicio-peso').value,
            tarifa: Number(document.getElementById('servicio-tarifa').value),
            distancia: document.getElementById('servicio-distancia').value,
            tiempoEstimado: document.getElementById('servicio-tiempo').value,
            cliente: document.getElementById('servicio-cliente').value,
            telefonoCliente: document.getElementById('servicio-telefono').value,
            notas: document.getElementById('servicio-notas').value,
            prioridad: document.getElementById('servicio-prioridad').checked
        };

        try {
            if (id) {
                await ServicioAdmin.actualizarServicio(id, datos);
                mostrarMensaje('Viaje actualizado correctamente.');
            } else {
                await ServicioAdmin.crearServicio(datos);
                mostrarMensaje('Viaje creado. Los taxistas ya pueden verlo.');
            }
            form.hidden = true;
            await cargarServicios();
            await cargarResumen();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    async function cargarServicios() {
        try {
            const estado = filtro.value;
            const servicios = await ServicioAdmin.listarServicios(estado);
            tbody.innerHTML = servicios.length === 0
                ? '<tr><td colspan="6">No hay viajes registrados.</td></tr>'
                : servicios.map((s) => `
                    <tr>
                        <td>${s.id}</td>
                        <td>${s.tienda} → ${s.destino}</td>
                        <td>S/ ${s.tarifa.toFixed(2)}</td>
                        <td>${badgeEstado(s.estado)}</td>
                        <td>${s.taxistaNombre || '—'}</td>
                        <td>
                            ${s.estado !== 'completado' && s.estado !== 'cancelado'
                                ? `<button class="btn-accion btn-accion--editar" data-editar-servicio="${s.id}">Editar</button>`
                                : ''}
                            ${s.estado === 'disponible' || s.estado === 'cancelado'
                                ? `<button class="btn-accion btn-accion--eliminar" data-eliminar-servicio="${s.id}">Eliminar</button>`
                                : ''}
                            ${s.estado === 'disponible' || s.estado === 'asignado'
                                ? `<button class="btn-accion btn-accion--cancelar" data-cancelar-servicio="${s.id}">Cancelar</button>`
                                : ''}
                        </td>
                    </tr>
                `).join('');

            tbody.querySelectorAll('[data-editar-servicio]').forEach((btn) => {
                btn.addEventListener('click', () => editarServicio(servicios.find((s) => String(s.id) === btn.dataset.editarServicio)));
            });
            tbody.querySelectorAll('[data-eliminar-servicio]').forEach((btn) => {
                btn.addEventListener('click', () => eliminarServicio(btn.dataset.eliminarServicio));
            });
            tbody.querySelectorAll('[data-cancelar-servicio]').forEach((btn) => {
                btn.addEventListener('click', () => cancelarServicio(btn.dataset.cancelarServicio));
            });
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    }

    function editarServicio(servicio) {
        document.getElementById('servicio-id').value = servicio.id;
        document.getElementById('servicio-tienda').value = servicio.tienda;
        document.getElementById('servicio-origen').value = servicio.origen;
        document.getElementById('servicio-destino').value = servicio.destino;
        document.getElementById('servicio-producto').value = servicio.producto;
        document.getElementById('servicio-peso').value = servicio.peso;
        document.getElementById('servicio-tarifa').value = servicio.tarifa;
        document.getElementById('servicio-distancia').value = servicio.distancia;
        document.getElementById('servicio-tiempo').value = servicio.tiempoEstimado;
        document.getElementById('servicio-cliente').value = servicio.cliente;
        document.getElementById('servicio-telefono').value = servicio.telefonoCliente;
        document.getElementById('servicio-notas').value = servicio.notas || '';
        document.getElementById('servicio-prioridad').checked = servicio.prioridad;
        form.hidden = false;
    }

    async function eliminarServicio(id) {
        if (!confirm('¿Eliminar este viaje?')) return;
        try {
            await ServicioAdmin.eliminarServicio(id);
            mostrarMensaje('Viaje eliminado.');
            await cargarServicios();
            await cargarResumen();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    }

    async function cancelarServicio(id) {
        if (!confirm('¿Cancelar este viaje?')) return;
        try {
            await ServicioAdmin.cancelarServicio(id);
            mostrarMensaje('Viaje cancelado.');
            await cargarServicios();
            await cargarResumen();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    }

    cargarServicios();
}

function inicializarTaxistas() {
    const form = document.getElementById('form-taxista');
    const tbody = document.querySelector('#tabla-taxistas tbody');

    document.getElementById('btn-nuevo-taxista').addEventListener('click', () => {
        form.reset();
        document.getElementById('taxista-id').value = '';
        document.getElementById('taxista-contrasena').required = true;
        form.hidden = false;
    });

    document.getElementById('btn-cancelar-taxista-form').addEventListener('click', () => {
        form.hidden = true;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('taxista-id').value;
        const datos = {
            nombre: document.getElementById('taxista-nombre').value,
            dni: document.getElementById('taxista-dni').value,
            correo: document.getElementById('taxista-correo').value,
            telefono: document.getElementById('taxista-telefono').value,
            placa: document.getElementById('taxista-placa').value,
            vehiculo: document.getElementById('taxista-vehiculo').value,
            licencia: document.getElementById('taxista-licencia').value,
            estado: document.getElementById('taxista-estado').value
        };

        const contrasena = document.getElementById('taxista-contrasena').value;
        if (contrasena) datos.contrasena = contrasena;

        try {
            if (id) {
                await ServicioAdmin.actualizarTaxista(id, datos);
                mostrarMensaje('Taxista actualizado.');
            } else {
                if (!contrasena) {
                    mostrarMensaje('La contraseña es obligatoria al crear un taxista.', 'error');
                    return;
                }
                await ServicioAdmin.crearTaxista(datos);
                mostrarMensaje('Taxista creado correctamente.');
            }
            form.hidden = true;
            await cargarTaxistas();
            await cargarResumen();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    async function cargarTaxistas() {
        try {
            const taxistas = await ServicioAdmin.listarTaxistas();
            tbody.innerHTML = taxistas.length === 0
                ? '<tr><td colspan="6">No hay taxistas registrados.</td></tr>'
                : taxistas.map((t) => `
                    <tr>
                        <td>${t.nombre}</td>
                        <td>${t.correo}</td>
                        <td>${t.placa}</td>
                        <td>${badgeEstado(t.estado)}</td>
                        <td>${t.viajesTotales}</td>
                        <td>
                            <button class="btn-accion btn-accion--editar" data-editar-taxista="${t.id}">Editar</button>
                            <button class="btn-accion btn-accion--eliminar" data-eliminar-taxista="${t.id}">Eliminar</button>
                        </td>
                    </tr>
                `).join('');

            tbody.querySelectorAll('[data-editar-taxista]').forEach((btn) => {
                btn.addEventListener('click', () => editarTaxista(taxistas.find((t) => String(t.id) === btn.dataset.editarTaxista)));
            });
            tbody.querySelectorAll('[data-eliminar-taxista]').forEach((btn) => {
                btn.addEventListener('click', () => eliminarTaxista(btn.dataset.eliminarTaxista));
            });
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    }

    function editarTaxista(taxista) {
        document.getElementById('taxista-id').value = taxista.id;
        document.getElementById('taxista-nombre').value = taxista.nombre;
        document.getElementById('taxista-dni').value = taxista.dni;
        document.getElementById('taxista-correo').value = taxista.correo;
        document.getElementById('taxista-telefono').value = taxista.telefono;
        document.getElementById('taxista-placa').value = taxista.placa;
        document.getElementById('taxista-vehiculo').value = taxista.vehiculo;
        document.getElementById('taxista-licencia').value = taxista.licencia || '';
        document.getElementById('taxista-estado').value = taxista.estado;
        document.getElementById('taxista-contrasena').value = '';
        document.getElementById('taxista-contrasena').required = false;
        form.hidden = false;
    }

    async function eliminarTaxista(id) {
        if (!confirm('¿Eliminar este taxista? Esta acción no se puede deshacer.')) return;
        try {
            await ServicioAdmin.eliminarTaxista(id);
            mostrarMensaje('Taxista eliminado.');
            await cargarTaxistas();
            await cargarResumen();
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    }

    cargarTaxistas();
}
