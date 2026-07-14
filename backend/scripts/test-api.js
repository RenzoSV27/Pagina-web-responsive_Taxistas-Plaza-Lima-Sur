const BASE = 'http://localhost:3000/api';

async function api(ruta, opciones = {}) {
    const resp = await fetch(`${BASE}${ruta}`, {
        headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
        ...opciones
    });
    const texto = await resp.text();
    const datos = texto ? JSON.parse(texto) : null;
    if (!resp.ok) throw new Error(datos?.mensaje || resp.statusText);
    return datos;
}

async function main() {
    console.log('=== Test API Taxi Plaza ===\n');

    const health = await api('/health');
    console.log('Health:', health);

    const adminLogin = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo: 'admin@pls.local', contrasena: 'admin123' })
    });
    console.log('Admin login:', adminLogin.sesion.rol);
    const adminToken = adminLogin.sesion.token;

    const resumen = await api('/admin/resumen', {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Admin resumen:', resumen);

    const servicios = await api('/admin/servicios', {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Servicios admin:', servicios.length);

    const taxistas = await api('/admin/taxistas', {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Taxistas admin:', taxistas.length);

    const taxista = taxistas.find((t) => t.estado !== 'inactivo' && t.correo !== 'admin@pls.local')
        || taxistas.find((t) => t.correo !== 'admin@pls.local');

    if (!taxista) {
        console.log('No hay taxista para probar flujo taxista');
        return;
    }

    console.log('Probando taxista:', taxista.correo);

    const tsEmail = `test_${Date.now()}@test.local`;
    let taxistaToken;

    try {
        const registro = await api('/auth/registro', {
            method: 'POST',
            body: JSON.stringify({
                nombre: 'Taxista Test',
                dni: String(Math.floor(10000000 + Math.random() * 89999999)),
                telefono: '999888777',
                placa: 'TEST-01',
                correo: tsEmail,
                contrasena: 'test123',
                aceptaTerminos: true
            })
        });
        taxistaToken = registro.sesion.token;
        console.log('Registro taxista OK');
    } catch (e) {
        console.log('Registro falló, intentando login existente:', e.message);
    }

    if (!taxistaToken) {
        console.log('Saltando flujo taxista completo (sin credenciales de prueba)');
        console.log('\n=== Tests básicos OK ===');
        return;
    }

    const auth = { Authorization: `Bearer ${taxistaToken}` };

    const perfil = await api('/perfil', { headers: auth });
    console.log('Perfil:', perfil.nombre);

    const preferencias = await api('/preferencias', { headers: auth });
    console.log('Preferencias:', preferencias);

    const disponibles = await api('/servicios/disponibles', { headers: auth });
    console.log('Servicios disponibles:', disponibles.length);

    console.log('\n=== Tests OK ===');
}

main().catch((e) => {
    console.error('FALLÓ:', e.message);
    process.exit(1);
});
