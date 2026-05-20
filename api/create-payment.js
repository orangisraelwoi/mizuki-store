const redis = require('./_lib/redis.js');

const QRISPY_API_URL = 'https://api.qrispy.id';
const QRISPY_TOKEN = process.env.QRISPY_API_TOKEN;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, productId, amount } = req.body;
    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Simpan ke Redis dulu (tanpa QRISpy)
    await redis.set(`order:${orderId}`, {
      status: 'pending',
      phone: phone || 'unknown',
      productId: productId,
      amount: amount,
      createdAt: Date.now()
    });

    // Coba panggil QRISpy
    let qrisData = null;
    try {
      const qrisRes = await fetch(`${QRISPY_API_URL}/api/payment/qris/generate`, {
        method: 'POST',
        headers: {
          'X-API-Token': QRISPY_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          payment_reference: orderId
        })
      });
      const text = await qrisRes.text();
      try { qrisData = JSON.parse(text); } catch(e) {}
    } catch(err) {}

    // Update Redis kalau QRISpy sukses
    if (qrisData && qrisData.status === 'success') {
      await redis.set(`order:${orderId}`, {
        status: 'pending',
        phone: phone || 'unknown',
        productId: productId,
        amount: amount,
        qrisId: qrisData.data.qris_id,
        qrisUrl: qrisData.data.qris_image_url,
        createdAt: Date.now()
      });

      return res.status(200).json({
        success: true,
        orderId: orderId,
        qrisId: qrisData.data.qris_id,
        qrUrl: qrisData.data.qris_image_url,
        qrBase64: qrisData.data.qris_image_base64,
        expiresIn: qrisData.data.expires_in_seconds,
        status: 'pending'
      });
    }

    // Fallback tanpa QRISpy
    res.status(200).json({
      success: true,
      orderId: orderId,
      status: 'pending',
      message: 'Order created. QRISpy integration pending.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
