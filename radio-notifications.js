(() => {
    "use strict";

    const button = document.querySelector("[data-radio-notifications]");
    const config = window.UGJU_NOTIFICATION_CONFIG;
    const messages = {
        idle: "Notify me when ÚGJÜ RADIO is on air",
        active: "Notifications are on. Tap to turn them off",
        enabled: "Notifications are now on.",
        disabled: "Notifications are off. You can turn them on again whenever you like.",
        blocked: "Notifications are blocked. Enable them in this browser's site settings and tap the bell again.",
        unsupported: "This browser does not support web notifications.",
        unavailable: "Notifications are being reconfigured. Please try again shortly.",
        error: "Notifications could not be changed. Please try again."
    };
    const stateChannel =
        "BroadcastChannel" in window
            ? new BroadcastChannel("ugju-radio-notification-state")
            : null;

    let busy = false;
    let noticeTimer = 0;
    const status = button ? document.createElement("p") : null;

    if (status) {
        status.className = "house-notice";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        status.hidden = true;
        document.body.append(status);
    }

    function show(message) {
        if (!status) return;
        window.clearTimeout(noticeTimer);
        status.textContent = message;
        status.hidden = false;
        requestAnimationFrame(() => status.classList.add("is-visible"));
        noticeTimer = window.setTimeout(() => {
            status.classList.remove("is-visible");
            window.setTimeout(() => { status.hidden = true; }, 180);
        }, 4200);
    }

    function render(active = false) {
        if (!button) return;
        button.setAttribute("aria-pressed", String(active));
        button.setAttribute("aria-label", active ? messages.active : messages.idle);
        button.title = active ? messages.active : messages.idle;
        button.toggleAttribute("aria-busy", busy);
    }

    function isEmbedded() {
        try {
            return window.parent !== window && window.parent.location.origin === location.origin;
        } catch {
            return false;
        }
    }

    if (isEmbedded()) {
        const parentNotifications = () => window.parent.UGJU_RADIO_NOTIFICATIONS;

        button?.addEventListener("click", async () => {
            if (busy) return;
            const manager = parentNotifications();
            if (!manager) {
                show(messages.unavailable);
                return;
            }
            busy = true;
            render(manager.isSubscribed());
            const result = await manager.toggle();
            busy = false;
            render(result.active);
            show(messages[result.message] || messages.error);
        });

        stateChannel?.addEventListener("message", event => {
            if (event.data?.type === "subscription-state") {
                render(Boolean(event.data.active));
            }
        });

        const connect = () => {
            const manager = parentNotifications();
            if (manager) {
                render(manager.isSubscribed());
                return;
            }
            window.setTimeout(connect, 100);
        };
        render();
        connect();
        return;
    }

    let oneSignal = null;
    let ready = false;
    const SUBSCRIPTION_TIMEOUT = 15000;

    function available() {
        return Boolean(
            window.isSecureContext &&
            "Notification" in window &&
            "serviceWorker" in navigator &&
            "PushManager" in window
        );
    }

    function validConfig() {
        return Boolean(
            config &&
            /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(config.appId)
        );
    }

    function isSubscribed() {
        return Boolean(oneSignal?.User?.PushSubscription?.optedIn);
    }

    function shareState() {
        const active = isSubscribed();
        render(active);
        stateChannel?.postMessage({type: "subscription-state", active});
    }

    function hasCompleteSubscription() {
        return Boolean(
            isSubscribed() &&
            oneSignal?.User?.PushSubscription?.id &&
            oneSignal?.User?.PushSubscription?.token
        );
    }

    function waitForCompleteSubscription() {
        return new Promise((resolve, reject) => {
            const started = Date.now();
            const check = () => {
                if (hasCompleteSubscription()) return resolve();
                if (Date.now() - started >= SUBSCRIPTION_TIMEOUT) {
                    reject(new Error("OneSignal did not create a complete push subscription."));
                    return;
                }
                window.setTimeout(check, 200);
            };
            check();
        });
    }

    async function toggle() {
        if (busy) return {active: isSubscribed(), message: "unavailable"};
        if (!available()) return {active: false, message: "unsupported"};
        if (!validConfig() || !ready || !oneSignal) {
            return {active: isSubscribed(), message: "unavailable"};
        }

        busy = true;
        render(isSubscribed());
        let message = "error";
        try {
            if (isSubscribed()) {
                await oneSignal.User.PushSubscription.optOut();
                message = "disabled";
            } else {
                await oneSignal.Notifications.requestPermission({fallbackToSettings: true});
                if (!oneSignal.Notifications.permission) {
                    message = "blocked";
                } else {
                    await oneSignal.User.PushSubscription.optIn();
                    await waitForCompleteSubscription();
                    message = "enabled";
                }
            }
        } catch (error) {
            console.error("ÚGJÜ RADIO notification change failed.", error);
            message = Notification.permission === "denied" ? "blocked" : "error";
        } finally {
            busy = false;
            shareState();
        }
        return {active: isSubscribed(), message};
    }

    window.UGJU_RADIO_NOTIFICATIONS = Object.freeze({isSubscribed, toggle});
    stateChannel?.addEventListener("message", event => {
        if (event.data?.type === "subscription-state") {
            render(Boolean(event.data.active));
        }
    });
    button?.addEventListener("click", async () => {
        const result = await toggle();
        show(messages[result.message] || messages.error);
    });
    render();

    if (!available() || !validConfig()) return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async sdk => {
        try {
            await sdk.init({
                appId: config.appId,
                safari_web_id: config.safariWebId,
                path: config.path,
                serviceWorkerPath: config.workerPath,
                serviceWorkerParam: {scope: config.workerScope},
                notifyButton: {enable: false},
                welcomeNotification: {disable: true}
            });
            oneSignal = sdk;
            ready = true;
            sdk.User.PushSubscription.addEventListener("change", shareState);
            sdk.Notifications.addEventListener("permissionChange", shareState);
            shareState();
        } catch (error) {
            console.error("ÚGJÜ RADIO notification initialization failed.", error);
            show(messages.unavailable);
        }
    });

    const sdkScript = document.createElement("script");
    sdkScript.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    sdkScript.defer = true;
    document.head.append(sdkScript);
})();
