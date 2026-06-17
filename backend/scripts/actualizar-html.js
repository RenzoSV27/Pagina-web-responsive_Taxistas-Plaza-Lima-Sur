const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..', '..');

function procesarDirectorio(directorio) {
    for (const entrada of fs.readdirSync(directorio, { withFileTypes: true })) {
        const ruta = path.join(directorio, entrada.name);
        if (entrada.isDirectory()) {
            procesarDirectorio(ruta);
        } else if (entrada.name.endsWith('.html')) {
            actualizarHtml(ruta);
        }
    }
}

function actualizarHtml(ruta) {
    let contenido = fs.readFileSync(ruta, 'utf8');
    if (!contenido.includes('datos-ejemplo.js')) return;

    contenido = contenido.replace(
        /<script src="([^"]*)assets\/js\/datos\/datos-ejemplo\.js"><\/script>\r?\n/g,
        '<script src="$1assets/js/nucleo/config-api.js"></script>\n    <script src="$1assets/js/nucleo/almacenamiento.js"></script>\n    <script src="$1assets/js/nucleo/api-cliente.js"></script>\n'
    );

    if (ruta.includes('configuracion.html')) {
        contenido = contenido.replace(
            '<script src="../../../assets/js/servicios/servicio-perfil.js"></script>',
            '<script src="../../../assets/js/servicios/servicio-perfil.js"></script>\n    <script src="../../../assets/js/servicios/servicio-ayuda.js"></script>'
        );
    }

    if (ruta.includes('centro-ayuda.html') || ruta.includes('soporte-contacto.html')) {
        if (!contenido.includes('servicio-ayuda.js')) {
            contenido = contenido.replace(
                '<script src="../../../assets/js/nucleo/api-cliente.js"></script>',
                '<script src="../../../assets/js/nucleo/api-cliente.js"></script>\n    <script src="../../../assets/js/servicios/servicio-autenticacion.js"></script>\n    <script src="../../../assets/js/servicios/servicio-ayuda.js"></script>'
            );
        }
    }

    fs.writeFileSync(ruta, contenido, 'utf8');
    console.log('Actualizado:', path.relative(raiz, ruta));
}

procesarDirectorio(raiz);
console.log('Listo.');
