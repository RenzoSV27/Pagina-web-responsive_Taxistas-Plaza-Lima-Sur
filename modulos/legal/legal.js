document.addEventListener('DOMContentLoaded', () => {
    if (typeof Animaciones !== 'undefined') {
        Animaciones.entradaPagina('.pagina-legal, .pagina-contenido main, main');
        Animaciones.botonHover('.boton-nav-registro, .boton-nav-login');
    }
});
