const Animaciones = {
    _respetaMovimientoReducido() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    _timeline(opciones = {}) {
        if (this._respetaMovimientoReducido() || typeof gsap === 'undefined') return null;
        return gsap.timeline(opciones);
    },

    entradaPagina(selector = 'main, .pagina-app, .pagina-auth, .pagina-publica main') {
        const tl = this._timeline();
        if (!tl) return;

        const objetivos = gsap.utils.toArray(selector);
        if (!objetivos.length) return;

        gsap.set(objetivos, { opacity: 0, y: 24 });
        tl.to(objetivos, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
            stagger: 0.08
        });
    },

    landing() {
        if (this._respetaMovimientoReducido() || typeof gsap === 'undefined') return;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.barra-navegacion', { y: -20, opacity: 0, duration: 0.5 })
            .from('.hero-contenido > *', { y: 40, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.2')
            .from('.tarjeta-hero-flotante', { scale: 0.85, opacity: 0, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.5')
            .from('.seccion-beneficios h2', { y: 30, opacity: 0, duration: 0.5 }, '-=0.2')
            .from('.tarjeta-beneficio', { y: 36, opacity: 0, duration: 0.55, stagger: 0.1 }, '-=0.25')
            .from('.seccion-cta > *', { y: 28, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.15')
            .from('.pie-sitio', { opacity: 0, duration: 0.4 }, '-=0.1');

        gsap.to('.tarjeta-hero-flotante', {
            y: -10,
            duration: 2.4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });
    },

    panel() {
        if (this._respetaMovimientoReducido() || typeof gsap === 'undefined') return;

        const esNavegacionInterna = sessionStorage.getItem('panel-activo') === '1';
        sessionStorage.setItem('panel-activo', '1');

        if (esNavegacionInterna) {
            gsap.fromTo('.pagina-app',
                { opacity: 0.97 },
                { opacity: 1, duration: 0.18, ease: 'power1.out' }
            );
            return;
        }

        gsap.from('.pagina-app > *', {
            y: 10,
            opacity: 0,
            duration: 0.32,
            stagger: 0.03,
            ease: 'power2.out',
            clearProps: 'transform,opacity'
        });
    },

    tarjetas(selector, contenedor = document) {
        if (this._respetaMovimientoReducido() || typeof gsap === 'undefined') return;

        const elementos = contenedor.querySelectorAll(selector);
        if (!elementos.length) return;

        gsap.from(elementos, {
            y: 8,
            opacity: 0.85,
            duration: 0.28,
            stagger: 0.04,
            ease: 'power1.out',
            clearProps: 'transform,opacity'
        });
    },

    revelarContenido(contenedor) {
        if (!contenedor || this._respetaMovimientoReducido() || typeof gsap === 'undefined') return;

        gsap.fromTo(contenedor,
            { opacity: 0.9 },
            { opacity: 1, duration: 0.22, ease: 'power1.out' }
        );
    },

    listaDinamica(contenedor) {
        if (!contenedor) return;
        this.tarjetas('.tarjeta, .tarjeta-servicio, .tarjeta-estadistica, tr', contenedor);
    },

    barraProgreso(relleno) {
        if (!relleno || this._respetaMovimientoReducido() || typeof gsap === 'undefined') return;

        gsap.fromTo(relleno,
            { width: '0%' },
            { width: relleno.style.width || '0%', duration: 0.9, ease: 'power2.out' }
        );
    },

    botonHover(selector = '.boton-primario, .boton-hero-primario, .boton-nav-registro') {
        if (this._respetaMovimientoReducido() || typeof gsap === 'undefined') return;

        document.querySelectorAll(selector).forEach((boton) => {
            boton.addEventListener('mouseenter', () => {
                gsap.to(boton, { scale: 1.04, duration: 0.2, ease: 'power2.out' });
            });
            boton.addEventListener('mouseleave', () => {
                gsap.to(boton, { scale: 1, duration: 0.2, ease: 'power2.out' });
            });
        });
    },

    autenticacion() {
        if (this._respetaMovimientoReducido() || typeof gsap === 'undefined') return;

        gsap.from('.barra-navegacion', { y: -16, opacity: 0, duration: 0.45, ease: 'power2.out' });
        gsap.from('.tarjeta-auth', {
            y: 32,
            opacity: 0,
            scale: 0.97,
            duration: 0.65,
            ease: 'back.out(1.2)'
        });
        this.botonHover('.boton-primario');
    },

    observarRejilla(rejillaSelector) {
        if (this._respetaMovimientoReducido() || typeof gsap === 'undefined') return;

        const rejilla = document.querySelector(rejillaSelector);
        if (!rejilla) return;

        const observador = new MutationObserver(() => {
            if (rejilla.children.length) {
                this.listaDinamica(rejilla);
                observador.disconnect();
            }
        });

        observador.observe(rejilla, { childList: true });
    }
};
