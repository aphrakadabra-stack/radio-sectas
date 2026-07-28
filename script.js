const estado = document.getElementById("state");
const titulo = document.querySelector("h1");
const lema = document.querySelector(".subtitle");
const notaCasaLineaUno = document.querySelector(
    ".house-note-line-one"
);
const notaCasaLineaDos = document.querySelector(
    ".house-note-line-two"
);
const notaCasa = document.querySelector(".house-note");
const enlaceManifiesto = document.querySelector(".manifesto-link");
const enlaceLinktree = document.querySelector(".linktree-link");
const esNavegadorInstagram =
    /Instagram/i.test(navigator.userAgent);


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
.map(codigo => codigo.substring(0,2).toLowerCase());


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


function ajustarTextoAlAncho(elemento) {

    elemento.style.fontSize = "";


    const anchoDisponible = elemento.clientWidth;
    const esTituloEnInstagram =
        esNavegadorInstagram && elemento === titulo;

    const anchoObjetivo =
        esTituloEnInstagram
            ? anchoDisponible * .94
            : anchoDisponible;

    const anchoReal =
        esTituloEnInstagram
            ? medirTexto(elemento)
            : elemento.scrollWidth;


    if (!anchoDisponible || !anchoReal || anchoReal <= anchoObjetivo) {
        return;
    }


    const tamañoBase = parseFloat(
        window.getComputedStyle(elemento).fontSize
    );


    elemento.style.fontSize =
        `${tamañoBase * anchoObjetivo / anchoReal}px`;

}


function ajustarNotaCasa() {

    notaCasa.style.fontSize = "";


    const anchoDisponible = notaCasa.clientWidth;

    const anchoReal = Math.max(
        notaCasaLineaUno.scrollWidth,
        notaCasaLineaDos.scrollWidth
    );


    if (!anchoDisponible || anchoReal <= anchoDisponible) {
        return;
    }


    const tamañoBase = parseFloat(
        window.getComputedStyle(notaCasa).fontSize
    );


    notaCasa.style.fontSize =
        `${tamañoBase * anchoDisponible / anchoReal}px`;

}


function ajustarInterfaz() {

    ajustarTextoAlAncho(titulo);
    ajustarTextoAlAncho(lema);
    ajustarNotaCasa();
    ajustarEstado();

}


function mostrarEstado(texto) {

    estado.textContent = texto;

    ajustarInterfaz();

}


function cargarIdioma(codigo) {

    return fetch(`lang/${codigo}.json?v=20260727-10`)

    .then(respuesta => {

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el idioma");
        }

        return respuesta.json();

    });

}


cargarIdioma(idioma)

.catch(() => {

    document.documentElement.lang = "en";

    return cargarIdioma("en");

})

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
        ajustarInterfaz
    );

    document.fonts.ready.then(
        () => {

            ajustarInterfaz();

            if (esNavegadorInstagram) {

                window.addEventListener(
                    "orientationchange",
                    ajustarInterfaz
                );

                window.addEventListener(
                    "pageshow",
                    ajustarInterfaz
                );

                setTimeout(ajustarInterfaz,250);
                setTimeout(ajustarInterfaz,1000);

            }

        }
    );

});
