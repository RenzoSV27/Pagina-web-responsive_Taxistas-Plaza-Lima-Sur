require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { consultarUno, ejecutar, obtenerPool } = require('../config/db');
const { esAdmin } = require('../utils/roles');

const ADMIN_CORREO = (process.env.ADMIN_CORREO || 'admin@pls.local').trim().toLowerCase();
const ADMIN_CONTRASENA = process.env.ADMIN_CONTRASENA || 'admin123';
const ADMIN_NOMBRE = process.env.ADMIN_NOMBRE || 'Administrador';
const ADMIN_DNI = process.env.ADMIN_DNI || '00000001';

async function crearAdmin() {
    try {
        await obtenerPool();

        const existente = await consultarUno(
            'SELECT id, correo FROM dbo.taxistas WHERE correo = @correo',
            { correo: ADMIN_CORREO }
        );

        const hash = await bcrypt.hash(ADMIN_CONTRASENA, 10);

        if (existente) {
            await ejecutar(`
                UPDATE dbo.taxistas SET
                    contrasena_hash = @hash,
                    estado = N'inactivo',
                    nombre = @nombre
                WHERE id = @id
            `, { hash, nombre: ADMIN_NOMBRE, id: existente.id });

            console.log(`Administrador actualizado: ${ADMIN_CORREO}`);
            console.log(`Contraseña: ${ADMIN_CONTRASENA}`);
            process.exit(0);
            return;
        }

        const resultado = await ejecutar(`
            INSERT INTO dbo.taxistas (
                nombre, dni, telefono, correo, contrasena_hash,
                placa, vehiculo, estado, acepta_terminos
            )
            OUTPUT INSERTED.id
            VALUES (
                @nombre, @dni, N'000000000', @correo, @hash,
                N'ADMIN-01', N'N/A', N'inactivo', 1
            )
        `, {
            nombre: ADMIN_NOMBRE,
            dni: ADMIN_DNI,
            correo: ADMIN_CORREO,
            hash
        });

        const adminId = resultado.recordset[0].id;

        const prefs = await consultarUno(
            'SELECT id FROM dbo.preferencias_taxista WHERE taxista_id = @id',
            { id: adminId }
        );

        if (!prefs) {
            await ejecutar(
                'INSERT INTO dbo.preferencias_taxista (taxista_id) VALUES (@id)',
                { id: adminId }
            );
        }

        if (!esAdmin(ADMIN_CORREO)) {
            console.warn('Advertencia: ADMIN_CORREO no está en ADMIN_CORREOS del .env');
        }

        console.log('Administrador creado correctamente.');
        console.log(`Correo: ${ADMIN_CORREO}`);
        console.log(`Contraseña: ${ADMIN_CONTRASENA}`);
        process.exit(0);
    } catch (error) {
        console.error('Error al crear administrador:', error.message);
        process.exit(1);
    }
}

crearAdmin();
