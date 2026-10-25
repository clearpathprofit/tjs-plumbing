// TJ's Plumbing — website lead intake.
//
// The GHL webhook URL is a WRITE KEY to Tom's CRM: anyone holding it can push
// contacts straight in. It lives in the Netlify environment variable
// GHL_WEBHOOK_URL, never in this repository.
//
// Set it with:  netlify env:set GHL_WEBHOOK_URL "<url>"  (or in the Netlify UI
// under Project configuration -> Environment variables).

exports.handler = async (event) => {
  const CORS = { 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: { ...CORS, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const GHL_WEBHOOK = process.env.GHL_WEBHOOK_URL;
  if (!GHL_WEBHOOK) {
    console.error('[submit] GHL_WEBHOOK_URL is not set — lead dropped.');
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Lead intake is not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const first = body.firstName || body.first_name || '';
  const last = body.lastName || body.last_name || '';

  if (!body.phone) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Phone number is required' }) };
  }

  const payload = {
    ...body,
    firstName: first,
    lastName: last,
    first_name: first,
    last_name: last,
    phone: body.phone,
    email: body.email,
    name: `${first} ${last}`.trim(),
    // Passed through so the GHL workflow can branch on it: only contacts who
    // ticked the optional box may be sent SMS.
    sms_consent: body.sms_consent === true
  };

  try {
    const res = await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // The previous version returned 200 without checking this, so a lead that
    // GHL rejected still told the customer "Message received!".
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[submit] GHL rejected the lead:', res.status, detail.slice(0, 500));
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Lead could not be delivered' }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('[submit] Request to GHL failed:', err.message);
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Lead could not be delivered' }) };
  }
};
