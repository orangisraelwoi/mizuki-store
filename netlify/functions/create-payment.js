exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  try {
    const { amount, orderId } = JSON.parse(event.body);

    if (!amount || amount < 1000) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: false, error: "Amount minimal 1000 bro" })
      };
    }

    const res = await fetch("https://api.qrispy.id/api/payment/qris/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Token": process.env.QRISPY_API_TOKEN // isi pake token baru lo
      },
      body: JSON.stringify({
        amount: parseInt(amount),
        payment_reference: orderId || `Mizuki-${Date.now()}`,
        return_url: "https://mizuki-store.netlify.app/success" // ganti domain lo
      })
    });

    // ===== FIX UTAMA: Handle response aneh =====
    const rawText = await res.text();
    
    if (!res.ok) {
      console.error("QRISpy HTTP Error:", res.status, rawText.substring(0, 300));
      throw new Error(`QRISpy error ${res.status}: ${rawText.substring(0, 100)}`);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error("Invalid JSON dari QRISpy:", rawText.substring(0, 500));
      throw new Error("QRISpy return bukan JSON. Cek token/URL lo!");
    }

    if (data.status !== "success" || !data.data) {
      throw new Error(`QRISpy gagal: ${JSON.stringify(data)}`);
    }

    const qris = data.data;

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: true,
        qrisId: qris.qris_id,              // penting buat check status
        qrImageUrl: qris.qris_image_url,    // URL gambar QR
        qrBase64: qris.qris_image_base64,   // alternatif base64
        amount: qris.amount,
        expiredAt: qris.expired_at,
        expiresIn: qris.expires_in_seconds,  // 900 detik = 15 menit
        reference: qris.payment_reference
      })
    };

  } catch (err) {
    console.error("Create Payment Error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: false, 
        error: err.message,
        debug: "Cek Netlify Logs > Functions > create-payment"
      })
    };
  }
};
