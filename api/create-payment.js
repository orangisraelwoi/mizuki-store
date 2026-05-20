import redis from './_lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, productId, amount } = req.body;
    
    // Generate Order ID
    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Simpan ke Redis
    await redis.set(`order:${orderId}`, {
      status: 'pending',
      phone: phone || 'unknown',
      productId: productId,
      amount: amount,
      createdAt: Date.now()
    });

    // TODO: Integrasi QRISpy di sini
    // const qrisResponse = await fetch('https://qris.id/api/v1/create', {...});
    
    res.status(200).json({ 
      success: true, 
      orderId: orderId,
      status: 'pending'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
