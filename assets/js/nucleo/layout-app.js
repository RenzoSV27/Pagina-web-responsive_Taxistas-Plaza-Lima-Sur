const LayoutApp = {
    enlaces: [
        { id: 'dashboard', etiqueta: 'Dashboard', icono: '🏠', ruta: 'modulos/panel/dashboard.html' },
        { id: 'servicios', etiqueta: 'Servicios', icono: '📋', ruta: 'modulos/panel/servicios.html' },
        { id: 'historial', etiqueta: 'Historial', icono: '📜', ruta: 'modulos/panel/historial.html' },
        { id: 'ganancias', etiqueta: 'Ganancias', icono: '💰', ruta: 'modulos/panel/ganancias.html' },
        { id: 'notificaciones', etiqueta: 'Notificaciones', icono: '🔔', ruta: 'modulos/panel/notificaciones.html' },
        { id: 'perfil', etiqueta: 'Perfil', icono: '👤', ruta: 'modulos/perfil/perfil.html' },
        { id: 'configuracion', etiqueta: 'Configuración', icono: '⚙️', ruta: 'modulos/configuracion/configuracion.html' }
    ],

    async inicializar(paginaActiva) {
        if (!ServicioAutenticacion.requerirSesion()) return;

        if (ServicioAutenticacion.esAdmin()) {
            window.location.href = ServicioAutenticacion.obtenerRutaPanel();
            return;
        }

        this.configurarSidebar(paginaActiva);
        this.configurarMenuMovil();
        this.actualizarNombreUsuario();
        await this.actualizarBadgeNotificaciones();

        if (typeof Animaciones !== 'undefined') {
            Animaciones.panel();
            Animaciones.botonHover('.boton-primario, .boton-secundario');
        }
    },

    obtenerRutaRaiz() {
        return document.body?.dataset.rutaRaiz || '';
    },

    configurarSidebar(paginaActiva) {
        const nav = document.getElementById('sidebar-nav');
        if (!nav) return;

        const raiz = this.obtenerRutaRaiz();
        nav.innerHTML = this.enlaces.map((enlace) => {
            const activo = enlace.id === paginaActiva ? ' activo' : '';
            const ariaActual = enlace.id === paginaActiva ? ' aria-current="page"' : '';
            const badge = enlace.id === 'notificaciones' ? '<span class="badge-nav" id="badge-notificaciones" hidden>0</span>' : '';
            return `<a href="${raiz}${enlace.ruta}" class="enlace-sidebar${activo}" data-pagina="${enlace.id}"${ariaActual}>
                <span class="enlace-sidebar-icono" aria-hidden="true">${enlace.icono}</span>
                <span>${enlace.etiqueta}</span>${badge}
            </a>`;
        }).join('') + `
            <button type="button" class="enlace-sidebar enlace-sidebar--cerrar" id="btn-cerrar-sesion">
                <span class="enlace-sidebar-icono" aria-hidden="true">🚪</span>
                <span>Cerrar sesión</span>
            </button>`;

        document.getElementById('btn-cerrar-sesion')?.addEventListener('click', () => {
            ServicioAutenticacion.cerrarSesion();
        });
    },

    configurarMenuMovil() {
        const boton = document.getElementById('btn-menu-movil');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (!boton || !sidebar) return;

        if (typeof bootstrap !== 'undefined' && sidebar.classList.contains('offcanvas')) {
            boton.setAttribute('data-bs-toggle', 'offcanvas');
            boton.setAttribute('data-bs-target', '#sidebar');
            boton.setAttribute('aria-controls', 'sidebar');
            return;
        }

        const cerrar = () => {
            sidebar.classList.remove('abierto');
            overlay?.classList.remove('visible');
            boton.setAttribute('aria-expanded', 'false');
        };

        boton.addEventListener('click', () => {
            const abierto = sidebar.classList.toggle('abierto');
            overlay?.classList.toggle('visible', abierto);
            boton.setAttribute('aria-expanded', String(abierto));
        });

        overlay?.addEventListener('click', cerrar);
    },

    actualizarNombreUsuario() {
        const sesion = ServicioAutenticacion.obtenerSesionActual();
        const elemento = document.getElementById('nombre-usuario');
        if (elemento && sesion) elemento.textContent = sesion.nombre;
    },

    async actualizarBadgeNotificaciones() {
        const badge = document.getElementById('badge-notificaciones');
        if (!badge) return;
        const cantidad = await ServicioNotificaciones.contarNoLeidas();
        badge.textContent = String(cantidad);
        badge.hidden = cantidad === 0;
    },

    renderizarBarraProgreso(etapa) {
        const contenedor = document.getElementById('barra-progreso-servicio');
        if (!contenedor) return;

        const porcentaje = ServicioServicios.obtenerProgresoEtapa(etapa);
        const pasos = ['Aceptado', 'Recogida', 'En curso', 'Entrega'];
        contenedor.innerHTML = `
            <div class="barra-progreso">
                <div class="barra-progreso-etiqueta">
                    <span>Progreso del servicio</span>
                    <strong>${porcentaje}%</strong>
                </div>
                <div class="barra-progreso-pista">
                    <div class="barra-progreso-relleno" style="width:${porcentaje}%"></div>
                </div>
                <div class="barra-progreso-pasos">
                    ${pasos.map((paso) => `<span>${paso}</span>`).join('')}
                </div>
            </div>`;
        contenedor.hidden = false;

        if (typeof Animaciones !== 'undefined') {
            Animaciones.barraProgreso(contenedor.querySelector('.barra-progreso-relleno'));
        }
    }
};

const LayoutPublico = {
    inicializar() {
        const sesion = ServicioAutenticacion.obtenerSesionActual();
        const btnPanel = document.getElementById('btn-ir-panel');
        const itemPanel = document.getElementById('item-ir-panel');
        if (sesion) {
            if (btnPanel) btnPanel.hidden = false;
            if (itemPanel) itemPanel.hidden = false;
        }
    }
};

function formatearMoneda(monto) {
    return `S/ ${Number(monto).toFixed(2)}`;
}

function formatearFecha(fechaIso) {
    const soloFecha = String(fechaIso).split('T')[0];
    const partes = soloFecha.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatearFechaHora(fechaIso) {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function mostrarMensaje(elementoId, texto, tipo = 'info') {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.className = `mensaje-formulario mensaje-formulario--${tipo}`;
    elemento.hidden = false;
}

function obtenerHtmlAccesibilidad(rutaRaiz) {
    return `
    <div class="contenedor-accesibilidad">
        <button type="button" class="boton-accesibilidad" aria-label="Opciones de accesibilidad"
            aria-expanded="false" aria-controls="panel-accesibilidad">♿</button>
        <div id="panel-accesibilidad" class="panel-accesibilidad" role="region"
            aria-label="Panel de accesibilidad" hidden>
            <h3>Accesibilidad</h3>
            <div class="form-check mb-2">
                <input type="checkbox" class="form-check-input" id="alto-contraste">
                <label class="form-check-label" for="alto-contraste">Alto contraste</label>
            </div>
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="texto-grande">
                <label class="form-check-label" for="texto-grande">Texto grande</label>
            </div>
        </div>
    </div>`;
}
