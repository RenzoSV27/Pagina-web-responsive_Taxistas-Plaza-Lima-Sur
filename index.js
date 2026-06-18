document.addEventListener('DOMContentLoaded', () => {
    LayoutPublico.inicializar();
    if (typeof Animaciones !== 'undefined') {
        Animaciones.landing();
        Animaciones.botonHover();
    }
});
