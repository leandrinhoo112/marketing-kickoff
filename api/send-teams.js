export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // LINK DEFINITIVO E GRATUITO (INCOMING WEBHOOK CLÁSSICO)
  const TEAMS_WEBHOOK_URL = 'https://portalinspirar.webhook.office.com/webhookb2/788e882d-da9e-4053-a368-ca866d5663fc@cf5c7f8b-4d1a-4965-a547-0b57e056daa0/IncomingWebhook/6b18e551a1144638a1d80751bef845b1/64db5465-070d-4015-9594-6c998e463ccd/V2bzx3RhsS4RifD23wFgyCoZaisbYvFJWnnQXjdGPK7o01';

  try {
    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const responseText = await response.text();
    res.status(200).json({ success: true, info: responseText });
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
}
