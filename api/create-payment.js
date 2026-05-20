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
    const { phone, productId, amount } = req.body;
    
    // Generate internal Order ID
    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Panggil QRISpy API
    const qrisRes = await fetch(`${QRISPY_API_URL}/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QRISPY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        order_id: orderId, // QRISpy pake order_id kita
        callback_url: `https://${req.headers.host}/api/qris-webhook`,
        // Tambahin field lain kalau QRISpy butuh
      })
    });

    const qrisData = await qrisRes.json();
    
    // Simpan ke Redis
    await redis.set(`order:${orderId}`, {
      status: 'pending',
      phone: phone || 'unknown',
      productId: productId,
      amount: amount,
      qrisId: qrisData.id || qrisData.qris_id, // sesuaikan response QRISpy
      qrisUrl: qrisData.qr_url || qrisData.qr_string,
      createdAt: Date.now()
    });

    res.status(200).json({
      success: true,
      orderId: orderId,
      qrisId: qrisData.id,
      qrUrl: qrisData.qr_url, // URL QR code buat ditampilkan
      status: 'pending'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
