const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..', '..');
const dirs = ['modulos/perfil', 'modulos/configuracion'];

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

const barraVieja = /<header class="barra-app">[\s\S]*?<span class="barra-app-titulo">([^<]+)<\/span>[\s\S]*?<\/header>/;

const barraNueva = (titulo) => `<header class="barra-app">
                <button type="button" class="boton-menu-movil btn btn-link" id="btn-menu-movil"
                    data-bs-toggle="offcanvas" data-bs-target="#sidebar" aria-controls="sidebar"
                    aria-label="Abrir menú de navegación">☰</button>
                <span class="barra-app-titulo">${titulo}</span>
            </header>`;

dirs.forEach((dir) => {
    const rutaDir = path.join(raiz, dir);
    fs.readdirSync(rutaDir).filter((f) => f.endsWith('.html')).forEach((archivo) => {
        const ruta = path.join(rutaDir, archivo);
        let c = fs.readFileSync(ruta, 'utf8');
        if (c.includes('offcanvas offcanvas-start')) return;

        const titulo = (c.match(barraVieja) || [])[1] || 'Panel';
        c = c.replace(sidebarViejo, sidebarNuevo);
        c = c.replace(barraVieja, barraNueva(titulo.trim()));
        c = c.replace('<main class="pagina-app">', '<main class="pagina-app" id="contenido-principal">');
        fs.writeFileSync(ruta, c, 'utf8');
        console.log('OK', path.join(dir, archivo));
    });
});
