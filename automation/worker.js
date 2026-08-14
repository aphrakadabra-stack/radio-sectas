const RADIO_STATUS_URL =
    "https://ugju-radio-metadata.ugjusectas.workers.dev/metadata";

const RADIO_URL =
    "https://ugjusectas.github.io/ugju-radio/";

const ONESIGNAL_APP_ID =
    "e4712649-ca34-49e6-a2b4-f2ca6c5c7460";

const STATE_KEY = "ugju-radio-state";

const LIVE_CONFIRMATIONS_REQUIRED = 2;

const SLEEP_CONFIRMATIONS_REQUIRED = 5;


export default {

    async scheduled(controller,env,context) {

        context.waitUntil(checkRadio(env));

    },


    async fetch(request,env) {

        const url = new URL(request.url);

        if (url.pathname === "/check") {

            const result = await checkRadio(env);

            return Response.json(result);

        }

        return new Response(
            "ÚGJÜ RADIO automation is awake.",
            {
                headers: {
                    "content-type":
                        "text/plain; charset=utf-8"
                }
            }
        );

    }

};


async function checkRadio(env) {

    const isLive = await readRadioStatus();

    const savedState =
        await env.RADIO_STATE.get(
            STATE_KEY,
            {
                type: "json"
            }
        ) || {
            status: "sleeping",
            confirmations: 0
        };


    if (isLive) {

        if (savedState.status === "live") {

            return {
                live: true,
                notificationSent: false,
                reason: "already-live"
            };

        }

        if (savedState.status === "falling-asleep") {

            await saveState(
                env,
                {
                    status: "live",
                    confirmations:
                        LIVE_CONFIRMATIONS_REQUIRED
                }
            );

            return {
                live: true,
                notificationSent: false,
                reason:
                    "brief-interruption-recovered"
            };

        }

        const confirmations =
            savedState.status === "waking"
                ? savedState.confirmations + 1
                : 1;


        if (
            confirmations <
            LIVE_CONFIRMATIONS_REQUIRED
        ) {

            await saveState(
                env,
                {
                    status: "waking",
                    confirmations
                }
            );

            return {
                live: true,
                notificationSent: false,
                reason: "confirming-live"
            };

        }

        const notification =
            await sendOneSignalNotification(env);

        await saveState(
            env,
            {
                status: "live",
                confirmations:
                    LIVE_CONFIRMATIONS_REQUIRED,
                notifiedAt: new Date().toISOString()
            }
        );

        return {
            live: true,
            notificationSent: true,
            notificationId: notification.id
        };

    }


    if (savedState.status === "sleeping") {

        return {
            live: false,
            notificationSent: false,
            reason: "already-sleeping"
        };

    }

    if (savedState.status === "waking") {

        await saveState(
            env,
            {
                status: "sleeping",
                confirmations: 0
            }
        );

        return {
            live: false,
            notificationSent: false,
            reason: "false-start"
        };

    }


    const confirmations =
        savedState.status === "falling-asleep"
            ? savedState.confirmations + 1
            : 1;


    if (
        confirmations <
        SLEEP_CONFIRMATIONS_REQUIRED
    ) {

        await saveState(
            env,
            {
                status: "falling-asleep",
                confirmations
            }
        );

        return {
            live: false,
            notificationSent: false,
            reason: "confirming-sleep",
            confirmations,
            required:
                SLEEP_CONFIRMATIONS_REQUIRED
        };

    }


    await saveState(
        env,
        {
            status: "sleeping",
            confirmations: 0
        }
    );

    return {
        live: false,
        notificationSent: false,
        reason: "sleep-confirmed"
    };

}


async function readRadioStatus() {

    const response = await fetch(
        RADIO_STATUS_URL,
        {
            headers: {
                "accept": "application/json"
            },
            cf: {
                cacheTtl: 0,
                cacheEverything: false
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            `Radio status returned ${response.status}`
        );
    }

    const data = await response.json();

    if (typeof data?.online !== "boolean") {
        throw new Error("Radio status did not include online state");
    }

    return data.online;

}


async function sendOneSignalNotification(env) {

    if (!env.ONESIGNAL_API_KEY) {
        throw new Error(
            "Missing ONESIGNAL_API_KEY secret"
        );
    }

    const response = await fetch(
        "https://api.onesignal.com/notifications",
        {
            method: "POST",
            headers: {
                "Authorization":
                    `Key ${env.ONESIGNAL_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                target_channel: "push",
                included_segments: [
                    "Total Subscriptions"
                ],
                headings: {
                    en: "ÚGJÜ RADIO"
                },
                contents: {
                    en:
                        "The house is inhabited. Come in and listen.",
                    es:
                        "La casa está habitada. Entrá a escuchar.",
                    de:
                        "Das Haus ist bewohnt. Komm herein und lausche.",
                    fi:
                        "Talo on asuttu. Tule sisään kuuntelemaan.",
                    fr:
                        "La maison est habitée. Entrez écouter.",
                    it:
                        "La casa è abitata. Entra ad ascoltare.",
                    ja:
                        "家には誰かがいます。入って、耳を澄ませてください。",
                    "zh-Hans":
                        "这座房子有人居住。进来听听吧。"
                },
                url: RADIO_URL,
                collapse_id: "ugju-radio-live"
            })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            `OneSignal error: ${JSON.stringify(result)}`
        );
    }

    if (!result.id) {
        throw new Error(
            `OneSignal did not create a message: ${JSON.stringify(result)}`
        );
    }

    return result;

}


function saveState(env,state) {

    return env.RADIO_STATE.put(
        STATE_KEY,
        JSON.stringify(state)
    );

}
