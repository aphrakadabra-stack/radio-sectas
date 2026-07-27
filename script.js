const estado = document.getElementById("state");
const titulo = document.querySelector("h1");
const lema = document.querySelector(".subtitle");
const notaCasaLineaUno = document.querySelector(
    ".house-note-line-one"
);
const notaCasaLineaDos = document.querySelector(
    ".house-note-line-two"
);
const enlaceManifiesto = document.querySelector(".manifesto-link");
const enlaceLinktree = document.querySelector(".linktree-link");
const capaManifiesto = document.getElementById("manifesto-layer");
const marcoManifiesto = document.getElementById("manifesto-frame");
const cerrarManifiesto = document.getElementById("manifesto-close");


const idiomasDisponibles = [
    "es",
    "en",
    "de",
    "fi",
    "fr",
    "it",
    "ja",
    "zh"
];


// Obtener los idiomas preferidos del navegador

const idiomasNavegador = (
    navigator.languages || [navigator.language]
)
.map(codigo => codigo.substring(0,2));


// Usar el primer idioma compatible.
// Si ninguno está disponible, usar inglés.

const idioma =
    idiomasNavegador.find(
        codigo => idiomasDisponibles.includes(codigo)
    ) || "en";


document.documentElement.lang = idioma;


// Medir solamente el ancho visible de un texto

function medirTexto(elemento) {

    const rango = document.createRange();

    rango.selectNodeContents(elemento);

    return rango.getBoundingClientRect().width;

}


// Igualar ópticamente el ancho del estado con el lema

function ajustarEstado() {

    estado.style.fontSize = "";

    requestAnimationFrame(() => {

        const anchoLema = medirTexto(lema);
        const anchoEstado = medirTexto(estado);

        if (!anchoLema || !anchoEstado) {
            return;
        }

        const tamañoBase = parseFloat(
            window.getComputedStyle(estado).fontSize
        );

        const proporcion = Math.min(
            1.55,
            Math.max(.58, anchoLema / anchoEstado)
        );

        estado.style.fontSize =
            `${tamañoBase * proporcion}px`;

    });

}


// Mostrar un estado y ajustar su anchura

function mostrarEstado(texto) {

    estado.textContent = texto;

    ajustarEstado();

}


function abrirManifiesto(evento) {

    evento.preventDefault();

    if (!marcoManifiesto.getAttribute("src")) {
        marcoManifiesto.src = marcoManifiesto.dataset.src;
    }

    capaManifiesto.classList.add("is-open");
    capaManifiesto.setAttribute("aria-hidden","false");

    cerrarManifiesto.focus();

}


function ocultarManifiesto() {

    capaManifiesto.classList.remove("is-open");
    capaManifiesto.setAttribute("aria-hidden","true");

    enlaceManifiesto.focus();

}


enlaceManifiesto.addEventListener(
    "click",
    abrirManifiesto
);


cerrarManifiesto.addEventListener(
    "click",
    ocultarManifiesto
);


document.addEventListener("keydown",evento => {

    if (
        evento.key === "Escape" &&
        capaManifiesto.classList.contains("is-open")
    ) {
        ocultarManifiesto();
    }

});


window.addEventListener("message",evento => {

    if (
        evento.origin === window.location.origin &&
        evento.data === "UGJU_CLOSE_MANIFESTO"
    ) {
        ocultarManifiesto();
    }

});


// Cargar idioma

fetch(`lang/${idioma}.json`)

.then(respuesta => respuesta.json())

.then(textos => {


    titulo.textContent = textos.title;

    lema.textContent = textos.subtitle;

    notaCasaLineaUno.textContent = textos.house_note_1;

    notaCasaLineaDos.textContent = textos.house_note_2;

    enlaceManifiesto.textContent = textos.manifesto;

    enlaceLinktree.setAttribute(
        "aria-label",
        textos.linktree_label
    );

    cerrarManifiesto.setAttribute(
        "aria-label",
        textos.close_manifesto
    );


    function comprobarRadio() {


        fetch(
            "https://sapircast.caster.fm:15920/admin/publicstats.json"
        )


        .then(respuesta => respuesta.json())


        .then(datos => {


            const fuente =
                datos[1]?.source?.["/Ez2oz"];


            if (fuente) {

                mostrarEstado(textos.state_living);

            } else {

                mostrarEstado(textos.state_sleeping);

            }


        })


        .catch(() => {

            mostrarEstado(textos.state_sleeping);

        });


    }


    comprobarRadio();


    setInterval(comprobarRadio,60000);


    window.addEventListener(
        "resize",
        ajustarEstado
    );


    document.fonts.ready.then(
        ajustarEstado
    );


});
