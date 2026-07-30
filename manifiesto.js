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


const enlaceEmail =
    document.getElementById("email-link");
const botonAviso =
    document.getElementById("notify-link");
const botonApoyo =
    document.getElementById("support-link");
const panelApoyo =
    document.getElementById("support-panel");
const tituloApoyo =
    document.getElementById("support-title");
const botonArgentina =
    document.getElementById("support-argentina");
const enlacePaypal =
    document.getElementById("support-paypal");
const estadoApoyo =
    document.getElementById("support-status");
const botonCerrarApoyo =
    document.getElementById("support-close");
const tarjetaApoyo =
    panelApoyo.querySelector(".support-card");
const esNavegadorInstagram =
    /Instagram/i.test(navigator.userAgent);
const esDispositivoAppleMovil =
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (
        navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1
    );
let textosActuales;


const configuracionesRegionales = (
    navigator.languages || [navigator.language]
)
.filter(Boolean);


const zonaHoraria = (
    Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone || ""
);


const pareceEstarEnArgentina =
    configuracionesRegionales.some(
        codigo => /^es[-_]AR$/i.test(codigo)
    ) ||
    zonaHoraria.startsWith("America/Argentina/") ||
    zonaHoraria === "America/Buenos_Aires";


enlaceEmail.addEventListener("click", () => {

    const direccion = String.fromCharCode(
        117,103,106,117,115,101,99,116,97,115,
        64,
        103,109,97,105,108,46,99,111,109
    );

    window.location.href = `mailto:${direccion}`;

});


function obtenerOneSignal() {

    if (window.ugjuOneSignal) {
        return window.ugjuOneSignal;
    }

    try {

        if (
            window.parent &&
            window.parent !== window &&
            window.parent.ugjuOneSignal
        ) {
            return window.parent.ugjuOneSignal;
        }

    } catch (error) {

        /*
        El manifiesto también funciona como página independiente.
        Si no comparte origen con su contenedor, usa su propia
        instancia de OneSignal.
        */

    }

    return null;

}


function estaInstaladaComoAplicacion() {

    return (
        window.navigator.standalone === true ||
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches
    );

}


function esperarOneSignal() {

    const disponible = obtenerOneSignal();

    if (disponible) {
        return Promise.resolve(disponible);
    }

    return new Promise(resolve => {

        const inicio = Date.now();

        const intervalo = window.setInterval(() => {

            const OneSignal = obtenerOneSignal();

            if (
                OneSignal ||
                Date.now() - inicio >= 4000
            ) {
                window.clearInterval(intervalo);
                resolve(OneSignal);
            }

        },100);

    });

}


function actualizarAvisame() {

    if (!textosActuales) {
        return;
    }

    const OneSignal = obtenerOneSignal();

    const estaSuscrito =
        Boolean(
            OneSignal &&
            OneSignal.User.PushSubscription.optedIn
        );

    botonAviso.setAttribute(
        "aria-pressed",
        String(estaSuscrito)
    );

    const etiqueta =
        estaSuscrito
            ? textosActuales.notify_active
            : textosActuales.notify_label;

    botonAviso.setAttribute(
        "aria-label",
        etiqueta
    );

    botonAviso.title = etiqueta;

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

    if (
        esDispositivoAppleMovil &&
        !estaInstaladaComoAplicacion()
    ) {

        window.alert(
            textosActuales.notify_ios_install
        );

        return;

    }

    const OneSignal = await esperarOneSignal();

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

        if (OneSignal.User.PushSubscription.optedIn) {

            window.alert(
                textosActuales.notify_success
            );

        }

    } catch (error) {

        window.alert(
            textosActuales.notify_error
        );

    }

}


botonAviso.addEventListener(
    "click",
    solicitarAviso
);


function abrirApoyo() {

    if (pareceEstarEnArgentina) {

        tarjetaApoyo.insertBefore(
            botonArgentina,
            enlacePaypal
        );

    } else {

        tarjetaApoyo.insertBefore(
            enlacePaypal,
            botonArgentina
        );

    }

    panelApoyo.hidden = false;
    estadoApoyo.textContent = "";

    (
        pareceEstarEnArgentina
            ? botonArgentina
            : enlacePaypal
    ).focus();

}


function cerrarApoyo() {

    panelApoyo.hidden = true;
    estadoApoyo.textContent = "";
    botonApoyo.focus();

}


async function copiarAlias() {

    const alias = "muriscia.mp";

    try {

        await navigator.clipboard.writeText(alias);

    } catch (error) {

        const campo = document.createElement("textarea");

        campo.value = alias;
        campo.setAttribute("readonly","");
        campo.style.position = "fixed";
        campo.style.opacity = "0";

        document.body.appendChild(campo);
        campo.select();
        document.execCommand("copy");
        campo.remove();

    }

    estadoApoyo.textContent =
        `${
            textosActuales?.support_copied ||
            "ALIAS COPIED:"
        } ${alias}`;

}


