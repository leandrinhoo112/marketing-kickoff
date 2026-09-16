/* =========================================================================
   ENTREGAS POR PESSOA
   Fontes: Plano_Marketing_Macro_Objetivos_e_Entregas.pdf (checklist do setor e equipe)
           + Briefings individuais (set/2026). Texto das entregas transcrito sem alteração.
   `campanha` e `iniciativa` são RELAÇÕES SUGERIDAS no cruzamento com a plataforma do Vitor
   (não constam nos briefings) — a interface sempre sinaliza isso.
   ========================================================================= */
var PESSOAS = [
  { id: 'bruno', nome: 'Bruno Fuzetto', squad: 'Liderança', cargo: 'Liderança · transita entre os squads',
    janela: null, janelaTexto: 'Contínuo · semestre set/2026–fev/2027', fonte: 'Briefing individual',
    lideranca: true, entregas: [
      { t: 'Meta de redução de dependência do Meta: 90% → 60% em 12 meses', iniciativa: '09' },
      { t: 'Programa formal de indicação remunerada de alunos', iniciativa: '09' },
      { t: 'Treinar a IA com peças que performaram em 2024–2026 (CTR por criativo, tom de voz da marca)', iniciativa: '06' },
      { t: 'Estruturar pipeline de geração: 10 variações de arte estática por curso/unidade', iniciativa: '06' },
      { t: 'Integração com Meta Ads + Google Ads (upload automático, teste A/B, métricas de retorno)', iniciativa: '06' },
      { t: 'Definir editoria: comitê editorial, linha editorial documentada, padrão científico', iniciativa: '08' },
      { t: 'SEO orgânico de longo prazo (palavras-chave, backlinks, conteúdo evergreen)', iniciativa: '08' },
      { t: 'Conectar APIs de tráfego pago (Meta, Google, TikTok, LinkedIn) e estruturar pipeline de dados', iniciativa: '07' },
      { t: 'Definir thresholds de alerta por curso/unidade (CPL, CTR, frequência)', iniciativa: '07' },
      { t: 'Montar sistema de alertas via Slack/WhatsApp para o time de tráfego', iniciativa: '07' },
      { t: 'Desenhar lógica de otimização automática (pausar, escalar, redistribuir budget) com aprovação humana', iniciativa: '07' }
    ] },
  { id: 'vanessa', nome: 'Vanessa', squad: 'Liderança', cargo: 'Liderança · transita entre os squads',
    janela: null, janelaTexto: 'Contínuo · semestre set/2026–fev/2027', fonte: 'Briefing individual',
    lideranca: true, entregas: [
      { t: 'Fechar parcerias institucionais: CREFITOs, CRBm, CRF, CRP, COREN, sindicatos', iniciativa: '09' },
      { t: 'Programa formal de indicação remunerada de alunos', iniciativa: '09' }
    ] },

  { id: 'joao', nome: 'João', squad: 'Branding', cargo: 'Designer Gráfico',
    janela: { inicio: '2026-09-17', fim: '2026-09-28' }, janelaTexto: '17 a 28 de setembro de 2026', fonte: 'Briefing individual',
    entregas: [
      { t: 'Criar calendário editorial integrado de todos os canais', iniciativa: '09' },
      { t: 'Criar templates de peças para todos os canais', iniciativa: '09' },
      { t: 'Criar peças de conteúdo para Pinterest e TikTok (≥ 20)', iniciativa: '09' },
      { t: '🔴 URGENTE — Revisar e organizar Brand House — templates por modalidade', iniciativa: '06' },
      { t: '🔴 URGENTE — Fotografar/coletar fotos de todos os coordenadores ativos', iniciativa: '06' },
      { t: 'Criar biblioteca de logos por unidade em repositório único', iniciativa: '06' },
      { t: 'Documentar guidelines de uso de marca', iniciativa: '06' },
      { t: 'Documentar padrões visuais dos criativos top performers', iniciativa: '06' },
      { t: 'Criar prompt engineering para os 5 tipos de carrossel da IA', iniciativa: '06' },
      { t: 'Validar taxa de aprovação automática de marca ≥ 90%', iniciativa: '06' }
    ] },

  { id: 'mari', nome: 'Mari', squad: 'Branding', cargo: 'Branding / Conteúdo de valor',
    janela: { inicio: '2026-09-28', fim: '2026-10-14' }, janelaTexto: '28 de setembro a 14 de outubro de 2026', fonte: 'Briefing individual',
    entregas: [
      { t: 'Produzir 3 vídeos/semana para o TikTok Inspirar', iniciativa: '09' },
      { t: 'Produzir Reels de prova social 3x/semana no Instagram', iniciativa: '09' },
      { t: 'Fazer curadoria de alunos-modelo para as histórias da home do site', iniciativa: '09' },
      { t: 'Produzir infográficos para Pinterest e pesquisar posicionamento da Inspirar na plataforma', iniciativa: '09' },
      { t: 'Produzir lead magnets e e-books por especialidade', iniciativa: '09' },
      { t: 'Apoiar na organização e produção do banco de assets de marca', iniciativa: '06' },
      { t: 'Produzir templates de carrossel para o pipeline de IA', iniciativa: '06' },
      { t: 'Apoiar validação das peças geradas pelo pipeline de IA', iniciativa: '06' },
      { t: 'Monitorar notícias de saúde e identificar pautas para o blog', iniciativa: '08' },
      { t: 'Produzir conteúdo editorial para o blog por especialidade', iniciativa: '08' },
      { t: 'Criar quizzes e calculadoras interativas para captação de leads', iniciativa: '09' }
    ] },

  { id: 'neto', nome: 'Edson Neto', squad: 'Branding', cargo: 'Designer Gráfico · LPs & automação leve',
    janela: { inicio: '2026-10-17', fim: '2026-10-25' }, janelaTexto: '17 a 25 de outubro de 2026', fonte: 'Briefing individual',
    entregas: [
      { t: 'LP(s) IT publicáveis: hierarquia, formulário/CTA, SEO on-page, preview mobile.', iniciativa: '09' },
      { t: 'Kit de artes cursos/eventos (feed, stories, banner LP) — 1 família completa.' },
      { t: 'Componentes/templates reutilizáveis documentados para o squad.', iniciativa: '06' },
      { t: 'Script ou automação leve que reduza retrabalho (export batch, resize).', iniciativa: '06' },
      { t: 'QA visual vs. manual de marca + diretrizes anti-panfletagem.' },
      { t: 'Handoff Performance: UTMs, pixels/eventos e checklist de lead na LP.', iniciativa: '05' },
      { t: 'Pacote-base Black Friday (estrutura LP + 2–3 criativos-mãe) em rascunho.', campanha: 'black-friday' },
      { t: 'README curto do que foi entregue (paths, status, próximos donos).' }
    ] },

  { id: 'igor', nome: 'Igor Augusto', squad: 'Branding', cargo: 'Analista de Marketing / Social Media',
    janela: { inicio: '2027-01-27', fim: '2027-01-27' }, janelaTexto: '27 de janeiro de 2027', fonte: 'Briefing individual',
    entregas: [
      { t: '🔴 URGENTE — Criar e operar conta TikTok @inspirarposgraduacao', iniciativa: '09' },
      { t: 'Produzir vídeos para YouTube Inspirar Saúde', iniciativa: '09' },
      { t: 'Produzir Reels de prova social 3x/semana no Instagram', iniciativa: '09' },
      { t: "Gravar ≥ 8 episódios piloto do Podcast 'Saúde em Foco'", iniciativa: '09' },
      { t: 'Distribuição do Podcast: Spotify, Apple Podcasts, YouTube', iniciativa: '09' },
      { t: 'Produzir carrosséis educacionais para Instagram (5-7 slides)', iniciativa: '08' },
      { t: 'Configurar agendamento automático de posts sociais', iniciativa: '08' },
      { t: 'Colaborar na produção de conteúdo profundo para YouTube (aulas abertas, entrevistas, mini-documentários)', iniciativa: '09' }
    ] },

  { id: 'yasmim', nome: 'Yasmim', squad: 'Branding', cargo: 'Analista de Marketing / Social Media',
    janela: null, janelaTexto: 'Contínuo · semestre set/2026–fev/2027', fonte: 'Briefing individual',
    entregas: [
      { t: '🔴 URGENTE — Produzir conteúdo para a Central de Inbound por especialidade', iniciativa: '09' },
      { t: 'Produzir Reels de prova social 3x/semana no Instagram', iniciativa: '09' },
      { t: 'Apoiar publicações e agendamentos de conteúdo no Pinterest', iniciativa: '09' },
      { t: 'Executar calendário editorial integrado — todos os canais', iniciativa: '09' }
    ] },

  { id: 'jorge', nome: 'Jorge Luiz', squad: 'Performance', cargo: 'Analista de Performance',
    janela: null, janelaTexto: 'Contínuo · semestre set/2026–fev/2027', fonte: 'Briefing individual',
    entregas: [
      { t: 'Plano de mídia set–fev (orçamento, segmentos, calendário por campanha).', iniciativa: '07' },
      { t: 'Rotina de análise semanal (dashboard ou planilha) compartilhada.', iniciativa: '07' },
      { t: 'Agenda de reuniões com franqueados + atas/ações registradas.' },
      { t: 'Briefs de criativo e de e-mail/social para Black Friday e Virada.', campanha: 'black-friday' },
      { t: 'Checklist de qualidade de lead alinhado com Comercial (campos, SLA).', iniciativa: '05' },
      { t: 'Retrospectiva pós-Black Friday e pós-Virada com otimizações documentadas.', campanha: 'virada' },
      { t: 'Pacote 30 Anos (mídia + metas) desenhado até o início de jan/2027.', campanha: '30anos' },
      { t: 'Dashboard de origem de leads por canal + CAC por canal', iniciativa: '09' },
      { t: 'Funil de nutrição com 6 toques por especialidade', iniciativa: '09' }
    ] },

  { id: 'leandro', nome: 'Leandro Di Marco', squad: 'Performance', cargo: 'Performance · Canais / Ativação',
    janela: null, janelaTexto: 'Contínuo · semestre set/2026–fev/2027', fonte: 'Briefing individual',
    entregas: [
      { t: '🔴 URGENTE — Produzir artigos aprofundados para a Central de Conteúdo', iniciativa: '09' },
      { t: 'Produzir e publicar e-books e lead magnets por especialidade (3 por área)', iniciativa: '09' },
      { t: 'Criar e publicar conteúdo profissional no LinkedIn (3x/semana)', iniciativa: '09' },
      { t: 'Monitorar continuamente tendências de saúde no Brasil e no mundo (PubMed, NEJM)', iniciativa: '09' },
      { t: 'Colaborar na produção de conteúdo profundo para YouTube (aulas abertas, entrevistas, mini-documentários)', iniciativa: '09' },
      { t: "Criar e enviar newsletter semanal 'Saúde em Foco'", iniciativa: '08' },
      { t: 'Publicar posts profissionais no LinkedIn baseados no pipeline de IA', iniciativa: '08' },
      { t: 'Estruturar pipeline de fontes confiáveis (scraping + síntese editorial) com revisão por coordenador', iniciativa: '08' },
      { t: 'SEO orgânico de longo prazo (palavras-chave, backlinks, conteúdo evergreen)', iniciativa: '08' }
    ] },

  { id: 'luiz', nome: 'Luiz Carrazoni', squad: 'Performance', cargo: 'Performance · Criativo / Peças',
    janela: null, janelaTexto: 'Contínuo · semestre set/2026–fev/2027', fonte: 'Briefing individual',
    entregas: [
      { t: '🔴 URGENTE — Diagramar e-books e lead magnets por especialidade', iniciativa: '09' },
      { t: "Criar capas e assets visuais para o Podcast 'Saúde em Foco'", iniciativa: '09' },
      { t: 'Apoiar produção de peças para os novos canais (TikTok, YouTube, LinkedIn)', iniciativa: '09' },
      { t: '🔴 URGENTE — Co-liderar a construção do banco de assets de marca', iniciativa: '06' },
      { t: '🔴 URGENTE — Coletar fotos de todos os coordenadores ativos + cessão de imagem', iniciativa: '06' },
      { t: 'Organizar biblioteca de logos por unidade em repositório único', iniciativa: '06' },
      { t: 'Hospedar e manter repositório de assets atualizado', iniciativa: '06' }
    ] },

  { id: 'leo', nome: 'Leo', squad: 'Performance', cargo: 'Performance (função RACI a documentar)',
    janela: null, janelaTexto: 'Contínuo · semestre set/2026–fev/2027', fonte: 'Briefing individual',
    entregas: [
      { t: 'Alinhamento escrito do escopo (1 página) com Bruno/Vanessa — pendência RACI.' },
      { t: 'Participação ativa em pelo menos as 4 campanhas do semestre (IT → 30 Anos).' },
      { t: 'Apoio documentado a 1+ fluxo de e-mail e 1+ ativação social de campanha.' },
      { t: 'Checklist de apoio a evento offline (pré / durante / pós) aplicado 1x.' },
      { t: 'Registro de UTMs/CTAs das ações em que você atuou.' },
      { t: 'Feedback quinzenal curto ao squad (fez, bloqueios, próximos passos).' },
      { t: 'Rascunho de descrição de função para inclusão futura na RACI.' }
    ] }
];

