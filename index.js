(function () {
    const CLAVE_ALMACENAMIENTO = 'taxi-plaza-accesibilidad';

    const contenedor = document.querySelector('.accessibility-container');
    const boton = document.querySelector('.accessibility-btn');
    const panel = document.getElementById('panel-accesibilidad');
    const entradaAltoContraste = document.getElementById('alto-contraste');
    const entradaTextoGrande = document.getElementById('texto-grande');
    const raiz = document.documentElement;

    function cargarPreferencias() {
        try {
            const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
            return guardado ? JSON.parse(guardado) : {};
        } catch {
            return {};
        }
    }

    function guardarPreferencias(preferencias) {
        localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(preferencias));
    }

    function aplicarPreferencias(preferencias) {
        raiz.classList.toggle('alto-contraste', Boolean(preferencias.altoContraste));
        raiz.classList.toggle('texto-grande', Boolean(preferencias.textoGrande));

        if (entradaAltoContraste) {
            entradaAltoContraste.checked = Boolean(preferencias.altoContraste);
        }
        if (entradaTextoGrande) {
            entradaTextoGrande.checked = Boolean(preferencias.textoGrande);
        }
    }

    function actualizarPreferencia(clave, activado) {
        const preferencias = cargarPreferencias();
        preferencias[clave] = activado;
        guardarPreferencias(preferencias);
        aplicarPreferencias(preferencias);
    }

    const preferenciasIniciales = cargarPreferencias();
    aplicarPreferencias(preferenciasIniciales);

    if (entradaAltoContraste) {
        entradaAltoContraste.addEventListener('change', function () {
            actualizarPreferencia('altoContraste', entradaAltoContraste.checked);
        });
    }

    if (entradaTextoGrande) {
        entradaTextoGrande.addEventListener('change', function () {
            actualizarPreferencia('textoGrande', entradaTextoGrande.checked);
        });
    }

    if (!contenedor || !boton || !panel) return;

    function establecerPanelAbierto(abierto) {
        contenedor.classList.toggle('abierto', abierto);
        boton.setAttribute('aria-expanded', String(abierto));
        panel.hidden = !abierto;
    }

    boton.addEventListener('click', function (evento) {
        evento.stopPropagation();
        establecerPanelAbierto(!contenedor.classList.contains('abierto'));
    });

    document.addEventListener('click', function (evento) {
        if (!contenedor.classList.contains('abierto')) return;
        if (!contenedor.contains(evento.target)) {
            establecerPanelAbierto(false);
        }
    });

    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape' && contenedor.classList.contains('abierto')) {
            establecerPanelAbierto(false);
            boton.focus();
        }
    });
})();
