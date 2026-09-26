# generate_items.ps1
$ErrorActionPreference = 'Stop'
$outputPath = Join-Path $PSScriptRoot "o-meu-e-maior-items.js"

Write-Host "Iniciando geraÃ§Ã£o de 540 itens para O MEU Ã‰ MAIOR..."

# svg_templates.ps1
$templates = @{
    # Mismatched items reported by user
    'popcorn_cart' = { "<svg viewBox='0 0 120 130' width='100%' height='100%'><polygon points='20,25 60,10 100,25 95,32 25,32' fill='currentColor'/><path d='M25,32 Q32,38 40,32 Q48,38 56,32 Q64,38 72,32 Q80,38 88,32 Q95,38 95,32' fill='currentColor'/><rect x='28' y='32' width='4' height='38' fill='currentColor'/><rect x='88' y='32' width='4' height='38' fill='currentColor'/><rect x='28' y='32' width='64' height='38' fill='rgba(255,255,255,0.15)' stroke='currentColor' stroke-width='2'/><path d='M35,65 Q45,45 60,48 Q75,42 85,65 Z' fill='rgba(255,230,100,0.6)'/><circle cx='48' cy='52' r='4' fill='#fef08a'/><circle cx='58' cy='46' r='4.5' fill='#fef08a'/><circle cx='68' cy='50' r='4' fill='#fef08a'/><rect x='26' y='70' width='68' height='32' rx='3' fill='currentColor'/><rect x='32' y='75' width='56' height='22' rx='2' fill='rgba(0,0,0,0.2)'/><path d='M26,75 L12,75 L12,65' fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><rect x='86' y='102' width='6' height='22' rx='2' fill='currentColor'/><circle cx='45' cy='105' r='18' fill='none' stroke='currentColor' stroke-width='5'/><circle cx='45' cy='105' r='4' fill='currentColor'/><line x1='45' y1='87' x2='45' y2='123' stroke='currentColor' stroke-width='2'/><line x1='27' y1='105' x2='63' y2='105' stroke='currentColor' stroke-width='2'/></svg>" }
    'door_pivot' = { "<svg viewBox='0 0 80 160' width='100%' height='100%'><rect x='10' y='6' width='60' height='150' fill='none' stroke='currentColor' stroke-width='5'/><rect x='16' y='10' width='48' height='142' rx='2' fill='currentColor'/><line x1='23' y1='8' x2='23' y2='154' stroke='rgba(0,0,0,0.5)' stroke-width='3' stroke-linecap='round'/><circle cx='23' cy='9' r='3.5' fill='rgba(255,255,255,0.7)'/><circle cx='23' cy='153' r='3.5' fill='rgba(255,255,255,0.7)'/><rect x='52' y='50' width='4' height='60' rx='2' fill='rgba(255,255,255,0.85)'/><line x1='27' y1='35' x2='60' y2='35' stroke='rgba(0,0,0,0.25)' stroke-width='2'/><line x1='27' y1='65' x2='48' y2='65' stroke='rgba(0,0,0,0.25)' stroke-width='2'/><line x1='27' y1='95' x2='48' y2='95' stroke='rgba(0,0,0,0.25)' stroke-width='2'/><line x1='27' y1='125' x2='60' y2='125' stroke='rgba(0,0,0,0.25)' stroke-width='2'/></svg>" }
    'door_residential' = { "<svg viewBox='0 0 80 150' width='100%' height='100%'><rect x='10' y='8' width='60' height='138' fill='none' stroke='currentColor' stroke-width='5'/><rect x='14' y='12' width='52' height='130' fill='currentColor'/><rect x='19' y='18' width='18' height='45' rx='2' fill='rgba(0,0,0,0.25)' stroke='rgba(255,255,255,0.2)' stroke-width='1.5'/><rect x='43' y='18' width='18' height='45' rx='2' fill='rgba(0,0,0,0.25)' stroke='rgba(255,255,255,0.2)' stroke-width='1.5'/><rect x='19' y='72' width='18' height='58' rx='2' fill='rgba(0,0,0,0.25)' stroke='rgba(255,255,255,0.2)' stroke-width='1.5'/><rect x='43' y='72' width='18' height='58' rx='2' fill='rgba(0,0,0,0.25)' stroke='rgba(255,255,255,0.2)' stroke-width='1.5'/><circle cx='60' cy='82' r='3.5' fill='rgba(255,255,255,0.9)'/><rect x='58' y='78' width='4' height='12' rx='1' fill='rgba(255,255,255,0.4)'/></svg>" }
    'door_garage' = { "<svg viewBox='0 0 140 100' width='100%' height='100%'><rect x='10' y='10' width='120' height='80' rx='2' fill='currentColor'/><line x1='10' y1='30' x2='130' y2='30' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='10' y1='50' x2='130' y2='50' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='10' y1='70' x2='130' y2='70' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><rect x='64' y='78' width='12' height='4' rx='1' fill='rgba(255,255,255,0.6)'/></svg>" }
    'window_frame' = { "<svg viewBox='0 0 100 100' width='100%' height='100%'><rect x='10' y='10' width='80' height='80' rx='3' fill='currentColor'/><rect x='16' y='16' width='32' height='32' fill='rgba(0,0,0,0.35)'/><rect x='52' y='16' width='32' height='32' fill='rgba(0,0,0,0.35)'/><rect x='16' y='52' width='32' height='32' fill='rgba(0,0,0,0.35)'/><rect x='52' y='52' width='32' height='32' fill='rgba(0,0,0,0.35)'/></svg>" }
    'pool_table' = { "<svg viewBox='0 0 150 90' width='100%' height='100%'><polygon points='10,35 140,35 130,55 20,55' fill='currentColor'/><polygon points='20,38 130,38 122,52 28,52' fill='#16a34a'/><circle cx='20' cy='38' r='4' fill='#111'/><circle cx='75' cy='37' r='3.5' fill='#111'/><circle cx='130' cy='38' r='4' fill='#111'/><circle cx='26' cy='52' r='4' fill='#111'/><circle cx='75' cy='53' r='3.5' fill='#111'/><circle cx='124' cy='52' r='4' fill='#111'/><circle cx='100' cy='45' r='2' fill='#fef08a'/><circle cx='104' cy='43' r='2' fill='#ef4444'/><circle cx='104' cy='47' r='2' fill='#3b82f6'/><rect x='20' y='52' width='110' height='12' fill='currentColor'/><rect x='25' y='64' width='12' height='22' rx='3' fill='currentColor'/><rect x='113' y='64' width='12' height='22' rx='3' fill='currentColor'/></svg>" }
    'foosball_table' = { "<svg viewBox='0 0 130 90' width='100%' height='100%'><rect x='15' y='25' width='100' height='26' rx='3' fill='currentColor'/><rect x='20' y='28' width='90' height='20' fill='#16a34a'/><line x1='8' y1='32' x2='122' y2='32' stroke='rgba(255,255,255,0.7)' stroke-width='2'/><line x1='8' y1='38' x2='122' y2='38' stroke='rgba(255,255,255,0.7)' stroke-width='2'/><line x1='8' y1='44' x2='122' y2='44' stroke='rgba(255,255,255,0.7)' stroke-width='2'/><circle cx='45' cy='32' r='2.5' fill='#ef4444'/><circle cx='85' cy='32' r='2.5' fill='#3b82f6'/><circle cx='55' cy='38' r='2.5' fill='#ef4444'/><circle cx='75' cy='38' r='2.5' fill='#3b82f6'/><circle cx='45' cy='44' r='2.5' fill='#ef4444'/><circle cx='85' cy='44' r='2.5' fill='#3b82f6'/><polygon points='22,51 32,51 26,82 16,82' fill='currentColor'/><polygon points='98,51 108,51 114,82 104,82' fill='currentColor'/></svg>" }
    'pingpong_table' = { "<svg viewBox='0 0 140 85' width='100%' height='100%'><polygon points='15,40 125,40 115,55 25,55' fill='#1e3a8a'/><line x1='70' y1='32' x2='70' y2='48' stroke='white' stroke-width='4'/><rect x='25' y='55' width='90' height='6' fill='currentColor'/><line x1='30' y1='61' x2='28' y2='80' stroke='currentColor' stroke-width='5'/><line x1='110' y1='61' x2='112' y2='80' stroke='currentColor' stroke-width='5'/></svg>" }
    'workbench' = { "<svg viewBox='0 0 130 90' width='100%' height='100%'><rect x='10' y='22' width='110' height='14' rx='2' fill='currentColor'/><rect x='8' y='24' width='8' height='18' rx='1' fill='rgba(0,0,0,0.4)'/><line x1='4' y1='33' x2='12' y2='33' stroke='rgba(255,255,255,0.8)' stroke-width='3'/><rect x='22' y='36' width='12' height='46' fill='currentColor'/><rect x='96' y='36' width='12' height='46' fill='currentColor'/><rect x='20' y='65' width='90' height='8' fill='rgba(0,0,0,0.25)'/><rect x='45' y='60' width='25' height='5' rx='1' fill='rgba(255,255,255,0.4)'/></svg>" }
    'bed_double' = { "<svg viewBox='0 0 130 90' width='100%' height='100%'><rect x='15' y='15' width='100' height='35' rx='5' fill='currentColor'/><rect x='20' y='20' width='42' height='25' rx='3' fill='rgba(0,0,0,0.2)'/><rect x='68' y='20' width='42' height='25' rx='3' fill='rgba(0,0,0,0.2)'/><rect x='22' y='36' width='38' height='16' rx='4' fill='rgba(255,255,255,0.4)'/><rect x='70' y='36' width='38' height='16' rx='4' fill='rgba(255,255,255,0.4)'/><rect x='18' y='46' width='94' height='30' rx='5' fill='currentColor'/><path d='M18,52 L112,52 L112,76 L18,76 Z' fill='rgba(255,255,255,0.2)'/><rect x='15' y='74' width='100' height='6' rx='2' fill='currentColor'/><rect x='20' y='80' width='8' height='8' rx='2' fill='currentColor'/><rect x='102' y='80' width='8' height='8' rx='2' fill='currentColor'/></svg>" }
    'bed_bunk' = { "<svg viewBox='0 0 110 130' width='100%' height='100%'><rect x='15' y='10' width='8' height='115' rx='2' fill='currentColor'/><rect x='87' y='10' width='8' height='115' rx='2' fill='currentColor'/><rect x='21' y='25' width='68' height='20' rx='3' fill='currentColor'/><rect x='25' y='20' width='60' height='6' rx='2' fill='currentColor'/><rect x='26' y='28' width='24' height='10' rx='3' fill='rgba(255,255,255,0.4)'/><rect x='21' y='80' width='68' height='20' rx='3' fill='currentColor'/><rect x='26' y='83' width='24' height='10' rx='3' fill='rgba(255,255,255,0.4)'/><rect x='72' y='25' width='4' height='80' fill='currentColor'/><rect x='82' y='25' width='4' height='80' fill='currentColor'/><line x1='72' y1='38' x2='82' y2='38' stroke='currentColor' stroke-width='3'/><line x1='72' y1='52' x2='82' y2='52' stroke='currentColor' stroke-width='3'/><line x1='72' y1='66' x2='82' y2='66' stroke='currentColor' stroke-width='3'/><line x1='72' y1='80' x2='82' y2='80' stroke='currentColor' stroke-width='3'/><line x1='72' y1='94' x2='82' y2='94' stroke='currentColor' stroke-width='3'/></svg>" }
    'baby_stroller' = { "<svg viewBox='0 0 100 110' width='100%' height='100%'><path d='M15,18 L32,45' stroke='currentColor' stroke-width='5' stroke-linecap='round'/><path d='M35,45 C35,28 65,28 72,45 L45,55 Z' fill='currentColor'/><path d='M35,50 L40,75 L75,75 L80,55 Z' fill='currentColor'/><line x1='32' y1='45' x2='42' y2='92' stroke='currentColor' stroke-width='4'/><line x1='65' y1='60' x2='82' y2='92' stroke='currentColor' stroke-width='4'/><circle cx='40' cy='95' r='10' fill='currentColor'/><circle cx='84' cy='95' r='10' fill='currentColor'/><circle cx='40' cy='95' r='4' fill='rgba(255,255,255,0.6)'/><circle cx='84' cy='95' r='4' fill='rgba(255,255,255,0.6)'/></svg>" }
    'shopping_cart' = { "<svg viewBox='0 0 110 100' width='100%' height='100%'><line x1='12' y1='22' x2='22' y2='22' stroke='currentColor' stroke-width='5' stroke-linecap='round'/><polygon points='22,25 95,30 85,68 32,68' fill='none' stroke='currentColor' stroke-width='4' stroke-linejoin='round'/><line x1='40' y1='28' x2='45' y2='68' stroke='rgba(255,255,255,0.35)' stroke-width='2'/><line x1='60' y1='29' x2='62' y2='68' stroke='rgba(255,255,255,0.35)' stroke-width='2'/><line x1='80' y1='29' x2='78' y2='68' stroke='rgba(255,255,255,0.35)' stroke-width='2'/><line x1='26' y1='44' x2='90' y2='44' stroke='rgba(255,255,255,0.35)' stroke-width='2'/><line x1='30' y1='56' x2='86' y2='56' stroke='rgba(255,255,255,0.35)' stroke-width='2'/><path d='M22,25 L34,80 L88,80' fill='none' stroke='currentColor' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/><circle cx='38' cy='88' r='6' fill='currentColor'/><circle cx='84' cy='88' r='6' fill='currentColor'/><circle cx='38' cy='88' r='2.5' fill='rgba(255,255,255,0.6)'/><circle cx='84' cy='88' r='2.5' fill='rgba(255,255,255,0.6)'/></svg>" }

    # Electronics & Gadgets
    'game_controller' = { "<svg viewBox='0 0 110 75' width='100%' height='100%'><path d='M22,18 C35,14 75,14 88,18 C102,22 108,48 98,68 C92,76 80,72 74,60 L68,48 L42,48 L36,60 C30,72 18,76 12,68 C2,48 8,22 22,18 Z' fill='currentColor'/><polygon points='26,30 32,30 32,24 38,24 38,30 44,30 44,36 38,36 38,42 32,42 32,36 26,36' fill='rgba(0,0,0,0.4)'/><circle cx='78' cy='28' r='3' fill='rgba(255,255,255,0.6)'/><circle cx='86' cy='33' r='3' fill='rgba(255,255,255,0.6)'/><circle cx='70' cy='33' r='3' fill='rgba(255,255,255,0.6)'/><circle cx='78' cy='38' r='3' fill='rgba(255,255,255,0.6)'/><circle cx='44' cy='46' r='7' fill='rgba(0,0,0,0.5)'/><circle cx='44' cy='46' r='4' fill='rgba(255,255,255,0.4)'/><circle cx='66' cy='46' r='7' fill='rgba(0,0,0,0.5)'/><circle cx='66' cy='46' r='4' fill='rgba(255,255,255,0.4)'/><rect x='45' y='20' width='20' height='12' rx='2' fill='rgba(0,0,0,0.3)'/></svg>" }
    'computer_mouse' = { "<svg viewBox='0 0 70 100' width='100%' height='100%'><path d='M35,15 C20,15 15,30 15,55 C15,80 22,90 35,90 C48,90 55,80 55,55 C55,30 50,15 35,15 Z' fill='currentColor'/><line x1='35' y1='15' x2='35' y2='45' stroke='rgba(0,0,0,0.4)' stroke-width='2'/><rect x='33' y='26' width='4' height='12' rx='2' fill='rgba(255,255,255,0.6)'/></svg>" }
    'laptop' = { "<svg viewBox='0 0 120 85' width='100%' height='100%'><polygon points='22,12 98,12 94,60 26,60' fill='currentColor'/><polygon points='27,16 93,16 90,56 30,56' fill='rgba(0,0,0,0.45)'/><polygon points='10,60 110,60 116,72 4,72' fill='currentColor'/><rect x='48' y='63' width='24' height='6' rx='1' fill='rgba(0,0,0,0.3)'/></svg>" }
    'tablet' = { "<svg viewBox='0 0 100 130' width='100%' height='100%'><rect x='5' y='5' width='90' height='120' rx='8' fill='currentColor'/><rect x='12' y='12' width='76' height='106' rx='4' fill='rgba(0,0,0,0.35)'/><circle cx='50' cy='8' r='2' fill='rgba(255,255,255,0.4)'/></svg>" }
    'smartwatch' = { "<svg viewBox='0 0 60 110' width='100%' height='100%'><rect x='18' y='8' width='24' height='94' rx='4' fill='rgba(0,0,0,0.35)'/><rect x='10' y='30' width='40' height='50' rx='10' fill='currentColor'/><rect x='14' y='34' width='32' height='42' rx='7' fill='rgba(0,0,0,0.4)'/></svg>" }
    'tv_screen' = { "<svg viewBox='0 0 130 90' width='100%' height='100%'><rect x='8' y='12' width='114' height='64' rx='3' fill='currentColor'/><rect x='12' y='16' width='106' height='56' rx='2' fill='rgba(0,0,0,0.45)'/><rect x='58' y='76' width='14' height='10' fill='currentColor'/><rect x='44' y='86' width='42' height='4' rx='2' fill='currentColor'/></svg>" }
    'wifi_router' = { "<svg viewBox='0 0 110 90' width='100%' height='100%'><line x1='28' y1='45' x2='15' y2='10' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><line x1='45' y1='45' x2='38' y2='8' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><line x1='65' y1='45' x2='72' y2='8' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><line x1='82' y1='45' x2='95' y2='10' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><rect x='18' y='45' width='74' height='25' rx='5' fill='currentColor'/><circle cx='35' cy='58' r='2' fill='#22c55e'/><circle cx='45' cy='58' r='2' fill='#22c55e'/><circle cx='55' cy='58' r='2' fill='#22c55e'/><circle cx='65' cy='58' r='2' fill='#22c55e'/></svg>" }
    'desktop_pc' = { "<svg viewBox='0 0 70 120' width='100%' height='100%'><rect x='10' y='10' width='50' height='100' rx='4' fill='currentColor'/><rect x='14' y='14' width='42' height='92' rx='2' fill='rgba(0,0,0,0.35)'/><circle cx='35' cy='40' r='12' fill='none' stroke='#38bdf8' stroke-width='3'/><circle cx='35' cy='72' r='12' fill='none' stroke='#f43f5e' stroke-width='3'/><circle cx='35' cy='18' r='3' fill='rgba(255,255,255,0.7)'/></svg>" }
    'arcade_cabinet' = { "<svg viewBox='0 0 80 130' width='100%' height='100%'><path d='M18,12 L64,12 L64,28 L52,42 L52,70 L64,74 L64,122 L18,122 Z' fill='currentColor'/><polygon points='22,15 60,15 60,26 22,26' fill='#38bdf8'/><polygon points='24,32 50,32 46,64 24,64' fill='rgba(0,0,0,0.5)' stroke='rgba(255,255,255,0.3)' stroke-width='2'/><circle cx='35' cy='48' r='5' fill='#f43f5e'/><polygon points='20,68 56,68 58,74 20,74' fill='rgba(255,255,255,0.2)'/><line x1='30' y1='70' x2='28' y2='63' stroke='#fff' stroke-width='2.5'/><circle cx='28' cy='63' r='2.5' fill='#ef4444'/><circle cx='40' cy='70' r='2' fill='#3b82f6'/><circle cx='46' cy='70' r='2' fill='#eab308'/><rect x='28' y='86' width='26' height='24' rx='2' fill='rgba(0,0,0,0.3)' stroke='rgba(255,255,255,0.2)' stroke-width='1.5'/><rect x='33' y='90' width='4' height='7' fill='orange'/><rect x='45' y='90' width='4' height='7' fill='orange'/></svg>" }
    'speaker_portable' = { "<svg viewBox='0 0 90 70' width='100%' height='100%'><rect x='10' y='15' width='70' height='40' rx='16' fill='currentColor'/><ellipse cx='30' cy='35' rx='12' ry='12' fill='rgba(0,0,0,0.35)'/><ellipse cx='60' cy='35' rx='12' ry='12' fill='rgba(0,0,0,0.35)'/><circle cx='30' cy='35' r='5' fill='rgba(255,255,255,0.5)'/><circle cx='60' cy='35' r='5' fill='rgba(255,255,255,0.5)'/></svg>" }
    'speaker_tower' = { "<svg viewBox='0 0 70 130' width='100%' height='100%'><rect x='12' y='8' width='46' height='114' rx='6' fill='currentColor'/><circle cx='35' cy='35' r='14' fill='rgba(0,0,0,0.45)' stroke='rgba(255,255,255,0.3)' stroke-width='2'/><circle cx='35' cy='35' r='6' fill='#38bdf8'/><circle cx='35' cy='80' r='16' fill='rgba(0,0,0,0.45)' stroke='rgba(255,255,255,0.3)' stroke-width='2'/><circle cx='35' cy='80' r='7' fill='#f43f5e'/><rect x='25' y='108' width='20' height='4' rx='2' fill='rgba(255,255,255,0.4)'/></svg>" }

    # Appliances & Kitchen
    'refrigerator' = { "<svg viewBox='0 0 70 140' width='100%' height='100%'><rect x='10' y='10' width='50' height='122' rx='5' fill='currentColor'/><rect x='12' y='12' width='46' height='38' rx='3' fill='rgba(0,0,0,0.15)'/><rect x='15' y='32' width='3' height='14' rx='1.5' fill='rgba(255,255,255,0.7)'/><line x1='10' y1='52' x2='60' y2='52' stroke='rgba(0,0,0,0.4)' stroke-width='3'/><rect x='12' y='54' width='46' height='75' rx='3' fill='rgba(0,0,0,0.15)'/><rect x='15' y='60' width='3' height='26' rx='1.5' fill='rgba(255,255,255,0.7)'/><rect x='14' y='132' width='8' height='4' rx='1' fill='currentColor'/><rect x='48' y='132' width='8' height='4' rx='1' fill='currentColor'/></svg>" }
    'washing_machine' = { "<svg viewBox='0 0 90 100' width='100%' height='100%'><rect x='12' y='8' width='66' height='82' rx='6' fill='currentColor'/><rect x='16' y='14' width='18' height='10' rx='2' fill='rgba(0,0,0,0.25)'/><circle cx='45' cy='19' r='5' fill='rgba(255,255,255,0.6)'/><rect x='56' y='16' width='18' height='6' rx='1' fill='rgba(0,0,0,0.3)'/><circle cx='45' cy='56' r='24' fill='rgba(0,0,0,0.35)' stroke='rgba(255,255,255,0.3)' stroke-width='4'/><circle cx='45' cy='56' r='16' fill='rgba(0,0,0,0.45)'/><path d='M35,62 Q45,52 55,62' stroke='rgba(255,255,255,0.3)' stroke-width='3' fill='none'/><rect x='16' y='90' width='10' height='4' rx='1' fill='currentColor'/><rect x='64' y='90' width='10' height='4' rx='1' fill='currentColor'/></svg>" }
    'stove_oven' = { "<svg viewBox='0 0 90 100' width='100%' height='100%'><rect x='12' y='15' width='66' height='75' rx='4' fill='currentColor'/><ellipse cx='28' cy='12' rx='8' ry='4' fill='currentColor'/><ellipse cx='62' cy='12' rx='8' ry='4' fill='currentColor'/><circle cx='22' cy='24' r='3' fill='rgba(255,255,255,0.6)'/><circle cx='34' cy='24' r='3' fill='rgba(255,255,255,0.6)'/><circle cx='56' cy='24' r='3' fill='rgba(255,255,255,0.6)'/><circle cx='68' cy='24' r='3' fill='rgba(255,255,255,0.6)'/><rect x='24' y='33' width='42' height='4' rx='2' fill='rgba(255,255,255,0.7)'/><rect x='20' y='42' width='50' height='36' rx='3' fill='rgba(0,0,0,0.45)' stroke='rgba(255,255,255,0.2)' stroke-width='2'/><line x1='24' y1='60' x2='66' y2='60' stroke='rgba(255,255,255,0.25)' stroke-width='2'/><rect x='16' y='90' width='8' height='4' fill='currentColor'/><rect x='66' y='90' width='8' height='4' fill='currentColor'/></svg>" }
    'microwave' = { "<svg viewBox='0 0 110 75' width='100%' height='100%'><rect x='10' y='10' width='90' height='55' rx='5' fill='currentColor'/><rect x='16' y='16' width='55' height='42' rx='3' fill='rgba(0,0,0,0.45)'/><rect x='76' y='18' width='18' height='10' rx='2' fill='rgba(0,0,0,0.5)'/><circle cx='85' cy='38' r='4' fill='rgba(255,255,255,0.5)'/><circle cx='85' cy='52' r='4' fill='rgba(255,255,255,0.5)'/></svg>" }
    'air_fryer' = { "<svg viewBox='0 0 90 100' width='100%' height='100%'><rect x='15' y='12' width='60' height='76' rx='18' fill='currentColor'/><ellipse cx='45' cy='24' rx='14' ry='6' fill='rgba(0,0,0,0.4)'/><circle cx='45' cy='24' r='3' fill='#38bdf8'/><path d='M18,40 L72,40 L70,80 C70,84 64,86 45,86 C26,86 20,84 20,80 Z' fill='rgba(0,0,0,0.2)' stroke='rgba(255,255,255,0.2)' stroke-width='1.5'/><rect x='41' y='48' width='8' height='24' rx='3' fill='rgba(255,255,255,0.7)'/></svg>" }
    'toaster' = { "<svg viewBox='0 0 100 80' width='100%' height='100%'><rect x='26' y='8' width='20' height='14' rx='3' fill='#d97706'/><rect x='54' y='8' width='20' height='14' rx='3' fill='#d97706'/><rect x='14' y='20' width='72' height='48' rx='12' fill='currentColor'/><rect x='24' y='18' width='24' height='4' rx='1' fill='rgba(0,0,0,0.4)'/><rect x='52' y='18' width='24' height='4' rx='1' fill='rgba(0,0,0,0.4)'/><rect x='84' y='32' width='6' height='16' rx='2' fill='rgba(255,255,255,0.7)'/></svg>" }
    'blender' = { "<svg viewBox='0 0 80 110' width='100%' height='100%'><polygon points='24,15 56,15 50,65 30,65' fill='rgba(255,255,255,0.3)' stroke='currentColor' stroke-width='3'/><path d='M54,25 C62,25 64,45 52,50' stroke='currentColor' stroke-width='4' fill='none'/><rect x='22' y='10' width='36' height='6' rx='2' fill='currentColor'/><rect x='25' y='65' width='30' height='35' rx='6' fill='currentColor'/><circle cx='40' cy='82' r='5' fill='rgba(255,255,255,0.6)'/></svg>" }
    'stand_mixer' = { "<svg viewBox='0 0 100 90' width='100%' height='100%'><rect x='20' y='72' width='60' height='10' rx='3' fill='currentColor'/><rect x='20' y='25' width='16' height='50' fill='currentColor'/><rect x='20' y='18' width='55' height='16' rx='6' fill='currentColor'/><path d='M44,45 L68,45 C68,65 44,65 44,45 Z' fill='rgba(255,255,255,0.4)' stroke='currentColor' stroke-width='3'/></svg>" }
    'coffee_maker' = { "<svg viewBox='0 0 80 100' width='100%' height='100%'><path d='M25,12 L55,12 L55,30 L35,30 L35,70 L55,70 L55,88 L25,88 Z' fill='currentColor'/><rect x='36' y='42' width='26' height='26' rx='4' fill='rgba(255,255,255,0.3)'/><path d='M62,46 C68,46 70,56 62,64' stroke='currentColor' stroke-width='3' fill='none'/></svg>" }
    'aquarium' = { "<svg viewBox='0 0 110 80' width='100%' height='100%'><rect x='10' y='15' width='90' height='55' rx='4' fill='none' stroke='currentColor' stroke-width='5'/><rect x='14' y='22' width='82' height='44' fill='rgba(56,189,248,0.25)'/><path d='M35,42 Q45,36 55,42 Q45,48 35,42 Z' fill='#f97316'/><polygon points='55,42 62,38 62,46' fill='#f97316'/><circle cx='40' cy='40' r='1' fill='#111'/></svg>" }
    'shipping_container' = { "<svg viewBox='0 0 160 75' width='100%' height='100%'><rect x='8' y='12' width='144' height='52' rx='2' fill='currentColor'/><line x1='20' y1='15' x2='20' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='32' y1='15' x2='32' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='44' y1='15' x2='44' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='56' y1='15' x2='56' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='68' y1='15' x2='68' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='80' y1='15' x2='80' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='92' y1='15' x2='92' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='104' y1='15' x2='104' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='116' y1='15' x2='116' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='128' y1='15' x2='128' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><line x1='140' y1='15' x2='140' y2='61' stroke='rgba(0,0,0,0.35)' stroke-width='3'/><rect x='9' y='13' width='6' height='6' fill='rgba(255,255,255,0.5)'/><rect x='145' y='13' width='6' height='6' fill='rgba(255,255,255,0.5)'/><rect x='9' y='57' width='6' height='6' fill='rgba(255,255,255,0.5)'/><rect x='145' y='57' width='6' height='6' fill='rgba(255,255,255,0.5)'/></svg>" }
    'concrete_mixer' = { "<svg viewBox='0 0 120 100' width='100%' height='100%'><polygon points='35,28 75,18 85,55 45,65' fill='currentColor'/><circle cx='78' cy='36' r='14' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='4'/><line x1='35' y1='50' x2='25' y2='85' stroke='currentColor' stroke-width='6'/><line x1='65' y1='50' x2='85' y2='85' stroke='currentColor' stroke-width='6'/><circle cx='30' cy='85' r='10' fill='currentColor'/><circle cx='85' cy='85' r='10' fill='currentColor'/></svg>" }

    # Luggage & Storage
    'backpack' = { "<svg viewBox='0 0 80 100' width='100%' height='100%'><path d='M32,15 C32,8 48,8 48,15' fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><path d='M18,30 C18,18 62,18 62,30 L65,85 C65,92 58,95 40,95 C22,95 15,92 15,85 Z' fill='currentColor'/><rect x='22' y='52' width='36' height='32' rx='6' fill='rgba(0,0,0,0.25)'/><line x1='25' y1='56' x2='55' y2='56' stroke='rgba(255,255,255,0.4)' stroke-width='2'/><line x1='22' y1='34' x2='58' y2='34' stroke='rgba(0,0,0,0.3)' stroke-width='2.5'/><path d='M15,40 C10,50 10,75 14,85' fill='none' stroke='currentColor' stroke-width='3'/><path d='M65,40 C70,50 70,75 66,85' fill='none' stroke='currentColor' stroke-width='3'/></svg>" }
    'suitcase_luggage' = { "<svg viewBox='0 0 80 120' width='100%' height='100%'><rect x='32' y='5' width='16' height='4' rx='2' fill='currentColor'/><line x1='34' y1='9' x2='34' y2='25' stroke='currentColor' stroke-width='3'/><line x1='46' y1='9' x2='46' y2='25' stroke='currentColor' stroke-width='3'/><rect x='16' y='25' width='48' height='75' rx='7' fill='currentColor'/><line x1='22' y1='40' x2='58' y2='40' stroke='rgba(0,0,0,0.25)' stroke-width='3' stroke-linecap='round'/><line x1='22' y1='55' x2='58' y2='55' stroke='rgba(0,0,0,0.25)' stroke-width='3' stroke-linecap='round'/><line x1='22' y1='70' x2='58' y2='70' stroke='rgba(0,0,0,0.25)' stroke-width='3' stroke-linecap='round'/><line x1='22' y1='85' x2='58' y2='85' stroke='rgba(0,0,0,0.25)' stroke-width='3' stroke-linecap='round'/><circle cx='24' cy='105' r='5' fill='currentColor'/><circle cx='56' cy='105' r='5' fill='currentColor'/></svg>" }
    'duffel_bag' = { "<svg viewBox='0 0 110 70' width='100%' height='100%'><rect x='15' y='22' width='80' height='40' rx='16' fill='currentColor'/><path d='M35,22 C35,10 75,10 75,22' fill='none' stroke='currentColor' stroke-width='4'/><line x1='15' y1='34' x2='95' y2='34' stroke='rgba(0,0,0,0.3)' stroke-width='3'/></svg>" }
    'toolbox' = { "<svg viewBox='0 0 100 80' width='100%' height='100%'><rect x='40' y='12' width='20' height='6' rx='2' fill='currentColor'/><rect x='12' y='22' width='76' height='48' rx='4' fill='currentColor'/><line x1='12' y1='36' x2='88' y2='36' stroke='rgba(0,0,0,0.4)' stroke-width='3'/><rect x='44' y='32' width='12' height='10' rx='2' fill='rgba(255,255,255,0.5)'/></svg>" }
    'wardrobe' = { "<svg viewBox='0 0 110 130' width='100%' height='100%'><rect x='12' y='8' width='86' height='114' rx='3' fill='currentColor'/><rect x='16' y='12' width='37' height='86' rx='2' fill='rgba(0,0,0,0.15)'/><rect x='57' y='12' width='37' height='86' rx='2' fill='rgba(0,0,0,0.15)'/><rect x='48' y='45' width='3' height='22' rx='1.5' fill='rgba(255,255,255,0.7)'/><rect x='59' y='45' width='3' height='22' rx='1.5' fill='rgba(255,255,255,0.7)'/><rect x='16' y='102' width='37' height='16' rx='2' fill='rgba(0,0,0,0.25)'/><rect x='57' y='102' width='37' height='16' rx='2' fill='rgba(0,0,0,0.25)'/></svg>" }
    'bookshelf' = { "<svg viewBox='0 0 90 130' width='100%' height='100%'><rect x='12' y='8' width='66' height='116' rx='2' fill='currentColor'/><rect x='16' y='12' width='58' height='108' fill='rgba(0,0,0,0.2)'/><line x1='16' y1='38' x2='74' y2='38' stroke='currentColor' stroke-width='4'/><line x1='16' y1='66' x2='74' y2='66' stroke='currentColor' stroke-width='4'/><line x1='16' y1='94' x2='74' y2='94' stroke='currentColor' stroke-width='4'/><rect x='20' y='18' width='6' height='18' fill='#ef4444'/><rect x='27' y='15' width='8' height='21' fill='#3b82f6'/><rect x='36' y='20' width='5' height='16' fill='#eab308'/><rect x='42' y='16' width='7' height='20' fill='#10b981'/><rect x='20' y='46' width='7' height='18' fill='#8b5cf6'/><rect x='28' y='44' width='6' height='20' fill='#ec4899'/><rect x='20' y='74' width='8' height='18' fill='#06b6d4'/><rect x='29' y='72' width='7' height='20' fill='#84cc16'/></svg>" }
    'sofa_couch' = { "<svg viewBox='0 0 140 80' width='100%' height='100%'><rect x='15' y='18' width='110' height='30' rx='6' fill='currentColor'/><rect x='10' y='32' width='18' height='32' rx='6' fill='currentColor'/><rect x='112' y='32' width='18' height='32' rx='6' fill='currentColor'/><rect x='28' y='42' width='41' height='20' rx='4' fill='rgba(0,0,0,0.2)'/><rect x='71' y='42' width='41' height='20' rx='4' fill='rgba(0,0,0,0.2)'/><rect x='14' y='64' width='112' height='6' fill='currentColor'/><rect x='20' y='70' width='6' height='6' rx='1' fill='currentColor'/><rect x='114' y='70' width='6' height='6' rx='1' fill='currentColor'/></svg>" }

    # Musical Instruments
    'accordion' = { "<svg viewBox='0 0 100 90' width='100%' height='100%'><rect x='10' y='15' width='18' height='60' rx='3' fill='currentColor'/><circle cx='19' cy='30' r='2' fill='rgba(255,255,255,0.7)'/><circle cx='19' cy='40' r='2' fill='rgba(255,255,255,0.7)'/><circle cx='19' cy='50' r='2' fill='rgba(255,255,255,0.7)'/><circle cx='19' cy='60' r='2' fill='rgba(255,255,255,0.7)'/><polygon points='28,15 34,22 30,30 36,37 30,45 36,52 30,60 36,67 30,75 70,75 64,67 70,60 64,52 70,45 64,37 70,30 64,22 70,15' fill='rgba(0,0,0,0.3)' stroke='currentColor' stroke-width='2'/><rect x='72' y='12' width='20' height='66' rx='3' fill='currentColor'/><rect x='84' y='16' width='6' height='58' fill='white'/><rect x='84' y='22' width='4' height='4' fill='black'/><rect x='84' y='30' width='4' height='4' fill='black'/><rect x='84' y='42' width='4' height='4' fill='black'/><rect x='84' y='50' width='4' height='4' fill='black'/><rect x='84' y='58' width='4' height='4' fill='black'/></svg>" }
    'upright_piano' = { "<svg viewBox='0 0 110 110' width='100%' height='100%'><rect x='15' y='12' width='80' height='45' rx='3' fill='currentColor'/><rect x='20' y='16' width='70' height='36' rx='2' fill='rgba(0,0,0,0.2)'/><rect x='35' y='36' width='40' height='3' rx='1' fill='rgba(255,255,255,0.6)'/><rect x='10' y='57' width='90' height='16' rx='3' fill='currentColor'/><rect x='14' y='60' width='82' height='8' fill='white'/><line x1='24' y1='60' x2='24' y2='65' stroke='black' stroke-width='2'/><line x1='34' y1='60' x2='34' y2='65' stroke='black' stroke-width='2'/><line x1='44' y1='60' x2='44' y2='65' stroke='black' stroke-width='2'/><line x1='54' y1='60' x2='54' y2='65' stroke='black' stroke-width='2'/><line x1='64' y1='60' x2='64' y2='65' stroke='black' stroke-width='2'/><line x1='74' y1='60' x2='74' y2='65' stroke='black' stroke-width='2'/><line x1='84' y1='60' x2='84' y2='65' stroke='black' stroke-width='2'/><rect x='18' y='73' width='74' height='26' fill='currentColor'/><rect x='14' y='73' width='6' height='26' rx='2' fill='currentColor'/><rect x='90' y='73' width='6' height='26' rx='2' fill='currentColor'/><rect x='48' y='99' width='3' height='5' fill='#f59e0b'/><rect x='54' y='99' width='3' height='5' fill='#f59e0b'/><rect x='60' y='99' width='3' height='5' fill='#f59e0b'/></svg>" }
    'grand_piano' = { "<svg viewBox='0 0 130 90' width='100%' height='100%'><path d='M20,60 L20,35 C20,35 40,15 75,15 C105,15 115,35 115,60 Z' fill='currentColor'/><line x1='20' y1='35' x2='75' y2='5' stroke='currentColor' stroke-width='3'/><rect x='20' y='58' width='95' height='8' fill='white'/><line x1='25' y1='66' x2='25' y2='84' stroke='currentColor' stroke-width='5'/><line x1='105' y1='66' x2='105' y2='84' stroke='currentColor' stroke-width='5'/></svg>" }
    'drum_kit' = { "<svg viewBox='0 0 140 100' width='100%' height='100%'><circle cx='70' cy='62' r='26' fill='currentColor'/><circle cx='70' cy='62' r='22' fill='rgba(0,0,0,0.3)' stroke='rgba(255,255,255,0.2)' stroke-width='2'/><line x1='50' y1='75' x2='38' y2='92' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><line x1='90' y1='75' x2='102' y2='92' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><rect x='52' y='22' width='16' height='14' rx='2' fill='currentColor'/><ellipse cx='60' cy='22' rx='8' ry='3' fill='rgba(255,255,255,0.4)'/><rect x='72' y='22' width='16' height='14' rx='2' fill='currentColor'/><ellipse cx='80' cy='22' rx='8' ry='3' fill='rgba(255,255,255,0.4)'/><line x1='34' y1='48' x2='34' y2='88' stroke='currentColor' stroke-width='3'/><rect x='24' y='42' width='20' height='10' rx='2' fill='currentColor'/><ellipse cx='34' cy='42' rx='10' ry='3' fill='rgba(255,255,255,0.5)'/><rect x='96' y='46' width='22' height='20' rx='2' fill='currentColor'/><ellipse cx='107' cy='46' rx='11' ry='3' fill='rgba(255,255,255,0.4)'/><line x1='16' y1='18' x2='16' y2='88' stroke='currentColor' stroke-width='3'/><ellipse cx='16' cy='32' rx='14' ry='3' fill='#f59e0b'/><line x1='124' y1='12' x2='124' y2='88' stroke='currentColor' stroke-width='3'/><ellipse cx='124' cy='22' rx='16' ry='4' fill='#f59e0b'/></svg>" }
    'drum_snare' = { "<svg viewBox='0 0 100 80' width='100%' height='100%'><ellipse cx='50' cy='25' rx='36' ry='12' fill='currentColor'/><rect x='14' y='25' width='72' height='30' fill='currentColor'/><ellipse cx='50' cy='55' rx='36' ry='12' fill='rgba(0,0,0,0.3)'/><ellipse cx='50' cy='25' rx='32' ry='10' fill='white'/></svg>" }
    'guitar_acoustic' = { "<svg viewBox='0 0 70 140' width='100%' height='100%'><polygon points='31,6 39,6 38,20 32,20' fill='currentColor'/><circle cx='29' cy='10' r='2' fill='rgba(255,255,255,0.7)'/><circle cx='29' cy='16' r='2' fill='rgba(255,255,255,0.7)'/><circle cx='41' cy='10' r='2' fill='rgba(255,255,255,0.7)'/><circle cx='41' cy='16' r='2' fill='rgba(255,255,255,0.7)'/><rect x='32' y='20' width='6' height='45' fill='currentColor'/><line x1='32' y1='30' x2='38' y2='30' stroke='rgba(255,255,255,0.5)' stroke-width='1'/><line x1='32' y1='40' x2='38' y2='40' stroke='rgba(255,255,255,0.5)' stroke-width='1'/><line x1='32' y1='50' x2='38' y2='50' stroke='rgba(255,255,255,0.5)' stroke-width='1'/><path d='M35,65 C22,65 18,74 18,85 C18,92 24,96 20,104 C15,114 15,130 35,130 C55,130 55,114 50,104 C46,96 52,92 52,85 C52,74 48,65 35,65 Z' fill='currentColor'/><circle cx='35' cy='88' r='7' fill='rgba(0,0,0,0.5)' stroke='rgba(255,255,255,0.3)' stroke-width='2'/><rect x='28' y='108' width='14' height='4' rx='1' fill='rgba(0,0,0,0.4)'/><line x1='35' y1='20' x2='35' y2='108' stroke='rgba(255,255,255,0.5)' stroke-width='1'/></svg>" }
    'guitar_electric' = { "<svg viewBox='0 0 60 140' width='100%' height='100%'><polygon points='26,6 34,6 33,25 27,25' fill='currentColor'/><rect x='28' y='25' width='4' height='45' fill='currentColor'/><path d='M30,70 C16,68 12,78 20,86 C12,94 18,126 34,126 C48,126 50,104 42,94 C46,86 42,76 36,70 Z' fill='currentColor'/><rect x='26' y='88' width='8' height='4' fill='white'/><rect x='26' y='96' width='8' height='4' fill='white'/></svg>" }
    'bass_guitar' = { "<svg viewBox='0 0 60 145' width='100%' height='100%'><polygon points='26,4 34,4 33,28 27,28' fill='currentColor'/><rect x='28' y='28' width='4' height='55' fill='currentColor'/><path d='M30,83 C16,81 12,91 20,99 C12,107 18,136 34,136 C48,136 50,114 42,104 C46,96 42,88 36,83 Z' fill='currentColor'/></svg>" }
    'ukulele' = { "<svg viewBox='0 0 50 110' width='100%' height='100%'><rect x='23' y='10' width='4' height='35' fill='currentColor'/><ellipse cx='25' cy='62' rx='12' ry='14' fill='currentColor'/><ellipse cx='25' cy='85' rx='16' ry='18' fill='currentColor'/><circle cx='25' cy='72' r='5' fill='rgba(0,0,0,0.5)'/></svg>" }
    'violin' = { "<svg viewBox='0 0 55 130' width='100%' height='100%'><rect x='26' y='12' width='3' height='40' fill='currentColor'/><path d='M27,52 C16,52 14,64 20,72 C12,80 14,106 27,106 C40,106 42,80 34,72 C40,64 38,52 27,52 Z' fill='currentColor'/><line x1='12' y1='30' x2='42' y2='110' stroke='rgba(255,255,255,0.7)' stroke-width='2'/></svg>" }
    'cello' = { "<svg viewBox='0 0 65 145' width='100%' height='100%'><rect x='31' y='10' width='3' height='45' fill='currentColor'/><path d='M32,55 C18,55 15,70 23,80 C14,90 16,122 32,122 C48,122 50,90 41,80 C49,70 46,55 32,55 Z' fill='currentColor'/><line x1='32' y1='122' x2='32' y2='140' stroke='currentColor' stroke-width='3'/></svg>" }
    'saxophone' = { "<svg viewBox='0 0 80 120' width='100%' height='100%'><path d='M25,15 L35,15 L35,80 C35,100 55,100 55,80 L55,60 L70,60 L70,82 C70,110 25,110 25,80 Z' fill='currentColor'/><polygon points='20,15 40,15 35,8 25,8' fill='currentColor'/></svg>" }
    'trumpet' = { "<svg viewBox='0 0 120 60' width='100%' height='100%'><path d='M15,30 L95,20 L110,10 L110,50 L95,40 L15,30 Z' fill='currentColor'/><rect x='45' y='15' width='4' height='15' fill='currentColor'/><rect x='55' y='15' width='4' height='15' fill='currentColor'/><rect x='65' y='15' width='4' height='15' fill='currentColor'/></svg>" }
    'flute' = { "<svg viewBox='0 0 140 30' width='100%' height='100%'><rect x='10' y='12' width='120' height='6' rx='3' fill='currentColor'/><circle cx='40' cy='15' r='1.5' fill='rgba(0,0,0,0.5)'/><circle cx='55' cy='15' r='1.5' fill='rgba(0,0,0,0.5)'/><circle cx='70' cy='15' r='1.5' fill='rgba(0,0,0,0.5)'/></svg>" }

    # Small & Pocket Items
    'ant' = { "<svg viewBox='0 0 100 80' width='100%' height='100%'><ellipse cx='26' cy='45' rx='18' ry='14' fill='currentColor'/><circle cx='46' cy='45' r='4' fill='currentColor'/><ellipse cx='58' cy='45' rx='10' ry='8' fill='currentColor'/><circle cx='76' cy='42' r='8' fill='currentColor'/><path d='M82,40 L88,38 L84,43' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'/><path d='M76,36 C80,24 88,20 92,15' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round'/><path d='M74,36 C72,24 76,18 78,12' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round'/><path d='M48,45 L40,28 L32,22' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round'/><path d='M56,45 L54,26 L50,18' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round'/><path d='M62,45 L68,28 L74,22' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round'/><path d='M48,45 L38,62 L28,70' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round'/><path d='M56,45 L54,64 L52,74' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round'/><path d='M62,45 L70,62 L78,72' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round'/></svg>" }
    'coffee_bean' = { "<svg viewBox='0 0 90 90' width='100%' height='100%'><ellipse cx='45' cy='45' rx='32' ry='40' fill='#78350f'/><path d='M45,10 Q34,35 48,50 Q36,68 45,80' fill='none' stroke='#3e1d08' stroke-width='6' stroke-linecap='round'/></svg>" }
    'bee' = { "<svg viewBox='0 0 90 90' width='100%' height='100%'><ellipse cx='42' cy='22' rx='20' ry='10' transform='rotate(-25 42 22)' fill='rgba(255,255,255,0.35)' stroke='rgba(255,255,255,0.6)' stroke-width='1.5'/><ellipse cx='58' cy='24' rx='16' ry='8' transform='rotate(15 58 24)' fill='rgba(255,255,255,0.3)' stroke='rgba(255,255,255,0.6)' stroke-width='1.5'/><ellipse cx='36' cy='55' rx='22' ry='16' fill='#eab308'/><path d='M22,46 C26,42 28,68 22,64' stroke='#111' stroke-width='5' fill='none'/><path d='M32,40 C36,40 38,70 32,70' stroke='#111' stroke-width='5' fill='none'/><path d='M42,40 C46,40 48,70 42,70' stroke='#111' stroke-width='5' fill='none'/><polygon points='14,55 10,55 14,53' fill='#111'/><circle cx='58' cy='52' r='12' fill='#111'/><circle cx='70' cy='50' r='9' fill='#111'/><circle cx='72' cy='48' r='3' fill='rgba(255,255,255,0.7)'/><path d='M74,44 C78,35 84,32 86,30' fill='none' stroke='#111' stroke-width='2' stroke-linecap='round'/></svg>" }
    'ladybug' = { "<svg viewBox='0 0 80 80' width='100%' height='100%'><path d='M20,25 L10,18 M20,40 L8,40 M20,55 L10,62' stroke='currentColor' stroke-width='3' stroke-linecap='round'/><path d='M60,25 L70,18 M60,40 L72,40 M60,55 L70,62' stroke='currentColor' stroke-width='3' stroke-linecap='round'/><circle cx='40' cy='44' r='26' fill='#ef4444'/><line x1='40' y1='18' x2='40' y2='70' stroke='#111' stroke-width='3'/><circle cx='28' cy='34' r='5' fill='#111'/><circle cx='52' cy='34' r='5' fill='#111'/><circle cx='26' cy='52' r='5' fill='#111'/><circle cx='54' cy='52' r='5' fill='#111'/><circle cx='38' cy='62' r='4' fill='#111'/><circle cx='42' cy='62' r='4' fill='#111'/><circle cx='40' cy='18' r='10' fill='#111'/><path d='M36,12 C34,6 30,4 26,4' stroke='#111' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M44,12 C46,6 50,4 54,4' stroke='#111' stroke-width='2' fill='none' stroke-linecap='round'/></svg>" }
    'tooth' = { "<svg viewBox='0 0 80 100' width='100%' height='100%'><path d='M15,35 C15,15 30,12 40,18 C50,12 65,15 65,35 C65,50 60,60 55,75 C52,85 48,92 46,92 C44,92 44,80 40,65 C36,80 36,92 34,92 C32,92 28,85 25,75 C20,60 15,50 15,35 Z' fill='currentColor'/><ellipse cx='30' cy='25' rx='6' ry='3' fill='rgba(255,255,255,0.4)'/><ellipse cx='50' cy='25' rx='6' ry='3' fill='rgba(255,255,255,0.4)'/></svg>" }
    'jewelry_ring' = { "<svg viewBox='0 0 80 90' width='100%' height='100%'><circle cx='40' cy='52' r='26' fill='none' stroke='currentColor' stroke-width='8'/><circle cx='40' cy='52' r='20' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'/><polygon points='40,12 50,22 40,26 30,22' fill='#38bdf8'/><polygon points='35,16 45,16 48,22 32,22' fill='#e0f2fe'/></svg>" }
    'key' = { "<svg viewBox='0 0 60 120' width='100%' height='100%'><circle cx='30' cy='25' r='18' fill='currentColor'/><circle cx='30' cy='25' r='8' fill='rgba(0,0,0,0.5)'/><rect x='27' y='42' width='6' height='70' rx='2' fill='currentColor'/><rect x='33' y='85' width='10' height='5' fill='currentColor'/><rect x='33' y='96' width='14' height='6' fill='currentColor'/><rect x='33' y='107' width='8' height='4' fill='currentColor'/></svg>" }
    'screw_bolt' = { "<svg viewBox='0 0 60 100' width='100%' height='100%'><rect x='15' y='12' width='30' height='10' rx='2' fill='currentColor'/><line x1='24' y1='14' x2='36' y2='14' stroke='rgba(0,0,0,0.4)' stroke-width='3'/><rect x='24' y='22' width='12' height='65' fill='currentColor'/><polygon points='24,87 36,87 30,96' fill='currentColor'/><line x1='21' y1='34' x2='39' y2='30' stroke='rgba(255,255,255,0.5)' stroke-width='3'/><line x1='21' y1='46' x2='39' y2='42' stroke='rgba(255,255,255,0.5)' stroke-width='3'/><line x1='21' y1='58' x2='39' y2='54' stroke='rgba(255,255,255,0.5)' stroke-width='3'/><line x1='21' y1='70' x2='39' y2='66' stroke='rgba(255,255,255,0.5)' stroke-width='3'/><line x1='21' y1='82' x2='39' y2='78' stroke='rgba(255,255,255,0.5)' stroke-width='3'/></svg>" }
    'safety_pin' = { "<svg viewBox='0 0 60 110' width='100%' height='100%'><path d='M20,95 L20,30 C20,18 40,18 40,30 L40,95 C40,102 20,102 20,95 Z' fill='none' stroke='currentColor' stroke-width='5'/><rect x='15' y='18' width='30' height='16' rx='5' fill='currentColor'/><circle cx='30' cy='96' r='6' fill='none' stroke='currentColor' stroke-width='4'/></svg>" }
    'paperclip' = { "<svg viewBox='0 0 60 100' width='100%' height='100%'><path d='M25,80 L25,30 C25,18 45,18 45,30 L45,75 C45,88 15,88 15,75 L15,22 C15,5 55,5 55,22 L55,70' fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round'/></svg>" }
    'earbuds' = { "<svg viewBox='0 0 80 80' width='100%' height='100%'><circle cx='30' cy='28' r='10' fill='currentColor'/><rect x='28' y='32' width='5' height='26' rx='2.5' fill='currentColor'/><circle cx='54' cy='32' r='10' fill='currentColor'/><rect x='52' y='36' width='5' height='26' rx='2.5' fill='currentColor'/><circle cx='28' cy='28' r='4' fill='rgba(0,0,0,0.35)'/><circle cx='52' cy='32' r='4' fill='rgba(0,0,0,0.35)'/></svg>" }
    'fan_desk' = { "<svg viewBox='0 0 90 120' width='100%' height='100%'><circle cx='45' cy='45' r='36' fill='none' stroke='currentColor' stroke-width='5'/><circle cx='45' cy='45' r='10' fill='currentColor'/><path d='M45,45 C35,25 45,15 50,15 C55,25 45,45 45,45 Z' fill='rgba(255,255,255,0.5)'/><path d='M45,45 C65,40 75,50 72,56 C62,56 45,45 45,45 Z' fill='rgba(255,255,255,0.5)'/><path d='M45,45 C35,65 25,60 25,54 C30,48 45,45 45,45 Z' fill='rgba(255,255,255,0.5)'/><rect x='41' y='81' width='8' height='26' rx='2' fill='currentColor'/><ellipse cx='45' cy='110' rx='28' ry='8' fill='currentColor'/></svg>" }
    'vacuum_stick' = { "<svg viewBox='0 0 60 140' width='100%' height='100%'><path d='M25,10 C25,5 35,5 35,10 L35,25 L25,25 Z' fill='currentColor'/><rect x='22' y='25' width='16' height='35' rx='5' fill='currentColor'/><rect x='25' y='32' width='10' height='22' rx='2' fill='rgba(0,0,0,0.35)'/><rect x='28' y='60' width='4' height='64' fill='rgba(255,255,255,0.6)'/><polygon points='12,134 48,134 44,124 16,124' fill='currentColor'/><circle cx='18' cy='134' r='3' fill='rgba(0,0,0,0.4)'/><circle cx='42' cy='134' r='3' fill='rgba(0,0,0,0.4)'/></svg>" }
    'hair_dryer' = { "<svg viewBox='0 0 100 85' width='100%' height='100%'><rect x='15' y='18' width='22' height='20' rx='2' fill='currentColor'/><rect x='34' y='14' width='44' height='28' rx='8' fill='currentColor'/><ellipse cx='78' cy='28' rx='4' ry='12' fill='rgba(0,0,0,0.4)'/><path d='M50,42 L56,76 C56,80 46,80 44,76 L40,42 Z' fill='currentColor'/><rect x='42' y='52' width='4' height='8' rx='1' fill='#ef4444'/></svg>" }
    'drill' = { "<svg viewBox='0 0 110 90' width='100%' height='100%'><rect x='85' y='22' width='10' height='12' fill='rgba(255,255,255,0.5)'/><polygon points='95,27 108,27 105,29' fill='currentColor'/><rect x='25' y='16' width='60' height='26' rx='5' fill='currentColor'/><rect x='30' y='20' width='20' height='6' rx='1' fill='rgba(0,0,0,0.3)'/><path d='M42,42 L48,76 L62,76 L54,42 Z' fill='currentColor'/><rect x='55' y='48' width='6' height='8' rx='2' fill='#ef4444'/><rect x='42' y='74' width='32' height='12' rx='3' fill='rgba(0,0,0,0.35)'/></svg>" }
    'step_ladder' = { "<svg viewBox='0 0 90 120' width='100%' height='100%'><line x1='45' y1='15' x2='18' y2='112' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><line x1='45' y1='15' x2='72' y2='112' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><rect x='38' y='10' width='14' height='6' rx='2' fill='currentColor'/><line x1='37' y1='40' x2='53' y2='40' stroke='currentColor' stroke-width='4'/><line x1='30' y1='65' x2='60' y2='65' stroke='currentColor' stroke-width='4'/><line x1='24' y1='90' x2='66' y2='90' stroke='currentColor' stroke-width='4'/></svg>" }
    'hammer' = { "<svg viewBox='0 0 80 110' width='100%' height='100%'><rect x='36' y='26' width='8' height='80' rx='3' fill='currentColor'/><polygon points='14,14 66,14 62,26 18,26' fill='currentColor'/><path d='M62,14 C72,16 76,28 72,36' stroke='currentColor' stroke-width='6' fill='none' stroke-linecap='round'/></svg>" }
    'screwdriver' = { "<svg viewBox='0 0 50 120' width='100%' height='100%'><rect x='20' y='10' width='10' height='45' rx='4' fill='currentColor'/><rect x='23' y='55' width='4' height='55' fill='currentColor'/><polygon points='21,110 29,110 25,116' fill='currentColor'/></svg>" }
    'pliers' = { "<svg viewBox='0 0 70 120' width='100%' height='100%'><path d='M25,15 L32,38 L22,110' stroke='currentColor' stroke-width='6' stroke-linecap='round' fill='none'/><path d='M45,15 L38,38 L48,110' stroke='currentColor' stroke-width='6' stroke-linecap='round' fill='none'/><circle cx='35' cy='38' r='5' fill='rgba(0,0,0,0.4)'/></svg>" }

    # Vehicles
    'bicycle' = { "<svg viewBox='0 0 140 90' width='100%' height='100%'><circle cx='28' cy='62' r='22' fill='none' stroke='currentColor' stroke-width='5'/><circle cx='28' cy='62' r='3' fill='currentColor'/><line x1='28' y1='40' x2='28' y2='84' stroke='rgba(255,255,255,0.3)' stroke-width='1.5'/><line x1='6' y1='62' x2='50' y2='62' stroke='rgba(255,255,255,0.3)' stroke-width='1.5'/><circle cx='112' cy='62' r='22' fill='none' stroke='currentColor' stroke-width='5'/><circle cx='112' cy='62' r='3' fill='currentColor'/><line x1='112' y1='40' x2='112' y2='84' stroke='rgba(255,255,255,0.3)' stroke-width='1.5'/><line x1='90' y1='62' x2='134' y2='62' stroke='rgba(255,255,255,0.3)' stroke-width='1.5'/><path d='M28,62 L60,62 L94,36 L48,36 Z' fill='none' stroke='currentColor' stroke-width='6' stroke-linejoin='round'/><line x1='60' y1='62' x2='50' y2='30' stroke='currentColor' stroke-width='5'/><path d='M42,28 C45,26 58,26 60,30' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><line x1='112' y1='62' x2='92' y2='22' stroke='currentColor' stroke-width='5'/><path d='M86,22 C92,20 98,20 102,24' stroke='currentColor' stroke-width='5' stroke-linecap='round' fill='none'/><circle cx='60' cy='62' r='6' fill='rgba(0,0,0,0.3)'/></svg>" }
    'motorcycle' = { "<svg viewBox='0 0 140 85' width='100%' height='100%'><circle cx='28' cy='58' r='18' fill='none' stroke='currentColor' stroke-width='8'/><circle cx='28' cy='58' r='8' fill='rgba(255,255,255,0.3)'/><circle cx='112' cy='58' r='18' fill='none' stroke='currentColor' stroke-width='8'/><circle cx='112' cy='58' r='8' fill='rgba(255,255,255,0.3)'/><rect x='48' y='46' width='28' height='22' rx='4' fill='currentColor'/><line x1='48' y1='52' x2='76' y2='52' stroke='rgba(0,0,0,0.3)' stroke-width='2'/><line x1='48' y1='58' x2='76' y2='58' stroke='rgba(0,0,0,0.3)' stroke-width='2'/><path d='M68,64 L30,68' stroke='rgba(255,255,255,0.6)' stroke-width='4' stroke-linecap='round'/><path d='M42,38 C48,26 72,26 80,36 C88,40 102,32 108,34 L110,42 L95,44 L78,42 C68,44 56,44 42,38 Z' fill='currentColor'/><path d='M44,38 Q56,44 68,36' stroke='rgba(0,0,0,0.3)' stroke-width='4' fill='none'/><line x1='112' y1='58' x2='96' y2='24' stroke='currentColor' stroke-width='5'/><line x1='90' y1='22' x2='102' y2='22' stroke='currentColor' stroke-width='5' stroke-linecap='round'/><polygon points='102,28 112,30 106,36' fill='#facc15'/></svg>" }
    'car_fusca' = { "<svg viewBox='0 0 150 75' width='100%' height='100%'><path d='M8,52 C10,40 22,34 35,36 C42,20 62,12 85,12 C105,12 125,22 135,38 C144,40 148,46 148,54 L142,56 C140,46 130,42 120,42 C110,42 102,48 100,56 L50,56 C48,48 40,42 30,42 C20,42 12,46 10,56 Z' fill='currentColor'/><circle cx='30' cy='56' r='14' fill='rgba(0,0,0,0.35)'/><circle cx='120' cy='56' r='14' fill='rgba(0,0,0,0.35)'/><circle cx='30' cy='56' r='6' fill='rgba(255,255,255,0.6)'/><circle cx='120' cy='56' r='6' fill='rgba(255,255,255,0.6)'/><path d='M52,34 C55,20 70,16 82,16 L82,34 Z' fill='rgba(0,0,0,0.35)'/><path d='M86,16 C98,16 112,22 118,34 L86,34 Z' fill='rgba(0,0,0,0.35)'/><rect x='4' y='52' width='6' height='6' rx='2' fill='rgba(255,255,255,0.7)'/><rect x='144' y='52' width='6' height='6' rx='2' fill='rgba(255,255,255,0.7)'/></svg>" }
    'car_sedan' = { "<svg viewBox='0 0 160 80' width='100%' height='100%'><path d='M10,55 C10,50 20,40 35,40 L50,40 C60,25 75,18 95,18 C115,18 135,32 145,45 L155,50 C158,52 160,56 160,60 L160,68 C160,70 158,72 155,72 L145,72 C145,62 135,55 125,55 C115,55 105,62 105,72 L55,72 C55,62 45,55 35,55 C25,55 15,62 15,72 L5,72 C2,72 0,70 0,68 L0,60 Z' fill='currentColor'/><circle cx='35' cy='72' r='15' fill='rgba(0,0,0,0.4)'/><circle cx='125' cy='72' r='15' fill='rgba(0,0,0,0.4)'/><path d='M60,38 C68,26 80,24 95,24 C108,24 122,30 128,38 Z' fill='rgba(0,0,0,0.3)'/></svg>" }
    'truck_semi' = { "<svg viewBox='0 0 170 80' width='100%' height='100%'><rect x='8' y='15' width='105' height='46' rx='3' fill='currentColor'/><line x1='8' y1='40' x2='113' y2='40' stroke='rgba(0,0,0,0.2)' stroke-width='2'/><path d='M115,35 L135,35 L145,46 L158,46 L158,61 L115,61 Z' fill='currentColor'/><polygon points='128,38 140,38 145,46 128,46' fill='rgba(0,0,0,0.4)'/><rect x='118' y='18' width='3' height='17' fill='currentColor'/><circle cx='24' cy='63' r='10' fill='currentColor'/><circle cx='46' cy='63' r='10' fill='currentColor'/><circle cx='104' cy='63' r='10' fill='currentColor'/><circle cx='124' cy='63' r='10' fill='currentColor'/><circle cx='148' cy='63' r='10' fill='currentColor'/><circle cx='24' cy='63' r='4' fill='rgba(255,255,255,0.5)'/><circle cx='46' cy='63' r='4' fill='rgba(255,255,255,0.5)'/><circle cx='104' cy='63' r='4' fill='rgba(255,255,255,0.5)'/><circle cx='124' cy='63' r='4' fill='rgba(255,255,255,0.5)'/><circle cx='148' cy='63' r='4' fill='rgba(255,255,255,0.5)'/></svg>" }
    'tractor_farm' = { "<svg viewBox='0 0 130 90' width='100%' height='100%'><rect x='28' y='18' width='36' height='6' rx='2' fill='currentColor'/><line x1='34' y1='24' x2='34' y2='52' stroke='currentColor' stroke-width='4'/><line x1='60' y1='24' x2='60' y2='52' stroke='currentColor' stroke-width='4'/><rect x='36' y='26' width='22' height='22' fill='rgba(0,0,0,0.3)'/><polygon points='62,40 108,44 108,62 62,62' fill='currentColor'/><line x1='80' y1='40' x2='80' y2='20' stroke='currentColor' stroke-width='3'/><circle cx='42' cy='62' r='24' fill='currentColor'/><circle cx='42' cy='62' r='14' fill='rgba(0,0,0,0.4)' stroke='rgba(255,255,255,0.3)' stroke-width='2'/><circle cx='42' cy='62' r='5' fill='currentColor'/><circle cx='98' cy='68' r='14' fill='currentColor'/><circle cx='98' cy='68' r='7' fill='rgba(0,0,0,0.4)'/></svg>" }
    'bus_city' = { "<svg viewBox='0 0 170 85' width='100%' height='100%'><rect x='5' y='10' width='160' height='60' rx='8' fill='currentColor'/><rect x='12' y='18' width='30' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><rect x='48' y='18' width='30' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><rect x='84' y='18' width='30' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><rect x='120' y='18' width='40' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><circle cx='45' cy='70' r='14' fill='rgba(0,0,0,0.4)'/><circle cx='130' cy='70' r='14' fill='rgba(0,0,0,0.4)'/></svg>" }
    'airplane_commercial' = { "<svg viewBox='0 0 160 80' width='100%' height='100%'><path d='M10,40 C10,38 25,32 50,32 L130,34 C148,35 158,38 158,41 C158,44 148,47 130,48 L50,50 C25,50 10,44 10,40 Z' fill='currentColor'/><polygon points='82,34 68,10 82,10 112,34' fill='currentColor'/><polygon points='82,48 112,48 82,72 68,72' fill='currentColor'/><ellipse cx='90' cy='22' rx='10' ry='4' fill='rgba(0,0,0,0.35)'/><ellipse cx='90' cy='60' rx='10' ry='4' fill='rgba(0,0,0,0.35)'/><polygon points='18,34 32,14 44,14 36,34' fill='currentColor'/><polygon points='18,39 26,30 32,30 26,39' fill='currentColor'/><circle cx='148' cy='38' r='2' fill='rgba(255,255,255,0.8)'/><line x1='60' y1='41' x2='130' y2='41' stroke='rgba(255,255,255,0.5)' stroke-width='1.5' stroke-dasharray='2,2'/></svg>" }
    'helicopter' = { "<svg viewBox='0 0 150 90' width='100%' height='100%'><rect x='64' y='18' width='5' height='10' fill='currentColor'/><line x1='15' y1='18' x2='118' y2='18' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><path d='M42,45 C42,28 72,28 92,34 C104,38 108,48 104,58 C98,68 75,68 45,64 Z' fill='currentColor'/><path d='M75,32 C88,36 100,42 98,54 L75,54 Z' fill='rgba(0,0,0,0.35)'/><line x1='45' y1='48' x2='12' y2='40' stroke='currentColor' stroke-width='6'/><polygon points='14,32 18,48 8,48' fill='currentColor'/><line x1='12' y1='28' x2='12' y2='52' stroke='rgba(255,255,255,0.6)' stroke-width='2.5'/><line x1='54' y1='64' x2='50' y2='78' stroke='currentColor' stroke-width='3'/><line x1='82' y1='64' x2='78' y2='78' stroke='currentColor' stroke-width='3'/><line x1='38' y1='78' x2='96' y2='78' stroke='currentColor' stroke-width='4' stroke-linecap='round'/></svg>" }
    'ship_cruise' = { "<svg viewBox='0 0 170 85' width='100%' height='100%'><path d='M10,50 L145,50 C156,50 168,54 165,65 C162,76 142,76 130,76 L25,76 Z' fill='currentColor'/><line x1='25' y1='70' x2='155' y2='70' stroke='rgba(255,255,255,0.4)' stroke-width='2'/><rect x='30' y='38' width='105' height='12' fill='white'/><rect x='45' y='27' width='80' height='11' fill='white'/><rect x='60' y='18' width='55' height='9' fill='white'/><polygon points='75,18 78,8 86,8 84,18' fill='#ef4444'/><polygon points='95,18 98,8 106,8 104,18' fill='#ef4444'/></svg>" }
    'boat_speed' = { "<svg viewBox='0 0 150 75' width='100%' height='100%'><path d='M10,48 L140,48 C145,48 148,45 142,38 L115,28 L35,28 Z' fill='currentColor'/><polygon points='50,28 85,28 75,14 55,14' fill='rgba(0,0,0,0.35)'/><rect x='8' y='42' width='12' height='18' rx='3' fill='rgba(0,0,0,0.4)'/></svg>" }

    # Animals
    'horse' = { "<svg viewBox='0 0 140 100' width='100%' height='100%'><ellipse cx='65' cy='52' rx='34' ry='20' fill='currentColor'/><path d='M85,48 L104,22 L116,25 L118,34 L102,40 L95,60 Z' fill='currentColor'/><polygon points='102,20 106,12 108,22' fill='currentColor'/><path d='M88,42 C85,34 94,24 102,18' stroke='rgba(0,0,0,0.3)' stroke-width='4' fill='none'/><rect x='40' y='65' width='8' height='32' rx='3' fill='currentColor'/><rect x='50' y='65' width='7' height='32' rx='3' fill='currentColor' opacity='0.8'/><rect x='80' y='65' width='8' height='32' rx='3' fill='currentColor'/><rect x='90' y='65' width='7' height='32' rx='3' fill='currentColor' opacity='0.8'/><path d='M34,48 C24,52 20,70 24,85' stroke='currentColor' stroke-width='6' stroke-linecap='round' fill='none'/></svg>" }
    'cow' = { "<svg viewBox='0 0 140 95' width='100%' height='100%'><ellipse cx='65' cy='48' rx='38' ry='24' fill='currentColor'/><circle cx='104' cy='36' r='16' fill='currentColor'/><polygon points='98,24 102,16 106,24' fill='white'/><polygon points='108,24 112,16 116,24' fill='white'/><circle cx='60' cy='42' r='10' fill='rgba(0,0,0,0.3)'/><circle cx='80' cy='52' r='8' fill='rgba(0,0,0,0.3)'/><rect x='38' y='68' width='10' height='24' rx='3' fill='currentColor'/><rect x='88' y='68' width='10' height='24' rx='3' fill='currentColor'/></svg>" }
    'elephant' = { "<svg viewBox='0 0 150 110' width='100%' height='100%'><ellipse cx='70' cy='55' rx='45' ry='35' fill='currentColor'/><rect x='34' y='75' width='15' height='32' rx='5' fill='currentColor'/><rect x='54' y='75' width='13' height='32' rx='5' fill='currentColor' opacity='0.8'/><rect x='78' y='75' width='15' height='32' rx='5' fill='currentColor'/><rect x='98' y='75' width='13' height='32' rx='5' fill='currentColor' opacity='0.8'/><circle cx='110' cy='45' r='20' fill='currentColor'/><ellipse cx='98' cy='48' rx='14' ry='20' fill='rgba(0,0,0,0.25)'/><path d='M124,48 C135,55 135,78 126,88 C120,94 128,96 132,90 C144,78 144,50 128,40' fill='currentColor'/><path d='M118,60 C128,64 134,70 138,65 C132,58 122,56 118,58' fill='white'/><circle cx='114' cy='38' r='2' fill='#111'/><line x1='26' y1='52' x2='20' y2='78' stroke='currentColor' stroke-width='3' stroke-linecap='round'/></svg>" }
    'giraffe' = { "<svg viewBox='0 0 90 160' width='100%' height='100%'><path d='M35,100 L52,30 L60,30 L45,100 Z' fill='currentColor'/><polygon points='54,30 68,26 64,36 54,34' fill='currentColor'/><line x1='56' y1='28' x2='56' y2='20' stroke='currentColor' stroke-width='2' stroke-linecap='round'/><line x1='60' y1='28' x2='62' y2='20' stroke='currentColor' stroke-width='2' stroke-linecap='round'/><polygon points='22,100 48,96 46,120 22,115' fill='currentColor'/><line x1='44' y1='115' x2='46' y2='155' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><line x1='48' y1='115' x2='52' y2='155' stroke='currentColor' stroke-width='3' stroke-linecap='round'/><line x1='24' y1='115' x2='22' y2='155' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><line x1='28' y1='115' x2='28' y2='155' stroke='currentColor' stroke-width='3' stroke-linecap='round'/><circle cx='48' cy='50' r='3.5' fill='rgba(0,0,0,0.3)'/><circle cx='46' cy='68' r='4' fill='rgba(0,0,0,0.3)'/><circle cx='44' cy='85' r='4' fill='rgba(0,0,0,0.3)'/><circle cx='34' cy='105' r='5' fill='rgba(0,0,0,0.3)'/></svg>" }
    'dinosaur_rex' = { "<svg viewBox='0 0 160 110' width='100%' height='100%'><path d='M5,72 C25,65 50,55 70,50 L95,25 C108,12 135,10 148,18 C155,22 152,38 140,42 L118,44 L110,55 C102,70 90,82 80,82 C72,82 72,70 65,65 C45,68 25,72 5,72 Z' fill='currentColor'/><polygon points='128,32 145,32 142,38 132,38' fill='rgba(0,0,0,0.4)'/><polygon points='130,32 133,35 136,32 139,35 142,32' fill='white'/><circle cx='128' cy='22' r='2.5' fill='#facc15'/><path d='M98,54 L106,60 L102,64' stroke='currentColor' stroke-width='3' stroke-linecap='round' fill='none'/><path d='M75,60 C85,60 90,75 85,90 L95,102 L75,102 L72,88 Z' fill='currentColor'/></svg>" }
    'whale_blue' = { "<svg viewBox='0 0 170 80' width='100%' height='100%'><path d='M15,42 C18,36 10,25 0,22 C5,32 10,38 15,42 C10,46 5,52 0,62 C10,59 18,48 15,42 Z' fill='currentColor'/><path d='M15,42 C40,40 75,32 110,28 C145,24 165,35 168,44 C165,56 135,62 105,62 C70,62 38,48 15,42 Z' fill='currentColor'/><path d='M110,50 Q135,54 160,46' stroke='rgba(0,0,0,0.25)' stroke-width='2' fill='none'/><path d='M115,55 Q135,58 155,50' stroke='rgba(0,0,0,0.25)' stroke-width='2' fill='none'/><polygon points='50,38 58,34 56,40' fill='currentColor'/><path d='M115,52 L102,68 L122,54 Z' fill='currentColor'/><circle cx='154' cy='42' r='2' fill='#111'/></svg>" }
    'shark' = { "<svg viewBox='0 0 160 80' width='100%' height='100%'><path d='M10,42 C30,30 65,22 105,25 C125,26 142,32 152,40 C140,46 125,50 105,52 C65,54 30,50 10,42 Z' fill='currentColor'/><path d='M75,23 C82,10 94,8 100,24 Z' fill='currentColor'/><path d='M12,42 L0,22 C5,32 8,38 12,42 L0,62 Z' fill='currentColor'/><path d='M100,52 L112,72 L118,50 Z' fill='currentColor'/><path d='M30,48 C60,54 100,52 135,44 C120,48 90,50 30,48 Z' fill='rgba(255,255,255,0.3)'/><circle cx='140' cy='36' r='2.5' fill='#111'/></svg>" }
    'tortoise' = { "<svg viewBox='0 0 110 70' width='100%' height='100%'><path d='M25,52 C22,25 78,25 85,52 Z' fill='currentColor'/><path d='M35,38 Q55,30 75,38' stroke='rgba(0,0,0,0.3)' stroke-width='3' fill='none'/><line x1='55' y1='30' x2='55' y2='52' stroke='rgba(0,0,0,0.3)' stroke-width='2'/><ellipse cx='92' cy='46' rx='10' ry='6' fill='currentColor'/><circle cx='95' cy='44' r='1.5' fill='#111'/><rect x='32' y='48' width='10' height='14' rx='4' fill='currentColor'/><rect x='70' y='48' width='10' height='14' rx='4' fill='currentColor'/><polygon points='25,48 18,52 25,54' fill='currentColor'/></svg>" }
    'cat' = { "<svg viewBox='0 0 90 90' width='100%' height='100%'><ellipse cx='42' cy='55' rx='25' ry='22' fill='currentColor'/><circle cx='62' cy='35' r='14' fill='currentColor'/><polygon points='54,25 58,10 66,22' fill='currentColor'/><polygon points='66,22 74,10 76,25' fill='currentColor'/><path d='M20,55 C12,50 8,30 18,20 C22,16 26,25 22,35 C18,45 25,50 28,52' fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><rect x='30' y='70' width='7' height='16' rx='3' fill='currentColor'/><rect x='50' y='70' width='7' height='16' rx='3' fill='currentColor'/></svg>" }
    'dog_medium' = { "<svg viewBox='0 0 130 90' width='100%' height='100%'><ellipse cx='55' cy='50' rx='35' ry='22' fill='currentColor'/><circle cx='95' cy='32' r='15' fill='currentColor'/><path d='M102,32 L116,36 L114,44 L98,42 Z' fill='currentColor'/><path d='M88,26 C85,24 82,34 85,42' fill='currentColor' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><path d='M22,48 C14,35 8,40 12,28' fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><rect x='35' y='65' width='10' height='23' rx='4' fill='currentColor'/><rect x='75' y='65' width='10' height='23' rx='4' fill='currentColor'/></svg>" }
    'lion' = { "<svg viewBox='0 0 140 100' width='100%' height='100%'><ellipse cx='60' cy='55' rx='38' ry='24' fill='currentColor'/><circle cx='100' cy='42' r='24' fill='rgba(0,0,0,0.3)'/><circle cx='100' cy='42' r='16' fill='currentColor'/><polygon points='94,28 98,20 102,28' fill='currentColor'/><polygon points='104,28 108,20 112,28' fill='currentColor'/><rect x='35' y='72' width='11' height='24' rx='4' fill='currentColor'/><rect x='75' y='72' width='11' height='24' rx='4' fill='currentColor'/><path d='M22,55 C12,45 10,65 14,75' stroke='currentColor' stroke-width='5' fill='none' stroke-linecap='round'/></svg>" }

    # Monuments & Towers
    'monument_christ' = { "<svg viewBox='0 0 150 150' width='100%' height='100%'><rect x='60' y='125' width='30' height='22' rx='2' fill='rgba(0,0,0,0.35)'/><polygon points='56,125 94,125 90,118 60,118' fill='rgba(0,0,0,0.3)'/><polygon points='62,118 88,118 84,45 66,45' fill='currentColor'/><line x1='72' y1='52' x2='70' y2='118' stroke='rgba(0,0,0,0.25)' stroke-width='2'/><line x1='78' y1='52' x2='80' y2='118' stroke='rgba(0,0,0,0.25)' stroke-width='2'/><polygon points='10,42 140,42 140,50 82,56 68,56 10,50' fill='currentColor'/><circle cx='75' cy='32' r='8' fill='currentColor'/></svg>" }
    'monument_eiffel' = { "<svg viewBox='0 0 100 160' width='100%' height='100%'><polygon points='48,5 52,5 51,45 49,45' fill='currentColor'/><polygon points='46,45 54,45 58,95 42,95' fill='currentColor'/><path d='M20,158 L42,95 L58,95 L80,158 L68,158 L58,125 C55,118 45,118 42,125 L32,158 Z' fill='currentColor'/></svg>" }
    'monument_liberty' = { "<svg viewBox='0 0 100 160' width='100%' height='100%'><rect x='30' y='135' width='40' height='22' rx='2' fill='rgba(0,0,0,0.3)'/><path d='M34,65 L36,135 L64,135 L66,65 Z' fill='currentColor'/><path d='M34,68 L24,35 L28,32 L40,65 Z' fill='currentColor'/><rect x='22' y='22' width='6' height='12' rx='1' fill='currentColor'/><polygon points='25,10 32,20 18,20' fill='#f59e0b'/><rect x='58' y='72' width='12' height='16' rx='1' fill='rgba(255,255,255,0.7)'/><circle cx='50' cy='52' r='8' fill='currentColor'/></svg>" }
    'monument_pisa' = { "<svg viewBox='0 0 90 160' width='100%' height='100%'><g transform='rotate(4 45 80)'><rect x='28' y='15' width='34' height='140' rx='2' fill='currentColor'/><line x1='28' y1='35' x2='62' y2='35' stroke='rgba(0,0,0,0.3)' stroke-width='3'/><line x1='28' y1='55' x2='62' y2='55' stroke='rgba(0,0,0,0.3)' stroke-width='3'/><line x1='28' y1='75' x2='62' y2='75' stroke='rgba(0,0,0,0.3)' stroke-width='3'/><line x1='28' y1='95' x2='62' y2='95' stroke='rgba(0,0,0,0.3)' stroke-width='3'/><line x1='28' y1='115' x2='62' y2='115' stroke='rgba(0,0,0,0.3)' stroke-width='3'/><line x1='28' y1='135' x2='62' y2='135' stroke='rgba(0,0,0,0.3)' stroke-width='3'/></g></svg>" }
    'monument_bigben' = { "<svg viewBox='0 0 70 160' width='100%' height='100%'><polygon points='35,5 40,25 30,25' fill='currentColor'/><rect x='24' y='25' width='22' height='26' rx='1' fill='currentColor'/><circle cx='35' cy='38' r='7' fill='white'/><circle cx='35' cy='38' r='6' fill='#fef08a'/><line x1='35' y1='38' x2='35' y2='34' stroke='black' stroke-width='1.5'/><line x1='35' y1='38' x2='38' y2='38' stroke='black' stroke-width='1.5'/><rect x='26' y='51' width='18' height='104' fill='currentColor'/></svg>" }
    'monument_pyramid' = { "<svg viewBox='0 0 160 100' width='100%' height='100%'><polygon points='80,15 15,85 145,85' fill='currentColor'/><polygon points='80,15 145,85 85,85' fill='rgba(0,0,0,0.25)'/><line x1='40' y1='60' x2='120' y2='60' stroke='rgba(0,0,0,0.2)' stroke-width='2'/><line x1='60' y1='40' x2='100' y2='40' stroke='rgba(0,0,0,0.2)' stroke-width='2'/></svg>" }
    'monument_colosseum' = { "<svg viewBox='0 0 150 90' width='100%' height='100%'><path d='M15,80 L135,80 L135,35 L15,20 Z' fill='currentColor'/><rect x='22' y='32' width='12' height='18' rx='6' fill='rgba(0,0,0,0.45)'/><rect x='42' y='35' width='12' height='18' rx='6' fill='rgba(0,0,0,0.45)'/><rect x='62' y='38' width='12' height='18' rx='6' fill='rgba(0,0,0,0.45)'/><rect x='82' y='42' width='12' height='18' rx='6' fill='rgba(0,0,0,0.45)'/></svg>" }
    'ferris_wheel' = { "<svg viewBox='0 0 140 150' width='100%' height='100%'><line x1='70' y1='65' x2='25' y2='145' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><line x1='70' y1='65' x2='115' y2='145' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><line x1='40' y1='120' x2='100' y2='120' stroke='currentColor' stroke-width='4'/><circle cx='70' cy='65' r='52' fill='none' stroke='currentColor' stroke-width='5'/><circle cx='70' cy='65' r='44' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'/><circle cx='70' cy='65' r='8' fill='currentColor'/><line x1='70' y1='13' x2='70' y2='117' stroke='rgba(255,255,255,0.4)' stroke-width='2'/><line x1='18' y1='65' x2='122' y2='65' stroke='rgba(255,255,255,0.4)' stroke-width='2'/><line x1='33' y1='28' x2='107' y2='102' stroke='rgba(255,255,255,0.4)' stroke-width='2'/><line x1='33' y1='102' x2='107' y2='28' stroke='rgba(255,255,255,0.4)' stroke-width='2'/><circle cx='70' cy='13' r='5' fill='#f43f5e'/><circle cx='107' cy='28' r='5' fill='#f43f5e'/><circle cx='122' cy='65' r='5' fill='#f43f5e'/><circle cx='107' cy='102' r='5' fill='#f43f5e'/><circle cx='70' cy='117' r='5' fill='#f43f5e'/><circle cx='33' cy='102' r='5' fill='#f43f5e'/><circle cx='18' cy='65' r='5' fill='#f43f5e'/><circle cx='33' cy='28' r='5' fill='#f43f5e'/></svg>" }
    'wind_turbine' = { "<svg viewBox='0 0 100 160' width='100%' height='100%'><polygon points='48,50 52,50 56,155 44,155' fill='currentColor'/><ellipse cx='50' cy='50' rx='6' ry='4' fill='currentColor'/><path d='M50,48 Q47,20 50,5 Q53,20 50,48 Z' fill='currentColor'/><path d='M48,51 Q26,65 12,80 Q32,74 48,51 Z' fill='currentColor'/><path d='M52,51 Q74,65 88,80 Q68,74 52,51 Z' fill='currentColor'/><circle cx='50' cy='50' r='3.5' fill='rgba(255,255,255,0.7)'/></svg>" }
    'rocket_saturn' = { "<svg viewBox='0 0 60 160' width='100%' height='100%'><polygon points='30,6 38,30 22,30' fill='currentColor'/><rect x='21' y='30' width='18' height='4' fill='rgba(0,0,0,0.3)'/><rect x='22' y='34' width='16' height='100' fill='currentColor'/><line x1='22' y1='70' x2='38' y2='70' stroke='rgba(0,0,0,0.3)' stroke-width='2'/><rect x='26' y='46' width='8' height='5' fill='#ef4444'/><polygon points='22,120 8,142 22,138' fill='currentColor'/><polygon points='38,120 52,142 38,138' fill='currentColor'/><polygon points='24,136 30,156 36,136' fill='#f59e0b'/><polygon points='26,136 30,150 34,136' fill='#fef08a'/></svg>" }

    # Core Base Templates (fallback and generic)
    'circle_coin' = { "<svg viewBox='0 0 100 100' width='100%' height='100%'><circle cx='50' cy='50' r='46' fill='currentColor'/><circle cx='50' cy='50' r='36' fill='none' stroke='rgba(0,0,0,0.3)' stroke-width='6'/><text x='50' y='58' font-size='22' font-family='sans-serif' font-weight='900' fill='rgba(0,0,0,0.45)' text-anchor='middle'>$</text></svg>" }
    'box_small' = { "<svg viewBox='0 0 100 100' width='100%' height='100%'><rect x='15' y='20' width='70' height='60' rx='6' fill='currentColor'/><rect x='22' y='28' width='56' height='44' rx='3' fill='rgba(0,0,0,0.25)'/><circle cx='50' cy='50' r='8' fill='rgba(255,255,255,0.2)'/></svg>" }
    'battery' = { "<svg viewBox='0 0 60 110' width='100%' height='100%'><rect x='22' y='4' width='16' height='8' rx='2' fill='currentColor'/><rect x='10' y='12' width='40' height='92' rx='6' fill='currentColor'/><rect x='14' y='35' width='32' height='45' fill='rgba(0,0,0,0.25)'/><text x='30' y='65' font-size='24' font-family='sans-serif' font-weight='bold' fill='rgba(255,255,255,0.6)' text-anchor='middle'>+</text></svg>" }
    'cup' = { "<svg viewBox='0 0 100 80' width='100%' height='100%'><path d='M15,10 L85,10 C85,55 70,75 50,75 C30,75 15,55 15,10 Z' fill='currentColor'/><path d='M85,20 C95,20 100,32 98,45 C95,55 85,55 80,52' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><ellipse cx='50' cy='10' rx='35' ry='6' fill='rgba(255,255,255,0.2)'/></svg>" }
    'mug' = { "<svg viewBox='0 0 90 100' width='100%' height='100%'><rect x='15' y='10' width='55' height='80' rx='8' fill='currentColor'/><path d='M70,25 C85,25 90,40 88,55 C85,70 70,70 70,68' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><ellipse cx='42.5' cy='10' rx='27.5' ry='6' fill='rgba(255,255,255,0.25)'/></svg>" }
    'can' = { "<svg viewBox='0 0 60 120' width='100%' height='100%'><rect x='5' y='10' width='50' height='100' rx='10' fill='currentColor'/><ellipse cx='30' cy='10' rx='22' ry='5' fill='rgba(255,255,255,0.25)'/><ellipse cx='30' cy='110' rx='22' ry='5' fill='rgba(0,0,0,0.2)'/><rect x='15' y='3' width='30' height='6' rx='2' fill='currentColor'/></svg>" }
    'bottle' = { "<svg viewBox='0 0 50 140' width='100%' height='100%'><rect x='18' y='5' width='14' height='14' rx='2' fill='currentColor'/><path d='M19,19 C12,30 6,45 6,65 L6,125 C6,132 12,136 25,136 C38,136 44,132 44,125 L44,65 C44,45 38,30 31,19 Z' fill='currentColor'/><ellipse cx='25' cy='95' rx='16' ry='14' fill='rgba(255,255,255,0.15)'/></svg>" }
    'phone' = { "<svg viewBox='0 0 65 130' width='100%' height='100%'><rect x='3' y='3' width='59' height='124' rx='12' fill='currentColor'/><rect x='8' y='12' width='49' height='106' rx='6' fill='rgba(0,0,0,0.35)'/><circle cx='32.5' cy='7' r='2.5' fill='rgba(255,255,255,0.3)'/></svg>" }
    'fruit_round' = { "<svg viewBox='0 0 90 90' width='100%' height='100%'><path d='M45,18 C30,8 10,25 15,55 C20,75 38,85 45,85 C52,85 70,75 75,55 C80,25 60,8 45,18 Z' fill='currentColor'/><path d='M45,18 C48,8 55,4 60,3' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='4' stroke-linecap='round'/></svg>" }
    'fruit_curved' = { "<svg viewBox='0 0 80 120' width='100%' height='100%'><path d='M20,10 C55,30 65,75 40,110 C50,95 55,60 25,25 C20,20 18,14 20,10 Z' fill='currentColor'/></svg>" }
    'ball' = { "<svg viewBox='0 0 100 100' width='100%' height='100%'><circle cx='50' cy='50' r='46' fill='currentColor'/><polygon points='50,30 65,42 60,58 40,58 35,42' fill='rgba(0,0,0,0.3)'/><circle cx='50' cy='50' r='46' fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='4'/></svg>" }
    'shoe' = { "<svg viewBox='0 0 140 70' width='100%' height='100%'><path d='M10,55 C10,55 20,62 50,62 C90,62 130,55 130,45 C130,30 110,25 95,28 L75,10 C65,10 55,20 45,35 L20,40 C12,43 10,50 10,55 Z' fill='currentColor'/><rect x='10' y='58' width='120' height='8' rx='4' fill='rgba(255,255,255,0.3)'/></svg>" }
    'bread' = { "<svg viewBox='0 0 130 65' width='100%' height='100%'><ellipse cx='65' cy='35' rx='55' ry='25' fill='currentColor'/><path d='M35,20 Q45,35 40,48' stroke='rgba(0,0,0,0.3)' stroke-width='5' fill='none'/><path d='M65,15 Q75,35 70,48' stroke='rgba(0,0,0,0.3)' stroke-width='5' fill='none'/><path d='M95,20 Q105,35 100,48' stroke='rgba(0,0,0,0.3)' stroke-width='5' fill='none'/></svg>" }
    'book' = { "<svg viewBox='0 0 80 110' width='100%' height='100%'><rect x='12' y='10' width='56' height='90' rx='4' fill='currentColor'/><rect x='16' y='15' width='48' height='80' rx='2' fill='rgba(0,0,0,0.25)'/><line x1='12' y1='10' x2='12' y2='100' stroke='rgba(255,255,255,0.4)' stroke-width='6'/></svg>" }
    'headphone' = { "<svg viewBox='0 0 100 110' width='100%' height='100%'><path d='M20,60 C20,25 80,25 80,60' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><rect x='12' y='55' width='16' height='35' rx='7' fill='currentColor'/><rect x='72' y='55' width='16' height='35' rx='7' fill='currentColor'/></svg>" }
    'tool' = { "<svg viewBox='0 0 70 120' width='100%' height='100%'><rect x='32' y='25' width='8' height='90' rx='3' fill='currentColor'/><rect x='12' y='10' width='48' height='20' rx='4' fill='currentColor'/><polygon points='12,15 5,10 12,25' fill='currentColor'/></svg>" }
    'appliance_cube' = { "<svg viewBox='0 0 110 80' width='100%' height='100%'><rect x='5' y='10' width='100' height='65' rx='8' fill='currentColor'/><rect x='12' y='18' width='60' height='49' rx='4' fill='rgba(0,0,0,0.35)'/><circle cx='88' cy='28' r='6' fill='rgba(255,255,255,0.3)'/><circle cx='88' cy='46' r='6' fill='rgba(255,255,255,0.3)'/><rect x='80' y='58' width='16' height='4' rx='2' fill='rgba(255,255,255,0.3)'/></svg>" }
    'chair' = { "<svg viewBox='0 0 80 120' width='100%' height='100%'><rect x='22' y='10' width='36' height='42' rx='6' fill='currentColor'/><rect x='15' y='55' width='50' height='12' rx='4' fill='currentColor'/><rect x='36' y='67' width='8' height='30' fill='currentColor'/><polygon points='40,97 15,115 65,115' fill='currentColor'/><circle cx='15' cy='115' r='4' fill='rgba(255,255,255,0.4)'/><circle cx='65' cy='115' r='4' fill='rgba(255,255,255,0.4)'/></svg>" }
    'chair_office' = { "<svg viewBox='0 0 80 120' width='100%' height='100%'><rect x='22' y='10' width='36' height='42' rx='6' fill='currentColor'/><rect x='15' y='55' width='50' height='12' rx='4' fill='currentColor'/><rect x='36' y='67' width='8' height='30' fill='currentColor'/><polygon points='40,97 15,115 65,115' fill='currentColor'/><circle cx='15' cy='115' r='4' fill='rgba(255,255,255,0.4)'/><circle cx='65' cy='115' r='4' fill='rgba(255,255,255,0.4)'/></svg>" }
    'chair_dining' = { "<svg viewBox='0 0 70 120' width='100%' height='100%'><rect x='20' y='12' width='30' height='45' rx='3' fill='none' stroke='currentColor' stroke-width='5'/><line x1='28' y1='15' x2='28' y2='57' stroke='currentColor' stroke-width='3'/><line x1='35' y1='15' x2='35' y2='57' stroke='currentColor' stroke-width='3'/><line x1='42' y1='15' x2='42' y2='57' stroke='currentColor' stroke-width='3'/><rect x='16' y='57' width='38' height='8' rx='2' fill='currentColor'/><line x1='20' y1='65' x2='18' y2='112' stroke='currentColor' stroke-width='5'/><line x1='50' y1='65' x2='52' y2='112' stroke='currentColor' stroke-width='5'/></svg>" }
    'instrument_string' = { "<svg viewBox='0 0 60 130' width='100%' height='100%'><polygon points='27,5 33,5 33,60 27,60' fill='currentColor'/><ellipse cx='30' cy='80' rx='16' ry='18' fill='currentColor'/><ellipse cx='30' cy='105' rx='22' ry='24' fill='currentColor'/><circle cx='30' cy='85' r='7' fill='rgba(0,0,0,0.35)'/></svg>" }
    'instrument_wind' = { "<svg viewBox='0 0 70 120' width='100%' height='100%'><path d='M25,10 L35,10 L35,80 C35,100 55,100 55,80 L55,70 L65,70 L65,85 C65,110 25,110 25,80 Z' fill='currentColor'/><polygon points='20,10 40,10 35,5 25,5' fill='currentColor'/></svg>" }
    'vehicle_two_wheels' = { "<svg viewBox='0 0 130 90' width='100%' height='100%'><circle cx='25' cy='65' r='18' fill='currentColor'/><circle cx='105' cy='65' r='18' fill='currentColor'/><path d='M25,65 L55,65 L65,40 L90,40 L105,65' stroke='currentColor' stroke-width='8' fill='none' stroke-linejoin='round'/><rect x='40' y='32' width='28' height='12' rx='4' fill='currentColor'/><line x1='88' y1='40' x2='80' y2='18' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><line x1='74' y1='18' x2='86' y2='18' stroke='currentColor' stroke-width='6' stroke-linecap='round'/></svg>" }
    'vehicle_car' = { "<svg viewBox='0 0 160 80' width='100%' height='100%'><path d='M10,55 C10,50 20,40 35,40 L50,40 C60,25 75,18 95,18 C115,18 135,32 145,45 L155,50 C158,52 160,56 160,60 L160,68 C160,70 158,72 155,72 L145,72 C145,62 135,55 125,55 C115,55 105,62 105,72 L55,72 C55,62 45,55 35,55 C25,55 15,62 15,72 L5,72 C2,72 0,70 0,68 L0,60 Z' fill='currentColor'/><circle cx='35' cy='72' r='15' fill='rgba(0,0,0,0.4)'/><circle cx='125' cy='72' r='15' fill='rgba(0,0,0,0.4)'/><path d='M60,38 C68,26 80,24 95,24 C108,24 122,30 128,38 Z' fill='rgba(0,0,0,0.3)'/></svg>" }
    'vehicle_van_truck' = { "<svg viewBox='0 0 160 85' width='100%' height='100%'><path d='M15,20 L115,20 L145,45 L145,68 L15,68 Z' fill='currentColor'/><rect x='25' y='28' width='30' height='18' rx='3' fill='rgba(0,0,0,0.3)'/><rect x='62' y='28' width='30' height='18' rx='3' fill='rgba(0,0,0,0.3)'/><polygon points='100,28 118,28 135,45 100,45' fill='rgba(0,0,0,0.3)'/><circle cx='45' cy='68' r='14' fill='rgba(0,0,0,0.4)'/><circle cx='120' cy='68' r='14' fill='rgba(0,0,0,0.4)'/></svg>" }
    'vehicle_bus' = { "<svg viewBox='0 0 170 85' width='100%' height='100%'><rect x='5' y='10' width='160' height='60' rx='8' fill='currentColor'/><rect x='12' y='18' width='30' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><rect x='48' y='18' width='30' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><rect x='84' y='18' width='30' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><rect x='120' y='18' width='40' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><circle cx='45' cy='70' r='14' fill='rgba(0,0,0,0.4)'/><circle cx='130' cy='70' r='14' fill='rgba(0,0,0,0.4)'/></svg>" }
    'vehicle_airplane' = { "<svg viewBox='0 0 170 85' width='100%' height='100%'><path d='M10,48 C30,48 50,45 80,45 L115,20 L130,20 L120,45 L155,46 C165,47 168,52 155,54 L120,54 L105,75 L95,75 L102,54 L10,53 Z' fill='currentColor'/></svg>" }
    'vehicle_boat' = { "<svg viewBox='0 0 160 90' width='100%' height='100%'><path d='M15,55 L145,55 L130,85 L35,85 Z' fill='currentColor'/><rect x='45' y='30' width='60' height='25' rx='3' fill='currentColor'/><rect x='55' y='35' width='18' height='12' fill='rgba(0,0,0,0.3)'/><rect x='80' y='35' width='18' height='12' fill='rgba(0,0,0,0.3)'/></svg>" }
    'human_standing' = { "<svg viewBox='0 0 60 140' width='100%' height='100%'><circle cx='30' cy='18' r='14' fill='currentColor'/><path d='M12,42 C12,36 18,34 30,34 C42,34 48,36 48,42 L45,82 L15,82 Z' fill='currentColor'/><line x1='12' y1='42' x2='3' y2='80' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><line x1='48' y1='42' x2='57' y2='80' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><rect x='18' y='84' width='9' height='52' rx='4' fill='currentColor'/><rect x='33' y='84' width='9' height='52' rx='4' fill='currentColor'/></svg>" }
    'quadruped_small' = { "<svg viewBox='0 0 100 90' width='100%' height='100%'><ellipse cx='45' cy='55' rx='30' ry='25' fill='currentColor'/><circle cx='70' cy='35' r='16' fill='currentColor'/><polygon points='62,25 65,10 74,22' fill='currentColor'/><polygon points='73,22 82,10 85,25' fill='currentColor'/><path d='M20,55 C10,50 5,30 15,20 C18,16 22,25 18,35 C15,45 22,50 25,52' fill='none' stroke='currentColor' stroke-width='7' stroke-linecap='round'/><rect x='30' y='70' width='8' height='18' rx='4' fill='currentColor'/><rect x='55' y='70' width='8' height='18' rx='4' fill='currentColor'/></svg>" }
    'quadruped_medium' = { "<svg viewBox='0 0 130 90' width='100%' height='100%'><ellipse cx='55' cy='50' rx='35' ry='22' fill='currentColor'/><circle cx='95' cy='32' r='15' fill='currentColor'/><path d='M102,32 L116,36 L114,44 L98,42 Z' fill='currentColor'/><path d='M88,26 C85,24 82,34 85,42' fill='currentColor' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><path d='M22,48 C14,35 8,40 12,28' fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><rect x='35' y='65' width='10' height='23' rx='4' fill='currentColor'/><rect x='75' y='65' width='10' height='23' rx='4' fill='currentColor'/></svg>" }
    'quadruped_large' = { "<svg viewBox='0 0 150 110' width='100%' height='100%'><ellipse cx='75' cy='55' rx='48' ry='30' fill='currentColor'/><path d='M115,40 C125,30 140,30 145,45 C145,55 138,65 125,68 Z' fill='currentColor'/><rect x='40' y='80' width='12' height='28' rx='4' fill='currentColor'/><rect x='95' y='80' width='12' height='28' rx='4' fill='currentColor'/><circle cx='60' cy='48' r='10' fill='rgba(0,0,0,0.3)'/><circle cx='95' cy='58' r='14' fill='rgba(0,0,0,0.3)'/></svg>" }
    'quadruped_huge' = { "<svg viewBox='0 0 150 110' width='100%' height='100%'><ellipse cx='70' cy='55' rx='45' ry='35' fill='currentColor'/><circle cx='115' cy='45' r='22' fill='currentColor'/><path d='M125,45 C135,55 130,85 120,95 C115,100 122,102 125,95 C138,80 145,50 130,35' fill='currentColor'/><ellipse cx='102' cy='45' rx='14' ry='22' fill='rgba(0,0,0,0.2)'/><rect x='35' y='80' width='15' height='28' rx='5' fill='currentColor'/><rect x='60' y='80' width='15' height='28' rx='5' fill='currentColor'/><rect x='90' y='80' width='15' height='28' rx='5' fill='currentColor'/></svg>" }
    'bear_standing' = { "<svg viewBox='0 0 90 140' width='100%' height='100%'><ellipse cx='45' cy='80' rx='30' ry='42' fill='currentColor'/><circle cx='45' cy='30' r='18' fill='currentColor'/><circle cx='32' cy='16' r='6' fill='currentColor'/><circle cx='58' cy='16' r='6' fill='currentColor'/><path d='M20,45 C10,55 8,75 16,85' stroke='currentColor' stroke-width='10' fill='none' stroke-linecap='round'/><path d='M70,45 C80,55 82,75 74,85' stroke='currentColor' stroke-width='10' fill='none' stroke-linecap='round'/><rect x='25' y='115' width='14' height='22' rx='5' fill='currentColor'/><rect x='51' y='115' width='14' height='22' rx='5' fill='currentColor'/></svg>" }
    'bird_standing' = { "<svg viewBox='0 0 70 120' width='100%' height='100%'><ellipse cx='35' cy='65' rx='22' ry='45' fill='currentColor'/><ellipse cx='35' cy='70' rx='14' ry='35' fill='rgba(255,255,255,0.25)'/><circle cx='35' cy='22' r='14' fill='currentColor'/><polygon points='35,22 55,26 35,30' fill='#facc15'/><ellipse cx='14' cy='60' rx='4' ry='22' fill='currentColor'/><ellipse cx='56' cy='60' rx='4' ry='22' fill='currentColor'/><polygon points='25,110 32,118 40,110' fill='#facc15'/><polygon points='40,110 48,118 55,110' fill='#facc15'/></svg>" }
    'reptile_dino' = { "<svg viewBox='0 0 160 120' width='100%' height='100%'><path d='M10,85 C30,75 50,70 65,65 L85,45 C95,30 115,25 135,28 L145,35 L125,50 L115,55 L105,75 C95,95 85,115 75,115 C65,115 70,95 60,85 Z' fill='currentColor'/><rect x='75' y='90' width='14' height='28' rx='6' fill='currentColor'/><line x1='90' y1='65' x2='105' y2='72' stroke='currentColor' stroke-width='5' stroke-linecap='round'/></svg>" }
    'sea_creature' = { "<svg viewBox='0 0 170 75' width='100%' height='100%'><path d='M10,40 C20,20 70,18 120,25 C145,28 160,35 168,22 C168,32 165,45 150,45 C120,45 70,55 30,52 Z' fill='currentColor'/><path d='M60,42 L50,60 L65,50' fill='currentColor'/></svg>" }
    'tree' = { "<svg viewBox='0 0 80 150' width='100%' height='100%'><line x1='40' y1='35' x2='40' y2='148' stroke='currentColor' stroke-width='7'/><path d='M40,35 C25,20 10,25 5,35' stroke='currentColor' stroke-width='5' fill='none' stroke-linecap='round'/><path d='M40,35 C55,20 70,25 75,35' stroke='currentColor' stroke-width='5' fill='none' stroke-linecap='round'/><path d='M40,35 C30,10 15,10 10,20' stroke='currentColor' stroke-width='5' fill='none' stroke-linecap='round'/><path d='M40,35 C50,10 65,10 70,20' stroke='currentColor' stroke-width='5' fill='none' stroke-linecap='round'/></svg>" }
    'tree_deciduous' = { "<svg viewBox='0 0 110 150' width='100%' height='100%'><rect x='48' y='80' width='14' height='68' fill='#78350f'/><circle cx='55' cy='52' r='45' fill='currentColor'/><circle cx='38' cy='42' r='25' fill='rgba(255,255,255,0.2)'/><circle cx='70' cy='45' r='25' fill='rgba(255,255,255,0.2)'/></svg>" }
    'tree_palm' = { "<svg viewBox='0 0 100 150' width='100%' height='100%'><path d='M50,148 Q42,90 52,38' stroke='#78350f' stroke-width='10' fill='none' stroke-linecap='round'/><path d='M52,38 Q30,15 10,32' stroke='currentColor' stroke-width='8' fill='none' stroke-linecap='round'/><path d='M52,38 Q70,15 90,32' stroke='currentColor' stroke-width='8' fill='none' stroke-linecap='round'/><path d='M52,38 Q50,5 45,5' stroke='currentColor' stroke-width='8' fill='none' stroke-linecap='round'/><path d='M52,38 Q25,35 15,55' stroke='currentColor' stroke-width='8' fill='none' stroke-linecap='round'/><path d='M52,38 Q75,35 85,55' stroke='currentColor' stroke-width='8' fill='none' stroke-linecap='round'/></svg>" }
    'pole_structure' = { "<svg viewBox='0 0 60 160' width='100%' height='100%'><line x1='30' y1='20' x2='30' y2='158' stroke='currentColor' stroke-width='6'/><path d='M30,30 C30,10 52,10 52,25' fill='none' stroke='currentColor' stroke-width='5'/><polygon points='45,25 58,25 54,35 48,35' fill='#facc15'/></svg>" }
    'monument_statue' = { "<svg viewBox='0 0 140 150' width='100%' height='100%'><polygon points='45,148 95,148 90,120 50,120' fill='rgba(0,0,0,0.3)'/><path d='M56,120 L58,45 L10,45 L10,38 L59,38 L65,18 C65,12 75,12 75,18 L81,38 L130,38 L130,45 L82,45 L84,120 Z' fill='currentColor'/><circle cx='70' cy='18' r='8' fill='currentColor'/></svg>" }
    'monument_tower' = { "<svg viewBox='0 0 100 160' width='100%' height='100%'><polygon points='48,5 52,5 51,45 49,45' fill='currentColor'/><polygon points='46,45 54,45 58,95 42,95' fill='currentColor'/><path d='M20,158 L42,95 L58,95 L80,158 L68,158 L58,125 C55,118 45,118 42,125 L32,158 Z' fill='currentColor'/></svg>" }
    'monument_building' = { "<svg viewBox='0 0 90 160' width='100%' height='100%'><rect x='15' y='10' width='60' height='148' fill='currentColor'/><rect x='23' y='18' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='40' y='18' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='57' y='18' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='23' y='38' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='40' y='38' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='57' y='38' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='23' y='58' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='40' y='58' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='57' y='58' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='23' y='78' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='40' y='78' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='57' y='78' width='10' height='10' fill='rgba(0,0,0,0.3)'/></svg>" }
    'rocket' = { "<svg viewBox='0 0 50 160' width='100%' height='100%'><polygon points='25,5 33,25 17,25' fill='currentColor'/><rect x='17' y='25' width='16' height='115' rx='2' fill='currentColor'/><polygon points='17,120 5,145 17,140' fill='currentColor'/><polygon points='33,120 45,145 33,140' fill='currentColor'/><ellipse cx='25' cy='145' rx='8' ry='4' fill='rgba(0,0,0,0.4)'/></svg>" }
}

