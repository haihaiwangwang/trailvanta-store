import { verifyAdmin } from "./auth.js";
const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function onRequestGet({request,env}){
 if(!(await verifyAdmin(request,env)))return json({error:"Unauthorized"},401);
 try{const {results}=await env.DB.prepare("SELECT id,name,email,message,created_at FROM messages ORDER BY created_at DESC LIMIT 200").all();return json({messages:results||[]})}catch{return json({error:"Could not load customer messages."},500)}
}
