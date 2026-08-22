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
const panelInstalacionAvisos =
    document.getElementById("notification-install-panel");
const tituloInstalacionAvisos =
    document.getElementById("notification-install-title");
const textoInstalacionAvisos =
    document.getElementById("notification-install-copy");
const botonCerrarInstalacionAvisos =
    document.getElementById("notification-install-close");
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
const avisoCasa = document.createElement("p");
avisoCasa.className = "house-notice";
avisoCasa.setAttribute("role", "status");
avisoCasa.setAttribute("aria-live", "polite");
avisoCasa.hidden = true;
document.body.appendChild(avisoCasa);
let temporizadorAvisoCasa;


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


function mostrarAvisoCasa(mensaje) {
    window.clearTimeout(temporizadorAvisoCasa);
    avisoCasa.textContent = mensaje;
    avisoCasa.hidden = false;
    requestAnimationFrame(() => avisoCasa.classList.add("is-visible"));
    temporizadorAvisoCasa = window.setTimeout(() => {
        avisoCasa.classList.remove("is-visible");
        window.setTimeout(() => { avisoCasa.hidden = true; }, 180);
    }, 3600);
}


enlaceEmail.addEventListener("click", evento => {

    evento.preventDefault();

    try {
        window.top.location.href = enlaceEmail.href;
    } catch (error) {
        window.location.href = enlaceEmail.href;
    }

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


function obtenerControlDeAvisos() {

    try {

        if (window.ugjuNotifications) {
            return window.ugjuNotifications;
        }

        if (
            window.parent &&
            window.parent !== window &&
            window.parent.ugjuNotifications
        ) {
            return window.parent.ugjuNotifications;
        }

    } catch (error) {

        /* La página independiente usa su propia instancia. */

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


function abrirInstruccionesDeInstalacion() {

    panelInstalacionAvisos.hidden = false;

    requestAnimationFrame(() => {
        botonCerrarInstalacionAvisos.focus();
    });

}


function cerrarInstruccionesDeInstalacion() {

    panelInstalacionAvisos.hidden = true;
    botonAviso.focus();

}


botonCerrarInstalacionAvisos.addEventListener(
    "click",
    cerrarInstruccionesDeInstalacion
);


panelInstalacionAvisos.addEventListener(
    "click",
    evento => {

        if (evento.target === panelInstalacionAvisos) {
            cerrarInstruccionesDeInstalacion();
        }

    }
);


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

    const control = obtenerControlDeAvisos();
    const OneSignal = obtenerOneSignal();
    const estado = control && control.getState();
    const estaSuscrito = Boolean(
        estado
            ? estado.optedIn
            : OneSignal && OneSignal.User.PushSubscription.optedIn
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


async function alternarAviso() {

    if (!textosActuales) {
        return;
    }

    if (esNavegadorInstagram) {

        mostrarAvisoCasa(
            textosActuales.notify_open_browser
        );

        return;

    }

    if (
        esDispositivoAppleMovil &&
        !estaInstaladaComoAplicacion()
    ) {

        abrirInstruccionesDeInstalacion();

        return;

    }

    const control = obtenerControlDeAvisos();

    if (control) {

        try {

            botonAviso.disabled = true;
            botonAviso.setAttribute("aria-busy", "true");

            const resultado = await control.toggle();

            if (!resultado.supported) {
                mostrarAvisoCasa(textosActuales.notify_unsupported);
                return;
            }

            actualizarAvisame();
            mostrarAvisoCasa(
                resultado.optedIn
                    ? textosActuales.notify_success
                    : textosActuales.notify_disabled
            );

        } catch (error) {

            console.error("No se pudo cambiar la suscripción de avisos.", error);

            mostrarAvisoCasa(textosActuales.notify_error);

        } finally {

            botonAviso.disabled = false;
            botonAviso.removeAttribute("aria-busy");

        }

        return;

    }

    const OneSignal = await esperarOneSignal();

    if (!OneSignal) {

        return;

    }

    if (!OneSignal.Notifications.isPushSupported()) {

        mostrarAvisoCasa(
            textosActuales.notify_unsupported
        );

        return;

    }

    try {

        const estaSuscrito =
            Boolean(
                OneSignal.User.PushSubscription.optedIn
            );

        botonAviso.disabled = true;
        botonAviso.setAttribute("aria-busy", "true");

        if (estaSuscrito) {
            await OneSignal.User.PushSubscription.optOut();
        } else {
            if (!OneSignal.Notifications.permission) {
                await OneSignal.Notifications.requestPermission();
            }

            if (!OneSignal.Notifications.permission) {
                throw new Error("Notification permission was not granted");
            }

            await OneSignal.User.PushSubscription.optIn();
        }

        actualizarAvisame();

        mostrarAvisoCasa(
            OneSignal.User.PushSubscription.optedIn
                ? textosActuales.notify_success
                : textosActuales.notify_disabled
        );

    } catch (error) {

        console.error("No se pudo cambiar la suscripción de avisos.", error);

        mostrarAvisoCasa(
            textosActuales.notify_error
        );

    } finally {

        botonAviso.disabled = false;
        botonAviso.removeAttribute("aria-busy");

    }

}


botonAviso.addEventListener(
    "click",
    alternarAviso
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
            !panelInstalacionAvisos.hidden
        ) {
            cerrarInstruccionesDeInstalacion();
            return;
        }

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

        window.parent.document.addEventListener(
            "ugju-notifications-change",
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
        `manifiestos/${codigo}.json?v=20260807-2`
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

    tituloInstalacionAvisos.textContent =
        textos.notify_ios_title;

    textoInstalacionAvisos.textContent =
        textos.notify_ios_install;

    botonCerrarInstalacionAvisos.textContent =
        textos.support_close;

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
