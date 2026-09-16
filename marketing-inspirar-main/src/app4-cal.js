/* =========================================================================
   CALENDÁRIO DE MARKETING — mês, linha do tempo, pontos a validar
   ========================================================================= */
var LAYERS = {
  campanhas: { label: 'Campanhas', c: 'var(--t-campanha)' },
  entregas:  { label: 'Entregas por pessoa', c: 'var(--l-entregas)' },
  producao:  { label: 'Produção de conteúdo (Vitor)', c: 'var(--l-producao)' },
  saude:     { label: 'Datas da saúde', c: 'var(--l-saude)' },
  cidades:   { label: 'Aniversário de cidades', c: 'var(--l-cidades)' },
  feriados:  { label: 'Feriados', c: 'var(--l-feriados)' }
};

/* ---- eventos por dia ---- */
var CAL = {};
function addCal(isoStr, ev){ (CAL[isoStr] = CAL[isoStr] || []).push(ev); }
function parseRangeIso(range){
  var names = {}; MONTH_NAMES_LC.forEach(function(n, i){ names[n] = i + 1; });
  function mOf(s){ for(var n in names){ if(s.toLowerCase().indexOf(n) !== -1) return names[n]; } return null; }
  function dOf(s){ var mm = s.match(/\d{1,2}/); return mm ? parseInt(mm[0], 10) : null; }
  var parts = range.split('–').map(function(s){ return s.trim(); }), out = [];
  if(parts.length === 1){ var m1 = mOf(parts[0]), d1 = dOf(parts[0]); if(m1 && d1) out.push('2026-' + pad2(m1) + '-' + pad2(d1)); return out; }
  var mB = mOf(parts[1]), dB = dOf(parts[1]), mA = mOf(parts[0]) || mB, dA = dOf(parts[0]);
  if(!(mA && dA && mB && dB)) return out;
  var cur = new Date(2026, mA - 1, dA), end = new Date(2026, mB - 1, dB);
  while(cur <= end){ out.push(toIso(cur)); cur.setDate(cur.getDate() + 1); }
  return out;
}
(function buildCal(){
  CAMPANHAS.forEach(function(c){
    if(c.mes) return;
    var cor = TIPOS_CAMPANHA[c.tipo].cor;
    if(c.preparo) addCal(c.preparo, { layer: 'campanhas', c: cor, t: 'Preparação: ' + c.nome, camp: c.id });
    addCal(c.inicio, { layer: 'campanhas', c: cor, t: 'Início: ' + c.nome, camp: c.id });
    if(c.pico && c.pico !== c.inicio) addCal(c.pico, { layer: 'campanhas', c: cor, t: 'Pico: ' + c.nome, camp: c.id });
    if(c.fim !== c.inicio) addCal(c.fim, { layer: 'campanhas', c: cor, t: 'Fim: ' + c.nome, camp: c.id });
  });
  PESSOAS.forEach(function(p){
    var cor = LAYERS.entregas.c;
    if(p.janela){
      if(p.janela.inicio === p.janela.fim) addCal(p.janela.inicio, { layer: 'entregas', c: cor, t: p.nome + ': dia das entregas', pessoa: p.id });
      else {
        addCal(p.janela.inicio, { layer: 'entregas', c: cor, t: p.nome + ': início da janela de entregas', pessoa: p.id });
        addCal(p.janela.fim, { layer: 'entregas', c: cor, t: p.nome + ': fim da janela de entregas', pessoa: p.id });
      }
    }
    p.entregas.forEach(function(e){ if(e.data) addCal(e.data, { layer: 'entregas', c: cor, t: p.nome + ': ' + e.t, pessoa: p.id }); });
  });
  Object.keys(DAY_DETAILS_2026).forEach(function(k){
    var det = DAY_DETAILS_2026[k];
    parseRangeIso(det.range).forEach(function(dt){ addCal(dt, { layer: 'producao', c: LAYERS.producao.c, t: det.title, sub: det.cycle + ' · ' + det.who, body: det.body }); });
  });
  MONTHS.forEach(function(mo){
    var dim = new Date(mo.y, mo.m, 0).getDate(), base = mo.y + '-' + pad2(mo.m) + '-';
    CITY_ANNIV.forEach(function(x){ if(x.m === mo.m && x.d <= dim) addCal(base + pad2(x.d), { layer: 'cidades', c: LAYERS.cidades.c, t: 'Aniversário de ' + x.city.split(' — ')[0] }); });
    HEALTH_DATES.concat(HEALTH_EXTRA).forEach(function(h){
      if(h.m !== mo.m) return;
      var fer = /feriado/i.test(h.name);
      addCal(base + pad2(h.d), { layer: fer ? 'feriados' : 'saude', c: fer ? LAYERS.feriados.c : LAYERS.saude.c, t: h.name.replace(/\s*\((feriado[^)]*)\)/i, '') });
    });
    if(mo.y === 2026) HEALTH_EXTRA_REGIONAL.forEach(function(h){ if(h.m === mo.m) addCal(base + pad2(h.d), { layer: 'feriados', c: LAYERS.feriados.c, t: h.name }); });
  });
})();
function dayEvents(isoStr){
  return (CAL[isoStr] || []).filter(function(ev){
    if(!S.layers[ev.layer]) return false;
    if(ev.layer === 'entregas' && S.calPessoa !== 'todos' && ev.pessoa !== S.calPessoa) return false;
    return true;
  });
}

