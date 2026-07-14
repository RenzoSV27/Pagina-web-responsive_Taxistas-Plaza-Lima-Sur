/**
 * Aplica estructura offcanvas Bootstrap al sidebar del panel en todos los HTML del panel.
 */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..', '..');
const panelDir = path.join(raiz, 'modulos', 'panel');

const sidebarViejo = /<aside class="sidebar" id="sidebar" aria-label="Menú principal">[\s\S]*?<nav class="sidebar-nav" id="sidebar-nav"><\/nav>\s*<\/aside>/;

const sidebarNuevo = `<aside class="sidebar offcanvas offcanvas-start" id="sidebar" tabindex="-1"
            aria-label="Menú principal del panel">
            <div class="offcanvas-header d-lg-none">
                <h2 class="offcanvas-title h6 mb-0" id="sidebarLabel">Menú</h2>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar menú"></button>
            </div>
            <div class="offcanvas-body p-0 d-flex flex-column">
            <div class="sidebar-cabecera"><a href="../../index.html" class="logo"><span class="logo-icono" aria-hidden="true">🚖</span><span class="logo-texto">Taxi Plaza <strong>Lima Sur</strong></span></a></div>
            <div class="sidebar-usuario">Taxista<strong id="nombre-usuario">—</strong></div>
            <nav class="sidebar-nav" id="sidebar-nav" aria-label="Secciones del panel"></nav>
            </div>
        </aside>`;

const sidebarServicioViejo = /<aside class="sidebar" id="sidebar" aria-label="Menú principal">[\s\S]*?<nav class="sidebar-nav" id="sidebar-nav"><\/nav>\s*<\/aside>/g;

const sidebarServicioNuevo = `<aside class="sidebar offcanvas offcanvas-start" id="sidebar" tabindex="-1"
            aria-label="Menú principal del panel">
            <div class="offcanvas-header d-lg-none">
                <h2 class="offcanvas-title h6 mb-0" id="sidebarLabel">Menú</h2>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar menú"></button>
            </div>
            <div class="offcanvas-body p-0 d-flex flex-column">
            <div class="sidebar-cabecera"><a href="../../../index.html" class="logo"><span class="logo-icono" aria-hidden="true">🚖</span><span class="logo-texto">Taxi Plaza <strong>Lima Sur</strong></span></a></div>
            <div class="sidebar-usuario">Taxista<strong id="nombre-usuario">—</strong></div>
            <nav class="sidebar-nav" id="sidebar-nav" aria-label="Secciones del panel"></nav>
            </div>
        </aside>`;

const barraVieja = /<header class="barra-app"><button type="button" class="boton-menu-movil" id="btn-menu-movil" aria-label="Abrir menú">☰<\/button><span class="barra-app-titulo">([^<]+)<\/span><\/header>/;

const barraNueva = `<header class="barra-app">
                <button type="button" class="boton-menu-movil btn btn-link" id="btn-menu-movil"
                    data-bs-toggle="offcanvas" data-bs-target="#sidebar" aria-controls="sidebar"
                    aria-label="Abrir menú de navegación">☰</button>
                <span class="barra-app-titulo">$1</span>
            </header>`;

function procesar(ruta) {
    let c = fs.readFileSync(ruta, 'utf8');
    if (c.includes('offcanvas offcanvas-start')) return false;

    const esServicio = ruta.includes(`${path.sep}servicio${path.sep}`);
    if (esServicio) {
        c = c.replace(sidebarServicioViejo, sidebarServicioNuevo);
    } else {
        c = c.replace(sidebarViejo, sidebarNuevo);
    }

    c = c.replace(barraVieja, barraNueva);
    c = c.replace('<main class="pagina-app">', '<main class="pagina-app" id="contenido-principal">');
    c = c.replace('id="sidebar-overlay"></div>', 'id="sidebar-overlay" hidden></div>');

    if (c.includes('rejilla-servicios"')) {
        c = c.replace(
            'class="rejilla-servicios" id="rejilla-servicios"',
            'class="rejilla-servicios row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3 rejilla-servicios-bootstrap" id="rejilla-servicios"'
        );
    }

    if (c.includes('rejilla-estadisticas"') && !c.includes('row row-cols')) {
        c = c.replace(
            'class="rejilla-estadisticas" id="rejilla-estadisticas"',
            'class="rejilla-estadisticas row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 rejilla-estadisticas-bootstrap" id="rejilla-estadisticas"'
        );
    }

    fs.writeFileSync(ruta, c, 'utf8');
    return true;
}

function recorrer(dir) {
    let n = 0;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const r = path.join(dir, e.name);
        if (e.isDirectory()) n += recorrer(r);
        else if (e.name.endsWith('.html')) {
            if (procesar(r)) {
                console.log('Panel offcanvas:', path.relative(raiz, r));
                n++;
            }
        }
    }
    return n;
}

console.log(`${recorrer(panelDir)} páginas del panel actualizadas.`);
