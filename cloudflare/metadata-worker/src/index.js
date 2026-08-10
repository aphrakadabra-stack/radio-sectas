const UPSTREAM = "https://radio.free-shoutcast.com/api/get-station-info/91014";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "public, max-age=15, stale-while-revalidate=45",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff"
};

function json(body,status = 200,head = false) {
    return new Response(head ? null : JSON.stringify(body),{
        status,
        headers:CORS_HEADERS
    });
}

export default {
    async fetch(request) {
        const {pathname} = new URL(request.url);
        const isHead = request.method === "HEAD";

        if (request.method === "OPTIONS") {
            return new Response(null,{status:204,headers:CORS_HEADERS});
        }

        if (
            (!isHead && request.method !== "GET") ||
            (pathname !== "/" && pathname !== "/metadata")
        ) {
            return json({error:"Not found"},404,isHead);
        }

        try {
            const upstream = await fetch(UPSTREAM,{
                headers:{Accept:"application/json"},
                cf:{cacheTtl:15,cacheEverything:true}
            });

            if (!upstream.ok) {
                return json({error:"Metadata unavailable"},502,isHead);
            }

            const data = await upstream.json();
            const station = data?.station ?? {};

            return json({
                online:Boolean(station.isOnline),
                title:typeof station.currentSong === "string"
                    ? station.currentSong.trim()
                    : "",
                station:"ÚGJÜ RADIO",
                updatedAt:new Date().toISOString()
            },200,isHead);
        } catch (error) {
            return json({error:"Metadata unavailable"},502,isHead);
        }
    }
};
