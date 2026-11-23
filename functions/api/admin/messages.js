import { verifyAdmin } from "./auth.js";

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

// Resolve known column names without changing the existing D1 schema.
const pick = (columns, candidates) => candidates.find((name) => columns.has(name)) || null;

export async function onRequestGet({ request, env }) {
  if (!(await verifyAdmin(request, env))) return json({ error: "Unauthorized" }, 401);

  try {
    const info = await env.DB.prepare("PRAGMA table_info(messages)").all();
    const columns = new Set((info.results || []).map((column) => column.name));
    if (!columns.size) {
      return json({ error: "The messages table was not found in the connected database." }, 500);
    }

    const id = pick(columns, ["id"]);
    const name = pick(columns, ["name", "customer_name", "full_name"]);
    const email = pick(columns, ["email", "customer_email"]);
    const message = pick(columns, ["message", "body", "content"]);
    const created = pick(columns, ["created_at", "submitted_at", "created"]);
    if (!name || !email || !message) {
      return json({
        error: "The messages table exists, but its columns do not match the supported message fields.",
        available_columns: [...columns]
      }, 500);
    }

    const fields = [
      id ? "\"" + id + "\" AS id" : "rowid AS id",
      "\"" + name + "\" AS name",
      "\"" + email + "\" AS email",
      "\"" + message + "\" AS message",
      created ? "\"" + created + "\" AS created_at" : "'' AS created_at"
    ];
    const order = created ? "\"" + created + "\" DESC" : (id ? "\"" + id + "\" DESC" : "rowid DESC");
    const { results } = await env.DB.prepare(
      "SELECT " + fields.join(", ") + " FROM messages ORDER BY " + order + " LIMIT 200"
    ).all();
    return json({ messages: results || [] });
  } catch (error) {
    // Keep diagnostics restricted to the authenticated administrator.
    return json({ error: "Could not load customer messages: " + String(error?.message || error) }, 500);
  }
}
