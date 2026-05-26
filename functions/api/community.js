export async function onRequest(context) {
  const cache = caches.default;
  const cacheKey = context.request;

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const fallback = { members: 5091, online: 0 };

  try {
    const res = await fetch('https://discord.com/api/v9/invites/Xug73qenBq?with_counts=true');
    if (!res.ok) throw new Error(`Discord ${res.status}`);
    const data = await res.json();
    const response = new Response(
      JSON.stringify({
        members: data.approximate_member_count ?? fallback.members,
        online: data.approximate_presence_count ?? 0,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch {
    const response = new Response(JSON.stringify(fallback), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  }
}
