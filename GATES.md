# Gates: Interatividade e Edição no Planejamento Estratégico

OWNS: marketing-inspirar-main/src/*, marketing-inspirar-main/index.html, planejamento-inspirar.html, GATES.md

Scope: Habilitar interatividade completa (concluir tarefas nos checklists e entregas por pessoa, editar indicadores com meta/realizado/semáforo/nota, alterar status e notas livres de iniciativas) com persistência em localStorage e sincronização pronta para o GitHub, sem alterar a identidade visual.

- [x] G1: Checklist de iniciativas e entregas por pessoa alternam conclusão (done) e atualizam progresso com persistência
  CHECK: powershell -ExecutionPolicy Bypass -File "verify_interactivity.ps1" -Gate G1
  EXPECT: G1_PASSED
  STATUS: PASSED (Tanto checklist de iniciativas quanto entregas por pessoa e setor possuem toggle interativo, visto verde, tachado e auto-save em localStorage)

- [x] G2: Indicadores permitem edição inline de Meta, Realizado, Semáforo e Nota com persistência no localStorage
  CHECK: powershell -ExecutionPolicy Bypass -File "verify_interactivity.ps1" -Gate G2
  EXPECT: G2_PASSED
  STATUS: PASSED (Meta, Realizado e Nota possuem inputs inline com auto-save no storage; Semáforo possui seletor interativo com badges verde/amarelo/vermelho)

- [x] G3: Status da iniciativa é editável e reflete no Kanban e nas contagens
  CHECK: powershell -ExecutionPolicy Bypass -File "verify_interactivity.ps1" -Gate G3
  EXPECT: G3_PASSED
  STATUS: PASSED (Seletor de status implementado no painel de detalhes, atualiza colunas do Kanban e contadores do Painel Geral)

- [x] G4: Recompilação íntegra do index.html mantendo 100% da identidade Editorial Zinc sem erros de sintaxe
  CHECK: powershell -ExecutionPolicy Bypass -File "verify_interactivity.ps1" -Gate G4
  EXPECT: G4_PASSED
  STATUS: PASSED (Compilado index.html de 534 KB e espelho planejamento-inspirar.html, testados via Edge Headless com zero erros)

- [x] G5: Sincronização de todos os arquivos atualizados em Desktop/arquivos_github
  CHECK: powershell -ExecutionPolicy Bypass -File "verify_interactivity.ps1" -Gate G5
  EXPECT: G5_PASSED
  STATUS: PASSED (Pasta completa marketing-inspirar-main, planejamento-inspirar.html e GATES.md sincronizados no Desktop prontos para upload)