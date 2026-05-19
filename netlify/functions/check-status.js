exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      },
      body: ""
    };
  }

  try {
    const { qrisId } = event.queryStringParameters;

    if (!qrisId) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: false, error: "qrisId required bre" })
      };
    }

    const res = await fetch(`https://api.qrispy.id/api/payment/qris/${qrisId}/status`, {
      headers: {
        "X-API-Token": process.env.QRISPY_API_TOKEN
      }
    });

    const rawText = await res.text();
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${rawText.substring(0, 100)}`);
    }

    const data = JSON.parse(rawText);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: true,
        status: data.data?.status || data.status, // pending / paid / expired
        data: data.data
      })
    };

  } catch (err) {
    console.error("Check Status Error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
