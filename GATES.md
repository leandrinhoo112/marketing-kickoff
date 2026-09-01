# Gates: Fix Portuguese Accents & UTF-8 Mojibake

OWNS: index.html

Scope: Repair all 211 double-encoded UTF-8 characters across index.html so Portuguese accents render cleanly.

- [x] G1: Zero mojibake characters remaining in index.html
  CHECK: powershell -Command "if (([regex]::Matches((Get-Content index.html -Raw -Encoding UTF8), 'Ã[\x80-\xBF]')).Count -eq 0) { Write-Host 'mojibake_zero' }"
  EXPECT: mojibake_zero
  EVIDENCE: Verified regex scan finds 0 instances of double-encoded UTF-8 in index.html.

- [x] G2: Critical Portuguese words verified in index.html
  CHECK: powershell -Command "$c = Get-Content index.html -Raw -Encoding UTF8; if ($c.Contains('Diário') -and $c.Contains('Quem é você') -and $c.Contains('Sugestões') -and $c.Contains('Área do Gestor')) { Write-Host 'words_verified' }"
  EXPECT: words_verified
  EVIDENCE: Verified Diário, Quem é você, Sugestões, Área do Gestor, Feedback Anônimo are properly encoded.

- [x] G3: Desktop arquivos_github folder contains the clean index.html
  CHECK: powershell -Command "if (([regex]::Matches((Get-Content C:\Users\Usuario\Desktop\arquivos_github\index.html -Raw -Encoding UTF8), 'Ã[\x80-\xBF]')).Count -eq 0) { Write-Host 'desktop_clean' }"
  EXPECT: desktop_clean
  EVIDENCE: C:\Users\Usuario\Desktop\arquivos_github\index.html verified with 0 mojibake characters.