/* ---- próximos marcos (Painel Geral) ---- */
function marcosFuturos(n){
  var keys = Object.keys(CAL).filter(function(k){ return k >= TODAY_ISO; }).sort(), out = [];
  for(var i = 0; i < keys.length && out.length < n; i++){
    CAL[keys[i]].forEach(function(ev){ if((ev.layer === 'campanhas' || ev.layer === 'entregas') && out.length < n) out.push({ iso: keys[i], ev: ev }); });
  }
  if(!out.length) return '<div class="empty">Nenhum marco futuro no período do calendário.</div>';
  return out.map(function(x){
    return '<button class="kcard" data-day="' + x.iso + '"><span class="kcard-meta"><span class="mono" style="font-size:12px;color:var(--ink-3)">' + fmt(x.iso) + '</span>' +
      '<span class="tag"><i style="--c:' + x.ev.c + '"></i>' + LAYERS[x.ev.layer].label + '</span></span><span class="kcard-t">' + esc(x.ev.t) + '</span></button>';
  }).join('');
}

/* ---- visão mensal ---- */
function pessoaSelect(){
  return '<select class="select" data-calpessoa aria-label="Pessoa"><option value="todos">Entregas: todas as pessoas</option>' +
    PESSOAS.filter(function(p){ return !p.lideranca; }).map(function(p){ return '<option value="' + p.id + '"' + (S.calPessoa === p.id ? ' selected' : '') + '>' + esc(p.nome) + '</option>'; }).join('') + '</select>';
}
VIEWS['cal/mes'] = function(){
  var mo = MONTHS[S.calIdx], ini = mo.y + '-' + pad2(mo.m) + '-01', dim = new Date(mo.y, mo.m, 0).getDate(), fim = mo.y + '-' + pad2(mo.m) + '-' + pad2(dim);
  var h = '<div class="cal-head"><button class="nav-btn" data-calnav="-1" aria-label="Mês anterior"' + (S.calIdx === 0 ? ' disabled' : '') + '>‹</button>' +
    '<h1 class="cal-title">' + MONTH_NAMES[mo.m - 1] + ' ' + mo.y + '</h1>' +
    '<button class="nav-btn" data-calnav="1" aria-label="Próximo mês"' + (S.calIdx === 15 ? ' disabled' : '') + '>›</button>' +
    '<select class="select" data-calmonth aria-label="Escolher mês">' + MONTHS.map(function(m, i){ return '<option value="' + i + '"' + (i === S.calIdx ? ' selected' : '') + '>' + MONTH_NAMES[m.m - 1] + ' ' + m.y + '</option>'; }).join('') + '</select>' +
    pessoaSelect() + '</div>';
  h += '<div class="layers">' + Object.keys(LAYERS).map(function(k){
    return '<button class="layer" data-layer="' + k + '" aria-pressed="' + !!S.layers[k] + '" style="--c:' + LAYERS[k].c + '"><i></i>' + LAYERS[k].label + '</button>';
  }).join('') + '</div>';

  var camps = CAMPANHAS.filter(function(c){ return overlap(c.inicio, c.fim, ini, fim); });
  var tema = MONTH_THEMES[mo.m];
  h += '<div class="month-band">' + (tema ? '<span class="camp-chip" style="--c:var(--ink-4)">Temática: ' + esc(tema.title) + '</span>' : '') +
    camps.map(function(c){
      var tp = TIPOS_CAMPANHA[c.tipo];
      return '<button class="camp-chip" style="--c:' + tp.cor + '" data-camp="' + c.id + '">' + (c.validar ? '⚠ ' : '') + esc(c.nome) + ' <small>' + tp.label + '</small></button>';
    }).join('') + '</div>';

  var first = (new Date(mo.y, mo.m - 1, 1).getDay() + 6) % 7, cells = '';
  for(var i = 0; i < first; i++) cells += '<div class="day out"></div>';
  for(var dd = 1; dd <= dim; dd++){
    var key = mo.y + '-' + pad2(mo.m) + '-' + pad2(dd), evs = dayEvents(key), dow = (first + dd - 1) % 7;
    var cls = 'day' + (evs.length ? ' has' : '') + (dow >= 5 ? ' weekend' : '') + (key === TODAY_ISO ? ' today' : '');
    var inner = '<span class="day-n"><span>' + dd + '</span>' + (key === TODAY_ISO ? '<span>hoje</span>' : '') + '</span><span class="day-evs">' +
      evs.slice(0, 3).map(function(ev){ return '<span class="day-ev" style="--c:' + ev.c + '"><span>' + esc(ev.t) + '</span></span>'; }).join('') +
      (evs.length > 3 ? '<span class="day-more">+' + (evs.length - 3) + ' mais</span>' : '') + '</span>';
    cells += evs.length ? '<button class="' + cls + '" data-day="' + key + '" aria-label="' + dd + ' de ' + MONTH_NAMES_LC[mo.m - 1] + ', ' + evs.length + ' itens">' + inner + '</button>' : '<div class="' + cls + '">' + inner + '</div>';
  }
  var trailing = (7 - ((first + dim) % 7)) % 7;
  for(var j = 0; j < trailing; j++) cells += '<div class="day out"></div>';
  h += '<div class="grid7">' + DOW.map(function(x){ return '<div class="dow">' + x + '</div>'; }).join('') + '</div><div class="grid7">' + cells + '</div>';

  var semestre = overlap('2026-09-01', '2027-02-28', ini, fim);
  var ativos = PESSOAS.filter(function(p){ return !p.lideranca && (p.janela ? overlap(p.janela.inicio, p.janela.fim, ini, fim) : semestre); });
  h += '<div class="box" style="margin-top:12px"><p class="label">Quem tem entregas neste mês</p>' + (ativos.length ?
    '<div class="deliv-tags">' + ativos.map(function(p){ return '<button class="tag link" data-pessoa="' + p.id + '">' + esc(p.nome) + ' · ' + (p.janela ? esc(p.janelaTexto) : 'contínuo') + '</button>'; }).join('') + '</div>'
    : '<p class="text-soft">Nenhuma janela de entrega dos briefings neste mês (os briefings cobrem set/2026–fev/2027).</p>') + '</div>';
  return h;
};

