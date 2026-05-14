
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

  const USER_EMAIL = 'leandro.franco@inspirar.com.br';

  try {
    // Usamos o FormSubmit (serviço gratuito) para enviar o e-mail
    const response = await fetch(`https://formsubmit.co/ajax/${USER_EMAIL}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: "ALERTA RADAR",
        message: req.body.text,
        _template: "table" // Deixa o e-mail mais organizado
      })
    });

    const data = await response.json();
    res.status(response.status).json({ success: response.ok, info: data });
  } catch (error) {
    console.error('Email Bridge Error:', error);
    res.status(500).json({ error: error.message });
  }
}