/* Checklist macro do setor (PDF, seção 7) — responsabilidade da liderança (Bruno + Vanessa) */
var ENTREGAS_SETOR = [
  { t: 'Base visual e templates alinhados ao manual de marca (Branding).', iniciativa: '06' },
  { t: 'Calendário editorial do semestre (YouTube 1x/mês, LinkedIn 2x/sem, IG educacional).', iniciativa: '09' },
  { t: 'Campanha Black Friday (nov) — kits criativos + mídia + canais.', campanha: 'black-friday' },
  { t: 'Virada Inspirar (dez) — conteúdo + ativação.', campanha: 'virada' },
  { t: '30 Anos (jan–fev/2027) — vídeo-mãe, programação, mídia e UGC.', campanha: '30anos' },
  { t: 'Rastreio (UTMs, pixels, eventos) e handoff de leads ao Comercial.', iniciativa: '05' },
  { t: 'Cultura + processos: rituais de alinhamento Branding ↔ Performance.' },
  { t: 'Aprendizados documentados rumo a SaaS Performance / SaaS Criativos (2027).' }
];

/* Contexto do plano (PDF) exibido no Painel Geral */
var PLANO = {
  norte: 'Marketing focado no que gera resultado financeiro.',
  objetivos: [
    { nome: 'Branding', desc: 'Fortalecer a marca (Squad Branding).' },
    { nome: 'Performance', desc: 'Gerar leads qualificados para o Comercial (Squad Performance).' }
  ],
  pilares: ['YouTube — 1x por mês', 'LinkedIn — 2x por semana', 'Site novo', 'Instagram educacional', 'Cultura + processos'],
  diretrizes: [
    { nome: 'Furar a bolha', desc: 'Mostrar que falamos sobre todos os tipos de assuntos — ampliar o repertório além do óbvio da marca.' },
    { nome: 'Parar panfletagem', desc: 'Entregar conteúdo de valor e de consumo geral — útil, claro e compartilhável.' },
    { nome: 'Resultado', desc: 'Marca forte (Branding) + leads qualificados (Performance) = resultado financeiro.' }
  ]
};
