import redis from './_lib/redis.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const { productId } = req.query;
    const data = await redis.get(`stock:${productId}`);
    if (!data) return res.status(200).json({ remaining: 0, keys: [] });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
