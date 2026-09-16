/* =========================================================================
   INICIATIVAS DO PLANEJAMENTO ESTRATÉGICO — Marketing
   Fonte única: plataforma "Planejamento Estratégico Inspirar" enviada pelo Vitor (set/2026).
   #05 transcrita da página salva (texto e comentários completos); #06–#09 transcritas dos prints.
   Nada foi inventado: campos vazios na fonte continuam vazios.
   ========================================================================= */
var INICIATIVAS = [
  {
    num: '05',
    titulo: 'Dashboard Funil Completo em Tempo Real via Supabase (Cultura Vendedora)',
    onda: 1, area: 'Comercial · Marketing', prioridade: 'alta',
    responsavel: 'Philipe e Bruno',
    status: 'em-andamento', statusModo: 'manual', statusSugerido: 'nao-iniciado',
    objetivo: 'Toda a informação operacional da Inspirar é centralizada no Supabase: Meta Ads, Google Ads, TikTok Ads, YouTube Ads, Rubeus (CRM), Unimestre (acadêmico), financeiro. O Supabase alimenta o Dashboard em forma de funil real-time 24h/dia visível para 100% da Inspirar. Topo: Turmas Lançadas por Curso × Região × Unidade × Canal. Abaixo: funil completo de Impressões até NPS pós-formação. Segurança de informação e dados é demanda crítica desta iniciativa: contas individuais por pessoa, log de auditoria, e plano de backup das máquinas Inspirar. Todos são vendedores ou ajudam a vender.',
    etapas: [
      { titulo: 'Definir arquitetura: Supabase como hub central de dados',
        comentario: 'Totalmente de acordo. Nosso egress irá aumentar consideravelmente. O gratuito não é possibilidade faz tempo. Hoje em dia estamos com o pago, e está no meu cartão. Coloquei lá numa emergência, quando tudo caiu pois passamos da quota há uns dois meses mais ou menos. Gostaria muito de passar para a Inspirar o quanto antes.',
        itens: [
          { t: 'Supabase recebe dados de Meta Ads (API)' },
          { t: 'Supabase recebe dados de Google Ads (API)' },
          { t: 'Supabase recebe dados de TikTok Ads (API)' },
          { t: 'Supabase recebe dados de YouTube Ads (API)' },
          { t: 'Supabase recebe dados do Rubeus (CRM)' },
          { t: 'Supabase recebe dados do Unimestre (acadêmico)' },
          { t: 'Supabase recebe dados financeiros' },
          { t: 'Supabase alimenta o Dashboard em formato de funil' }
        ] },
      { titulo: 'Segurança de informação e dados (DEMANDA FORTE)',
        comentario: 'Aqui vale MUITO incluir centralização de informações. Sem mais projetos em Vercel, GitHubs, Supabases e Lovables particulares.',
        itens: [
          { t: 'Uma conta individual por pessoa em todos os sistemas (Supabase, Rubeus, Unimestre, Meta Business, Google Ads, TikTok, YouTube)' },
          { t: 'Log de auditoria de acessos e alterações em todas as plataformas' },
          { t: 'Política de senhas fortes e autenticação em 2 fatores obrigatória' },
          { t: 'Plano de backup das máquinas Inspirar (frequência, locais, restauração testada)' },
          { t: 'Política de saída: revogação imediata de acessos quando alguém deixa a empresa' },
          { t: 'LGPD compliance integrado à política de segurança' }
        ] },
      { titulo: 'Modelar funil completo no Supabase com identidade única por lead/aluno',
        itens: [
          { t: 'Schema unificado de dados' },
          { t: 'Identidade única cruzando Meta, TikTok, YouTube, CRM e Unimestre',
            c: 'Nosso maior desafio aqui será definir key única por usuário. CPF e/ou RA seriam o go-to lógico, mas não captamos essas informações de *leads*. Isso só funciona depois que a pessoa se matricula. Antes disso, é um desafio que teremos que encontrar uma solução.' },
          { t: 'Pipelines automáticos com refresh contínuo' },
          { t: 'Política de governança e acesso por papel' }
        ] },
      { titulo: 'Desenvolver dashboard com funil visual completo',
        itens: [
          { t: 'Topo: Turmas Lançadas por Curso × Região × Unidade × Canal' },
          { t: 'Impressões → Leads (CPL por canal/curso/unidade) — observação: número de leads atendidos pela IA.SDR deve bater com número de leads do Meta/Google/TikTok/YouTube' },
          { t: 'SQL/MQL: mostra a efetividade da parametrização das campanhas (qualificação real do que entra no funil)',
            c: 'Fundamental ter esses indicadores MUITO bem definidos com ficha técnica.' },
          { t: 'Closer: propostas enviadas, conversão, tempo de fechamento' },
          { t: 'Vendas: CPV, negócio gerado (LTV), ticket médio mensal ou de primeira mensalidade ou por plano de pagamento',
            c: 'Ticket por primeira parcela tem pequena margem de erro pela maneira que é calculado em BI atualmente. Não é nada muito relevante, mas pode distorcer especialmente quando afunilamos muito.' },
          { t: 'Venda → Aluno: taxa de inscrição paga, primeira mensalidade paga, primeira aula assistida, contrato assinado',
            c: 'Discordo muito. Faz sentido para o negócio considerarmos primeira aula assistida como critério de venda sim, mas a partir do momento que assumimos isso, não podemos usar essa definição de *venda* para mensurar efetividade da equipe comercial, muito menos de vendedor, pois primeira aula assistida é algo sobre o qual eles não têm controle. Sim, podem trabalhar para confirmação de turma, mas há inúmeros fatores que podem impedir que essa primeira aula aconteça, muitos dos quais fogem do controle do vendedor. Além disso, considerar que venda só ocorre quando aluno assiste aula distorceria lead time e muito. Podemos sim usar esse indicador, mas não podemos chamar de *venda*. Não é a mesma *venda* que irá mensurar efetividade de vendedor, de SDR, etc.' },
          { t: 'Churn: taxa de perda por etapa e por curso' },
          { t: 'Formados + NPS por turma/unidade/curso' }
        ] },
      { titulo: 'Painel de MKT integrado: CPV, CPL, CAC por canal, unidade e curso',
        comentario: 'Faz sentido, desde que haja um tracking absurdo de lead que entra por mais de um canal.',
        itens: [
          { t: 'Visão por Meta, Google, TikTok, YouTube, orgânico, eventos, indicação' },
          { t: 'Comparativo entre canais em tempo real' },
          { t: 'Alerta de desvio automático' }
        ] },
      { titulo: 'Diagnóstico de perda por etapa do funil',
        comentario: 'Concordo, mas creio que aqui é necessário primeiro desenvolver essa mensuração, descobrir quais são os diagnósticos para então definir planos de ação. Periodicidade de revisão de planos de ação também só faz sentido uma vez que saibamos quais são esses diagnósticos.',
        itens: [
          { t: 'Cada etapa de perda deve ter diagnóstico documentado (por que estamos perdendo aqui?)' },
          { t: 'Cada diagnóstico tem plano de ação atrelado' },
          { t: 'Revisão semanal dos diagnósticos e ações' },
          { t: 'Responsável claro por cada etapa do funil' }
        ] },
      { titulo: 'Espalhar pela operação: visível 24h/dia para todos',
        itens: [
          { t: 'TVs em todas as franquias' },
          { t: 'App mobile para gestores' },
          { t: 'Acesso web para todos os colaboradores' },
          { t: 'Ritual diário de 5min de revisão na liderança' }
        ] },
      { titulo: "Treinar cultura 'todos vendem' usando dashboard",
        itens: [
          { t: 'Workshop em todas as ops' },
          { t: 'Metas semanais visíveis no dash' },
          { t: 'Reconhecimento público de performance' },
          { t: 'Faturamento por dia com meta visível o tempo todo' }
        ] }
    ],
    indicadores: [
      { nome: 'Latência da atualização', meta: '≤ 15 minutos' },
      { nome: 'Taxa de adesão dos franqueados (todos veem)', meta: '100% — semanal no mínimo' },
      { nome: 'Reuniões com dados (não opinião)', meta: '100%' },
      { nome: 'Taxa de perda mapeada por etapa do funil', meta: '100% visível, com diagnóstico e plano de ação por etapa' },
      { nome: 'Disponibilidade do dash', meta: '24/7 sem queda' },
      { nome: '% contas individuais ativas (sem login compartilhado)', meta: '100%' },
      { nome: '% máquinas com plano de backup ativo e testado', meta: '100%' }
    ],
    risco: 'Integrações com APIs externas (Meta, Google, TikTok, YouTube) instáveis ou com limite de chamadas; Supabase como single point of failure; dashboard lindo mas ninguém usa; vazamento de dados por login compartilhado ou backup ausente.',
    mitigacao: 'Cache local para resiliência a falhas de API; redundância no Supabase com backup; cerimônia diária obrigatória de 5min na liderança; construção faseada do funil; segurança de informação tratada como demanda forte desde o dia 0 (contas individuais, 2FA, backup, log de auditoria).',
    dependencias: 'Supabase configurado como hub central; APIs estáveis: Meta, Google, TikTok, YouTube, Rubeus, Unimestre; IA SDR (#1) rodando para alimentar etapa de qualificação; Projeto Terminus (#22) com Supabase central'
  },
  {
    num: '09',
    titulo: 'Captação Diversificada e Inbound: Sair da Dependência de Meta',
    onda: 1, area: 'Marketing', prioridade: 'alta',
    responsavel: 'Bruno e Vanessa',
    status: 'em-andamento', statusModo: 'manual', statusSugerido: 'nao-iniciado',
    objetivo: 'Melhorar a captação de leads e a comunicação por canais além do Meta (hoje 90% dos leads). Não mudar logo, tipografia, cores ou Languagebook (já existe). Foco: forte estratégia de inbound, uso de notícias de saúde para gerar cursos e captar leads, comunicação multicanal e diversificação de origens de aquisição.',
    etapas: [
      { titulo: 'Estratégia de Inbound Marketing como pilar de aquisição',
        itens: [
          { t: 'Central de conteúdo (artigos, e-books, calculadoras, quizzes) integrada com IA Editorial (#7)' },
          { t: "Lead magnets por especialidade (ex: 'Guia do Fisioterapeuta Pélvico', 'Checklist do Biomédico')" },
          { t: 'Funil de nutrição com 6 toques por especialidade' },
          { t: 'Captura via formulário em todo conteúdo orgânico' }
        ] },
      { titulo: 'Usar notícias de saúde no Brasil e mundo para gerar cursos e captar leads',
        itens: [
          { t: 'Monitoramento contínuo de tendências de saúde (PubMed, NEJM, novidades de regulação)' },
          { t: 'IA Editorial (#7) transforma notícias em conteúdo Inspirar' },
          { t: 'Identificar oportunidades de cursos a partir de demandas emergentes do mercado' },
          { t: 'Lead magnets sobre temas em alta (ex: nova diretriz X = curso intensivo Y)' }
        ] },
      { titulo: 'Diversificação de canais de aquisição',
        itens: [
          { t: 'TikTok: conteúdo educacional curto (dicas clínicas, bastidores de aula, depoimentos)' },
          { t: 'YouTube: conteúdo profundo (aulas abertas, entrevistas com coordenadores, mini-documentários)' },
          { t: 'LinkedIn: autoridade profissional + employer branding' },
          { t: 'SEO/orgânico: central de conteúdo + blog otimizado', c: 'Conta liberada' },
          { t: 'Indicação remunerada: programa formal de indicação de alunos' },
          { t: 'Parcerias institucionais: CREFITOs, CRBm, CRF, CRP, COREN, sindicatos' }
        ] },
      { titulo: 'Estratégias de redes sociais além de Meta',
        itens: [
          { t: 'TikTok Inspirar: 3-5 vídeos/semana' },
          { t: 'Reels Instagram com coordenadores e alunos (prova social)' },
          { t: 'Podcast Inspirar: entrevistas semanais com profissionais de saúde referência' },
          { t: 'Pinterest: infográficos educacionais por especialidade' }
        ] },
      { titulo: 'Mensuração de atribuição multicanal',
        itens: [
          { t: 'Dashboard de origem de leads por canal (Meta, TikTok, orgânico, indicação, inbound)' },
          { t: 'Meta de redução de dependência Meta: 90% → 60% em 12 meses' },
          { t: 'CAC por canal para priorização de investimento' }
        ] }
    ],
    indicadores: [
      { nome: '% leads vindos de Meta', meta: '90% → 60%', semaforo: 'verde' },
      { nome: 'Canais com ≥ 10% dos leads', meta: '≥ 3 canais' },
      { nome: 'Leads orgânicos/mês', meta: '0 → 2.000/mês em 12 meses' },
      { nome: 'Tráfego orgânico site', meta: '+300% em 12 meses' },
      { nome: 'Lead magnets ativos', meta: '≥ 18 (3 por especialidade)' }
    ],
    risco: 'Diversificação de canais queima budget sem retorno nos primeiros meses; inbound demora a maturar (6-12 meses até primeiros frutos).',
    mitigacao: 'Testes pequenos por canal com budget limitado antes de escalar; mensuração rigorosa de CAC por canal; manter Meta como base enquanto outros canais maturam; foco em SEO de longo prazo como compounding asset.',
    dependencias: 'IA Editorial (#7) operacional; Maquina de Performance (#2) ativa'
  },
  {
    num: '06',
    titulo: 'IA de Criação de Peças e Carrosséis por Unidade/Curso',
    onda: 2, area: 'Marketing', prioridade: 'alta',
    responsavel: 'Bruno Fuzetto',
    status: 'nao-iniciado', statusModo: 'automatico', statusSugerido: 'nao-iniciado',
    objetivo: 'IA gera automaticamente artes estáticas E carrosséis para cada unidade considerando professores, coordenadores e diferenciais locais — escalando produção sem escalar equipe de design proporcional.',
    etapas: [
      { titulo: 'Construir banco de assets de marca (templates, fotos, logos)',
        itens: [ { t: 'Brand House aplicada' }, { t: 'Templates por modalidade (estático, carrossel, vídeo curto)' }, { t: 'Biblioteca de fotos de coordenadores' } ] },
      { titulo: 'Treinar IA com peças que performaram em 2024-2026',
        itens: [ { t: 'Análise de CTR por criativo (estático vs carrossel)' }, { t: 'Padrões visuais que convertem' }, { t: 'Tom de voz da marca' }, { t: 'Estrutura narrativa de carrosséis que retêm atenção' } ] },
      { titulo: 'Pipeline de geração: input (curso+unidade) → output (variações)',
        itens: [ { t: 'Artes estáticas: 10 variações por curso/unidade' }, { t: 'Carrosséis: 5 estruturas narrativas (problema-solução, depoimento, números, comparativo, jornada do aluno)' }, { t: 'Prompt engineering para cada formato' }, { t: 'Validação automática de marca' }, { t: 'Aprovação rápida humana' } ] },
      { titulo: 'Integração com Meta Ads + Google + redes sociais',
        itens: [ { t: 'Upload automático' }, { t: 'A/B test embutido (estático vs carrossel)' }, { t: 'Métricas de retorno por formato' } ] }
    ],
    indicadores: [
      { nome: 'Tempo de criação por peça', meta: '8h → 15min' },
      { nome: 'Peças geradas/mês (artes + carrosséis)', meta: '1.500+' },
      { nome: 'CTR médio dos criativos IA', meta: '≥ CTR humano' },
      { nome: 'Engajamento de carrosséis vs estáticos', meta: 'Mensurado e otimizado' }
    ],
    risco: 'Peças genéricas sem alma de marca; problemas legais com imagens de coordenadores sem autorização; carrosséis com estrutura narrativa pobre não engajam.',
    mitigacao: 'Validação humana obrigatória pré-publicação; contratos atualizados com cessão de imagem (#30); revisão trimestral da identidade gerada; teste A/B contínuo entre estruturas de carrossel.',
    dependencias: 'Marca fortalecida (#8); Catálogo de coordenadores fotos; Templates da Brand House'
  },
  {
    num: '07',
    titulo: 'IA de Performance de Tráfego Pago',
    onda: 2, area: 'Marketing', prioridade: 'alta',
    responsavel: 'Bruno Fuzetto',
    status: 'nao-iniciado', statusModo: 'automatico', statusSugerido: 'nao-iniciado',
    objetivo: 'IA monitora performance de tráfego pago em tempo real, alertando campanhas e cursos com performance baixa/alta para ação imediata.',
    etapas: [
      { titulo: 'Conectar APIs Meta Ads + Google Ads + TikTok + LinkedIn',
        itens: [ { t: 'OAuth e tokens' }, { t: 'Pipeline de dados' }, { t: 'Refresh a cada 1h' } ] },
      { titulo: 'Definir thresholds de alerta por curso/unidade',
        itens: [ { t: 'CPL ideal por curso' }, { t: 'CTR mínimo' }, { t: 'Frequência máxima' } ] },
      { titulo: 'Sistema de alertas via Slack/WhatsApp para time de tráfego',
        itens: [ { t: 'Alerta amarelo (atenção)' }, { t: 'Alerta vermelho (ação 24h)' }, { t: 'Daily digest matinal' } ] },
      { titulo: 'IA sugere otimizações: pausar, escalar, redistribuir budget',
        itens: [ { t: 'Recomendações automáticas' }, { t: 'Aprovação humana 1-clique' }, { t: 'Log de decisões' } ] }
    ],
    indicadores: [
      { nome: 'CPL médio rede', meta: 'R$18 → R$12', realizado: 'R$ 15', automatico: true },
      { nome: 'ROAS médio', meta: '≥ 5x' },
      { nome: 'Tempo até ação em campanha ruim', meta: '≤ 4h' }
    ],
    risco: 'Alertas em excesso causam fadiga e são ignorados.',
    mitigacao: 'Calibração rigorosa de thresholds; só alertar quando ação é necessária; bundle de alertas em digest matinal.',
    dependencias: 'Dashboard real-time (#4); Estrutura de campanhas padronizada'
  },
  {
    num: '08',
    titulo: 'IA Editorial: Central de Autoridade em Saúde',
    onda: 2, area: 'Marketing', prioridade: 'media',
    responsavel: 'Bruno Fuzetto e Leandro',
    status: 'nao-iniciado', statusModo: 'automatico', statusSugerido: 'nao-iniciado',
    objetivo: "IA cria copys e 'reportagens' sobre principais acontecimentos de saúde no Brasil e mundo, alimentando portal e redes sociais. Posicionar Inspirar como central de autoridade nível Brasil.",
    etapas: [
      { titulo: 'Definir editoria: 6 verticais (fisio, bio, farma, psico, TO, fono)',
        itens: [ { t: 'Comitê editorial com coordenadores' }, { t: 'Linha editorial documentada' }, { t: 'Padrão científico' } ] },
      { titulo: 'Pipeline IA: scraping de fontes confiáveis + síntese editorial',
        itens: [ { t: 'Fontes: PubMed, NEJM, BJORL, SciELO' }, { t: 'IA gera 1ª versão' }, { t: 'Revisão por coordenador' } ] },
      { titulo: 'Publicação multicanal automatizada',
        itens: [ { t: 'Portal Inspirar' }, { t: 'Instagram' }, { t: 'LinkedIn' }, { t: 'Newsletter semanal' } ] },
      { titulo: 'SEO orgânico de longo prazo',
        itens: [ { t: 'Palavras-chave por área' }, { t: 'Backlinks de coordenadores' }, { t: 'Conteúdo evergreen' } ] }
    ],
    indicadores: [
      { nome: 'Tráfego orgânico mensal', meta: '0 → 200k visitas/mês em 18 meses' },
      { nome: 'Conteúdos publicados/semana', meta: '≥ 15' },
      { nome: 'Citações em outras mídias', meta: '≥ 30/mês' }
    ],
    risco: 'Conteúdo IA com imprecisões científicas; saúde é área sensível.',
    mitigacao: "Revisão obrigatória por coordenador da área antes de publicar; disclaimer 'revisado por especialista'; correção pública rápida em caso de erro.",
    dependencias: 'Brand redesign (#8); Novo site (#22); Equipe editorial mínima'
  }
];
