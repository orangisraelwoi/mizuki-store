import redis from './_lib/redis.js';

const QRISPY_API_URL = 'https://api.qrispy.id';
const QRISPY_TOKEN = process.env.QRISPY_API_TOKEN;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId } = req.body;
    const order = await redis.get(`order:${orderId}`);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.status === 'completed') {
      return res.status(200).json({ status: 'completed', key: order.key, orderId });
    }

    // Cek QRISpy
    const qrisRes = await fetch(`${QRISPY_API_URL}/api/payment/qris/${order.qrisId}/status`, {
      headers: { 'X-API-Token': QRISPY_TOKEN }
    });
    const qrisData = await qrisRes.json();

    if (qrisData.status === 'success' && qrisData.data?.status === 'paid') {
      order.status = 'paid';
      await redis.set(`order:${orderId}`, order);
      
      await fetch(`https://${req.headers.host}/api/assign-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, phone: order.phone, productId: order.productId })
      });
      
      const updated = await redis.get(`order:${orderId}`);
      return res.status(200).json({ status: updated.status, key: updated.key, orderId });
    }

    res.status(200).json({ 
      status: order.status, 
      qrisStatus: qrisData.data?.status || 'unknown',
      orderId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