function openDay(isoStr){
  var evs = dayEvents(isoStr); if(!evs.length) evs = CAL[isoStr] || [];
  var x = toDate(isoStr);
  openSheet(DOW_FULL[x.getDay()] + ' · ' + evs.length + (evs.length === 1 ? ' item' : ' itens'), fmt(isoStr), evs.map(function(ev){
    return '<div class="sheet-item" style="--c:' + ev.c + '"><b>' + esc(ev.t) + '</b><p>' + LAYERS[ev.layer].label + (ev.sub ? ' · ' + esc(ev.sub) : '') + '</p>' +
      (ev.body ? '<p>' + esc(ev.body) + '</p>' : '') +
      (ev.camp ? '<p><button class="tag link" data-camp="' + ev.camp + '">Ver campanha</button></p>' : '') +
      (ev.pessoa ? '<p><button class="tag link" data-pessoa="' + ev.pessoa + '">Ver entregas de ' + esc(pessoaById(ev.pessoa).nome) + '</button></p>' : '') + '</div>';
  }).join(''));
}
onClick('data-day', function(el){ openDay(el.getAttribute('data-day')); });
onClick('data-calnav', function(el){ S.calIdx = Math.max(0, Math.min(15, S.calIdx + parseInt(el.getAttribute('data-calnav'), 10))); render(); });
onClick('data-month', function(el){ closeSheet(); S.calIdx = parseInt(el.getAttribute('data-month'), 10); go('cal', 'mes'); });
onClick('data-layer', function(el){ var k = el.getAttribute('data-layer'); S.layers[k] = !S.layers[k]; render(); });
onChange('data-calmonth', function(el){ S.calIdx = parseInt(el.value, 10); render(); });
onChange('data-calpessoa', function(el){ S.calPessoa = el.value; render(); });

