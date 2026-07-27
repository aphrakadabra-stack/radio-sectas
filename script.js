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


document.addEventListener(
    "click",
    evento => {

        if (!(evento.target instanceof Element)) {
            return;
        }

        const enlace =
            evento.target.closest(".manifesto-link");

        if (!enlace) {
            return;
        }

        evento.preventDefault();
        evento.stopImmediatePropagation();

        window.location.assign(enlace.href);

    },
    true
);


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


const idiomasNavegador = (
    navigator.languages || [navigator.language]
)
.map(codigo => codigo.substring(0,2));


const idioma =
    idiomasNavegador.find(
        codigo => idiomasDisponibles.includes(codigo)
    ) || "en";


document.documentElement.lang = idioma;


function medirTexto(elemento) {

    const rango = document.createRange();

    rango.selectNodeContents(elemento);

    return rango.getBoundingClientRect().width;

}


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
            Math.max(.58,anchoLema / anchoEstado)
        );

        estado.style.fontSize =
            `${tamañoBase * proporcion}px`;

    });

}


function mostrarEstado(texto) {

    estado.textContent = texto;

    ajustarEstado();

}


fetch(`lang/${idioma}.json`)

.then(respuesta => respuesta.json())

.then(textos => {

    titulo.textContent = textos.title;

    lema.textContent = textos.subtitle;

    notaCasaLineaUno.textContent =
        textos.house_note_1;

    notaCasaLineaDos.textContent =
        textos.house_note_2;

    enlaceManifiesto.textContent =
        textos.manifesto;

    enlaceLinktree.setAttribute(
        "aria-label",
        textos.linktree_label
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
