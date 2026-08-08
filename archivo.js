const idiomasDisponibles = ["es","en","de","fi","fr","it","ja","zh"];
const idioma = (navigator.languages || [navigator.language])
    .map(codigo => codigo.substring(0,2).toLowerCase())
    .find(codigo => idiomasDisponibles.includes(codigo)) || "en";

const textos = {
    es:{title:"ARCHIVO",subtitle:"Emisiones guardadas en la casa",listen:"ESCUCHAR",pause:"PAUSA",back:"VOLVER A LA CASA",error:"NO SE PUDO REPRODUCIR EL ARCHIVO"},
    en:{title:"ARCHIVE",subtitle:"Broadcasts kept in the house",listen:"LISTEN",pause:"PAUSE",back:"RETURN TO THE HOUSE",error:"THE ARCHIVE COULD NOT BE PLAYED"},
    de:{title:"ARCHIV",subtitle:"Im Haus bewahrte Sendungen",listen:"ANHÖREN",pause:"PAUSE",back:"ZURÜCK ZUM HAUS",error:"DAS ARCHIV KONNTE NICHT ABSPIELEN"},
    fi:{title:"ARKISTO",subtitle:"Talossa säilytetyt lähetykset",listen:"KUUNTELE",pause:"TAUKO",back:"PALAA TALOON",error:"ARKISTOA EI VOITU TOISTAA"},
    fr:{title:"ARCHIVES",subtitle:"Émissions conservées dans la maison",listen:"ÉCOUTER",pause:"PAUSE",back:"RETOUR À LA MAISON",error:"IMPOSSIBLE DE LIRE L’ARCHIVE"},
    it:{title:"ARCHIVIO",subtitle:"Trasmissioni custodite nella casa",listen:"ASCOLTA",pause:"PAUSA",back:"TORNA ALLA CASA",error:"IMPOSSIBILE RIPRODURRE L’ARCHIVIO"},
    ja:{title:"アーカイブ",subtitle:"家に保管された放送",listen:"聴く",pause:"一時停止",back:"家に戻る",error:"アーカイブを再生できませんでした"},
    zh:{title:"档案",subtitle:"保存在屋中的广播",listen:"收听",pause:"暂停",back:"返回屋中",error:"无法播放档案"}
};

document.documentElement.lang = idioma;
const copia = textos[idioma];
const control = document.querySelector(".archive-control");
const audio = document.querySelector("audio");
const estado = document.getElementById("archive-status");

document.title = `ÚGJÜ RADIO — ${copia.title}`;
document.getElementById("archive-title").textContent = copia.title;
document.getElementById("archive-subtitle").textContent = copia.subtitle;
document.getElementById("back-link").textContent = copia.back;
control.textContent = copia.listen;

control.addEventListener("click", async () => {
    if (!audio.paused) {
        audio.pause();
        return;
    }

    window.parent.postMessage({type:"ugju-archive-play"},window.location.origin);

    try {
        await audio.play();
        estado.textContent = "";
    } catch (error) {
        estado.textContent = copia.error;
    }
});

audio.addEventListener("play", () => {
    control.textContent = copia.pause;
    control.setAttribute("aria-pressed","true");
});

audio.addEventListener("pause", () => {
    control.textContent = copia.listen;
    control.setAttribute("aria-pressed","false");
});

audio.addEventListener("ended", () => {
    control.textContent = copia.listen;
    control.setAttribute("aria-pressed","false");
});
