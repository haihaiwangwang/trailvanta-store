import { verifyAdmin } from "./auth.js";
const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function onRequestGet({request,env}) {
  if(!(await verifyAdmin(request,env))) return json({error:"Unauthorized"},401);
  try {
    const {results}=await env.DB.prepare(`
      SELECT
        MAX(customer_name) AS customer_name,
        LOWER(TRIM(email)) AS email,
        MAX(phone) AS phone,
        COUNT(*) AS order_count,
        SUM(total_cents) AS lifetime_value_cents,
        MAX(currency) AS currency,
        MAX(created_at) AS last_order_at
      FROM orders
      WHERE email IS NOT NULL AND TRIM(email) <> ''
      GROUP BY LOWER(TRIM(email))
      ORDER BY MAX(created_at) DESC
      LIMIT 500
    `).all();
    return json({customers:results||[]});
  } catch {
    return json({error:"Could not load customer directory."},500);
  }
}
