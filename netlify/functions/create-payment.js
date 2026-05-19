exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { amount, payment_reference } = JSON.parse(event.body);

    const response = await fetch('https://api.qrispy.id/api/payment/qris/generate', {
      method: 'POST',
      headers: {
        'X-API-Token': process.env.QRISPY_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        payment_reference: payment_reference
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        qris_id: data.data.qris_id,
        qris_image_url: data.data.qris_image_url,
        expired_at: data.data.expired_at,
        expires_in_seconds: data.data.expires_in_seconds
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
