const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

export default {
  get: async (k) => { const r = await fetch(`${KV_URL}/get/${k}`, {headers:{Authorization:`Bearer ${KV_TOKEN}`}}); const d = await r.json(); return d.result; },
  set: async (k, v) => { await fetch(`${KV_URL}/set/${k}`, {method:'POST', headers:{Authorization:`Bearer ${KV_TOKEN}`, 'Content-Type':'application/json'}, body:JSON.stringify(v)}); },
  lpush: async (k, v) => { await fetch(`${KV_URL}/lpush/${k}`, {method:'POST', headers:{Authorization:`Bearer ${KV_TOKEN}`, 'Content-Type':'application/json'}, body:JSON.stringify(v)}); },
  lrange: async (k, s, e) => { const r = await fetch(`${KV_URL}/lrange/${k}/${s}/${e}`, {headers:{Authorization:`Bearer ${KV_TOKEN}`}}); const d = await r.json(); return d.result || []; }
};