# resolver.ps1

function Get-AccurateShape {
    param(
        [string]$id,
        [string]$name,
        [string]$oldShape,
        [string]$cat
    )

    $idLower = $id.ToLower()
    $nameLower = $name.ToLower()

    # 1. SPECIFIC ID MAPPINGS
    $idMap = @{
        # Specific furniture & fixtures
        'carrinho_pipoca'      = 'popcorn_cart'
        'porta_pivotante'      = 'door_pivot'
        'porta_residencial'    = 'door_residential'
        'porta_balcao'         = 'door_residential'
        'porta_garagem'        = 'door_garage'
        'portao_eletronico'    = 'door_garage'
        'janela_quarto'        = 'window_frame'
        'cama_box'             = 'bed_double'
        'beliche'              = 'bed_bunk'
        'cama_solteiro'        = 'bed_double'
        'berco'                = 'bed_bunk'
        'sinuca_mesa'          = 'pool_table'
        'pebolim'              = 'foosball_table'
        'mesa_pingpong'        = 'pingpong_table'
        'bancada_trabalho'     = 'workbench'
        'carrinho_bebe'        = 'baby_stroller'
        'carrinho_mercado'     = 'shopping_cart'
        'cadeira_escritorio'   = 'chair_office'
        'cadeira_gamer'        = 'chair_office'
        'cadeira_jantar'       = 'chair_dining'
        'banqueta'             = 'chair_dining'
        'palanque'             = 'chair_office'
        'guarda_roupa'         = 'wardrobe'
        'armario_alto'         = 'wardrobe'
        'armario_vestiario'    = 'wardrobe'
        'estante_livros'       = 'bookshelf'
        'cristaleira'          = 'bookshelf'
        'sofa_3lugares'        = 'sofa_couch'
        'sofa_2lugares'        = 'sofa_couch'
        'poltrona_reclinavel'  = 'sofa_couch'
        'mesa_centro'          = 'sofa_couch'
        'criado_mudo'          = 'box_small'
        'puf_sala'             = 'circle_coin'
        
        # Electronics & Gadgets
        'controle_ps5'         = 'game_controller'
        'mouse'                = 'computer_mouse'
        'notebook'             = 'laptop'
        'mochila'              = 'backpack'
        'mala_bordo'           = 'suitcase_luggage'
        'mala_media'           = 'suitcase_luggage'
        'mala_grande'          = 'suitcase_luggage'
        'mala_viagem_p'        = 'duffel_bag'
        'caixa_termica'        = 'box_small'
        'caixa_papelao'        = 'box_small'
        'caixa_ferramentas'    = 'toolbox'
        'gabinete_gamer'       = 'desktop_pc'
        'roteador'             = 'wifi_router'
        'caixa_som_mini'       = 'speaker_portable'
        'caixa_som_torre'      = 'speaker_tower'
        'carregador'           = 'box_small'
        'smartwatch'           = 'smartwatch'
        'celular'              = 'phone'
        'iphone'               = 'phone'
        'tablet'               = 'tablet'
        'tv_55'                = 'tv_screen'
        'tv_65'                = 'tv_screen'
        'tv_75'                = 'tv_screen'
        'tv_32'                = 'tv_screen'
        'monitor_24'           = 'tv_screen'
        'totem_autoatendimento'= 'arcade_cabinet'
        'fliperama'            = 'arcade_cabinet'

        # Kitchen Appliances
        'geladeira_duplex'     = 'refrigerator'
        'geladeira_sidebyside' = 'refrigerator'
        'frigobar'             = 'refrigerator'
        'freezer_vertical'     = 'refrigerator'
        'fogao_4bocas'         = 'stove_oven'
        'fogao_industrial'     = 'stove_oven'
        'microondas'           = 'microwave'
        'air_fryer'            = 'air_fryer'
        'cafeteira_expresso'   = 'coffee_maker'
        'cafeteira_italiana'   = 'coffee_maker'
        'batedeira'            = 'stand_mixer'
        'liquidificador'       = 'blender'
        'torradeira'           = 'toaster'
        'maquina_lavar'        = 'washing_machine'
        'lava_loucas'          = 'washing_machine'
        'aquario_peixes'       = 'aquarium'
        'container_20'         = 'shipping_container'
        'container_40'         = 'shipping_container'
        'betoneira'            = 'concrete_mixer'

        # Tools & Cleaning
        'aspirador_vertical'   = 'vacuum_stick'
        'secador'              = 'hair_dryer'
        'furadeira'            = 'drill'
        'martelo'              = 'hammer'
        'chave_fenda'          = 'screwdriver'
        'alicate'              = 'pliers'
        'escada_3degraus'      = 'step_ladder'

        # Musical Instruments
        'sanfona'              = 'accordion'
        'piano_vertical'       = 'upright_piano'
        'piano_cauda'          = 'grand_piano'
        'bateria_completa'     = 'drum_kit'
        'bumbo_bateria'        = 'drum_snare'
        'caixa_bateria'        = 'drum_snare'
        'violao_classico'      = 'guitar_acoustic'
        'guitarra_eletrica'    = 'guitar_electric'
        'baixo_eletrico'       = 'bass_guitar'
        'cavaquinho'           = 'ukulele'
        'violino'              = 'violin'
        'violoncelo'           = 'cello'
        'saxofone'             = 'saxophone'
        'trompete'             = 'trumpet'
        'flauta_transversal'   = 'flute'

        # Vehicles
        'fusca'                = 'car_fusca'
        'gol'                  = 'car_sedan'
        'onix'                 = 'car_sedan'
        'hb20'                 = 'car_sedan'
        'civic'                = 'car_sedan'
        'corolla'              = 'car_sedan'
        'compass'              = 'car_sedan'
        'renegade'             = 'car_sedan'
        'hilux'                = 'truck_semi'
        'fiorino'              = 'vehicle_van_truck'
        'sprinter'             = 'vehicle_van_truck'
        'kombi'                = 'vehicle_van_truck'
        'carreta_bau'          = 'truck_semi'
        'caminhao_cacamba'     = 'truck_semi'
        'caminhao_betoneira'   = 'truck_semi'
        'trator_agricola'      = 'tractor_farm'
        'colheitadeira'        = 'tractor_farm'
        'onibus_urbano'        = 'bus_city'
        'onibus_viagem'        = 'bus_city'
        'onibus_articulado'    = 'bus_city'
        'onibus_londrino'      = 'bus_city'
        'aviao_737'            = 'airplane_commercial'
        'aviao_a320'           = 'airplane_commercial'
        'aviao_777'            = 'airplane_commercial'
        'aviao_747'            = 'airplane_commercial'
        'aviao_a380'           = 'airplane_commercial'
        'jatinho_executivo'    = 'airplane_commercial'
        'tecoteco'             = 'airplane_commercial'
        'helicoptero_esquilo'  = 'helicopter'
        'helicoptero_resgate'  = 'helicopter'
        'bicicleta_caloi'      = 'bicycle'
        'bicicleta_speed'      = 'bicycle'
        'mountain_bike'        = 'bicycle'
        'moto_cg160'           = 'motorcycle'
        'moto_harley'          = 'motorcycle'
        'lancha_24pes'         = 'boat_speed'
        'iate_luxo'            = 'ship_cruise'
        'navio_cruzeiro'       = 'ship_cruise'
        'navio_porta_container'= 'ship_cruise'

        # Animals & Nature
        'formiga'              = 'ant'
        'grao_cafe'            = 'coffee_bean'
        'abelha'               = 'bee'
        'joaninha'             = 'ladybug'
        'dente'                = 'tooth'
        'dente_molar'          = 'tooth'
        'anel'                 = 'jewelry_ring'
        'chave'                = 'key'
        'parafuso'             = 'screw_bolt'
        'alfinete'             = 'safety_pin'
        'clips_papel'          = 'paperclip'
        'clipes'               = 'paperclip'
        'earbuds_case'         = 'earbuds'
        'ventilador_mesa'      = 'fan_desk'
        'jabuti'               = 'tortoise'
        'tartaruga_marinha'    = 'tortoise'
        'tubarao_branco'       = 'shark'
        'tubarao_baleia'       = 'shark'
        'baleia_azul'          = 'whale_blue'
        'baleia_jubarte'       = 'whale_blue'
        'golfinho'             = 'whale_blue'
        'orca'                 = 'whale_blue'
        'tiranossauro_rex'     = 'dinosaur_rex'
        'braquiossauro'        = 'dinosaur_rex'
        'girafa_adulta'        = 'giraffe'
        'elefante_africano'    = 'elephant'
        'elefante_asiatico'    = 'elephant'
        'cavalo_adulto'        = 'horse'
        'boi_nelore'           = 'cow'
        'vaca_holandesa'       = 'cow'
        'leao_adulto'          = 'lion'
        'tigre_bengala'        = 'lion'
        'cachorro_golden'      = 'dog_medium'
        'cachorro_pastor'      = 'dog_medium'
        'gato_siames'          = 'cat'
        'gato_persa'           = 'cat'
        'arvore_ipe'           = 'tree_deciduous'
        'arvore_carvalho'      = 'tree_deciduous'
        'palmeira_imperial'    = 'tree_palm'
        'coqueiro'             = 'tree_palm'

        # Monuments & Mega Structures
        'cristo_redentor'      = 'monument_christ'
        'torre_eiffel'         = 'monument_eiffel'
        'estatua_liberdade'    = 'monument_liberty'
        'torre_pisa'           = 'monument_pisa'
        'big_ben'              = 'monument_bigben'
        'piramide_gize'        = 'monument_pyramid'
        'coliseu_roma'         = 'monument_colosseum'
        'roda_gigante_rio'     = 'ferris_wheel'
        'london_eye'           = 'ferris_wheel'
        'turbina_eolica'       = 'wind_turbine'
        'foguete_saturno5'     = 'rocket_saturn'
        'foguete_falcon9'      = 'rocket_saturn'
    }

    if ($idMap.ContainsKey($idLower)) {
        return $idMap[$idLower]
    }

    # 2. KEYWORD PATTERN MATCHING
    if ($idLower -match 'pipoca' -or $nameLower -match 'pipoca') { return 'popcorn_cart' }
    if ($idLower -match 'pivotante' -or $nameLower -match 'pivotante') { return 'door_pivot' }
    if ($idLower -match 'porta_' -or $nameLower -match 'porta ') { return 'door_residential' }
    if ($idLower -match 'portao' -or $nameLower -match 'portão') { return 'door_garage' }
    if ($idLower -match 'janela' -or $nameLower -match 'janela') { return 'window_frame' }
    if ($idLower -match 'cama' -or $nameLower -match 'cama ') { return 'bed_double' }
    if ($idLower -match 'beliche' -or $nameLower -match 'beliche') { return 'bed_bunk' }
    if ($idLower -match 'sinuca' -or $nameLower -match 'sinuca') { return 'pool_table' }
    if ($idLower -match 'pebolim' -or $nameLower -match 'pebolim' -or $nameLower -match 'totó') { return 'foosball_table' }
    if ($idLower -match 'pingpong' -or $nameLower -match 'ping pong' -or $nameLower -match 'tênis de mesa') { return 'pingpong_table' }
    if ($idLower -match 'bancada' -or $nameLower -match 'bancada') { return 'workbench' }
    if ($idLower -match 'carrinho.*bebe' -or $nameLower -match 'carrinho de bebê') { return 'baby_stroller' }
    if ($idLower -match 'carrinho.*mercado' -or $nameLower -match 'carrinho de supermercado') { return 'shopping_cart' }
    if ($idLower -match 'controle' -or $nameLower -match 'controle dualsense' -or $nameLower -match 'gamepad') { return 'game_controller' }
    if ($idLower -match 'mouse' -or $nameLower -match 'mouse ') { return 'computer_mouse' }
    if ($idLower -match 'notebook' -or $nameLower -match 'notebook') { return 'laptop' }
    if ($idLower -match 'mochila' -or $nameLower -match 'mochila') { return 'backpack' }
    if ($idLower -match 'mala' -or $nameLower -match 'mala ') { return 'suitcase_luggage' }
    if ($idLower -match 'geladeira' -or $nameLower -match 'geladeira' -or $idLower -match 'freezer' -or $idLower -match 'frigobar') { return 'refrigerator' }
    if ($idLower -match 'lavar' -or $nameLower -match 'lavar roupas' -or $idLower -match 'lava_loucas') { return 'washing_machine' }
    if ($idLower -match 'fogao' -or $nameLower -match 'fogão') { return 'stove_oven' }
    if ($idLower -match 'microondas' -or $nameLower -match 'micro-ondas') { return 'microwave' }
    if ($idLower -match 'air_fryer' -or $nameLower -match 'air fryer') { return 'air_fryer' }
    if ($idLower -match 'torradeira' -or $nameLower -match 'torradeira') { return 'toaster' }
    if ($idLower -match 'batedeira' -or $nameLower -match 'batedeira') { return 'stand_mixer' }
    if ($idLower -match 'liquidificador' -or $nameLower -match 'liquidificador') { return 'blender' }
    if ($idLower -match 'cafeteira' -or $nameLower -match 'cafeteira') { return 'coffee_maker' }
    if ($idLower -match 'aquario' -or $nameLower -match 'aquário') { return 'aquarium' }
    if ($idLower -match 'sanfona' -or $nameLower -match 'sanfona' -or $nameLower -match 'acordeon') { return 'accordion' }
    if ($idLower -match 'bateria_completa' -or $nameLower -match 'bateria acústica') { return 'drum_kit' }
    if ($idLower -match 'piano' -or $nameLower -match 'piano') { return 'upright_piano' }
    if ($idLower -match 'fliperama' -or $nameLower -match 'arcade' -or $nameLower -match 'fliperama') { return 'arcade_cabinet' }
    if ($idLower -match 'container' -or $nameLower -match 'container') { return 'shipping_container' }
    if ($idLower -match 'betoneira' -or $nameLower -match 'betoneira') { return 'concrete_mixer' }
    if ($idLower -match 'formiga' -or $nameLower -match 'formiga') { return 'ant' }
    if ($idLower -match 'abelha' -or $nameLower -match 'abelha') { return 'bee' }
    if ($idLower -match 'joaninha' -or $nameLower -match 'joaninha') { return 'ladybug' }
    if ($idLower -match 'cafe' -or $nameLower -match 'café') { return 'coffee_bean' }
    if ($idLower -match 'dente' -or $nameLower -match 'dente') { return 'tooth' }
    if ($idLower -match 'chave' -or $nameLower -match 'chave de porta') { return 'key' }
    if ($idLower -match 'parafuso' -or $nameLower -match 'parafuso') { return 'screw_bolt' }
    if ($idLower -match 'anel' -or $nameLower -match 'aliança' -or $nameLower -match 'anel ') { return 'jewelry_ring' }
    if ($idLower -match 'ventilador' -or $nameLower -match 'ventilador') { return 'fan_desk' }
    if ($idLower -match 'aspirador' -or $nameLower -match 'aspirador') { return 'vacuum_stick' }
    if ($idLower -match 'secador' -or $nameLower -match 'secador') { return 'hair_dryer' }
    if ($idLower -match 'furadeira' -or $nameLower -match 'furadeira') { return 'drill' }
    if ($idLower -match 'jabuti' -or $nameLower -match 'jabuti') { return 'tortoise' }
    if ($idLower -match 'tartaruga' -or $nameLower -match 'tartaruga') { return 'tortoise' }
    if ($idLower -match 'tubarao' -or $nameLower -match 'tubarão') { return 'shark' }
    if ($idLower -match 'baleia' -or $nameLower -match 'baleia') { return 'whale_blue' }
    if ($idLower -match 'dino' -or $nameLower -match 'tiranossauro' -or $nameLower -match 'jurássico') { return 'dinosaur_rex' }
    if ($idLower -match 'girafa' -or $nameLower -match 'girafa') { return 'giraffe' }
    if ($idLower -match 'elefante' -or $nameLower -match 'elefante') { return 'elephant' }
    if ($idLower -match 'cavalo' -or $nameLower -match 'cavalo') { return 'horse' }
    if ($idLower -match 'vaca' -or $nameLower -match 'boi ' -or $nameLower -match 'touro') { return 'cow' }
    if ($idLower -match 'leao' -or $nameLower -match 'leão') { return 'lion' }
    if ($idLower -match 'roda_gigante' -or $nameLower -match 'roda-gigante') { return 'ferris_wheel' }
    if ($idLower -match 'turbina_eolica' -or $nameLower -match 'eólica') { return 'wind_turbine' }
    if ($idLower -match 'torre_eiffel' -or $nameLower -match 'eiffel') { return 'monument_eiffel' }
    if ($idLower -match 'cristo' -or $nameLower -match 'cristo redentor') { return 'monument_christ' }
    if ($idLower -match 'estatua_liberdade' -or $nameLower -match 'liberdade') { return 'monument_liberty' }
    if ($idLower -match 'pisa' -or $nameLower -match 'pisa') { return 'monument_pisa' }
    if ($idLower -match 'big_ben' -or $nameLower -match 'big ben') { return 'monument_bigben' }
    if ($idLower -match 'piramide' -or $nameLower -match 'pirâmide') { return 'monument_pyramid' }
    if ($idLower -match 'coliseu' -or $nameLower -match 'coliseu') { return 'monument_colosseum' }
    if ($idLower -match 'saturno' -or $nameLower -match 'foguete' -or $nameLower -match 'falcon') { return 'rocket_saturn' }
    if ($idLower -match 'fusca' -or $nameLower -match 'fusca') { return 'car_fusca' }
    if ($idLower -match 'carro' -or $nameLower -match 'sedan' -or $nameLower -match 'suv' -or $nameLower -match 'automóvel') { return 'car_sedan' }
    if ($idLower -match 'caminhao' -or $nameLower -match 'caminhão' -or $nameLower -match 'carreta') { return 'truck_semi' }
    if ($idLower -match 'trator' -or $nameLower -match 'trator') { return 'tractor_farm' }
    if ($idLower -match 'aviao' -or $nameLower -match 'avião' -or $nameLower -match 'boeing' -or $nameLower -match 'airbus') { return 'airplane_commercial' }
    if ($idLower -match 'helicoptero' -or $nameLower -match 'helicóptero') { return 'helicopter' }
    if ($idLower -match 'navio' -or $nameLower -match 'navio' -or $nameLower -match 'cruzeiro') { return 'ship_cruise' }
    if ($idLower -match 'barco' -or $nameLower -match 'lancha') { return 'boat_speed' }
    if ($idLower -match 'onibus' -or $nameLower -match 'ônibus') { return 'bus_city' }
    if ($idLower -match 'moto' -or $nameLower -match 'motocicleta') { return 'motorcycle' }
    if ($idLower -match 'bike' -or $nameLower -match 'bicicleta') { return 'bicycle' }
    if ($idLower -match 'pao' -or $nameLower -match 'pão ') { return 'bread' }
    if ($idLower -match 'copo' -or $nameLower -match 'copo ') { return 'cup' }
    if ($idLower -match 'caneca' -or $nameLower -match 'caneca') { return 'mug' }
    if ($idLower -match 'garrafa' -or $nameLower -match 'garrafa') { return 'bottle' }
    if ($idLower -match 'lata' -or $nameLower -match 'refrigerante em lata') { return 'can' }
    if ($idLower -match 'maca' -or $nameLower -match 'maçã' -or $nameLower -match 'laranja') { return 'fruit_round' }
    if ($idLower -match 'banana' -or $nameLower -match 'banana') { return 'fruit_curved' }
    if ($idLower -match 'tenis' -or $nameLower -match 'tênis ' -or $nameLower -match 'sapato' -or $nameLower -match 'chinelo') { return 'shoe' }
    if ($idLower -match 'livro' -or $nameLower -match 'livro') { return 'book' }
    if ($idLower -match 'fone' -or $nameLower -match 'fone de ouvido') { return 'headphone' }
    if ($idLower -match 'arvore' -or $nameLower -match 'árvore') { return 'tree_deciduous' }
    if ($idLower -match 'palmeira' -or $nameLower -match 'palmeira' -or $nameLower -match 'coqueiro') { return 'tree_palm' }

    return $oldShape
}

