/* =========================================================================
   NÚCLEO — utilitários, relações entre dados, navegação, painel lateral
   ========================================================================= */
var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
var MON3 = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
var DOW_FULL = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(ch){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]; }); }
function rich(s){ return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>'); }
function pad2(n){ return String(n).padStart(2, '0'); }
function toDate(isoStr){ var p = isoStr.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function toIso(dt){ return dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate()); }
function fmt(isoStr){ var x = toDate(isoStr); return pad2(x.getDate()) + '/' + pad2(x.getMonth() + 1) + '/' + x.getFullYear(); }
function fmtShort(isoStr){ var x = toDate(isoStr); return pad2(x.getDate()) + ' ' + MON3[x.getMonth()]; }
function periodo(a, b){ return a === b ? fmt(a) : fmt(a) + ' → ' + fmt(b); }
function mesNome(isoStr){ var x = toDate(isoStr); return MONTH_NAMES[x.getMonth()] + '/' + x.getFullYear(); }
function overlap(a1, a2, b1, b2){ return a1 <= b2 && b1 <= a2; }
var TODAY_ISO = toIso(TODAY);
var ANIM = typeof window.gsap !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var CLEAR = 'transform,opacity';
function isMobile(){ return window.matchMedia('(max-width:640px)').matches; }

var ICON = {
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><path d="M8 12h8"/></svg>'
};

var STATUS_LABEL = { 'nao-iniciado': 'Não iniciado', 'em-andamento': 'Em andamento', 'concluido': 'Concluído' };
function dotClass(st){ return st === 'em-andamento' ? 'andamento' : (st === 'concluido' ? 'concluido' : ''); }
function prioLabel(p){ return p === 'media' ? 'MEDIA' : (p === 'baixa' ? 'BAIXA' : 'ALTA'); }

function iniByNum(n){ return INICIATIVAS.filter(function(i){ return i.num === n; })[0]; }
function campById(id){ return CAMPANHAS.filter(function(c){ return c.id === id; })[0]; }
function pessoaById(id){ return PESSOAS.filter(function(p){ return p.id === id; })[0]; }
function itensOf(ini){ var all = []; ini.etapas.forEach(function(e){ all = all.concat(e.itens); }); return all; }
function prog(list){ var t = list.length, dn = list.filter(function(i){ return i.done; }).length; return { done: dn, total: t, pct: t ? Math.round(dn * 100 / t) : 0 }; }
function barHtml(p){ return '<div class="bar"><div class="bar-track"><div class="bar-fill" style="width:' + p.pct + '%"></div></div><span class="bar-pct">' + p.pct + '%</span></div>'; }
function monthIndexOf(isoStr){ var x = toDate(isoStr); var i = (x.getFullYear() - 2026) * 12 + x.getMonth() - 8; return Math.max(0, Math.min(15, i)); }
function shortTitle(t){ return t.split(':')[0].replace(/\s*\(.*\)$/, ''); }

/* ---- relações entre iniciativas, pessoas e campanhas ---- */
function entregasLigadas(campo, valor){
  var out = [];
  PESSOAS.forEach(function(p){ p.entregas.forEach(function(e){ if(e[campo] === valor) out.push({ pessoa: p, e: e }); }); });
  ENTREGAS_SETOR.forEach(function(e){ if(e[campo] === valor) out.push({ pessoa: null, e: e }); });
  return out;
}
function iniciativasDaPessoa(p){
  if(!p.lideranca) return [];
  var first = p.nome.split(' ')[0];
  return INICIATIVAS.filter(function(i){ return new RegExp('(^|\\s)' + first + '(\\s|$)').test(i.responsavel); });
}
function totalEntregasPessoas(){ return PESSOAS.reduce(function(s, p){ return s + p.entregas.length; }, 0); }
function pontosValidar(){
  var out = [];
  CAMPANHAS.forEach(function(c){ if(c.validar) out.push({ tipo: 'camp', id: c.id, titulo: c.nome, texto: c.validar, quando: c.inicio }); });
  INICIATIVAS.forEach(function(i){ if(!i.responsavel) out.push({ tipo: 'ini', id: i.num, titulo: '#' + i.num + ' ' + i.titulo, texto: 'Responsável não definido na plataforma do Vitor.' }); });
  PESSOAS.forEach(function(p){ if(/a documentar/.test(p.cargo)) out.push({ tipo: 'pessoa', id: p.id, titulo: p.nome, texto: 'Escopo e função ainda a documentar (briefing individual).' }); });
  return out;
}
function kcardIni(i){
  var p = prog(itensOf(i));
  return '<button class="kcard" data-ini="' + i.num + '"><span class="kcard-t"><span class="num">' + i.num + '</span>&nbsp; ' + esc(i.titulo) + '</span>' +
    '<span class="kcard-meta"><span class="tag"><i style="--c:' + (i.status === 'em-andamento' ? 'var(--amber)' : 'var(--ink-4)') + '"></i>' + STATUS_LABEL[i.status] + '</span>' +
    '<span class="tag">Onda ' + i.onda + '</span><span class="prio ' + i.prioridade + '">' + prioLabel(i.prioridade) + '</span>' +
    '<span class="tag">' + (i.responsavel ? esc(i.responsavel) : 'Sem responsável') + '</span></span>' + barHtml(p) + '</button>';
}

/* ---- gerenciamento de estado e persistência local ---- */
var STORAGE_KEY = 'inspirar_marketing_state_v1';
var USER_STATE = {
  checklist: {},
  entregas: {},
  indicadores: {},
  iniciativas: {}
};

function loadState(){
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(parsed && typeof parsed === 'object'){
        USER_STATE.checklist = parsed.checklist || {};
        USER_STATE.entregas = parsed.entregas || {};
        USER_STATE.indicadores = parsed.indicadores || {};
        USER_STATE.iniciativas = parsed.iniciativas || {};
      }
    }
  } catch(e){
    console.warn('Erro ao carregar estado do localStorage', e);
  }
  applyState();
}

