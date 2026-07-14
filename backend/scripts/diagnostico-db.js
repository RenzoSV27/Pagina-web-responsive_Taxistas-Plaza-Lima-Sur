require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { obtenerPool } = require('../config/db');

async function main() {
    const pool = await obtenerPool();

    const tablas = [
        'taxistas',
        'sesiones',
        'servicios',
        'servicios_activos',
        'historial_servicios',
        'pagos',
        'notificaciones',
        'preferencias_taxista',
        'preguntas_frecuentes',
        'mensajes_soporte',
        'tokens_recuperacion_contrasena'
    ];

    const tablasExistentes = await pool.request().query(`
        SELECT TABLE_SCHEMA, TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
    `);

    console.log(`Tablas encontradas en ${process.env.DB_NAME}: ${tablasExistentes.recordset.length}`);
    tablasExistentes.recordset.forEach((fila) => {
        console.log(`  - ${fila.TABLE_SCHEMA}.${fila.TABLE_NAME}`);
    });
    console.log('');

    for (const tabla of tablas) {
        try {
            const resultado = await pool.request().query(`SELECT COUNT(*) AS total FROM dbo.${tabla}`);
            console.log(`${tabla}: ${resultado.recordset[0].total} filas`);
        } catch (error) {
            console.log(`${tabla}: ERROR -> ${error.message}`);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Conexion:', error.message);
        process.exit(1);
    });
