const idiomasDisponibles=["es","en","de","fi","fr","it","ja","zh"];
const idioma=(navigator.languages||[navigator.language]).map(v=>v.toLowerCase().split("-")[0]).find(v=>idiomasDisponibles.includes(v))||"en";
const fuegos=["nine","maze","line","squares","point","hanoi","stone","object"];
const claves={nine:"stay_nine_dots_title",maze:"stay_maze_title",line:"stay_line_title",squares:"stay_squares_title",point:"stay_point_title",hanoi:"stay_hanoi_title",stone:"stay_stone_title",object:"stay_object_title"};
const volver=document.getElementById("back-link"),navegacion=document.getElementById("fire-nav"),revelacionNueve=document.getElementById("nine-revelation");
let textos={},fuegoActual="nine";

function esTactil(){return matchMedia("(hover:none), (pointer:coarse)").matches}
function estado(nombre,texto=""){const salida=document.querySelector(`[data-status="${nombre}"]`);if(salida)salida.textContent=texto}
function exito(nombre){estado(nombre,"·  ✓  ·")}
function mostrarFuego(nombre){
    reiniciarRevelacionNueve();
    fuegoActual=nombre;
    document.querySelectorAll(".fire").forEach(fuego=>{const activo=fuego.dataset.fire===nombre;fuego.hidden=!activo;fuego.classList.toggle("is-active",activo)});
    navegacion.querySelectorAll("i").forEach(i=>i.setAttribute("aria-current",String(i.dataset.fire===nombre)));
    history.replaceState(null,"",`#${nombre}`);
    if(nombre==="nine")prepararNueve();
    if(nombre==="line")prepararLinea();
}
function moverFuego(direccion){const i=fuegos.indexOf(fuegoActual),siguiente=i+direccion;if(siguiente>=0&&siguiente<fuegos.length)mostrarFuego(fuegos[siguiente])}
function crearNavegacion(){fuegos.forEach(nombre=>{const indicador=document.createElement("i");indicador.dataset.fire=nombre;indicador.setAttribute("aria-label",textos[claves[nombre]]||nombre);navegacion.appendChild(indicador)})}
async function cargarTextos(){
    let codigo=idioma,respuesta=await fetch(`lang/${codigo}.json?v=20260814-11`);
    if(!respuesta.ok){codigo="en";respuesta=await fetch("lang/en.json?v=20260814-11")}
    textos=await respuesta.json();document.documentElement.lang=codigo;
    document.querySelectorAll("[data-text]").forEach(n=>n.textContent=textos[n.dataset.text]||n.textContent);
    document.getElementById("nine-instruction").textContent=esTactil()?textos.stay_nine_dots_instruction_touch:textos.stay_nine_dots_instruction_pointer;
    volver.setAttribute("aria-label",textos.stay_back_to_radio);navegacion.setAttribute("aria-label",textos.stay_fires_label||"Fuegos");crearNavegacion();
}

