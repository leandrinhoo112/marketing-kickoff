param (
    [string]$Gate = "ALL"
)

$ErrorActionPreference = 'Stop'
$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path }

$edgeCandidates = @(
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
)
$edgePath = $edgeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

function Test-G1 {
    Write-Host "[CHECK G1] Verificando interface de O MEU É MAIOR no index.html e assets..."
    $indexPath = Join-Path $baseDir 'index.html'
    $jsPath = Join-Path $baseDir 'o-meu-e-maior.js'

    if (-not (Test-Path $indexPath)) { throw "index.html não encontrado" }
    if (-not (Test-Path $jsPath)) { throw "o-meu-e-maior.js não encontrado" }

    $indexContent = Get-Content -Raw -Encoding UTF8 $indexPath
    $jsContent = Get-Content -Raw -Encoding UTF8 $jsPath

    $requiredElements = @(
        'data-game="sizeItUp"',
        'id="game-sizeItUp"',
        'id="sizeitup-ref-container"',
        'id="sizeitup-target-container"',
        'id="sizeitup-slider"',
        'id="sizeitup-lockin-btn"',
        'o-meu-e-maior.js'
    )

    foreach ($req in $requiredElements) {
        if (-not $indexContent.Contains($req)) {
            throw "Elemento obrigatório '$req' ausente em index.html"
        }
    }

    if ($jsContent.Length -lt 5000) {
        throw "o-meu-e-maior.js parece incompleto ($($jsContent.Length) bytes)"
    }

    Write-Host "G1_PASSED"
}

function Test-G2 {
    Write-Host "[CHECK G2] Verificando mecânica de escala, proporções, trava e pontuação..."
    $jsPath = Join-Path $baseDir 'o-meu-e-maior.js'
    $jsContent = Get-Content -Raw -Encoding UTF8 $jsPath

    $requiredLogic = @(
        'lockInEstimate',
        'diffFactor',
        'currentGuessScale',
        'renderGhostSilhouette',
        'sizeitup-target-ghost',
        'renderRevealCard',
        'roundScore',
        'formatDimension'
    )

    foreach ($token in $requiredLogic) {
        if (-not $jsContent.Contains($token)) {
            throw "Lógica essencial '$token' não encontrada em o-meu-e-maior.js"
        }
    }

    # Verificar banco de silhuetas SVGs
    $svgMatchCount = ([regex]::Matches($jsContent, 'svg:\s*`')).Count
    if ($svgMatchCount -lt 15) {
        throw "Quantidade insuficiente de silhuetas SVG encontradas: $svgMatchCount"
    }

    Write-Host "G2_PASSED"
}

function Test-G3 {
    Write-Host "[CHECK G3] Verificando placar de líderes, persistência Supabase e fallback localStorage..."
    $jsPath = Join-Path $baseDir 'o-meu-e-maior.js'
    $sqlPath = Join-Path $baseDir 'criar_tabelas_supabase.sql'
    $indexPath = Join-Path $baseDir 'index.html'

    $jsContent = Get-Content -Raw -Encoding UTF8 $jsPath
    $sqlContent = Get-Content -Raw -Encoding UTF8 $sqlPath
    $indexContent = Get-Content -Raw -Encoding UTF8 $indexPath

    # Supabase e local ranking
    if (-not $jsContent.Contains('saveSizeItUpScoreToDB')) { throw "saveSizeItUpScoreToDB ausente" }
    if (-not $jsContent.Contains('saveToLocalRanking')) { throw "saveToLocalRanking ausente" }
    if (-not $jsContent.Contains('fetchSizeItUpScores')) { throw "fetchSizeItUpScores ausente" }
    if (-not $jsContent.Contains('omeuemaior_scores')) { throw "Referência para tabela omeuemaior_scores ausente no JS" }

    # SQL Schema
    if ($sqlContent -notmatch 'CREATE TABLE IF NOT EXISTS omeuemaior_scores') {
        throw "Tabela omeuemaior_scores não encontrada no script SQL"
    }
    if ($sqlContent -notmatch 'CREATE POLICY\s+.*omeuemaior_scores') {
        throw "Policy de RLS para omeuemaior_scores ausente no script SQL"
    }

    # HTML Leaderboard
    if (-not $indexContent.Contains('id="sizeitupLeaderboardList"')) {
        throw "sizeitupLeaderboardList não encontrado no index.html"
    }

    Write-Host "G3_PASSED"
}

