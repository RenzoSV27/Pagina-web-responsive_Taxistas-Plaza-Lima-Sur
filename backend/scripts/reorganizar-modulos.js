/**
 * Reorganiza modulos/ a estructura más plana y actualiza rutas en todo el proyecto.
 * Ejecutar una sola vez: node backend/scripts/reorganizar-modulos.js
 */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..', '..');

const movimientos = [
    ['modulos/autenticacion/login.html', 'modulos/autenticacion/login.html'],
    ['modulos/autenticacion/login.js', 'modulos/autenticacion/login.js'],
    ['modulos/autenticacion/registro.html', 'modulos/autenticacion/registro.html'],
    ['modulos/autenticacion/registro/registro.js', 'modulos/autenticacion/registro.js'],
    ['modulos/autenticacion/recuperar.html', 'modulos/autenticacion/recuperar.html'],
    ['modulos/autenticacion/recuperar-contrasena/recuperar-contrasena.js', 'modulos/autenticacion/recuperar.js'],
    ['modulos/legal/terminos.html', 'modulos/legal/terminos.html'],
    ['modulos/legal/privacidad.html', 'modulos/legal/privacidad.html'],
    ['modulos/ayuda/centro-ayuda.html', 'modulos/ayuda/centro-ayuda.html'],
    ['modulos/ayuda/centro-ayuda/centro-ayuda.js', 'modulos/ayuda/centro-ayuda.js'],
    ['modulos/ayuda/soporte.html', 'modulos/ayuda/soporte.html'],
    ['modulos/ayuda/soporte-contacto/soporte.js', 'modulos/ayuda/soporte.js'],
    ['modulos/configuracion/configuracion.html', 'modulos/configuracion/configuracion.html'],
    ['modulos/configuracion/configuracion/configuracion.css', 'modulos/configuracion/configuracion.css'],
    ['modulos/configuracion/configuracion/configuracion.js', 'modulos/configuracion/configuracion.js'],
    ['modulos/perfil/perfil.html', 'modulos/perfil/perfil.html'],
    ['modulos/perfil/perfil-taxista/perfil.css', 'modulos/perfil/perfil.css'],
    ['modulos/perfil/perfil-taxista/perfil.js', 'modulos/perfil/perfil.js'],
    ['modulos/perfil/editar.html', 'modulos/perfil/editar.html'],
    ['modulos/perfil/editar-perfil/editar.css', 'modulos/perfil/editar.css'],
    ['modulos/perfil/editar-perfil/editar.js', 'modulos/perfil/editar.js'],
    ['modulos/perfil/contrasena.html', 'modulos/perfil/contrasena.html'],
    ['modulos/perfil/cambio-contrasena/contrasena.css', 'modulos/perfil/contrasena.css'],
    ['modulos/perfil/cambio-contrasena/contrasena.js', 'modulos/perfil/contrasena.js'],
    ['modulos/panel/dashboard.html', 'modulos/panel/dashboard.html'],
    ['modulos/panel/dashboard.css', 'modulos/panel/dashboard.css'],
    ['modulos/panel/dashboard.js', 'modulos/panel/dashboard.js'],
    ['modulos/panel/servicios.html', 'modulos/panel/servicios.html'],
    ['modulos/panel/servicios-disponibles/servicios.css', 'modulos/panel/servicios.css'],
    ['modulos/panel/servicios-disponibles/servicios.js', 'modulos/panel/servicios.js'],
    ['modulos/panel/historial.html', 'modulos/panel/historial.html'],
    ['modulos/panel/historial/historial.css', 'modulos/panel/historial.css'],
    ['modulos/panel/historial/historial.js', 'modulos/panel/historial.js'],
    ['modulos/panel/ganancias.html', 'modulos/panel/ganancias.html'],
    ['modulos/panel/ganancias/ganancias.css', 'modulos/panel/ganancias.css'],
    ['modulos/panel/ganancias/ganancias.js', 'modulos/panel/ganancias.js'],
    ['modulos/panel/notificaciones.html', 'modulos/panel/notificaciones.html'],
    ['modulos/panel/notificaciones/notificaciones.css', 'modulos/panel/notificaciones.css'],
    ['modulos/panel/notificaciones/notificaciones.js', 'modulos/panel/notificaciones.js'],
    ['modulos/panel/servicio/detalle.html', 'modulos/panel/servicio/detalle.html'],
    ['modulos/panel/detalle-servicio/detalle.css', 'modulos/panel/servicio/detalle.css'],
    ['modulos/panel/detalle-servicio/detalle.js', 'modulos/panel/servicio/detalle.js'],
    ['modulos/panel/servicio/aceptado.html', 'modulos/panel/servicio/aceptado.html'],
    ['modulos/panel/servicio-aceptado/aceptado.css', 'modulos/panel/servicio/aceptado.css'],
    ['modulos/panel/servicio-aceptado/aceptado.js', 'modulos/panel/servicio/aceptado.js'],
    ['modulos/panel/servicio/recogida.html', 'modulos/panel/servicio/recogida.html'],
    ['modulos/panel/punto-recogida/recogida.css', 'modulos/panel/servicio/recogida.css'],
    ['modulos/panel/punto-recogida/recogida.js', 'modulos/panel/servicio/recogida.js'],
    ['modulos/panel/servicio/confirmacion-recogida.html', 'modulos/panel/servicio/confirmacion-recogida.html'],
    ['modulos/panel/confirmacion-recogida/confirmacion-recogida.css', 'modulos/panel/servicio/confirmacion-recogida.css'],
    ['modulos/panel/confirmacion-recogida/confirmacion-recogida.js', 'modulos/panel/servicio/confirmacion-recogida.js'],
    ['modulos/panel/servicio/en-curso.html', 'modulos/panel/servicio/en-curso.html'],
    ['modulos/panel/servicio-en-curso/en-curso.css', 'modulos/panel/servicio/en-curso.css'],
    ['modulos/panel/servicio-en-curso/en-curso.js', 'modulos/panel/servicio/en-curso.js'],
    ['modulos/panel/servicio/destino.html', 'modulos/panel/servicio/destino.html'],
    ['modulos/panel/destino-entrega/destino.css', 'modulos/panel/servicio/destino.css'],
    ['modulos/panel/destino-entrega/destino.js', 'modulos/panel/servicio/destino.js'],
    ['modulos/panel/servicio/confirmacion-entrega.html', 'modulos/panel/servicio/confirmacion-entrega.html'],
    ['modulos/panel/confirmacion-entrega/confirmacion-entrega.css', 'modulos/panel/servicio/confirmacion-entrega.css'],
    ['modulos/panel/confirmacion-entrega/confirmacion-entrega.js', 'modulos/panel/servicio/confirmacion-entrega.js']
];

