const idiomasDisponibles = ["es","en","de","fi","fr","it","ja","zh"];
const idioma = (navigator.languages || [navigator.language])
    .map(valor => valor.toLowerCase().split("-")[0])
    .find(valor => idiomasDisponibles.includes(valor)) || "en";

const koan = document.querySelector(".koan");
const titulo = document.getElementById("koan-title");
const instruccion = document.getElementById("koan-instruction");
const final = document.getElementById("koan-ending");
const volver = document.getElementById("back-link");
const contenedor = document.getElementById("drawing");
const lienzo = document.getElementById("koan-canvas");
const contexto = lienzo.getContext("2d");

let puntosTrazo = [];
let dibujando = false;
let completado = false;
let puntosObjetivo = [];

function esTactil() {
    return matchMedia("(hover:none), (pointer:coarse)").matches;
}

async function cargarTextos() {
    let codigo = idioma;
    let respuesta = await fetch(`lang/${codigo}.json?v=20260814-8`);
    if (!respuesta.ok) {
        codigo = "en";
        respuesta = await fetch("lang/en.json?v=20260814-8");
    }
    const textos = await respuesta.json();
    document.documentElement.lang = codigo;
    titulo.textContent = textos.stay_nine_dots_title;
    instruccion.textContent = esTactil()
        ? textos.stay_nine_dots_instruction_touch
        : textos.stay_nine_dots_instruction_pointer;
    final.textContent = textos.stay_nine_dots_complete;
    volver.setAttribute("aria-label",textos.stay_back_to_radio);
}

function prepararLienzo() {
    const rect = contenedor.getBoundingClientRect();
    const escala = Math.min(window.devicePixelRatio || 1,2);
    lienzo.width = Math.round(rect.width * escala);
    lienzo.height = Math.round(rect.height * escala);
    contexto.setTransform(escala,0,0,escala,0,0);
    const margen = rect.width * .29;
    const paso = (rect.width - margen * 2) / 2;
    puntosObjetivo = [];
    for (let fila = 0; fila < 3; fila += 1) {
        for (let columna = 0; columna < 3; columna += 1) {
            puntosObjetivo.push({x:margen + columna * paso,y:margen + fila * paso});
        }
    }
    dibujar();
}

function dibujar() {
    const rect = contenedor.getBoundingClientRect();
    contexto.clearRect(0,0,rect.width,rect.height);
    contexto.fillStyle = "#222";
    puntosObjetivo.forEach(punto => {
        contexto.beginPath();
        contexto.arc(punto.x,punto.y,4.2,0,Math.PI * 2);
        contexto.fill();
    });
    if (puntosTrazo.length < 2) return;
    contexto.strokeStyle = "#222";
    contexto.lineWidth = 2;
    contexto.lineCap = "round";
    contexto.lineJoin = "round";
    contexto.beginPath();
    contexto.moveTo(puntosTrazo[0].x,puntosTrazo[0].y);
    puntosTrazo.slice(1).forEach(punto => contexto.lineTo(punto.x,punto.y));
    contexto.stroke();
}

function puntoDelEvento(evento) {
    const rect = lienzo.getBoundingClientRect();
    return {x:evento.clientX - rect.left,y:evento.clientY - rect.top};
}

function distanciaAlSegmento(punto,inicio,fin) {
    const dx = fin.x - inicio.x;
    const dy = fin.y - inicio.y;
    if (!dx && !dy) return Math.hypot(punto.x - inicio.x,punto.y - inicio.y);
    const t = Math.max(0,Math.min(1,((punto.x-inicio.x)*dx+(punto.y-inicio.y)*dy)/(dx*dx+dy*dy)));
    return Math.hypot(punto.x-(inicio.x+t*dx),punto.y-(inicio.y+t*dy));
}

function simplificar(puntos,tolerancia) {
    if (puntos.length <= 2) return puntos;
    let maxima = 0;
    let indice = 0;
    for (let i = 1; i < puntos.length - 1; i += 1) {
        const distancia = distanciaAlSegmento(puntos[i],puntos[0],puntos[puntos.length-1]);
        if (distancia > maxima) { maxima = distancia; indice = i; }
    }
    if (maxima <= tolerancia) return [puntos[0],puntos[puntos.length-1]];
    const izquierda = simplificar(puntos.slice(0,indice+1),tolerancia);
    const derecha = simplificar(puntos.slice(indice),tolerancia);
    return izquierda.slice(0,-1).concat(derecha);
}

function obtenerLineas() {
    const ancho = contenedor.getBoundingClientRect().width;
    return simplificar(puntosTrazo,ancho * .035);
}

function esSolucion(vertices) {
    if (vertices.length !== 5) return false;
    const tolerancia = contenedor.getBoundingClientRect().width * .045;
    return puntosObjetivo.every(punto => vertices.slice(0,-1).some(
        (inicio,indice) => distanciaAlSegmento(punto,inicio,vertices[indice+1]) <= tolerancia
    ));
}

function reiniciar(evento) {
    dibujando = false;
    puntosTrazo = [];
    if (evento && lienzo.hasPointerCapture(evento.pointerId)) {
        lienzo.releasePointerCapture(evento.pointerId);
    }
    dibujar();
}

function comenzar(evento) {
    if (completado || evento.button > 0) return;
    evento.preventDefault();
    puntosTrazo = [puntoDelEvento(evento)];
    dibujando = true;
    lienzo.setPointerCapture(evento.pointerId);
    dibujar();
}

function continuar(evento) {
    if (!dibujando) return;
    evento.preventDefault();
    const punto = puntoDelEvento(evento);
    const ultimo = puntosTrazo[puntosTrazo.length-1];
    if (Math.hypot(punto.x-ultimo.x,punto.y-ultimo.y) < 2) return;
    puntosTrazo.push(punto);
    if (obtenerLineas().length > 5) {
        reiniciar(evento);
        return;
    }
    dibujar();
}

function terminar(evento) {
    if (!dibujando) return;
    const vertices = obtenerLineas();
    if (!esSolucion(vertices)) {
        reiniciar(evento);
        return;
    }
    dibujando = false;
    if (lienzo.hasPointerCapture(evento.pointerId)) lienzo.releasePointerCapture(evento.pointerId);
    puntosTrazo = vertices;
    dibujar();
    completado = true;
    final.hidden = false;
    requestAnimationFrame(() => koan.classList.add("is-complete"));
}

lienzo.addEventListener("pointerdown",comenzar);
lienzo.addEventListener("pointermove",continuar);
lienzo.addEventListener("pointerup",terminar);
lienzo.addEventListener("pointercancel",reiniciar);
volver.addEventListener("click",evento => {
    if (window.parent === window) return;
    evento.preventDefault();
    window.parent.postMessage({type:"close-stay"},window.location.origin);
});
window.addEventListener("resize",() => { if (!dibujando && !completado) prepararLienzo(); });

cargarTextos().catch(() => {}).finally(prepararLienzo);
