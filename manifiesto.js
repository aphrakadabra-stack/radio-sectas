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


const enlaceEmail =
    document.getElementById("email-link");


enlaceEmail.addEventListener("click", () => {

    const direccion = String.fromCharCode(
        117,103,106,117,115,101,99,116,97,115,
        64,
        103,109,97,105,108,46,99,111,109
    );

    window.location.href = `mailto:${direccion}`;

});


function cargarTextos(codigo) {

    return fetch(`manifiestos/${codigo}.json`)

    .then(respuesta => {

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el manifiesto");
        }

        return respuesta.json();

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

    document.getElementById(
        "back-link"
    ).textContent = textos.back;


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


        parrafos.forEach(parrafo => {

            const elemento = document.createElement("p");

            elemento.textContent = parrafo;

            columna.appendChild(elemento);

        });


        contenido.appendChild(columna);

    });

});