const lienzoNueve=document.getElementById("nine-canvas"),contenedorNueve=document.getElementById("nine-drawing"),ctxNueve=lienzoNueve.getContext("2d"),finalNueve=document.getElementById("nine-ending");
let puntosTrazo=[],dibujando=false,completado=false,puntosObjetivo=[],repeticionNueve=0,desvanecerNueve=0;
function prepararCanvas(){const r=contenedorNueve.getBoundingClientRect(),e=Math.min(devicePixelRatio||1,2);lienzoNueve.width=Math.round(r.width*e);lienzoNueve.height=Math.round(r.height*e);ctxNueve.setTransform(e,0,0,e,0,0);return r}
function prepararNueve(){const r=prepararCanvas(),m=r.width*.27,p=(r.width-m*2)/2;puntosObjetivo=[];for(let f=0;f<3;f++)for(let c=0;c<3;c++)puntosObjetivo.push({x:m+c*p,y:m+f*p});dibujarNueve()}
function dibujarNueve(){const r=contenedorNueve.getBoundingClientRect();ctxNueve.clearRect(0,0,r.width,r.height);ctxNueve.fillStyle="#222";puntosObjetivo.forEach(p=>{ctxNueve.beginPath();ctxNueve.arc(p.x,p.y,esTactil()?5.8:4.6,0,Math.PI*2);ctxNueve.fill()});if(puntosTrazo.length<2)return;ctxNueve.strokeStyle="#222";ctxNueve.lineWidth=esTactil()?12:3.2;ctxNueve.lineCap="round";ctxNueve.lineJoin="round";ctxNueve.beginPath();ctxNueve.moveTo(puntosTrazo[0].x,puntosTrazo[0].y);puntosTrazo.slice(1).forEach(p=>ctxNueve.lineTo(p.x,p.y));ctxNueve.stroke()}
function punto(e,elemento=lienzoNueve){const r=elemento.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function distanciaSegmento(p,a,b){const dx=b.x-a.x,dy=b.y-a.y;if(!dx&&!dy)return Math.hypot(p.x-a.x,p.y-a.y);const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy))}
function simplificar(ps,t){if(ps.length<=2)return ps;let m=0,i=0;for(let n=1;n<ps.length-1;n++){const d=distanciaSegmento(ps[n],ps[0],ps[ps.length-1]);if(d>m){m=d;i=n}}if(m<=t)return[ps[0],ps[ps.length-1]];return simplificar(ps.slice(0,i+1),t).slice(0,-1).concat(simplificar(ps.slice(i),t))}
function lineas(){const v=simplificar(puntosTrazo,contenedorNueve.getBoundingClientRect().width*.025);while(v.length>5){let menor=Infinity,indice=1;for(let i=1;i<v.length-1;i++){const d=distanciaSegmento(v[i],v[i-1],v[i+1]);if(d<menor){menor=d;indice=i}}v.splice(indice,1)}return v}
function solucion(v){if(v.length!==5)return false;const t=contenedorNueve.getBoundingClientRect().width*.05;return puntosObjetivo.every(p=>v.slice(0,-1).some((a,i)=>distanciaSegmento(p,a,v[i+1])<=t))}
function reiniciarRevelacionNueve(){clearTimeout(repeticionNueve);clearTimeout(desvanecerNueve);const fuego=document.querySelector('[data-fire="nine"]');fuego.classList.remove("is-vanishing");revelacionNueve.classList.remove("is-visible");revelacionNueve.hidden=true;finalNueve.textContent=""}
function reiniciarNueve(e){dibujando=false;completado=false;puntosTrazo=[];reiniciarRevelacionNueve();contenedorNueve.classList.remove("is-vanishing");if(e&&lienzoNueve.hasPointerCapture(e.pointerId))lienzoNueve.releasePointerCapture(e.pointerId);dibujarNueve()}
function revelarSalida(){const fuego=document.querySelector('[data-fire="nine"]');fuego.classList.add("is-vanishing");setTimeout(()=>{if(fuegoActual!=="nine")return;fuego.hidden=true;finalNueve.textContent=textos.stay_nine_dots_complete||"La mente encontró una salida.";revelacionNueve.hidden=false;requestAnimationFrame(()=>revelacionNueve.classList.add("is-visible"));desvanecerNueve=setTimeout(()=>revelacionNueve.classList.remove("is-visible"),3000);repeticionNueve=setTimeout(()=>{fuego.hidden=false;reiniciarNueve()},4400)},1050)}
function registrarMovimiento(e){const eventos=typeof e.getCoalescedEvents==="function"?e.getCoalescedEvents():[e];eventos.forEach(evento=>{const p=punto(evento),u=puntosTrazo.at(-1);if(!u||Math.hypot(p.x-u.x,p.y-u.y)>=2)puntosTrazo.push(p)})}
lienzoNueve.addEventListener("pointerdown",e=>{if(e.button>0||completado)return;e.preventDefault();puntosTrazo=[punto(e)];dibujando=true;lienzoNueve.setPointerCapture(e.pointerId);dibujarNueve()});
lienzoNueve.addEventListener("pointermove",e=>{if(!dibujando)return;e.preventDefault();registrarMovimiento(e);dibujarNueve()});
lienzoNueve.addEventListener("pointerup",e=>{if(!dibujando)return;e.preventDefault();registrarMovimiento(e);const v=lineas();if(!solucion(v)){reiniciarNueve(e);return}dibujando=false;if(lienzoNueve.hasPointerCapture(e.pointerId))lienzoNueve.releasePointerCapture(e.pointerId);puntosTrazo=v;dibujarNueve();completado=true;revelarSalida()});
lienzoNueve.addEventListener("pointercancel",reiniciarNueve);

