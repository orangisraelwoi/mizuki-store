import redis from './_lib/redis.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone required' });
    const keys = await redis.lrange(`user:${phone}:keys`, 0, -1);
    const parsedKeys = keys.map(k => typeof k === 'string' ? JSON.parse(k) : k);
    res.status(200).json(parsedKeys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
