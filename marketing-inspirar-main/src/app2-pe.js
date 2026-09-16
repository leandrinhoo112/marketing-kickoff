/* =========================================================================
   PLANEJAMENTO ESTRATÉGICO — Painel Geral, Iniciativas, Kanban, Indicadores, Atividade
   ========================================================================= */
function kpi(v, l){ return '<div class="box kpi"><b' + (/^\d+$/.test(String(v)) ? ' data-count="' + v + '"' : '') + '>' + v + '</b><span>' + l + '</span></div>'; }

var SVG = {
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>'
};
function heroHtml(){
  var inRange = TODAY_ISO >= '2026-09-01' && TODAY_ISO <= '2027-12-31';
  var mo = MONTHS[inRange ? monthIndexOf(TODAY_ISO) : 0], ref = inRange ? TODAY_ISO : '2026-09-01';
  var camps = CAMPANHAS.filter(function(c){ return !c.pendente && overlap(c.inicio, c.fim, ref, ref); });
  var tema = MONTH_THEMES[mo.m];
  return '<section class="hero"><div class="hero-copy"><p class="kicker">Planejamento Estratégico · Marketing 26–27</p>' +
    '<h1 class="hero-title"><span class="line">Tudo que o Marketing</span><span class="line">da Inspirar vai <em>entregar</em>,</span><span class="line">em um só lugar.</span></h1>' +
    '<p class="hero-lede">Iniciativas do Planejamento Estratégico, entregas de cada pessoa e o calendário completo de campanhas, de setembro/2026 a dezembro/2027.</p></div>' +
    '<div class="hero-now"><div class="now-label"><span class="now-dot"></span>' + (inRange ? 'Acontecendo agora' : 'Primeiro mês do plano') + '</div>' +
    '<p class="now-month">' + MONTH_NAMES[mo.m - 1] + ' ' + mo.y + '</p><p class="now-theme">' + (tema ? esc(tema.title) : '') + '</p><div class="now-list">' +
    (camps.length ? camps.map(function(c){ return '<button class="now-item" data-camp="' + c.id + '" style="--c:' + TIPOS_CAMPANHA[c.tipo].cor + '"><i></i>' + esc(c.nome) + '</button>'; }).join('') : '<p class="now-theme" style="margin:0 0 6px">Nenhuma campanha ativa hoje.</p>') +
    '<button class="now-item cta" data-month="' + (inRange ? monthIndexOf(TODAY_ISO) : 0) + '">Abrir o calendário deste mês <span>→</span></button></div></div></section>';
}
function choicesHtml(){
  var val = pontosValidar().length;
  var ch = [
    ['c-big', 'data-tab="iniciativas"', SVG.target, 'Acompanhar as iniciativas', INICIATIVAS.length + ' iniciativas com etapas, checklist e indicadores.'],
    ['c-big', 'data-tab="pessoas"', SVG.people, 'Ver entregas por pessoa', totalEntregasPessoas() + ' entregas dos briefings, pessoa a pessoa.'],
    ['', 'data-mode="cal"', SVG.cal, 'Planejar o mês', 'Campanhas, entregas e datas dia a dia.'],
    ['', 'data-go="cal/validar"', ICON.alert, val + ' pontos a validar', 'Divergências entre as fontes para decidir.']
  ];
  return ch.map(function(c){
    return '<button class="choice ' + c[0] + '" ' + c[1] + '><span class="choice-ico">' + c[2] + '</span><span class="choice-t">' + esc(c[3]) + '</span><span class="choice-d">' + esc(c[4]) + '</span><span class="choice-go">Abrir <span>→</span></span></button>';
  }).join('');
}

