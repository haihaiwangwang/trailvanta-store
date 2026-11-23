export async function onRequestGet({ request, env }) {
  if (!env.ADMIN_TOKEN || request.headers.get("Authorization") !== `Bearer ${env.ADMIN_TOKEN}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { results } = await env.DB.prepare(`
      SELECT
        id, order_no, status, email, customer_name, currency,
        subtotal_cents, shipping_cents, shipping_method, tax_cents,
        total_cents, shipping_address_json, note, created_at, updated_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 200
    `).all();
    return Response.json({ orders: results || [] });
  } catch (error) {
    return Response.json({ error: "Orders are temporarily unavailable." }, { status: 500 });
  }
}