const laberinto=document.querySelector('[data-firepiece="maze"]'),trazoLaberinto=laberinto.querySelector(".maze-trace");
const posicionesLaberinto=[[50,50],[150,50],[250,50],[50,150],[150,150],[250,150],[50,250],[150,250],[250,250]];
const enlaces=[[0,1],[1,2],[2,5],[5,8],[8,7],[7,6],[6,3],[3,4],[4,1]];let visitados=[];
posicionesLaberinto.forEach((pos,indice)=>{const boton=document.createElement("button");boton.type="button";boton.style.left=`${8+pos[0]*.28}%`;boton.style.top=`${8+pos[1]*.28}%`;boton.setAttribute("aria-label",`Punto ${indice+1}`);laberinto.appendChild(boton);boton.addEventListener("click",()=>visitarLaberinto(indice))});
const puntosLaberinto=[...laberinto.querySelectorAll("button")];
function conectados(a,b){return enlaces.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a))}
function reiniciarLaberinto(){visitados=[];puntosLaberinto.forEach(b=>b.classList.remove("is-visited"));trazoLaberinto.replaceChildren();estado("maze")}
function visitarLaberinto(indice){if(visitados.includes(indice)||(visitados.length&&!conectados(visitados.at(-1),indice)))reiniciarLaberinto();visitados.push(indice);puntosLaberinto[indice].classList.add("is-visited");trazoLaberinto.innerHTML=`<path d="M${visitados.map(i=>posicionesLaberinto[i].join(" ")).join(" L")}"/>`;if(visitados.length===9){exito("maze");setTimeout(reiniciarLaberinto,1800)}}

const linea=document.querySelector('[data-firepiece="line"]'),svgLinea=linea.querySelector("svg"),guiaLinea=linea.querySelector(".line-guide"),progresoLinea=linea.querySelector(".line-progress");let siguiendoLinea=false,avanceLinea=0,longitudLinea=0;
function prepararLinea(){longitudLinea=guiaLinea.getTotalLength();progresoLinea.style.strokeDasharray=longitudLinea;progresoLinea.style.strokeDashoffset=longitudLinea;avanceLinea=0;estado("line")}
function posicionEnLinea(e){const p=svgLinea.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const local=p.matrixTransform(svgLinea.getScreenCTM().inverse());let mejor={d:Infinity,l:0};for(let l=Math.max(0,avanceLinea-14);l<=Math.min(longitudLinea,avanceLinea+42);l+=3){const q=guiaLinea.getPointAtLength(l),d=Math.hypot(q.x-local.x,q.y-local.y);if(d<mejor.d)mejor={d,l}}return mejor}
svgLinea.addEventListener("pointerdown",e=>{const p=posicionEnLinea(e);if(avanceLinea>0||p.l>35||p.d>32){prepararLinea();return}siguiendoLinea=true;svgLinea.setPointerCapture(e.pointerId);e.preventDefault()});
svgLinea.addEventListener("pointermove",e=>{if(!siguiendoLinea)return;const p=posicionEnLinea(e);if(p.d>40||p.l+18<avanceLinea){siguiendoLinea=false;prepararLinea();return}avanceLinea=Math.max(avanceLinea,p.l);progresoLinea.style.strokeDashoffset=longitudLinea-avanceLinea;if(avanceLinea>longitudLinea-20){siguiendoLinea=false;progresoLinea.style.strokeDashoffset=0;exito("line");setTimeout(prepararLinea,1800)}e.preventDefault()});svgLinea.addEventListener("pointerup",()=>{if(avanceLinea<longitudLinea-20)prepararLinea();siguiendoLinea=false});

const cuadrados=document.querySelector('[data-firepiece="squares"]'),piezasCuadrado=[...cuadrados.querySelectorAll("button")];let arrastreCuadrado=null;
piezasCuadrado.forEach(pieza=>pieza.addEventListener("pointerdown",e=>{const a=pieza.getBoundingClientRect(),c=cuadrados.getBoundingClientRect();arrastreCuadrado={pieza,dx:e.clientX-a.left,dy:e.clientY-a.top,c};pieza.setPointerCapture(e.pointerId);e.preventDefault()}));
cuadrados.addEventListener("pointermove",e=>{if(!arrastreCuadrado)return;const {pieza,dx,dy,c}=arrastreCuadrado;pieza.style.left=`${Math.max(0,Math.min(c.width-pieza.offsetWidth,e.clientX-c.left-dx))}px`;pieza.style.top=`${Math.max(0,Math.min(c.height-pieza.offsetHeight,e.clientY-c.top-dy))}px`;pieza.style.right="auto";pieza.style.bottom="auto";pieza.style.transform="none";e.preventDefault()});
cuadrados.addEventListener("pointerup",()=>{if(!arrastreCuadrado)return;arrastreCuadrado=null;const centros=piezasCuadrado.map(p=>{const r=p.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}}),d=Math.max(...centros.map((a,i)=>Math.max(...centros.slice(i+1).map(b=>Math.hypot(a.x-b.x,a.y-b.y)),0)));if(d<piezasCuadrado[0].offsetWidth*.2)exito("squares")});

