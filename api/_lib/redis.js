const KV_URL = process.env.KV_REST_API_URL || process.env.KV_URL || process.env.REDIS_URL || process.env.STORAGE_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_READ_ONLY_TOKEN || process.env.STORAGE_TOKEN;

if (!KV_URL || !KV_TOKEN) {
  console.error('❌ Redis env vars missing!');
}

export default {
  get: async (k) => {
    try {
      const r = await fetch(`${KV_URL}/get/${encodeURIComponent(k)}`, {headers:{Authorization:`Bearer ${KV_TOKEN}`}});
      const d = await r.json();
      return d.result;
    } catch(e) { console.error('Redis get error:', e.message); throw e; }
  },
  set: async (k, v) => {
    try {
      await fetch(`${KV_URL}/set/${encodeURIComponent(k)}`, {method:'POST', headers:{Authorization:`Bearer ${KV_TOKEN}`, 'Content-Type':'application/json'}, body:JSON.stringify(v)});
    } catch(e) { console.error('Redis set error:', e.message); throw e; }
  },
  lpush: async (k, v) => {
    try {
      await fetch(`${KV_URL}/lpush/${encodeURIComponent(k)}`, {method:'POST', headers:{Authorization:`Bearer ${KV_TOKEN}`, 'Content-Type':'application/json'}, body:JSON.stringify(v)});
    } catch(e) { console.error('Redis lpush error:', e.message); throw e; }
  },
  lrange: async (k, s, e) => {
    try {
      const r = await fetch(`${KV_URL}/lrange/${encodeURIComponent(k)}/${s}/${e}`, {headers:{Authorization:`Bearer ${KV_TOKEN}`}});
      const d = await r.json();
      return d.result || [];
    } catch(e) { console.error('Redis lrange error:', e.message); return []; }
  }
};
