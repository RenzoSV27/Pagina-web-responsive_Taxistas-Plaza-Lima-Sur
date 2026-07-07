document.addEventListener('DOMContentLoaded', () => {
    LayoutPublico.inicializar();

    if (typeof Animaciones !== 'undefined') {
        Animaciones.landing();
        Animaciones.botonHover();
    }

    animarContadores();

    const loginBtn = document.querySelector('.boton-nav-login');
    const registroBtn = document.querySelector('.boton-nav-registro');
    const itemPanel = document.getElementById('item-ir-panel');
    const btnPanel = document.getElementById('btn-ir-panel');

    if (
        typeof ServicioAutenticacion !== 'undefined' &&
        ServicioAutenticacion.estaAutenticado()
    ) {
        if (loginBtn) {
            loginBtn.closest('li').style.display = 'none';
        }

        if (registroBtn) {
            registroBtn.closest('li').style.display = 'none';
        }

        if (btnPanel) {
            btnPanel.href = ServicioAutenticacion.obtenerRutaPanel();
        }

        if (itemPanel) {
            itemPanel.hidden = false;
        }
    }
});

function animarContadores() {
    const numeros = document.querySelectorAll('.stat-numero[data-objetivo]');
    if (!numeros.length) return;

    const respetaMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;

            const el = entrada.target;
            const objetivo = Number(el.dataset.objetivo);
            if (respetaMovimiento || typeof gsap === 'undefined') {
                el.textContent = String(objetivo) + (el.dataset.sufijo || '');
            } else {
                const contador = { valor: 0 };
                const sufijo = el.dataset.sufijo || '';
                gsap.to(contador, {
                    valor: objetivo,
                    duration: 1.8,
                    ease: 'power2.out',
                    onUpdate: () => {
                        el.textContent = String(Math.round(contador.valor)) + sufijo;
                    }
                });
            }
            observador.unobserve(el);
        });
    }, { threshold: 0.4 });

    numeros.forEach((num) => observador.observe(num));
}
