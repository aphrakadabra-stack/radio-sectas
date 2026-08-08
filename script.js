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
const enlaceArchivo = document.querySelector(".archive-link");
const enlaceLinktree = document.querySelector(".linktree-link");
const capaManifiesto = document.getElementById(
    "manifesto-overlay"
);
const marcoManifiesto = document.getElementById(
    "manifesto-frame"
);
const capaArchivo = document.getElementById("archive-overlay");
const marcoArchivo = document.getElementById("archive-frame");
const reproductorCaster = document.querySelector(".cstrEmbed");
const botonVolverAlVivo = document.getElementById("live-return");
const audioArchivo = document.getElementById("archive-audio");
const esNavegadorInstagram =
    /Instagram/i.test(navigator.userAgent);
let manifiestoCargado = false;
let archivoCargado = false;
let vivoDetenidoPorArchivo = false;
let entradaArchivoActual = null;

const contenidoOriginalCaster = reproductorCaster.innerHTML;


if (esNavegadorInstagram) {
    document.documentElement.classList.add(
        "instagram-browser"
    );
}


function abrirManifiesto() {

    if (!manifiestoCargado) {
        marcoManifiesto.src = "manifiesto.html?inside=radio";
        manifiestoCargado = true;
    }

    capaManifiesto.hidden = false;
    capaManifiesto.setAttribute("aria-hidden","false");

}


function cerrarManifiesto() {

    capaManifiesto.hidden = true;
    capaManifiesto.setAttribute("aria-hidden","true");
    enlaceManifiesto.focus();

}


function abrirArchivo() {

    if (!archivoCargado) {
        marcoArchivo.src = "archivo.html?inside=radio";
        archivoCargado = true;
    }

    capaArchivo.hidden = false;
    capaArchivo.setAttribute("aria-hidden","false");

}


function restaurarCaster() {

    if (!vivoDetenidoPorArchivo) {
        return;
    }

    reproductorCaster.innerHTML = contenidoOriginalCaster;
    reproductorCaster.setAttribute("data-rendered","false");
    reproductorCaster.style.height = "";
    reproductorCaster.hidden = false;
    botonVolverAlVivo.hidden = true;

    if (typeof window.casterfmWidgetsRescan === "function") {
        window.casterfmWidgetsRescan();
    }

    vivoDetenidoPorArchivo = false;

}


function detenerVivoParaArchivo() {

    const marcoCaster = reproductorCaster.querySelector("iframe");

    if (marcoCaster) {
        marcoCaster.src = "about:blank";
        marcoCaster.remove();
    }

    vivoDetenidoPorArchivo = true;
    reproductorCaster.hidden = true;
    botonVolverAlVivo.hidden = false;

}


function informarEstadoArchivo() {

    if (!marcoArchivo.contentWindow) {
        return;
    }

    marcoArchivo.contentWindow.postMessage(
        {
            type: "ugju-archive-state",
            identifier: entradaArchivoActual?.identifier || null,
            paused: audioArchivo.paused,
            currentTime: audioArchivo.currentTime || 0,
            duration: audioArchivo.duration ||
                entradaArchivoActual?.duration || 0
        },
        window.location.origin
    );

    if ("mediaSession" in navigator && entradaArchivoActual) {
        navigator.mediaSession.playbackState =
            audioArchivo.paused ? "paused" : "playing";

        if (
            Number.isFinite(audioArchivo.duration) &&
            audioArchivo.duration > 0 &&
            typeof navigator.mediaSession.setPositionState === "function"
        ) {
            navigator.mediaSession.setPositionState({
                duration: audioArchivo.duration,
                playbackRate: audioArchivo.playbackRate,
                position: Math.min(
                    audioArchivo.currentTime,
                    audioArchivo.duration
                )
            });
        }
    }

}


function actualizarSesionMultimedia() {

    if (
        !("mediaSession" in navigator) ||
        typeof MediaMetadata !== "function"
    ) {
        return;
    }

    if (!entradaArchivoActual) {
        navigator.mediaSession.metadata = null;
        return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
        title: entradaArchivoActual.title,
        artist: "ÚGJÜ RADIO",
        album: "ARCHIVO",
        artwork: [
            {
                src: new URL(
                    "images/icon-512.png",
                    window.location.href
                ).href,
                sizes: "512x512",
                type: "image/png"
            }
        ]
    });

}


