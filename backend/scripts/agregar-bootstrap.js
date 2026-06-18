/**
 * Inserta Bootstrap 5 CDN + bootstrap-custom.css + bootstrap-init.js en todos los HTML.
 * Ejecutar: node backend/scripts/agregar-bootstrap.js
 */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..', '..');

const bootstrapCss = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">';
const bootstrapCustom = (prefijo) => `<link rel="stylesheet" href="${prefijo}assets/css/bootstrap-custom.css">`;
const bootstrapJs = '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>';
const bootstrapInit = (prefijo) => `<script src="${prefijo}assets/js/nucleo/bootstrap-init.js"></script>`;

function prefijoAssets(rutaArchivo) {
    const rel = path.relative(raiz, rutaArchivo);
    const profundidad = rel.split(path.sep).length - 1;
    return profundidad === 0 ? '' : '../'.repeat(profundidad);
}

function procesarHtml(rutaArchivo) {
    let contenido = fs.readFileSync(rutaArchivo, 'utf8');
    if (contenido.includes('bootstrap@5.3.3')) return false;

    const prefijo = prefijoAssets(rutaArchivo);
    const bloque = `\n    ${bootstrapCss}\n    ${bootstrapCustom(prefijo)}\n`;

    if (contenido.includes('fonts.googleapis.com')) {
        contenido = contenido.replace(
            /(<link href="https:\/\/fonts\.googleapis\.com[^>]+>)/,
            `$1${bloque}`
        );
    } else {
        contenido = contenido.replace('</head>', `${bloque}</head>`);
    }

    const scripts = `\n    ${bootstrapJs}\n    ${bootstrapInit(prefijo)}`;
    if (contenido.includes('accesibilidad.js')) {
        contenido = contenido.replace(
            /(<script src="[^"]*accesibilidad\.js"><\/script>)/,
            `$1${scripts}`
        );
    } else if (contenido.includes('</body>')) {
        contenido = contenido.replace('</body>', `${scripts}\n</body>`);
    }

    fs.writeFileSync(rutaArchivo, contenido, 'utf8');
    return true;
}

function recorrer(dir) {
    let count = 0;
    for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
        const ruta = path.join(dir, entrada.name);
        if (entrada.isDirectory()) {
            if (entrada.name === 'node_modules') continue;
            count += recorrer(ruta);
        } else if (entrada.name.endsWith('.html')) {
            if (procesarHtml(ruta)) {
                console.log('Bootstrap:', path.relative(raiz, ruta));
                count++;
            }
        }
    }
    return count;
}

const total = recorrer(raiz);
console.log(`\n${total} archivos actualizados con Bootstrap.`);