$rawCatalog = [System.Collections.Generic.List[psobject]]::new()

# MICRO_PEQUENO (50 itens: 0.005m a 0.05m / 0.5 cm a 5.0 cm)
$microPeqData = @(
    @('formiga', 'Formiga Saúva', 0.012, 'circle_coin'),
    @('grao_cafe', 'Grão de Café Torrado', 0.010, 'circle_coin'),
    @('abelha', 'Abelha Operária', 0.015, 'circle_coin'),
    @('joaninha', 'Joaninha', 0.008, 'circle_coin'),
    @('dente', 'Dente Humano Molar', 0.020, 'box_small'),
    @('moeda_5c', 'Moeda de 5 Centavos', 0.022, 'circle_coin'),
    @('moeda_10c', 'Moeda de 10 Centavos', 0.020, 'circle_coin'),
    @('moeda_25c', 'Moeda de 25 Centavos', 0.025, 'circle_coin'),
    @('moeda_50c', 'Moeda de 50 Centavos', 0.023, 'circle_coin'),
    @('moeda_1r', 'Moeda de 1 Real', 0.027, 'circle_coin'),
    @('clipes', 'Clipes de Papel', 0.033, 'box_small'),
    @('tampinha', 'Tampinha de Garrafa', 0.012, 'circle_coin'),
    @('dado', 'Dado de 6 Lados', 0.016, 'box_small'),
    @('bateria_botao', 'Bateria Botão (CR2032)', 0.005, 'circle_coin'),
    @('microsd', 'Cartão MicroSD', 0.015, 'box_small'),
    @('cartao_sd', 'Cartão de Memória SD', 0.032, 'box_small'),
    @('tampa_caneta', 'Tampa de Caneta Bic', 0.045, 'battery'),
    @('borracha', 'Borracha Escolar', 0.040, 'box_small'),
    @('pilha_aaa', 'Pilha AAA (Palito)', 0.044, 'battery'),
    @('pilha_aa', 'Pilha AA (Comum)', 0.050, 'battery'),
    @('chave', 'Chave de Porta', 0.055, 'tool'),
    @('pendrive', 'Pendrive USB', 0.050, 'box_small'),
    @('caixa_fosforo', 'Caixa de Fósforos', 0.050, 'box_small'),
    @('rolha', 'Rolha de Vinho', 0.045, 'battery'),
    @('canivete_fechado', 'Canivete Suíço Fechado', 0.050, 'tool'),
    @('anel', 'Anel / Aliança de Casamento', 0.020, 'circle_coin'),
    @('parafuso', 'Parafuso com Porca', 0.040, 'tool'),
    @('apontador', 'Apontador de Lápis', 0.025, 'box_small'),
    @('earbud', 'Fone de Ouvido Earbud (AirPod)', 0.028, 'battery'),
    @('palheta', 'Palheta de Guitarra', 0.030, 'circle_coin'),
    @('botao_camisa', 'Botão de Camisa Social', 0.012, 'circle_coin'),
    @('cadeado_pequeno', 'Cadeado de Segredo', 0.045, 'box_small'),
    @('peao_xadrez', 'Peão de Xadrez', 0.045, 'battery'),
    @('domino', 'Peça de Dominó', 0.050, 'box_small'),
    @('capsula_cafe', 'Cápsula de Café Nespresso', 0.030, 'cup'),
    @('chiclete', 'Chiclete em Barra', 0.035, 'box_small'),
    @('tampa_refrigerante', 'Tampa Plástica de PET', 0.015, 'circle_coin'),
    @('moeda_dolar', 'Moeda de 1 Dólar', 0.026, 'circle_coin'),
    @('moeda_euro', 'Moeda de 2 Euros', 0.026, 'circle_coin'),
    @('plug_tomada', 'Plugue de Tomada 3 Pinos', 0.040, 'box_small'),
    @('ima_geladeira', 'Ímã de Geladeira', 0.040, 'circle_coin'),
    @('broca', 'Broca de Furadeira Média', 0.050, 'tool'),
    @('pilha_9v', 'Bateria 9V Retangular', 0.048, 'box_small'),
    @('tampa_remedio', 'Tampa de Frasco de Remédio', 0.020, 'circle_coin'),
    @('comprimido', 'Comprimido Efervescente', 0.025, 'circle_coin'),
    @('fita_isolante', 'Rolo de Fita Isolante', 0.050, 'circle_coin'),
    @('isqueiro', 'Isqueiro BIC Mini', 0.060, 'battery'),
    @('giz_escolar', 'Giz Escolar Branco', 0.060, 'battery'),
    @('canivete', 'Canivete Suíço Médio', 0.060, 'tool'),
    @('alfinete', 'Alfinete de Segurança', 0.040, 'tool')
)

