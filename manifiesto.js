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


function deformarPalabra(palabra,indice) {

    if (indice % 3 !== 1) {
        return palabra;
    }


    return Array.from(palabra)

    .map((caracter,posicion) => {

        const esLetra =
            caracter.toLocaleLowerCase(idioma) !==
            caracter.toLocaleUpperCase(idioma);


        if (!esLetra) {
            return caracter;
        }


        return (
            posicion % 3 === 0 ||
            (
                posicion + indice
            ) % 5 === 0
        )
            ? caracter.toLocaleUpperCase(idioma)
            : caracter.toLocaleLowerCase(idioma);

    })

    .join("");

}


function crearTrayectoria(cantidadPalabras) {

    const centro = 800;

    const vueltas =
        Math.min(
            3.15,
            Math.max(
                1.25,
                1.1 + cantidadPalabras / 15
            )
        );

    const anguloInicial =
        -Math.PI * .62;

    const anguloFinal =
        anguloInicial + Math.PI * 2 * vueltas;

    const pasos = 7000;
    const puntos = [];

    let distancia = 0;
    let anterior = null;


    for (let indice = 0; indice <= pasos; indice += 1) {

        const progreso =
            indice / pasos;

        const angulo =
            anguloInicial +
            (
                anguloFinal - anguloInicial
            ) * progreso;

        const radioBase =
            135 + progreso * 390;

        const respiracion =
            Math.sin(angulo * 2.2) * 28 +
            Math.sin(angulo * 5.1) * 10;

        const profundidad =
            Math.sin(progreso * Math.PI) * 24;

        const radio =
            radioBase +
            respiracion +
            profundidad;

        const x =
            centro +
            Math.cos(angulo) * radio * 1.04;

        const y =
            centro +
            Math.sin(angulo) * radio * .9;


        if (anterior) {

            distancia += Math.hypot(
                x - anterior.x,
                y - anterior.y
            );

        }


        const punto = {
            x,
            y,
            angulo,
            distancia,
            progreso
        };

        puntos.push(punto);
        anterior = punto;

    }


    return {
        puntos,
        longitud:distancia
    };

}


function puntoPorDistancia(trayectoria,objetivo) {

    let inicio = 0;
    let final = trayectoria.puntos.length - 1;


    while (inicio < final) {

        const medio =
            Math.floor((inicio + final) / 2);


        if (
            trayectoria.puntos[medio].distancia <
            objetivo
        ) {
            inicio = medio + 1;
        } else {
            final = medio;
        }

    }


    return trayectoria.puntos[inicio];

}


function prepararParrafo(contexto,texto) {

    const palabrasOriginales =
        texto.trim().split(/\s+/);

    const trayectoria =
        crearTrayectoria(palabrasOriginales.length);

    const longitudTexto =
        Array.from(texto).length;

    const tamañoBase =
        longitudTexto < 34
            ? 92
            : longitudTexto < 72
                ? 70
                : longitudTexto < 125
                    ? 54
                    : 43;

    const palabras = [];
    let avanceTotal = 0;


    palabrasOriginales.forEach((palabra,indice) => {

        const textoVisual =
            deformarPalabra(palabra,indice);

        const pulso =
            .84 +
            (
                Math.sin(indice * 1.71) + 1
            ) * .19;

        const tamaño =
            tamañoBase *
            pulso *
            (
                indice % 7 === 0
                    ? 1.22
                    : 1
            );

        const cursiva =
            indice % 4 === 1 ||
            indice % 7 === 5;

        const peso =
            indice % 5 === 0
                ? "500"
                : "400";

        const escalaHorizontal =
            .78 +
            (
                Math.cos(indice * 1.13) + 1
            ) * .2;


        contexto.font =
            `${cursiva ? "italic " : ""}${peso} ${tamaño}px "Cormorant Garamond", serif`;


        const avance =
            contexto.measureText(textoVisual).width *
            escalaHorizontal +
            tamaño * .42;


        palabras.push({
            texto:textoVisual,
            tamaño,
            cursiva,
            peso,
            escalaHorizontal,
            avance,
            indice
        });

        avanceTotal += avance;

    });


    const margen = 75;

    const escalaRecorrido =
        Math.min(
            1.18,
            (
                trayectoria.longitud -
                margen * 2
            ) / avanceTotal
        );

    let recorrido = margen;


    palabras.forEach(palabra => {

        recorrido +=
            palabra.avance *
            escalaRecorrido /
            2;

        const punto =
            puntoPorDistancia(
                trayectoria,
                recorrido
            );

        const siguiente =
            puntoPorDistancia(
                trayectoria,
                Math.min(
                    trayectoria.longitud,
                    recorrido + 6
                )
            );


        palabra.x = punto.x;
        palabra.y = punto.y;
        palabra.progreso = punto.progreso;
        palabra.rotacion = Math.atan2(
            siguiente.y - punto.y,
            siguiente.x - punto.x
        );

        palabra.profundidad =
            .82 +
            Math.sin(
                punto.progreso *
                Math.PI
            ) * .28;


        recorrido +=
            palabra.avance *
            escalaRecorrido /
            2;

    });


    return palabras;

}


