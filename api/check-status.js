import redis from './_lib/redis.js';

// ... kode cek QRISpy lu ...

// Kalau QRISpy bilang sukses:
if (qrisStatus === 'success') {
  const order = await redis.get(`order:${orderId}`);
  
  if (order && order.status === 'pending') {
    // Update jadi paid
    order.status = 'paid';
    await redis.set(`order:${orderId}`, order);
    
    // AUTO ASSIGN KEY!
    await fetch(`https://${req.headers.host}/api/assign-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        phone: order.phone,
        productId: order.productId
      })
    });
  }
}
