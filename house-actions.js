(() => {
    const notify = document.getElementById("notify-link");
    const email = document.getElementById("email-link");
    const support = document.getElementById("support-link");
    const supportPanel = document.getElementById("support-panel");
    const installPanel = document.getElementById("notification-install-panel");
    if (!notify || !email || !support || !supportPanel || !installPanel) return;

    const argentina = document.getElementById("support-argentina");
    const paypal = document.getElementById("support-paypal");
    const supportStatus = document.getElementById("support-status");
    const supportClose = document.getElementById("support-close");
    const installClose = document.getElementById("notification-install-close");
    const notice = document.createElement("p");
    notice.className = "house-notice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    notice.hidden = true;
    document.body.appendChild(notice);
    let noticeTimer;
    let localized = {};
    const pareceArgentina = (navigator.languages || [navigator.language]).some(c => /^es[-_]AR$/i.test(c)) || (Intl.DateTimeFormat().resolvedOptions().timeZone || "").startsWith("America/Argentina/");
    const oneSignal = () => window.ugjuOneSignal || (parent !== window ? parent.ugjuOneSignal : null);
    const notifications = () => window.ugjuNotifications || (parent !== window ? parent.ugjuNotifications : null);
    const instalada = () => navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;

    function esperarOneSignal() {
        const disponible = oneSignal();
        if (disponible) return Promise.resolve(disponible);
        return new Promise(resolve => {
            const inicio = Date.now();
            const intervalo = setInterval(() => {
                const sdk = oneSignal();
                if (sdk || Date.now() - inicio >= 10000) {
                    clearInterval(intervalo);
                    resolve(sdk);
                }
            },100);
        });
    }

    async function localizar() {
        const disponibles = ["es","en","de","fi","fr","it","ja","zh"];
        const codigo = (navigator.languages || [navigator.language])
            .map(valor => valor.toLowerCase().split("-")[0])
            .find(valor => disponibles.includes(valor)) || "en";
        try {
            const respuesta = await fetch(`manifiestos/${codigo}.json?v=20260807-2`);
            if (!respuesta.ok) return;
            const textos = await respuesta.json();
            localized = textos;
            notify.setAttribute("aria-label",textos.notify_label);
            notify.title = textos.notify_label;
            support.textContent = textos.support;
            document.getElementById("support-title").textContent = textos.support_title;
            argentina.textContent = textos.support_argentina;
            paypal.textContent = textos.support_international;
            supportClose.textContent = textos.support_close;
            document.getElementById("notification-install-title").textContent = textos.notify_ios_title;
            installPanel.querySelector("p").textContent = textos.notify_ios_install;
            installClose.textContent = textos.support_close;
        } catch {}
    }

    function mostrarAviso(mensaje) {
        clearTimeout(noticeTimer);
        notice.textContent = mensaje;
        notice.hidden = false;
        requestAnimationFrame(() => notice.classList.add("is-visible"));
        noticeTimer = setTimeout(() => {
            notice.classList.remove("is-visible");
            setTimeout(() => { notice.hidden = true; }, 180);
        }, 3600);
    }
    email.addEventListener("click", event => {
        event.preventDefault();
        try {
            window.top.location.href = email.href;
        } catch {
            window.location.href = email.href;
        }
    });
    function actualizarAviso(){notify.setAttribute("aria-pressed",String(Boolean(notifications()?.getState().optedIn || oneSignal()?.User.PushSubscription.optedIn)))}
    notify.addEventListener("click",async() => {
        if (/Instagram/i.test(navigator.userAgent)){mostrarAviso(localized.notify_open_browser || "Open this page in your browser to receive notifications.");return}
        if ((/iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) && !instalada()){installPanel.hidden=false;installClose.focus();return}
        await esperarOneSignal();const control=notifications();if(!control){mostrarAviso(localized.notify_error || "Notifications could not be enabled. Check your browser permissions.");return}
        if(!control.getState().supported){mostrarAviso(localized.notify_unsupported || "This browser does not support notifications.");return}
        try{notify.disabled=true;const estado=await control.toggle();actualizarAviso();mostrarAviso(estado.optedIn?(localized.notify_success || "Notifications are now on."):(localized.notify_disabled || "Notifications are off."))}catch(error){console.error("No se pudo cambiar la suscripción de avisos.",error);mostrarAviso(localized.notify_error || "Notifications could not be enabled. Check your browser permissions.")}finally{notify.disabled=false}
    });
    support.addEventListener("click",() => {supportPanel.querySelector(".support-card").insertBefore(pareceArgentina?argentina:paypal,pareceArgentina?paypal:argentina);supportPanel.hidden=false;(pareceArgentina?argentina:paypal).focus()});
    async function copiar(){const alias="muriscia.mp";try{await navigator.clipboard.writeText(alias)}catch{const t=document.createElement("textarea");t.value=alias;t.style.position="fixed";t.style.opacity="0";document.body.append(t);t.select();document.execCommand("copy");t.remove()}supportStatus.textContent=`ALIAS COPIED: ${alias}`}
    const cerrar=(panel,foco)=>{panel.hidden=true;supportStatus.textContent="";foco.focus()};
    argentina.addEventListener("click",copiar);supportClose.addEventListener("click",()=>cerrar(supportPanel,support));installClose.addEventListener("click",()=>cerrar(installPanel,notify));
    supportPanel.addEventListener("click",e=>{if(e.target===supportPanel)cerrar(supportPanel,support)});installPanel.addEventListener("click",e=>{if(e.target===installPanel)cerrar(installPanel,notify)});
    document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(!installPanel.hidden)cerrar(installPanel,notify);else if(!supportPanel.hidden)cerrar(supportPanel,support)});
    if (parent !== window) {
        try {
            parent.document.addEventListener("ugju-onesignal-ready",actualizarAviso);
            parent.document.addEventListener("ugju-notifications-change",actualizarAviso);
        } catch {}
    }
    document.addEventListener("ugju-notifications-change",actualizarAviso);
    localizar();
    actualizarAviso();
})();
