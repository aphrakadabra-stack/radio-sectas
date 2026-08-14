const idiomasDisponibles=["es","en","de","fi","fr","it","ja","zh"];
const idioma=(navigator.languages||[navigator.language]).map(v=>v.toLowerCase().split("-")[0]).find(v=>idiomasDisponibles.includes(v))||"en";
const nombres=["nine","maze","line","squares","point","hanoi","colour","order"];
const claves={nine:"stay_nine_dots_title",maze:"stay_maze_title",line:"stay_line_title",squares:"stay_squares_title",point:"stay_point_title",hanoi:"stay_hanoi_title",colour:"stay_colour_title",order:"stay_order_title"};
const volver=document.getElementById("back-link"),navegacion=document.getElementById("room-nav");
let textos={};

function esTactil(){return matchMedia("(hover:none), (pointer:coarse)").matches}
function mostrarHabitacion(nombre){
    document.querySelectorAll(".room").forEach(sala=>{const activa=sala.dataset.room===nombre;sala.hidden=!activa;sala.classList.toggle("is-active",activa)});
    navegacion.querySelectorAll("button").forEach(b=>b.setAttribute("aria-current",String(b.dataset.room===nombre)));
    history.replaceState(null,"",`#${nombre}`);
    if(nombre==="nine")prepararNueve();
}
function crearNavegacion(){nombres.forEach(nombre=>{const boton=document.createElement("button");boton.type="button";boton.dataset.room=nombre;boton.textContent=textos[claves[nombre]];boton.title=textos[claves[nombre]];boton.setAttribute("aria-label",textos[claves[nombre]]);boton.addEventListener("click",()=>mostrarHabitacion(nombre));navegacion.appendChild(boton)})}
async function cargarTextos(){
    let codigo=idioma,respuesta=await fetch(`lang/${codigo}.json?v=20260814-10`);
    if(!respuesta.ok){codigo="en";respuesta=await fetch("lang/en.json?v=20260814-10")}
    textos=await respuesta.json();document.documentElement.lang=codigo;
    document.querySelectorAll("[data-text]").forEach(n=>n.textContent=textos[n.dataset.text]||n.textContent);
    document.getElementById("nine-instruction").textContent=esTactil()?textos.stay_nine_dots_instruction_touch:textos.stay_nine_dots_instruction_pointer;
    document.getElementById("nine-ending").textContent=textos.stay_nine_dots_complete;
    volver.setAttribute("aria-label",textos.stay_back_to_radio);navegacion.setAttribute("aria-label",textos.stay_rooms_label);crearNavegacion();
}

const lienzoNueve=document.getElementById("nine-canvas"),contenedorNueve=lienzoNueve.parentElement,ctxNueve=lienzoNueve.getContext("2d");
let puntosTrazo=[],dibujando=false,completado=false,puntosObjetivo=[];
function prepararCanvas(){const r=contenedorNueve.getBoundingClientRect(),e=Math.min(devicePixelRatio||1,2);lienzoNueve.width=Math.round(r.width*e);lienzoNueve.height=Math.round(r.height*e);ctxNueve.setTransform(e,0,0,e,0,0);return r}
function prepararNueve(){const r=prepararCanvas(),m=r.width*.27,p=(r.width-m*2)/2;puntosObjetivo=[];for(let f=0;f<3;f++)for(let c=0;c<3;c++)puntosObjetivo.push({x:m+c*p,y:m+f*p});dibujarNueve()}
function dibujarNueve(){const r=contenedorNueve.getBoundingClientRect();ctxNueve.clearRect(0,0,r.width,r.height);ctxNueve.fillStyle="#222";puntosObjetivo.forEach(p=>{ctxNueve.beginPath();ctxNueve.arc(p.x,p.y,esTactil()?5.2:4.6,0,Math.PI*2);ctxNueve.fill()});if(puntosTrazo.length<2)return;ctxNueve.strokeStyle="#222";ctxNueve.lineWidth=esTactil()?5:2.5;ctxNueve.lineCap="round";ctxNueve.lineJoin="round";ctxNueve.beginPath();ctxNueve.moveTo(puntosTrazo[0].x,puntosTrazo[0].y);puntosTrazo.slice(1).forEach(p=>ctxNueve.lineTo(p.x,p.y));ctxNueve.stroke()}
function punto(e){const r=lienzoNueve.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function distanciaSegmento(p,a,b){const dx=b.x-a.x,dy=b.y-a.y;if(!dx&&!dy)return Math.hypot(p.x-a.x,p.y-a.y);const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy))}
function simplificar(ps,t){if(ps.length<=2)return ps;let m=0,i=0;for(let n=1;n<ps.length-1;n++){const d=distanciaSegmento(ps[n],ps[0],ps[ps.length-1]);if(d>m){m=d;i=n}}if(m<=t)return[ps[0],ps[ps.length-1]];return simplificar(ps.slice(0,i+1),t).slice(0,-1).concat(simplificar(ps.slice(i),t))}
function lineas(){return simplificar(puntosTrazo,contenedorNueve.getBoundingClientRect().width*.035)}
function solucion(v){if(v.length!==5)return false;const t=contenedorNueve.getBoundingClientRect().width*.045;return puntosObjetivo.every(p=>v.slice(0,-1).some((a,i)=>distanciaSegmento(p,a,v[i+1])<=t))}
function reiniciar(e){dibujando=false;puntosTrazo=[];if(e&&lienzoNueve.hasPointerCapture(e.pointerId))lienzoNueve.releasePointerCapture(e.pointerId);dibujarNueve()}
function registrarMovimiento(e){const eventos=typeof e.getCoalescedEvents==="function"?e.getCoalescedEvents():[e];eventos.forEach(evento=>{const p=punto(evento),u=puntosTrazo[puntosTrazo.length-1];if(!u||Math.hypot(p.x-u.x,p.y-u.y)>=2)puntosTrazo.push(p)})}
lienzoNueve.addEventListener("pointerdown",e=>{if(e.button>0)return;e.preventDefault();if(completado){completado=false;document.getElementById("nine-ending").hidden=true}puntosTrazo=[punto(e)];dibujando=true;lienzoNueve.setPointerCapture(e.pointerId);dibujarNueve()});
lienzoNueve.addEventListener("pointermove",e=>{if(!dibujando)return;e.preventDefault();registrarMovimiento(e);dibujarNueve()});
lienzoNueve.addEventListener("pointerup",e=>{if(!dibujando)return;e.preventDefault();registrarMovimiento(e);const v=lineas();if(!solucion(v)){reiniciar(e);return}dibujando=false;if(lienzoNueve.hasPointerCapture(e.pointerId))lienzoNueve.releasePointerCapture(e.pointerId);puntosTrazo=v;dibujarNueve();completado=true;document.getElementById("nine-ending").hidden=false});
lienzoNueve.addEventListener("pointercancel",reiniciar);
volver.addEventListener("click",e=>{if(parent===window)return;e.preventDefault();parent.postMessage({type:"close-stay"},location.origin)});
window.addEventListener("resize",()=>{if(document.querySelector(".room.is-active")?.dataset.room==="nine")prepararNueve()});
cargarTextos().catch(()=>{}).finally(()=>mostrarHabitacion(nombres.includes(location.hash.slice(1))?location.hash.slice(1):"nine"));
