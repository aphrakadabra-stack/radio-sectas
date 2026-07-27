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


const enlaceRegreso =
    document.getElementById("back-link");


if (window.parent !== window) {

    enlaceRegreso.addEventListener("click",evento => {

        evento.preventDefault();

        window.parent.postMessage(
            "UGJU_CLOSE_MANIFESTO",
            window.location.origin
        );

    });

}


function cargarTextos(codigo) {

    return fetch(`manifiestos/${codigo}.json`)

    .then(respuesta => {

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el manifiesto");
        }

        return respuesta.json();

    });

}


function crearEspiral(parrafos,contenedor) {

    const separador = "   ✦   ";

    const texto = Array.from(
        parrafos.join(separador)
    );

    const cantidad = texto.length;
    const vueltas = 19;
    const anguloFinal = vueltas * Math.PI * 2;


    texto.forEach((caracter,indice) => {

        const progreso =
            cantidad > 1 ? indice / (cantidad - 1) : 0;

        const angulo =
            Math.sqrt(progreso) * anguloFinal - Math.PI / 2;

        const radio =
            8.5 + (38.2 * Math.sqrt(progreso));

        const ondulacion =
            Math.sin(angulo * .63) * 1.15;

        const radioVivo =
            radio + ondulacion;

        const x =
            50 + Math.cos(angulo) * radioVivo;

        const y =
            50 + Math.sin(angulo) * radioVivo;

        const anguloTangente =
            angulo * 180 / Math.PI + 92;

        const pulso =
            .87 +
            Math.sin(indice * .19) * .14 +
            Math.sin(indice * .047) * .1;


        const elemento =
            document.createElement("span");

        elemento.className = "spiral-character";
        elemento.textContent = caracter;

        elemento.style.setProperty("--x",`${x}%`);
        elemento.style.setProperty("--y",`${y}%`);
        elemento.style.setProperty(
            "--angle",
            `${anguloTangente}deg`
        );
        elemento.style.setProperty(
            "--size",
            `${pulso}cqw`
        );
        elemento.style.setProperty(
            "--style",
            indice % 17 < 6 ? "italic" : "normal"
        );
        elemento.style.setProperty(
            "--weight",
            indice % 31 < 5 ? "500" : "400"
        );


        if (caracter === "✦") {
            elemento.classList.add("is-separator");
        }


        contenedor.appendChild(elemento);

    });

}


cargarTextos(idioma)

.catch(() => cargarTextos("en"))

.then(textos => {

    document.title =
        `ÚGJÜ RADIO — ${textos.title}`;

    document.getElementById(
        "manifesto-title"
    ).textContent = textos.title;

    document.getElementById(
        "manifesto-subtitle"
    ).textContent = textos.subtitle;

    enlaceRegreso.textContent = textos.back;


    const partitura =
        document.getElementById("score-content");

    const lectura =
        document.getElementById("accessible-manifesto");


    crearEspiral(
        textos.paragraphs,
        partitura
    );


    textos.paragraphs.forEach(parrafo => {

        const linea = document.createElement("p");

        linea.textContent = parrafo;

        lectura.appendChild(linea);

    });

});
