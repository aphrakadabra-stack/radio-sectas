const idiomasDisponibles=["es","en","de","fi","fr","it","ja","zh"];
const idioma=(navigator.languages||[navigator.language]).map(v=>v.toLowerCase().split("-")[0]).find(v=>idiomasDisponibles.includes(v))||"en";
const nombres=["nine","maze","line","squares","point","hanoi","colour","order"];
const claves={nine:"stay_nine_dots_title",maze:"stay_maze_title",line:"stay_line_title",squares:"stay_squares_title",point:"stay_point_title",hanoi:"stay_hanoi_title",colour:"stay_colour_title",order:"stay_order_title"};
const volver=document.getElementById("back-link"),navegacion=document.getElementById("room-nav");
let textos={},habitacionActual="nine";

function esTactil(){return matchMedia("(hover:none), (pointer:coarse)").matches}
function estado(nombre,texto=""){document.querySelector(`[data-status="${nombre}"]`).textContent=texto}
function exito(nombre){estado(nombre,"·  ✓  ·")}
function mostrarHabitacion(nombre){
    habitacionActual=nombre;
    document.querySelectorAll(".room").forEach(sala=>{const activa=sala.dataset.room===nombre;sala.hidden=!activa;sala.classList.toggle("is-active",activa)});
    navegacion.querySelectorAll("button").forEach(b=>b.setAttribute("aria-current",String(b.dataset.room===nombre)));
    history.replaceState(null,"",`#${nombre}`);
    if(nombre==="nine")prepararNueve();
}
function moverHabitacion(direccion){const i=nombres.indexOf(habitacionActual),siguiente=i+direccion;if(siguiente>=0&&siguiente<nombres.length)mostrarHabitacion(nombres[siguiente])}
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

const lienzoNueve=document.getElementById("nine-canvas"),contenedorNueve=lienzoNueve.parentElement,ctxNueve=lienzoNueve.getContext("2d"),resolucionNueve=document.getElementById("nine-resolution");
let puntosTrazo=[],dibujando=false,completado=false,puntosObjetivo=[];
function prepararCanvas(){const r=contenedorNueve.getBoundingClientRect(),e=Math.min(devicePixelRatio||1,2);lienzoNueve.width=Math.round(r.width*e);lienzoNueve.height=Math.round(r.height*e);ctxNueve.setTransform(e,0,0,e,0,0);return r}
function prepararNueve(){const r=prepararCanvas(),m=r.width*.27,p=(r.width-m*2)/2;puntosObjetivo=[];for(let f=0;f<3;f++)for(let c=0;c<3;c++)puntosObjetivo.push({x:m+c*p,y:m+f*p});dibujarNueve()}
function dibujarNueve(){const r=contenedorNueve.getBoundingClientRect();ctxNueve.clearRect(0,0,r.width,r.height);ctxNueve.fillStyle="#222";puntosObjetivo.forEach(p=>{ctxNueve.beginPath();ctxNueve.arc(p.x,p.y,esTactil()?5.5:4.6,0,Math.PI*2);ctxNueve.fill()});if(puntosTrazo.length<2)return;ctxNueve.strokeStyle="#222";ctxNueve.lineWidth=esTactil()?9:3;ctxNueve.lineCap="round";ctxNueve.lineJoin="round";ctxNueve.beginPath();ctxNueve.moveTo(puntosTrazo[0].x,puntosTrazo[0].y);puntosTrazo.slice(1).forEach(p=>ctxNueve.lineTo(p.x,p.y));ctxNueve.stroke()}
function punto(e,elemento=lienzoNueve){const r=elemento.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function distanciaSegmento(p,a,b){const dx=b.x-a.x,dy=b.y-a.y;if(!dx&&!dy)return Math.hypot(p.x-a.x,p.y-a.y);const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy))}
function simplificar(ps,t){if(ps.length<=2)return ps;let m=0,i=0;for(let n=1;n<ps.length-1;n++){const d=distanciaSegmento(ps[n],ps[0],ps[ps.length-1]);if(d>m){m=d;i=n}}if(m<=t)return[ps[0],ps[ps.length-1]];return simplificar(ps.slice(0,i+1),t).slice(0,-1).concat(simplificar(ps.slice(i),t))}
function lineas(){
    const v=simplificar(puntosTrazo,contenedorNueve.getBoundingClientRect().width*.025);
    while(v.length>5){let menor=Infinity,indice=1;for(let i=1;i<v.length-1;i++){const d=distanciaSegmento(v[i],v[i-1],v[i+1]);if(d<menor){menor=d;indice=i}}v.splice(indice,1)}
    return v;
}
function solucion(v){if(v.length!==5)return false;const t=contenedorNueve.getBoundingClientRect().width*.045;return puntosObjetivo.every(p=>v.slice(0,-1).some((a,i)=>distanciaSegmento(p,a,v[i+1])<=t))}
function reiniciarNueve(e){dibujando=false;completado=false;puntosTrazo=[];resolucionNueve.hidden=true;if(e&&lienzoNueve.hasPointerCapture(e.pointerId))lienzoNueve.releasePointerCapture(e.pointerId);dibujarNueve()}
function registrarMovimiento(e){const eventos=typeof e.getCoalescedEvents==="function"?e.getCoalescedEvents():[e];eventos.forEach(evento=>{const p=punto(evento),u=puntosTrazo[puntosTrazo.length-1];if(!u||Math.hypot(p.x-u.x,p.y-u.y)>=2)puntosTrazo.push(p)})}
lienzoNueve.addEventListener("pointerdown",e=>{if(e.button>0)return;e.preventDefault();if(completado)reiniciarNueve();puntosTrazo=[punto(e)];dibujando=true;lienzoNueve.setPointerCapture(e.pointerId);dibujarNueve()});
lienzoNueve.addEventListener("pointermove",e=>{if(!dibujando)return;e.preventDefault();registrarMovimiento(e);dibujarNueve()});
lienzoNueve.addEventListener("pointerup",e=>{if(!dibujando)return;e.preventDefault();registrarMovimiento(e);const v=lineas();if(!solucion(v)){reiniciarNueve(e);return}dibujando=false;if(lienzoNueve.hasPointerCapture(e.pointerId))lienzoNueve.releasePointerCapture(e.pointerId);puntosTrazo=v;dibujarNueve();completado=true;resolucionNueve.hidden=false});
lienzoNueve.addEventListener("pointercancel",reiniciarNueve);
document.querySelector('[data-reset="nine"]').addEventListener("click",()=>reiniciarNueve());

