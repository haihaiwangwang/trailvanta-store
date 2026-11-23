export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(`
      SELECT
        p.id,
        p.slug,
        p.sku,
        p.name,
        p.subtitle,
        p.category_slug,
        COALESCE(c.name, p.category_slug) AS category,
        p.price_cents,
        p.compare_at_cents,
        p.badge,
        p.rating,
        p.reviews,
        p.stock,
        p.image,
        p.short,
        p.description_json,
        p.features_json,
        p.specs_json
      FROM products p
      LEFT JOIN categories c ON c.slug = p.category_slug
      WHERE p.active = 1 AND p.stock > 0
      ORDER BY p.featured, p.id
    `).all();

    return Response.json(
      {
        products: (results || []).map((p) => ({
          id: p.id,
          slug: p.slug,
          sku: p.sku,
          name: p.name,
          category: p.category,
          category_slug: p.category_slug,
          price: p.price_cents / 100,
          compare_at_price: p.compare_at_cents == null ? null : p.compare_at_cents / 100,
          currency: "USD",
          stock: p.stock,
          description: p.short || p.subtitle || "",
          image: p.image,
          badge: p.badge,
          rating: p.rating,
          reviews: p.reviews,
          features: p.features_json,
          specifications: p.specs_json
        }))
      },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (error) {
    return Response.json({ error: "Products are temporarily unavailable." }, { status: 500 });
  }
}
