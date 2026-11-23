import { verifyAdmin } from "./auth.js";
const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
const allowed=new Set(["pending_payment","processing","shipped","completed","cancelled","refunded"]);
export async function onRequestGet({request,env}) {
 if(!(await verifyAdmin(request,env)))return json({error:"Unauthorized"},401);
 try{
  const {results:orders}=await env.DB.prepare("SELECT id,order_no,status,email,customer_name,phone,currency,subtotal_cents,shipping_cents,shipping_method,tax_cents,total_cents,shipping_address_json,note,created_at,updated_at FROM orders ORDER BY created_at DESC LIMIT 200").all();
  const {results:items}=await env.DB.prepare("SELECT oi.order_id,oi.product_slug,oi.name,oi.size,oi.color,oi.unit_price_cents,oi.qty,oi.image FROM order_items oi INNER JOIN orders o ON o.id=oi.order_id ORDER BY oi.order_id DESC").all();
  const grouped=new Map();for(const item of items||[]){if(!grouped.has(item.order_id))grouped.set(item.order_id,[]);grouped.get(item.order_id).push(item)}
  return json({orders:(orders||[]).map(o=>({...o,items:grouped.get(o.id)||[]}))});
 }catch{return json({error:"Orders are temporarily unavailable."},500)}
}
export async function onRequestPatch({request,env}) {
 if(!(await verifyAdmin(request,env)))return json({error:"Unauthorized"},401);
 const origin=request.headers.get("Origin");if(origin&&origin!==new URL(request.url).origin)return json({error:"Invalid request origin."},403);
 let b;try{b=await request.json()}catch{return json({error:"Invalid request."},400)}
 const id=Number(b.id),status=String(b.status||"");if(!Number.isSafeInteger(id)||id<1||!allowed.has(status))return json({error:"Invalid order or status."},400);
 try{const r=await env.DB.prepare("UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,id).run();if(!r.meta?.changes)return json({error:"Order not found."},404);return json({ok:true})}catch{return json({error:"Could not update order status."},500)}
}
export async function onRequestDelete({request,env}) {
 if(!(await verifyAdmin(request,env)))return json({error:"Unauthorized"},401);
 const origin=request.headers.get("Origin");if(origin&&origin!==new URL(request.url).origin)return json({error:"Invalid request origin."},403);
 let b;try{b=await request.json()}catch{return json({error:"Invalid request."},400)}
 const id=Number(b.id);if(!Number.isSafeInteger(id)||id<1)return json({error:"Invalid order ID."},400);
 try{const exists=await env.DB.prepare("SELECT id FROM orders WHERE id=?").bind(id).first();if(!exists)return json({error:"Order not found."},404);await env.DB.batch([env.DB.prepare("DELETE FROM order_items WHERE order_id=?").bind(id),env.DB.prepare("DELETE FROM orders WHERE id=?").bind(id)]);return json({ok:true})}catch{return json({error:"Could not delete this order."},500)}
}
