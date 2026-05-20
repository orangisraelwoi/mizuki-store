import redis from './_lib/redis.js';

// ... kode lu yang sekarang ...

// Setelah dapet orderId:
await redis.set(`order:${orderId}`, {
  status: 'pending',
  phone: userPhone,      // nomor WA buyer
  productId: productId,  // drip-1d, dll
  amount: amount,
  createdAt: Date.now()
});
