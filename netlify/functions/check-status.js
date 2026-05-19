exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const qrisId = event.queryStringParameters.qris_id;

    const response = await fetch(`https://api.qrispy.id/api/payment/qris/${qrisId}/status`, {
      headers: {
        'X-API-Token': process.env.QRISPY_API_TOKEN
      }
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paid: data.data?.status === 'paid',
        status: data.data?.status
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
