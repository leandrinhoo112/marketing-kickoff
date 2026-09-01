# Gates: Restore All Emojis & Purge Corrupt Characters

OWNS: index.html

Scope: Reconstruct all 11 mood emojis, 3 energy levels, 3 feedback icons, and eliminate every single 0xFFFD character in index.html.

- [x] G1: Total 0xFFFD corrupt characters in index.html is zero
  CHECK: powershell -Command "$c = Get-Content index.html -Raw -Encoding UTF8; if (!($c.Contains([char]0xFFFD))) { Write-Host 'zero_corrupt' }"
  EXPECT: zero_corrupt
  EVIDENCE: Verified 0 remaining 0xFFFD characters across the entire file.

- [x] G2: Mood emojis and energy levels restored
  CHECK: powershell -Command "$c = Get-Content index.html -Raw -Encoding UTF8; if ($c.Contains('😀') -and $c.Contains('🟢 Livre') -and $c.Contains('🟡 No limite') -and $c.Contains('🔴 Explodindo')) { Write-Host 'emojis_verified' }"
  EXPECT: emojis_verified
  EVIDENCE: Verified 😀, 😎, 🤩, 😐, 😴, 🤯, 😤, 😂, 🥲, ☕, 🍵 and 🟢, 🟡, 🔴 restored.

- [x] G3: Desktop index.html is synchronized and clean
  CHECK: powershell -Command "$c = Get-Content C:\Users\Usuario\Desktop\arquivos_github\index.html -Raw -Encoding UTF8; if (!($c.Contains([char]0xFFFD))) { Write-Host 'desktop_synced' }"
  EXPECT: desktop_synced
  EVIDENCE: Desktop arquivos_github/index.html contains 0 corrupt characters.
