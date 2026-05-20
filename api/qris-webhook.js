import redis from './_lib/redis.js';

const QRISPY_API_URL = 'https://api.qrispy.id';
const QRISPY_TOKEN = process.env.QRISPY_API_TOKEN;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { qris_id, status } = req.body;
    
    // Cari order by qrisId
    // Note: Ini butuh scan, lebih baik pakai webhook dari QRISpy kalau ada
    // Atau simpan mapping qrisId -> orderId di Redis
    
    res.status(200).json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
