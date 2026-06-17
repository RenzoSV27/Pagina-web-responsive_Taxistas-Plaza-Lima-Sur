document.addEventListener('DOMContentLoaded', async () => {
    await LayoutApp.inicializar('perfil');

    const perfil = await ServicioPerfil.obtenerPerfil();

    document.getElementById('perfil-nombre').textContent = perfil.nombre;
    document.getElementById('perfil-dni').textContent = perfil.dni;
    document.getElementById('perfil-telefono').textContent = perfil.telefono;
    document.getElementById('perfil-correo').textContent = perfil.correo;
    document.getElementById('perfil-placa').textContent = perfil.placa;
    document.getElementById('perfil-vehiculo').textContent = perfil.vehiculo;
    document.getElementById('perfil-calificacion').textContent = perfil.calificacion.toFixed(1);
    document.getElementById('perfil-viajes').textContent = String(perfil.viajesTotales);
});