foreach ($p in $microPeqData) {
    $rawCatalog.Add([pscustomobject]@{ id=$p[0]; name=$p[1]; size=$p[2]; cat='micro_pequeno'; shape=$p[3] })
}

# Adiciona PEQUENO (130 itens: 0.06m a 0.35m / 6 cm a 35 cm)
$pequenosData = @(
    @('xicara', 'Xícara de Café', 0.08, 'cup'),
    @('maca', 'Maçã Fuji', 0.085, 'fruit_round'),
    @('laranja', 'Laranja Pera', 0.08, 'fruit_round'),
    @('pessego', 'Pêssego Maduro', 0.07, 'fruit_round'),
    @('limao', 'Limão Tahiti', 0.065, 'fruit_round'),
    @('kiwi', 'Kiwi Peludo', 0.06, 'fruit_round'),
    @('manga', 'Manga Tommy', 0.12, 'fruit_round'),
    @('abacate', 'Abacate Manteiga', 0.14, 'fruit_round'),
    @('pera', 'Pêra Williams', 0.09, 'fruit_round'),
    @('tomate', 'Tomate Gaúcho', 0.08, 'fruit_round'),
    @('cebola', 'Cebola Roxa', 0.08, 'fruit_round'),
    @('batata', 'Batata Inglesa', 0.10, 'fruit_round'),
    @('cenoura', 'Cenoura Fresca', 0.18, 'fruit_curved'),
    @('milho', 'Espiga de Milho', 0.20, 'fruit_curved'),
    @('pepino', 'Pepino Japonês', 0.22, 'fruit_curved'),
    @('berinjela', 'Berinjela Roxa', 0.20, 'fruit_curved'),
    @('pimentao', 'Pimentão Vermelho', 0.12, 'fruit_round'),
    @('lata_refri', 'Lata de Refrigerante 350ml', 0.12, 'can'),
    @('lata_cerveja', 'Lata de Cerveja Latão 473ml', 0.16, 'can'),
    @('lata_conserva', 'Lata de Milho / Ervilha', 0.09, 'can'),
    @('lata_atum', 'Lata de Atum', 0.04, 'can'),
    @('copo_americano', 'Copo Americano de Vidro', 0.09, 'cup'),
    @('caneca', 'Caneca de Porcelana', 0.11, 'mug'),
    @('taca_vinho', 'Taça de Vinho Tinto', 0.22, 'cup'),
    @('taca_champanhe', 'Taça de Champanhe', 0.24, 'cup'),
    @('copo_stanley', 'Copo Térmico Stanley', 0.17, 'cup'),
    @('garrafa_longneck', 'Garrafa de Cerveja Long Neck', 0.23, 'bottle'),
    @('garrafa_vinho', 'Garrafa de Vinho 750ml', 0.30, 'bottle'),
    @('garrafa_azeite', 'Garrafa de Azeite 500ml', 0.26, 'bottle'),
    @('garrafa_shoyu', 'Garrafa de Shoyu 150ml', 0.15, 'bottle'),
    @('garrafa_pet500', 'Garrafa PET 500ml', 0.21, 'bottle'),
    @('garrafa_pet2l', 'Garrafa PET 2L', 0.33, 'bottle'),
    @('garrafa_vidro1l', 'Garrafa de Vidro 1L', 0.31, 'bottle'),
    @('squeeze', 'Garrafa Squeeze de Academia', 0.25, 'bottle'),
    @('iphone', 'Smartphone (iPhone 15)', 0.15, 'phone'),
    @('iphone_max', 'Smartphone Pro Max', 0.16, 'phone'),
    @('ipad_mini', 'Tablet iPad Mini', 0.20, 'phone'),
    @('kindle', 'Leitor Digital Kindle', 0.16, 'phone'),
    @('controle_tv', 'Controle Remoto de TV', 0.21, 'phone'),
    @('controle_ps5', 'Controle DualSense PS5', 0.11, 'appliance_cube'),
    @('mouse', 'Mouse de Computador', 0.12, 'appliance_cube'),
    @('teclado_comp', 'Teclado Compacto 60%', 0.13, 'phone'),
    @('roteador', 'Roteador Wi-Fi com Antenas', 0.18, 'appliance_cube'),
    @('headphone', 'Fone Headphone com Arco', 0.20, 'headphone'),
    @('caixa_som_mini', 'Caixinha de Som JBL Go', 0.08, 'appliance_cube'),
    @('caixa_som_portatil', 'Caixa de Som JBL Flip', 0.18, 'bottle'),
    @('carregador', 'Carregador Turbo com Cabo', 0.08, 'appliance_cube'),
    @('powerbank', 'Powerbank Bateria Portátil', 0.14, 'phone'),
    @('calculadora', 'Calculadora Científica', 0.16, 'phone'),
    @('tenis', 'Tênis de Corrida Esportivo', 0.13, 'shoe'),
    @('chinelo', 'Chinelo Havaianas Tradicional', 0.26, 'shoe'),
    @('sapato_social', 'Sapato Social Masculino', 0.12, 'shoe'),
    @('bota_infantil', 'Bota de Galocha Infantil', 0.22, 'shoe'),
    @('salto_alto', 'Sapato de Salto Alto', 0.16, 'shoe'),
    @('chuteira', 'Chuteira Society com Travas', 0.12, 'shoe'),
    @('bone', 'Boné Aba Reta / Curva', 0.13, 'shoe'),
    @('touca', 'Touca de Lã de Inverno', 0.20, 'headphone'),
    @('relogio_aberto', 'Relógio de Pulso com Pulseira', 0.24, 'phone'),
    @('bola_tenis', 'Bola de Tênis Amarela', 0.067, 'ball'),
    @('bola_beisebol', 'Bola de Beisebol Costurada', 0.074, 'ball'),
    @('disco_hoquei', 'Disco de Hóquei (Puck)', 0.076, 'circle_coin'),
    @('bola_sinuca', 'Bola de Sinuca / Bilhar', 0.057, 'ball'),
    @('peteca', 'Peteca de Badminton', 0.085, 'cup'),
    @('bola_handebol', 'Bola de Handebol Oficial', 0.18, 'ball'),
    @('bola_volei', 'Bola de Vôlei Mikasa', 0.21, 'ball'),
    @('bola_futebol', 'Bola de Futebol de Campo', 0.22, 'ball'),
    @('bola_basquete', 'Bola de Basquete Spalding', 0.24, 'ball'),
    @('bola_fa', 'Bola de Futebol Americano', 0.28, 'fruit_curved'),
    @('pao_frances', 'Pão Francês Crocante', 0.15, 'bread'),
    @('pao_hamburguer', 'Pão de Hambúrguer com Gergelim', 0.07, 'bread'),
    @('croissant', 'Croissant Francês', 0.08, 'bread'),
    @('donut', 'Rosquinha / Donut Glacê', 0.04, 'circle_coin'),
    @('fatia_bolo', 'Fatia Triangular de Bolo', 0.09, 'bread'),
    @('hamburguer', 'Hambúrguer Gourmet Duplo', 0.11, 'bread'),
    @('barra_chocolate', 'Barra de Chocolate 150g', 0.18, 'phone'),
    @('panetone', 'Panetone Tradicional 500g', 0.18, 'cup'),
    @('livro_bolso', 'Livro de Bolso Compacto', 0.18, 'book'),
    @('livro_capa_dura', 'Livro Capa Dura Tradicional', 0.23, 'book'),
    @('dicionario', 'Dicionário Aurélio Grosso', 0.28, 'book'),
    @('caderno', 'Caderno Universitário 10 Matérias', 0.28, 'book'),
    @('pasta_a4', 'Pasta Catálogo Executiva A4', 0.31, 'book'),
    @('martelo', 'Martelo de Carpinteiro', 0.32, 'tool'),
    @('chave_fenda', 'Chave de Fenda Grande', 0.25, 'tool'),
    @('alicate', 'Alicate Universal de Eletricista', 0.20, 'tool'),
    @('furadeira', 'Furadeira de Impacto Portátil', 0.26, 'tool'),
    @('trena', 'Trena Métrica de 5 Metros', 0.08, 'box_small'),
    @('nivel_bolha', 'Nível de Bolha de Pedreiro', 0.30, 'tool'),
    @('ferro_passar', 'Ferro de Passar Roupas a Vapor', 0.15, 'shoe'),
    @('secador', 'Secador de Cabelo Profissional', 0.24, 'tool'),
    @('chapinha', 'Chapinha / Prancha de Cabelo', 0.30, 'tool'),
    @('escova_cabelo', 'Escova de Cabelo com Cerdas', 0.23, 'tool'),
    @('espelho_mesa', 'Espelho Redondo de Maquiagem', 0.28, 'circle_coin'),
    @('perfume', 'Frasco de Perfume 100ml', 0.13, 'bottle'),
    @('desodorante', 'Desodorante Aerossol 150ml', 0.18, 'can'),
    @('creme_dental', 'Tubo de Pasta de Dente 90g', 0.18, 'battery'),
    @('shampoo', 'Frasco de Shampoo 400ml', 0.22, 'bottle'),
    @('suculenta', 'Vaso de Planta Suculenta', 0.12, 'cup'),
    @('porta_retratos', 'Porta-Retratos de Mesa 10x15', 0.18, 'book'),
    @('abajur_pequeno', 'Abajur Pequeno de Cabeceira', 0.32, 'cup'),
    @('ampulheta', 'Ampulheta de Vidro Clássica', 0.16, 'cup'),
    @('globo_terra', 'Globo Terrestre Pequeno de Mesa', 0.30, 'ball'),
    @('cofrinho', 'Cofrinho de Cerâmica Porquinho', 0.14, 'quadruped_small'),
    @('pato_borracha', 'Pato Amarelo de Borracha', 0.10, 'bird_standing'),
    @('action_figure', 'Boneco de Ação (Action Figure)', 0.18, 'human_standing'),
    @('urso_pelucia_p', 'Ursinho de Pelúcia Pequeno', 0.22, 'bear_standing'),
    @('marmita', 'Marmita Hermética com Trava', 0.08, 'appliance_cube'),
    @('coqueteleira', 'Coqueteleira de Academia 700ml', 0.22, 'cup'),
    @('espatula', 'Espátula de Cozinha de Silicone', 0.32, 'tool'),
    @('rolo_massa', 'Rolo de Abrir Massa de Madeira', 0.35, 'tool'),
    @('bule', 'Bule Esmaltado de Café', 0.20, 'cup'),
    @('liquidificador_copo', 'Copo de Liquidificador 1.5L', 0.26, 'cup'),
    @('sanduicheira', 'Sanduicheira Grill Fechada', 0.12, 'appliance_cube'),
    @('torradeira', 'Torradeira de Pão de 2 Fatias', 0.20, 'appliance_cube'),
    @('banana', 'Banana Prata', 0.18, 'fruit_curved'),
    @('gato', 'Gato Doméstico Sentado', 0.25, 'quadruped_small'),
    @('notebook', 'Notebook Aberto 14 Polegadas', 0.24, 'appliance_cube'),
    @('pizza', 'Caixa Fechada de Pizza Broto', 0.25, 'box_small'),
    @('fone_ouvido', 'Fone de Ouvido Intra-auricular', 0.10, 'headphone'),
    @('saboneteira', 'Saboneteira de Banheiro com Sabonete', 0.08, 'box_small'),
    @('pincel_pintura', 'Pincel de Trincha de Pintura', 0.22, 'tool'),
    @('espremedor', 'Espremedor Manual de Laranja', 0.20, 'cup'),
    @('relogio_parede_p', 'Relógio de Parede Redondo 25cm', 0.25, 'circle_coin'),
    @('vela_perfumada', 'Vela Perfumada em Pote de Vidro', 0.10, 'can'),
    @('peso_halter_2kg', 'Halter Emborrachado 2kg', 0.10, 'tool'),
    @('garfo_faca', 'Conjunto de Garfo e Faca de Mesa', 0.21, 'tool'),
    @('concha_sopa', 'Concha de Inox para Sopa', 0.30, 'tool'),
    @('ralador', 'Ralador de Queijo 4 Faces', 0.24, 'monument_tower'),
    @('forma_bolo', 'Forma Redonda de Bolo com Furo', 0.10, 'circle_coin'),
    @('garrafa_termica', 'Garrafa Térmica de Café 1L', 0.30, 'bottle'),
    @('abridor_vinho', 'Saca-Rolhas de Asas', 0.18, 'tool')
)