const laberinto=document.querySelector('[data-game="maze"]'),puntosLaberinto=[...laberinto.querySelectorAll("button")],trazoLaberinto=laberinto.querySelector("svg");
let visitados=[];
puntosLaberinto.forEach((boton,indice)=>boton.setAttribute("aria-label",`Punto ${indice+1}`));
function reiniciarLaberinto(){visitados=[];puntosLaberinto.forEach(b=>b.classList.remove("is-visited"));trazoLaberinto.replaceChildren();estado("maze")}
puntosLaberinto.forEach((boton,indice)=>boton.addEventListener("click",()=>{if(visitados.includes(indice)){reiniciarLaberinto();return}visitados.push(indice);boton.classList.add("is-visited");const r=laberinto.getBoundingClientRect(),centros=visitados.map(i=>{const b=puntosLaberinto[i].getBoundingClientRect();return`${b.left-r.left+b.width/2},${b.top-r.top+b.height/2}`});trazoLaberinto.innerHTML=`<path d="M${centros.join(" L")}"/>`;if(visitados.length===9)exito("maze")}));

const linea=document.querySelector('[data-game="line"]'),svgLinea=linea.querySelector("svg"),guiaLinea=linea.querySelector(".line-guide"),progresoLinea=linea.querySelector(".line-progress");
let siguiendoLinea=false,avanceLinea=0,longitudLinea=0;
function prepararLinea(){longitudLinea=guiaLinea.getTotalLength();progresoLinea.style.strokeDasharray=longitudLinea;progresoLinea.style.strokeDashoffset=longitudLinea;avanceLinea=0;estado("line")}
function posicionEnLinea(e){const p=svgLinea.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const local=p.matrixTransform(svgLinea.getScreenCTM().inverse());let mejor={d:Infinity,l:0};for(let l=Math.max(0,avanceLinea-12);l<=Math.min(longitudLinea,avanceLinea+35);l+=3){const q=guiaLinea.getPointAtLength(l),d=Math.hypot(q.x-local.x,q.y-local.y);if(d<mejor.d)mejor={d,l}}return mejor}
svgLinea.addEventListener("pointerdown",e=>{const p=posicionEnLinea(e);if(avanceLinea>0||p.l>30||p.d>28){prepararLinea();return}siguiendoLinea=true;svgLinea.setPointerCapture(e.pointerId);e.preventDefault()});
svgLinea.addEventListener("pointermove",e=>{if(!siguiendoLinea)return;const p=posicionEnLinea(e);if(p.d>34||p.l+15<avanceLinea){siguiendoLinea=false;prepararLinea();return}avanceLinea=Math.max(avanceLinea,p.l);progresoLinea.style.strokeDashoffset=longitudLinea-avanceLinea;if(avanceLinea>longitudLinea-18){siguiendoLinea=false;progresoLinea.style.strokeDashoffset=0;exito("line")}e.preventDefault()});
svgLinea.addEventListener("pointerup",()=>{if(avanceLinea<longitudLinea-18)prepararLinea();siguiendoLinea=false});

