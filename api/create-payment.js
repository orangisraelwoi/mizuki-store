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
    const { phone, productId, amount } = req.body;
    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Panggil QRISpy API
    const qrisRes = await fetch(`${QRISPY_API_URL}/api/payment/qris/generate`, {
      method: 'POST',
      headers: {
        'X-API-Token': QRISPY_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        payment_reference: orderId,
        return_url: `https://${req.headers.host}/api/qris-webhook`
      })
    });

    const qrisData = await qrisRes.json();
    
    if (qrisData.status !== 'success') {
      return res.status(500).json({ error: 'QRISpy error', detail: qrisData });
    }

    // Simpan ke Redis
    await redis.set(`order:${orderId}`, {
      status: 'pending',
      phone: phone || 'unknown',
      productId: productId,
      amount: amount,
      qrisId: qrisData.data.qris_id,
      qrisUrl: qrisData.data.qris_image_url,
      expiresAt: qrisData.data.expired_at,
      createdAt: Date.now()
    });

    res.status(200).json({
      success: true,
      orderId: orderId,
      qrisId: qrisData.data.qris_id,
      qrUrl: qrisData.data.qris_image_url,
      qrBase64: qrisData.data.qris_image_base64,
      expiresIn: qrisData.data.expires_in_seconds,
      status: 'pending'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