VIEWS['pe/painel'] = function(){
  var itens = []; INICIATIVAS.forEach(function(i){ itens = itens.concat(itensOf(i)); });
  var pi = prog(itens);
  var andamento = INICIATIVAS.filter(function(i){ return i.status === 'em-andamento'; }).length;
  var pessoas = PESSOAS.filter(function(p){ return !p.lideranca; }).length;
  var h = heroHtml() + '<h2 class="home-q">O que você quer fazer agora?</h2><div class="choice-grid">' + choicesHtml() + '</div><h2 class="home-q">Visão do setor</h2>';
  h += '<div class="cards k4">' +
    kpi(INICIATIVAS.length, 'iniciativas de Marketing · ' + andamento + ' em andamento') +
    kpi(pi.done + '/' + pi.total, 'itens de checklist concluídos') +
    kpi(totalEntregasPessoas() + ENTREGAS_SETOR.length, 'entregas mapeadas (' + pessoas + ' pessoas + setor)') +
    kpi(pontosValidar().length, 'pontos a validar') + '</div>';

  h += '<div class="cards k2" style="margin-top:12px"><div class="box"><p class="label">Progresso por iniciativa</p>' + INICIATIVAS.map(kcardIni).join('') + '</div>';
  h += '<div class="box"><p class="label">Norte do setor</p><p class="text-soft" style="color:var(--ink-2);margin-bottom:12px">' + esc(PLANO.norte) + '</p>' +
    PLANO.objetivos.map(function(o){ return '<div class="deliv"><span class="circle"></span><div class="deliv-body"><span class="deliv-t"><b style="font-weight:500">' + esc(o.nome) + '</b> — ' + esc(o.desc) + '</span></div></div>'; }).join('') +
    '<p class="label" style="margin-top:14px">Pilares 2026</p><div class="deliv-tags">' + PLANO.pilares.map(function(p){ return '<span class="tag">' + esc(p) + '</span>'; }).join('') + '</div>' +
    '<p class="label" style="margin-top:14px">Diretrizes</p>' + PLANO.diretrizes.map(function(d){ return '<p class="text-soft" style="margin-bottom:6px"><span style="color:var(--ink-2)">' + esc(d.nome) + ':</span> ' + esc(d.desc) + '</p>'; }).join('') + '</div></div>';

  h += '<div class="cards k2" style="margin-top:12px"><div class="box"><p class="label">Próximos marcos</p>' + marcosFuturos(8) + '</div>' +
    '<div class="box"><p class="label">Entregas por pessoa</p>' + equipeResumo() + '</div></div>';
  return h;
};

