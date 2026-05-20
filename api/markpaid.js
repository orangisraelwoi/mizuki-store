const redis = require('./_lib/redis.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId } = req.body;
    let order = await redis.get(`order:${orderId}`);
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Force paid
    order.status = 'paid';
    await redis.set(`order:${orderId}`, order);
    
    // Assign key
    const assignRes = await fetch(`https://${req.headers.host}/api/assign-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, phone: order.phone, productId: order.productId })
    });
    const assignData = await assignRes.json();
    
    res.status(200).json({ 
      success: true, 
      status: 'completed',
      key: assignData.key,
      orderId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
