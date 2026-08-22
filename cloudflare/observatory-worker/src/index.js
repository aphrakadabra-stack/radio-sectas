const EVENTS = new Set([
    "visit",
    "live_play",
    "archive_open",
    "archive_play",
    "fire_open",
    "fire_dwell",
    "fire_complete",
    "uri_pet"
]);

const DETAILS = /^[a-z0-9_-]{0,64}$/;
const PATHS = new Set(["radio","fuegos","archivo","manifiesto"]);

export default {
    async fetch(request,env) {
        const url = new URL(request.url);

        if (request.method === "OPTIONS") {
            return new Response(null,{
                status: 204,
                headers: corsHeaders(env)
            });
        }

        if (request.method === "POST" && url.pathname === "/event") {
            return collect(request,env);
        }

        if (request.method === "GET" && url.pathname === "/summary") {
            return summary(request,env);
        }

        if (request.method === "GET" && url.pathname === "/") {
            return new Response(DASHBOARD,{
                headers: {
                    "content-type": "text/html; charset=utf-8",
                    "cache-control": "no-store",
                    "x-content-type-options": "nosniff",
                    "content-security-policy":
                        "default-src 'none'; style-src 'unsafe-inline'; " +
                        "script-src 'unsafe-inline'; connect-src 'self'; " +
                        "form-action 'none'; frame-ancestors 'none'"
                }
            });
        }

        return Response.json({error:"Not found"},{status:404});
    }
};

async function collect(request,env) {
    const origin = request.headers.get("origin");

    if (origin !== env.ALLOWED_ORIGIN) {
        return Response.json({error:"Forbidden"},{status:403});
    }

    const length = Number(request.headers.get("content-length") || 0);
    if (length > 2048) {
        return Response.json({error:"Too large"},{status:413});
    }

    let data;
    try {
        data = await request.json();
    } catch (error) {
        return Response.json({error:"Invalid JSON"},{status:400});
    }

    const event = String(data?.event || "");
    const detail = String(data?.detail || "");
    const path = String(data?.path || "");
    const duration = Number(data?.duration || 0);

    if (
        !EVENTS.has(event) ||
        !DETAILS.test(detail) ||
        !PATHS.has(path) ||
        !Number.isFinite(duration) ||
        duration < 0 ||
        duration > 3600
    ) {
        return Response.json({error:"Invalid event"},{status:400});
    }

    env.OBSERVATORY.writeDataPoint({
        indexes: [event],
        blobs: [event,detail,path],
        doubles: [duration]
    });

    return new Response(null,{
        status: 204,
        headers: corsHeaders(env)
    });
}

async function summary(request,env) {
    const supplied = request.headers.get("authorization") || "";
    const expected = `Bearer ${env.OBSERVATORY_DASHBOARD_TOKEN || ""}`;

    if (!env.OBSERVATORY_DASHBOARD_TOKEN || !await sameSecret(supplied,expected)) {
        return Response.json(
            {error:"Unauthorized"},
            {
                status: 401,
                headers: {
                    "cache-control":"no-store",
                    "www-authenticate":"Bearer"
                }
            }
        );
    }

    const events = await query(env,`
        SELECT blob1 AS event, SUM(_sample_interval) AS total
        FROM ugju_radio_observatory
        WHERE timestamp > NOW() - INTERVAL '1' DAY
        GROUP BY event ORDER BY total DESC FORMAT JSON
    `);
    const fireOpens = await query(env,`
        SELECT blob2 AS fire, SUM(_sample_interval) AS opens
        FROM ugju_radio_observatory
        WHERE timestamp > NOW() - INTERVAL '1' DAY
            AND blob1 = 'fire_open'
        GROUP BY fire ORDER BY opens DESC FORMAT JSON
    `);
    const fireDwell = await query(env,`
        SELECT blob2 AS fire,
            SUM(_sample_interval * double1) AS dwell_seconds
        FROM ugju_radio_observatory
        WHERE timestamp > NOW() - INTERVAL '1' DAY
            AND blob1 = 'fire_dwell'
        GROUP BY fire ORDER BY dwell_seconds DESC FORMAT JSON
    `);
    const fireActions = await query(env,`
        SELECT blob2 AS fire, blob1 AS event,
            SUM(_sample_interval) AS total
        FROM ugju_radio_observatory
        WHERE timestamp > NOW() - INTERVAL '1' DAY
            AND blob1 IN ('fire_complete','uri_pet')
        GROUP BY fire,event ORDER BY total DESC FORMAT JSON
    `);

    return Response.json(
        {
            period: "24h",
            events: events.data || [],
            fireOpens: fireOpens.data || [],
            fireDwell: fireDwell.data || [],
            fireActions: fireActions.data || [],
            generatedAt: new Date().toISOString()
        },
        {headers:{"cache-control":"no-store"}}
    );
}

async function query(env,sql) {
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/analytics_engine/sql`,
        {
            method: "POST",
            headers: {
                "authorization": `Bearer ${env.ANALYTICS_API_TOKEN}`,
                "content-type": "text/plain"
            },
            body: sql
        }
    );

    if (!response.ok) {
        throw new Error(`Analytics query returned ${response.status}`);
    }

    return response.json();
}

async function sameSecret(left,right) {
    const encoder = new TextEncoder();
    const [a,b] = await Promise.all([
        crypto.subtle.digest("SHA-256",encoder.encode(left)),
        crypto.subtle.digest("SHA-256",encoder.encode(right))
    ]);
    const first = new Uint8Array(a);
    const second = new Uint8Array(b);
    let difference = 0;
    for (let index = 0;index < first.length;index += 1) {
        difference |= first[index] ^ second[index];
    }
    return difference === 0;
}

function corsHeaders(env) {
    return {
        "access-control-allow-origin": env.ALLOWED_ORIGIN,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "86400",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
    };
}

const DASHBOARD = `<!doctype html>
<html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>ÚGJÜ — OBSERVATORIO</title>
<style>body{margin:0;background:#171417;color:#eee;font:16px ui-monospace,monospace}main{max-width:760px;margin:10vh auto;padding:24px}h1{font-weight:400;letter-spacing:.12em}input,button{font:inherit;padding:10px;background:#171417;color:#eee;border:1px solid #777}pre{line-height:1.7;white-space:pre-wrap}</style>
<main><h1>ÚGJÜ — OBSERVATORIO</h1><p>Clave privada</p><input id="key" type="password" autocomplete="current-password"><button id="open">MIRAR</button><pre id="view"></pre></main>
<script>document.getElementById('open').onclick=async()=>{const view=document.getElementById('view'),key=document.getElementById('key');view.textContent='…';const r=await fetch('/summary',{headers:{authorization:'Bearer '+key.value}});view.textContent=r.ok?JSON.stringify(await r.json(),null,2):'La puerta permanece cerrada.'}</script></html>`;
