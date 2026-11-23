export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id,name,description,category,price,currency,image_url,stock FROM products WHERE active=1 AND stock>0 ORDER BY sort_order,id"
  ).all();
  return Response.json(
    { products: results || [] },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" } }
  );
}
