import { verifyAdmin } from "./admin/auth.js";
const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function onRequestPost({request,env}){
 if(!(await verifyAdmin(request,env)))return json({error:"Unauthorized"},401);
 if(request.headers.get("Origin")!==new URL(request.url).origin)return json({error:"Invalid request origin."},403);
 if(!env.PRODUCT_IMAGES)return json({error:"Image storage is not configured yet. Connect an R2 bucket binding named PRODUCT_IMAGES."},503);
 const type=request.headers.get("Content-Type")||"";
 if(!/^image\/(jpeg|png|webp|gif)$/.test(type))return json({error:"Only JPG, PNG, WebP or GIF images are accepted."},415);
 const length=Number(request.headers.get("Content-Length")||0);if(length>8*1024*1024)return json({error:"Image must be 8 MB or smaller."},413);
 const bytes=await request.arrayBuffer();if(!bytes.byteLength||bytes.byteLength>8*1024*1024)return json({error:"Image must be between 1 byte and 8 MB."},413);
 const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"}[type];
 const key="products/"+crypto.randomUUID()+"."+ext;
 try{await env.PRODUCT_IMAGES.put(key,bytes,{httpMetadata:{contentType:type,cacheControl:"public, max-age=31536000, immutable"}});const base=String(env.PRODUCT_IMAGES_PUBLIC_URL||"").replace(/\/$/,"");if(!base)return json({error:"R2 upload succeeded but PRODUCT_IMAGES_PUBLIC_URL is not configured. Set the public R2 URL before uploading."},503);return json({ok:true,key,url:base+"/"+key},201)}catch{return json({error:"Image upload failed."},500)}
}
