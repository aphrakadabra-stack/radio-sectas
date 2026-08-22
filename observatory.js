(() => {
    const configuracion = document.querySelector(
        'meta[name="ugju-observatory"]'
    );
    const endpoint = configuracion?.content?.trim();

    if (!endpoint) {
        window.observarUgju = () => {};
        return;
    }

    const eventosPermitidos = new Set([
        "visit",
        "live_play",
        "archive_open",
        "archive_play",
        "fire_open",
        "fire_dwell",
        "fire_complete",
        "uri_pet"
    ]);

    const rutas = {
        "archivo.html": "archivo",
        "fuegos.html": "fuegos",
        "manifiesto.html": "manifiesto"
    };

    const pagina = location.pathname.split("/").pop() || "index.html";
    const estaPrecargadaEnRadio =
        new URLSearchParams(location.search).get("inside") === "radio";
    let observatorioActivo = !estaPrecargadaEnRadio;

    window.observarUgju = (event,detail = "",duration = 0) => {
        if (!observatorioActivo) return;
        if (!eventosPermitidos.has(event)) return;

        const cuerpo = JSON.stringify({
            event,
            detail: String(detail).slice(0,64),
            path: rutas[pagina] || "radio",
            duration: Math.min(
                3600,
                Math.max(0,Math.round(Number(duration) / 15) * 15)
            )
        });

        if (navigator.sendBeacon) {
            navigator.sendBeacon(
                endpoint,
                new Blob([cuerpo],{type:"text/plain;charset=UTF-8"})
            );
            return;
        }

        fetch(endpoint,{
            method: "POST",
            headers: {"content-type":"text/plain;charset=UTF-8"},
            body: cuerpo,
            keepalive: true
        }).catch(() => {});
    };

    if (estaPrecargadaEnRadio) {
        window.addEventListener("message",evento => {
            if (
                evento.origin !== location.origin ||
                evento.source !== parent ||
                evento.data?.type !== "ugju-observatory-activate" ||
                observatorioActivo
            ) return;

            observatorioActivo = true;
            window.observarUgju("visit");
        });
    } else {
        window.observarUgju("visit");
    }
})();
