(() => {
    // Las vistas internas comparten la única instancia de la Casa. No usamos
    // parent !== window: algunos navegadores alojan incluso la página principal
    // dentro de un frame y esa comprobación dejaba la campanita sin inicializar.
    if (new URLSearchParams(location.search).get("inside") === "radio") return;
    if (location.hostname !== "ugjusectas.github.io") return;
    if (window.ugjuNotificationsInitializing) return;

    window.ugjuNotificationsInitializing = true;
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async OneSignal => {
        try {
            await OneSignal.init({
                appId: "e4712649-ca34-49e6-a2b4-f2ca6c5c7460",
                safari_web_id: "web.onesignal.auto.4b99c5db-a7c9-461a-8333-facb0838095d",
                serviceWorkerPath: "/ugju-radio/OneSignalSDKWorker.js",
                serviceWorkerParam: { scope: "/ugju-radio/" },
                notifyButton: { enable: false }
            });

            window.ugjuOneSignal = OneSignal;
            window.ugjuNotificationsError = null;

            const getState = () => ({
                supported: OneSignal.Notifications.isPushSupported(),
                permission: Boolean(OneSignal.Notifications.permission),
                optedIn: Boolean(OneSignal.User.PushSubscription.optedIn),
                subscriptionId: OneSignal.User.PushSubscription.id || null,
                token: OneSignal.User.PushSubscription.token || null
            });

            const waitForState = (predicate, timeout = 10000) =>
                new Promise((resolve, reject) => {
                    const startedAt = Date.now();

                    const check = () => {
                        const state = getState();

                        if (predicate(state)) {
                            resolve(state);
                            return;
                        }

                        if (Date.now() - startedAt >= timeout) {
                            reject(new Error("Push subscription state did not settle"));
                            return;
                        }

                        window.setTimeout(check, 100);
                    };

                    check();
                });

            window.ugjuNotifications = {
                getState,

                async toggle() {
                    const state = getState();
                    if (!state.supported) return state;

                    if (state.optedIn) {
                        await OneSignal.User.PushSubscription.optOut();
                        return waitForState(current => !current.optedIn);
                    } else {
                        if (!state.permission) {
                            await OneSignal.Notifications.requestPermission();
                        }

                        if (!OneSignal.Notifications.permission) {
                            throw new Error("Notification permission was not granted");
                        }

                        await OneSignal.User.PushSubscription.optIn();
                        return waitForState(current => current.optedIn);
                    }
                }
            };

            const anunciarCambio = () => document.dispatchEvent(
                new CustomEvent("ugju-notifications-change")
            );

            OneSignal.User.PushSubscription.addEventListener(
                "change",
                anunciarCambio
            );

            document.dispatchEvent(new CustomEvent("ugju-onesignal-ready"));
            anunciarCambio();
        } catch (error) {
            window.ugjuNotificationsError = error;
            console.error("No se pudo iniciar el sistema de avisos de ÚGJÜ RADIO.", error);
            document.dispatchEvent(new CustomEvent("ugju-onesignal-error"));
        }
    });
})();
