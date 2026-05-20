import redis from './_lib/redis.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { productId, keys, productName } = req.body;
    if (!productId || !keys || !Array.isArray(keys)) return res.status(400).json({ error: 'productId and keys array required' });
    await redis.set(`stock:${productId}`, { productName: productName || productId, remaining: keys.length, keys: keys });
    res.status(200).json({ success: true, productId, remaining: keys.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
