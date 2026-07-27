const estado = document.getElementById("state");
const titulo = document.querySelector("h1");
const lema = document.querySelector(".subtitle");


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


// Obtener los idiomas preferidos del navegador

const idiomasNavegador = (
    navigator.languages || [navigator.language]
)
.map(codigo => codigo.substring(0,2));


// Usar el primer idioma compatible.
// Si ninguno está disponible, usar inglés.

const idioma =
    idiomasNavegador.find(
        codigo => idiomasDisponibles.includes(codigo)
    ) || "en";


document.documentElement.lang = idioma;


// Medir solamente el ancho visible de un texto

function medirTexto(elemento) {

    const rango = document.createRange();

    rango.selectNodeContents(elemento);

    return rango.getBoundingClientRect().width;

}


// Igualar ópticamente el ancho del estado con el lema

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
            Math.max(.58, anchoLema / anchoEstado)
        );

        estado.style.fontSize =
            `${tamañoBase * proporcion}px`;

    });

}


// Mostrar un estado y ajustar su anchura

function mostrarEstado(texto) {

    estado.textContent = texto;

    ajustarEstado();

}


// Cargar idioma

fetch(`lang/${idioma}.json`)

.then(respuesta => respuesta.json())

.then(textos => {


    titulo.textContent = textos.title;

    lema.textContent = textos.subtitle;


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