import redis from './_lib/redis.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { orderId, phone, productId } = req.body;
    const order = await redis.get(`order:${orderId}`);
    if (!order || order.status !== 'paid') return res.status(400).json({ error: 'Payment not confirmed' });
    const stock = await redis.get(`stock:${productId}`);
    if (!stock || stock.remaining < 1) return res.status(400).json({ error: 'Stock habis' });
    const assignedKey = stock.keys.pop();
    stock.remaining--;
    await redis.set(`stock:${productId}`, stock);
    const keyData = { key: assignedKey, product: productId, assignedAt: Date.now(), orderId };
    await redis.lpush(`user:${phone}:keys`, keyData);
    order.status = 'completed';
    order.key = assignedKey;
    await redis.set(`order:${orderId}`, order);
    res.status(200).json({ success: true, key: assignedKey });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
