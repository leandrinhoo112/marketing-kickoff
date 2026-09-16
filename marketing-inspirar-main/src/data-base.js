/* Dados do calendário: planilha da Vanessa + calendário do Vitor. Nenhum dado inventado. */
var MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
var MONTH_NAMES_LC = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var DOW = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

/* ---- Temática do mês (planilha Vanessa, ciclo anual) ---- */
var MONTH_THEMES = {
  1:{title:'Mês da Saúde Mental e Bem-Estar', tags:['Saúde Mental','Psicologia','Psicanálise','Neurociência'], gancho:'Comece o ano cuidando de quem cuida de tudo: você.'},
  2:{title:'Mês da Estética e Dermatofuncional', tags:['Estética','Dermatofuncional','Cosmetologia','Procedimentos estéticos'], gancho:'Conhecimento para transformar autoestima em profissão.'},
  3:{title:'Mês da Saúde da Mulher', tags:['Saúde da Mulher','Fisioterapia Pélvica','Obstetrícia','Ginecologia'], gancho:'Cuidar da mulher em todas as fases da vida.'},
  4:{title:'Mês da Neuro', tags:['Neurologia','Fisioterapia Neurofuncional','Neurociência','Reabilitação neurológica'], gancho:'Entender o cérebro é transformar possibilidades.'},
  5:{title:'Mês da Fisioterapia Pélvica', tags:['Fisioterapia Pélvica','Saúde da Mulher','Saúde masculina','Obstetrícia','Disfunções do assoalho pélvico'], gancho:'Um mês para falar sobre uma área que transforma vidas — e carreiras.'},
  6:{title:'Mês da Ortopedia e Esportiva', tags:['Traumato-Ortopedia','Fisioterapia Esportiva','Reabilitação','Performance','Prevenção de lesões'], gancho:'Do movimento à performance: especialize-se para ir além.'},
  7:{title:'Mês da Terapia Intensiva', tags:['UTI','Fisioterapia Hospitalar','Emergência','Gestão em Saúde'], gancho:'Decisões que exigem conhecimento, preparo e precisão.'},
  8:{title:'Mês da Saúde', tags:['Campanha institucional guarda-chuva','Todas as áreas da saúde','Profissões','Especialização','Carreira'], gancho:'"Agosto, Mês da Saúde Inspirar."', nota:'Excelente mês para trabalhar o posicionamento da Faculdade como referência em formação na saúde.'},
  9:{title:'Mês da Estética', tags:['Estética Avançada','Dermatofuncional','Cosmetologia','Tecnologias','Congresso Internacional de Estética'], gancho:'Conhecimento, inovação e tendências que movimentam a estética.'},
  10:{title:'Mês da Dermatofuncional', tags:['Dermatofuncional','Estética','Pós-operatório','Reabilitação','Tecnologias estéticas'], gancho:'"Outubro é mês de transformar conhecimento em resultados."'},
  11:{title:'Mês do Movimento', tags:['Fisioterapia','Esportiva','Traumato-Ortopedia','Neuro','Performance','Reabilitação'], gancho:'"Movimento é saúde. Movimento é profissão."', nota:'Aqui entra muito bem a FisioWeek + Black Friday + Mês do Movimento.'},
  12:{title:'Mês da Evolução e das Conquistas', tags:['Carreira','Especialização','Retrospectiva','Alunos e egressos','Resultados','Inspirar Day / 30 anos'], gancho:'"Toda evolução começa com uma escolha."'}
};

/* ---- Aniversários das cidades (planilha Vanessa) ---- */
var CITY_ANNIV = [
  {m:1,d:12,city:'Belém/PA'},{m:1,d:25,city:'São Paulo/SP — Borba Gato e Vila Mariana'},{m:1,d:25,city:'Luanda/Angola — Dia da Cidade de Luanda'},{m:1,d:26,city:'Santos/SP'},
  {m:3,d:1,city:'Rio de Janeiro/RJ'},{m:3,d:9,city:'Joinville/SC'},{m:3,d:19,city:'São José do Rio Preto/SP'},{m:3,d:23,city:'Florianópolis/SC'},{m:3,d:26,city:'Porto Alegre/RS'},{m:3,d:29,city:'Curitiba/PR'},{m:3,d:29,city:'Salvador/BA'},
  {m:4,d:8,city:'Cuiabá/MT'},{m:4,d:8,city:'Santo André/SP'},{m:4,d:13,city:'Fortaleza/CE'},{m:4,d:21,city:'Brasília/DF'},{m:4,d:29,city:'Ipatinga/MG'},
  {m:5,d:10,city:'Parauapebas/PA'},
  {m:6,d:19,city:'Ribeirão Preto/SP'},
  {m:7,d:20,city:'Balneário Camboriú/SC'},{m:7,d:27,city:'São José dos Campos/SP'},
  {m:8,d:1,city:'Bauru/SP'},{m:8,d:15,city:'Sorocaba/SP'},{m:8,d:16,city:'Teresina/PI'},{m:8,d:26,city:'Campo Grande/MS'},{m:8,d:31,city:'Uberlândia/MG'},
  {m:9,d:2,city:'Blumenau/SC'},{m:9,d:8,city:'São Luís/MA'},{m:9,d:8,city:'Vitória/ES'},
  {m:10,d:2,city:'Porto Velho/RO'},{m:10,d:24,city:'Goiânia/GO'},
  {m:12,d:5,city:'Maceió/AL'},{m:12,d:8,city:'Guarulhos/SP'},{m:12,d:10,city:'Londrina/PR'},{m:12,d:12,city:'Belo Horizonte/MG'},{m:12,d:20,city:'Dourados/MS'}
];

