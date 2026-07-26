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


    document.querySelector("h1").textContent = textos.title;

    document.querySelector(".subtitle").textContent = textos.subtitle;



    function comprobarRadio() {


        fetch("https://sapircast.caster.fm:15920/admin/publicstats.json")


        .then(respuesta => respuesta.json())


        .then(datos => {


            const fuente = datos[1]?.source?.["/Ez2oz"];



            if (fuente) {


                // Radio transmitiendo

                estado.textContent = "● " + textos.state_living;


            } else {


                // Radio en reposo

                estado.textContent = "◌ " + textos.state_sleeping;


            }


        })


        .catch(() => {


            // Si no se puede consultar, asumimos dormida

            estado.textContent = "◌ " + textos.state_sleeping;


        });


    }



    // Primera comprobación al cargar

    comprobarRadio();



    // Comprobar cada minuto

    setInterval(comprobarRadio, 60000);



});