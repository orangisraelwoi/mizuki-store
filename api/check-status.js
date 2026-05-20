import redis from './_lib/redis.js';

const QRISPY_API_URL = 'https://qris.id/api/v1'; // GANTI KALAU ENDPOINT BEDA
const QRISPY_TOKEN = process.env.QRISPY_API_TOKEN;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId } = req.body;
    
    // Ambil order dari Redis
    const order = await redis.get(`order:${orderId}`);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Kalau udah completed, return langsung
    if (order.status === 'completed') {
      return res.status(200).json({
        status: 'completed',
        key: order.key,
        orderId
      });
    }

    // Cek status ke QRISpy (polling)
    const qrisRes = await fetch(`${QRISPY_API_URL}/status/${order.qrisId}`, {
      headers: { 'Authorization': `Bearer ${QRISPY_TOKEN}` }
    });
    const qrisData = await qrisRes.json();

    // Kalau QRISpy bilang sukses/paid
    if (qrisData.status === 'success' || qrisData.status === 'paid') {
      order.status = 'paid';
      await redis.set(`order:${orderId}`, order);
      
      // Auto assign key!
      await fetch(`https://${req.headers.host}/api/assign-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          phone: order.phone,
          productId: order.productId
        })
      });
      
      const updated = await redis.get(`order:${orderId}`);
      return res.status(200).json({
        status: updated.status,
        key: updated.key,
        orderId
      });
    }

    res.status(200).json({
      status: order.status,
      qrisStatus: qrisData.status,
      orderId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
