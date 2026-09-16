// Protege todo o site com senha (Vercel Routing Middleware).
// A senha fica na variável de ambiente CAL_PASSWORD do projeto na Vercel, nunca no código.
import { next } from '@vercel/functions';

export const config = { matcher: '/:path*' };

const COOKIE = 'cal_auth';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

async function tokenFor(secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('calendario-inspirar:v1'));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const pair = (request.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : '';
}

function cookie(value, maxAge) {
  return `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export default async function middleware(request) {
  const password = process.env.CAL_PASSWORD;
  if (!password) return new Response('Senha não configurada no servidor (CAL_PASSWORD).', { status: 500 });

  const expected = await tokenFor(password);
  const { pathname } = new URL(request.url);

  if (pathname === '/login' && request.method === 'POST') {
    const form = await request.formData();
    const typed = String(form.get('senha') || '');
    if (typed && safeEqual(await tokenFor(typed), expected)) {
      return new Response(null, { status: 303, headers: { Location: '/', 'Set-Cookie': cookie(expected, MAX_AGE) } });
    }
    return loginPage(true);
  }

  if (pathname === '/sair') {
    return new Response(null, { status: 303, headers: { Location: '/', 'Set-Cookie': cookie('', 0) } });
  }

  if (safeEqual(readCookie(request, COOKIE), expected)) return next();
  return loginPage(false);
}

function loginPage(wrongPassword) {
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Calendário MKT Inspirar · Acesso</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  body{margin:0; min-height:100vh; display:grid; place-items:center; padding:24px; font-family:'DM Sans',system-ui,-apple-system,'Segoe UI',sans-serif; color:#09090b;
    background:radial-gradient(900px 500px at 15% 0%, #dbeafe 0%, transparent 60%), radial-gradient(800px 500px at 100% 100%, #e4e4e7 0%, transparent 60%), #f4f4f5}
  .card{width:min(420px,100%); background:rgba(255,255,255,.6); -webkit-backdrop-filter:blur(22px) saturate(160%); backdrop-filter:blur(22px) saturate(160%);
    border:1px solid rgba(255,255,255,.8); box-shadow:inset 0 1px 0 #fff, 0 0 0 1px rgba(9,9,11,.06); border-radius:36px; padding:36px}
  .kicker{margin:0 0 12px; font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#155eef}
  h1{margin:0 0 10px; font-size:34px; font-weight:600; letter-spacing:-.045em; line-height:1.05}
  p{margin:0 0 26px; color:#52525b; font-size:16px}
  label{display:block; font-size:14px; font-weight:500; color:#3f3f46; margin-bottom:8px}
  input{width:100%; height:50px; padding:0 16px; font:inherit; font-size:16px; border:1px solid #e4e4e7; border-radius:14px; background:#fafafa; color:#09090b}
  input:focus{outline:none; border-color:#155eef; box-shadow:0 0 0 3px rgba(21,94,239,.12)}
  button{width:100%; height:50px; margin-top:14px; font:inherit; font-size:16px; font-weight:600; color:#fff; background:#09090b; border:1px solid #2c2e34; border-radius:14px; cursor:pointer; transition:background .2s, transform .2s}
  button:hover{background:#27272a; transform:translateY(-2px)}
  button:focus-visible{outline:2px solid #155eef; outline-offset:3px}
  .erro{margin:12px 0 0; padding:10px 14px; border-radius:12px; font-size:14.5px; color:#b91c1c; background:rgba(185,28,28,.07); border:1px solid rgba(185,28,28,.2)}
</style>
</head>
<body>
  <main class="card">
    <p class="kicker">Faculdade Inspirar</p>
    <h1>Calendário de Marketing 26–27</h1>
    <p>Acesso restrito à equipe. Digite a senha para abrir o calendário.</p>
    <form method="post" action="/login">
      <label for="senha">Senha</label>
      <input id="senha" name="senha" type="password" autocomplete="current-password" required autofocus>
      ${wrongPassword ? '<p class="erro" role="alert">Senha incorreta. Confira e tente de novo.</p>' : ''}
      <button type="submit">Entrar</button>
    </form>
  </main>
</body>
</html>`;
  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}
