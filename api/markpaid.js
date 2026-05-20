const redis = require('./_lib/redis.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId } = req.body;
    const order = await redis.get(`order:${orderId}`);
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Order already processed' });
    
    // Mark as paid
    order.status = 'paid';
    await redis.set(`order:${orderId}`, order);
    
    // Auto assign key
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
    
    res.status(200).json({ 
      success: true, 
      status: updated.status, 
      key: updated.key,
      orderId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
