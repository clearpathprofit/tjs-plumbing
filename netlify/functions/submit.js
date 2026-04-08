exports.handler = async (event) => {
  try {
    const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/iqsFYpOBKJuU9eTKuf62/webhook-trigger/c02ffe73-523f-4046-a15b-4b59b2d2586f';

    const body = JSON.parse(event.body);

    const payload = {
      ...body,
      firstName  : body.firstName || body.first_name,
      lastName   : body.lastName  || body.last_name,
      first_name : body.firstName || body.first_name,
      last_name  : body.lastName  || body.last_name,
      phone      : body.phone,
      email      : body.email,
      name       : `${body.firstName || body.first_name} ${body.lastName || body.last_name}`.trim(),
    };

    await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
