require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectTimeout: 15000,
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

async function obtenerPool() {
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
}

async function consultar(query, params = {}) {
    const conexion = await obtenerPool();
    const peticion = conexion.request();
    for (const [nombre, valor] of Object.entries(params)) {
        peticion.input(nombre, valor);
    }
    const resultado = await peticion.query(query);
    return resultado.recordset;
}

async function consultarUno(query, params = {}) {
    const filas = await consultar(query, params);
    return filas[0] || null;
}

async function ejecutar(query, params = {}) {
    const conexion = await obtenerPool();
    const peticion = conexion.request();
    for (const [nombre, valor] of Object.entries(params)) {
        peticion.input(nombre, valor);
    }
    const resultado = await peticion.query(query);
    return resultado;
}

module.exports = {
    sql,
    obtenerPool,
    consultar,
    consultarUno,
    ejecutar
};