foreach ($p in $pequenosData) {
    $rawCatalog.Add([pscustomobject]@{ id=$p[0]; name=$p[1]; size=$p[2]; cat='pequeno'; shape=$p[3] })
}

# Adiciona MÉDIO-PEQUENO (140 itens: 0.35m a 1.15m / 35 cm a 115 cm)
$medioPeqData = @(
    @('microondas', 'Forno Micro-ondas 30L', 0.32, 'appliance_cube'),
    @('air_fryer', 'Fritadeira Elétrica Air Fryer', 0.36, 'appliance_cube'),
    @('cafeteira_expresso', 'Cafeteira Expresso de Cápsula', 0.34, 'appliance_cube'),
    @('pizza_familia', 'Caixa de Pizza Família 8 Pedaços', 0.40, 'box_small'),
    @('galao_agua', 'Galão de Água Mineral 20 Litros', 0.49, 'bottle'),
    @('mochila', 'Mochila Escolar com Livros', 0.45, 'appliance_cube'),
    @('mala_bordo', 'Mala de Bordo para Avião', 0.55, 'appliance_cube'),
    @('mala_media', 'Mala de Viagem Média com Rodinhas', 0.65, 'appliance_cube'),
    @('mala_grande', 'Mala de Viagem Grande 23kg', 0.75, 'appliance_cube'),
    @('caixa_termica', 'Caixa Térmica Cooler 32L', 0.42, 'appliance_cube'),
    @('botijao_gas', 'Botijão de Gás de Cozinha P13', 0.47, 'bottle'),
    @('barril_chopp', 'Barril de Chopp 50L de Inox', 0.60, 'bottle'),
    @('pneu_aro14', 'Pneu de Carro Popular Aro 14', 0.58, 'circle_coin'),
    @('pneu_camionete', 'Pneu All-Terrain Aro 18', 0.78, 'circle_coin'),
    @('roda_bike29', 'Roda de Bicicleta Aro 29', 0.74, 'circle_coin'),
    @('skate', 'Skate Street com Rodinhas', 0.80, 'shoe'),
    @('longboard', 'Skate Longboard Asfáltico', 1.00, 'shoe'),
    @('patinete', 'Patinete Infantil com Guidão', 0.90, 'vehicle_two_wheels'),
    @('cadeira_escritorio', 'Cadeira de Escritório Giratória', 0.95, 'chair'),
    @('cadeira_gamer', 'Cadeira Gamer com Encosto Alto', 1.15, 'chair'),
    @('cadeira_jantar', 'Cadeira de Jantar de Madeira', 0.90, 'chair'),
    @('banqueta', 'Banqueta Alta de Cozinha/Bar', 0.75, 'chair'),
    @('mesa_centro', 'Mesa de Centro de Sala', 0.45, 'appliance_cube'),
    @('criado_mudo', 'Mesa de Cabeceira / Criado-Mudo', 0.55, 'appliance_cube'),
    @('puf_sala', 'Puf Redondo de Tecido', 0.45, 'circle_coin'),
    @('carrinho_bebe', 'Carrinho de Bebê com Capota', 1.05, 'chair'),
    @('andador', 'Andador Infantil com Rodinhas', 0.50, 'appliance_cube'),
    @('bike_infantil', 'Bicicleta Infantil Aro 16 com Rodinhas', 0.75, 'vehicle_two_wheels'),
    @('maquina_lavar', 'Máquina de Lavar Roupas 12kg', 0.85, 'appliance_cube'),
    @('lava_loucas', 'Máquina Lava-Louças de Embutir', 0.82, 'appliance_cube'),
    @('fogao_4bocas', 'Fogão a Gás 4 Bocas', 0.86, 'appliance_cube'),
    @('frigobar', 'Frigobar de Hotel 76 Litros', 0.64, 'appliance_cube'),
    @('ventilador_coluna', 'Ventilador de Coluna com Pedestal', 1.15, 'pole_structure'),
    @('ventilador_mesa', 'Ventilador de Mesa 40cm', 0.55, 'circle_coin'),
    @('aspirador_vertical', 'Aspirador de Pó Vertical sem Fio', 1.10, 'tool'),
    @('caixa_som_torre', 'Caixa de Som Torre para Festa', 0.95, 'appliance_cube'),
    @('gabinete_gamer', 'Gabinete de PC Gamer com RGB', 0.50, 'appliance_cube'),
    @('monitor_34', 'Monitor Ultrawide 34 Polegadas', 0.48, 'phone'),
    @('tv_50', 'Televisão Smart 50 Polegadas', 0.68, 'phone'),
    @('violao', 'Violão Acústico Clássico', 1.00, 'instrument_string'),
    @('guitarra', 'Guitarra Elétrica Stratocaster', 1.00, 'instrument_string'),
    @('baixo_eletrico', 'Contrabaixo Elétrico 4 Cordas', 1.15, 'instrument_string'),
    @('violoncelo_p', 'Violoncelo Infantil de Madeira', 1.05, 'instrument_string'),
    @('violino', 'Violino com Arco', 0.60, 'instrument_string'),
    @('ukulele', 'Ukulele Havaiano Soprano', 0.54, 'instrument_string'),
    @('cavaquinho', 'Cavaquinho Brasileiro de Samba', 0.62, 'instrument_string'),
    @('saxofone', 'Saxofone Alto Dourado', 0.66, 'instrument_wind'),
    @('trompete', 'Trompete em Si Bemol', 0.50, 'instrument_wind'),
    @('trombone', 'Trombone de Vara com Campana', 1.15, 'instrument_wind'),
    @('bumbo_bateria', 'Bumbo de Bateria Acústica 22"', 0.60, 'circle_coin'),
    @('caixa_bateria', 'Caixa de Bateria com Esteira', 0.35, 'circle_coin'),
    @('teclado_musical', 'Teclado Sintetizador com Suporte', 1.00, 'phone'),
    @('sanfona', 'Sanfona / Acordeon 120 Baixos', 0.52, 'appliance_cube'),
    @('capivara', 'Capivara Adulta do Parque', 0.60, 'quadruped_medium'),
    @('golden', 'Cão Golden Retriever', 0.60, 'quadruped_medium'),
    @('pastor_alemao', 'Cão Pastor Alemão', 0.65, 'quadruped_medium'),
    @('labrador', 'Cão Labrador Amarelo', 0.58, 'quadruped_medium'),
    @('buldogue_frances', 'Cão Buldogue Francês', 0.32, 'quadruped_small'),
    @('poodle', 'Cão Poodle Médio', 0.38, 'quadruped_small'),
    @('beagle', 'Cão Beagle Farejador', 0.38, 'quadruped_small'),
    @('rottweiler', 'Cão Rottweiler de Guarda', 0.68, 'quadruped_medium'),
    @('husky', 'Cão Husky Siberiano', 0.60, 'quadruped_medium'),
    @('doberman', 'Cão Doberman Elegante', 0.70, 'quadruped_medium'),
    @('boxer', 'Cão Boxer Atleta', 0.63, 'quadruped_medium'),
    @('maine_coon', 'Gato Maine Coon Gigante', 0.40, 'quadruped_small'),
    @('bicho_preguica', 'Bicho-Preguiça no Galho', 0.60, 'bear_standing'),
    @('tatu', 'Tatu-Canastra Gigante', 0.50, 'quadruped_small'),
    @('tamandua_mirim', 'Tamanduá-Mirim Brasileiro', 0.65, 'quadruped_small'),
    @('macaco_prego', 'Macaco-Prego em Pé', 0.45, 'bear_standing'),
    @('lemure', 'Lêmure de Cauda Listrada', 0.45, 'bear_standing'),
    @('guaxinim', 'Guaxinim Mascarado', 0.50, 'quadruped_small'),
    @('raposa', 'Raposa-Vermelha', 0.50, 'quadruped_small'),
    @('castor', 'Castor Construtor de Diques', 0.45, 'quadruped_small'),
    @('lontra', 'Lontra Neotropical Nadando', 0.40, 'sea_creature'),
    @('coelho', 'Coelho Branco Doméstico', 0.35, 'quadruped_small'),
    @('pinguim_imperador', 'Pinguim-imperador Adulto', 1.15, 'bird_standing'),
    @('pinguim_magalhaes', 'Pinguim-de-Magalhães', 0.70, 'bird_standing'),
    @('flamingo', 'Flamingo Rosa na Água', 1.10, 'bird_standing'),
    @('pavao', 'Pavão Colorido Real', 1.00, 'bird_standing'),
    @('peru', 'Peru de Natal Doméstico', 0.80, 'bird_standing'),
    @('ganso', 'Ganso Branco Guardião', 0.85, 'bird_standing'),
    @('cisne', 'Cisne Negro Elegante', 0.90, 'bird_standing'),
    @('pelicano', 'Pelicano Branco com Papo', 1.15, 'bird_standing'),
    @('garca', 'Garça-Branca-Grande', 0.95, 'bird_standing'),
    @('aguia_real', 'Águia-Real Pousada', 0.85, 'bird_standing'),
    @('gaviao', 'Gavião-Carijó no Galho', 0.40, 'bird_standing'),
    @('condor', 'Condor-dos-Andes Pousado', 1.15, 'bird_standing'),
    @('tucano', 'Tucano Toco com Bico Laranja', 0.55, 'bird_standing'),
    @('arara_vermelha', 'Arara-Vermelha Grande', 0.90, 'bird_standing'),
    @('jabuti', 'Jabuti-Piranga Brasileiro', 0.40, 'circle_coin'),
    @('camaleao', 'Camaleão de Madagascar', 0.50, 'quadruped_small'),
    @('iguana', 'Iguana Verde no Tronco', 0.50, 'reptile_dino'),
    @('suricato', 'Suricato Vigilante em Pé', 0.30, 'bear_standing'),
    @('porco_espinho', 'Porco-Espinho Brasileiro', 0.45, 'quadruped_small'),
    @('hidrante', 'Hidrante de Rua Vermelho', 0.75, 'bottle'),
    @('cone_transito', 'Cone Laranja de Trânsito', 0.75, 'cup'),
    @('carrinho_mercado', 'Carrinho de Supermercado de Metal', 1.00, 'chair'),
    @('escada_3degraus', 'Escada Doméstica de Alumínio', 0.90, 'tool'),
    @('caixa_ferramentas', 'Caixa de Ferramentas Sanfonada', 0.45, 'appliance_cube'),
    @('galinha', 'Galinha Caipira no Terreiro', 0.40, 'bird_standing'),
    @('galo', 'Galo Cantando de Manhã', 0.45, 'bird_standing'),
    @('pato', 'Pato Branco Nadador', 0.42, 'bird_standing'),
    @('batedeira', 'Batedeira Planetária de Cozinha', 0.38, 'appliance_cube'),
    @('computador_allinone', 'Computador All-in-One 24"', 0.45, 'phone'),
    @('aquario_peixes', 'Aquário de Vidro Retangular 50L', 0.40, 'appliance_cube'),
    @('globo_espelhado', 'Globo Espelhado de Balada', 0.50, 'ball'),
    @('vela_chao', 'Vela Cilíndrica Grossa de Chão', 0.40, 'can'),
    @('poste_jardim', 'Poste Balizador de Jardim', 0.80, 'pole_structure'),
    @('vaso_samambaia', 'Vaso Suspenso com Samambaia', 0.80, 'tree'),
    @('quadro_pintura', 'Quadro de Pintura a Óleo 60x80', 0.80, 'book'),
    @('churrasqueira_bafo', 'Churrasqueira Pequena a Bafo', 0.85, 'appliance_cube'),
    @('mala_viagem_p', 'Mala Pequena de Academia', 0.40, 'appliance_cube'),
    @('caixa_papelao', 'Caixa Grande de Mudança', 0.60, 'appliance_cube'),
    @('cesto_roupa', 'Cesto de Roupas de Vime/Plástico', 0.65, 'can'),
    @('filhote_leao', 'Filhote de Leão Africano', 0.50, 'quadruped_small'),
    @('filhote_urso', 'Filhote de Urso Pardo', 0.55, 'quadruped_small'),
    @('filhote_panda', 'Filhote de Urso Panda', 0.45, 'quadruped_small'),
    @('filhote_canguru', 'Canguru na Bolsa da Mãe', 0.40, 'bear_standing'),
    @('koala', 'Coala no Eucalipto', 0.60, 'bear_standing'),
    @('texugo_mel', 'Texugo-do-Mel Bravo', 0.35, 'quadruped_small'),
    @('tamandua_bandeira_filhote', 'Filhote de Tamanduá', 0.50, 'quadruped_small'),
    @('jiboia_enrolada', 'Cobra Jiboia Enrolada no Chão', 0.40, 'circle_coin'),
    @('tartaruga_marinha_p', 'Tartaruga Marinha Jovem', 0.60, 'sea_creature'),
    @('tubarao_lixa_p', 'Tubarão-Lixa Pequeno', 0.50, 'sea_creature'),
    @('arraia', 'Arraia Manta Pequena', 0.60, 'sea_creature'),
    @('polvo', 'Polvo dos Recifes com Tentáculos', 0.50, 'sea_creature'),
    @('lagosta_gigante', 'Lagosta Gigante do Atlântico', 0.55, 'sea_creature'),
    @('caranguejo_rei', 'Caranguejo-Gigante-Vermelho', 0.45, 'sea_creature'),
    @('estatua_buda_mesa', 'Estátua de Buda em Lótus de Mesa', 0.45, 'monument_statue'),
    @('estatua_anjo', 'Estátua de Querubim / Anjinho', 0.60, 'monument_statue'),
    @('trofeu_campeonato', 'Troféu Grande de Campeão', 0.70, 'cup'),
    @('busto_marmore', 'Busto de Mármore Histórico', 0.65, 'human_standing'),
    @('balde_gelo', 'Balde de Champanhe com Pedestal', 0.85, 'cup'),
    @('torre_cerveja', 'Torre de Chopp Girafa 3.5L', 0.70, 'bottle')
)

