// lifetime visit counter api, owned by workstream ws-2
// storage is vercel kv / upstash redis. without those env vars the endpoint
// reports itself unconfigured rather than serving an invented number.
const KEY = "portfolio:visits";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method not allowed" });
  }

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return response.status(200).json({ count: null, unconfigured: true });
  }

  try {
    const { kv } = await import("@vercel/kv");
    const bump = new URL(request.url, "http://localhost").searchParams.get("bump") === "1";
    const count = bump ? await kv.incr(KEY) : Number(await kv.get(KEY)) || 0;
    return response.status(200).json({ count });
  } catch {
    return response.status(200).json({ count: null, unconfigured: true });
  }
}