const reemplazosRutas = [
    ['modulos/autenticacion/login.html', 'modulos/autenticacion/login.html'],
    ['modulos/autenticacion/login.js', 'modulos/autenticacion/login.js'],
    ['login.html', 'login.html'],
    ['registro.html', 'registro.html'],
    ['recuperar.html', 'recuperar.html'],
    ['modulos/autenticacion/registro.html', 'modulos/autenticacion/registro.html'],
    ['modulos/autenticacion/recuperar.html', 'modulos/autenticacion/recuperar.html'],
    ['modulos/legal/terminos.html', 'modulos/legal/terminos.html'],
    ['modulos/legal/privacidad.html', 'modulos/legal/privacidad.html'],
    ['terminos.html', 'terminos.html'],
    ['privacidad.html', 'privacidad.html'],
    ['../legal/terminos.html', '../legal/terminos.html'],
    ['../legal/privacidad.html', '../legal/privacidad.html'],
    ['modulos/ayuda/soporte.html', 'modulos/ayuda/soporte.html'],
    ['soporte.html', 'soporte.html'],
    ['../ayuda/soporte.html', '../ayuda/soporte.html'],
    ['modulos/ayuda/centro-ayuda.html', 'modulos/ayuda/centro-ayuda.html'],
    ['../ayuda/centro-ayuda.html', '../ayuda/centro-ayuda.html'],
    ['modulos/configuracion/configuracion.html', 'modulos/configuracion/configuracion.html'],
    ['../configuracion/configuracion.html', '../configuracion/configuracion.html'],
    ['modulos/perfil/perfil.html', 'modulos/perfil/perfil.html'],
    ['modulos/perfil/editar.html', 'modulos/perfil/editar.html'],
    ['modulos/perfil/contrasena.html', 'modulos/perfil/contrasena.html'],
    ['perfil.html', 'perfil.html'],
    ['editar.html', 'editar.html'],
    ['contrasena.html', 'contrasena.html'],
    ['modulos/panel/dashboard.html', 'modulos/panel/dashboard.html'],
    ['modulos/panel/servicios.html', 'modulos/panel/servicios.html'],
    ['modulos/panel/historial.html', 'modulos/panel/historial.html'],
    ['modulos/panel/ganancias.html', 'modulos/panel/ganancias.html'],
    ['modulos/panel/notificaciones.html', 'modulos/panel/notificaciones.html'],
    ['servicios.html', 'servicios.html'],
    ['historial.html', 'historial.html'],
    ['ganancias.html', 'ganancias.html'],
    ['dashboard.html', 'dashboard.html'],
    ['modulos/panel/servicio/detalle.html', 'modulos/panel/servicio/detalle.html'],
    ['modulos/panel/servicio/aceptado.html', 'modulos/panel/servicio/aceptado.html'],
    ['modulos/panel/servicio/recogida.html', 'modulos/panel/servicio/recogida.html'],
    ['modulos/panel/servicio/confirmacion-recogida.html', 'modulos/panel/servicio/confirmacion-recogida.html'],
    ['modulos/panel/servicio/en-curso.html', 'modulos/panel/servicio/en-curso.html'],
    ['modulos/panel/servicio/destino.html', 'modulos/panel/servicio/destino.html'],
    ['modulos/panel/servicio/confirmacion-entrega.html', 'modulos/panel/servicio/confirmacion-entrega.html'],
    ['detalle.html', 'detalle.html'],
    ['aceptado.html', 'aceptado.html'],
    ['recogida.html', 'recogida.html'],
    ['confirmacion-recogida.html', 'confirmacion-recogida.html'],
    ['en-curso.html', 'en-curso.html'],
    ['destino.html', 'destino.html'],
    ['confirmacion-entrega.html', 'confirmacion-entrega.html'],
    ['modulos/panel/servicio/aceptado.html', 'modulos/panel/servicio/aceptado.html'],
    ['modulos/panel/servicio/recogida.html', 'modulos/panel/servicio/recogida.html'],
    ['modulos/panel/servicio/confirmacion-recogida.html', 'modulos/panel/servicio/confirmacion-recogida.html'],
    ['modulos/panel/servicio/en-curso.html', 'modulos/panel/servicio/en-curso.html'],
    ['modulos/panel/servicio/destino.html', 'modulos/panel/servicio/destino.html'],
    ['modulos/panel/servicio/confirmacion-entrega.html', 'modulos/panel/servicio/confirmacion-entrega.html'],
    ['../autenticacion/login.html', '../autenticacion/login.html'],
    ['../autenticacion/registro.html', '../autenticacion/registro.html'],
    ['autenticacion.css', 'autenticacion.css'],
    ['autenticacion.css', 'autenticacion.css'],
    ['autenticacion.css', 'autenticacion.css'],
    ['legal.css', 'legal.css'],
    ['legal.css', 'legal.css'],
    ['ayuda.css', 'ayuda.css'],
    ['ayuda.css', 'ayuda.css'],
    ['legal.js', 'legal.js'],
    ['legal.js', 'legal.js'],
    ['soporte.js', 'soporte.js'],
    ['dashboard.css', 'dashboard.css'],
    ['dashboard.js', 'dashboard.js'],
    ['servicios.css', 'servicios.css'],
    ['servicios.js', 'servicios.js'],
    ['detalle.css', 'detalle.css'],
    ['detalle.js', 'detalle.js'],
    ['aceptado.css', 'aceptado.css'],
    ['aceptado.js', 'aceptado.js'],
    ['recogida.css', 'recogida.css'],
    ['recogida.js', 'recogida.js'],
    ['en-curso.css', 'en-curso.css'],
    ['en-curso.js', 'en-curso.js'],
    ['destino.css', 'destino.css'],
    ['destino.js', 'destino.js'],
    ['perfil.css', 'perfil.css'],
    ['perfil.js', 'perfil.js'],
    ['editar.css', 'editar.css'],
    ['editar.js', 'editar.js'],
    ['contrasena.css', 'contrasena.css'],
    ['contrasena.js', 'contrasena.js']
];

