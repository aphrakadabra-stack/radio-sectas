(() => {
    "use strict";

    // Las habitaciones embebidas usan la instancia de la casa. Cuando se abren
    // solas, cada una crea exactamente una instancia propia.
    if (new URLSearchParams(location.search).get("inside") === "radio") return;
    if (window.ugjuNotifications) return;

    const APP_ID = "e4712649-ca34-49e6-a2b4-f2ca6c5c7460";
    const SAFARI_WEB_ID = "web.onesignal.auto.4b99c5db-a7c9-461a-8333-facb0838095d";
    const SERVICE_WORKER_PATH = "/ugju-radio/OneSignalSDKWorker.js";
    const SERVICE_WORKER_SCOPE = "/ugju-radio/";
    const CACHE_KEY = "ugju-radio-notifications-enabled";
    const SETTLE_TIMEOUT = 15000;

    let sdk = null;
    let operation = Promise.resolve();
    let state = {
        ready: false,
        supported: false,
        permission: false,
        permissionState: window.Notification?.permission || "default",
        optedIn: localStorage.getItem(CACHE_KEY) === "true",
        subscriptionId: null,
        token: null,
        error: null
    };

    let resolveReady;
    let rejectReady;
    const ready = new Promise((resolve, reject) => {
        resolveReady = resolve;
        rejectReady = reject;
    });
    ready.catch(() => {});

    function snapshot() {
        return { ...state };
    }

    function readSdkState() {
        return {
            ready: true,
            supported: Boolean(sdk?.Notifications.isPushSupported()),
            permission: Boolean(sdk?.Notifications.permission),
            permissionState: window.Notification?.permission || "default",
            optedIn: Boolean(sdk?.User.PushSubscription.optedIn),
            subscriptionId: sdk?.User.PushSubscription.id || null,
            token: sdk?.User.PushSubscription.token || null,
            error: null
        };
    }

    function publish(next = readSdkState()) {
        state = next;
        localStorage.setItem(CACHE_KEY, String(Boolean(state.optedIn)));
        document.dispatchEvent(new CustomEvent("ugju-notifications-change", {
            detail: snapshot()
        }));
        return snapshot();
    }

    function fail(error) {
        state = {
            ...state,
            ready: false,
            optedIn: false,
            error: error instanceof Error ? error.message : String(error)
        };
        localStorage.setItem(CACHE_KEY, "false");
        document.dispatchEvent(new CustomEvent("ugju-notifications-error", {
            detail: snapshot()
        }));
    }

    function waitFor(predicate) {
        return new Promise((resolve, reject) => {
            const started = Date.now();
            const check = () => {
                const current = publish();
                if (predicate(current)) return resolve(current);
                if (Date.now() - started >= SETTLE_TIMEOUT) {
                    return reject(new Error("La suscripción no confirmó su nuevo estado."));
                }
                window.setTimeout(check, 120);
            };
            check();
        });
    }

    async function subscribe() {
        if (!state.supported) throw new Error("Este navegador no admite notificaciones push.");
        if (window.Notification?.permission === "denied") {
            throw new Error("Las notificaciones están bloqueadas en el navegador.");
        }
        if (!sdk.Notifications.permission) {
            await sdk.Notifications.requestPermission();
        }
        if (!sdk.Notifications.permission) {
            publish();
            throw new Error("No se concedió permiso para las notificaciones.");
        }
        await sdk.User.PushSubscription.optIn();
        return waitFor(current => current.optedIn && Boolean(current.token));
    }

    async function unsubscribe() {
        await sdk.User.PushSubscription.optOut();
        return waitFor(current => !current.optedIn);
    }

    function run(action) {
        const next = operation.then(async () => {
            await ready;
            return action();
        });
        operation = next.catch(() => {});
        return next;
    }

    window.ugjuNotifications = Object.freeze({
        ready,
        getState: snapshot,
        subscribe: () => run(subscribe),
        unsubscribe: () => run(unsubscribe),
        toggle: () => run(() => state.optedIn ? unsubscribe() : subscribe())
    });

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async OneSignal => {
        try {
            await OneSignal.init({
                appId: APP_ID,
                safari_web_id: SAFARI_WEB_ID,
                serviceWorkerPath: SERVICE_WORKER_PATH,
                serviceWorkerParam: { scope: SERVICE_WORKER_SCOPE },
                autoResubscribe: true,
                notifyButton: { enable: false },
                welcomeNotification: { disable: true }
            });

            sdk = OneSignal;
            window.ugjuOneSignal = OneSignal;
            const onSubscriptionChange = () => publish();
            OneSignal.User.PushSubscription.addEventListener("change", onSubscriptionChange);
            OneSignal.Notifications.addEventListener("permissionChange", onSubscriptionChange);

            const current = publish();
            resolveReady(current);
            document.dispatchEvent(new CustomEvent("ugju-notifications-ready", {
                detail: current
            }));
        } catch (error) {
            console.error("No se pudo iniciar el sistema de avisos de ÚGJÜ RADIO.", error);
            fail(error);
            rejectReady(error);
        }
    });
})();
