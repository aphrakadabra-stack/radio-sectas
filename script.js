const estado = document.getElementById("state");


// Detectar idioma del visitante

const idiomaNavegador = navigator.language.substring(0,2);

let idioma = "es";

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


if (idiomasDisponibles.includes(idiomaNavegador)) {
    idioma = idiomaNavegador;
}


// Cargar idioma

fetch(`lang/${idioma}.json`)
.then(respuesta => respuesta.json())
.then(textos => {


    document.querySelector("h1").textContent = textos.title;

    document.querySelector(".subtitle").textContent = textos.subtitle;



    function comprobarRadio() {


        fetch("https://sapircast.caster.fm:15920/admin/publicstats.json")


        .then(respuesta => respuesta.json())


        .then(datos => {


            const fuente = datos[1]?.source?.["/Ez2oz"];



            if (fuente) {


                estado.textContent = "● " + textos.state_living;


            } else {


                estado.textContent = "◌ " + textos.state_sleeping;


            }


        })


        .catch(() => {


            estado.textContent = "◌ " + textos.state_sleeping;


        });


    }



    comprobarRadio();



    setInterval(comprobarRadio,60000);



});