const puntoLinea=document.querySelector('[data-firepiece="point"]'),barra=puntoLinea.querySelector("button"),puntoFijo=puntoLinea.querySelector("i");let moviendoBarra=false;
barra.addEventListener("pointerdown",e=>{moviendoBarra=true;barra.setPointerCapture(e.pointerId);e.preventDefault()});barra.addEventListener("pointermove",e=>{if(!moviendoBarra)return;const r=puntoLinea.getBoundingClientRect();barra.style.left=`${Math.max(0,Math.min(r.width-barra.offsetWidth,e.clientX-r.left-barra.offsetWidth/2))}px`;barra.style.right="auto";const a=barra.getBoundingClientRect(),p=puntoFijo.getBoundingClientRect();if(p.top+p.height/2>=a.top&&p.top+p.height/2<=a.bottom&&p.left+p.width/2>=a.left&&p.left+p.width/2<=a.right){puntoFijo.style.opacity="0";exito("point")}e.preventDefault()});barra.addEventListener("pointerup",()=>{moviendoBarra=false});

const hanoi=document.querySelector('[data-firepiece="hanoi"]'),varillas=[...hanoi.querySelectorAll("button")];let torres=[[4,3,2,1],[],[]],seleccionHanoi=null;
function dibujarHanoi(){varillas.forEach((v,i)=>{v.replaceChildren();torres[i].forEach((disco,n)=>{const d=document.createElement("i");d.style.setProperty("--w",`${28+disco*15}%`);d.style.setProperty("--b",`${n*12}%`);v.appendChild(d)})})}
varillas.forEach((v,i)=>v.addEventListener("click",()=>{if(seleccionHanoi===null){if(!torres[i].length)return;seleccionHanoi=i;v.dataset.selected="true";return}const origen=seleccionHanoi,disco=torres[origen].at(-1),destino=torres[i].at(-1);delete varillas[origen].dataset.selected;seleccionHanoi=null;if(i===origen)return;if(destino&&destino<disco){estado("hanoi","×");return}torres[origen].pop();torres[i].push(disco);dibujarHanoi();estado("hanoi");if(torres[2].length===4)exito("hanoi")}));

const piedra=document.querySelector('[data-firepiece="stone"] button');piedra.addEventListener("pointerdown",e=>{piedra.classList.add("is-held");piedra.setPointerCapture(e.pointerId);estado("stone","·")});["pointerup","pointercancel"].forEach(tipo=>piedra.addEventListener(tipo,()=>{piedra.classList.remove("is-held");estado("stone")}));
const objeto=document.querySelector('[data-firepiece="object"] button'),formaObjeto=objeto.querySelector("span");let girandoObjeto=false,ultimoX=0,anguloObjeto=30;
objeto.addEventListener("pointerdown",e=>{girandoObjeto=true;ultimoX=e.clientX;objeto.setPointerCapture(e.pointerId);e.preventDefault()});objeto.addEventListener("pointermove",e=>{if(!girandoObjeto)return;anguloObjeto+=(e.clientX-ultimoX)*.7;ultimoX=e.clientX;formaObjeto.style.transform=`rotate(${anguloObjeto}deg) skewY(-18deg)`;e.preventDefault()});["pointerup","pointercancel"].forEach(tipo=>objeto.addEventListener(tipo,()=>{girandoObjeto=false}));

let inicioSwipe=null;
document.addEventListener("pointerdown",e=>{if(e.pointerType!=="touch")return;inicioSwipe={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0}},{capture:true});
document.addEventListener("pointermove",e=>{if(!inicioSwipe||e.pointerId!==inicioSwipe.id)return;inicioSwipe.dx=e.clientX-inicioSwipe.x;inicioSwipe.dy=e.clientY-inicioSwipe.y;if(Math.abs(inicioSwipe.dx)>18&&Math.abs(inicioSwipe.dx)>Math.abs(inicioSwipe.dy)*1.2)e.preventDefault()},{capture:true,passive:false});
document.addEventListener("pointerup",e=>{if(!inicioSwipe||e.pointerId!==inicioSwipe.id)return;const {dx,dy}=inicioSwipe;inicioSwipe=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25)moverFuego(dx<0?1:-1)},{capture:true});
document.addEventListener("pointercancel",()=>{inicioSwipe=null},{capture:true});
document.addEventListener("keydown",e=>{if(e.key==="ArrowRight")moverFuego(1);if(e.key==="ArrowLeft")moverFuego(-1)});
volver.addEventListener("click",e=>{if(parent===window)return;e.preventDefault();parent.postMessage({type:"close-stay"},location.origin)});window.addEventListener("resize",()=>{if(fuegoActual==="nine")prepararNueve()});
cargarTextos().catch(()=>{}).finally(()=>{prepararLinea();dibujarHanoi();mostrarFuego(fuegos.includes(location.hash.slice(1))?location.hash.slice(1):"nine")});
