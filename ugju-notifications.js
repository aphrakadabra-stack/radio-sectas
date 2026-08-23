(() => {
    "use strict";

    const CONFIG = Object.freeze({
        appId: "e4712649-ca34-49e6-a2b4-f2ca6c5c7460",
        safariWebId: "web.onesignal.auto.4b99c5db-a7c9-461a-8333-facb0838095d",
        serviceWorkerPath: "/ugju-radio/OneSignalSDKWorker.js",
        serviceWorkerScope: "/ugju-radio/"
    });
    const SETTLE_TIMEOUT = 15000;
    const DEFAULT_TEXT = Object.freeze({
        notify_label: "Notify me when ÚGJÜ RADIO is on air",
        notify_active: "Notifications are on. Tap to turn them off",
        notify_success: "Notifications are now on.",
        notify_disabled: "Notifications are off.",
        notify_unsupported: "This browser does not support notifications.",
        notify_error: "Notifications could not be enabled. Check your browser permissions.",
        notify_open_browser: "Open this page in your browser to receive notifications.",
        notify_ios_title: "NOTIFICATIONS ON IPHONE OR IPAD",
        notify_ios_install: "Share → Add to Home Screen → open ÚGJÜ RADIO from the icon → tap the bell again.",
        support_close: "CLOSE"
    });

    const isEmbeddedRoom = new URLSearchParams(location.search).get("inside") === "radio";
    let sdk = null;
    let state = Object.freeze({ ready: false, supported: false, permission: window.Notification?.permission || "default", optedIn: false, subscriptionId: null, token: null, error: null });
    let resolveReady;
    let rejectReady;
    const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
    ready.catch(() => {});

    function readState() {
        if (!sdk) return state;
        return Object.freeze({
            ready: true,
            supported: Boolean(sdk.Notifications.isPushSupported()),
            permission: window.Notification?.permission || "default",
            optedIn: Boolean(sdk.User.PushSubscription.optedIn),
            subscriptionId: sdk.User.PushSubscription.id || null,
            token: sdk.User.PushSubscription.token || null,
            error: null
        });
    }

    function publish(next = readState()) {
        state = next;
        document.dispatchEvent(new CustomEvent("ugju-notifications-change", { detail: state }));
        return state;
    }

    function waitFor(predicate) {
        return new Promise((resolve, reject) => {
            const started = Date.now();
            const check = () => {
                const current = publish();
                if (predicate(current)) return resolve(current);
                if (Date.now() - started >= SETTLE_TIMEOUT) return reject(new Error("OneSignal did not confirm the subscription change."));
                window.setTimeout(check, 150);
            };
            check();
        });
    }

    function subscribe() {
        if (!state.ready || !sdk) return Promise.reject(new Error("Notifications are not ready."));
        if (!state.supported) return Promise.reject(new Error("Push is not supported."));
        if (window.Notification?.permission === "denied") return Promise.reject(new Error("Notifications are blocked in browser settings."));
        // Start optIn directly inside the click gesture: an earlier await can
        // make the browser discard the user activation needed for its prompt.
        const request = sdk.User.PushSubscription.optIn();
        return Promise.resolve(request).then(() => waitFor(current => current.optedIn && Boolean(current.token)));
    }

    function unsubscribe() {
        if (!state.ready || !sdk) return Promise.reject(new Error("Notifications are not ready."));
        const request = sdk.User.PushSubscription.optOut();
        return Promise.resolve(request).then(() => waitFor(current => !current.optedIn));
    }

    function toggle() { return state.optedIn ? unsubscribe() : subscribe(); }

    if (!isEmbeddedRoom && !window.UgjuPush) {
        window.UgjuPush = Object.freeze({ ready, getState: () => state, subscribe, unsubscribe, toggle });
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async OneSignal => {
            try {
                await OneSignal.init({
                    appId: CONFIG.appId,
                    safari_web_id: CONFIG.safariWebId,
                    serviceWorkerPath: CONFIG.serviceWorkerPath,
                    serviceWorkerParam: { scope: CONFIG.serviceWorkerScope },
                    autoResubscribe: true,
                    notifyButton: { enable: false },
                    welcomeNotification: { disable: true }
                });
                sdk = OneSignal;
                const sync = () => publish();
                OneSignal.User.PushSubscription.addEventListener("change", sync);
                OneSignal.Notifications.addEventListener("permissionChange", sync);
                const current = publish();
                resolveReady(current);
                document.dispatchEvent(new CustomEvent("ugju-notifications-ready", { detail: current }));
            } catch (error) {
                state = Object.freeze({ ...state, error: String(error?.message || error) });
                publish(state);
                rejectReady(error);
                console.error("Unable to initialize ÚGJÜ RADIO notifications.", error);
            }
        });
    }

    function getController() {
        try { return window.UgjuPush || (parent !== window ? parent.UgjuPush : null); }
        catch { return window.UgjuPush || null; }
    }

    async function loadText() {
        const available = ["es", "en", "de", "fi", "fr", "it", "ja", "zh"];
        const language = (navigator.languages || [navigator.language]).map(value => String(value).toLowerCase().split("-")[0]).find(value => available.includes(value)) || "en";
        try {
            const response = await fetch(`manifiestos/${language}.json?v=20260823-1`);
            if (response.ok) return { ...DEFAULT_TEXT, ...await response.json() };
        } catch {}
        return { ...DEFAULT_TEXT };
    }

    function bindInterface() {
        const button = document.getElementById("notify-link");
        if (!button) return;
        const installPanel = document.getElementById("notification-install-panel");
        const installClose = document.getElementById("notification-install-close");
        const notice = document.createElement("p");
        notice.className = "house-notice";
        notice.setAttribute("role", "status");
        notice.setAttribute("aria-live", "polite");
        notice.hidden = true;
        document.body.appendChild(notice);
        let text = { ...DEFAULT_TEXT };
        let noticeTimer;

        const showNotice = message => {
            clearTimeout(noticeTimer);
            notice.textContent = message;
            notice.hidden = false;
            requestAnimationFrame(() => notice.classList.add("is-visible"));
            noticeTimer = setTimeout(() => {
                notice.classList.remove("is-visible");
                setTimeout(() => { notice.hidden = true; }, 180);
            }, 3600);
        };
        const render = () => {
            const current = getController()?.getState();
            const active = Boolean(current?.ready && current.optedIn && current.token);
            button.disabled = !current?.ready;
            button.setAttribute("aria-pressed", String(active));
            const label = active ? text.notify_active : text.notify_label;
            button.setAttribute("aria-label", label);
            button.title = label;
        };
        const installed = () => navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;
        const mobileApple = /iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const closeInstall = () => { if (installPanel) installPanel.hidden = true; button.focus(); };

        button.addEventListener("click", () => {
            if (/Instagram/i.test(navigator.userAgent)) { showNotice(text.notify_open_browser); return; }
            if (mobileApple && !installed() && installPanel) { installPanel.hidden = false; installClose?.focus(); return; }
            const controller = getController();
            if (!controller?.getState().ready) { showNotice(text.notify_error); return; }
            button.disabled = true;
            button.setAttribute("aria-busy", "true");
            controller.toggle().then(result => {
                render();
                showNotice(result.optedIn ? text.notify_success : text.notify_disabled);
            }).catch(error => {
                console.error("Unable to change notification subscription.", error);
                render();
                showNotice(error.message || text.notify_error);
            }).finally(() => button.removeAttribute("aria-busy"));
        });

        installClose?.addEventListener("click", closeInstall);
        installPanel?.addEventListener("click", event => { if (event.target === installPanel) closeInstall(); });
        document.addEventListener("keydown", event => { if (event.key === "Escape" && installPanel && !installPanel.hidden) closeInstall(); });
        const sourceDocument = (() => { try { return parent !== window ? parent.document : document; } catch { return document; } })();
        sourceDocument.addEventListener("ugju-notifications-ready", render);
        sourceDocument.addEventListener("ugju-notifications-change", render);

        loadText().then(localized => {
            text = localized;
            const title = document.getElementById("notification-install-title");
            const copy = document.getElementById("notification-install-copy") || installPanel?.querySelector("p");
            if (title) title.textContent = text.notify_ios_title;
            if (copy) copy.textContent = text.notify_ios_install;
            if (installClose) installClose.textContent = text.support_close;
            render();
        });
        render();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindInterface, { once: true });
    else bindInterface();
})();
