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

    if (order.status === 'completed') {
      return res.status(200).json({ status: 'completed', key: order.key, orderId });
    }

    res.status(200).json({ status: order.status, orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
