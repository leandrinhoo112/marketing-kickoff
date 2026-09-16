/* =========================================================================
   CALENDÁRIO NOVO — campanhas conciliadas (set/2026 → dez/2027)
   Fontes cruzadas: Plano de Marketing (PDF, set/26–fev/27) · calendário do Vitor (set–dez/26)
                    · planilha da Vanessa (2027) · briefings individuais (janelas e marcos).
   `validar` = divergência entre fontes que precisa de decisão; nada foi resolvido por conta própria.
   ========================================================================= */
var CAMPANHAS = [
  { id: 'set-conteudo', nome: 'Preparar peças e conteúdo de valor', tipo: 'foco',
    inicio: '2026-09-01', fim: '2026-09-30', fontes: ['PDF'],
    desc: 'Foco de setembro no plano: preparar peças e conteúdo de valor, com a base visual e os templates alinhados ao manual de marca.',
    validar: 'No plano (PDF), setembro está “a definir”. O calendário do Vitor já coloca Congresso de Estética, Setembro Amarelo e a turma da PG semipresencial no mesmo mês.' },
  { id: 'congresso', nome: 'Congresso Internacional de Estética', tipo: 'evento',
    inicio: '2026-09-01', fim: '2026-09-25', pico: '2026-09-18', fontes: ['Vitor'],
    desc: 'Produção de conteúdo nacional em torno do Congresso: matéria-gancho, teaser countdown, cobertura ao vivo em Curitiba (18–20/09) e recap com conversão para a pós de estética/dermato funcional.' },
  { id: 'setamarelo', nome: 'Setembro Amarelo', tipo: 'conscientizacao',
    inicio: '2026-09-01', fim: '2026-09-30', pico: '2026-09-10', fontes: ['Vitor'],
    desc: 'Matérias News educativas, pico institucional em 10/09 (Dia Mundial de Prevenção ao Suicídio) e Roda de Conversa nas unidades em 11/09.' },
  { id: 'pg-semi', nome: 'PG Semipresencial de Fisioterapia Intensiva', tipo: 'comercial',
    inicio: '2026-09-10', fim: '2026-09-30', pico: '2026-09-18', fontes: ['Vitor'],
    desc: 'Kit padrão da franqueadora (vídeo do coordenador, depoimento de egresso, peça de turma confirmada). Turma inicia em 18/09; publicação por unidade.' },

  { id: 'outrosa', nome: 'Outubro Rosa', tipo: 'conscientizacao',
    inicio: '2026-10-06', fim: '2026-10-26', pico: '2026-10-19', fontes: ['Vitor'],
    desc: 'Matéria de abertura, ação física nas unidades vestindo rosa (14/10) e pico institucional no Dia Mundial de Combate ao Câncer de Mama (19/10).' },

  { id: 'novazul', nome: 'Novembro Azul', tipo: 'conscientizacao',
    inicio: '2026-11-05', fim: '2026-11-24', pico: '2026-11-17', fontes: ['Vitor'],
    desc: 'Mesmo modelo das campanhas de conscientização, com pico no Dia Mundial de Combate ao Câncer de Próstata (17/11).' },
  { id: 'black-friday', nome: 'Black Friday', tipo: 'comercial',
    inicio: '2026-11-23', fim: '2026-11-30', pico: '2026-11-27', fontes: ['PDF', 'Vitor'],
    desc: 'Kits criativos + mídia + canais. Teaser em 23/11, pico na Black Friday (27/11) e última chamada na Cyber Monday (30/11).',
    validar: 'O plano trata a Black Friday como campanha de novembro; o calendário do Vitor concentra de 23 a 30/11. O pacote-base do Neto fica em rascunho até 25/10.' },

  { id: 'virada', nome: 'Virada Inspirar', tipo: 'campanha',
    inicio: '2026-12-01', fim: '2026-12-31', fontes: ['PDF'],
    desc: 'Conteúdo + ativação de virada de ano.',
    validar: 'O plano coloca a Virada em dezembro com “possível início 30 Anos”. A planilha da Vanessa e o calendário do Vitor já iniciam os 30 Anos em 08/12.' },
  { id: '30anos', nome: 'Inspirar Day — 30 Anos', tipo: 'institucional',
    inicio: '2026-12-08', fim: '2027-02-28', preparo: '2026-11-16', pico: '2027-01-27', fontes: ['PDF', 'Vanessa', 'Vitor', 'Briefings'],
    desc: 'Vídeo-mãe, programação, mídia e UGC. Pré-campanha em 16/11/2026; retrospectiva “30 anos em números” em 08/12; captação de depoimentos em 14/12; peça de fechamento do ano em 22/12; go-live do Igor em 27/01/2027.',
    validar: 'O plano (PDF) coloca os 30 Anos em jan–fev/2027. Vanessa e Vitor começam em 08/12/2026.' },

  { id: 'chega-saudade', nome: 'Chega de Saudade (50%) + Ligas Acadêmicas', tipo: 'comercial',
    inicio: '2027-03-01', fim: '2027-03-31', fontes: ['Vanessa'],
    desc: 'Campanha promocional (50% de desconto) somada à ativação das Ligas Acadêmicas.' },
  { id: 'selecao-pg', nome: 'Seleção de Pós-Graduação', tipo: 'comercial',
    inicio: '2027-04-01', fim: '2027-04-30', mes: true, fontes: ['Vanessa'],
    desc: 'Campanha comercial de seleção para pós-graduação.',
    validar: 'A planilha traz pré-campanha 16/09, início 01/10 e fim 15/10/2027 — datas iguais às de outras campanhas e que não batem com abril. Usando abril até confirmar.' },
  { id: 'semipresencial27', nome: 'Semipresencial', tipo: 'comercial',
    inicio: '2027-05-01', fim: '2027-05-31', mes: true, fontes: ['Vanessa'],
    desc: 'Campanha de relacionamento / indicação para o formato semipresencial.',
    validar: 'Mesma repetição de datas da planilha (01/10–15/10/2027), que não batem com maio.' },
  { id: 'vendas-amizade', nome: 'Vendas / Amizade que Inspira', tipo: 'comercial',
    inicio: '2027-06-01', fim: '2027-07-31', mes: true, fontes: ['Vanessa'],
    desc: 'Campanha comercial de plataforma / indicação entre alunos.',
    validar: 'A planilha traz 17/10 (pré), 01/11 e 15/11/2027 — as mesmas datas de Amo Fisio e FisioWeek. Usando junho/julho.' },
  { id: 'amo-fisio', nome: 'Amo Fisio', tipo: 'comercial',
    inicio: '2027-08-01', fim: '2027-08-31', mes: true, fontes: ['Vanessa'],
    desc: 'Campanha comercial ligada à identidade da Fisioterapia.',
    validar: 'Datas repetidas na planilha (01/11–15/11/2027). Usando agosto.' },
  { id: 'fisioweek', nome: 'FisioWeek Inspirar', tipo: 'evento',
    inicio: '2027-09-01', fim: '2027-09-30', mes: true, fontes: ['Vanessa'],
    desc: 'Campanha temática de Fisioterapia.',
    validar: 'A temática mensal sugere FisioWeek junto do Mês do Movimento (novembro). Confirmar se fica em setembro.' },
  { id: 'out27-vazio', nome: 'Sem campanha cadastrada', tipo: 'pendente',
    inicio: '2027-10-01', fim: '2027-10-31', mes: true, fontes: ['Vanessa'], pendente: true,
    desc: 'A planilha da Vanessa não traz campanha para outubro/2027.',
    validar: 'Definir a campanha de outubro/2027.' },
  { id: 'black-friday-27', nome: 'Black Friday 2027', tipo: 'comercial',
    inicio: '2027-11-01', fim: '2027-11-15', preparo: '2027-10-17', fontes: ['Vanessa'],
    desc: 'Campanha comercial de Black Friday — única de 2027 com datas coerentes com o mês na planilha.' },
  { id: '30anos-fech', nome: 'Inspirar Day — 30 Anos (encerramento)', tipo: 'institucional',
    inicio: '2027-12-01', fim: '2027-12-15', fontes: ['Vanessa'],
    desc: 'Encerramento da celebração de 30 anos, fechando o ciclo aberto em dezembro/2026.' }
];

var TIPOS_CAMPANHA = {
  campanha:        { label: 'Campanha do plano',  cor: 'var(--t-campanha)' },
  comercial:       { label: 'Comercial',          cor: 'var(--t-comercial)' },
  institucional:   { label: 'Institucional',      cor: 'var(--t-institucional)' },
  conscientizacao: { label: 'Conscientização',    cor: 'var(--t-conscientizacao)' },
  evento:          { label: 'Evento',             cor: 'var(--t-evento)' },
  foco:            { label: 'Foco do mês',        cor: 'var(--t-foco)' },
  pendente:        { label: 'Pendente',           cor: 'var(--t-pendente)' }
};
