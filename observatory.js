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
        "fire_dwell"
    ]);

    window.observarUgju = (event,detail = "",duration = 0) => {
        if (!eventosPermitidos.has(event)) return;

        const cuerpo = JSON.stringify({
            event,
            detail: String(detail).slice(0,64),
            path: location.pathname.endsWith("fuegos.html")
                ? "fuegos"
                : "radio",
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

    window.observarUgju("visit");
})();
