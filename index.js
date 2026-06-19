document.addEventListener('DOMContentLoaded', () => {
    LayoutPublico.inicializar();

    if (typeof Animaciones !== 'undefined') {
        Animaciones.landing();
        Animaciones.botonHover();
    }

    const loginBtn = document.querySelector('.boton-nav-login');
    const registroBtn = document.querySelector('.boton-nav-registro');
    const itemPanel = document.getElementById('item-ir-panel');

    if (
        typeof ServicioAutenticacion !== 'undefined' &&
        ServicioAutenticacion.estaAutenticado()
    ) {

        // Ocultar Login
        if (loginBtn) {
            loginBtn.closest('li').style.display = 'none';
        }

        // Ocultar Registro
        if (registroBtn) {
            registroBtn.closest('li').style.display = 'none';
        }

        // Mostrar Panel
        if (itemPanel) {
            itemPanel.hidden = false;
        }
    }
});