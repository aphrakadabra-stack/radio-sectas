const radio = document.getElementById("radio");
const boton = document.getElementById("playButton");
const estado = document.getElementById("state");


// Detectar idioma del visitante

const idiomaNavegador = navigator.language.substring(0,2);

let idioma = "es";

const idiomasDisponibles = [
    "es",
    "en",
    "fi"
];


if (idiomasDisponibles.includes(idiomaNavegador)) {

    idioma = idiomaNavegador;

}


// Cargar idioma

fetch(`lang/${idioma}.json`)
.then(respuesta => respuesta.json())
.then(textos => {


    estado.textContent = "● " + textos.state_living;

    document.querySelector("h1").textContent = textos.title;

    document.querySelector(".subtitle").textContent = textos.subtitle;

    boton.textContent = textos.enter;



    boton.addEventListener("click", () => {


        if (radio.paused) {


            radio.play();


            boton.textContent = textos.listening;


            estado.textContent = "● " + textos.state_broadcasting;


        } else {


            radio.pause();


            boton.textContent = textos.enter;


            estado.textContent = "● " + textos.state_living;


        }


    });


});