const cuadrados=document.querySelector('[data-game="squares"]'),piezasCuadrado=[...cuadrados.querySelectorAll("button")];
let arrastreCuadrado=null;
piezasCuadrado.forEach(pieza=>pieza.addEventListener("pointerdown",e=>{const a=pieza.getBoundingClientRect(),c=cuadrados.getBoundingClientRect();arrastreCuadrado={pieza,dx:e.clientX-a.left,dy:e.clientY-a.top,c};pieza.setPointerCapture(e.pointerId);e.preventDefault()}));
cuadrados.addEventListener("pointermove",e=>{if(!arrastreCuadrado)return;const {pieza,dx,dy,c}=arrastreCuadrado;pieza.style.left=`${Math.max(0,Math.min(c.width-pieza.offsetWidth,e.clientX-c.left-dx))}px`;pieza.style.top=`${Math.max(0,Math.min(c.height-pieza.offsetHeight,e.clientY-c.top-dy))}px`;pieza.style.right="auto";pieza.style.bottom="auto";pieza.style.transform="none";e.preventDefault()});
cuadrados.addEventListener("pointerup",()=>{if(!arrastreCuadrado)return;arrastreCuadrado=null;const centros=piezasCuadrado.map(p=>{const r=p.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}}),d=Math.max(...centros.map((a,i)=>Math.max(...centros.slice(i+1).map(b=>Math.hypot(a.x-b.x,a.y-b.y)),0)));if(d<piezasCuadrado[0].offsetWidth*.35)exito("squares")});

const puntoLinea=document.querySelector('[data-game="point"]'),barra=puntoLinea.querySelector("button"),puntoFijo=puntoLinea.querySelector("i");
let moviendoBarra=false;
barra.addEventListener("pointerdown",e=>{moviendoBarra=true;barra.setPointerCapture(e.pointerId);e.preventDefault()});
barra.addEventListener("pointermove",e=>{if(!moviendoBarra)return;const r=puntoLinea.getBoundingClientRect();barra.style.left=`${Math.max(0,Math.min(r.width-barra.offsetWidth,e.clientX-r.left-barra.offsetWidth/2))}px`;barra.style.right="auto";const a=barra.getBoundingClientRect(),p=puntoFijo.getBoundingClientRect();if(p.top+p.height/2>=a.top&&p.top+p.height/2<=a.bottom&&p.left+p.width/2>=a.left&&p.left+p.width/2<=a.right){puntoFijo.style.opacity="0";exito("point")}e.preventDefault()});
barra.addEventListener("pointerup",()=>{moviendoBarra=false});

const hanoi=document.querySelector('[data-game="hanoi"]'),varillas=[...hanoi.querySelectorAll("button")];
let torres=[[3,2,1],[],[]],seleccionHanoi=null;
function dibujarHanoi(){varillas.forEach((v,i)=>{v.replaceChildren();torres[i].forEach((disco,n)=>{const d=document.createElement("i");d.style.setProperty("--w",`${34+disco*20}%`);d.style.setProperty("--b",`${n*13}%`);v.appendChild(d)})})}
varillas.forEach((v,i)=>v.addEventListener("click",()=>{if(seleccionHanoi===null){if(!torres[i].length)return;seleccionHanoi=i;v.dataset.selected="true";return}const origen=seleccionHanoi,disco=torres[origen].at(-1),destino=torres[i].at(-1);delete varillas[origen].dataset.selected;seleccionHanoi=null;if(i===origen)return;if(destino&&destino<disco){estado("hanoi","×");return}torres[origen].pop();torres[i].push(disco);dibujarHanoi();estado("hanoi");if(torres[2].length===3)exito("hanoi")}));

const colores=[...document.querySelectorAll('[data-game="colour"] button')];
colores.forEach((b,i)=>b.setAttribute("aria-label",`Color ${i+1}`));
colores.forEach(b=>b.addEventListener("click",()=>{colores.forEach(c=>c.classList.remove("is-wrong"));if(b.dataset.missing){exito("colour")}else{b.classList.add("is-wrong");estado("colour","·")}}));
const orden=document.querySelector('[data-game="order"] button');
const formas=["○","△","□"];let forma=0;
orden.addEventListener("click",()=>{orden.textContent=formas[forma];if(formas[forma]==="△")exito("order");else estado("order","·");forma=(forma+1)%formas.length});

let inicioSwipe=null;
document.addEventListener("pointerdown",e=>{if(e.pointerType!=="touch"||e.target.closest(".instrument,.drawing"))return;inicioSwipe={x:e.clientX,y:e.clientY}});
document.addEventListener("pointerup",e=>{if(!inicioSwipe)return;const dx=e.clientX-inicioSwipe.x,dy=e.clientY-inicioSwipe.y;inicioSwipe=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)moverHabitacion(dx<0?1:-1)});
volver.addEventListener("click",e=>{if(parent===window)return;e.preventDefault();parent.postMessage({type:"close-stay"},location.origin)});
window.addEventListener("resize",()=>{if(habitacionActual==="nine")prepararNueve()});
cargarTextos().catch(()=>{}).finally(()=>{prepararLinea();dibujarHanoi();mostrarHabitacion(nombres.includes(location.hash.slice(1))?location.hash.slice(1):"nine")});
