(() => {
    const notify = document.getElementById("notify-link");
    const email = document.getElementById("email-link");
    const support = document.getElementById("support-link");
    const supportPanel = document.getElementById("support-panel");
    const installPanel = document.getElementById("notification-install-panel");
    if (!notify || !email || !support || !supportPanel || !installPanel) return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    if (location.hostname === "ugjusectas.github.io") window.OneSignalDeferred.push(async OneSignal => {
        if (parent !== window) {
            actualizarAviso();
            return;
        }
        if (!window.ugjuOneSignal) {
            await OneSignal.init({appId:"e4712649-ca34-49e6-a2b4-f2ca6c5c7460",safari_web_id:"web.onesignal.auto.4b99c5db-a7c9-461a-8333-facb0838095d",serviceWorkerPath:"ugju-radio/OneSignalSDKWorker.js",serviceWorkerParam:{scope:"/ugju-radio/"},notifyButton:{enable:false}});
            window.ugjuOneSignal = OneSignal;
            document.dispatchEvent(new CustomEvent("ugju-onesignal-ready"));
        }
        actualizarAviso();
        OneSignal.User.PushSubscription.addEventListener("change",actualizarAviso);
    });

    if (
        location.hostname === "ugjusectas.github.io" &&
        !document.querySelector('script[src*="OneSignalSDK.page.js"]')
    ) {
        const scriptOneSignal = document.createElement("script");
        scriptOneSignal.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
        scriptOneSignal.defer = true;
        document.head.appendChild(scriptOneSignal);
    }

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
    function actualizarAviso(){notify.setAttribute("aria-pressed",String(Boolean(oneSignal()?.User.PushSubscription.optedIn)))}
    notify.addEventListener("click",async() => {
        if (/Instagram/i.test(navigator.userAgent)){mostrarAviso(localized.notify_open_browser || "Open this page in your browser to receive notifications.");return}
        if ((/iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) && !instalada()){installPanel.hidden=false;installClose.focus();return}
        const sdk=await esperarOneSignal();if(!sdk){mostrarAviso(localized.notify_error || "Notifications could not be enabled. Check your browser permissions.");return}
        if(!sdk.Notifications.isPushSupported()){mostrarAviso(localized.notify_unsupported || "This browser does not support notifications.");return}
        try{notify.disabled=true;sdk.User.PushSubscription.optedIn?await sdk.User.PushSubscription.optOut():await sdk.User.PushSubscription.optIn();actualizarAviso()}catch{mostrarAviso(localized.notify_error || "Notifications could not be enabled. Check your browser permissions.")}finally{notify.disabled=false}
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
        } catch {}
    }
    localizar();
    actualizarAviso();
})();