const carpetasEliminar = [
    'modulos/autenticacion/inicio-sesion',
    'modulos/autenticacion/recuperar-contrasena',
    'modulos/legal/terminos-condiciones',
    'modulos/legal/politica-privacidad',
    'modulos/ayuda/centro-ayuda',
    'modulos/ayuda/soporte-contacto',
    'modulos/configuracion/configuracion',
    'modulos/perfil/perfil-taxista',
    'modulos/perfil/editar-perfil',
    'modulos/perfil/cambio-contrasena',
    'modulos/panel/dashboard',
    'modulos/panel/servicios-disponibles',
    'modulos/panel/historial',
    'modulos/panel/ganancias',
    'modulos/panel/notificaciones',
    'modulos/panel/detalle-servicio',
    'modulos/panel/servicio-aceptado',
    'modulos/panel/punto-recogida',
    'modulos/panel/confirmacion-recogida',
    'modulos/panel/servicio-en-curso',
    'modulos/panel/destino-entrega',
    'modulos/panel/confirmacion-entrega'
];

function asegurarDirectorio(ruta) {
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
}

function aplicarReemplazos(contenido, extra = []) {
    let resultado = contenido;
    const todos = [...reemplazosRutas, ...extra];
    for (const [buscar, reemplazar] of todos) {
        resultado = resultado.split(buscar).join(reemplazar);
    }
    return resultado;
}