function dibujarFondo(contexto,tiempo) {

    contexto.fillStyle = "#EA52F3";
    contexto.fillRect(0,0,1600,1600);

    contexto.save();
    contexto.translate(800,800);


    for (let anillo = 0; anillo < 9; anillo += 1) {

        contexto.beginPath();


        for (let paso = 0; paso <= 600; paso += 1) {

            const angulo =
                Math.PI * 2 * paso / 600;

            const radio =
                165 +
                anillo * 59 +
                Math.sin(
                    angulo * 3 +
                    anillo * .8 +
                    tiempo * .00018
                ) * 18 +
                Math.sin(
                    angulo * 7 -
                    tiempo * .00011
                ) * 6;

            const x =
                Math.cos(angulo) *
                radio *
                (
                    1 +
                    Math.sin(
                        tiempo * .00009 +
                        anillo
                    ) * .025
                );

            const y =
                Math.sin(angulo) *
                radio *
                .91;


            if (paso === 0) {
                contexto.moveTo(x,y);
            } else {
                contexto.lineTo(x,y);
            }

        }


        contexto.closePath();

        contexto.strokeStyle =
            `rgba(26,26,26,${.08 + anillo * .012})`;

        contexto.lineWidth =
            .8 + anillo * .16;

        contexto.stroke();

    }


    contexto.restore();

}


function iniciarPartitura(parrafos) {

    const lienzo =
        document.getElementById("score-canvas");

    const contexto =
        lienzo.getContext("2d");

    let indiceParrafo = 0;
    let inicioParrafo = 0;
    let palabras = [];


    function cargarParrafo(tiempo) {

        palabras =
            prepararParrafo(
                contexto,
                parrafos[indiceParrafo]
            );

        inicioParrafo = tiempo;

    }


    function avanzar(tiempo) {

        indiceParrafo =
            (indiceParrafo + 1) %
            parrafos.length;

        cargarParrafo(tiempo);

    }


    function dibujar(tiempo) {

        if (!inicioParrafo) {
            cargarParrafo(tiempo);
        }


        dibujarFondo(contexto,tiempo);


        const transcurrido =
            tiempo - inicioParrafo;

        const intervalo =
            Math.max(
                125,
                Math.min(
                    260,
                    4200 /
                    Math.max(1,palabras.length)
                )
            );

        const revelado =
            palabras.length * intervalo;

        const espera =
            Math.max(
                3600,
                parrafos[indiceParrafo].length * 34
            );

        const desvanecido = 1100;

        const duracion =
            revelado +
            espera +
            desvanecido;

        const opacidadGeneral =
            transcurrido >
            revelado + espera
                ? Math.max(
                    0,
                    1 -
                    (
                        transcurrido -
                        revelado -
                        espera
                    ) /
                    desvanecido
                )
                : 1;


        contexto.textAlign = "center";
        contexto.textBaseline = "middle";


        palabras.forEach((palabra,indice) => {

            const aparicion =
                transcurrido -
                indice * intervalo;


            if (aparicion < 0) {
                return;
            }


            const entrada =
                Math.min(1,aparicion / 520);

            const desplazamiento =
                (1 - entrada) * 46;

            const vibracion =
                Math.sin(
                    tiempo * .0017 +
                    indice * .91
                ) * 2.2;

            const profundidad =
                palabra.profundidad *
                (
                    .86 +
                    entrada * .14
                );


            contexto.save();

            contexto.globalAlpha =
                entrada *
                opacidadGeneral *
                (
                    .72 +
                    palabra.progreso * .28
                );

            contexto.fillStyle = "#1a1a1a";

            contexto.translate(
                palabra.x,
                palabra.y + desplazamiento
            );

            contexto.rotate(
                palabra.rotacion +
                Math.sin(
                    indice * .73
                ) * .09
            );

            contexto.scale(
                palabra.escalaHorizontal *
                profundidad,
                profundidad
            );

            contexto.font =
                `${palabra.cursiva ? "italic " : ""}${palabra.peso} ${palabra.tamaño + vibracion}px "Cormorant Garamond", serif`;

            contexto.fillText(
                palabra.texto,
                0,
                0
            );

            contexto.restore();

        });


        contexto.save();

        contexto.fillStyle =
            "rgba(26,26,26,.62)";

        contexto.font =
            '500 18px "Cormorant Garamond", serif';

        contexto.textAlign = "center";
        contexto.textBaseline = "middle";

        contexto.fillText(
            `${String(indiceParrafo + 1).padStart(2,"0")} / ${String(parrafos.length).padStart(2,"0")}`,
            800,
            1490
        );

        contexto.restore();


        if (transcurrido >= duracion) {
            avanzar(tiempo);
        }


        window.requestAnimationFrame(dibujar);

    }


    lienzo.addEventListener("click",() => {

        avanzar(performance.now());

    });


    document.addEventListener("keydown",evento => {

        if (
            evento.key === "ArrowRight" ||
            evento.key === " "
        ) {
            avanzar(performance.now());
        }

    });


    window.requestAnimationFrame(dibujar);

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

        iniciarPartitura(textos.paragraphs);

    });

});
