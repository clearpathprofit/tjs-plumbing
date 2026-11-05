// Contact form -> lead destination.
// Returns 200 only when the destination accepted the lead. Before Nov 2026 this
// returned 200 no matter what, so a lead that never arrived looked delivered.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/iqsFYpOBKJuU9eTKuf62/webhook-trigger/c02ffe73-523f-4046-a15b-4b59b2d2586f';

    const body = JSON.parse(event.body || '{}');

    const payload = {
      ...body,
      firstName  : body.firstName || body.first_name,
      lastName   : body.lastName  || body.last_name,
      first_name : body.firstName || body.first_name,
      last_name  : body.lastName  || body.last_name,
      phone      : body.phone,
      email      : body.email,
      name       : `${body.firstName || body.first_name || ''} ${body.lastName || body.last_name || ''}`.trim(),
    };

    const res = await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error('Lead destination rejected the lead:', res.status);
      return { statusCode: 502, body: JSON.stringify({ error: 'Lead not delivered' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Lead send failed:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Lead not delivered' }) };
  }
};
