const idiomasDisponibles=["es","en","de","fi","fr","it","ja","zh"];
const idioma=(navigator.languages||[navigator.language]).map(v=>v.toLowerCase().split("-")[0]).find(v=>idiomasDisponibles.includes(v))||"en";
const nombres=["nine","line","circle","empty","maze","sound","stone","perspective"];
const claves={nine:"stay_nine_dots_title",line:"stay_line_title",circle:"stay_circle_title",empty:"stay_empty_title",maze:"stay_maze_title",sound:"stay_sound_title",stone:"stay_stone_title",perspective:"stay_perspective_title"};
const volver=document.getElementById("back-link");
const navegacion=document.getElementById("room-nav");
let textos={};

function esTactil(){return matchMedia("(hover:none), (pointer:coarse)").matches}
function mostrarHabitacion(nombre){
    document.querySelectorAll(".room").forEach(sala=>{const activa=sala.dataset.room===nombre;sala.hidden=!activa;sala.classList.toggle("is-active",activa)});
    navegacion.querySelectorAll("button").forEach(b=>b.setAttribute("aria-current",String(b.dataset.room===nombre)));
    history.replaceState(null,"",`#${nombre}`);
    if(nombre==="nine") prepararNueve();
    if(nombre==="line") prepararTrazo("line-canvas",dibujarGuiaLinea);
    if(nombre==="circle") prepararTrazo("circle-canvas",dibujarGuiaCirculo);
}
function crearNavegacion(){
    nombres.forEach(nombre=>{const boton=document.createElement("button");boton.type="button";boton.dataset.room=nombre;boton.textContent=textos[claves[nombre]];boton.title=textos[claves[nombre]];boton.setAttribute("aria-label",textos[claves[nombre]]);boton.addEventListener("click",()=>mostrarHabitacion(nombre));navegacion.appendChild(boton)});
}
async function cargarTextos(){
    let codigo=idioma,respuesta=await fetch(`lang/${codigo}.json?v=20260814-9`);
    if(!respuesta.ok){codigo="en";respuesta=await fetch("lang/en.json?v=20260814-9")}
    textos=await respuesta.json();document.documentElement.lang=codigo;
    document.querySelectorAll("[data-text]").forEach(n=>n.textContent=textos[n.dataset.text]||n.textContent);
    document.getElementById("nine-instruction").textContent=esTactil()?textos.stay_nine_dots_instruction_touch:textos.stay_nine_dots_instruction_pointer;
    document.getElementById("nine-ending").textContent=textos.stay_nine_dots_complete;
    volver.setAttribute("aria-label",textos.stay_back_to_radio);navegacion.setAttribute("aria-label",textos.stay_rooms_label);
    document.getElementById("stone").setAttribute("aria-label",textos.stay_stone_instruction);
    document.getElementById("perspective").setAttribute("aria-label",textos.stay_perspective_instruction);
    crearNavegacion();
}

const lienzoNueve=document.getElementById("nine-canvas"),contenedorNueve=lienzoNueve.parentElement,ctxNueve=lienzoNueve.getContext("2d");
let puntosTrazo=[],dibujando=false,completado=false,puntosObjetivo=[];
function prepararCanvas(lienzo){const r=lienzo.parentElement.getBoundingClientRect(),e=Math.min(devicePixelRatio||1,2);lienzo.width=Math.round(r.width*e);lienzo.height=Math.round(r.height*e);const c=lienzo.getContext("2d");c.setTransform(e,0,0,e,0,0);return {r,c}}
function prepararNueve(){const {r}=prepararCanvas(lienzoNueve),m=r.width*.21,p=(r.width-m*2)/2;puntosObjetivo=[];for(let f=0;f<3;f++)for(let c=0;c<3;c++)puntosObjetivo.push({x:m+c*p,y:m+f*p});dibujarNueve()}
function dibujarNueve(){const r=contenedorNueve.getBoundingClientRect();ctxNueve.clearRect(0,0,r.width,r.height);ctxNueve.fillStyle="#222";puntosObjetivo.forEach(p=>{ctxNueve.beginPath();ctxNueve.arc(p.x,p.y,4.5,0,Math.PI*2);ctxNueve.fill()});if(puntosTrazo.length<2)return;ctxNueve.strokeStyle="#222";ctxNueve.lineWidth=esTactil()?4:2.4;ctxNueve.lineCap="round";ctxNueve.lineJoin="round";ctxNueve.beginPath();ctxNueve.moveTo(puntosTrazo[0].x,puntosTrazo[0].y);puntosTrazo.slice(1).forEach(p=>ctxNueve.lineTo(p.x,p.y));ctxNueve.stroke()}
function punto(evento,lienzo){const r=lienzo.getBoundingClientRect();return{x:evento.clientX-r.left,y:evento.clientY-r.top}}
function distanciaSegmento(p,a,b){const dx=b.x-a.x,dy=b.y-a.y;if(!dx&&!dy)return Math.hypot(p.x-a.x,p.y-a.y);const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy))}
function simplificar(ps,t){if(ps.length<=2)return ps;let m=0,i=0;for(let n=1;n<ps.length-1;n++){const d=distanciaSegmento(ps[n],ps[0],ps[ps.length-1]);if(d>m){m=d;i=n}}if(m<=t)return[ps[0],ps[ps.length-1]];return simplificar(ps.slice(0,i+1),t).slice(0,-1).concat(simplificar(ps.slice(i),t))}
function lineas(){return simplificar(puntosTrazo,contenedorNueve.getBoundingClientRect().width*.035)}
function solucion(v){if(v.length!==5)return false;const t=contenedorNueve.getBoundingClientRect().width*.045;return puntosObjetivo.every(p=>v.slice(0,-1).some((a,i)=>distanciaSegmento(p,a,v[i+1])<=t))}
function reiniciar(e){dibujando=false;puntosTrazo=[];if(e&&lienzoNueve.hasPointerCapture(e.pointerId))lienzoNueve.releasePointerCapture(e.pointerId);dibujarNueve()}
lienzoNueve.addEventListener("pointerdown",e=>{if(e.button>0)return;e.preventDefault();if(completado){completado=false;document.getElementById("nine-ending").hidden=true}puntosTrazo=[punto(e,lienzoNueve)];dibujando=true;lienzoNueve.setPointerCapture(e.pointerId);dibujarNueve()});
lienzoNueve.addEventListener("pointermove",e=>{if(!dibujando)return;e.preventDefault();const p=punto(e,lienzoNueve),u=puntosTrazo[puntosTrazo.length-1];if(Math.hypot(p.x-u.x,p.y-u.y)<2)return;puntosTrazo.push(p);if(lineas().length>5){reiniciar(e);return}dibujarNueve()});
lienzoNueve.addEventListener("pointerup",e=>{if(!dibujando)return;const v=lineas();if(!solucion(v)){reiniciar(e);return}dibujando=false;if(lienzoNueve.hasPointerCapture(e.pointerId))lienzoNueve.releasePointerCapture(e.pointerId);puntosTrazo=v;dibujarNueve();completado=true;document.getElementById("nine-ending").hidden=false});
lienzoNueve.addEventListener("pointercancel",reiniciar);

