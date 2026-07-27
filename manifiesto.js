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


function puntoEspiral(angulo) {

    const centro = 800;

    const progreso =
        Math.max(0,Math.min(1,angulo / (Math.PI * 30)));

    const radioBase =
        125 + progreso * 575;

    const ondaLenta =
        Math.sin(angulo * .41) * 20;

    const ondaRapida =
        Math.sin(angulo * 1.37) * 8;

    const radio =
        radioBase + ondaLenta + ondaRapida;

    return {
        x:centro + Math.cos(angulo) * radio,
        y:centro + Math.sin(angulo) * radio
    };

}


function construirCamino() {

    const puntos = [];
    const anguloFinal = Math.PI * 30;
    const pasos = 26000;

    let distancia = 0;
    let anterior = puntoEspiral(0);

    puntos.push({
        ...anterior,
        angulo:0,
        distancia:0
    });


    for (let indice = 1; indice <= pasos; indice += 1) {

        const angulo =
            anguloFinal * indice / pasos;

        const actual =
            puntoEspiral(angulo);

        distancia += Math.hypot(
            actual.x - anterior.x,
            actual.y - anterior.y
        );

        puntos.push({
            ...actual,
            angulo,
            distancia
        });

        anterior = actual;

    }


    return {
        puntos,
        longitud:distancia
    };

}


function puntoPorDistancia(camino,objetivo) {

    let inicio = 0;
    let final = camino.puntos.length - 1;


    while (inicio < final) {

        const medio =
            Math.floor((inicio + final) / 2);

        if (
            camino.puntos[medio].distancia < objetivo
        ) {
            inicio = medio + 1;
        } else {
            final = medio;
        }

    }


    return camino.puntos[inicio];

}


function dibujarOndas(contexto) {

    contexto.save();

    contexto.strokeStyle = "rgba(26,26,26,.22)";
    contexto.lineWidth = 1.4;


    for (let vuelta = 0; vuelta < 11; vuelta += 1) {

        contexto.beginPath();


        for (let paso = 0; paso <= 900; paso += 1) {

            const angulo =
                Math.PI * 2 * paso / 900;

            const radio =
                165 +
                vuelta * 49 +
                Math.sin(angulo * 3 + vuelta) * 13 +
                Math.sin(angulo * 7 - vuelta) * 5;

            const x =
                800 + Math.cos(angulo) * radio;

            const y =
                800 + Math.sin(angulo) * radio;


            if (paso === 0) {
                contexto.moveTo(x,y);
            } else {
                contexto.lineTo(x,y);
            }

        }


        contexto.closePath();
        contexto.stroke();

    }


    contexto.restore();

}


function dibujarManifiesto(parrafos) {

    const lienzo =
        document.getElementById("score-canvas");

    const contexto =
        lienzo.getContext("2d");

    const separador = "   ✦   ";

    const caracteres = Array.from(
        parrafos.join(separador)
    );


    contexto.clearRect(
        0,
        0,
        lienzo.width,
        lienzo.height
    );

    contexto.fillStyle = "#EA52F3";
    contexto.fillRect(
        0,
        0,
        lienzo.width,
        lienzo.height
    );


    dibujarOndas(contexto);


    const camino =
        construirCamino();

    const medidas = [];
    let avanceTotal = 0;


    caracteres.forEach((caracter,indice) => {

        const pulso =
            20 +
            Math.sin(indice * .071) * 6 +
            Math.sin(indice * .019) * 4;

        const marcador =
            caracter === "✦";

        const tamaño =
            marcador ? 35 : Math.max(12,pulso);

        const cursiva =
            indice % 29 < 11;

        const peso =
            indice % 47 < 8 ? "500" : "400";


        contexto.font =
            `${cursiva ? "italic " : ""}${peso} ${tamaño}px "Cormorant Garamond", serif`;


        const avance =
            caracter === " "
                ? tamaño * .28
                : contexto.measureText(caracter).width * .92;


        medidas.push({
            caracter,
            tamaño,
            cursiva,
            peso,
            avance,
            marcador
        });

        avanceTotal += avance;

    });


    const margenCamino = 900;

    const espacioDisponible =
        camino.longitud - margenCamino * 2;

    const escala =
        Math.min(1.34,espacioDisponible / avanceTotal);

    let recorrido = margenCamino;


    contexto.fillStyle = "#1a1a1a";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";


    medidas.forEach((medida,indice) => {

        recorrido += medida.avance * escala / 2;

        const punto =
            puntoPorDistancia(camino,recorrido);

        const siguiente =
            puntoPorDistancia(
                camino,
                Math.min(
                    camino.longitud,
                    recorrido + 4
                )
            );

        const inclinacion =
            Math.atan2(
                siguiente.y - punto.y,
                siguiente.x - punto.x
            );

        const tamañoVivo =
            medida.tamaño *
            (
                1 +
                Math.sin(indice * .037) * .18
            );


        contexto.save();

        contexto.translate(punto.x,punto.y);
        contexto.rotate(inclinacion);

        contexto.font =
            `${medida.cursiva ? "italic " : ""}${medida.peso} ${tamañoVivo}px "Cormorant Garamond", serif`;

        contexto.fillText(
            medida.caracter,
            0,
            medida.marcador ? -2 : 0
        );

        contexto.restore();


        recorrido += medida.avance * escala / 2;

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


    const lectura =
        document.getElementById("accessible-manifesto");


    textos.paragraphs.forEach(parrafo => {

        const linea = document.createElement("p");

        linea.textContent = parrafo;

        lectura.appendChild(linea);

    });


    document.fonts.ready.then(() => {

        dibujarManifiesto(textos.paragraphs);

    });

});