botonApoyo.addEventListener(
    "click",
    abrirApoyo
);


botonCerrarApoyo.addEventListener(
    "click",
    cerrarApoyo
);


botonArgentina.addEventListener(
    "click",
    copiarAlias
);


panelApoyo.addEventListener(
    "click",
    evento => {

        if (evento.target === panelApoyo) {
            cerrarApoyo();
        }

    }
);


document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Escape" &&
            !panelApoyo.hidden
        ) {
            cerrarApoyo();
        }

    }
);


document.addEventListener(
    "ugju-onesignal-ready",
    () => {

        const OneSignal = obtenerOneSignal();

        OneSignal.User.PushSubscription.addEventListener(
            "change",
            actualizarAvisame
        );

        actualizarAvisame();

    }
);


try {

    if (
        window.parent &&
        window.parent !== window
    ) {

        window.parent.document.addEventListener(
            "ugju-onesignal-ready",
            actualizarAvisame
        );

    }

} catch (error) {

    /*
    La página independiente no necesita escuchar
    el documento que la abrió.
    */

}


function cargarTextos(codigo) {

    return fetch(
        `manifiestos/${codigo}.json?v=20260730-1`
    )

    .then(respuesta => {

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el manifiesto");
        }

        return respuesta.json();

    });

}


cargarTextos(idioma)

.catch(() => {

    document.documentElement.lang = "en";

    return cargarTextos("en");

})

.then(textos => {

    textosActuales = textos;

    document.title =
        `ÚGJÜ RADIO — ${textos.title}`;

    document.getElementById(
        "manifesto-title"
    ).textContent = textos.title;

    document.getElementById(
        "manifesto-subtitle"
    ).textContent = textos.subtitle;

    document.getElementById(
        "back-link"
    ).textContent = textos.back;

    document.getElementById(
        "manifesto-project"
    ).textContent = textos.project;

    botonAviso.setAttribute(
        "aria-label",
        textos.notify_label
    );

    botonAviso.title =
        textos.notify_label;

    botonApoyo.textContent =
        textos.support;

    tituloApoyo.textContent =
        textos.support_title;

    botonArgentina.textContent =
        textos.support_argentina;

    enlacePaypal.textContent =
        textos.support_international;

    botonCerrarApoyo.textContent =
        textos.support_close;

    actualizarAvisame();


    const contenido =
        document.getElementById("manifesto-content");


    const puntoMedio =
        Math.ceil(textos.paragraphs.length / 2);


    const columnas = [
        textos.paragraphs.slice(0,puntoMedio),
        textos.paragraphs.slice(puntoMedio)
    ];


    columnas.forEach(parrafos => {

        const columna =
            document.createElement("div");

        columna.className = "manifesto-column";

        const interior =
            document.createElement("div");

        interior.className = "manifesto-column-inner";


        parrafos.forEach(parrafo => {

            const elemento = document.createElement("p");

            elemento.textContent = parrafo;

            interior.appendChild(elemento);

        });


        columna.appendChild(interior);

        contenido.appendChild(columna);

    });


    function igualarAlturaColumnas() {

        const interiores = [
            ...document.querySelectorAll(
                ".manifesto-column-inner"
            )
        ];

        const columnas = [
            ...document.querySelectorAll(
                ".manifesto-column"
            )
        ];


        contenido.style.fontSize = "";


        const alturaDisponible = Math.min(
            ...columnas.map(
                columna => columna.clientHeight
            )
        );

        let tamaño = parseFloat(
            window.getComputedStyle(contenido).fontSize
        );


        for (let intento = 0; intento < 8; intento += 1) {

            interiores.forEach(interior => {
                interior.style.height = "auto";
            });


            const alturaNecesaria = Math.max(
                ...interiores.map(
                    interior => interior.scrollHeight
                )
            );


            if (
                !alturaDisponible ||
                alturaNecesaria <= alturaDisponible
            ) {
                break;
            }


            tamaño *= Math.max(
                .82,
                alturaDisponible / alturaNecesaria
            );

            contenido.style.fontSize = `${tamaño}px`;

        }


        interiores.forEach(interior => {
            interior.style.height = "auto";
        });


        const altura = Math.max(
            ...interiores.map(
                interior => interior.scrollHeight
            )
        );

        const alturaFinal = Math.min(
            altura,
            alturaDisponible || altura
        );


        interiores.forEach(interior => {
            interior.style.height =
                `${Math.ceil(alturaFinal)}px`;
        });

    }


    requestAnimationFrame(igualarAlturaColumnas);


    if (document.fonts) {
        document.fonts.ready.then(igualarAlturaColumnas);
    }


    window.addEventListener(
        "resize",
        igualarAlturaColumnas
    );

});