async function reproducirEntradaArchivo(entrada) {

    const esLaMisma =
        entradaArchivoActual?.identifier === entrada.identifier;

    if (esLaMisma && !audioArchivo.paused) {
        audioArchivo.pause();
        return;
    }

    detenerVivoParaArchivo();

    if (!esLaMisma) {
        entradaArchivoActual = entrada;
        audioArchivo.src = entrada.audioUrl;
        actualizarSesionMultimedia();
    }

    try {
        await audioArchivo.play();
    } catch (error) {
        informarEstadoArchivo();
        throw error;
    }

}


function volverAlVivo() {

    audioArchivo.pause();
    audioArchivo.removeAttribute("src");
    audioArchivo.load();
    entradaArchivoActual = null;
    actualizarSesionMultimedia();
    informarEstadoArchivo();
    restaurarCaster();

}


function cerrarArchivo() {

    capaArchivo.hidden = true;
    capaArchivo.setAttribute("aria-hidden","true");
    enlaceArchivo.focus();

}


enlaceManifiesto.addEventListener(
    "click",
    evento => {

        evento.preventDefault();
        abrirManifiesto();

    }
);


enlaceArchivo.addEventListener(
    "click",
    evento => {

        evento.preventDefault();
        abrirArchivo();

    }
);


marcoManifiesto.addEventListener(
    "load",
    () => {

        try {

            const enlaceVolver =
                marcoManifiesto.contentDocument
                    ?.getElementById("back-link");

            if (!enlaceVolver) {
                return;
            }

            enlaceVolver.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();
                    cerrarManifiesto();

                }
            );

        } catch (error) {

            /*
            En producción ambos documentos comparten origen.
            Si un navegador impide el acceso, el enlace normal
            del manifiesto sigue funcionando como respaldo.
            */

        }

    }
);


marcoArchivo.addEventListener(
    "load",
    () => {

        try {

            const enlaceVolver =
                marcoArchivo.contentDocument
                    ?.getElementById("back-link");

            if (!enlaceVolver) {
                return;
            }

            enlaceVolver.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();
                    cerrarArchivo();

                }
            );

            informarEstadoArchivo();

        } catch (error) {

            /* La página independiente conserva su enlace normal. */

        }

    }
);


window.addEventListener(
    "message",
    evento => {

        if (
            evento.origin === window.location.origin &&
            evento.source === marcoArchivo.contentWindow &&
            evento.data?.type === "ugju-archive-toggle"
        ) {
            reproducirEntradaArchivo(evento.data.entry)
                .catch(() => {
                    marcoArchivo.contentWindow.postMessage(
                        {type:"ugju-archive-error"},
                        window.location.origin
                    );
                });
        }

    }
);


botonVolverAlVivo.addEventListener("click",volverAlVivo);


["play","pause","ended","loadedmetadata","timeupdate"]
.forEach(tipo => {
    audioArchivo.addEventListener(tipo,informarEstadoArchivo);
});


if ("mediaSession" in navigator) {

    const registrarAccionMultimedia = (accion,manejador) => {
        try {
            navigator.mediaSession.setActionHandler(accion,manejador);
        } catch (error) {

            /* Algunos navegadores implementan sólo parte de Media Session. */

        }
    };

    registrarAccionMultimedia(
        "play",
        () => audioArchivo.play()
    );

    registrarAccionMultimedia(
        "pause",
        () => audioArchivo.pause()
    );

    registrarAccionMultimedia(
        "seekbackward",
        detalles => {
            audioArchivo.currentTime = Math.max(
                0,
                audioArchivo.currentTime -
                    (detalles.seekOffset || 10)
            );
        }
    );

    registrarAccionMultimedia(
        "seekforward",
        detalles => {
            audioArchivo.currentTime = Math.min(
                audioArchivo.duration || Infinity,
                audioArchivo.currentTime +
                    (detalles.seekOffset || 10)
            );
        }
    );

    registrarAccionMultimedia(
        "seekto",
        detalles => {
            if (Number.isFinite(detalles.seekTime)) {
                audioArchivo.currentTime = detalles.seekTime;
            }
        }
    );

}


document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Escape" &&
            !capaManifiesto.hidden
        ) {
            cerrarManifiesto();
            return;
        }

        if (
            evento.key === "Escape" &&
            !capaArchivo.hidden
        ) {
            cerrarArchivo();
        }

    }
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

    return fetch(`lang/${codigo}.json?v=20260808-1`)

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

    enlaceArchivo.textContent =
        textos.archive;

    botonVolverAlVivo.textContent =
        textos.live_return;

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