/* ---- Iniciativas ---- */
function filtrarIni(){
  var f = S.f, q = f.q.trim().toLowerCase();
  return INICIATIVAS.filter(function(i){
    return (!q || (i.num + ' ' + i.titulo + ' ' + i.objetivo + ' ' + i.responsavel).toLowerCase().indexOf(q) !== -1) &&
      (f.onda === 'todos' || String(i.onda) === f.onda) && (f.area === 'todos' || i.area === f.area) &&
      (f.status === 'todos' || i.status === f.status) && (f.prio === 'todos' || i.prioridade === f.prio);
  });
}
function selectF(key, opts){
  return '<select class="select" data-f="' + key + '" aria-label="' + key + '">' + opts.map(function(o){
    return '<option value="' + esc(o[0]) + '"' + (S.f[key] === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
  }).join('') + '</select>';
}
VIEWS['pe/iniciativas'] = function(){
  if(S.arg) S.open[S.arg] = true;
  return '<div class="filters"><input class="input" data-f="q" placeholder="Buscar iniciativa..." value="' + esc(S.f.q) + '" aria-label="Buscar iniciativa">' +
    selectF('onda', [['todos','Onda: todos'],['1','Onda 1'],['2','Onda 2']]) +
    selectF('area', [['todos','Área: todos'],['Comercial · Marketing','Comercial · Marketing'],['Marketing','Marketing']]) +
    selectF('status', [['todos','Status: todos'],['nao-iniciado','Não iniciado'],['em-andamento','Em andamento'],['concluido','Concluído']]) +
    selectF('prio', [['todos','Prioridade: todos'],['alta','Alta'],['media','Média']]) +
    '<span class="count" id="iniCount"></span></div><div class="list" id="iniList"></div>';
};
AFTER['pe/iniciativas'] = function(){
  updateIniList();
  if(S.arg){
    var el = document.getElementById('ini-' + S.arg);
    if(el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120);
  }
};
function updateIniList(){
  var l = filtrarIni();
  document.getElementById('iniCount').textContent = l.length + ' de ' + INICIATIVAS.length;
  document.getElementById('iniList').innerHTML = l.length ? l.map(rowHtml).join('') : '<div class="empty">Nenhuma iniciativa com esses filtros.</div>';
}
onChange('data-f', function(el){
  S.f[el.getAttribute('data-f')] = el.value; updateIniList();
  if(ANIM && el.tagName === 'SELECT') gsap.from('#iniList .row', { y: 12, opacity: 0, duration: .35, stagger: .04, ease: 'power2.out', clearProps: CLEAR });
});
onClick('data-toggle', function(el){
  var n = el.getAttribute('data-toggle'); S.open[n] = !S.open[n]; S.arg = '';
  history.replaceState(null, '', '#pe/iniciativas');
  updateIniList();
  var det = S.open[n] && document.querySelector('#ini-' + n + ' .detail');
  if(ANIM && det){
    gsap.from(det, { height: 0, opacity: 0, duration: .45, ease: 'power3.out', clearProps: 'height,opacity' });
    gsap.from(det.children, { y: 14, opacity: 0, duration: .4, stagger: .04, delay: .1, ease: 'power2.out', clearProps: CLEAR });
    growBars(det);
  }
});

function rowHtml(i){
  var open = !!S.open[i.num], p = prog(itensOf(i));
  return '<div class="row' + (open ? ' open' : '') + '" id="ini-' + i.num + '">' +
    '<button class="row-head" data-toggle="' + i.num + '" aria-expanded="' + open + '">' +
      '<span class="dot ' + dotClass(i.status) + '"></span><span class="num">' + i.num + '</span>' +
      '<span class="row-title">' + esc(i.titulo) + '</span>' +
      '<span class="muted hide-sm">Onda ' + i.onda + '</span><span class="muted hide-sm">' + esc(i.area) + '</span>' +
      '<span class="prio hide-sm ' + i.prioridade + '">' + prioLabel(i.prioridade) + '</span>' +
      '<span class="hide-sm">' + barHtml(p) + '</span>' + ICON.chev +
    '</button>' + (open ? detailHtml(i) : '') + '</div>';
}
function indRow(ind, ini, showIniTag){
  var iniNum = ini ? ini.num : '';
  var s = ind.semaforo || '';
  var iniCell = showIniTag ? '<td><button class="tag link" data-ini="' + ini.num + '">#' + ini.num + '</button></td>' : '';
  
  var metaInput = '<input type="text" class="ind-input" data-edit-ind="meta" data-ini-num="' + iniNum + '" data-ind-nome="' + esc(ind.nome) + '" value="' + esc(ind.meta || '') + '" placeholder="Definir meta" title="Clique para editar">';
  
  var realizadoInput = '<div style="display:flex; align-items:center; gap:6px">' +
    '<input type="text" class="ind-input" data-edit-ind="realizado" data-ini-num="' + iniNum + '" data-ind-nome="' + esc(ind.nome) + '" value="' + esc(ind.realizado || '') + '" placeholder="Realizado" title="Clique para editar">' +
    (ind.automatico ? '<span class="auto" title="Atualizado na fonte">' + ICON.link + ' auto</span>' : '') +
    '</div>';
    
  var semaSelect = '<select class="select sema ' + s + '" data-edit-ind="semaforo" data-ini-num="' + iniNum + '" data-ind-nome="' + esc(ind.nome) + '" title="Alterar semáforo">' +
    '<option value=""' + (!s ? ' selected' : '') + '>Não avaliado</option>' +
    '<option value="verde"' + (s === 'verde' ? ' selected' : '') + '>🟢 Verde</option>' +
    '<option value="amarelo"' + (s === 'amarelo' ? ' selected' : '') + '>🟡 Amarelo</option>' +
    '<option value="vermelho"' + (s === 'vermelho' ? ' selected' : '') + '>🔴 Vermelho</option>' +
    '</select>';
    
  var notaInput = '<input type="text" class="ind-input" data-edit-ind="nota" data-ini-num="' + iniNum + '" data-ind-nome="' + esc(ind.nome) + '" value="' + esc(ind.nota || '') + '" placeholder="Adicionar nota..." title="Clique para editar">';

  return '<tr>' + iniCell +
    '<td><b style="font-weight:500">' + esc(ind.nome) + '</b></td>' +
    '<td class="meta" style="min-width:140px">' + metaInput + '</td>' +
    '<td style="min-width:140px">' + realizadoInput + '</td>' +
    '<td style="min-width:130px">' + semaSelect + '</td>' +
    '<td style="min-width:180px">' + notaInput + '</td>' +
    '</tr>';
}
function detailHtml(i){
  var p = prog(itensOf(i));
  var statusOptions = [
    ['nao-iniciado', 'Não iniciado'],
    ['em-andamento', 'Em andamento'],
    ['concluido', 'Concluído']
  ];
  var statusSelect = '<select class="status-select" data-edit-ini-status="' + i.num + '" title="Alterar status">' +
    statusOptions.map(function(opt){
      return '<option value="' + opt[0] + '"' + (i.status === opt[0] ? ' selected' : '') + '>' + opt[1] + (i.statusModo === 'manual' && i.status === opt[0] ? ' (manual)' : '') + '</option>';
    }).join('') +
  '</select>';

  var h = '<div class="detail">';
  h += '<div class="grid-3">' +
    '<div><p class="label">Responsável</p><div class="field' + (i.responsavel ? '' : ' placeholder') + '">' + (i.responsavel ? esc(i.responsavel) : 'Nome do responsável') + '</div></div>' +
    '<div><p class="label">Status (sugerido: ' + STATUS_LABEL[i.statusSugerido] + ')</p><div class="field status-field">' + statusSelect + '</div></div>' +
    '<div><p class="label">Progresso</p><div class="progress-line"><div class="bar-track"><div class="bar-fill" style="width:' + p.pct + '%"></div></div><span class="bar-pct">' + p.done + '/' + p.total + ' (' + p.pct + '%)</span></div></div></div>';
  h += '<div><p class="label">Objetivo</p><p class="text-soft">' + esc(i.objetivo) + '</p></div>';
  h += '<div><p class="label">Fluxo de etapas</p><div class="flow">' + i.etapas.map(function(e, k){
    return (k ? '<span class="flow-arrow" aria-hidden="true">›</span>' : '') +
      '<div class="step" title="' + esc(e.titulo) + '"><span class="step-top"><span class="dot"></span>' + pad2(k + 1) + '</span><span class="step-t">' + esc(e.titulo) + '</span>' + barHtml(prog(e.itens)) + '</div>';
  }).join('') + '</div></div>';
  h += '<div><p class="label">Checklist (clique na bolinha ou na tarefa para concluir)</p><div class="checks">' + i.etapas.map(function(e, eIdx){
    var pe = prog(e.itens);
    return '<div class="check-card"><div class="check-head"><b>' + esc(e.titulo) + '</b><span>' + pe.done + '/' + pe.total + '</span></div>' +
      (e.comentario ? '<p class="comment" data-comment title="Clique para ler o comentário completo">' + rich(e.comentario) + '</p>' : '') +
      e.itens.map(function(it, itIdx){
        var checkKey = i.num + ':' + eIdx + ':' + itIdx;
        return '<div class="item' + (it.done ? ' is-done' : '') + '">' +
          '<button type="button" class="circle' + (it.done ? ' done' : '') + '" data-toggle-check="' + checkKey + '" aria-label="Concluir tarefa" title="Concluir tarefa"></button>' +
          '<span class="item-body"><span class="item-text' + (it.done ? ' is-done' : '') + '" data-toggle-check="' + checkKey + '" style="cursor:pointer">' + esc(it.t) + '</span>' +
          (it.c ? '<span class="comment" data-comment title="Clique para ler o comentário completo">' + rich(it.c) + '</span>' : '') + '</span></div>';
      }).join('') + '</div>';
  }).join('') + '</div></div>';
  h += '<div><p class="label">Indicadores (editáveis diretamente na tabela)</p><div class="table"><table><thead><tr><th>Indicador</th><th>Meta</th><th>Realizado</th><th>Semáforo</th><th>Nota</th></tr></thead><tbody>' +
    i.indicadores.map(function(ind){ return indRow(ind, i, false); }).join('') + '</tbody></table></div></div>';
  h += '<div class="rmd">' +
    '<div class="rmd-card"><p class="label">' + ICON.alert + 'Risco</p><p>' + esc(i.risco) + '</p></div>' +
    '<div class="rmd-card"><p class="label">' + ICON.shield + 'Mitigação</p><p>' + esc(i.mitigacao) + '</p></div>' +
    '<div class="rmd-card"><p class="label">' + ICON.link + 'Dependências</p><p>' + esc(i.dependencias) + '</p></div></div>';
  var rel = entregasLigadas('iniciativa', i.num);
  h += '<div><p class="label">Entregas relacionadas por pessoa</p>' + (rel.length ?
    '<div class="check-card">' + rel.map(function(x){
      var isDone = !!x.e.done;
      var pId = x.pessoa ? x.pessoa.id : 'setor';
      var idx = x.pessoa ? x.pessoa.entregas.indexOf(x.e) : ENTREGAS_SETOR.indexOf(x.e);
      var delivKey = pId + ':' + idx;
      return '<div class="item' + (isDone ? ' is-done' : '') + '">' +
        '<button type="button" class="circle' + (isDone ? ' done' : '') + '" data-toggle-deliv="' + delivKey + '" title="Marcar como concluída"></button>' +
        '<span class="item-body"><span class="item-text' + (isDone ? ' is-done' : '') + '" data-toggle-deliv="' + delivKey + '" style="cursor:pointer">' + esc(x.e.t) + '</span><span class="deliv-tags">' +
        (x.pessoa ? '<button class="tag link" data-pessoa="' + x.pessoa.id + '">' + esc(x.pessoa.nome) + '</button>' : '<span class="tag">Setor</span>') + '</span></span></div>';
    }).join('') + '<p class="sug" style="margin:8px 0 0">Relação sugerida no cruzamento entre os briefings e esta iniciativa — não consta na plataforma do Vitor.</p></div>'
    : '<div class="empty">Nenhuma entrega dos briefings ligada a esta iniciativa.</div>') + '</div>';
  h += '<div><p class="label">Notas da Iniciativa</p><textarea class="notes-input" data-edit-ini-notes="' + i.num + '" placeholder="Escreva aqui anotações livres sobre o andamento desta iniciativa...">' + esc(i.notas || '') + '</textarea></div>';
  h += '<div class="status-now">Status atual: <b class="' + (i.status === 'em-andamento' ? '' : 'nao') + '">' + STATUS_LABEL[i.status] + '</b></div></div>';
  return h;
}


/* ---- Kanban ---- */
VIEWS['pe/kanban'] = function(){
  var cols = [['nao-iniciado','Não iniciado',''],['em-andamento','Em andamento','andamento'],['concluido','Concluído','concluido']];
  return '<h1 class="section-title">Kanban</h1><p class="section-sub">Iniciativas por status atual.</p><div class="kanban">' + cols.map(function(c){
    var l = INICIATIVAS.filter(function(i){ return i.status === c[0]; });
    return '<div class="col"><div class="col-head"><b><span class="dot ' + c[2] + '"></span>' + c[1] + '</b><span class="mono">' + l.length + '</span></div>' +
      (l.length ? l.map(kcardIni).join('') : '<div class="empty" style="padding:18px">Nenhuma iniciativa</div>') + '</div>';
  }).join('') + '</div>';
};

/* ---- Indicadores ---- */
VIEWS['pe/indicadores'] = function(){
  return '<h1 class="section-title">Indicadores</h1><p class="section-sub">Todos os indicadores das iniciativas de Marketing, com meta, realizado e semáforo.</p>' +
    '<div class="filters"><select class="select" data-ind aria-label="Iniciativa"><option value="todos">Iniciativa: todas</option>' +
    INICIATIVAS.map(function(i){ return '<option value="' + i.num + '"' + (S.indIni === i.num ? ' selected' : '') + '>#' + i.num + ' ' + esc(shortTitle(i.titulo)) + '</option>'; }).join('') +
    '</select><span class="count" id="indCount"></span></div><div class="table" id="indTable"></div>';
};
function updateInd(){
  var rows = [], total = 0;
  INICIATIVAS.forEach(function(i){
    if(S.indIni !== 'todos' && S.indIni !== i.num) return;
    i.indicadores.forEach(function(ind){ rows.push(indRow(ind, i, true)); total++; });
  });
  document.getElementById('indCount').textContent = total + ' indicadores';
  document.getElementById('indTable').innerHTML = '<table><thead><tr><th>Iniciativa</th><th>Indicador</th><th>Meta</th><th>Realizado</th><th>Semáforo</th><th>Nota</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>';
}
AFTER['pe/indicadores'] = updateInd;
onChange('data-ind', function(el){ S.indIni = el.value; updateInd(); });

/* ---- Atividade ---- */
VIEWS['pe/atividade'] = function(){
  var coment = 0;
  INICIATIVAS.forEach(function(i){ i.etapas.forEach(function(e){ if(e.comentario) coment++; e.itens.forEach(function(it){ if(it.c) coment++; }); }); });
  var pessoas = PESSOAS.filter(function(p){ return !p.lideranca; }).length;
  var evs = [
    ['14/09/2026', 'Plataforma de Marketing publicada a partir da versão do Planejamento Estratégico enviada pelo Vitor, com as ' + INICIATIVAS.length + ' iniciativas de Marketing.'],
    ['14/09/2026', 'Entregas por pessoa importadas dos briefings individuais de setembro: ' + pessoas + ' pessoas, ' + totalEntregasPessoas() + ' entregas, mais ' + ENTREGAS_SETOR.length + ' entregas do setor.'],
    ['14/09/2026', 'Calendário novo gerado cruzando o Plano de Marketing (PDF), o calendário do Vitor e a planilha da Vanessa: ' + CAMPANHAS.length + ' campanhas e datas, ' + pontosValidar().length + ' pontos a validar.'],
    ['Fonte · Vitor', '#05 — status definido manualmente como Em andamento (sugerido: Não iniciado). Responsável: Philipe e Bruno.'],
    ['Fonte · Vitor', '#09 — status definido manualmente como Em andamento. Responsável: Bruno e Vanessa. Indicador “% leads vindos de Meta” com semáforo Verde.'],
    ['Fonte · Vitor', '#07 — indicador “CPL médio rede” com realizado R$ 15, atualizado automaticamente.'],
    ['Fonte · Vitor', coment + ' comentários registrados nos checklists das iniciativas #05 e #09.']
  ];
  return '<h1 class="section-title">Atividade</h1><p class="section-sub">Status, checklists, notas e indicadores são editáveis diretamente e salvos no navegador.</p>' +
    '<div class="box"><div class="timeline">' + evs.map(function(ev){ return '<div class="ev"><time>' + esc(ev[0]) + '</time><p>' + esc(ev[1]) + '</p></div>'; }).join('') + '</div>' +
    '<div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--glass-border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px">' +
      '<span style="font-size:13px; color:var(--ink-3)">As suas alterações são salvas automaticamente no armazenamento local deste navegador.</span>' +
      '<button class="tag" data-reset-edits style="cursor:pointer; color:var(--red); border-color:rgba(220,38,38,0.3)">Restaurar dados originais</button>' +
    '</div></div>';
};

