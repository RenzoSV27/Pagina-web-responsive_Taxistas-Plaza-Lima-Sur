(function () {
    try {
        const preferencias = JSON.parse(localStorage.getItem('taxi-plaza-accesibilidad') || '{}');
        const raiz = document.documentElement;
        if (preferencias.altoContraste) raiz.classList.add('alto-contraste');
        if (preferencias.textoGrande) raiz.classList.add('texto-grande');
    } catch {
        /* ignorar */
    }
})();