/* ---- linha do tempo ---- */
function xStart(isoStr){ var x = toDate(isoStr); var dim = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate(); return (x.getFullYear() - 2026) * 12 + x.getMonth() - 8 + (x.getDate() - 1) / dim; }
function xEnd(isoStr){ var x = toDate(isoStr); var dim = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate(); return (x.getFullYear() - 2026) * 12 + x.getMonth() - 8 + x.getDate() / dim; }
function gBar(a, b, cor, label, attrs, cls){
  var l = Math.max(0, xStart(a)), w = Math.max(0.09, Math.min(16, xEnd(b)) - l);
  return '<button class="g-bar ' + (cls || '') + '" style="--c:' + cor + '; left:calc(var(--mw) * ' + l.toFixed(3) + '); width:calc(var(--mw) * ' + w.toFixed(3) + ')" ' + attrs + ' title="' + esc(label) + '">' + esc(label) + '</button>';
}
VIEWS['cal/linha'] = function(){
  var head = '<div class="g-row"><div class="g-label"><small>set/2026 → dez/2027</small></div><div class="g-months">' + MONTHS.map(function(m){ return '<div><b>' + MON3[m.m - 1] + '</b>' + m.y + '</div>'; }).join('') + '</div></div>';
  var rows = '<div class="g-row g-group"><div class="g-label">Campanhas e datas</div><div class="g-track"></div></div>';
  CAMPANHAS.slice().sort(function(a, b){ return a.inicio < b.inicio ? -1 : 1; }).forEach(function(c){
    var tp = TIPOS_CAMPANHA[c.tipo];
    rows += '<div class="g-row"><div class="g-label">' + (c.validar ? '⚠ ' : '') + esc(c.nome) + '<small>' + tp.label + ' · ' + c.fontes.join(' · ') + '</small></div><div class="g-track">' +
      (c.preparo ? gBar(c.preparo, c.preparo, tp.cor, 'Preparação ' + fmt(c.preparo), 'data-camp="' + c.id + '"', 'point') : '') +
      gBar(c.inicio, c.fim, tp.cor, c.nome, 'data-camp="' + c.id + '"', c.pendente ? 'cont' : '') + '</div></div>';
  });
  rows += '<div class="g-row g-group"><div class="g-label">Entregas por pessoa</div><div class="g-track"></div></div>';
  PESSOAS.forEach(function(p){
    var bar = p.janela ? gBar(p.janela.inicio, p.janela.fim, LAYERS.entregas.c, p.janelaTexto, 'data-pessoa="' + p.id + '"', p.janela.inicio === p.janela.fim ? 'point' : '')
      : gBar('2026-09-01', '2027-02-28', LAYERS.entregas.c, 'Contínuo · semestre set/2026–fev/2027', 'data-pessoa="' + p.id + '"', 'cont');
    rows += '<div class="g-row"><div class="g-label">' + esc(p.nome) + '<small>' + esc(p.squad) + ' · ' + entregasCount(p) + ' entregas</small></div><div class="g-track">' + bar + '</div></div>';
  });
  /* traço de hoje desenhado dentro de cada faixa, antes das barras, para as barras ficarem por cima */
  var line = (TODAY_ISO >= '2026-09-01' && TODAY_ISO <= '2027-12-31') ? '<div class="g-today" style="left:calc(var(--mw) * ' + xStart(TODAY_ISO).toFixed(3) + ')"></div>' : '';
  rows = rows.split('<div class="g-track">').join('<div class="g-track">' + line);
  var today = '';
  return '<h1 class="section-title">Linha do tempo</h1><p class="section-sub">Campanhas conciliadas e janelas de entrega de cada pessoa. ⚠ indica ponto a validar entre as fontes. Clique para ver detalhes.</p>' +
    '<div class="gantt"><div class="gantt-inner">' + head + rows + today + '</div></div>';
};

/* ---- a validar ---- */
VIEWS['cal/validar'] = function(){
  var list = pontosValidar();
  return '<h1 class="section-title">A validar</h1><p class="section-sub">Divergências encontradas no cruzamento entre a plataforma do Vitor, o Plano de Marketing (PDF), os briefings e a planilha da Vanessa. Nada aqui foi decidido por conta própria.</p>' +
    '<div class="validar-list">' + list.map(function(v){
      var attr = v.tipo === 'camp' ? 'data-camp="' + v.id + '"' : (v.tipo === 'ini' ? 'data-ini="' + v.id + '"' : 'data-pessoa="' + v.id + '"');
      return '<button class="validar-item" ' + attr + '>' + ICON.alert + '<span><b>' + esc(v.titulo) + '</b>' + (v.quando ? ' <span class="mono" style="font-size:11px;color:var(--ink-4)">' + mesNome(v.quando) + '</span>' : '') + '<p>' + esc(v.texto) + '</p></span></button>';
    }).join('') + '</div>';
};
