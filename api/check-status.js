import redis from './_lib/redis.js';

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

    // TODO: Cek QRISpy di sini
    // const qrisStatus = await fetch('https://qris.id/api/v1/status', {...});
    
    // Kalau masih pending, biarin
    if (order.status === 'completed') {
      return res.status(200).json({ 
        status: 'completed', 
        key: order.key,
        orderId 
      });
    }

    // Kalau udah paid tapi belum assign key, auto-assign!
    if (order.status === 'paid' && !order.key) {
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
      orderId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
