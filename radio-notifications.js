(() => {
    "use strict";

    const button = document.querySelector("[data-radio-notifications]");
    if (!button) return;

    const config = window.UGJU_NOTIFICATION_CONFIG;
    const status = document.createElement("p");
    status.className = "house-notice";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.hidden = true;
    document.body.append(status);

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

    let oneSignal = null;
    let ready = false;
    let busy = false;
    let noticeTimer = 0;
    const SUBSCRIPTION_TIMEOUT = 15000;

    function show(message) {
        window.clearTimeout(noticeTimer);
        status.textContent = message;
        status.hidden = false;
        requestAnimationFrame(() => status.classList.add("is-visible"));
        noticeTimer = window.setTimeout(() => {
            status.classList.remove("is-visible");
            window.setTimeout(() => { status.hidden = true; }, 180);
        }, 4200);
    }

    function isSubscribed() {
        return Boolean(oneSignal?.User?.PushSubscription?.optedIn);
    }

    function render() {
        const active = isSubscribed();
        button.setAttribute("aria-pressed", String(active));
        button.setAttribute("aria-label", active ? messages.active : messages.idle);
        button.title = active ? messages.active : messages.idle;
        button.toggleAttribute("aria-busy", busy);
    }

    function available() {
        return Boolean(
            window.isSecureContext &&
            "Notification" in window &&
            "serviceWorker" in navigator &&
            "PushManager" in window
        );
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
                if (hasCompleteSubscription()) {
                    resolve();
                    return;
                }
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
        if (busy) return;
        if (!available()) {
            show(messages.unsupported);
            return;
        }
        if (!config || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(config.appId)) {
            show(messages.unavailable);
            return;
        }
        if (!ready || !oneSignal) {
            show(messages.unavailable);
            return;
        }

        busy = true;
        render();
        try {
            if (isSubscribed()) {
                await oneSignal.User.PushSubscription.optOut();
                show(messages.disabled);
            } else {
                const permissionRequest = oneSignal.Notifications.requestPermission({
                    fallbackToSettings: true
                });
                await permissionRequest;
                if (!oneSignal.Notifications.permission) {
                    show(messages.blocked);
                    return;
                }
                await oneSignal.User.PushSubscription.optIn();
                await waitForCompleteSubscription();
                show(messages.enabled);
            }
        } catch (error) {
            console.error("ÚGJÜ RADIO notification change failed.", error);
            show(Notification.permission === "denied" ? messages.blocked : messages.error);
        } finally {
            busy = false;
            render();
        }
    }

    button.addEventListener("click", toggle);
    render();

    if (!available() || !config || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(config.appId)) return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async sdk => {
        try {
            await sdk.init({
                appId: config.appId,
                safari_web_id: config.safariWebId,
                path: config.path,
                serviceWorkerPath: config.workerPath,
                serviceWorkerParam: { scope: config.workerScope },
                notifyButton: { enable: false },
                welcomeNotification: { disable: true }
            });
            oneSignal = sdk;
            ready = true;
            sdk.User.PushSubscription.addEventListener("change", render);
            sdk.Notifications.addEventListener("permissionChange", render);
            render();
        } catch (error) {
            console.error("ÚGJÜ RADIO notification initialization failed.", error);
            show(messages.unavailable);
        }
    });
})();
