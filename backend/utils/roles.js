const ROLES = {
    ADMIN: 'admin',
    TAXISTA: 'taxista'
};

function obtenerCorreosAdmin() {
    const valor = process.env.ADMIN_CORREOS || 'admin@pls.local';
    return valor
        .split(',')
        .map((correo) => correo.trim().toLowerCase())
        .filter(Boolean);
}

function esAdmin(correo) {
    if (!correo) return false;
    const normalizado = correo.trim().toLowerCase();
    return obtenerCorreosAdmin().includes(normalizado);
}

function obtenerRol(correo) {
    return esAdmin(correo) ? ROLES.ADMIN : ROLES.TAXISTA;
}

module.exports = {
    ROLES,
    obtenerCorreosAdmin,
    esAdmin,
    obtenerRol
};
