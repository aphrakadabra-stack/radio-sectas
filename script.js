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


if (esNavegadorInstagram) {
    document.documentElement.classList.add(
        "instagram-browser"
    );
}


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


function centrarTextoMedido(elemento) {

    if (!esNavegadorInstagram || elemento !== titulo) {
        return;
    }

    elemento.style.transform = "";

    requestAnimationFrame(() => {

        const cajaElemento =
            elemento.getBoundingClientRect();

        const rango = document.createRange();

        rango.selectNodeContents(elemento);

        const cajaTexto =
            rango.getBoundingClientRect();

        const centroElemento =
            cajaElemento.left + cajaElemento.width / 2;

        const centroTexto =
            cajaTexto.left + cajaTexto.width / 2;

        const correccion =
            centroElemento - centroTexto;

        elemento.style.transform =
            `translateX(${correccion}px)`;

    });

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

        centrarTextoMedido(elemento);

        return;
    }


    const tamañoBase = parseFloat(
        window.getComputedStyle(elemento).fontSize
    );


    elemento.style.fontSize =
        `${tamañoBase * anchoObjetivo / anchoReal}px`;

    centrarTextoMedido(elemento);

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


function evitarChoquesDePuertas() {

    enlaceManifiesto.style.transform = "";
    enlaceLinktree.style.transform = "";
    enlaceManifiesto.style.transformOrigin = "";
    enlaceLinktree.style.transformOrigin = "";

    const esVistaDeTelefono =
        window.matchMedia(
            "(max-width: 700px)"
        ).matches;


    if (!esVistaDeTelefono) {
        return;
    }


    requestAnimationFrame(() => {

        const separacion = 10;

        const cajaManifiesto =
            enlaceManifiesto.getBoundingClientRect();

        const cajaTitulo =
            titulo.getBoundingClientRect();


        if (
            cajaManifiesto.bottom + separacion >
            cajaTitulo.top
        ) {

            const falta =
                cajaManifiesto.bottom +
                separacion -
                cajaTitulo.top;

            const subidaDisponible =
                Math.max(0,cajaManifiesto.top - 2);

            const subida =
                Math.min(falta,subidaDisponible);

            enlaceManifiesto.style.transformOrigin =
                "left top";

            enlaceManifiesto.style.transform =
                `translateY(-${subida}px)`;

        }


        const cajaNota =
            notaCasa.getBoundingClientRect();

        const cajaLinktree =
            enlaceLinktree.getBoundingClientRect();


        if (
            cajaNota.bottom + separacion >
            cajaLinktree.top
        ) {

            const falta =
                cajaNota.bottom +
                separacion -
                cajaLinktree.top;

            const bajadaDisponible =
                Math.max(
                    0,
                    window.innerHeight -
                    cajaLinktree.bottom -
                    2
                );

            const bajada =
                Math.min(falta,bajadaDisponible);

            const faltaRestante =
                Math.max(0,falta - bajada);

            const escala =
                faltaRestante > 0
                    ? Math.max(
                        .72,
                        1 -
                        faltaRestante /
                        cajaLinktree.height
                    )
                    : 1;

            enlaceLinktree.style.transformOrigin =
                "right bottom";

            enlaceLinktree.style.transform =
                `translateY(${bajada}px) scale(${escala})`;

        }

    });

}


function ajustarInterfaz() {

    ajustarTextoAlAncho(titulo);
    ajustarTextoAlAncho(lema);
    ajustarNotaCasa();
    ajustarEstado();

    requestAnimationFrame(
        () => requestAnimationFrame(
            evitarChoquesDePuertas
        )
    );

}


function mostrarEstado(texto) {

    estado.textContent = texto;

    ajustarInterfaz();

}


function cargarIdioma(codigo) {

    return fetch(`lang/${codigo}.json?v=20260728-11`)

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

            setTimeout(evitarChoquesDePuertas,500);
            setTimeout(evitarChoquesDePuertas,1500);

        }
    );

});