function saveState(){
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(USER_STATE));
  } catch(e){
    console.warn('Erro ao salvar estado no localStorage', e);
  }
}

function syncIniStatusFromChecklist(ini){
  if(ini.statusModo === 'manual') return;
  var p = prog(itensOf(ini));
  if(p.total > 0 && p.done === p.total){
    ini.status = 'concluido';
  } else if(p.done > 0){
    ini.status = 'em-andamento';
  } else {
    ini.status = ini.statusSugerido || 'nao-iniciado';
  }
}

function applyState(){
  if(typeof INICIATIVAS !== 'undefined'){
    INICIATIVAS.forEach(function(ini){
      var iniNum = String(ini.num);
      if(USER_STATE.iniciativas[iniNum]){
        var custom = USER_STATE.iniciativas[iniNum];
        if(custom.status) ini.status = custom.status;
        if(custom.statusModo) ini.statusModo = custom.statusModo;
        if(custom.notas != null) ini.notas = custom.notas;
        if(custom.responsavel != null) ini.responsavel = custom.responsavel;
      }
      if(ini.etapas){
        ini.etapas.forEach(function(e, eIdx){
          if(e.itens){
            e.itens.forEach(function(it, itIdx){
              var k = iniNum + ':' + eIdx + ':' + itIdx;
              if(typeof USER_STATE.checklist[k] !== 'undefined'){
                it.done = !!USER_STATE.checklist[k];
              }
            });
          }
        });
      }
      if(ini.indicadores){
        ini.indicadores.forEach(function(ind){
          var k = iniNum + ':' + ind.nome;
          if(USER_STATE.indicadores[k]){
            var cInd = USER_STATE.indicadores[k];
            if(cInd.meta != null) ind.meta = cInd.meta;
            if(cInd.realizado != null) ind.realizado = cInd.realizado;
            if(cInd.semaforo != null) ind.semaforo = cInd.semaforo;
            if(cInd.nota != null) ind.nota = cInd.nota;
          }
        });
      }
      syncIniStatusFromChecklist(ini);
    });
  }
  if(typeof PESSOAS !== 'undefined'){
    PESSOAS.forEach(function(p){
      if(p.entregas){
        p.entregas.forEach(function(ent, entIdx){
          var k = p.id + ':' + entIdx;
          if(typeof USER_STATE.entregas[k] !== 'undefined'){
            ent.done = !!USER_STATE.entregas[k];
          }
        });
      }
    });
  }
  if(typeof ENTREGAS_SETOR !== 'undefined'){
    ENTREGAS_SETOR.forEach(function(ent, entIdx){
      var k = 'setor:' + entIdx;
      if(typeof USER_STATE.entregas[k] !== 'undefined'){
        ent.done = !!USER_STATE.entregas[k];
      }
    });
  }
}

