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
const enlaceAvisame = document.querySelector(".notify-link");
const enlaceLinktree = document.querySelector(".linktree-link");
const esNavegadorInstagram =
    /Instagram/i.test(navigator.userAgent);
let textosActuales;


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
    enlaceAvisame.style.transform = "";
    enlaceLinktree.style.transform = "";
    enlaceManifiesto.style.transformOrigin = "";
    enlaceAvisame.style.transformOrigin = "";
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

        const cajaAvisame =
            enlaceAvisame.getBoundingClientRect();

        const cajaTitulo =
            titulo.getBoundingClientRect();


        if (
            Math.max(
                cajaManifiesto.bottom,
                cajaAvisame.bottom
            ) + separacion >
            cajaTitulo.top
        ) {

            const falta =
                Math.max(
                    cajaManifiesto.bottom,
                    cajaAvisame.bottom
                ) +
                separacion -
                cajaTitulo.top;

            const subidaDisponible =
                Math.max(
                    0,
                    Math.min(
                        cajaManifiesto.top,
                        cajaAvisame.top
                    ) - 2
                );

            const subida =
                Math.min(falta,subidaDisponible);

            enlaceManifiesto.style.transformOrigin =
                "left top";

            enlaceAvisame.style.transformOrigin =
                "right top";

            enlaceManifiesto.style.transform =
                `translateY(-${subida}px)`;

            enlaceAvisame.style.transform =
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


function actualizarAvisame() {

    if (!textosActuales) {
        return;
    }

    const OneSignal = window.ugjuOneSignal;

    if (!OneSignal) {
        enlaceAvisame.textContent =
            textosActuales.notify_me;

        enlaceAvisame.setAttribute(
            "aria-pressed",
            "false"
        );

        return;
    }

    const estaSuscrito =
        OneSignal.User.PushSubscription.optedIn;

    enlaceAvisame.textContent =
        estaSuscrito
            ? textosActuales.notify_active
            : textosActuales.notify_me;

    enlaceAvisame.setAttribute(
        "aria-pressed",
        String(estaSuscrito)
    );

}


async function solicitarAviso() {

    if (!textosActuales) {
        return;
    }

    if (esNavegadorInstagram) {

        window.alert(
            textosActuales.notify_open_browser
        );

        return;

    }

    const OneSignal = window.ugjuOneSignal;

    if (!OneSignal) {

        window.alert(
            textosActuales.notify_loading
        );

        return;

    }

    if (!OneSignal.Notifications.isPushSupported()) {

        window.alert(
            textosActuales.notify_unsupported
        );

        return;

    }

    try {

        await OneSignal.User.PushSubscription.optIn();

        actualizarAvisame();

    } catch (error) {

        window.alert(
            textosActuales.notify_error
        );

    }

}


enlaceAvisame.addEventListener(
    "click",
    solicitarAviso
);


document.addEventListener(
    "ugju-onesignal-ready",
    () => {

        const OneSignal = window.ugjuOneSignal;

        OneSignal.User.PushSubscription.addEventListener(
            "change",
            actualizarAvisame
        );

        actualizarAvisame();

    }
);


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

    textosActuales = textos;

    titulo.textContent = textos.title;

    lema.textContent = textos.subtitle;

    notaCasaLineaUno.textContent =
        textos.house_note_1;

    notaCasaLineaDos.textContent =
        textos.house_note_2;

    enlaceManifiesto.textContent =
        textos.manifesto;

    enlaceAvisame.textContent =
        textos.notify_me;

    enlaceAvisame.setAttribute(
        "aria-label",
        textos.notify_label
    );

    enlaceLinktree.setAttribute(
        "aria-label",
        textos.linktree_label
    );

    actualizarAvisame();


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