/* ---- Datas fixas de saúde (planilha Vanessa) ---- */
var HEALTH_DATES = [
  {m:2,d:4,name:'Dia Mundial do Câncer'},
  {m:3,d:3,name:'Dia Mundial da Audição'},
  {m:3,d:4,name:'Dia Mundial da Obesidade'},
  {m:4,d:7,name:'Dia Mundial da Saúde'},
  {m:4,d:26,name:'Dia Nacional de Prevenção e Combate à Hipertensão'},
  {m:5,d:12,name:'Dia da Enfermagem'},
  {m:5,d:17,name:'Dia Mundial da Hipertensão'},
  {m:5,d:28,name:'Dia Internacional de Ação pela Saúde da Mulher'},
  {m:6,d:14,name:'Dia Mundial do Doador de Sangue'},
  {m:7,d:10,name:'Dia da Saúde Ocular'},
  {m:8,d:5,name:'Dia Nacional da Saúde'},
  {m:8,d:8,name:'Dia Nacional de Prevenção e Controle do Colesterol'},
  {m:8,d:29,name:'Dia Nacional de Combate ao Fumo'},
  {m:9,d:17,name:'Dia Mundial da Segurança do Paciente'},
  {m:9,d:19,name:'Aniversário do SUS'},
  {m:9,d:21,name:'Dia Mundial da Doença de Alzheimer'},
  {m:9,d:27,name:'Dia Nacional de Doação de Órgãos'},
  {m:10,d:10,name:'Dia Mundial da Saúde Mental'},
  {m:10,d:13,name:'Dia Mundial da Trombose'},
  {m:10,d:17,name:'Dia Nacional da Vacinação'},
  {m:10,d:20,name:'Dia Mundial e Nacional da Osteoporose'},
  {m:10,d:25,name:'Dia Nacional da Saúde Bucal'},
  {m:10,d:29,name:'Dia Mundial do AVC'},
  {m:11,d:14,name:'Dia Mundial do Diabetes'},
  {m:12,d:1,name:'Dia Mundial de Luta contra a AIDS'},
  {m:12,d:3,name:'Dia Internacional das Pessoas com Deficiência'},
  {m:12,d:9,name:'Dia do Fonoaudiólogo'},
  {m:12,d:27,name:'Dia Internacional de Preparação Epidemiológica'}
];

/* ---- Complemento (apêndice do calendário Vitor, set-dez/2026): datas de saúde/educação + feriados nacionais e regionais ---- */
var HEALTH_EXTRA = [
  {m:9,d:5,name:'Dia Nacional de Conscientização e Divulgação da Fibrose Cística'},
  {m:9,d:7,name:'Independência do Brasil (feriado nacional)'},
  {m:9,d:8,name:'Dia Mundial da Fisioterapia'},
  {m:9,d:10,name:'Dia Mundial de Prevenção ao Suicídio (pico Setembro Amarelo)'},
  {m:9,d:19,name:'Dia do Ortopedista'},
  {m:9,d:20,name:'Rio Grande do Sul — Dia do Gaúcho / Semana Farroupilha (feriado estadual)'},
  {m:9,d:29,name:'Dia Mundial do Coração'},
  {m:10,d:12,name:'Nossa Senhora Aparecida / Dia das Crianças (feriado nacional)'},
  {m:10,d:13,name:'Dia Nacional do Fisioterapeuta e do Terapeuta Ocupacional'},
  {m:10,d:15,name:'Dia do Professor'},
  {m:10,d:18,name:'Dia do Médico'},
  {m:10,d:19,name:'Dia Mundial de Combate ao Câncer de Mama (Outubro Rosa — pico)'},
  {m:10,d:27,name:'Dia Mundial da Terapia Ocupacional'},
  {m:10,d:30,name:'Dia Nacional de Luta contra o Reumatismo'},
  {m:11,d:2,name:'Finados (feriado nacional)'},
  {m:11,d:15,name:'Proclamação da República (feriado nacional)'},
  {m:11,d:17,name:'Dia Mundial de Combate ao Câncer de Próstata (Novembro Azul — pico)'},
  {m:11,d:20,name:'Dia Nacional de Zumbi e da Consciência Negra (feriado nacional)'},
  {m:12,d:21,name:'Dia do Atleta'},
  {m:12,d:25,name:'Natal (feriado nacional)'}
];
var HEALTH_EXTRA_REGIONAL = [
  {m:9,d:5,name:'Amazonas — feriado estadual, elevação à categoria de província'},
  {m:10,d:7,name:'Santa Catarina — início da Oktoberfest de Blumenau (07–25/10)'},
  {m:10,d:11,name:'Pará — Círio de Nazaré (Belém)'},
  {m:10,d:24,name:'Amazonas — aniversário de Manaus (feriado municipal)'},
  {m:12,d:8,name:'Pará e Amazonas — Nossa Senhora da Conceição (feriado municipal, Belém e Manaus)'}
];

