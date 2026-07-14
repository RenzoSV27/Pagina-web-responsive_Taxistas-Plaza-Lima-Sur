const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..', '..');

function procesarDirectorio(directorio) {
    for (const entrada of fs.readdirSync(directorio, { withFileTypes: true })) {
        const ruta = path.join(directorio, entrada.name);
        if (entrada.isDirectory()) {
            procesarDirectorio(ruta);
        } else if (entrada.name.endsWith('.html')) {
            limpiarDuplicados(ruta);
        }
    }
}

function limpiarDuplicados(ruta) {
    let contenido = fs.readFileSync(ruta, 'utf8');
    const patron = /(<script src="[^"]*api-cliente\.js"><\/script>\r?\n)\s*<script src="[^"]*almacenamiento\.js"><\/script>\r?\n/;
    if (!patron.test(contenido)) return;
    contenido = contenido.replace(patron, '$1');
    fs.writeFileSync(ruta, contenido, 'utf8');
    console.log('Limpiado:', path.relative(raiz, ruta));
}

procesarDirectorio(raiz);
