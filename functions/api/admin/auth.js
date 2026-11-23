const COOKIE = "tv_admin_session";
const encoder = new TextEncoder();

async function signature(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function verifyAdmin(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(COOKIE + "="));
  if (!match) return false;
  const value = decodeURIComponent(match.slice(COOKIE.length + 1));
  const [expires, supplied] = value.split(".");
  if (!/^\d{10,}$/.test(expires || "") || Number(expires) < Math.floor(Date.now() / 1000) || !supplied) return false;
  const expected = await signature(expires, env.ADMIN_TOKEN);
  if (expected.length !== supplied.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
  return mismatch === 0;
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_TOKEN) return Response.json({ error: "Admin login is not configured." }, { status: 503 });
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const password = typeof body.password === "string" ? body.password : "";
  const expectedBytes = encoder.encode(env.ADMIN_TOKEN);
  const suppliedBytes = encoder.encode(password);
  const digest = async (bytes) => new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  const a = await digest(expectedBytes), b = await digest(suppliedBytes);
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  if (mismatch !== 0) return Response.json({ error: "Incorrect password." }, { status: 401 });
  const expires = String(Math.floor(Date.now() / 1000) + 8 * 60 * 60);
  const signed = expires + "." + await signature(expires, env.ADMIN_TOKEN);
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": COOKIE + "=" + encodeURIComponent(signed) + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800"
    }
  });
}