/* ---- Aniversário das unidades: sem dados na origem ---- */
var UNIT_ANNIV = [];

/* ---- Detalhe dia-a-dia set–dez/2026 (fonte: calendario-mkt-inspirar-vitor.html) ---- */
var DAY_DETAILS_2026 = {"c1-cur": {"range": "03 setembro", "title": "Curadoria + conceito viral", "cls": "p1", "who": "Mariana Caron (Community Manager) + Leandro", "body": "Mariana faz a curadoria da notícia da semana para o Pilar News. Leandro define o ângulo viral e escreve o briefing de gravação para YouTube, TikTok, Instagram e LinkedIn a partir dela.", "cycle": "Ciclo 1"}, "c1-rot": {"range": "04 setembro", "title": "Roteiro (site + redes)", "cls": "p1", "who": "Igor", "body": "Igor transforma o briefing em roteiro para todas as redes sociais e para a matéria do site, com entrega prevista para a tarde de sexta.", "cycle": "Ciclo 1"}, "c1-ig": {"range": "05–06 setembro", "title": "Gravação Instagram/TikTok", "cls": "p1", "who": "Vitor Pezolato", "body": "Fim de semana de gravação para os formatos curtos (Reels/TikTok), com o Vitor no vídeo — founder-led growth, sempre em collab com o perfil pessoal dele.", "cycle": "Ciclo 1"}, "c1-yt": {"range": "14 setembro", "title": "Gravação YouTube — remanejada do feriado", "cls": "p1", "who": "Vitor (grava) · Leandro (capta) · Inspirar CWB", "body": "Estava marcada para 07/09, mas caiu no feriado da Independência. Remanejada para a segunda-feira seguinte (14/09).", "cycle": "Ciclo 1"}, "c1-pub": {"range": "22 setembro", "title": "Edição → Publicação (data ajustada)", "cls": "p1", "who": "João (capa) · Edson + João (YouTube) · Luiz (IG/TikTok) · Igor publica", "body": "Data remanejada em função do deslocamento da gravação de YouTube (14/09).", "cycle": "Ciclo 1"}, "c2-cur": {"range": "17 setembro", "title": "Curadoria + conceito viral", "cls": "p1", "who": "Mariana Caron + Leandro", "body": "Curadoria da notícia da semana e definição do ângulo viral / briefing de gravação para o segundo ciclo do Pilar News.", "cycle": "Ciclo 2"}, "c2-rot": {"range": "18 setembro", "title": "Roteiro (site + redes)", "cls": "p1", "who": "Igor", "body": "Roteiro para redes e site a partir do briefing do Leandro.", "cycle": "Ciclo 2"}, "c2-ig": {"range": "19–20 setembro", "title": "Gravação Instagram/TikTok", "cls": "p1", "who": "Vitor Pezolato", "body": "20/09 é feriado estadual no RS (Dia do Gaúcho); coincide com o Congresso de Estética em Curitiba (18–20/09).", "cycle": "Ciclo 2"}, "c2-yt": {"range": "21 setembro", "title": "Gravação YouTube", "cls": "p1", "who": "Vitor · Leandro · Inspirar CWB", "body": "Gravação do vídeo longo para YouTube, sem conflito de feriado neste ciclo.", "cycle": "Ciclo 2"}, "c2-pub": {"range": "29 setembro", "title": "Edição → Publicação", "cls": "p1", "who": "João / Edson / Luiz · Igor publica", "body": "Fecha o segundo (e último) ciclo do piloto de 30 dias do Pilar 1.", "cycle": "Ciclo 2"}, "c3-cur": {"range": "01 outubro", "title": "Curadoria + conceito viral", "cls": "p1", "who": "Mariana Caron + Leandro", "body": "Primeiro ciclo já pensado para publicar também em Redes (Pilar 2).", "cycle": "Ciclo 3"}, "c3-rot": {"range": "02 outubro", "title": "Roteiro (site + redes)", "cls": "p1", "who": "Igor", "body": "Roteiro para o site e, pela primeira vez, também para a versão adaptada de Redes.", "cycle": "Ciclo 3"}, "c3-ig": {"range": "03–04 outubro", "title": "Gravação Instagram/TikTok", "cls": "p1", "who": "Vitor Pezolato", "body": "Gravação padrão de fim de semana.", "cycle": "Ciclo 3"}, "c3-yt": {"range": "05 outubro", "title": "Gravação YouTube", "cls": "p1", "who": "Vitor · Leandro", "body": "Gravação do vídeo longo.", "cycle": "Ciclo 3"}, "c3-pub": {"range": "13 outubro", "title": "Edição → Publicação (site + Redes) 📌 Dia Nacional do Fisioterapeuta", "cls": "p2", "who": "João / Edson / Luiz · Igor publica", "body": "Publicação cai exatamente no Dia Nacional do Fisioterapeuta e do Terapeuta Ocupacional. Primeira publicação simultânea em Redes.", "cycle": "Ciclo 3"}, "c4-cur": {"range": "15 outubro", "title": "Curadoria + conceito 📌 Dia do Professor", "cls": "p1", "who": "Mariana Caron + Leandro", "body": "Dia do Professor é pauta institucional natural para o gancho deste ciclo.", "cycle": "Ciclo 4"}, "c4-rot": {"range": "16 outubro", "title": "Roteiro (site + redes)", "cls": "p1", "who": "Igor", "body": "Roteiro para site e Redes.", "cycle": "Ciclo 4"}, "c4-ig": {"range": "17–18 outubro", "title": "Gravação Instagram/TikTok", "cls": "p1", "who": "Vitor Pezolato", "body": "Gravação padrão de fim de semana.", "cycle": "Ciclo 4"}, "c4-yt": {"range": "19 outubro", "title": "Gravação YouTube", "cls": "p1", "who": "Vitor · Leandro", "body": "Gravação do vídeo longo.", "cycle": "Ciclo 4"}, "c4-pub": {"range": "27 outubro", "title": "Edição → Publicação 📌 Dia Mundial da Terapia Ocupacional", "cls": "p2", "who": "João / Edson / Luiz · Igor publica", "body": "Publicação coincide com o Dia Mundial da Terapia Ocupacional.", "cycle": "Ciclo 4"}, "c5-cur": {"range": "29 outubro", "title": "Curadoria + conceito viral", "cls": "p1", "who": "Mariana Caron + Leandro", "body": "Curadoria e briefing do quinto ciclo.", "cycle": "Ciclo 5"}, "c5-rot": {"range": "30 outubro", "title": "Roteiro (site + redes)", "cls": "p1", "who": "Igor", "body": "Roteiro para site e Redes.", "cycle": "Ciclo 5"}, "c5-ig": {"range": "31 outubro – 01 novembro", "title": "Gravação Instagram/TikTok", "cls": "p1", "who": "Vitor Pezolato", "body": "Gravação de fim de semana, virada de mês.", "cycle": "Ciclo 5"}, "c5-yt": {"range": "09 novembro", "title": "Gravação YouTube — remanejada do feriado", "cls": "p1", "who": "Vitor · Leandro", "body": "Estava marcada para 02/11, mas caiu em Finados. Remanejada para a segunda-feira seguinte.", "cycle": "Ciclo 5"}, "c5-pub": {"range": "17 novembro", "title": "Edição → Publicação (data ajustada) 📌 Novembro Azul", "cls": "p2", "who": "João / Edson / Luiz · Igor publica", "body": "Data remanejada em função do deslocamento da gravação (09/11). Coincide com o pico do Novembro Azul.", "cycle": "Ciclo 5"}, "c6-cur": {"range": "12 novembro", "title": "Curadoria + conceito viral", "cls": "p1", "who": "Mariana Caron + Leandro", "body": "Ciclo em que o Pilar 3 (YouTube) entra oficialmente.", "cycle": "Ciclo 6"}, "c6-rot": {"range": "13 novembro", "title": "Roteiro (site + redes + YouTube)", "cls": "p1", "who": "Igor", "body": "Roteiro completo para site, Redes e o vídeo longo de YouTube.", "cycle": "Ciclo 6"}, "c6-ig": {"range": "14 novembro", "title": "Gravação Instagram/TikTok (parte 1)", "cls": "p1", "who": "Vitor Pezolato", "body": "Sábado de gravação normal.", "cycle": "Ciclo 6"}, "c6-yt": {"range": "16 novembro", "title": "Gravação YouTube + parte 2 de Instagram/TikTok (remanejada do feriado)", "cls": "p3", "who": "Vitor · Leandro · Inspirar CWB", "body": "15/11 é feriado (Proclamação da República); sessão remanejada para esta segunda-feira.", "cycle": "Ciclo 6"}, "c6-pub": {"range": "24 novembro", "title": "Edição → Publicação nos 3 pilares", "cls": "p3", "who": "Time completo", "body": "Primeiro ciclo com os 3 pilares publicando juntos: site, Redes e YouTube.", "cycle": "Ciclo 6"}, "c7-cur": {"range": "26 novembro", "title": "Curadoria + conceito viral", "cls": "p1", "who": "Mariana Caron + Leandro", "body": "Curadoria e briefing do sétimo ciclo, já com os 3 pilares ativos.", "cycle": "Ciclo 7"}, "c7-rot": {"range": "27 novembro", "title": "Roteiro (site + redes + YouTube)", "cls": "p1", "who": "Igor", "body": "Roteiro completo para os 3 pilares.", "cycle": "Ciclo 7"}, "c7-ig": {"range": "28–29 novembro", "title": "Gravação Instagram/TikTok", "cls": "p1", "who": "Vitor Pezolato", "body": "Gravação de fim de semana.", "cycle": "Ciclo 7"}, "c7-yt": {"range": "30 novembro", "title": "Gravação YouTube", "cls": "p3", "who": "Vitor · Leandro", "body": "Gravação do vídeo longo.", "cycle": "Ciclo 7"}, "c7-pub": {"range": "08 dezembro", "title": "Edição → Publicação 📌 feriado municipal PA/AM", "cls": "p3", "who": "Time completo", "body": "Publicação coincide com Nossa Senhora da Conceição, feriado municipal em Belém e Manaus.", "cycle": "Ciclo 7"}, "c8-cur": {"range": "10 dezembro", "title": "Curadoria + conceito viral", "cls": "p1", "who": "Mariana Caron + Leandro", "body": "Curadoria e briefing do oitavo e último ciclo do ano.", "cycle": "Ciclo 8"}, "c8-rot": {"range": "11 dezembro", "title": "Roteiro (site + redes + YouTube)", "cls": "p1", "who": "Igor", "body": "Roteiro completo para os 3 pilares.", "cycle": "Ciclo 8"}, "c8-ig": {"range": "12–13 dezembro", "title": "Gravação Instagram/TikTok", "cls": "p1", "who": "Vitor Pezolato", "body": "Gravação de fim de semana.", "cycle": "Ciclo 8"}, "c8-yt": {"range": "14 dezembro", "title": "Gravação YouTube", "cls": "p3", "who": "Vitor · Leandro", "body": "Gravação do vídeo longo.", "cycle": "Ciclo 8"}, "c8-pub": {"range": "22 dezembro", "title": "Edição → Publicação — último ciclo antes do recesso", "cls": "p3", "who": "Time completo", "body": "Recomendação: pausar a esteira de novos ciclos entre 24/12 e 02/01.", "cycle": "Ciclo 8"}, "ini-congr-1p": {"range": "01 setembro", "title": "Início da produção: matéria-gancho do Congresso", "cls": "p1", "who": "Mariana (curadoria) + Leandro (conceito)", "body": "Início da produção do gancho viral ligado aos temas do Congresso Internacional de Estética.", "cycle": "Congresso de Estética"}, "ini-congr-1": {"range": "03 setembro", "title": "Publicação: matéria-gancho do Congresso de Estética", "cls": "news", "who": "Igor publica · Franqueadora", "body": "Matéria e carrossel com gancho viral que desce para o tema técnico do Congresso.", "cycle": "Congresso de Estética"}, "ini-congr-2": {"range": "08 setembro", "title": "Publicação: post institucional anunciando o Congresso", "cls": "p3", "who": "Franqueadora — perfil nacional", "body": "Frente \"Aqui é Preto no Branco\": feed com fundo branco e frase em bold preto, tom sério. Publicado no Dia Mundial da Fisioterapia.", "cycle": "Congresso de Estética"}, "ini-congr-3p": {"range": "15 setembro", "title": "Início da produção: teaser countdown", "cls": "p1", "who": "Leandro + Igor", "body": "Produção do teaser com destaque para os palestrantes confirmados, incluindo Renata França.", "cycle": "Congresso de Estética"}, "ini-congr-3": {"range": "17 setembro", "title": "Publicação: teaser countdown + palestrantes", "cls": "p2", "who": "Franqueadora — perfil nacional", "body": "Stories + Reels, tratando os 3 dias de congresso como temporada.", "cycle": "Congresso de Estética"}, "ini-congr-live": {"range": "18–20 setembro", "title": "Cobertura ao vivo do Congresso (bastidores + gancho de News)", "cls": "p1", "who": "Vitor + Leandro, em Curitiba · Franqueadora", "body": "Frente \"Momento Polaroide\": Stories e carrossel de bastidor sem roteiro, em Curitiba.", "cycle": "Congresso de Estética"}, "ini-congr-4p": {"range": "23 setembro", "title": "Início da produção: recap do Congresso", "cls": "p1", "who": "João (edição) + Igor (roteiro)", "body": "Montagem do recap com os melhores momentos e depoimentos captados.", "cycle": "Congresso de Estética"}, "ini-congr-4": {"range": "25 setembro", "title": "Publicação: recap + depoimentos + conversão para a pós", "cls": "p2", "who": "Franqueadora — perfil nacional", "body": "Fecha o arco aberto no teaser, com prova social e CTA para a pós-graduação em estética/dermato funcional.", "cycle": "Congresso de Estética"}, "ini-setam-1": {"range": "02 setembro", "title": "Publicação: matéria News — sinais de alerta em saúde mental", "cls": "news", "who": "Mariana + Igor · Franqueadora", "body": "Conteúdo educativo, tom informativo e sem sensacionalismo.", "cycle": "Setembro Amarelo"}, "ini-setam-2": {"range": "09 setembro", "title": "Publicação: matéria News — a saúde mental de quem cuida", "cls": "news", "who": "Mariana + Igor · Franqueadora", "body": "Ângulo sobre a saúde mental dos próprios profissionais de saúde e alunos.", "cycle": "Setembro Amarelo"}, "ini-setam-pico": {"range": "10 setembro", "title": "📌 Pico da campanha — Dia Mundial de Prevenção ao Suicídio", "cls": "vida", "who": "Franqueadora — perfil nacional", "body": "Post institucional sério + uma história real no Pilar Vida, só com quem topar contar.", "cycle": "Setembro Amarelo"}, "ini-setam-acao": {"range": "11 setembro", "title": "Ação física: Roda de Conversa Setembro Amarelo", "cls": "vida", "who": "Cada unidade participante · Franqueado", "body": "Kit padrão da franqueadora: roteiro de condução, material de apoio, parceria com o CVV.", "cycle": "Setembro Amarelo"}, "ini-setam-3": {"range": "23 setembro", "title": "Publicação: conteúdo de sustentação (dicas práticas)", "cls": "news", "who": "Franqueadora — perfil nacional", "body": "Mantém o tema vivo depois do pico de 10/09.", "cycle": "Setembro Amarelo"}, "ini-pg-1": {"range": "10 setembro", "title": "Publicação: vídeo do coordenador confirmando a turma", "cls": "vida", "who": "Unidade participante · Franqueado", "body": "Mensagem vem de quem tem autoridade acadêmica, reforçando seriedade e compromisso.", "cycle": "PG Semipresencial · Fisioterapia Intensiva"}, "ini-pg-2": {"range": "16 setembro", "title": "Publicação: depoimento de egresso do curso presencial original", "cls": "vida", "who": "Unidade participante · Franqueado", "body": "Prova social antes da virada de turma.", "cycle": "PG Semipresencial · Fisioterapia Intensiva"}, "ini-pg-inicio": {"range": "18 setembro", "title": "🎓 Início da turma — post \"começou hoje\"", "cls": "p1", "who": "Unidade participante · Franqueado", "body": "Post simples e de baixo perfil, já que o time nacional está dedicado ao Congresso em Curitiba.", "cycle": "PG Semipresencial · Fisioterapia Intensiva"}, "ini-pg-conf": {"range": "30 setembro", "title": "Peça \"turma confirmada\" (data aproximada)", "cls": "p3", "who": "Unidade participante · Franqueado", "body": "Só sai depois que o Acadêmico atualiza o status de viabilidade no Unimestre.", "cycle": "PG Semipresencial · Fisioterapia Intensiva"}, "ini-outrosa-1": {"range": "06 outubro", "title": "Publicação: matéria News — autoexame e sinais de alerta", "cls": "news", "who": "Mariana + Igor · Franqueadora", "body": "Conteúdo educativo, checado com fonte médica. Abre o mês de Outubro Rosa.", "cycle": "Outubro Rosa"}, "ini-outrosa-acao": {"range": "14 outubro", "title": "Ação física: unidades vestem rosa + material educativo", "cls": "vida", "who": "Cada unidade participante · Franqueado", "body": "Kit padrão da franqueadora: material impresso, arte para vitrine/recepção, roteiro curto de bastidor.", "cycle": "Outubro Rosa"}, "ini-outrosa-pico": {"range": "19 outubro", "title": "📌 Pico da campanha — Dia Mundial de Combate ao Câncer de Mama", "cls": "vida", "who": "Franqueadora — perfil nacional", "body": "Post institucional sério + uma história real no Pilar Vida.", "cycle": "Outubro Rosa"}, "ini-outrosa-3": {"range": "26 outubro", "title": "Publicação: conteúdo de sustentação (onde fazer o exame, rede de apoio)", "cls": "news", "who": "Franqueadora — perfil nacional", "body": "Mantém o tema vivo depois do pico de 19/10.", "cycle": "Outubro Rosa"}, "ini-novazul-1": {"range": "05 novembro", "title": "Publicação: matéria News — o tabu do exame de próstata", "cls": "news", "who": "Mariana + Igor · Franqueadora", "body": "Conteúdo educativo, tom informativo, checado com fonte médica.", "cycle": "Novembro Azul"}, "ini-novazul-acao": {"range": "12 novembro", "title": "Ação física: unidades vestem azul + material educativo", "cls": "vida", "who": "Cada unidade participante · Franqueado", "body": "Kit padrão da franqueadora — mesmo modelo de Setembro Amarelo e Outubro Rosa.", "cycle": "Novembro Azul"}, "ini-novazul-pico": {"range": "17 novembro", "title": "📌 Pico da campanha — Dia Mundial de Combate ao Câncer de Próstata", "cls": "vida", "who": "Franqueadora — perfil nacional", "body": "Post institucional sério + história real no Pilar Vida.", "cycle": "Novembro Azul"}, "ini-novazul-3": {"range": "24 novembro", "title": "Publicação: conteúdo de sustentação — desmistificando o tabu", "cls": "news", "who": "Franqueadora — perfil nacional", "body": "Mantém o tema vivo depois do pico.", "cycle": "Novembro Azul"}, "ini-blackfriday-1": {"range": "23 novembro", "title": "Teaser: anúncio da condição especial de Black November", "cls": "p3", "who": "Comercial (oferta) · Marketing (peça)", "body": "Peça de contagem regressiva, sem pisar no gancho de Consciência Negra.", "cycle": "Black November"}, "ini-blackfriday-pico": {"range": "27 novembro", "title": "📌 Black Friday — pico da oferta", "cls": "p3", "who": "Comercial (oferta) · Marketing (peça)", "body": "Peça principal da campanha, replicada para as unidades divulgarem localmente.", "cycle": "Black November"}, "ini-blackfriday-3": {"range": "30 novembro", "title": "Cyber Monday — última chamada, fecha a campanha", "cls": "p3", "who": "Comercial (oferta) · Marketing (peça)", "body": "Senso de urgência de encerramento.", "cycle": "Black November"}, "ini-30anos-1p": {"range": "01 dezembro", "title": "Início da produção: linha do tempo 1996 → 2026", "cls": "p1", "who": "Igor (roteiro) + João (edição)", "body": "Do Instituto do Pulmão (1995) e a fundação da Inspirar em 1996 até hoje — mais de 2.000 cursos de extensão, 50 pós-graduações, 10.000 alunos em extensão e 40.000 especialistas formados.", "cycle": "30 anos Inspirar"}, "ini-30anos-1": {"range": "08 dezembro", "title": "Publicação: \"30 anos em números\" — a retrospectiva", "cls": "p3", "who": "Franqueadora — perfil nacional", "body": "Publica no mesmo dia da edição/publicação já agendada do Ciclo 7.", "cycle": "30 anos Inspirar"}, "ini-30anos-2": {"range": "14 dezembro", "title": "Captação: depoimentos de fundadores, franqueados e egressos", "cls": "p1", "who": "Vitor · Leandro", "body": "Aproveita o dia de gravação de YouTube do Ciclo 8 para captar depoimentos curtos.", "cycle": "30 anos Inspirar"}, "ini-30anos-3": {"range": "22 dezembro", "title": "🎉 Peça de fechamento: \"obrigado por 30 anos\" + mensagem de fim de ano", "cls": "vida", "who": "Franqueadora — perfil nacional", "body": "Fecha o último ciclo do ano com gratidão — a alunos, franqueados, professores e colaboradores.", "cycle": "30 anos Inspirar"}};