foreach ($p in $medioPeqData) {
    $rawCatalog.Add([pscustomobject]@{ id=$p[0]; name=$p[1]; size=$p[2]; cat='medio_pequeno'; shape=$p[3] })
}

# Adiciona MÉDIO (120 itens: 1.15m a 2.50m)
$medioData = @(
    @('crianca6', 'Criança de 6 anos', 1.15, 'human_standing'),
    @('crianca10', 'Criança de 10 anos', 1.38, 'human_standing'),
    @('adolescente14', 'Adolescente de 14 anos', 1.60, 'human_standing'),
    @('mulher_adulta', 'Mulher Adulta Brasileira Média', 1.62, 'human_standing'),
    @('homem_adulto', 'Homem Adulto Brasileiro Médio', 1.75, 'human_standing'),
    @('homem_alto', 'Homem Alto (1,90 m)', 1.90, 'human_standing'),
    @('atleta_basquete', 'Jogador de Basquete Profissional', 2.05, 'human_standing'),
    @('central_volei', 'Jogador Central de Vôlei', 2.10, 'human_standing'),
    @('gigante_nba', 'Atleta Pivô da NBA (Shaquille)', 2.16, 'human_standing'),
    @('astronauta', 'Astronauta com Traje Espacial EMU', 2.00, 'human_standing'),
    @('mergulhador', 'Mergulhador com Roupa e Cilindros', 1.80, 'human_standing'),
    @('soldado', 'Soldado com Capacete Tático e Colete', 1.85, 'human_standing'),
    @('medico_cirurgiao', 'Cirurgião Paramentado no Hospital', 1.75, 'human_standing'),
    @('mestre_karate', 'Carateca Faixa Preta em Pose', 1.70, 'human_standing'),
    @('bailarina', 'Bailarina Clássica na Ponta dos Pés', 1.80, 'human_standing'),
    @('skatista', 'Skatista Agachado em Manobra', 1.50, 'human_standing'),
    @('ciclista', 'Ciclista de Estrada com Bicicleta', 1.75, 'vehicle_two_wheels'),
    @('moto_scooter', 'Moto Scooter 125cc Automática', 1.20, 'vehicle_two_wheels'),
    @('moto_street', 'Moto Urbana 160cc de Trabalho', 1.15, 'vehicle_two_wheels'),
    @('moto_trail', 'Moto Cross / Trail com Suspensão Alta', 1.35, 'vehicle_two_wheels'),
    @('moto_ninja', 'Moto Super Esportiva Carenada 1000cc', 1.20, 'vehicle_two_wheels'),
    @('moto_harley', 'Moto Custom Chopper Estilo Cruiser', 1.25, 'vehicle_two_wheels'),
    @('quadriciclo', 'Quadriciclo ATV 4x4 Todo-Terreno', 1.25, 'vehicle_two_wheels'),
    @('jetski', 'Jet Ski Náutico no Reboque', 1.15, 'vehicle_boat'),
    @('fusca', 'Carro Fusca Clássico VW', 1.45, 'vehicle_car'),
    @('carro_uno', 'Carro Hatch Fiat Uno com Escada', 1.70, 'vehicle_car'),
    @('carro_gol', 'Carro Popular VW Gol', 1.46, 'vehicle_car'),
    @('carro_corolla', 'Carro Sedan Toyota Corolla', 1.45, 'vehicle_car'),
    @('carro_civic', 'Carro Sedan Honda Civic', 1.43, 'vehicle_car'),
    @('suv_renegade', 'Carro SUV Jeep Renegade', 1.70, 'vehicle_car'),
    @('picape_hilux', 'Picape Cabine Dupla Toyota Hilux', 1.82, 'vehicle_car'),
    @('picape_ram', 'Picape Pesada RAM 2500 Gigante', 2.05, 'vehicle_car'),
    @('kombi', 'Kombi Clássica Corujinha', 2.05, 'vehicle_car'),
    @('vaca_holandesa', 'Vaca Leiteira Malhada', 1.50, 'quadruped_large'),
    @('touro_nelore', 'Touro Nelore com Cupim', 1.65, 'quadruped_large'),
    @('bezerro', 'Bezerro Nelore Jovem', 1.20, 'quadruped_large'),
    @('cavalo_crioulo', 'Cavalo Crioulo dos Pampas', 1.55, 'quadruped_large'),
    @('cavalo_mangalarga', 'Cavalo Manga-larga Marchador', 1.65, 'quadruped_large'),
    @('cavalo_puro_sangue', 'Cavalo Puro-Sangue Inglês de Corrida', 1.70, 'quadruped_large'),
    @('burro', 'Burro / Jumento Nordestino', 1.30, 'quadruped_large'),
    @('mula', 'Mula de Carga Forte', 1.50, 'quadruped_large'),
    @('zebra', 'Zebra Listrada das Planícies', 1.45, 'quadruped_large'),
    @('lhama', 'Lhama Andina Peluda', 1.70, 'quadruped_large'),
    @('alpaca', 'Alpaca dos Andes com Lã Fofa', 1.40, 'quadruped_large'),
    @('camelo', 'Camelo Dromedário com Corcova', 2.15, 'quadruped_large'),
    @('leao_adulto', 'Leão Macho Adulto com Juba Negra', 1.20, 'quadruped_large'),
    @('leao_em_pe', 'Leão em Pé nas Duas Patas', 2.20, 'bear_standing'),
    @('tigre_siberiano', 'Tigre Siberiano Adulto', 1.25, 'quadruped_large'),
    @('tigre_em_pe', 'Tigre em Pé Apoiado no Tronco', 2.30, 'bear_standing'),
    @('leopardo', 'Leopardo Pintado no Galho', 1.15, 'quadruped_large'),
    @('guepardo', 'Guepardo Mais Rápido do Mundo', 1.20, 'quadruped_large'),
    @('onca_pintada', 'Onça-Pintada do Pantanal', 1.20, 'quadruped_large'),
    @('urso_panda_pe', 'Urso Panda Gigante em Pé', 1.60, 'bear_standing'),
    @('urso_polar_pe', 'Urso Polar Ártico em Pé', 2.60, 'bear_standing'),
    @('urso_pardo_pe', 'Urso Pardo Grizzly em Pé', 2.50, 'bear_standing'),
    @('gorila_montanha', 'Gorila-das-Montanhas em Pé', 1.80, 'bear_standing'),
    @('chimpanze_pe', 'Chimpanzé Adulto em Pé', 1.40, 'bear_standing'),
    @('orangotango', 'Orangotango Macho com Bochechas', 1.50, 'bear_standing'),
    @('canguru_vermelho', 'Canguru-Vermelho em Pé', 1.85, 'bear_standing'),
    @('avestruz', 'Avestruz Africana Adulta', 2.30, 'bird_standing'),
    @('ema', 'Ema Brasileira Corredora', 1.50, 'bird_standing'),
    @('cervo_veado', 'Veado Campeiro com Chifres', 1.40, 'quadruped_large'),
    @('alce_gigante', 'Alce Canadense com Chifres em Pá', 2.10, 'quadruped_large'),
    @('boi_almiscarado', 'Boi Almiscarado com Pelagem Longa', 1.50, 'quadruped_large'),
    @('javali', 'Javali Selvagem com Presas', 1.15, 'quadruped_large'),
    @('geladeira_duplex', 'Geladeira Duplex Frost Free', 1.85, 'appliance_cube'),
    @('geladeira_sidebyside', 'Geladeira Side by Side 3 Portas', 1.90, 'appliance_cube'),
    @('freezer_vertical', 'Freezer Vertical Grande', 1.75, 'appliance_cube'),
    @('fogao_industrial', 'Fogão Industrial com Coifa', 1.20, 'appliance_cube'),
    @('vending_machine', 'Máquina de Refrigerantes / Salgados', 1.90, 'appliance_cube'),
    @('porta_residencial', 'Porta Residencial de Madeira', 2.10, 'human_standing'),
    @('porta_pivotante', 'Porta Pivotante Alta de Mansão', 2.40, 'human_standing'),
    @('guarda_roupa', 'Guarda-Roupa Casal 6 Portas', 2.30, 'appliance_cube'),
    @('armario_alto', 'Armário Despensa Alto de Cozinha', 1.90, 'appliance_cube'),
    @('estante_livros', 'Estante de Biblioteca com 6 Prateleiras', 2.10, 'appliance_cube'),
    @('cristaleira', 'Cristaleira Antiga de Vidro', 1.80, 'appliance_cube'),
    @('beliche', 'Beliche Infantil de Madeira', 1.65, 'chair'),
    @('cama_box', 'Cama Box Casal com Cabeceira Acolchoada', 1.25, 'chair'),
    @('guarda_sol', 'Guarda-Sol de Praia Aberto', 2.10, 'pole_structure'),
    @('gazebo', 'Gazebo / Tenda Sanfonada 3x3m', 2.50, 'pole_structure'),
    @('trave_futsal', 'Trave Oficial de Futsal (3x2m)', 2.00, 'monument_building'),
    @('trave_campo', 'Trave Oficial de Campo (7.32x2.44m)', 2.44, 'monument_building'),
    @('cabine_telefonica', 'Cabine Telefônica Vermelha Londrina', 2.50, 'phone'),
    @('orelhao', 'Orelhão Telefônico Brasileiro', 1.65, 'pole_structure'),
    @('poste_padrao', 'Poste de Entrada de Energia Residencial', 2.40, 'pole_structure'),
    @('manequim', 'Manequim de Vitrine de Loja', 1.80, 'human_standing'),
    @('caixao', 'Urna Funerária / Caixão em Pé', 1.95, 'phone'),
    @('escada_articulada', 'Escada Articulada Aberta em A', 2.00, 'pole_structure'),
    @('andaime', 'Módulo de Andaime de Construção', 2.00, 'monument_building'),
    @('betoneira', 'Betoneira de Obra com Motor 400L', 1.50, 'appliance_cube'),
    @('compressor_ar', 'Compressor de Ar Industrial 100L', 1.40, 'appliance_cube'),
    @('piano_vertical', 'Piano Acústico Vertical de Parede', 1.30, 'appliance_cube'),
    @('harpa', 'Harpa Sinfônica de Concerto', 1.85, 'instrument_string'),
    @('arvore_natal', 'Árvore de Natal Decorada de Sala', 2.10, 'tree'),
    @('biombo', 'Biombo Divisório de Ambientes', 1.80, 'book'),
    @('painel_solar', 'Placa Solar Fotovoltaica Inclinada', 1.70, 'phone'),
    @('totem_autoatendimento', 'Totem de Autoatendimento McDonald''s', 1.85, 'phone'),
    @('catraca_onibus', 'Catraca de Ônibus com Balcão', 1.30, 'appliance_cube'),
    @('bancada_trabalho', 'Bancada de Marceneiro com Morsa', 1.40, 'chair'),
    @('carrinho_pipoca', 'Carrinho de Pipoca de Praça', 1.50, 'chair'),
    @('chopeira_bar', 'Balcão de Chopp com Naja e Torneiras', 1.40, 'appliance_cube'),
    @('relogio_coluna', 'Relógio Antigo de Coluna (Cuco)', 2.00, 'monument_tower'),
    @('estatua_cavaleiro', 'Armadura Medieval Completa em Pé', 1.90, 'human_standing'),
    @('escultura_madeira', 'Totem Indígena Esculpido em Tronco', 2.20, 'pole_structure'),
    @('bateria_completa', 'Bateria Acústica com Pratos Montados', 1.40, 'appliance_cube'),
    @('sinuca_mesa', 'Mesa Oficial de Sinuca com Tacos', 1.45, 'chair'),
    @('pebolim', 'Mesa de Pebolim / Totó', 1.20, 'chair'),
    @('fliperama', 'Gabinete Arcade de Fliperama', 1.80, 'appliance_cube'),
    @('mesa_pingpong', 'Mesa de Tênis de Mesa Dobrada', 1.60, 'appliance_cube'),
    @('carrinho_golfe', 'Carrinho Elétrico de Golfe', 1.80, 'vehicle_car'),
    @('mini_trator', 'Trator Cortador de Grama Giro Zero', 1.25, 'vehicle_car'),
    @('toldo_comercial', 'Fachada com Toldo Comercial', 2.40, 'monument_building'),
    @('poste_placa', 'Poste de Placa Pare / Semáforo Pedestre', 2.30, 'pole_structure'),
    @('cavalete_obra', 'Cavalete de Sinalização de Obra', 1.20, 'pole_structure'),
    @('lixeira_seletiva', 'Conjunto de Lixeiras de Coleta Seletiva', 1.20, 'appliance_cube'),
    @('portao_garagem', 'Portão de Garagem Basculante Fechado', 2.40, 'monument_building'),
    @('espelho_corpo', 'Espelho de Corpo Inteiro Moldurado', 1.80, 'phone'),
    @('armario_vestiario', 'Armário Vestiário de Metal 4 Portas', 1.90, 'appliance_cube'),
    @('palanque', 'Púlpito de Oratória de Madeira', 1.20, 'chair')
)

