/**
 * Inicialización Bootstrap: accesibilidad, tablas e imágenes responsivas.
 */
const BootstrapInit = {
    inicializar() {
        this.insertarSkipLink();
        this.mejorarFormularios();
        this.mejorarTablas();
        this.mejorarImagenes();
        this.marcarNavegacionActiva();
    },

    insertarSkipLink() {
        if (document.querySelector('.skip-link')) return;

        const main = document.querySelector('main, .pagina-app, .pagina-auth, .seccion-hero');
        if (!main) return;

        if (!main.id) main.id = 'contenido-principal';

        const enlace = document.createElement('a');
        enlace.href = `#${main.id}`;
        enlace.className = 'skip-link';
        enlace.textContent = 'Saltar al contenido principal';
        document.body.prepend(enlace);
    },

    mejorarFormularios() {
        document.querySelectorAll('.formulario').forEach((formulario) => {
            formulario.querySelectorAll('input:not([type=checkbox]):not([type=radio]), select, textarea').forEach((campo) => {
                if (!campo.classList.contains('form-control') && !campo.classList.contains('form-select')) {
                    campo.classList.add(campo.tagName === 'SELECT' ? 'form-select' : 'form-control');
                }
                if (campo.id) {
                    const etiqueta = formulario.querySelector(`label[for="${campo.id}"]`);
                    if (etiqueta) etiqueta.classList.add('form-label');
                }
            });

            formulario.querySelectorAll('.form-check-input, input[type=checkbox]').forEach((check) => {
                const contenedor = check.closest('label');
                if (contenedor && !contenedor.classList.contains('form-check')) {
                    contenedor.classList.add('form-check');
                    check.classList.add('form-check-input');
                    const texto = contenedor.querySelector('span, .form-check-label') || contenedor;
                    if (texto !== check) texto.classList.add('form-check-label');
                }
            });

            formulario.querySelectorAll('.boton-primario, button[type=submit]').forEach((boton) => {
                boton.classList.add('btn', 'btn-taxi-primary', 'w-100');
            });
        });
    },

    mejorarTablas() {
        document.querySelectorAll('.tabla-datos').forEach((tabla) => {
            if (tabla.closest('.table-responsive')) return;
            const contenedor = tabla.closest('.contenedor-tabla') || tabla.parentElement;
            if (!contenedor) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            wrapper.setAttribute('role', 'region');
            wrapper.setAttribute('aria-label', 'Tabla de datos');
            wrapper.tabIndex = 0;
            contenedor.insertBefore(wrapper, tabla);
            wrapper.appendChild(tabla);
            tabla.classList.add('table', 'table-hover', 'align-middle');
        });
    },

    mejorarImagenes() {
        document.querySelectorAll('img:not(.img-fluid)').forEach((img) => {
            img.classList.add('img-fluid');
            if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
        });
    },

    marcarNavegacionActiva() {
        const ruta = window.location.pathname.split('/').pop();
        document.querySelectorAll('.enlace-sidebar[data-pagina], .nav-link[data-ruta]').forEach((enlace) => {
            const href = enlace.getAttribute('href') || '';
            if (href.endsWith(ruta)) {
                enlace.setAttribute('aria-current', 'page');
                enlace.classList.add('activo');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => BootstrapInit.inicializar());
