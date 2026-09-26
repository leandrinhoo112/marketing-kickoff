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