var TAG_LABEL = {p1:'Pilar 1 · Site', p2:'Pilar 2 · Redes', p3:'Pilar 3 · YouTube', news:'Pilar News', vida:'Pilar Vida'};

/* ---- Campanhas Macro (2026: Vitor · 2027: planilha Vanessa) ----
   idx = índice de mês na linha do tempo, 0 = set/2026 ... 15 = dez/2027
   start/end quando existirem datas ISO reais; senão só idx (granularidade mensal) */
function monthIdx(year, month){ return (year-2026)*12 + (month-1) - 8; }
var MACRO_CAMPAIGNS = [
  {id:'congresso', name:'Congresso Internacional de Estética', cls:'p1', idxStart:monthIdx(2026,9), idxEnd:monthIdx(2026,9),
    period:'01–25 set/2026 (produção) · evento 18–20/09 em Curitiba', source:'Vitor',
    desc:'Produção de conteúdo nacional em torno do Congresso: matéria-gancho, teaser countdown, cobertura ao vivo em Curitiba e recap com conversão para a pós de estética/dermato funcional.'},
  {id:'setamarelo26', name:'Setembro Amarelo', cls:'vida', idxStart:monthIdx(2026,9), idxEnd:monthIdx(2026,9),
    period:'01–30 set/2026 · pico 10/09', source:'Vitor',
    desc:'Matérias News educativas, pico institucional em 10/09 (Dia Mundial de Prevenção ao Suicídio) e Roda de Conversa em cada unidade participante em 11/09.'},
  {id:'pg-semi', name:'PG Semipresencial de Fisioterapia Intensiva', cls:'p3', idxStart:monthIdx(2026,9), idxEnd:monthIdx(2026,9),
    period:'turma inicia 18/09/2026 · só unidades que lançaram', source:'Vitor',
    desc:'Kit padrão da franqueadora (vídeo do coordenador, depoimento de egresso, peça de turma confirmada); publicação é por unidade, não no perfil nacional.'},
  {id:'outrosa26', name:'Outubro Rosa', cls:'vida', idxStart:monthIdx(2026,10), idxEnd:monthIdx(2026,10),
    period:'06–26 out/2026 · pico 19/10', source:'Vitor',
    desc:'Mesmo modelo do Setembro Amarelo: matéria de abertura, ação física nas unidades vestindo rosa, pico institucional no Dia Mundial de Combate ao Câncer de Mama.'},
  {id:'novazul26', name:'Novembro Azul', cls:'vida', idxStart:monthIdx(2026,11), idxEnd:monthIdx(2026,11),
    period:'05–24 nov/2026 · pico 17/11', source:'Vitor',
    desc:'Mesmo modelo das campanhas de conscientização anteriores, com pico no Dia Mundial de Combate ao Câncer de Próstata.'},
  {id:'blackfriday26', name:'Black November', cls:'p3', idxStart:monthIdx(2026,11), idxEnd:monthIdx(2026,11),
    period:'23–30 nov/2026 · pico Black Friday 27/11', source:'Vitor',
    desc:'Fluxo comercial à parte do editorial dos pilares: teaser de oferta, pico na Black Friday, fechamento na Cyber Monday.'},
  {id:'inspirarday-lanc', name:'Inspirar Day — 30 Anos (lançamento)', cls:'brand', idxStart:monthIdx(2026,12), idxEnd:monthIdx(2027,2),
    period:'pré-campanha 16/11/2026 · início 08/12/2026 · fim 28/02/2027', source:'Vanessa',
    desc:'Campanha comercial / posicionamento dos 30 anos da Inspirar. Em dezembro/2026 entra também a retrospectiva "30 anos em números" e captação de depoimentos de fundadores, franqueados e egressos.'},
  {id:'chega-saudade', name:'Chega de Saudade (50%) + Ligas Acadêmicas', cls:'p2', idxStart:monthIdx(2027,3), idxEnd:monthIdx(2027,3),
    period:'01–31 mar/2027', source:'Vanessa',
    desc:'Campanha promocional (50% de desconto) somada à ativação das Ligas Acadêmicas.'},
  {id:'selecao-pg', name:'Seleção de Pós-Graduação', cls:'p2', idxStart:monthIdx(2027,4), idxEnd:monthIdx(2027,4),
    period:'mês de referência: Abril/2027', source:'Vanessa',
    desc:'Campanha comercial de seleção para pós-graduação.',
    caveat:'A planilha original traz pré-campanha 16/09/2027, início 01/10/2027 e fim 15/10/2027 para esta linha — datas que não batem com o mês indicado (Abril) e são idênticas às de outras 3 campanhas da mesma planilha. Prováveis placeholders/erro de preenchimento na fonte; usar "Abril" como referência até confirmar as datas reais.'},
  {id:'semipresencial27', name:'Semipresencial', cls:'p2', idxStart:monthIdx(2027,5), idxEnd:monthIdx(2027,5),
    period:'mês de referência: Maio/2027', source:'Vanessa',
    desc:'Campanha de relacionamento / indicação para o formato semipresencial.',
    caveat:'Mesma inconsistência de datas do item "Seleção de Pós-Graduação" na planilha original (pré 16/09, início 01/10, fim 15/10/2027) — não bate com o mês "Maio". Revisar antes de confirmar.'},
  {id:'vendas-amizade', name:'Campanha Vendas / Amizade que Inspira', cls:'p2', idxStart:monthIdx(2027,6), idxEnd:monthIdx(2027,7),
    period:'mês de referência: Junho/Julho de 2027', source:'Vanessa',
    desc:'Campanha comercial de plataforma / indicação entre alunos.',
    caveat:'A planilha traz pré-campanha 17/10/2027, início 01/11/2027 e fim 15/11/2027 — mesmas datas usadas também em "Amo Fisio" e "FisioWeek Inspirar". Provável placeholder repetido na fonte; usar "Junho/Julho" como referência.'},
  {id:'amo-fisio', name:'Amo Fisio', cls:'p2', idxStart:monthIdx(2027,8), idxEnd:monthIdx(2027,8),
    period:'mês de referência: Agosto/2027', source:'Vanessa',
    desc:'Campanha comercial ligada à identidade da Fisioterapia.',
    caveat:'Mesma inconsistência de datas repetida na planilha (pré 17/10, início 01/11, fim 15/11/2027) — idênticas às de "Vendas/Amizade que Inspira" e "FisioWeek". Usar "Agosto" como referência.'},
  {id:'fisioweek', name:'FisioWeek Inspirar', cls:'p1', idxStart:monthIdx(2027,9), idxEnd:monthIdx(2027,9),
    period:'mês de referência: Setembro/2027', source:'Vanessa',
    desc:'Campanha temática de Fisioterapia — a planilha de temática mensal já sugere cruzar com Mês do Movimento (novembro) + Black Friday, então vale confirmar se a FisioWeek não desliza para novembro na versão final.',
    caveat:'Mesma inconsistência de datas repetida na planilha (pré 17/10, início 01/11, fim 15/11/2027).'},
  {id:'outubro27-pend', name:'(sem campanha cadastrada)', cls:'pend', idxStart:monthIdx(2027,10), idxEnd:monthIdx(2027,10),
    period:'Outubro/2027', source:'—', pending:true,
    desc:'A planilha da Vanessa não traz nenhuma campanha para outubro/2027 — a linha do mês ficou em branco na fonte original.'},
  {id:'blackfriday27', name:'Black Friday', cls:'p3', idxStart:monthIdx(2027,11), idxEnd:monthIdx(2027,11),
    period:'pré-campanha 17/10/2027 · início 01/11/2027 · fim 15/11/2027', source:'Vanessa',
    desc:'Campanha comercial de Black Friday — única entre as campanhas de 2027 cujas datas de início/fim batem coerentemente com o mês indicado na planilha.'},
  {id:'inspirarday-fech', name:'Inspirar Day — 30 Anos (encerramento)', cls:'brand', idxStart:monthIdx(2027,12), idxEnd:monthIdx(2027,12),
    period:'início 01/12/2027 · fim 15/12/2027 (encerramento do ano de 30 anos)', source:'Vanessa',
    desc:'Campanha comercial de encerramento da celebração de 30 anos, fechando o ciclo aberto em dezembro/2026.'}
];

