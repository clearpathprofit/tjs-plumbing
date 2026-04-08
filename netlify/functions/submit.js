exports.handler = async (event) => {
  try {
    const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/iqsFYpOBKJuU9eTKuf62/webhook-trigger/c02ffe73-523f-4046-a15b-4b59b2d2586f';
    
    await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
