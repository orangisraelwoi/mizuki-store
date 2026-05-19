exports.handler = async (event) => {
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

    // ===== HARDCODE TOKEN (bypass env var yang ga kebaca) =====
    const QRISPY_TOKEN = "cki_FTZQEtSyNdjC3TAST7Gy4U73kWEwKLQ8BzjxAHfKqQQwti2L";

    const res = await fetch("https://api.qrispy.id/api/payment/qris/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Token": QRISPY_TOKEN
      },
      body: JSON.stringify({
        amount: parseInt(amount),
        payment_reference: orderId || `Mizuki-${Date.now()}`,
        return_url: "https://mizuki-store.netlify.app/success"
      })
    });

    const rawText = await res.text();

    if (!res.ok) {
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          success: false,
          debug: true,
          httpStatus: res.status,
          rawResponse: rawText.substring(0, 500)
        })
      };
    }

    const data = JSON.parse(rawText);

    if (data.status !== "success" || !data.data) {
      throw new Error(`QRISpy gagal: ${JSON.stringify(data)}`);
    }

    const qris = data.data;

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: true,
        qrisId: qris.qris_id,
        qrImageUrl: qris.qris_image_url,
        qrBase64: qris.qris_image_base64,
        amount: qris.amount,
        expiredAt: qris.expired_at,
        expiresIn: qris.expires_in_seconds,
        reference: qris.payment_reference
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
