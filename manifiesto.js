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


const trazado = [
    {x:17,y:8,w:29,a:-5,s:1.45,st:"italic"},
    {x:49,y:7,w:16,a:0,s:1.75,al:"center"},
    {x:77,y:8,w:28,a:5,s:1.5,st:"italic"},
    {x:94,y:24,w:17,a:90,s:1.65,al:"center"},
    {x:88,y:16,w:23,a:38,s:1.2},
    {x:72,y:19,w:25,a:-20,s:1.35},
    {x:53,y:17,w:18,a:8,s:1.6,al:"center"},
    {x:29,y:20,w:34,a:-14,s:.92},
    {x:9,y:29,w:21,a:-68,s:1.22},
    {x:18,y:35,w:24,a:20,s:1.2},
    {x:80,y:32,w:27,a:-12,s:1.05},
    {x:91,y:43,w:19,a:78,s:1.4,al:"center"},
    {x:76,y:47,w:19,a:6,s:1.55,al:"center"},
    {x:23,y:49,w:30,a:-30,s:1.05},
    {x:10,y:56,w:25,a:-84,s:.9},
    {x:28,y:66,w:31,a:12,s:1.02,st:"italic"},
    {x:52,y:58,w:19,a:-6,s:1.7,al:"center"},
    {x:72,y:61,w:24,a:24,s:1.35,st:"italic"},
    {x:90,y:63,w:22,a:88,s:.96},
    {x:81,y:76,w:27,a:-18,s:1.15},
    {x:60,y:76,w:19,a:7,s:1.55,al:"center"},
    {x:42,y:73,w:17,a:-12,s:1.65,al:"center"},
    {x:23,y:79,w:17,a:18,s:1.65,al:"center"},
    {x:8,y:76,w:18,a:-90,s:1.4,al:"center"},
    {x:17,y:92,w:28,a:-6,s:1.4,st:"italic"},
    {x:46,y:91,w:24,a:3,s:1.45,st:"italic"},
    {x:69,y:91,w:24,a:-3,s:1.5,al:"center"},
    {x:91,y:88,w:22,a:54,s:1.7,al:"center"}
];


function cargarTextos(codigo) {

    return fetch(`manifiestos/${codigo}.json`)

    .then(respuesta => {

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el manifiesto");
        }

        return respuesta.json();

    });

}


function crearFragmento(texto, posicion) {

    const fragmento = document.createElement("p");

    fragmento.className = "score-fragment";
    fragmento.textContent = texto;

    fragmento.style.setProperty("--x",`${posicion.x}%`);
    fragmento.style.setProperty("--y",`${posicion.y}%`);
    fragmento.style.setProperty("--w",`${posicion.w}%`);
    fragmento.style.setProperty("--angle",`${posicion.a}deg`);
    fragmento.style.setProperty("--size",`${posicion.s}cqw`);
    fragmento.style.setProperty("--style",posicion.st || "normal");
    fragmento.style.setProperty("--align",posicion.al || "left");

    return fragmento;

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


    const partitura =
        document.getElementById("score-content");

    const lectura =
        document.getElementById("accessible-manifesto");


    textos.paragraphs.forEach((parrafo, indice) => {

        const posicion =
            trazado[indice % trazado.length];

        partitura.appendChild(
            crearFragmento(parrafo,posicion)
        );


        const linea = document.createElement("p");

        linea.textContent = parrafo;

        lectura.appendChild(linea);

    });

});
