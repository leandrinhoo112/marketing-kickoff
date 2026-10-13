# Gates: Minigame O MEU É MAIOR no Radar Diário

OWNS: index.html, o-meu-e-maior.js, app.js, C:\Users\Usuario\Desktop\arquivos_github\*, GATES.md

Scope: Implementar na área de minigames do Radar Diário o jogo "O MEU É MAIOR" (inspirado no Size It Up do Magnitudle), com comparação visual de escala, 5 rodadas diárias, pontuação de até 500 pts, placar/leaderboard diário integrado ao Supabase e localStorage, modo treino e sincronização completa.

- [x] G1: Interface do jogo "O MEU É MAIOR" integrada no tab-minigame com botão de navegação e arena visual
  CHECK: powershell -ExecutionPolicy Bypass -File "verify_sizeitup.ps1" -Gate G1
  EXPECT: G1_PASSED

- [x] G2: Mecânica de redimensionamento, trava de estimativa, revelação de escala real e pontuação de 0 a 100 por rodada
  CHECK: powershell -ExecutionPolicy Bypass -File "verify_sizeitup.ps1" -Gate G2
  EXPECT: G2_PASSED

- [x] G3: Placar do dia (Ranking) e histórico implementados com suporte a Supabase e fallback seguro no localStorage
  CHECK: powershell -ExecutionPolicy Bypass -File "verify_sizeitup.ps1" -Gate G3
  EXPECT: G3_PASSED

- [x] G4: Integração com abas de navegação do Play do Dia, Modo Treino e Conquistas/XP
  CHECK: powershell -ExecutionPolicy Bypass -File "verify_sizeitup.ps1" -Gate G4
  EXPECT: G4_PASSED

- [x] G5: Verificação automatizada via Edge Headless do fluxo completo e sincronização dos arquivos no Desktop
  CHECK: powershell -ExecutionPolicy Bypass -File "verify_sizeitup.ps1" -Gate G5
  EXPECT: G5_PASSED

- [x] G6: Proteção de Ofensiva contra Feriados (09/10/2026 e 12/10/2026) e Sincronização
  - [x] G6.1: Inclusão de '2026-10-09' e '2026-10-12' em OFFICIAL_HOLIDAYS do app.js
    CHECK: powershell -ExecutionPolicy Bypass -File "verify_holiday_streak.ps1" -Gate G6_HOLIDAY_CONFIG
    EXPECT: G6_HOLIDAY_CONFIG_PASSED
  - [x] G6.2: Bateria de testes unitários para cálculo de sequência/streak cobrindo todas as variações de feriado
    CHECK: powershell -ExecutionPolicy Bypass -File "verify_holiday_streak.ps1" -Gate G6_CALCULATION_TESTS
    EXPECT: G6_CALCULATION_TESTS_PASSED
  - [x] G6.3: Sincronização em C:\Users\Usuario\Desktop\arquivos_github e C:\Users\Usuario\Desktop\ARRASTE_PARA_O_GITHUB
    CHECK: powershell -ExecutionPolicy Bypass -File "verify_holiday_streak.ps1" -Gate G6_DESKTOP_SYNC
    EXPECT: G6_DESKTOP_SYNC_PASSED
  - [x] G6.4: Envio e commit para o repositório GitHub leandrinhoo112/marketing-kickoff
    CHECK: powershell -ExecutionPolicy Bypass -File "verify_holiday_streak.ps1" -Gate G6_GITHUB_PUSH
    EXPECT: G6_GITHUB_PUSH_PASSED