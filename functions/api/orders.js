const json = (data, status = 200) => Response.json(data, { status });

const clean = (value, max) => String(value || "").trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const customerName = clean(body.customer_name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const address = clean(body.address, 250);
  const city = clean(body.city, 120);
  const country = clean(body.country, 100);
  const postalCode = clean(body.postal_code, 30);

  if (!customerName || !email || !address || !city || !country || !postalCode) {
    return json({ error: "Complete all delivery details." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Enter a valid email address." }, 400);
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 25) {
    return json({ error: "Your cart is empty or contains too many items." }, 400);
  }

  const quantities = new Map();
  for (const item of body.items) {
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(productId) || productId < 1 ||
        !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return json({ error: "Invalid cart item." }, 400);
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 20)) {
    return json({ error: "Maximum quantity per product is 20." }, 400);
  }

  const ids = [...quantities.keys()];
  const placeholders = ids.map(() => "?").join(",");
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, slug, name, price_cents, stock, active, image
       FROM products WHERE id IN (${placeholders})`
    ).bind(...ids).all();

    const byId = new Map((results || []).map((product) => [product.id, product]));
    const orderItems = [];
    let subtotalCents = 0;

    for (const [id, quantity] of quantities) {
      const product = byId.get(id);
      if (!product || product.active !== 1 || product.stock < quantity) {
        return json({ error: "A product is unavailable or its stock has changed. Please refresh your cart." }, 409);
      }
      subtotalCents += product.price_cents * quantity;
      orderItems.push({ product, quantity });
    }

    const orderNo = "TV-" + Date.now().toString(36).toUpperCase() +
      "-" + crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    const accessKey = crypto.randomUUID() + crypto.randomUUID();
    const shippingAddress = JSON.stringify({
      address,
      city,
      country,
      postal_code: postalCode
    });

    const statements = [
      env.DB.prepare(`
        INSERT INTO orders (
          order_no, status, email, customer_name, currency,
          subtotal_cents, shipping_cents, shipping_method, tax_cents,
          total_cents, shipping_address_json, access_key
        ) VALUES (?, 'pending_payment', ?, ?, 'USD', ?, 0, 'standard', 0, ?, ?, ?)
      `).bind(orderNo, email, customerName, subtotalCents, subtotalCents, shippingAddress, accessKey)
    ];

    for (const { product, quantity } of orderItems) {
      statements.push(env.DB.prepare(`
        INSERT INTO order_items (
          order_id, product_slug, name, size, color,
          unit_price_cents, qty, image
        )
        SELECT id, ?, ?, NULL, NULL, ?, ?, ?
        FROM orders WHERE order_no = ?
      `).bind(
        product.slug,
        product.name,
        product.price_cents,
        quantity,
        product.image || null,
        orderNo
      ));
    }

    await env.DB.batch(statements);
    return json({
      ok: true,
      order_number: orderNo,
      status: "pending_payment",
      message: "Your unpaid order request has been received."
    }, 201);
  } catch (error) {
    return json({ error: "We could not save your order. Please try again." }, 500);
  }
}
