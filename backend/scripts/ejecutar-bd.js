require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { obtenerPool } = require('../config/db');

async function ejecutarScript() {
    const rutaSql = path.join(__dirname, '..', '..', 'BDpls.sql');
    const contenido = fs.readFileSync(rutaSql, 'utf8');
    const lotes = contenido
        .split(/^\s*GO\s*$/gim)
        .map((lote) => lote.trim())
        .filter(Boolean);

    const pool = await obtenerPool();
    console.log(`Ejecutando ${lotes.length} lotes desde BDpls.sql...`);

    for (let i = 0; i < lotes.length; i++) {
        const lote = lotes[i];
        try {
            await pool.request().batch(lote);
            console.log(`Lote ${i + 1}/${lotes.length}: OK`);
        } catch (error) {
            console.error(`Lote ${i + 1}/${lotes.length}: ERROR`);
            console.error(error.message);
            console.error(lote.slice(0, 200) + '...');
            process.exit(1);
        }
    }

    console.log('Script completado.');
}

ejecutarScript()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error.message);
        process.exit(1);
    });