foreach ($p in $medioData) {
    $rawCatalog.Add([pscustomobject]@{ id=$p[0]; name=$p[1]; size=$p[2]; cat='medio'; shape=$p[3] })
}

# Adiciona GRANDE (60 itens: 2.50m a 15.0m)
$grandeData = @(
    @('van_sprinter', 'Van Escolar Mercedes Sprinter', 2.60, 'vehicle_van_truck'),
    @('van_carga', 'Furgão de Carga Teto Alto', 2.80, 'vehicle_van_truck'),
    @('micro_onibus', 'Micro-ônibus Rodoviário Executivo', 2.95, 'vehicle_bus'),
    @('onibus_urbano', 'Ônibus Urbano Convencional', 3.20, 'vehicle_bus'),
    @('onibus_articulado', 'Ônibus Articulado (Sanfonado)', 3.25, 'vehicle_bus'),
    @('onibus_2andares', 'Ônibus Rodoviário Double Decker', 4.10, 'vehicle_bus'),
    @('caminhao_toco', 'Caminhão Toco Caçamba Basculante', 3.10, 'vehicle_van_truck'),
    @('caminhao_betoneira', 'Caminhão Betoneira de Concreto', 3.80, 'vehicle_van_truck'),
    @('caminhao_bau', 'Caminhão Baú de Mudança Pesada', 3.90, 'vehicle_van_truck'),
    @('caminhao_cegonha', 'Caminhão Cegonha com Carros', 4.30, 'vehicle_van_truck'),
    @('caminhao_bombeiros', 'Caminhão de Bombeiros com Escada Magirus', 3.60, 'vehicle_van_truck'),
    @('carreta_bitrem', 'Carreta Graneleira Bitrem 9 Eixos', 4.20, 'vehicle_van_truck'),
    @('trator_agricola', 'Trator Agrícola com Cabine Climatizada', 3.20, 'vehicle_van_truck'),
    @('colheitadeira', 'Colheitadeira de Grãos com Plataforma', 4.00, 'vehicle_van_truck'),
    @('retroescavadeira', 'Retroescavadeira com Pá e Braço', 3.50, 'vehicle_van_truck'),
    @('trator_esteira', 'Trator de Esteira Buldôzer de Mineração', 3.40, 'vehicle_van_truck'),
    @('container_20', 'Container Marítimo Padrão 20 Pés', 2.60, 'appliance_cube'),
    @('container_40', 'Container Marítimo High Cube 40 Pés', 2.90, 'appliance_cube'),
    @('tabela_basquete_aro', 'Tabela de Basquete (Altura do Aro)', 3.05, 'monument_tower'),
    @('tabela_basquete_topo', 'Tabela de Basquete (Topo da Estrutura)', 3.95, 'monument_tower'),
    @('trave_fa', 'Trave em Y de Futebol Americano', 9.10, 'pole_structure'),
    @('semaforo_poste', 'Poste com Semáforo de Cruzamento', 4.50, 'pole_structure'),
    @('poste_luz_rua', 'Poste de Iluminação Pública Padrão', 8.00, 'pole_structure'),
    @('poste_alta_tensao', 'Poste de Concreto de Alta Tensão', 11.00, 'pole_structure'),
    @('elefante_africano', 'Elefante Africano Adulto', 3.30, 'quadruped_huge'),
    @('elefante_asiatico', 'Elefante Asiático com Presas', 2.90, 'quadruped_huge'),
    @('rinoceronte', 'Rinoceronte-Branco com Chifre Frontal', 2.70, 'quadruped_huge'),
    @('hipopotamo', 'Hipopótamo Gigante do Rio Nilo', 2.60, 'quadruped_huge'),
    @('girafa_macho', 'Girafa Macho Adulta', 5.50, 'quadruped_huge'),
    @('girafa_femea', 'Girafa Fêmea Adulta', 4.80, 'quadruped_huge'),
    @('trex', 'Tiranossauro Rex (T-Rex)', 4.50, 'reptile_dino'),
    @('espinossauro', 'Espinossauro com Vela Dorsal', 5.00, 'reptile_dino'),
    @('triceratops', 'Tricerátops Chifrudo Pré-Histórico', 3.00, 'reptile_dino'),
    @('estegossauro', 'Estegossauro com Placas Ósseas', 4.00, 'reptile_dino'),
    @('mamute', 'Mamute-Lanoso da Era do Gelo', 3.50, 'quadruped_huge'),
    @('pterodactilo', 'Pterodáctilo Quetzalcoatlus em Pé', 5.00, 'bird_standing'),
    @('tubarao_branco', 'Tubarão-Branco Adulto', 2.00, 'sea_creature'),
    @('orca', 'Orca (Baleia Assassina)', 2.50, 'sea_creature'),
    @('tubarao_baleia', 'Tubarão-Baleia Gigante dos Oceanos', 3.20, 'sea_creature'),
    @('casa_terrea', 'Casa Térrea Residencial', 4.50, 'monument_building'),
    @('sobrado_2andares', 'Sobrado Residencial de 2 Andares', 7.50, 'monument_building'),
    @('casa_3andares', 'Casa de 3 Andares com Sótão', 10.50, 'monument_building'),
    @('chale_montanha', 'Chalé de Montanha com Telhado Inclinado', 6.50, 'monument_building'),
    @('galpao_industrial', 'Galpão Industrial com Portão Alto', 8.50, 'monument_building'),
    @('caixa_dagua_torre', 'Caixa d''Água Tubular de Bairro', 12.00, 'monument_tower'),
    @('silo_graos', 'Silo Metálico de Grãos de Fazenda', 14.00, 'monument_building'),
    @('moinho_vento', 'Moinho de Vento Holandês Tradicional', 14.00, 'monument_building'),
    @('veleiro_mastro', 'Barco Veleiro com Mastro e Velas', 12.00, 'vehicle_boat'),
    @('iate_luxo', 'Iate de Luxo de 60 Pés', 6.00, 'vehicle_boat'),
    @('rebocador', 'Barco Rebocador de Manobra Portuária', 8.00, 'vehicle_boat'),
    @('vagaotrem', 'Vagão de Passageiros de Trem', 3.80, 'vehicle_bus'),
    @('vagao_metro', 'Vagão de Trem do Metrô Urbano', 3.70, 'vehicle_bus'),
    @('locomotiva_diesel', 'Locomotiva Diesel de Carga', 4.80, 'vehicle_van_truck'),
    @('aviao_cessna', 'Avião Monomotor Cessna 172', 2.70, 'vehicle_airplane'),
    @('aviao_kingair', 'Avião Turboélice King Air', 4.50, 'vehicle_airplane'),
    @('jato_executivo', 'Jato Executivo Embraer Phenom', 5.10, 'vehicle_airplane'),
    @('aviao_e195', 'Jato Comercial Embraer E195-E2', 10.50, 'vehicle_airplane'),
    @('aviao_737', 'Avião Comercial Boeing 737-800', 12.50, 'vehicle_airplane'),
    @('helicoptero_civil', 'Helicóptero de Passeio R44', 3.30, 'vehicle_airplane'),
    @('bala_ar_quente', 'Balão de Ar Quente Turístico Inflado', 15.00, 'cup')
)

