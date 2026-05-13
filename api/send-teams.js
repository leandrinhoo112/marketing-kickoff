
export default async function handler(req, res) {
  // Configurações de CORS para permitir chamadas do seu próprio site
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

  const TEAMS_WEBHOOK_URL = 'https://defaultcf5c7f8b4d1a4965a5470b57e056da.a0.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/153e3f8a2751498d97cc12492a53f4a1/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=TuCpM5J-KocBqn5jqNzhwQ8UAxc2PJqIRBgzFKj8xcU';

  try {
    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const status = response.status;
    res.status(status).json({ success: response.ok });
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
}
