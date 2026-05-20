import redis from './_lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { order_id, status } = req.body; // QRISpy kirim ini
    
    if (status === 'success' || status === 'paid') {
      const order = await redis.get(`order:${order_id}`);
      if (order && order.status === 'pending') {
        order.status = 'paid';
        await redis.set(`order:${order_id}`, order);
        
        // Auto assign key!
        await fetch(`https://${req.headers.host}/api/assign-key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order_id,
            phone: order.phone,
            productId: order.productId
          })
        });
      }
    }
    
    res.status(200).json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
