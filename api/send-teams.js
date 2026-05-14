
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

  const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/ub6qoelm2wvlq26ur83qj4ehbqu04yhg';

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body) // Enviamos o objeto completo (nome, ajuda, etc)
    });

    const responseText = await response.text();
    res.status(response.status).json({ success: response.ok, info: responseText });
  } catch (error) {
    console.error('Make Bridge Error:', error);
    res.status(500).json({ error: error.message });
  }
}
