(() => {
    if (window.parent !== window) return;
    if (location.hostname !== "ugjusectas.github.io") return;
    if (window.ugjuNotificationsInitializing) return;

    window.ugjuNotificationsInitializing = true;
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async OneSignal => {
        try {
            await OneSignal.init({
                appId: "e4712649-ca34-49e6-a2b4-f2ca6c5c7460",
                safari_web_id: "web.onesignal.auto.4b99c5db-a7c9-461a-8333-facb0838095d",
                // OneSignal interpreta esta ruta desde la raíz del origen.
                // Su SDK exige que no empiece con una barra.
                serviceWorkerPath: "ugju-radio/OneSignalSDKWorker.js",
                serviceWorkerParam: { scope: "/ugju-radio/" },
                notifyButton: { enable: false }
            });

            window.ugjuOneSignal = OneSignal;
            window.ugjuNotificationsError = null;

            const getState = () => ({
                supported: OneSignal.Notifications.isPushSupported(),
                permission: Boolean(OneSignal.Notifications.permission),
                optedIn: Boolean(OneSignal.User.PushSubscription.optedIn)
            });

            window.ugjuNotifications = {
                getState,

                async toggle() {
                    const state = getState();
                    if (!state.supported) return state;

                    if (state.optedIn) {
                        await OneSignal.User.PushSubscription.optOut();
                    } else {
                        if (!OneSignal.Notifications.permission) {
                            await OneSignal.Notifications.requestPermission();
                        }

                        if (!OneSignal.Notifications.permission) {
                            throw new Error("Notification permission was not granted");
                        }

                        await OneSignal.User.PushSubscription.optIn();
                    }

                    return getState();
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