const trazos=new Map();
function prepararTrazo(id,guia){const lienzo=document.getElementById(id),estado=trazos.get(id)||{puntos:[],activo:false};trazos.set(id,estado);const {r,c}=prepararCanvas(lienzo);c.clearRect(0,0,r.width,r.height);guia(c,r);dibujarTrazo(c,estado.puntos)}
function dibujarTrazo(c,ps){if(ps.length<2)return;c.strokeStyle="#222";c.lineWidth=esTactil()?3.8:2;c.lineCap="round";c.lineJoin="round";c.beginPath();c.moveTo(ps[0].x,ps[0].y);ps.slice(1).forEach(p=>c.lineTo(p.x,p.y));c.stroke()}
function dibujarGuiaLinea(c,r){c.strokeStyle="rgba(34,34,34,.24)";c.lineWidth=1;c.setLineDash([2,8]);c.beginPath();c.moveTo(r.width*.09,r.height*.7);c.lineTo(r.width*.91,r.height*.3);c.stroke();c.setLineDash([])}
function dibujarGuiaCirculo(c,r){const m=Math.min(r.width,r.height),x=r.width/2,y=r.height/2,radio=m*.34;c.strokeStyle="rgba(34,34,34,.52)";c.lineWidth=1.4;c.beginPath();c.arc(x,y,radio,.22,Math.PI*2-.4);c.stroke()}
["line-canvas","circle-canvas"].forEach(id=>{const l=document.getElementById(id),guia=id==="line-canvas"?dibujarGuiaLinea:dibujarGuiaCirculo;l.addEventListener("pointerdown",e=>{if(e.button>0)return;e.preventDefault();const s=trazos.get(id)||{puntos:[]};s.puntos=[punto(e,l)];s.activo=true;trazos.set(id,s);l.setPointerCapture(e.pointerId);prepararTrazo(id,guia)});l.addEventListener("pointermove",e=>{const s=trazos.get(id);if(!s?.activo)return;e.preventDefault();s.puntos.push(punto(e,l));prepararTrazo(id,guia)});const fin=e=>{const s=trazos.get(id);if(s)s.activo=false;if(l.hasPointerCapture(e.pointerId))l.releasePointerCapture(e.pointerId)};l.addEventListener("pointerup",fin);l.addEventListener("pointercancel",fin)});

const maze=document.getElementById("maze"),marca=document.getElementById("maze-mark");maze.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse"&&e.buttons!==1)return;const p=punto(e,maze),r=maze.getBoundingClientRect();marca.style.left=`${p.x/r.width*100}%`;marca.style.top=`${p.y/r.height*100}%`});maze.addEventListener("pointerdown",e=>maze.dispatchEvent(new PointerEvent("pointermove",e)));
document.getElementById("stone").addEventListener("click",e=>e.currentTarget.classList.toggle("is-touched"));
document.getElementById("perspective").addEventListener("click",e=>e.currentTarget.classList.toggle("is-changed"));
volver.addEventListener("click",e=>{if(parent===window)return;e.preventDefault();parent.postMessage({type:"close-stay"},location.origin)});
window.addEventListener("resize",()=>{const activa=document.querySelector(".room.is-active")?.dataset.room;if(activa)mostrarHabitacion(activa)});
cargarTextos().catch(()=>{}).finally(()=>mostrarHabitacion(nombres.includes(location.hash.slice(1))?location.hash.slice(1):"nine"));
