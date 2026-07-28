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
const esNavegadorInstagram =
    /Instagram/i.test(navigator.userAgent);
let textosActuales;


enlaceEmail.addEventListener("click", () => {

    const direccion = String.fromCharCode(
        117,103,106,117,115,101,99,116,97,115,
        64,
        103,109,97,105,108,46,99,111,109
    );

    window.location.href = `mailto:${direccion}`;

});


function actualizarAvisame() {

    if (!textosActuales) {
        return;
    }

    const OneSignal = window.ugjuOneSignal;

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


function cargarTextos(codigo) {

    return fetch(
        `manifiestos/${codigo}.json?v=20260728-9`
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

    botonAviso.setAttribute(
        "aria-label",
        textos.notify_label
    );

    botonAviso.title =
        textos.notify_label;

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
