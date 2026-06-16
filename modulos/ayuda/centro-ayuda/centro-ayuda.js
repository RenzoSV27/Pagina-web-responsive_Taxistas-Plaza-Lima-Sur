document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('lista-faq');
    if (!lista) return;

    lista.innerHTML = DATOS_EJEMPLO.preguntasFrecuentes.map((item, indice) => `
        <li class="item-faq" id="faq-${indice}">
            <button type="button" class="boton-faq" aria-expanded="false" aria-controls="respuesta-faq-${indice}">
                <span>${item.pregunta}</span>
                <span aria-hidden="true">+</span>
            </button>
            <div id="respuesta-faq-${indice}" class="respuesta-faq" hidden>
                <p>${item.respuesta}</p>
            </div>
        </li>
    `).join('');

    lista.querySelectorAll('.boton-faq').forEach((boton) => {
        boton.addEventListener('click', () => {
            const item = boton.closest('.item-faq');
            const respuesta = item.querySelector('.respuesta-faq');
            const abierto = item.classList.toggle('abierto');
            boton.setAttribute('aria-expanded', String(abierto));
            respuesta.hidden = !abierto;
            boton.querySelector('[aria-hidden="true"]').textContent = abierto ? '−' : '+';
        });
    });
});