function toggleCheckItem(iniNum, eIdx, itIdx){
  var ini = iniByNum(iniNum);
  if(!ini || !ini.etapas || !ini.etapas[eIdx] || !ini.etapas[eIdx].itens[itIdx]) return;
  var it = ini.etapas[eIdx].itens[itIdx];
  it.done = !it.done;
  var k = String(iniNum) + ':' + eIdx + ':' + itIdx;
  USER_STATE.checklist[k] = it.done;
  syncIniStatusFromChecklist(ini);
  saveState();
  render();
}

function toggleEntrega(pessoaId, entIdx){
  entIdx = parseInt(entIdx, 10);
  var ent = null;
  if(pessoaId === 'setor'){
    ent = ENTREGAS_SETOR[entIdx];
  } else {
    var p = pessoaById(pessoaId);
    if(p && p.entregas) ent = p.entregas[entIdx];
  }
  if(!ent) return;
  ent.done = !ent.done;
  var k = pessoaId + ':' + entIdx;
  USER_STATE.entregas[k] = ent.done;
  saveState();
  render();
}

function updateIndicador(iniNum, indNome, field, value){
  var ini = iniByNum(iniNum);
  if(!ini || !ini.indicadores) return;
  var ind = ini.indicadores.filter(function(x){ return x.nome === indNome; })[0];
  if(!ind) return;
  ind[field] = value;
  var k = String(iniNum) + ':' + indNome;
  if(!USER_STATE.indicadores[k]) USER_STATE.indicadores[k] = {};
  USER_STATE.indicadores[k][field] = value;
  saveState();
}

function updateIniStatus(iniNum, newStatus){
  var ini = iniByNum(iniNum);
  if(!ini) return;
  ini.status = newStatus;
  ini.statusModo = 'manual';
  var k = String(iniNum);
  if(!USER_STATE.iniciativas[k]) USER_STATE.iniciativas[k] = {};
  USER_STATE.iniciativas[k].status = newStatus;
  USER_STATE.iniciativas[k].statusModo = 'manual';
  saveState();
  render();
}

function updateIniNotes(iniNum, text){
  var ini = iniByNum(iniNum);
  if(!ini) return;
  ini.notas = text;
  var k = String(iniNum);
  if(!USER_STATE.iniciativas[k]) USER_STATE.iniciativas[k] = {};
  USER_STATE.iniciativas[k].notas = text;
  saveState();
}

function resetAllEdits(){
  if(window.confirm('Deseja realmente restaurar todos os dados e marcações para o padrão original? Todas as suas edições locais serão removidas.')){
    try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
    location.reload();
  }
}

// Carrega o estado inicial salvo
loadState();

/* ---- navegação ---- */
var TABS = {
  pe: [['painel','Painel Geral'],['iniciativas','Iniciativas'],['pessoas','Entregas por pessoa'],['kanban','Kanban'],['indicadores','Indicadores'],['atividade','Atividade']],
  cal: [['mes','Mês'],['linha','Linha do tempo'],['validar','A validar']]
};
var MONTHS = [];
(function(){ var y = 2026, m = 9; for(var i = 0; i < 16; i++){ MONTHS.push({ y: y, m: m }); m++; if(m > 12){ m = 1; y++; } } })();
var S = {
  mode: 'pe', tab: 'painel', arg: '', open: {},
  f: { q: '', onda: 'todos', area: 'todos', status: 'todos', prio: 'todos' },
  indIni: 'todos',
  calIdx: (function(){ var i = (TODAY.getFullYear() - 2026) * 12 + TODAY.getMonth() - 8; return i >= 0 && i < 16 ? i : 0; })(),
  layers: { campanhas: true, entregas: true, producao: true, saude: false, cidades: false, feriados: true },
  calPessoa: 'todos'
};
var VIEWS = {}, AFTER = {};