function ajustarProfundidad(contenido, profundidad) {
    const prefijo = '../'.repeat(profundidad);
    return contenido
        .replace(/\.\.\/\.\.\/\.\.\/assets/g, `${prefijo}assets`)
        .replace(/\.\.\/\.\.\/\.\.\/index\.html/g, `${prefijo}index.html`)
        .replace(/data-ruta-raiz="\.\.\/\.\.\/\.\.\/"/g, `data-ruta-raiz="${prefijo}"`)
        .replace(/\.\.\/\.\.\/assets/g, `${prefijo}assets`)
        .replace(/\.\.\/\.\.\/index\.html/g, `${prefijo}index.html`)
        .replace(/data-ruta-raiz="\.\.\/\.\.\/"/g, `data-ruta-raiz="${prefijo}"`);
}

function moverArchivos() {
    for (const [origen, destino] of movimientos) {
        const rutaOrigen = path.join(raiz, origen);
        const rutaDestino = path.join(raiz, destino);
        if (!fs.existsSync(rutaOrigen)) {
            console.warn('Omitido (no existe):', origen);
            continue;
        }
        asegurarDirectorio(rutaDestino);
        let contenido = fs.readFileSync(rutaOrigen, 'utf8');
        const profundidad = destino.split('/').length - 1;
        contenido = ajustarProfundidad(contenido, profundidad);
        contenido = aplicarReemplazos(contenido);
        fs.writeFileSync(rutaDestino, contenido, 'utf8');
        console.log('Movido:', destino);
    }
}

function crearCssCompartidos() {
    const authCss = [
        'modulos/autenticacion/inicio-sesion/autenticacion.css',
        'modulos/autenticacion/registro/autenticacion.css',
        'modulos/autenticacion/recuperar-contrasena/autenticacion.css'
    ].map((r) => {
        const p = path.join(raiz, r);
        return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
    }).filter(Boolean).join('\n');

    fs.writeFileSync(path.join(raiz, 'modulos/autenticacion/autenticacion.css'), authCss || '/* Auth */\n', 'utf8');

    const legalCss = '/* Legal — estilos compartidos */\n';
    fs.writeFileSync(path.join(raiz, 'modulos/legal/legal.css'), legalCss, 'utf8');

    const ayudaCss = [
        'modulos/ayuda/centro-ayuda/ayuda.css',
        'modulos/ayuda/soporte-contacto/ayuda.css'
    ].map((r) => {
        const p = path.join(raiz, r);
        return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
    }).filter(Boolean).join('\n');
    fs.writeFileSync(path.join(raiz, 'modulos/ayuda/ayuda.css'), ayudaCss || '/* Ayuda */\n', 'utf8');

    fs.writeFileSync(path.join(raiz, 'modulos/legal/legal.js'), '// Legal\n', 'utf8');
}

function actualizarProyecto() {
    const extensiones = ['.html', '.js', '.css', '.json'];
    const archivos = [];

    function recorrer(dir) {
        for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
            const ruta = path.join(dir, entrada.name);
            if (entrada.isDirectory()) {
                if (entrada.name === 'node_modules') continue;
                recorrer(ruta);
            } else if (extensiones.some((ext) => entrada.name.endsWith(ext))) {
                archivos.push(ruta);
            }
        }
    }

    recorrer(raiz);

    for (const archivo of archivos) {
        if (archivo.includes(`${path.sep}modulos${path.sep}`) && carpetasEliminar.some((c) => archivo.includes(c.replace(/\//g, path.sep)))) {
            continue;
        }
        const original = fs.readFileSync(archivo, 'utf8');
        const actualizado = aplicarReemplazos(original);
        if (actualizado !== original) {
            fs.writeFileSync(archivo, actualizado, 'utf8');
            console.log('Actualizado:', path.relative(raiz, archivo));
        }
    }
}

function eliminarCarpetasVacias() {
    for (const carpeta of carpetasEliminar) {
        const ruta = path.join(raiz, carpeta);
        if (fs.existsSync(ruta)) {
            fs.rmSync(ruta, { recursive: true, force: true });
            console.log('Eliminado:', carpeta);
        }
    }
    if (fs.existsSync(path.join(raiz, 'modulos/autenticacion/registro.html'))) {
        fs.rmSync(path.join(raiz, 'modulos/autenticacion/registro'), { recursive: true, force: true });
        console.log('Eliminado: modulos/autenticacion/registro/ (carpeta antigua)');
    }
}

moverArchivos();
crearCssCompartidos();
actualizarProyecto();
eliminarCarpetasVacias();
console.log('\nReorganización completada.');
