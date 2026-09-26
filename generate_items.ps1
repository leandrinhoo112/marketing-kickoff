# generate_items.ps1
$ErrorActionPreference = 'Stop'
$outputPath = Join-Path $PSScriptRoot "o-meu-e-maior-items.js"

Write-Host "Iniciando geração de 540 itens para O MEU É MAIOR..."

# Templates de SVG para os arquétipos visuais
$templates = @{
    circle_coin = { param($text, $inner) "<svg viewBox='0 0 100 100' width='100%' height='100%'><circle cx='50' cy='50' r='46' fill='currentColor'/><circle cx='50' cy='50' r='36' fill='none' stroke='rgba(0,0,0,0.3)' stroke-width='6'/><text x='50' y='58' font-size='22' font-family='sans-serif' font-weight='900' fill='rgba(0,0,0,0.45)' text-anchor='middle'>$text</text></svg>" }
    box_small = { param($w, $h) "<svg viewBox='0 0 100 100' width='100%' height='100%'><rect x='15' y='20' width='70' height='60' rx='6' fill='currentColor'/><rect x='22' y='28' width='56' height='44' rx='3' fill='rgba(0,0,0,0.25)'/><circle cx='50' cy='50' r='8' fill='rgba(255,255,255,0.2)'/></svg>" }
    battery = { param($w) "<svg viewBox='0 0 60 110' width='100%' height='100%'><rect x='22' y='4' width='16' height='8' rx='2' fill='currentColor'/><rect x='10' y='12' width='40' height='92' rx='6' fill='currentColor'/><rect x='14' y='35' width='32' height='45' fill='rgba(0,0,0,0.25)'/><text x='30' y='65' font-size='24' font-family='sans-serif' font-weight='bold' fill='rgba(255,255,255,0.6)' text-anchor='middle'>+</text></svg>" }
    cup = { param() "<svg viewBox='0 0 100 80' width='100%' height='100%'><path d='M15,10 L85,10 C85,55 70,75 50,75 C30,75 15,55 15,10 Z' fill='currentColor'/><path d='M85,20 C95,20 100,32 98,45 C95,55 85,55 80,52' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><ellipse cx='50' cy='10' rx='35' ry='6' fill='rgba(255,255,255,0.2)'/></svg>" }
    mug = { param() "<svg viewBox='0 0 90 100' width='100%' height='100%'><rect x='15' y='10' width='55' height='80' rx='8' fill='currentColor'/><path d='M70,25 C85,25 90,40 88,55 C85,70 70,70 70,68' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><ellipse cx='42.5' cy='10' rx='27.5' ry='6' fill='rgba(255,255,255,0.25)'/></svg>" }
    can = { param() "<svg viewBox='0 0 60 120' width='100%' height='100%'><rect x='5' y='10' width='50' height='100' rx='10' fill='currentColor'/><ellipse cx='30' cy='10' rx='22' ry='5' fill='rgba(255,255,255,0.25)'/><ellipse cx='30' cy='110' rx='22' ry='5' fill='rgba(0,0,0,0.2)'/><rect x='15' y='3' width='30' height='6' rx='2' fill='currentColor'/></svg>" }
    bottle = { param() "<svg viewBox='0 0 50 140' width='100%' height='100%'><rect x='18' y='5' width='14' height='14' rx='2' fill='currentColor'/><path d='M19,19 C12,30 6,45 6,65 L6,125 C6,132 12,136 25,136 C38,136 44,132 44,125 L44,65 C44,45 38,30 31,19 Z' fill='currentColor'/><ellipse cx='25' cy='95' rx='16' ry='14' fill='rgba(255,255,255,0.15)'/></svg>" }
    phone = { param() "<svg viewBox='0 0 65 130' width='100%' height='100%'><rect x='3' y='3' width='59' height='124' rx='12' fill='currentColor'/><rect x='8' y='12' width='49' height='106' rx='6' fill='rgba(0,0,0,0.35)'/><circle cx='32.5' cy='7' r='2.5' fill='rgba(255,255,255,0.3)'/></svg>" }
    fruit_round = { param() "<svg viewBox='0 0 90 90' width='100%' height='100%'><path d='M45,18 C30,8 10,25 15,55 C20,75 38,85 45,85 C52,85 70,75 75,55 C80,25 60,8 45,18 Z' fill='currentColor'/><path d='M45,18 C48,8 55,4 60,3' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='4' stroke-linecap='round'/></svg>" }
    fruit_curved = { param() "<svg viewBox='0 0 80 120' width='100%' height='100%'><path d='M20,10 C55,30 65,75 40,110 C50,95 55,60 25,25 C20,20 18,14 20,10 Z' fill='currentColor'/></svg>" }
    ball = { param() "<svg viewBox='0 0 100 100' width='100%' height='100%'><circle cx='50' cy='50' r='46' fill='currentColor'/><polygon points='50,30 65,42 60,58 40,58 35,42' fill='rgba(0,0,0,0.3)'/><circle cx='50' cy='50' r='46' fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='4'/></svg>" }
    shoe = { param() "<svg viewBox='0 0 140 70' width='100%' height='100%'><path d='M10,55 C10,55 20,62 50,62 C90,62 130,55 130,45 C130,30 110,25 95,28 L75,10 C65,10 55,20 45,35 L20,40 C12,43 10,50 10,55 Z' fill='currentColor'/><rect x='10' y='58' width='120' height='8' rx='4' fill='rgba(255,255,255,0.3)'/></svg>" }
    bread = { param() "<svg viewBox='0 0 130 65' width='100%' height='100%'><ellipse cx='65' cy='35' rx='55' ry='25' fill='currentColor'/><path d='M35,20 Q45,35 40,48' stroke='rgba(0,0,0,0.3)' stroke-width='5' fill='none'/><path d='M65,15 Q75,35 70,48' stroke='rgba(0,0,0,0.3)' stroke-width='5' fill='none'/><path d='M95,20 Q105,35 100,48' stroke='rgba(0,0,0,0.3)' stroke-width='5' fill='none'/></svg>" }
    book = { param() "<svg viewBox='0 0 80 110' width='100%' height='100%'><rect x='12' y='10' width='56' height='90' rx='4' fill='currentColor'/><rect x='16' y='15' width='48' height='80' rx='2' fill='rgba(0,0,0,0.25)'/><line x1='12' y1='10' x2='12' y2='100' stroke='rgba(255,255,255,0.4)' stroke-width='6'/></svg>" }
    headphone = { param() "<svg viewBox='0 0 100 110' width='100%' height='100%'><path d='M20,60 C20,25 80,25 80,60' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><rect x='12' y='55' width='16' height='35' rx='7' fill='currentColor'/><rect x='72' y='55' width='16' height='35' rx='7' fill='currentColor'/></svg>" }
    tool = { param() "<svg viewBox='0 0 70 120' width='100%' height='100%'><rect x='32' y='25' width='8' height='90' rx='3' fill='currentColor'/><rect x='12' y='10' width='48' height='20' rx='4' fill='currentColor'/><polygon points='12,15 5,10 12,25' fill='currentColor'/></svg>" }
    appliance_cube = { param() "<svg viewBox='0 0 110 80' width='100%' height='100%'><rect x='5' y='10' width='100' height='65' rx='8' fill='currentColor'/><rect x='12' y='18' width='60' height='49' rx='4' fill='rgba(0,0,0,0.35)'/><circle cx='88' cy='28' r='6' fill='rgba(255,255,255,0.3)'/><circle cx='88' cy='46' r='6' fill='rgba(255,255,255,0.3)'/><rect x='80' y='58' width='16' height='4' rx='2' fill='rgba(255,255,255,0.3)'/></svg>" }
    chair = { param() "<svg viewBox='0 0 80 120' width='100%' height='100%'><rect x='22' y='10' width='36' height='42' rx='6' fill='currentColor'/><rect x='15' y='55' width='50' height='12' rx='4' fill='currentColor'/><rect x='36' y='67' width='8' height='30' fill='currentColor'/><polygon points='40,97 15,115 65,115' fill='currentColor'/><circle cx='15' cy='115' r='4' fill='rgba(255,255,255,0.4)'/><circle cx='65' cy='115' r='4' fill='rgba(255,255,255,0.4)'/></svg>" }
    instrument_string = { param() "<svg viewBox='0 0 60 130' width='100%' height='100%'><polygon points='27,5 33,5 33,60 27,60' fill='currentColor'/><ellipse cx='30' cy='80' rx='16' ry='18' fill='currentColor'/><ellipse cx='30' cy='105' rx='22' ry='24' fill='currentColor'/><circle cx='30' cy='85' r='7' fill='rgba(0,0,0,0.35)'/></svg>" }
    instrument_wind = { param() "<svg viewBox='0 0 70 120' width='100%' height='100%'><path d='M25,10 L35,10 L35,80 C35,100 55,100 55,80 L55,70 L65,70 L65,85 C65,110 25,110 25,80 Z' fill='currentColor'/><polygon points='20,10 40,10 35,5 25,5' fill='currentColor'/></svg>" }
    vehicle_two_wheels = { param() "<svg viewBox='0 0 130 90' width='100%' height='100%'><circle cx='25' cy='65' r='18' fill='currentColor'/><circle cx='105' cy='65' r='18' fill='currentColor'/><path d='M25,65 L55,65 L65,40 L90,40 L105,65' stroke='currentColor' stroke-width='8' fill='none' stroke-linejoin='round'/><rect x='40' y='32' width='28' height='12' rx='4' fill='currentColor'/><line x1='88' y1='40' x2='80' y2='18' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><line x1='74' y1='18' x2='86' y2='18' stroke='currentColor' stroke-width='6' stroke-linecap='round'/></svg>" }
    vehicle_car = { param() "<svg viewBox='0 0 160 80' width='100%' height='100%'><path d='M10,55 C10,50 20,40 35,40 L50,40 C60,25 75,18 95,18 C115,18 135,32 145,45 L155,50 C158,52 160,56 160,60 L160,68 C160,70 158,72 155,72 L145,72 C145,62 135,55 125,55 C115,55 105,62 105,72 L55,72 C55,62 45,55 35,55 C25,55 15,62 15,72 L5,72 C2,72 0,70 0,68 L0,60 Z' fill='currentColor'/><circle cx='35' cy='72' r='15' fill='rgba(0,0,0,0.4)'/><circle cx='125' cy='72' r='15' fill='rgba(0,0,0,0.4)'/><path d='M60,38 C68,26 80,24 95,24 C108,24 122,30 128,38 Z' fill='rgba(0,0,0,0.3)'/></svg>" }
    vehicle_van_truck = { param() "<svg viewBox='0 0 160 85' width='100%' height='100%'><path d='M15,20 L115,20 L145,45 L145,68 L15,68 Z' fill='currentColor'/><rect x='25' y='28' width='30' height='18' rx='3' fill='rgba(0,0,0,0.3)'/><rect x='62' y='28' width='30' height='18' rx='3' fill='rgba(0,0,0,0.3)'/><polygon points='100,28 118,28 135,45 100,45' fill='rgba(0,0,0,0.3)'/><circle cx='45' cy='68' r='14' fill='rgba(0,0,0,0.4)'/><circle cx='120' cy='68' r='14' fill='rgba(0,0,0,0.4)'/></svg>" }
    vehicle_bus = { param() "<svg viewBox='0 0 170 85' width='100%' height='100%'><rect x='5' y='10' width='160' height='60' rx='8' fill='currentColor'/><rect x='12' y='18' width='30' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><rect x='48' y='18' width='30' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><rect x='84' y='18' width='30' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><rect x='120' y='18' width='40' height='22' rx='3' fill='rgba(0,0,0,0.35)'/><circle cx='45' cy='70' r='14' fill='rgba(0,0,0,0.4)'/><circle cx='130' cy='70' r='14' fill='rgba(0,0,0,0.4)'/></svg>" }
    vehicle_airplane = { param() "<svg viewBox='0 0 170 85' width='100%' height='100%'><path d='M10,48 C30,48 50,45 80,45 L115,20 L130,20 L120,45 L155,46 C165,47 168,52 155,54 L120,54 L105,75 L95,75 L102,54 L10,53 Z' fill='currentColor'/></svg>" }
    vehicle_boat = { param() "<svg viewBox='0 0 160 90' width='100%' height='100%'><path d='M15,55 L145,55 L130,85 L35,85 Z' fill='currentColor'/><rect x='45' y='30' width='60' height='25' rx='3' fill='currentColor'/><rect x='55' y='35' width='18' height='12' fill='rgba(0,0,0,0.3)'/><rect x='80' y='35' width='18' height='12' fill='rgba(0,0,0,0.3)'/></svg>" }
    human_standing = { param() "<svg viewBox='0 0 60 140' width='100%' height='100%'><circle cx='30' cy='18' r='14' fill='currentColor'/><path d='M12,42 C12,36 18,34 30,34 C42,34 48,36 48,42 L45,82 L15,82 Z' fill='currentColor'/><line x1='12' y1='42' x2='3' y2='80' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><line x1='48' y1='42' x2='57' y2='80' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><rect x='18' y='84' width='9' height='52' rx='4' fill='currentColor'/><rect x='33' y='84' width='9' height='52' rx='4' fill='currentColor'/></svg>" }
    quadruped_small = { param() "<svg viewBox='0 0 100 90' width='100%' height='100%'><ellipse cx='45' cy='55' rx='30' ry='25' fill='currentColor'/><circle cx='70' cy='35' r='16' fill='currentColor'/><polygon points='62,25 65,10 74,22' fill='currentColor'/><polygon points='73,22 82,10 85,25' fill='currentColor'/><path d='M20,55 C10,50 5,30 15,20 C18,16 22,25 18,35 C15,45 22,50 25,52' fill='none' stroke='currentColor' stroke-width='7' stroke-linecap='round'/><rect x='30' y='70' width='8' height='18' rx='4' fill='currentColor'/><rect x='55' y='70' width='8' height='18' rx='4' fill='currentColor'/></svg>" }
    quadruped_medium = { param() "<svg viewBox='0 0 130 90' width='100%' height='100%'><ellipse cx='55' cy='50' rx='35' ry='22' fill='currentColor'/><circle cx='95' cy='32' r='15' fill='currentColor'/><path d='M102,32 L116,36 L114,44 L98,42 Z' fill='currentColor'/><path d='M88,26 C85,24 82,34 85,42' fill='currentColor' stroke='currentColor' stroke-width='4' stroke-linecap='round'/><path d='M22,48 C14,35 8,40 12,28' fill='none' stroke='currentColor' stroke-width='6' stroke-linecap='round'/><rect x='35' y='65' width='10' height='23' rx='4' fill='currentColor'/><rect x='75' y='65' width='10' height='23' rx='4' fill='currentColor'/></svg>" }
    quadruped_large = { param() "<svg viewBox='0 0 150 110' width='100%' height='100%'><ellipse cx='75' cy='55' rx='48' ry='30' fill='currentColor'/><path d='M115,40 C125,30 140,30 145,45 C145,55 138,65 125,68 Z' fill='currentColor'/><rect x='40' y='80' width='12' height='28' rx='4' fill='currentColor'/><rect x='95' y='80' width='12' height='28' rx='4' fill='currentColor'/><circle cx='60' cy='48' r='10' fill='rgba(0,0,0,0.3)'/><circle cx='95' cy='58' r='14' fill='rgba(0,0,0,0.3)'/></svg>" }
    quadruped_huge = { param() "<svg viewBox='0 0 150 110' width='100%' height='100%'><ellipse cx='70' cy='55' rx='45' ry='35' fill='currentColor'/><circle cx='115' cy='45' r='22' fill='currentColor'/><path d='M125,45 C135,55 130,85 120,95 C115,100 122,102 125,95 C138,80 145,50 130,35' fill='currentColor'/><ellipse cx='102' cy='45' rx='14' ry='22' fill='rgba(0,0,0,0.2)'/><rect x='35' y='80' width='15' height='28' rx='5' fill='currentColor'/><rect x='60' y='80' width='15' height='28' rx='5' fill='currentColor'/><rect x='90' y='80' width='15' height='28' rx='5' fill='currentColor'/></svg>" }
    bear_standing = { param() "<svg viewBox='0 0 90 140' width='100%' height='100%'><ellipse cx='45' cy='80' rx='30' ry='42' fill='currentColor'/><circle cx='45' cy='30' r='18' fill='currentColor'/><circle cx='32' cy='16' r='6' fill='currentColor'/><circle cx='58' cy='16' r='6' fill='currentColor'/><path d='M20,45 C10,55 8,75 16,85' stroke='currentColor' stroke-width='10' fill='none' stroke-linecap='round'/><path d='M70,45 C80,55 82,75 74,85' stroke='currentColor' stroke-width='10' fill='none' stroke-linecap='round'/><rect x='25' y='115' width='14' height='22' rx='5' fill='currentColor'/><rect x='51' y='115' width='14' height='22' rx='5' fill='currentColor'/></svg>" }
    bird_standing = { param() "<svg viewBox='0 0 70 120' width='100%' height='100%'><ellipse cx='35' cy='65' rx='22' ry='45' fill='currentColor'/><ellipse cx='35' cy='70' rx='14' ry='35' fill='rgba(255,255,255,0.25)'/><circle cx='35' cy='22' r='14' fill='currentColor'/><polygon points='35,22 55,26 35,30' fill='#facc15'/><ellipse cx='14' cy='60' rx='4' ry='22' fill='currentColor'/><ellipse cx='56' cy='60' rx='4' ry='22' fill='currentColor'/><polygon points='25,110 32,118 40,110' fill='#facc15'/><polygon points='40,110 48,118 55,110' fill='#facc15'/></svg>" }
    reptile_dino = { param() "<svg viewBox='0 0 160 120' width='100%' height='100%'><path d='M10,85 C30,75 50,70 65,65 L85,45 C95,30 115,25 135,28 L145,35 L125,50 L115,55 L105,75 C95,95 85,115 75,115 C65,115 70,95 60,85 Z' fill='currentColor'/><rect x='75' y='90' width='14' height='28' rx='6' fill='currentColor'/><line x1='90' y1='65' x2='105' y2='72' stroke='currentColor' stroke-width='5' stroke-linecap='round'/></svg>" }
    sea_creature = { param() "<svg viewBox='0 0 170 75' width='100%' height='100%'><path d='M10,40 C20,20 70,18 120,25 C145,28 160,35 168,22 C168,32 165,45 150,45 C120,45 70,55 30,52 Z' fill='currentColor'/><path d='M60,42 L50,60 L65,50' fill='currentColor'/></svg>" }
    tree = { param() "<svg viewBox='0 0 80 150' width='100%' height='100%'><line x1='40' y1='35' x2='40' y2='148' stroke='currentColor' stroke-width='7'/><path d='M40,35 C25,20 10,25 5,35' stroke='currentColor' stroke-width='5' fill='none' stroke-linecap='round'/><path d='M40,35 C55,20 70,25 75,35' stroke='currentColor' stroke-width='5' fill='none' stroke-linecap='round'/><path d='M40,35 C30,10 15,10 10,20' stroke='currentColor' stroke-width='5' fill='none' stroke-linecap='round'/><path d='M40,35 C50,10 65,10 70,20' stroke='currentColor' stroke-width='5' fill='none' stroke-linecap='round'/><path d='M40,35 C40,5 40,0 40,5' stroke='currentColor' stroke-width='5' fill='none'/></svg>" }
    pole_structure = { param() "<svg viewBox='0 0 60 160' width='100%' height='100%'><line x1='30' y1='20' x2='30' y2='158' stroke='currentColor' stroke-width='6'/><path d='M30,30 C30,10 52,10 52,25' fill='none' stroke='currentColor' stroke-width='5'/><polygon points='45,25 58,25 54,35 48,35' fill='#facc15'/></svg>" }
    monument_statue = { param() "<svg viewBox='0 0 140 150' width='100%' height='100%'><polygon points='45,148 95,148 90,120 50,120' fill='rgba(0,0,0,0.3)'/><path d='M56,120 L58,45 L10,45 L10,38 L59,38 L65,18 C65,12 75,12 75,18 L81,38 L130,38 L130,45 L82,45 L84,120 Z' fill='currentColor'/><circle cx='70' cy='18' r='8' fill='currentColor'/></svg>" }
    monument_tower = { param() "<svg viewBox='0 0 100 160' width='100%' height='100%'><polygon points='48,5 52,5 51,45 49,45' fill='currentColor'/><polygon points='46,45 54,45 58,95 42,95' fill='currentColor'/><path d='M20,158 L42,95 L58,95 L80,158 L68,158 L58,125 C55,118 45,118 42,125 L32,158 Z' fill='currentColor'/></svg>" }
    monument_building = { param() "<svg viewBox='0 0 90 160' width='100%' height='100%'><rect x='15' y='10' width='60' height='148' fill='currentColor'/><rect x='23' y='18' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='40' y='18' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='57' y='18' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='23' y='38' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='40' y='38' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='57' y='38' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='23' y='58' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='40' y='58' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='57' y='58' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='23' y='78' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='40' y='78' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='57' y='78' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='23' y='98' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='40' y='98' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='57' y='98' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='23' y='118' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='40' y='118' width='10' height='10' fill='rgba(0,0,0,0.3)'/><rect x='57' y='118' width='10' height='10' fill='rgba(0,0,0,0.3)'/></svg>" }
    rocket = { param() "<svg viewBox='0 0 50 160' width='100%' height='100%'><polygon points='25,5 33,25 17,25' fill='currentColor'/><rect x='17' y='25' width='16' height='115' rx='2' fill='currentColor'/><polygon points='17,120 5,145 17,140' fill='currentColor'/><polygon points='33,120 45,145 33,140' fill='currentColor'/><ellipse cx='25' cy='145' rx='8' ry='4' fill='rgba(0,0,0,0.4)'/></svg>" }
}

# Lista com 540 especificações completas de itens reais
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

Write-Host "Total de itens cadastrados no catálogo:" $rawCatalog.Count

# Formata cada item para JavaScript
$jsItems = [System.Collections.Generic.List[string]]::new()

foreach ($it in $rawCatalog) {
    $id = $it.id
    $name = $it.name.Replace("'", "\'")
    $size = $it.size
    $cat = $it.cat
    
    # Formatação de exibição da unidade
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

    # Renderiza o SVG apropriado pelo arquétipo
    $shape = $it.shape
    $templateScript = $templates[$shape]
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
               " * Catálogo Expandido de Itens e Silhuetas para o jogo O MEU É MAIOR`n" +
               " * Contém $($rawCatalog.Count) itens reais categorizados e proporcionados.`n" +
               " */`n`n" +
               "window.SIZE_IT_UP_ITEMS = [`n" +
               $allItemsJs + "`n" +
               "];`n"

[System.IO.File]::WriteAllText($outputPath, $fileContent, [System.Text.Encoding]::UTF8)
Write-Host "Arquivo gerado com sucesso em: $outputPath ($($rawCatalog.Count) itens)!"