foreach ($p in $grandeData) {
    $rawCatalog.Add([pscustomobject]@{ id=$p[0]; name=$p[1]; size=$p[2]; cat='grande'; shape=$p[3] })
}

# Adiciona MONUMENTAL (40 itens: 15.0m a 400.0m)
$monumentoData = @(
    @('araucaria', 'Pinheiro Araucária Adulto Centenário', 15.00, 'tree'),
    @('palmeira_imperial', 'Palmeira Imperial do Jardim Botânico', 15.00, 'tree'),
    @('ipe_amarelo', 'Árvore Ipê Amarelo Florido', 12.00, 'tree'),
    @('pau_brasil', 'Árvore Pau-Brasil Secular', 15.00, 'tree'),
    @('braquiossauro', 'Dinossauro Braquiossauro Pescoçudo', 15.00, 'reptile_dino'),
    @('predio_5andares', 'Edifício Residencial de 5 Andares', 16.00, 'monument_building'),
    @('esfinge', 'Grande Esfinge de Gizé', 20.00, 'monument_statue'),
    @('argentinossauro', 'Dinossauro Gigante Argentinossauro', 21.00, 'reptile_dino'),
    @('portao_brandemburgo', 'Portão de Brandemburgo (Berlim)', 26.00, 'monument_building'),
    @('baleia_azul', 'Baleia Azul Gigante (Comprimento)', 30.00, 'sea_creature'),
    @('predio_10andares', 'Edifício Comercial de 10 Andares', 30.00, 'monument_building'),
    @('cristo_redentor', 'Cristo Redentor (Rio de Janeiro)', 38.00, 'monument_statue'),
    @('coliseu', 'Coliseu de Roma (Arena Flávia)', 48.00, 'monument_building'),
    @('arco_triunfo', 'Arco do Triunfo de Paris', 50.00, 'monument_building'),
    @('onibus_espacial', 'Ônibus Espacial na Plataforma de Lançamento', 56.00, 'rocket'),
    @('santa_rita', 'Estátua de Santa Rita de Cássia (RN)', 56.00, 'monument_statue'),
    @('torre_pisa', 'Torre de Pisa Inclinada (Itália)', 57.00, 'monument_tower'),
    @('predio_20andares', 'Edifício Comercial de 20 Andares', 60.00, 'monument_building'),
    @('navio_cargueiro', 'Navio Cargueiro Porta-Contêineres', 60.00, 'vehicle_boat'),
    @('catedral_se', 'Catedral da Sé de São Paulo (Cúpula)', 65.00, 'monument_building'),
    @('obelisco_ba', 'Obelisco de Buenos Aires (Argentina)', 67.00, 'monument_tower'),
    @('notre_dame', 'Catedral de Notre-Dame de Paris', 69.00, 'monument_building'),
    @('foguete_falcon9', 'Foguete Falcon 9 da SpaceX', 70.00, 'rocket'),
    @('navio_cruzeiro', 'Navio Transatlântico de Cruzeiro', 70.00, 'vehicle_boat'),
    @('buda_leshan', 'Grande Buda de Leshan Esculpido em Pedra', 71.00, 'monument_statue'),
    @('taj_mahal', 'Palácio Taj Mahal (Índia)', 73.00, 'monument_building'),
    @('porta_avioes', 'Navio Porta-Aviões Nuclear', 76.00, 'vehicle_boat'),
    @('sequoia_gigante', 'Árvore Sequóia General Sherman', 84.00, 'tree'),
    @('roda_gigante_rio', 'Roda-Gigante Yup Star (Rio de Janeiro)', 88.00, 'circle_coin'),
    @('estatua_liberdade', 'Estátua da Liberdade (Nova York)', 93.00, 'monument_statue'),
    @('big_ben', 'Torre do Relógio Big Ben (Londres)', 96.00, 'monument_tower'),
    @('foguete_saturn5', 'Foguete Saturn V da Missão Apollo', 111.00, 'rocket'),
    @('plataforma_petroleo', 'Plataforma de Petróleo Semi-Submersível', 110.00, 'monument_building'),
    @('foguete_starship', 'Foguete Starship com Super Heavy', 121.00, 'rocket'),
    @('turbina_eolica', 'Turbina Eólica de Geração de Energia', 120.00, 'pole_structure'),
    @('predio_40andares', 'Arranha-Céu Residencial de 40 Andares', 120.00, 'monument_building'),
    @('london_eye', 'Roda-Gigante Millennium London Eye', 135.00, 'circle_coin'),
    @('basilica_sao_pedro', 'Basílica de São Pedro no Vaticano', 136.00, 'monument_building'),
    @('piramide_gize', 'Grande Pirâmide de Gizé (Quéops)', 138.00, 'monument_building'),
    @('edificio_italia', 'Edifício Itália (São Paulo)', 165.00, 'monument_building'),
    @('estatua_unidade', 'Estátua da Unidade (Índia)', 182.00, 'monument_statue'),
    @('usina_itaipu', 'Barragem de Concreto da Usina de Itaipu', 196.00, 'monument_building'),
    @('predio_60andares', 'Arranha-Céu de 60 Andares', 200.00, 'monument_building'),
    @('one_tower_bc', 'Edifício One Tower (Balneário Camboriú)', 290.00, 'monument_building'),
    @('torre_eiffel', 'Torre Eiffel de Paris (França)', 330.00, 'monument_tower'),
    @('torre_toquio', 'Torre de Comunicações de Tóquio', 333.00, 'monument_tower'),
    @('empire_state', 'Empire State Building (Nova York)', 381.00, 'monument_building')
)

foreach ($p in $monumentoData) {
    $rawCatalog.Add([pscustomobject]@{ id=$p[0]; name=$p[1]; size=$p[2]; cat='monumento'; shape=$p[3] })
}



Write-Host "Total de itens cadastrados no catÃ¡logo:" $rawCatalog.Count

# Formata cada item para JavaScript
$jsItems = [System.Collections.Generic.List[string]]::new()

foreach ($it in $rawCatalog) {
    $id = $it.id
    $name = $it.name.Replace("'", "\'")
    $size = $it.size
    $cat = $it.cat
    
    # FormataÃ§Ã£o de exibiÃ§Ã£o da unidade
    if ($size -lt 1.0) {
        $cmVal = [math]::Round($size * 100, 1)
        $unit = "cm"
        $display = ("{0:0.#} cm" -f $cmVal).Replace('.', ',')
    } else {
        $unit = "m"
        if ($size -ge 10) {
            $display = ("{0:0} m" -f [math]::Round($size, 0)).Replace('.', ',')
        } else {
            $display = ("{0:0.00} m" -f $size).Replace('.', ',')
        }
    }

    # Renderiza o SVG apropriado pelo arquÃ©tipo de alta fidelidade
    $shape = Get-AccurateShape $id $it.name $it.shape $cat
    $templateScript = $templates[$shape]
    if (-not $templateScript) { $templateScript = $templates[$it.shape] }
    if (-not $templateScript) { $templateScript = $templates['appliance_cube'] }

    $svg = & $templateScript

    $entry = "        {`n" +
             "            id: '$id',`n" +
             "            name: '$name',`n" +
             "            size: $size,`n" +
             "            unit: '$unit',`n" +
             "            display: '$display',`n" +
             "            category: '$cat',`n" +
             "            svg: `"$svg`"`n" +
             "        }"

    $jsItems.Add($entry)
}

$allItemsJs = $jsItems -join ",`n"

$fileContent = "/**`n" +
               " * CatÃ¡logo Expandido de Itens e Silhuetas para o jogo O MEU Ã‰ MAIOR`n" +
               " * ContÃ©m $($rawCatalog.Count) itens reais categorizados e proporcionados com silhuetas condizentes.`n" +
               " */`n`n" +
               "window.SIZE_IT_UP_ITEMS = [`n" +
               $allItemsJs + "`n" +
               "];`n"

$utf8Bom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($outputPath, $fileContent, $utf8Bom)
Write-Host "Arquivo gerado com sucesso em: $outputPath ($($rawCatalog.Count) itens)!"