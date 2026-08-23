(() => {
    "use strict";

    const email = document.getElementById("email-link");
    const support = document.getElementById("support-link");
    const supportPanel = document.getElementById("support-panel");
    if (!email || !support || !supportPanel) return;

    const argentina = document.getElementById("support-argentina");
    const paypal = document.getElementById("support-paypal");
    const supportStatus = document.getElementById("support-status");
    const supportClose = document.getElementById("support-close");
    const pareceArgentina = (navigator.languages || [navigator.language]).some(codigo => /^es[-_]AR$/i.test(codigo)) || (Intl.DateTimeFormat().resolvedOptions().timeZone || "").startsWith("America/Argentina/");

    async function localizar() {
        const disponibles = ["es", "en", "de", "fi", "fr", "it", "ja", "zh"];
        const codigo = (navigator.languages || [navigator.language]).map(valor => valor.toLowerCase().split("-")[0]).find(valor => disponibles.includes(valor)) || "en";
        try {
            const respuesta = await fetch(`manifiestos/${codigo}.json?v=20260823-1`);
            if (!respuesta.ok) return;
            const textos = await respuesta.json();
            support.textContent = textos.support;
            document.getElementById("support-title").textContent = textos.support_title;
            argentina.textContent = textos.support_argentina;
            paypal.textContent = textos.support_international;
            supportClose.textContent = textos.support_close;
        } catch {}
    }

    email.addEventListener("click", event => {
        event.preventDefault();
        try { window.top.location.href = email.href; }
        catch { window.location.href = email.href; }
    });

    support.addEventListener("click", () => {
        const preferred = pareceArgentina ? argentina : paypal;
        supportPanel.querySelector(".support-card").insertBefore(preferred, pareceArgentina ? paypal : argentina);
        supportPanel.hidden = false;
        preferred.focus();
    });

    async function copiar() {
        const alias = "muriscia.mp";
        try { await navigator.clipboard.writeText(alias); }
        catch {
            const field = document.createElement("textarea");
            field.value = alias;
            field.style.position = "fixed";
            field.style.opacity = "0";
            document.body.append(field);
            field.select();
            document.execCommand("copy");
            field.remove();
        }
        supportStatus.textContent = `ALIAS COPIED: ${alias}`;
    }

    const cerrar = () => {
        supportPanel.hidden = true;
        supportStatus.textContent = "";
        support.focus();
    };
    argentina.addEventListener("click", copiar);
    supportClose.addEventListener("click", cerrar);
    supportPanel.addEventListener("click", event => { if (event.target === supportPanel) cerrar(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !supportPanel.hidden) cerrar(); });
    localizar();
})();
