/* =========================================================================
   ENTREGAS POR PESSOA
   ========================================================================= */
var SQUADS = ['Liderança', 'Branding', 'Performance'];

function entregasCount(p){ return p.lideranca ? iniciativasDaPessoa(p).length + ENTREGAS_SETOR.length : p.entregas.length; }

function equipeResumo(){
  return SQUADS.map(function(s){
    return '<p class="squad-label" style="margin-left:0">' + s + '</p><div class="deliv-tags">' +
      PESSOAS.filter(function(p){ return p.squad === s; }).map(function(p){
        return '<button class="tag link" data-pessoa="' + p.id + '">' + esc(p.nome) + ' · <span class="mono">' + entregasCount(p) + '</span></button>';
      }).join('') + '</div>';
  }).join('');
}

function delivHtml(e, i, pessoaId){
  var pId = pessoaId || (e._pessoaId || 'setor');
  var isDone = !!e.done;
  var tags = [];
  if(e.campanha){ var c = campById(e.campanha); if(c) tags.push('<button class="tag link" data-camp="' + c.id + '"><i style="--c:' + TIPOS_CAMPANHA[c.tipo].cor + '"></i>' + esc(c.nome) + '</button>'); }
  if(e.iniciativa){ var ini = iniByNum(e.iniciativa); if(ini) tags.push('<button class="tag link" data-ini="' + ini.num + '">#' + ini.num + ' ' + esc(shortTitle(ini.titulo)) + '</button>'); }
  if(e.data) tags.push('<span class="tag">' + fmt(e.data) + '</span>');
  var delivKey = pId + ':' + i;
  return '<div class="deliv' + (isDone ? ' is-done' : '') + '">' +
    '<span class="n">' + pad2(i + 1) + '</span>' +
    '<button type="button" class="circle' + (isDone ? ' done' : '') + '" data-toggle-deliv="' + delivKey + '" aria-label="Marcar entrega como concluída" title="Marcar entrega como concluída"></button>' +
    '<div class="deliv-body">' +
    '<span class="deliv-t' + (isDone ? ' is-done' : '') + '" data-toggle-deliv="' + delivKey + '" style="cursor:pointer">' + esc(e.t) + '</span>' +
    (tags.length ? '<span class="deliv-tags">' + tags.join('') + '</span>' : '') + '</div></div>';
}

VIEWS['pe/pessoas'] = function(){
  var p = pessoaById(S.arg) || PESSOAS[0];
  var nav = '<nav class="people-nav" aria-label="Pessoas">' + SQUADS.map(function(s){
    return '<p class="squad-label">' + s + '</p>' + PESSOAS.filter(function(x){ return x.squad === s; }).map(function(x){
      return '<button class="person-btn' + (x.id === p.id ? ' active' : '') + '" data-pessoa="' + x.id + '" aria-current="' + (x.id === p.id) + '">' + esc(x.nome) + '<span>' + entregasCount(x) + '</span></button>';
    }).join('');
  }).join('') + '</nav>';

  var head = '<div class="person-head"><div><h2>' + esc(p.nome) + '</h2><p>' + esc(p.cargo) + (p.lideranca ? '' : ' · Squad ' + p.squad) + '</p></div>' +
    '<div class="deliv-tags"><span class="tag">' + esc(p.janelaTexto) + '</span><span class="tag">Fonte: ' + esc(p.fonte) + '</span></div></div>';

  var body = '';
  if(p.lideranca){
    var inis = iniciativasDaPessoa(p);
    body += '<div class="box"><p class="label">Iniciativas sob responsabilidade</p>' +
      (inis.length ? inis.map(kcardIni).join('') : '<div class="empty">Nenhuma iniciativa com este nome como responsável na plataforma do Vitor.</div>') + '</div>';
    body += '<div class="box" style="margin-top:12px"><p class="label">Entregas do setor · ' + ENTREGAS_SETOR.length + ' (clique para concluir)</p>' + ENTREGAS_SETOR.map(function(e, i){ return delivHtml(e, i, 'setor'); }).join('') +
      '<p class="sug" style="margin:10px 0 0">Checklist macro do Plano de Marketing: é do setor, não de uma pessoa, e fica com a liderança (Bruno + Vanessa).</p></div>';
    var sem = INICIATIVAS.filter(function(i){ return !i.responsavel; });
    if(sem.length) body += '<div class="box" style="margin-top:12px"><p class="label">Iniciativas sem responsável definido</p>' + sem.map(kcardIni).join('') + '</div>';
  } else {
    body += '<div class="box"><p class="label">Entregas · ' + p.entregas.length + ' (clique para concluir)</p>' + p.entregas.map(function(e, i){ return delivHtml(e, i, p.id); }).join('') +
      '<p class="sug" style="margin:10px 0 0">Texto igual ao briefing individual. As etiquetas de campanha e iniciativa são relações sugeridas no cruzamento com a plataforma do Vitor.</p></div>';

    var ids = [];
    p.entregas.forEach(function(e){ if(e.campanha && ids.indexOf(e.campanha) === -1) ids.push(e.campanha); });
    if(ids.length){
      body += '<div class="box" style="margin-top:12px"><p class="label">Campanhas em que atua</p><div class="month-band" style="margin:0">' + ids.map(function(id){
        var c = campById(id), tp = TIPOS_CAMPANHA[c.tipo];
        return '<button class="camp-chip" style="--c:' + tp.cor + '" data-camp="' + c.id + '">' + esc(c.nome) + ' <small>' + (c.mes ? mesNome(c.inicio) : fmtShort(c.inicio) + ' → ' + fmtShort(c.fim)) + '</small></button>';
      }).join('') + '</div></div>';
    }
  }
  return '<div class="people-layout">' + nav + '<section>' + head + body + '</section></div>';
};