function readHash(){
  var p = location.hash.replace('#', '').split('/');
  S.mode = TABS[p[0]] ? p[0] : 'pe';
  S.tab = TABS[S.mode].some(function(t){ return t[0] === p[1]; }) ? p[1] : TABS[S.mode][0][0];
  S.arg = decodeURIComponent(p[2] || '');
}
function go(mode, tab, arg){
  S.mode = mode; S.tab = tab || TABS[mode][0][0]; S.arg = arg || '';
  var h = '#' + S.mode + '/' + S.tab + (S.arg ? '/' + encodeURIComponent(S.arg) : '');
  if(location.hash !== h) history.replaceState(null, '', h);
  render();
  if(!S.arg) window.scrollTo(0, 0);
}
function render(){
  document.querySelectorAll('.mode').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-mode') === S.mode); });
  document.getElementById('subtabs').innerHTML = TABS[S.mode].map(function(t){
    return '<button class="subtab' + (t[0] === S.tab ? ' active' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
  }).join('');
  var key = S.mode + '/' + S.tab;
  document.getElementById('view').innerHTML = VIEWS[key] ? VIEWS[key]() : '';
  if(AFTER[key]) AFTER[key]();
  animateView();
}

/* ---- animações de entrada (GSAP) — sempre com clearProps para não deixar transform preso ---- */
function staggerIn(list, each, y){ if(ANIM && list.length) gsap.from(list, { y: y || 22, opacity: 0, duration: .55, stagger: each, ease: 'power3.out', clearProps: CLEAR }); }
function growBars(scope){ if(!ANIM) return; var f = scope.querySelectorAll('.bar-fill'); if(f.length) gsap.from(f, { width: 0, duration: 1, stagger: .03, delay: .2, ease: 'power3.out' }); }
function countUp(els){
  els.forEach(function(el){
    var end = parseInt(el.getAttribute('data-count'), 10), o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.1, delay: .15, ease: 'power2.out', onUpdate: function(){ el.textContent = Math.round(o.v); } });
  });
}
function animateView(){
  if(!ANIM) return;
  var v = document.getElementById('view');
  var lines = v.querySelectorAll('.hero-title .line');
  if(lines.length){
    gsap.from(v.querySelectorAll('.hero .kicker'), { opacity: 0, y: 10, duration: .4, clearProps: CLEAR });
    gsap.from(lines, { yPercent: 110, duration: .8, stagger: .1, ease: 'power3.out', clearProps: CLEAR });
    gsap.from(v.querySelectorAll('.hero-lede'), { opacity: 0, y: 14, duration: .5, delay: .35, clearProps: CLEAR });
    gsap.from(v.querySelectorAll('.hero-now'), { opacity: 0, x: 30, duration: .6, delay: .25, ease: 'power3.out', clearProps: CLEAR });
    gsap.from(v.querySelectorAll('.now-item'), { opacity: 0, x: 16, duration: .35, stagger: .06, delay: .5, clearProps: CLEAR });
  }
  gsap.from(v.querySelectorAll('.section-title, .section-sub, .home-q, .filters, .cal-head, .layers, .month-band, .person-head'), { y: 16, opacity: 0, duration: .5, stagger: .05, ease: 'power2.out', clearProps: CLEAR });
  staggerIn(v.querySelectorAll('.choice'), .07, 30);
  staggerIn(v.querySelectorAll('.cards .box, .row, .col, .people-nav, .validar-item, .timeline .ev, .gantt, #indTable'), .05);
  staggerIn(v.querySelectorAll('.kcard, .deliv, .person-btn'), .02, 12);
  var days = v.querySelectorAll('.day:not(.out)');
  if(days.length) gsap.from(days, { opacity: 0, y: 12, duration: .4, stagger: .01, ease: 'power2.out', clearProps: CLEAR });
  var gbars = v.querySelectorAll('.g-bar:not(.point)');
  if(gbars.length) gsap.from(gbars, { scaleX: 0, opacity: 0, duration: .8, stagger: .025, delay: .15, ease: 'expo.out', clearProps: CLEAR });
  growBars(v);
  countUp(v.querySelectorAll('.kpi b[data-count]'));
}