function Test-G4 {
    Write-Host "[CHECK G4] Verificando abas de navegação, modo treino e conquistas..."
    $appPath = Join-Path $baseDir 'app.js'
    $indexPath = Join-Path $baseDir 'index.html'
    $jsPath = Join-Path $baseDir 'o-meu-e-maior.js'

    $appContent = Get-Content -Raw -Encoding UTF8 $appPath
    $indexContent = Get-Content -Raw -Encoding UTF8 $indexPath
    $jsContent = Get-Content -Raw -Encoding UTF8 $jsPath

    # Tab switching in app.js
    if (-not $appContent.Contains("game-sizeItUp")) {
        throw "Visibilidade de game-sizeItUp ausente no seletor de abas de app.js"
    }
    if (-not $appContent.Contains("initSizeItUp")) {
        throw "Chamada a initSizeItUp ausente no seletor de abas de app.js"
    }

    # Achievements
    if (-not $appContent.Contains("o_meu_e_maior") -and -not $appContent.Contains("achv_sizeitup")) {
        throw "Conquista de O Meu é Maior não registrada em app.js"
    }

    # Unlimited training mode
    if (-not $indexContent.Contains('id="sizeitup-unlimited-btn"')) {
        throw "Botão de modo treino ausente em index.html"
    }
    if (-not $jsContent.Contains('isUnlimited')) {
        throw "Suporte a modo treino isUnlimited ausente em o-meu-e-maior.js"
    }

    Write-Host "G4_PASSED"
}

function Test-G5 {
    Write-Host "[CHECK G5] Executando Edge Headless DOM dump e sincronização com Desktop..."
    $indexPath = Join-Path $baseDir 'index.html'

    if ($edgePath) {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $edgePath
        $psi.Arguments = "--headless --disable-gpu --dump-dom `"$indexPath`""
        $psi.RedirectStandardOutput = $true
        $psi.UseShellExecute = $false

        $proc = [System.Diagnostics.Process]::Start($psi)
        $domOutput = $proc.StandardOutput.ReadToEnd()
        $proc.WaitForExit()

        if (-not $domOutput.Contains('game-sizeItUp')) {
            throw "Edge Headless não renderizou o container game-sizeItUp"
        }
        if ($domOutput -notmatch 'O Meu .+ Maior' -and $domOutput -notmatch 'data-game="sizeItUp"') {
            throw "Edge Headless não renderizou o título/aba 'O Meu é Maior'"
        }
        Write-Host "Headless DOM dump verificado com sucesso ($($domOutput.Length) chars)."
    } else {
        Write-Host "Aviso: msedge.exe não localizado para dump headless. Pulando para verificação de arquivos."
    }

    # Sincronização nos diretórios de Desktop
    $desktop1 = 'C:\Users\Usuario\Desktop\arquivos_github'
    $desktop2 = 'C:\Users\Usuario\Desktop\ARRASTE_PARA_O_GITHUB'

    $filesToSync = @(
        'index.html',
        'app.js',
        'o-meu-e-maior.js',
        'criar_tabelas_supabase.sql',
        'GATES.md'
    )

    foreach ($file in $filesToSync) {
        $src = Join-Path $baseDir $file
        if (Test-Path $src) {
            if (Test-Path $desktop1) {
                Copy-Item -Path $src -Destination (Join-Path $desktop1 $file) -Force
            }
            if (Test-Path $desktop2) {
                Copy-Item -Path $src -Destination (Join-Path $desktop2 $file) -Force
            }
        }
    }

    # Verificar se foram copiados
    foreach ($file in $filesToSync) {
        $d1Path = Join-Path $desktop1 $file
        if (-not (Test-Path $d1Path)) {
            throw "Falha ao sincronizar $file para $desktop1"
        }
    }

    Write-Host "G5_PASSED"
}

switch ($Gate) {
    "G1" { Test-G1 }
    "G2" { Test-G2 }
    "G3" { Test-G3 }
    "G4" { Test-G4 }
    "G5" { Test-G5 }
    "ALL" {
        Test-G1
        Test-G2
        Test-G3
        Test-G4
        Test-G5
        Write-Host "`nTODOS OS GATES PASSARAM COM SUCESSO!"
    }
    Default { throw "Portão inválido: $Gate" }
}
