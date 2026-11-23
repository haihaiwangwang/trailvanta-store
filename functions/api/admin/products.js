import { verifyAdmin } from "./admin/auth.js";
const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
const categories=new Set(["trail-running","hiking","camping","accessories"]);
const clean=(v,n)=>String(v??"").trim().slice(0,n);
function productInput(b){
 const name=clean(b.name,160),slug=clean(b.slug,180).toLowerCase(),sku=clean(b.sku,80);
 const category=clean(b.category_slug,60),price=Math.round(Number(b.price)*100),compare=b.compare_at_price===""||b.compare_at_price==null?null:Math.round(Number(b.compare_at_price)*100),stock=Number(b.stock);
 if(!name||!slug||! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||!sku||!categories.has(category)||!Number.isSafeInteger(price)||price<0||!Number.isInteger(stock)||stock<0||stock>1000000||(compare!==null&&(!Number.isSafeInteger(compare)||compare<0))) throw new Error("Check the product name, slug, SKU, category, price and stock.");
 return {name,slug,sku,category,price,compare,stock,subtitle:clean(b.subtitle,200),badge:clean(b.badge,40),image:clean(b.image,1000),short:clean(b.short,500),active:b.active===false?0:1,featured:b.featured===true?1:0};
}
export async function onRequestGet({request,env}){
 if(!(await verifyAdmin(request,env)))return json({error:"Unauthorized"},401);
 try{const {results}=await env.DB.prepare("SELECT id,slug,sku,name,subtitle,category_slug,price_cents,compare_at_cents,badge,stock,image,short,active,featured FROM products ORDER BY id DESC").all();return json({products:results||[]})}catch{return json({error:"Could not load products."},500)}
}
export async function onRequestPost({request,env}){
 if(!(await verifyAdmin(request,env)))return json({error:"Unauthorized"},401);
 const origin=request.headers.get("Origin");if(origin!==new URL(request.url).origin)return json({error:"Invalid request origin."},403);
 let b;try{b=await request.json()}catch{return json({error:"Invalid request."},400)}
 let p;try{p=productInput(b)}catch(e){return json({error:e.message},400)}
 try{await env.DB.prepare("INSERT INTO products (slug,sku,name,subtitle,category_slug,price_cents,compare_at_cents,badge,stock,image,short,active,featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(p.slug,p.sku,p.name,p.subtitle,p.category,p.price,p.compare,p.badge,p.stock,p.image,p.short,p.active,p.featured).run();return json({ok:true},201)}catch(e){return json({error:"Could not create product. Check that the SKU and slug are unique."},409)}
}
export async function onRequestPatch({request,env}){
 if(!(await verifyAdmin(request,env)))return json({error:"Unauthorized"},401);
 const origin=request.headers.get("Origin");if(origin!==new URL(request.url).origin)return json({error:"Invalid request origin."},403);
 let b;try{b=await request.json()}catch{return json({error:"Invalid request."},400)}
 const id=Number(b.id);if(!Number.isSafeInteger(id)||id<1)return json({error:"Invalid product ID."},400);
 let p;try{p=productInput(b)}catch(e){return json({error:e.message},400)}
 try{const r=await env.DB.prepare("UPDATE products SET slug=?,sku=?,name=?,subtitle=?,category_slug=?,price_cents=?,compare_at_cents=?,badge=?,stock=?,image=?,short=?,active=?,featured=? WHERE id=?").bind(p.slug,p.sku,p.name,p.subtitle,p.category,p.price,p.compare,p.badge,p.stock,p.image,p.short,p.active,p.featured,id).run();if(!r.meta?.changes)return json({error:"Product not found."},404);return json({ok:true})}catch{return json({error:"Could not save product. Check that the SKU and slug are unique."},409)}
}
export async function onRequestDelete({request,env}){
 if(!(await verifyAdmin(request,env)))return json({error:"Unauthorized"},401);
 const origin=request.headers.get("Origin");if(origin!==new URL(request.url).origin)return json({error:"Invalid request origin."},403);
 let b;try{b=await request.json()}catch{return json({error:"Invalid request."},400)}
 const id=Number(b.id);if(!Number.isSafeInteger(id)||id<1)return json({error:"Invalid product ID."},400);
 try{const p=await env.DB.prepare("SELECT id FROM products WHERE id=?").bind(id).first();if(!p)return json({error:"Product not found."},404);await env.DB.prepare("UPDATE products SET active=0 WHERE id=?").bind(id).run();return json({ok:true,message:"Product archived; historical order records are preserved."})}catch{return json({error:"Could not archive product."},500)}
}
