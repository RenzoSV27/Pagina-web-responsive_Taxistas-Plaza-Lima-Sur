(function () {
    const CLAVE = Almacenamiento.CLAVES.ACCESIBILIDAD;

    function cargarPreferencias() {
        return Almacenamiento.obtener(CLAVE) || {};
    }

    function guardarPreferencias(preferencias) {
        Almacenamiento.guardar(CLAVE, preferencias);
    }

    function aplicarPreferencias(preferencias) {
        const raiz = document.documentElement;
        raiz.classList.toggle('alto-contraste', Boolean(preferencias.altoContraste));
        raiz.classList.toggle('texto-grande', Boolean(preferencias.textoGrande));

        const entradaAltoContraste = document.getElementById('alto-contraste');
        const entradaTextoGrande = document.getElementById('texto-grande');

        if (entradaAltoContraste) entradaAltoContraste.checked = Boolean(preferencias.altoContraste);
        if (entradaTextoGrande) entradaTextoGrande.checked = Boolean(preferencias.textoGrande);
    }

    function actualizarPreferencia(clave, activado) {
        const preferencias = cargarPreferencias();
        preferencias[clave] = activado;
        guardarPreferencias(preferencias);
        aplicarPreferencias(preferencias);
    }

    aplicarPreferencias(cargarPreferencias());

    const entradaAltoContraste = document.getElementById('alto-contraste');
    const entradaTextoGrande = document.getElementById('texto-grande');

    if (entradaAltoContraste) {
        entradaAltoContraste.addEventListener('change', () => {
            actualizarPreferencia('altoContraste', entradaAltoContraste.checked);
        });
    }

    if (entradaTextoGrande) {
        entradaTextoGrande.addEventListener('change', () => {
            actualizarPreferencia('textoGrande', entradaTextoGrande.checked);
        });
    }

    const contenedor = document.querySelector('.contenedor-accesibilidad');
    const boton = document.querySelector('.boton-accesibilidad');
    const panel = document.getElementById('panel-accesibilidad');

    if (!contenedor || !boton || !panel) return;

    function establecerPanelAbierto(abierto) {
        contenedor.classList.toggle('abierto', abierto);
        boton.setAttribute('aria-expanded', String(abierto));
        panel.hidden = !abierto;
    }

    boton.addEventListener('click', (evento) => {
        evento.stopPropagation();
        establecerPanelAbierto(!contenedor.classList.contains('abierto'));
    });

    document.addEventListener('click', (evento) => {
        if (!contenedor.classList.contains('abierto')) return;
        if (!contenedor.contains(evento.target)) establecerPanelAbierto(false);
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && contenedor.classList.contains('abierto')) {
            establecerPanelAbierto(false);
            boton.focus();
        }
    });
})();
