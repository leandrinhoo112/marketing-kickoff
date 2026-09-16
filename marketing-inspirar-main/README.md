# Planejamento Estratégico Inspirar · Marketing

Plataforma de acompanhamento do Marketing da Faculdade Inspirar: iniciativas do Planejamento Estratégico, entregas por pessoa e calendário de campanhas (set/2026 → dez/2027).

Publicada em https://marketing-inspirar.vercel.app, com acesso por senha da equipe.

## Módulos

**Planejamento Estratégico**
- **Painel Geral:** números do setor, progresso por iniciativa, norte do plano, próximos marcos e equipe.
- **Iniciativas:** as 5 iniciativas de Marketing (#05 a #09) com responsável, status, objetivo, fluxo de etapas, checklist com comentários, indicadores, riscos e entregas relacionadas.
- **Entregas por pessoa:** liderança (iniciativas sob responsabilidade + checklist do setor) e as entregas de cada pessoa dos squads Branding e Performance.
- **Kanban, Indicadores e Atividade.**

**Calendário de Marketing**
- **Mês:** grade diária com camadas (campanhas, entregas por pessoa, produção de conteúdo, datas da saúde, cidades, feriados) e filtro por pessoa.
- **Linha do tempo:** campanhas conciliadas e janelas de entrega de cada pessoa.
- **A validar:** divergências entre as fontes que precisam de decisão.

## Fontes

| Dado | Fonte |
|---|---|
| Iniciativas | Plataforma “Planejamento Estratégico Inspirar” enviada pelo Vitor (set/2026) — fonte única |
| Entregas por pessoa | Briefings individuais de setembro/2026 + checklist do Plano de Marketing (PDF) |
| Campanhas | Plano de Marketing (PDF) · calendário do Vitor (set–dez/2026) · planilha da Vanessa (2027) |
| Datas da saúde, cidades, produção | Calendário anterior (Vitor + Vanessa) |

Ligações entre entregas, campanhas e iniciativas são **relações sugeridas** no cruzamento das fontes e aparecem sinalizadas na interface.

## Como atualizar

Esta versão não tem banco de dados: status, checklist e notas são editados nos arquivos de `src/` e republicados.

```bash
node build.mjs index.html   # gera o arquivo único
vercel deploy --prod --scope=bf-3107
```

| Arquivo | Conteúdo |
|---|---|
| `src/data-iniciativas.js` | Iniciativas, etapas, checklist (`done: true` marca item concluído), indicadores |
| `src/data-entregas.js` | Pessoas, entregas por pessoa, checklist do setor, norte do plano |
| `src/data-calendario.js` | Campanhas conciliadas e pontos a validar |
| `src/data-base.js` | Temáticas, datas da saúde, cidades, produção de conteúdo |
| `src/styles1-base.css` … `styles4-glass.css` | Identidade visual do calendário antigo (Editorial Zinc, vidro, foto de fundo, claro/escuro) |
| `src/app*.js`, `src/template.html` | Interface e animações (GSAP) |
| `src/bg.jpg`, `src/logo.webp` | Foto de fundo e logo branca (troque a foto com `BG=/caminho/foto.jpg node build.mjs index.html`) |

A senha fica na variável de ambiente `CAL_PASSWORD` do projeto na Vercel (middleware em `middleware.js`).