/* ---- delegação de eventos: o elemento clicável mais próximo decide ---- */
var CLICK = [], CHANGE = [];
function onClick(attr, fn){ CLICK.push([attr, fn]); }
function onChange(attr, fn){ CHANGE.push([attr, fn]); }
document.addEventListener('click', function(e){
  var sel = CLICK.map(function(c){ return '[' + c[0] + ']'; }).join(',');
  var el = sel && e.target.closest(sel);
  if(!el) return;
  for(var i = 0; i < CLICK.length; i++){ if(el.hasAttribute(CLICK[i][0])){ CLICK[i][1](el, e); return; } }
});
function handleChange(e){
  for(var i = 0; i < CHANGE.length; i++){ if(e.target.hasAttribute && e.target.hasAttribute(CHANGE[i][0])){ CHANGE[i][1](e.target, e); return; } }
}
document.addEventListener('change', handleChange);
document.addEventListener('input', function(e){ if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') handleChange(e); });

onClick('data-mode', function(el){ closeSheet(); go(el.getAttribute('data-mode')); });
onClick('data-tab', function(el){ go(S.mode, el.getAttribute('data-tab')); });
onClick('data-comment', function(el){ el.classList.toggle('expanded'); });
onClick('data-ini', function(el){ closeSheet(); var n = el.getAttribute('data-ini'); S.open[n] = true; go('pe', 'iniciativas', n); });
onClick('data-pessoa', function(el){ closeSheet(); go('pe', 'pessoas', el.getAttribute('data-pessoa')); });
onClick('data-camp', function(el){ openCampanha(el.getAttribute('data-camp')); });
onClick('data-go', function(el){ closeSheet(); var p = el.getAttribute('data-go').split('/'); go(p[0], p[1], p[2]); });
onClick('data-toggle-check', function(el, e){
  if(e) e.stopPropagation();
  var parts = el.getAttribute('data-toggle-check').split(':');
  toggleCheckItem(parts[0], parseInt(parts[1], 10), parseInt(parts[2], 10));
});
onClick('data-toggle-deliv', function(el, e){
  if(e) e.stopPropagation();
  var parts = el.getAttribute('data-toggle-deliv').split(':');
  toggleEntrega(parts[0], parseInt(parts[1], 10));
});
onClick('data-reset-edits', function(el, e){
  if(e) e.stopPropagation();
  resetAllEdits();
});

onChange('data-edit-ind', function(el){
  var field = el.getAttribute('data-edit-ind');
  var iniNum = el.getAttribute('data-ini-num');
  var indNome = el.getAttribute('data-ind-nome');
  updateIndicador(iniNum, indNome, field, el.value);
  if(field === 'semaforo'){
    el.className = 'select sema ' + el.value;
  }
});
onChange('data-edit-ini-status', function(el){
  var iniNum = el.getAttribute('data-edit-ini-status');
  updateIniStatus(iniNum, el.value);
});
onChange('data-edit-ini-notes', function(el){
  var iniNum = el.getAttribute('data-edit-ini-notes');
  updateIniNotes(iniNum, el.value);
});

/* ---- tema claro/escuro (mesma chave do site e do calendário: inspirar-theme) ---- */
document.getElementById('themeToggle').addEventListener('click', function(){
  var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('inspirar-theme', next); } catch(e){}
});
var topbarEl = document.querySelector('.topbar');
window.addEventListener('scroll', function(){ topbarEl.classList.toggle('is-scrolled', window.scrollY > 8); }, { passive: true });

/* ---- painel lateral ---- */
var sheetEl = document.getElementById('sheet'), overlayEl = document.getElementById('overlay'), lastFocus = null;
function openSheet(kicker, title, html){
  lastFocus = document.activeElement;
  document.getElementById('sheetKicker').textContent = kicker;
  document.getElementById('sheetTitle').textContent = title;
  document.getElementById('sheetBody').innerHTML = html;
  sheetEl.hidden = false; overlayEl.hidden = false;
  document.body.style.overflow = 'hidden';
  if(ANIM){
    gsap.killTweensOf([sheetEl, overlayEl]);
    gsap.fromTo(overlayEl, { opacity: 0 }, { opacity: 1, duration: .25 });
    gsap.fromTo(sheetEl, isMobile() ? { yPercent: 100, xPercent: 0 } : { xPercent: 105, yPercent: 0 }, { xPercent: 0, yPercent: 0, duration: .45, ease: 'power3.out' });
    gsap.from('#sheetBody > *', { y: 18, opacity: 0, duration: .4, stagger: .05, delay: .12, ease: 'power2.out', clearProps: CLEAR });
  }
  document.getElementById('sheetClose').focus();
}
function closeSheet(){
  if(sheetEl.hidden) return;
  function done(){ sheetEl.hidden = true; overlayEl.hidden = true; document.body.style.overflow = ''; if(lastFocus && document.body.contains(lastFocus)) lastFocus.focus(); }
  if(ANIM){
    gsap.killTweensOf([sheetEl, overlayEl]);
    gsap.to(overlayEl, { opacity: 0, duration: .2 });
    gsap.to(sheetEl, Object.assign(isMobile() ? { yPercent: 100 } : { xPercent: 105 }, { duration: .3, ease: 'power2.in', onComplete: done }));
  } else done();
}
function openCampanha(id){
  var c = campById(id); if(!c) return;
  var tp = TIPOS_CAMPANHA[c.tipo], ent = entregasLigadas('campanha', id);
  var per = c.mes ? 'Mês de referência: ' + mesNome(c.inicio) + (c.inicio.slice(0, 7) !== c.fim.slice(0, 7) ? ' a ' + mesNome(c.fim) : '') : periodo(c.inicio, c.fim);
  var html =
    '<div class="sheet-item" style="--c:' + tp.cor + '"><b>Período</b><p>' + per + '</p>' +
      (c.preparo ? '<p>Preparação / pré-campanha: ' + fmt(c.preparo) + '</p>' : '') +
      (c.pico ? '<p>Pico: ' + fmt(c.pico) + '</p>' : '') + '</div>' +
    '<div class="sheet-item"><b>Descrição</b><p>' + esc(c.desc) + '</p><p>Fontes: ' + c.fontes.join(' · ') + '</p></div>' +
    (c.validar ? '<div class="sheet-item" style="--c:var(--amber)"><b class="warn">A validar</b><p>' + esc(c.validar) + '</p></div>' : '') +
    '<div class="sheet-item"><b>Entregas ligadas (' + ent.length + ')</b>' +
      (ent.length ? ent.map(function(x){
        return '<p>' + (x.pessoa ? '<button class="tag link" data-pessoa="' + x.pessoa.id + '">' + esc(x.pessoa.nome) + '</button>' : '<span class="tag">Setor</span>') + ' ' + esc(x.e.t) + '</p>';
      }).join('') + '<p class="sug">Relação sugerida no cruzamento com os briefings.</p>' : '<p>Nenhuma entrega dos briefings ligada a esta campanha.</p>') + '</div>' +
    '<button class="camp-chip" style="--c:' + tp.cor + '" data-month="' + monthIndexOf(c.inicio) + '">Ver no calendário →</button>';
  openSheet(tp.label + ' · ' + c.fontes.join(' · '), c.nome, html);
}
