const { consultarUno } = require('../config/db');
const { obtenerRol, ROLES } = require('../utils/roles');

async function autenticar(req, res, next) {
    const encabezado = req.headers.authorization;
    if (!encabezado || !encabezado.startsWith('Bearer ')) {
        return res.status(401).json({ exito: false, mensaje: 'Sesión no válida.' });
    }

    const token = encabezado.slice(7);

    try {
        const sesion = await consultarUno(`
            SELECT s.id, s.taxista_id, s.expira_en, s.activa,
                   t.nombre, t.correo, t.estado
            FROM dbo.sesiones s
            INNER JOIN dbo.taxistas t ON t.id = s.taxista_id
            WHERE s.token = @token AND s.activa = 1 AND s.expira_en > SYSDATETIME()
        `, { token });

        if (!sesion) {
            return res.status(401).json({ exito: false, mensaje: 'Sesión expirada o inválida.' });
        }

        req.taxistaId = sesion.taxista_id;
        req.sesion = sesion;
        req.rol = obtenerRol(sesion.correo);
        next();
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al validar la sesión.' });
    }
}

function requiereAdmin(req, res, next) {
    if (req.rol !== ROLES.ADMIN) {
        return res.status(403).json({ exito: false, mensaje: 'Acceso restringido a administradores.' });
    }
    next();
}

function requiereTaxista(req, res, next) {
    if (req.rol === ROLES.ADMIN) {
        return res.status(403).json({ exito: false, mensaje: 'Los administradores deben usar el panel de administración.' });
    }
    next();
}

module.exports = { autenticar, requiereAdmin, requiereTaxista };
