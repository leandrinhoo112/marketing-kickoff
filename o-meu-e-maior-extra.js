/**
 * O MEU É MAIOR - Itens extras ilustrados (coloridos)
 * Interbairros 2, Segurança Inspirar, Leandrão Campeão, Bruno + Claude,
 * Pokémons (altura oficial da Pokédex) e personagens de meme.
 * Carregar DEPOIS de o-meu-e-maior-items.js
 */
(function () {
    'use strict';

    const SV = (vb, inner) => `<svg viewBox='${vb}' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>${inner}</svg>`;
    const K = '#2a1a10'; // contorno escuro

    // ------------------------------------------------------------------
    // Pessoa frontal genérica (viewBox 70x120: topo da cabeça = 0, pés = 120)
    // ------------------------------------------------------------------
    function person(o) {
        const skin = o.skin || '#e0ac82';
        const arms = o.arms || `<path d='M18,27 L12,62' stroke='${o.sleeve || o.top}' stroke-width='9' stroke-linecap='round' fill='none'/><path d='M52,27 L58,62' stroke='${o.sleeve || o.top}' stroke-width='9' stroke-linecap='round' fill='none'/><circle cx='12' cy='65' r='4.5' fill='${skin}'/><circle cx='58' cy='65' r='4.5' fill='${skin}'/>`;
        return SV('0 0 70 120', `
            ${o.behind || ''}
            <rect x='20' y='64' width='14' height='46' rx='3' fill='${o.pants}'/>
            <rect x='36' y='64' width='14' height='46' rx='3' fill='${o.pants}'/>
            ${o.legs || ''}
            <ellipse cx='27' cy='115' rx='9' ry='5' fill='${o.shoes || '#111'}'/>
            <ellipse cx='43' cy='115' rx='9' ry='5' fill='${o.shoes || '#111'}'/>
            ${arms}
            <path d='M17,24 Q35,18 53,24 L51,66 L19,66 Z' fill='${o.top}'/>
            ${o.torso || ''}
            <rect x='31' y='16' width='8' height='8' rx='2' fill='${skin}'/>
            <ellipse cx='35' cy='9.5' rx='7.5' ry='9' fill='${skin}'/>
            ${o.hair || `<path d='M27.5,7 C26,-1 44,-1 42.5,7 C41,3 29,3 27.5,7Z' fill='#1b1b1f'/>`}
            ${o.face || `<circle cx='32' cy='9.5' r='1' fill='#222'/><circle cx='38' cy='9.5' r='1' fill='#222'/><path d='M32,14 Q35,16 38,14' stroke='#7a3b2a' stroke-width='1' fill='none'/>`}
            ${o.front || ''}
        `);
    }

    // Logo da Claude (estrela de raios arredondados) centrada em (0,0)
    function claudeSpark(color, scale) {
        let rays = '';
        const lens = [14, 10, 13, 9, 14, 10, 12, 9, 14, 10, 13, 9];
        for (let i = 0; i < 12; i++) {
            rays += `<line x1='0' y1='-2' x2='0' y2='-${lens[i]}' stroke='${color}' stroke-width='3.2' stroke-linecap='round' transform='rotate(${i * 30})'/>`;
        }
        return `<g transform='scale(${scale})'>${rays}</g>`;
    }

    const items = [];
    function add(id, name, size, category, svg) {
        const cm = size < 1;
        const v = cm ? Math.round(size * 100) + ' cm' : String(size).replace('.', ',') + (String(size).indexOf('.') === -1 ? ',00' : (String(size).split('.')[1].length === 1 ? '0' : '')) + ' m';
        items.push({ id: id, name: name, size: size, unit: cm ? 'cm' : 'm', display: v, category: category, svg: svg, colored: true });
    }

    // ------------------------------------------------------------------
    // INTERBAIROS 2 (ônibus verde, 3,20 m)
    // ------------------------------------------------------------------
    const windows = [18, 48, 78, 108].map(x => `<rect x='${x}' y='20' width='26' height='24' rx='3' fill='#cfeaf5' stroke='#1d4a2a' stroke-width='1.5'/><path d='M${x + 3},42 L${x + 12},22 L${x + 17},22 L${x + 8},42Z' fill='#ffffff' opacity='0.45'/>`).join('');
    add('interbairros_2', 'Ônibus Interbairros 2 (verdinho)', 3.2, 'grande', SV('0 0 200 88', `
        <rect x='4' y='8' width='190' height='64' rx='9' fill='#2f9e4f' stroke='#14522a' stroke-width='2'/>
        <rect x='4' y='50' width='190' height='9' fill='#ffffff'/>
        <rect x='4' y='59' width='190' height='5' fill='#14522a'/>
        <rect x='12' y='12' width='170' height='5' rx='2' fill='#14522a'/>
        ${windows}
        <rect x='140' y='20' width='34' height='40' rx='3' fill='#cfeaf5' stroke='#1d4a2a' stroke-width='1.5'/>
        <line x1='157' y1='20' x2='157' y2='60' stroke='#1d4a2a' stroke-width='1.5'/>
        <path d='M176,12 L194,20 L194,52 L176,52Z' fill='#cfeaf5' stroke='#1d4a2a' stroke-width='1.5'/>
        <rect x='178' y='3' width='16' height='7' rx='2' fill='#111'/><text x='186' y='9' font-size='5.6' font-family='monospace' font-weight='bold' fill='#ffa726' text-anchor='middle'>IB 2</text>
        <rect x='190' y='54' width='7' height='10' rx='2' fill='#fff59d'/>
        <rect x='2' y='54' width='5' height='10' rx='2' fill='#e53935'/>
        <rect x='60' y='34' width='0' height='0'/>
        <text x='92' y='57' font-size='7' font-family='Arial' font-weight='bold' fill='#14522a' text-anchor='middle'>INTERBAIROS 2</text>
        <circle cx='38' cy='72' r='13' fill='#1b1b1b'/><circle cx='38' cy='72' r='6' fill='#b0b0b0'/>
        <circle cx='150' cy='72' r='13' fill='#1b1b1b'/><circle cx='150' cy='72' r='6' fill='#b0b0b0'/>
        <rect x='4' y='76' width='190' height='8' fill='#14522a' opacity='0'/>
    `));

    // ------------------------------------------------------------------
    // PESSOAS
    // ------------------------------------------------------------------
    add('seguranca_inspirar', 'Segurança da Faculdade Inspirar', 2.0, 'medio', person({
        skin: '#4a2c1d', top: '#14161b', pants: '#14161b', shoes: '#050505',
        sleeve: '#14161b',
        torso: `<polygon points='29,22 41,22 35,42' fill='#f5f5f5'/><polygon points='34,25 36,25 37.5,40 35,44 32.5,40' fill='#b91c1c'/><polygon points='29,22 35,42 24,64 19,64' fill='#1d2027'/><polygon points='41,22 35,42 46,64 51,64' fill='#1d2027'/><rect x='38' y='44' width='9' height='6' rx='1' fill='#facc15'/><text x='42.5' y='48.7' font-size='3.2' font-family='Arial' font-weight='bold' fill='#111' text-anchor='middle'>INSP.</text>`,
        hair: `<ellipse cx='32.5' cy='3.2' rx='3' ry='1.5' fill='#ffffff' opacity='0.28'/><ellipse cx='27.4' cy='10' rx='1.4' ry='2.4' fill='#4a2c1d'/><ellipse cx='42.6' cy='10' rx='1.4' ry='2.4' fill='#4a2c1d'/>`,
        face: `<rect x='28' y='7' width='6.5' height='3.6' rx='1.2' fill='#050505'/><rect x='36' y='7' width='6.5' height='3.6' rx='1.2' fill='#050505'/><line x1='34.5' y1='8.5' x2='36' y2='8.5' stroke='#050505' stroke-width='1'/><path d='M32,14.5 L38,14.5' stroke='#2a140b' stroke-width='1.2'/><circle cx='27.4' cy='10.5' r='1.3' fill='#d8d8d8'/><path d='M27.4,12 C24,18 28,22 25,26' stroke='#d8d8d8' stroke-width='0.9' fill='none'/>`
    }));

    add('leandrao_campeao', 'Leandrão Campeão', 1.82, 'medio', person({
        skin: '#f1c7a8', top: '#f6cf1d', pants: '#1b4fa0', shoes: '#16a34a', sleeve: '#f6cf1d',
        legs: `<rect x='21' y='86' width='12' height='24' fill='#f1c7a8'/><rect x='37' y='86' width='12' height='24' fill='#f1c7a8'/><rect x='21' y='98' width='12' height='12' fill='#ffffff'/><rect x='37' y='98' width='12' height='12' fill='#ffffff'/><rect x='21' y='101' width='12' height='2' fill='#16a34a'/><rect x='37' y='101' width='12' height='2' fill='#16a34a'/>`,
        arms: `<path d='M18,27 L12,62' stroke='#f6cf1d' stroke-width='9' stroke-linecap='round' fill='none'/><circle cx='12' cy='65' r='4.5' fill='#f1c7a8'/><path d='M52,27 L61,42' stroke='#f6cf1d' stroke-width='9' stroke-linecap='round' fill='none'/><path d='M61,42 L62,29' stroke='#f1c7a8' stroke-width='7' stroke-linecap='round' fill='none'/><circle cx='62' cy='28' r='4.6' fill='#f1c7a8'/>
            <path d='M56,5 L68,5 L67,13 C67,19 63,21 62,22 C61,21 57,19 57,13 Z' fill='#fbbf24' stroke='#92610a' stroke-width='1'/><path d='M56,7 C52,7 52,15 58,15' stroke='#fbbf24' stroke-width='1.6' fill='none'/><path d='M68,7 C72,7 72,15 66,15' stroke='#fbbf24' stroke-width='1.6' fill='none'/><rect x='60.8' y='21' width='2.4' height='4' fill='#fbbf24'/><rect x='58' y='25' width='8' height='3' rx='1' fill='#92610a'/>`,
        torso: `<path d='M28,22 Q35,29 42,22 L42,25 Q35,32 28,25Z' fill='#16a34a'/><text x='35' y='48' font-size='13' font-family='Arial' font-weight='bold' fill='#16a34a' text-anchor='middle'>10</text><path d='M31,26 L29,36 L35,34 L41,36 L39,26' fill='none' stroke='#fbbf24' stroke-width='1.2'/><circle cx='35' cy='38' r='3.4' fill='#fbbf24' stroke='#92610a' stroke-width='0.8'/><rect x='19' y='64' width='32' height='23' rx='3' fill='#1b4fa0'/>`,
        hair: `<ellipse cx='35' cy='10' rx='8.6' ry='9.2' fill='#f1c7a8'/><ellipse cx='26.6' cy='10.5' rx='1.6' ry='2.4' fill='#f1c7a8'/><ellipse cx='43.4' cy='10.5' rx='1.6' ry='2.4' fill='#f1c7a8'/><path d='M26.5,9 C25,1 30,-1.5 35,-1 C41,-1.5 45.5,1.5 43.5,9 C43,5 41,3.6 39,4.2 C36,3 31,3.2 28.5,4.6 C27.5,5.5 27,7 26.5,9Z' fill='#2a1a12'/><path d='M27.5,4 L26.8,9 L28,8Z M42.5,4 L43.2,9 L42,8Z' fill='#2a1a12'/>`,
        face: `<path d='M30,7.6 L33.6,7.3 M36.4,7.3 L40,7.6' stroke='#2a1a12' stroke-width='0.9' stroke-linecap='round'/><ellipse cx='32' cy='9.4' rx='1' ry='0.75' fill='#222'/><ellipse cx='38' cy='9.4' rx='1' ry='0.75' fill='#222'/><path d='M34.6,10 L34,12.6 L35.6,12.6' stroke='#c99777' stroke-width='0.6' fill='none'/><path d='M31.5,13.8 Q35,12.6 38.5,13.8 L38,14.5 Q35,13.6 32,14.5Z' fill='#3a2418'/><path d='M32.6,15.2 Q35,16.4 37.4,15.2' stroke='#a5574a' stroke-width='0.8' fill='none'/><path d='M31.4,15.4 Q32,19.4 35,19.4 Q38,19.4 38.6,15.4 Q37.5,17.6 35,17.4 Q32.5,17.6 31.4,15.4Z' fill='#3a2418'/>`
    }));

    // Bruno sentado usando Claude (altura sentado ≈ 1,30 m)
    add('bruno_claude', 'Bruno Sentado Usando Claude', 1.3, 'medio', SV('0 0 135 100', `
        <!-- cadeira -->
        <rect x='20' y='62' width='32' height='5' rx='2' fill='#374151'/>
        <rect x='14' y='40' width='6' height='27' rx='3' fill='#374151'/>
        <rect x='34' y='67' width='4' height='23' fill='#4b5563'/>
        <path d='M22,92 L50,92' stroke='#111827' stroke-width='3' stroke-linecap='round'/>
        <circle cx='24' cy='96' r='3' fill='#111827'/><circle cx='48' cy='96' r='3' fill='#111827'/>
        <!-- mesa -->
        <rect x='68' y='46' width='64' height='5' rx='2' fill='#a16207'/>
        <rect x='72' y='51' width='5' height='47' fill='#854d0e'/><rect x='123' y='51' width='5' height='47' fill='#854d0e'/>
        <!-- pernas e pés -->
        <path d='M34,62 L64,62 L66,86' stroke='#1f2937' stroke-width='11' stroke-linecap='round' stroke-linejoin='round' fill='none'/>
        <ellipse cx='71' cy='96' rx='9' ry='4.5' fill='#111'/>
        <!-- tronco (polo preta, corpo largo) -->
        <path d='M20,64 L22,24 Q34,15 46,24 L48,64 Z' fill='#151515'/>
        <path d='M36,30 L58,44 L52,52 L38,44Z' fill='#151515'/>
        <path d='M42,38 L66,40' stroke='#e8b48f' stroke-width='7' stroke-linecap='round'/>
        <path d='M31,21 L36,27 L41,21 L39,19 L36,23 L33,19Z' fill='#262626'/>
        <circle cx='36' cy='30' r='0.8' fill='#444'/>
        <!-- pescoço e cabeça (careca + barba cheia) -->
        <rect x='30' y='15' width='9' height='9' rx='2' fill='#e8b48f'/>
        <ellipse cx='36' cy='8.5' rx='9' ry='9.5' fill='#e8b48f'/>
        <ellipse cx='27.4' cy='9.5' rx='1.6' ry='2.4' fill='#e8b48f'/>
        <ellipse cx='33' cy='2.4' rx='3.4' ry='1.4' fill='#ffffff' opacity='0.35'/>
        <path d='M28,9 C27.5,19 32,23 38,23 C43,23 45.5,18 45,9 C44,12 43,13.5 41,13.5 C39,12.5 37,12.5 35,13 C32.5,13.5 30,12.5 28,9Z' fill='#1a1210'/>
        <path d='M37.5,6.2 L43.5,6.6' stroke='#1a1210' stroke-width='1' stroke-linecap='round'/>
        <ellipse cx='40.8' cy='8.4' rx='1.1' ry='0.75' fill='#222'/>
        <path d='M43.8,8.5 L45.4,11.5 L44,11.8' stroke='#c08a66' stroke-width='0.6' fill='none'/>
        <path d='M40,15.4 Q42.5,14.8 44.6,15.4' stroke='#c47a6a' stroke-width='0.9' fill='none'/>
        <!-- notebook -->
        <rect x='80' y='41' width='28' height='5' rx='1.5' fill='#9ca3af'/>
        <path d='M82,41 L78,13 L108,13 L106,41Z' fill='#1f2937' stroke='#9ca3af' stroke-width='1.6'/>
        <rect x='81' y='15' width='25' height='24' fill='#faf9f5'/>
        <g transform='translate(93.5,27)'>${claudeSpark('#d97757', 0.62)}</g>
        <!-- balão -->
        <path d='M112,6 L130,6 Q134,6 134,10 L134,24 Q134,28 130,28 L121,28 L117,34 L117,28 L112,28 Q108,28 108,24 L108,10 Q108,6 112,6Z' fill='#faf9f5' stroke='#d97757' stroke-width='1.2'/>
        <g transform='translate(121,17)'>${claudeSpark('#d97757', 0.5)}</g>
    `));

    // ------------------------------------------------------------------
    // POKÉMONS (altura oficial da Pokédex)
    // ------------------------------------------------------------------
    add('pikachu', 'Pikachu', 0.4, 'medio_pequeno', SV('0 0 110 120', `
        <path d='M76,86 L90,76 L84,62 L104,44 L100,28 L76,54 L84,66 L68,76Z' fill='#f7d02c' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <path d='M76,86 L70,76 L82,68 L90,76Z' fill='#8a5a2a' stroke='${K}' stroke-width='1.5'/>
        <ellipse cx='52' cy='88' rx='25' ry='26' fill='#f7d02c' stroke='${K}' stroke-width='2'/>
        <path d='M72,78 L82,74 M74,88 L84,86' stroke='#8a5a2a' stroke-width='4' stroke-linecap='round'/>
        <ellipse cx='36' cy='114' rx='13' ry='6' fill='#f7d02c' stroke='${K}' stroke-width='2'/>
        <ellipse cx='66' cy='114' rx='13' ry='6' fill='#f7d02c' stroke='${K}' stroke-width='2'/>
        <ellipse cx='28' cy='82' rx='5' ry='9' fill='#f7d02c' stroke='${K}' stroke-width='2' transform='rotate(18 28 82)'/>
        <ellipse cx='76' cy='82' rx='5' ry='9' fill='#f7d02c' stroke='${K}' stroke-width='2' transform='rotate(-18 76 82)'/>
        <polygon points='22,38 6,4 34,24' fill='#f7d02c' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='6,4 9,14 18,10' fill='#111'/>
        <polygon points='84,38 100,4 72,24' fill='#f7d02c' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='100,4 97,14 88,10' fill='#111'/>
        <ellipse cx='52' cy='52' rx='32' ry='26' fill='#f7d02c' stroke='${K}' stroke-width='2'/>
        <circle cx='37' cy='48' r='5' fill='#111'/><circle cx='39' cy='46' r='1.8' fill='#fff'/>
        <circle cx='67' cy='48' r='5' fill='#111'/><circle cx='69' cy='46' r='1.8' fill='#fff'/>
        <circle cx='24' cy='60' r='7' fill='#e53935'/><circle cx='80' cy='60' r='7' fill='#e53935'/>
        <ellipse cx='52' cy='55' rx='1.6' ry='1.1' fill='#111'/>
        <path d='M44,60 Q48,66 52,60 Q56,66 60,60' stroke='#111' stroke-width='1.8' fill='none' stroke-linecap='round'/>
    `));

    add('charmander', 'Charmander', 0.6, 'medio_pequeno', SV('0 0 110 120', `
        <path d='M72,96 C94,100 98,76 90,66' stroke='#f08030' stroke-width='11' fill='none' stroke-linecap='round'/>
        <path d='M90,70 C80,58 88,46 90,36 C96,46 106,52 100,66 C98,72 94,72 90,70Z' fill='#e53a1e'/>
        <path d='M91,66 C86,58 91,52 92,46 C96,52 99,56 96,64Z' fill='#ffd24a'/>
        <ellipse cx='50' cy='90' rx='26' ry='24' fill='#f08030' stroke='${K}' stroke-width='2'/>
        <ellipse cx='50' cy='94' rx='15' ry='17' fill='#f9d98f'/>
        <path d='M42,86 L58,86 M42,92 L58,92 M43,98 L57,98 M44,104 L56,104' stroke='#e2b56a' stroke-width='1.4'/>
        <ellipse cx='34' cy='114' rx='13' ry='6' fill='#f08030' stroke='${K}' stroke-width='2'/>
        <ellipse cx='68' cy='114' rx='13' ry='6' fill='#f08030' stroke='${K}' stroke-width='2'/>
        <path d='M26,114 l0,-2 M31,119 l0,-3 M37,119 l0,-3' stroke='#fff' stroke-width='2'/>
        <ellipse cx='26' cy='86' rx='6' ry='10' fill='#f08030' stroke='${K}' stroke-width='2' transform='rotate(20 26 86)'/>
        <ellipse cx='76' cy='86' rx='6' ry='10' fill='#f08030' stroke='${K}' stroke-width='2' transform='rotate(-20 76 86)'/>
        <ellipse cx='50' cy='44' rx='32' ry='30' fill='#f08030' stroke='${K}' stroke-width='2'/>
        <ellipse cx='36' cy='40' rx='9' ry='12' fill='#fff' stroke='${K}' stroke-width='1.6'/>
        <ellipse cx='64' cy='40' rx='9' ry='12' fill='#fff' stroke='${K}' stroke-width='1.6'/>
        <circle cx='38' cy='42' r='6.5' fill='#1f6f8b'/><circle cx='62' cy='42' r='6.5' fill='#1f6f8b'/>
        <circle cx='38' cy='42' r='3.4' fill='#111'/><circle cx='62' cy='42' r='3.4' fill='#111'/>
        <circle cx='40' cy='39' r='1.8' fill='#fff'/><circle cx='64' cy='39' r='1.8' fill='#fff'/>
        <path d='M42,60 Q50,67 58,60' stroke='#7a2b10' stroke-width='2' fill='none' stroke-linecap='round'/>
        <circle cx='47' cy='54' r='1' fill='#7a2b10'/><circle cx='53' cy='54' r='1' fill='#7a2b10'/>
    `));

    add('bulbasaur', 'Bulbasaur', 0.7, 'medio_pequeno', SV('0 0 130 105', `
        <path d='M84,40 C80,14 120,10 118,40 C122,52 108,62 96,60 C86,58 84,48 84,40Z' fill='#4caf50' stroke='#1b5e20' stroke-width='2'/>
        <path d='M101,12 C96,2 104,-2 108,6 C110,0 118,2 114,12 Z' fill='#66bb6a' stroke='#1b5e20' stroke-width='1.5'/>
        <path d='M101,12 C101,20 104,28 104,34' stroke='#2e7d32' stroke-width='2' fill='none'/>
        <ellipse cx='72' cy='68' rx='42' ry='26' fill='#5cbdaa' stroke='${K}' stroke-width='2'/>
        <circle cx='52' cy='62' r='6' fill='#3d8c7e'/><circle cx='74' cy='56' r='5' fill='#3d8c7e'/><circle cx='88' cy='70' r='6' fill='#3d8c7e'/><circle cx='66' cy='76' r='4' fill='#3d8c7e'/>
        <rect x='38' y='80' width='14' height='20' rx='6' fill='#5cbdaa' stroke='${K}' stroke-width='2'/>
        <rect x='96' y='80' width='14' height='20' rx='6' fill='#5cbdaa' stroke='${K}' stroke-width='2'/>
        <rect x='58' y='84' width='13' height='16' rx='6' fill='#4aa896' stroke='${K}' stroke-width='2'/>
        <rect x='80' y='84' width='13' height='16' rx='6' fill='#4aa896' stroke='${K}' stroke-width='2'/>
        <path d='M36,100 h16 M96,100 h14 M58,100 h13 M80,100 h13' stroke='#fff' stroke-width='3'/>
        <ellipse cx='30' cy='56' rx='28' ry='24' fill='#5cbdaa' stroke='${K}' stroke-width='2'/>
        <polygon points='12,38 8,22 24,32' fill='#5cbdaa' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='44,34 56,24 54,42' fill='#5cbdaa' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <ellipse cx='20' cy='54' rx='8' ry='6' fill='#fff' stroke='${K}' stroke-width='1.4'/>
        <ellipse cx='42' cy='54' rx='8' ry='6' fill='#fff' stroke='${K}' stroke-width='1.4'/>
        <circle cx='21' cy='54' r='4.2' fill='#e53935'/><circle cx='41' cy='54' r='4.2' fill='#e53935'/>
        <circle cx='21' cy='54' r='2' fill='#111'/><circle cx='41' cy='54' r='2' fill='#111'/>
        <path d='M20,68 Q31,74 42,68' stroke='#3d3d3d' stroke-width='2' fill='none' stroke-linecap='round'/>
    `));

    add('squirtle', 'Squirtle', 0.5, 'medio_pequeno', SV('0 0 110 120', `
        <path d='M76,96 C100,96 100,74 88,70 C96,78 90,86 76,88' fill='#6bbadb' stroke='${K}' stroke-width='2'/>
        <ellipse cx='52' cy='90' rx='28' ry='26' fill='#b9803c' stroke='${K}' stroke-width='2'/>
        <ellipse cx='52' cy='92' rx='20' ry='20' fill='#f6e9a0' stroke='${K}' stroke-width='1.6'/>
        <path d='M52,72 L52,112 M34,84 L70,84 M34,100 L70,100' stroke='#d1b86a' stroke-width='1.4'/>
        <ellipse cx='36' cy='114' rx='13' ry='6' fill='#6bbadb' stroke='${K}' stroke-width='2'/>
        <ellipse cx='68' cy='114' rx='13' ry='6' fill='#6bbadb' stroke='${K}' stroke-width='2'/>
        <ellipse cx='24' cy='84' rx='6' ry='10' fill='#6bbadb' stroke='${K}' stroke-width='2' transform='rotate(20 24 84)'/>
        <ellipse cx='80' cy='84' rx='6' ry='10' fill='#6bbadb' stroke='${K}' stroke-width='2' transform='rotate(-20 80 84)'/>
        <ellipse cx='52' cy='44' rx='32' ry='30' fill='#6bbadb' stroke='${K}' stroke-width='2'/>
        <ellipse cx='38' cy='40' rx='9' ry='11' fill='#fff' stroke='${K}' stroke-width='1.6'/>
        <ellipse cx='66' cy='40' rx='9' ry='11' fill='#fff' stroke='${K}' stroke-width='1.6'/>
        <circle cx='40' cy='42' r='6' fill='#8e2e2e'/><circle cx='64' cy='42' r='6' fill='#8e2e2e'/>
        <circle cx='40' cy='42' r='3' fill='#111'/><circle cx='64' cy='42' r='3' fill='#111'/>
        <circle cx='42' cy='39' r='1.6' fill='#fff'/><circle cx='66' cy='39' r='1.6' fill='#fff'/>
        <path d='M44,58 Q52,66 60,58' stroke='#2a1a10' stroke-width='2' fill='none' stroke-linecap='round'/>
    `));

    add('eevee', 'Eevee', 0.3, 'pequeno', SV('0 0 110 120', `
        <path d='M76,100 C104,100 106,64 92,56 C86,70 90,84 74,90Z' fill='#c0884c' stroke='${K}' stroke-width='2'/>
        <path d='M92,56 C100,58 104,66 104,74 C98,70 92,68 88,64Z' fill='#f3e5c0'/>
        <ellipse cx='52' cy='94' rx='26' ry='22' fill='#c0884c' stroke='${K}' stroke-width='2'/>
        <ellipse cx='52' cy='88' rx='17' ry='19' fill='#f3e5c0'/>
        <ellipse cx='36' cy='114' rx='11' ry='6' fill='#c0884c' stroke='${K}' stroke-width='2'/>
        <ellipse cx='66' cy='114' rx='11' ry='6' fill='#c0884c' stroke='${K}' stroke-width='2'/>
        <path d='M34,74 L48,74 L50,86 L42,80 L36,88Z' fill='#f3e5c0' stroke='${K}' stroke-width='1.2'/>
        <polygon points='22,40 8,4 40,26' fill='#c0884c' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='22,32 14,12 32,26' fill='#6b3f1d'/>
        <polygon points='82,40 96,4 64,26' fill='#c0884c' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='82,32 90,12 72,26' fill='#6b3f1d'/>
        <ellipse cx='52' cy='52' rx='32' ry='24' fill='#c0884c' stroke='${K}' stroke-width='2'/>
        <ellipse cx='52' cy='72' rx='22' ry='10' fill='#f3e5c0' stroke='${K}' stroke-width='1.2'/>
        <circle cx='38' cy='50' r='6' fill='#111'/><circle cx='66' cy='50' r='6' fill='#111'/>
        <circle cx='40' cy='47.5' r='2.2' fill='#fff'/><circle cx='68' cy='47.5' r='2.2' fill='#fff'/>
        <ellipse cx='52' cy='58' rx='2.2' ry='1.5' fill='#111'/>
        <path d='M46,62 Q52,68 58,62' stroke='#111' stroke-width='1.6' fill='none' stroke-linecap='round'/>
    `));

    add('jigglypuff', 'Jigglypuff', 0.5, 'medio_pequeno', SV('0 0 110 110', `
        <circle cx='55' cy='56' r='50' fill='#f9b3cc' stroke='${K}' stroke-width='2'/>
        <polygon points='22,24 18,2 42,14' fill='#f9b3cc' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='88,24 92,2 68,14' fill='#f9b3cc' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <path d='M54,6 C42,8 44,24 54,22 C60,20 56,14 52,16 C54,10 62,12 60,20' fill='#f9b3cc' stroke='${K}' stroke-width='2'/>
        <ellipse cx='36' cy='50' rx='14' ry='17' fill='#fff' stroke='${K}' stroke-width='1.6'/>
        <ellipse cx='74' cy='50' rx='14' ry='17' fill='#fff' stroke='${K}' stroke-width='1.6'/>
        <circle cx='38' cy='53' r='11' fill='#2a9d8f'/><circle cx='72' cy='53' r='11' fill='#2a9d8f'/>
        <circle cx='38' cy='53' r='5.5' fill='#111'/><circle cx='72' cy='53' r='5.5' fill='#111'/>
        <circle cx='42' cy='47' r='3.6' fill='#fff'/><circle cx='76' cy='47' r='3.6' fill='#fff'/>
        <path d='M48,76 Q55,81 62,76' stroke='#7a2b4a' stroke-width='2' fill='none' stroke-linecap='round'/>
        <ellipse cx='32' cy='106' rx='11' ry='5' fill='#f9b3cc' stroke='${K}' stroke-width='2'/>
        <ellipse cx='78' cy='106' rx='11' ry='5' fill='#f9b3cc' stroke='${K}' stroke-width='2'/>
    `));

    add('psyduck', 'Psyduck', 0.8, 'medio_pequeno', SV('0 0 110 120', `
        <ellipse cx='52' cy='90' rx='28' ry='26' fill='#f8d848' stroke='${K}' stroke-width='2'/>
        <ellipse cx='52' cy='98' rx='17' ry='17' fill='#fbe9a0'/>
        <polygon points='80,96 100,94 86,106' fill='#f8d848' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <ellipse cx='36' cy='114' rx='13' ry='6' fill='#f8e8a8' stroke='${K}' stroke-width='2'/>
        <ellipse cx='68' cy='114' rx='13' ry='6' fill='#f8e8a8' stroke='${K}' stroke-width='2'/>
        <path d='M30,78 C18,70 18,46 30,38' stroke='#f8d848' stroke-width='9' fill='none' stroke-linecap='round'/>
        <path d='M74,78 C86,70 86,46 74,38' stroke='#f8d848' stroke-width='9' fill='none' stroke-linecap='round'/>
        <ellipse cx='52' cy='44' rx='30' ry='28' fill='#f8d848' stroke='${K}' stroke-width='2'/>
        <path d='M46,18 C44,8 48,4 52,0 M52,18 C54,8 58,6 60,2 M58,18 C62,12 68,10 70,6' stroke='#111' stroke-width='1.8' fill='none' stroke-linecap='round'/>
        <ellipse cx='40' cy='38' rx='7' ry='8' fill='#fff' stroke='${K}' stroke-width='1.4'/>
        <ellipse cx='64' cy='38' rx='7' ry='8' fill='#fff' stroke='${K}' stroke-width='1.4'/>
        <circle cx='41' cy='39' r='2' fill='#111'/><circle cx='63' cy='39' r='2' fill='#111'/>
        <ellipse cx='52' cy='56' rx='22' ry='11' fill='#f8e8a8' stroke='${K}' stroke-width='1.6'/>
        <circle cx='44' cy='55' r='1.6' fill='#7a5a1a'/><circle cx='60' cy='55' r='1.6' fill='#7a5a1a'/>
    `));

    add('magikarp', 'Magikarp', 0.9, 'medio_pequeno', SV('0 0 130 105', `
        <path d='M96,64 C112,52 118,70 128,76 C116,80 108,92 98,78Z' fill='#f2c04c' stroke='${K}' stroke-width='2'/>
        <path d='M46,10 C56,0 74,6 76,26 L56,30Z' fill='#f2c04c' stroke='${K}' stroke-width='2'/>
        <path d='M60,12 C66,4 78,8 80,24' fill='none' stroke='#e85a2e' stroke-width='2'/>
        <ellipse cx='56' cy='62' rx='44' ry='34' fill='#e85a2e' stroke='${K}' stroke-width='2'/>
        <path d='M30,78 C48,100 76,92 92,74 C80,86 48,90 30,78Z' fill='#f6e3b0'/>
        <path d='M60,40 C70,40 80,52 76,70 C70,60 64,52 60,40Z' fill='#f2c04c' stroke='${K}' stroke-width='1.6'/>
        <path d='M12,66 C0,64 -2,76 8,80 M20,72 C10,78 14,90 24,84' stroke='#f6e3b0' stroke-width='3' fill='none' stroke-linecap='round'/>
        <circle cx='28' cy='50' r='9' fill='#fff' stroke='${K}' stroke-width='1.6'/>
        <circle cx='29' cy='51' r='4.8' fill='#111'/><circle cx='31' cy='48.6' r='1.7' fill='#fff'/>
        <path d='M10,66 Q22,72 34,64' stroke='#7a2b10' stroke-width='2' fill='none' stroke-linecap='round'/>
    `));

    add('gengar', 'Gengar', 1.5, 'medio', SV('0 0 120 110', `
        <path d='M96,70 L112,60 L104,76 L116,80 L96,88Z' fill='#6a4c9c' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='26,28 18,2 42,22' fill='#6a4c9c' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='94,28 102,2 78,22' fill='#6a4c9c' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='60,18 54,0 70,16' fill='#6a4c9c'/>
        <ellipse cx='60' cy='56' rx='46' ry='38' fill='#6a4c9c' stroke='${K}' stroke-width='2'/>
        <ellipse cx='60' cy='76' rx='30' ry='20' fill='#7b5cae'/>
        <ellipse cx='20' cy='72' rx='9' ry='14' fill='#6a4c9c' stroke='${K}' stroke-width='2' transform='rotate(18 20 72)'/>
        <ellipse cx='100' cy='72' rx='9' ry='14' fill='#6a4c9c' stroke='${K}' stroke-width='2' transform='rotate(-18 100 72)'/>
        <ellipse cx='38' cy='104' rx='15' ry='6' fill='#6a4c9c' stroke='${K}' stroke-width='2'/>
        <ellipse cx='82' cy='104' rx='15' ry='6' fill='#6a4c9c' stroke='${K}' stroke-width='2'/>
        <path d='M30,40 L52,50 L46,56 L28,48Z' fill='#fff' stroke='${K}' stroke-width='1.4'/>
        <path d='M90,40 L68,50 L74,56 L92,48Z' fill='#fff' stroke='${K}' stroke-width='1.4'/>
        <circle cx='44' cy='50' r='3.8' fill='#e53935'/><circle cx='76' cy='50' r='3.8' fill='#e53935'/>
        <path d='M30,66 Q60,100 90,66 Q60,76 30,66Z' fill='#7a1424' stroke='${K}' stroke-width='1.6'/>
        <path d='M36,68 Q60,84 84,68 L82,72 Q60,86 38,72Z' fill='#fff'/>
        <path d='M42,74 Q60,88 78,74 Q60,92 42,74Z' fill='#e75a7c'/>
    `));

    add('charizard', 'Charizard', 1.7, 'medio', SV('0 0 150 150', `
        <path d='M100,112 C132,118 146,92 134,70 C130,86 118,96 100,98Z' fill='#e8742c' stroke='${K}' stroke-width='2'/>
        <path d='M134,76 C122,60 130,46 134,34 C140,46 152,54 146,70 C144,78 138,80 134,76Z' fill='#e53a1e'/>
        <path d='M135,70 C130,60 135,54 136,48 C140,54 144,60 141,68Z' fill='#ffd24a'/>
        <path d='M44,66 L8,24 L30,26 L16,6 L48,24 L66,16 L62,46Z' fill='#3fa5b8' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <path d='M96,66 L132,24 L110,26 L124,6 L92,24 L74,16 L78,46Z' fill='#3fa5b8' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <path d='M40,60 L14,28 M96,60 L122,28' stroke='#e8742c' stroke-width='3' stroke-linecap='round'/>
        <ellipse cx='70' cy='96' rx='32' ry='38' fill='#e8742c' stroke='${K}' stroke-width='2'/>
        <ellipse cx='70' cy='102' rx='19' ry='30' fill='#f6d894'/>
        <path d='M54,88 h32 M54,98 h32 M55,108 h30 M57,118 h26' stroke='#dcb572' stroke-width='1.4'/>
        <rect x='40' y='124' width='20' height='22' rx='8' fill='#e8742c' stroke='${K}' stroke-width='2'/>
        <rect x='80' y='124' width='20' height='22' rx='8' fill='#e8742c' stroke='${K}' stroke-width='2'/>
        <path d='M42,146 l0,-3 M50,146 l0,-3 M58,146 l0,-3 M82,146 l0,-3 M90,146 l0,-3 M98,146 l0,-3' stroke='#fff' stroke-width='3'/>
        <ellipse cx='42' cy='94' rx='7' ry='12' fill='#e8742c' stroke='${K}' stroke-width='2' transform='rotate(20 42 94)'/>
        <ellipse cx='98' cy='94' rx='7' ry='12' fill='#e8742c' stroke='${K}' stroke-width='2' transform='rotate(-20 98 94)'/>
        <rect x='60' y='56' width='20' height='16' rx='6' fill='#e8742c'/>
        <ellipse cx='70' cy='42' rx='24' ry='22' fill='#e8742c' stroke='${K}' stroke-width='2'/>
        <polygon points='50,34 38,24 54,26' fill='#f6d894' stroke='${K}' stroke-width='1.6' stroke-linejoin='round'/>
        <polygon points='90,34 102,24 86,26' fill='#f6d894' stroke='${K}' stroke-width='1.6' stroke-linejoin='round'/>
        <ellipse cx='60' cy='38' rx='5.5' ry='6.5' fill='#fff' stroke='${K}' stroke-width='1.2'/>
        <ellipse cx='80' cy='38' rx='5.5' ry='6.5' fill='#fff' stroke='${K}' stroke-width='1.2'/>
        <circle cx='61' cy='39' r='3.3' fill='#2a7a8c'/><circle cx='79' cy='39' r='3.3' fill='#2a7a8c'/>
        <circle cx='61' cy='39' r='1.6' fill='#111'/><circle cx='79' cy='39' r='1.6' fill='#111'/>
        <path d='M60,52 Q70,58 80,52' stroke='#7a2b10' stroke-width='1.8' fill='none' stroke-linecap='round'/>
        <circle cx='67' cy='47' r='1' fill='#7a2b10'/><circle cx='73' cy='47' r='1' fill='#7a2b10'/>
    `));

    add('mewtwo', 'Mewtwo', 2.0, 'medio', SV('0 0 100 160', `
        <path d='M60,110 C100,112 104,64 84,50 C94,72 86,96 58,98Z' fill='#9b6ab8' stroke='${K}' stroke-width='2'/>
        <path d='M30,60 L46,66 L40,100 C34,96 30,80 30,60Z' fill='#d9cbe3' stroke='${K}' stroke-width='2'/>
        <path d='M32,64 C20,70 12,92 18,96 M68,64 C80,70 86,92 80,98' stroke='#d9cbe3' stroke-width='8' fill='none' stroke-linecap='round'/>
        <path d='M32,64 C20,70 12,92 18,96 M68,64 C80,70 86,92 80,98' stroke='${K}' stroke-width='1' fill='none' opacity='0.5'/>
        <path d='M34,58 C30,86 34,108 40,118 L60,118 C66,108 70,86 66,58Z' fill='#d9cbe3' stroke='${K}' stroke-width='2'/>
        <path d='M44,86 C46,104 54,104 56,86 C52,92 48,92 44,86Z' fill='#9b6ab8'/>
        <rect x='34' y='118' width='13' height='38' rx='5' fill='#d9cbe3' stroke='${K}' stroke-width='2'/>
        <rect x='53' y='118' width='13' height='38' rx='5' fill='#d9cbe3' stroke='${K}' stroke-width='2'/>
        <ellipse cx='40' cy='156' rx='11' ry='3.4' fill='#9b6ab8' stroke='${K}' stroke-width='1.4'/>
        <ellipse cx='60' cy='156' rx='11' ry='3.4' fill='#9b6ab8' stroke='${K}' stroke-width='1.4'/>
        <path d='M42,60 L58,60 L56,48 L44,48Z' fill='#d9cbe3'/>
        <polygon points='32,22 36,2 44,18' fill='#d9cbe3' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='68,22 64,2 56,18' fill='#d9cbe3' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <path d='M34,22 C32,44 40,56 50,56 C60,56 68,44 66,22 C58,16 42,16 34,22Z' fill='#d9cbe3' stroke='${K}' stroke-width='2'/>
        <path d='M38,34 L47,38 L44,41 L37,38Z' fill='#7b3fa0'/>
        <path d='M62,34 L53,38 L56,41 L63,38Z' fill='#7b3fa0'/>
        <path d='M41,35 L46,37 M59,35 L54,37' stroke='#fff' stroke-width='1.4'/>
        <path d='M46,48 Q50,50 54,48' stroke='#4a2f66' stroke-width='1.6' fill='none' stroke-linecap='round'/>
    `));

    add('snorlax', 'Snorlax', 2.1, 'medio', SV('0 0 150 125', `
        <ellipse cx='75' cy='76' rx='66' ry='48' fill='#2f6b78' stroke='${K}' stroke-width='2'/>
        <ellipse cx='75' cy='84' rx='46' ry='36' fill='#f4ecd0' stroke='${K}' stroke-width='1.6'/>
        <path d='M48,70 L66,66 M54,84 L80,80 M96,66 L106,72' stroke='#2f6b78' stroke-width='0' />
        <ellipse cx='22' cy='84' rx='12' ry='22' fill='#2f6b78' stroke='${K}' stroke-width='2' transform='rotate(18 22 84)'/>
        <ellipse cx='128' cy='84' rx='12' ry='22' fill='#2f6b78' stroke='${K}' stroke-width='2' transform='rotate(-18 128 84)'/>
        <ellipse cx='24' cy='104' rx='11' ry='7' fill='#f4ecd0' stroke='${K}' stroke-width='1.6'/>
        <ellipse cx='126' cy='104' rx='11' ry='7' fill='#f4ecd0' stroke='${K}' stroke-width='1.6'/>
        <path d='M20,104 l0,4 M25,104 l0,5 M30,103 l0,4 M120,103 l0,4 M125,104 l0,5 M130,104 l0,4' stroke='#fff' stroke-width='2.4' stroke-linecap='round'/>
        <ellipse cx='42' cy='116' rx='20' ry='8' fill='#f4ecd0' stroke='${K}' stroke-width='2'/>
        <ellipse cx='108' cy='116' rx='20' ry='8' fill='#f4ecd0' stroke='${K}' stroke-width='2'/>
        <polygon points='46,36 38,10 68,26' fill='#2f6b78' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <polygon points='104,36 112,10 82,26' fill='#2f6b78' stroke='${K}' stroke-width='2' stroke-linejoin='round'/>
        <ellipse cx='75' cy='40' rx='36' ry='28' fill='#2f6b78' stroke='${K}' stroke-width='2'/>
        <ellipse cx='75' cy='50' rx='28' ry='19' fill='#f4ecd0'/>
        <path d='M52,38 Q60,43 68,38 M82,38 Q90,43 98,38' stroke='#111' stroke-width='2.4' fill='none' stroke-linecap='round'/>
        <path d='M64,56 Q75,62 86,56' stroke='#111' stroke-width='1.8' fill='none' stroke-linecap='round'/>
        <path d='M66,60 L69,64 L72,60 M78,60 L81,64 L84,60' fill='#fff' stroke='#111' stroke-width='1'/>
        <ellipse cx='75' cy='46' rx='1.8' ry='1.2' fill='#111'/>
    `));

    add('lapras', 'Lapras', 2.5, 'medio', SV('0 0 150 135', `
        <path d='M10,92 C0,70 20,40 40,50 C50,56 50,70 50,80Z' fill='#4a90d0' stroke='${K}' stroke-width='2'/>
        <ellipse cx='84' cy='98' rx='60' ry='30' fill='#4a90d0' stroke='${K}' stroke-width='2'/>
        <path d='M36,100 C36,50 70,40 100,48 C128,56 134,92 126,106 C100,92 56,92 36,100Z' fill='#c9c9c0' stroke='${K}' stroke-width='2'/>
        <polygon points='56,62 54,44 66,56' fill='#8d8d86' stroke='${K}' stroke-width='1.4' stroke-linejoin='round'/>
        <polygon points='78,56 80,36 90,52' fill='#8d8d86' stroke='${K}' stroke-width='1.4' stroke-linejoin='round'/>
        <polygon points='102,60 108,42 114,60' fill='#8d8d86' stroke='${K}' stroke-width='1.4' stroke-linejoin='round'/>
        <ellipse cx='60' cy='112' rx='28' ry='12' fill='#f0e8c0'/>
        <path d='M48,78 C36,50 30,34 34,20' stroke='#4a90d0' stroke-width='22' fill='none' stroke-linecap='round'/>
        <path d='M48,78 C36,50 30,34 34,20' stroke='#f0e8c0' stroke-width='8' fill='none' stroke-linecap='round' opacity='0.0'/>
        <ellipse cx='36' cy='18' rx='22' ry='16' fill='#4a90d0' stroke='${K}' stroke-width='2'/>
        <polygon points='30,8 28,0 38,6' fill='#4a90d0' stroke='${K}' stroke-width='1.4'/>
        <polygon points='42,8 46,0 50,10' fill='#4a90d0' stroke='${K}' stroke-width='1.4'/>
        <circle cx='28' cy='16' r='4' fill='#fff' stroke='${K}' stroke-width='1.2'/><circle cx='28' cy='16' r='2' fill='#111'/>
        <path d='M16,24 Q26,30 38,24' stroke='#2a1a10' stroke-width='1.6' fill='none' stroke-linecap='round'/>
        <ellipse cx='70' cy='122' rx='20' ry='7' fill='#4a90d0' stroke='${K}' stroke-width='1.8'/>
        <ellipse cx='118' cy='120' rx='18' ry='7' fill='#4a90d0' stroke='${K}' stroke-width='1.8'/>
    `));

    add('gyarados', 'Gyarados', 6.5, 'grande', SV('0 0 110 170', `
        <path d='M30,166 C-4,150 6,114 44,110 C86,106 90,76 54,66 C20,56 30,26 56,24' stroke='#3a74b8' stroke-width='24' fill='none' stroke-linecap='round'/>
        <path d='M30,166 C-4,150 6,114 44,110 C86,106 90,76 54,66' stroke='#f5ecc8' stroke-width='6' fill='none' stroke-linecap='round' opacity='0.85'/>
        <path d='M20,128 L8,116 L26,118Z M40,100 L28,86 L50,92Z' fill='#f5ecc8' stroke='${K}' stroke-width='1.2'/>
        <polygon points='46,30 18,22 40,2' fill='#f5ecc8' stroke='${K}' stroke-width='1.6' stroke-linejoin='round'/>
        <polygon points='70,30 98,22 76,2' fill='#f5ecc8' stroke='${K}' stroke-width='1.6' stroke-linejoin='round'/>
        <path d='M40,36 C40,10 76,10 76,36 L74,46 L42,46Z' fill='#3a74b8' stroke='${K}' stroke-width='2'/>
        <path d='M36,30 L28,14 M80,30 L88,14' stroke='#f5ecc8' stroke-width='3'/>
        <path d='M40,46 Q58,70 76,46 L70,38 L46,38Z' fill='#7a1424' stroke='${K}' stroke-width='1.6'/>
        <path d='M46,46 l3,8 l3,-8 M64,46 l3,8 l3,-8' fill='#fff'/>
        <path d='M46,28 L54,32 M70,28 L62,32' stroke='#111' stroke-width='3' stroke-linecap='round'/>
        <circle cx='50' cy='31' r='2' fill='#e53935'/><circle cx='66' cy='31' r='2' fill='#e53935'/>
    `));

    add('onix', 'Onix', 8.8, 'grande', SV('0 0 80 190', `
        <circle cx='40' cy='178' r='22' fill='#8b8b87' stroke='${K}' stroke-width='2'/>
        <circle cx='30' cy='152' r='20' fill='#979792' stroke='${K}' stroke-width='2'/>
        <circle cx='46' cy='128' r='18' fill='#8b8b87' stroke='${K}' stroke-width='2'/>
        <circle cx='32' cy='106' r='16' fill='#979792' stroke='${K}' stroke-width='2'/>
        <circle cx='44' cy='86' r='14' fill='#8b8b87' stroke='${K}' stroke-width='2'/>
        <circle cx='34' cy='68' r='12' fill='#979792' stroke='${K}' stroke-width='2'/>
        <circle cx='42' cy='52' r='10' fill='#8b8b87' stroke='${K}' stroke-width='2'/>
        <path d='M24,24 C22,6 56,4 56,24 L58,40 C48,50 34,50 24,40Z' fill='#8b8b87' stroke='${K}' stroke-width='2'/>
        <polygon points='30,10 38,0 44,12' fill='#8b8b87' stroke='${K}' stroke-width='1.6' stroke-linejoin='round'/>
        <path d='M30,22 L38,26 M50,22 L42,26' stroke='#111' stroke-width='3' stroke-linecap='round'/>
        <path d='M30,32 Q40,38 50,32' stroke='#111' stroke-width='1.6' fill='none'/>
        <path d='M20,166 l8,6 M36,138 l8,5 M26,92 l7,6' stroke='#5e5e5a' stroke-width='1.6' stroke-linecap='round'/>
    `));

    // ------------------------------------------------------------------
    // PERSONAGENS DE MEME / GAMES / ANIME
    // ------------------------------------------------------------------
    add('sonic', 'Sonic (Sonic the Hedgehog)', 1.0, 'medio_pequeno', SV('0 0 110 105', `
        <polygon points='30,30 4,24 24,44' fill='#1e5fd6' stroke='#0b2c70' stroke-width='1.6' stroke-linejoin='round'/>
        <polygon points='28,42 0,48 26,58' fill='#1e5fd6' stroke='#0b2c70' stroke-width='1.6' stroke-linejoin='round'/>
        <polygon points='30,52 6,70 34,66' fill='#1e5fd6' stroke='#0b2c70' stroke-width='1.6' stroke-linejoin='round'/>
        <ellipse cx='56' cy='72' rx='17' ry='19' fill='#1e5fd6' stroke='#0b2c70' stroke-width='1.8'/>
        <ellipse cx='60' cy='75' rx='10' ry='13' fill='#f6c8a0'/>
        <circle cx='36' cy='74' r='6' fill='#fff' stroke='#555' stroke-width='1'/><circle cx='80' cy='74' r='6' fill='#fff' stroke='#555' stroke-width='1'/>
        <path d='M44,86 L40,96' stroke='#1e5fd6' stroke-width='8' stroke-linecap='round'/><path d='M66,88 L70,96' stroke='#1e5fd6' stroke-width='8' stroke-linecap='round'/>
        <ellipse cx='38' cy='99' rx='16' ry='6' fill='#e53935' stroke='#7a1010' stroke-width='1.4'/>
        <ellipse cx='74' cy='99' rx='16' ry='6' fill='#e53935' stroke='#7a1010' stroke-width='1.4'/>
        <rect x='30' y='94' width='10' height='5' fill='#fff'/><rect x='68' y='94' width='10' height='5' fill='#fff'/>
        <polygon points='38,14 40,0 52,14' fill='#1e5fd6' stroke='#0b2c70' stroke-width='1.6' stroke-linejoin='round'/>
        <polygon points='58,14 68,2 70,18' fill='#1e5fd6' stroke='#0b2c70' stroke-width='1.6' stroke-linejoin='round'/>
        <circle cx='54' cy='38' r='27' fill='#1e5fd6' stroke='#0b2c70' stroke-width='1.8'/>
        <ellipse cx='68' cy='48' rx='19' ry='13' fill='#f6c8a0' stroke='#7a4a2a' stroke-width='1'/>
        <ellipse cx='48' cy='36' rx='10' ry='12' fill='#fff' stroke='#0b2c70' stroke-width='1.2'/>
        <ellipse cx='66' cy='36' rx='10' ry='12' fill='#fff' stroke='#0b2c70' stroke-width='1.2'/>
        <circle cx='50' cy='38' r='5' fill='#2e9d3a'/><circle cx='64' cy='38' r='5' fill='#2e9d3a'/>
        <circle cx='50' cy='38' r='2.4' fill='#111'/><circle cx='64' cy='38' r='2.4' fill='#111'/>
        <ellipse cx='80' cy='44' rx='4' ry='3' fill='#111'/>
        <path d='M64,54 Q74,60 82,52' stroke='#7a2b10' stroke-width='1.8' fill='none' stroke-linecap='round'/>
    `));

    add('mario', 'Mario (Super Mario)', 1.55, 'medio', SV('0 0 80 110', `
        <ellipse cx='28' cy='104' rx='15' ry='6' fill='#6b3a1a' stroke='${K}' stroke-width='1.6'/>
        <ellipse cx='52' cy='104' rx='15' ry='6' fill='#6b3a1a' stroke='${K}' stroke-width='1.6'/>
        <rect x='20' y='78' width='15' height='24' rx='4' fill='#1e4fd6'/><rect x='45' y='78' width='15' height='24' rx='4' fill='#1e4fd6'/>
        <path d='M10,52 L4,78' stroke='#e5251f' stroke-width='9' stroke-linecap='round'/><path d='M70,52 L76,78' stroke='#e5251f' stroke-width='9' stroke-linecap='round'/>
        <circle cx='4' cy='82' r='7' fill='#fff' stroke='#bbb' stroke-width='1'/><circle cx='76' cy='82' r='7' fill='#fff' stroke='#bbb' stroke-width='1'/>
        <rect x='16' y='48' width='48' height='40' rx='10' fill='#e5251f'/>
        <path d='M18,60 L62,60 L62,90 Q40,98 18,90Z' fill='#1e4fd6'/>
        <rect x='22' y='46' width='7' height='18' rx='2' fill='#1e4fd6'/><rect x='51' y='46' width='7' height='18' rx='2' fill='#1e4fd6'/>
        <circle cx='25.5' cy='66' r='3' fill='#fbbf24'/><circle cx='54.5' cy='66' r='3' fill='#fbbf24'/>
        <ellipse cx='40' cy='34' rx='24' ry='22' fill='#f7c59a' stroke='${K}' stroke-width='1.6'/>
        <ellipse cx='16' cy='36' rx='5' ry='7' fill='#f7c59a' stroke='${K}' stroke-width='1.2'/><ellipse cx='64' cy='36' rx='5' ry='7' fill='#f7c59a' stroke='${K}' stroke-width='1.2'/>
        <ellipse cx='40' cy='40' rx='8' ry='7' fill='#f2b386'/>
        <path d='M18,22 C14,34 22,36 28,32 L26,24Z' fill='#4a2a14'/><path d='M62,22 C66,34 58,36 52,32 L54,24Z' fill='#4a2a14'/>
        <path d='M24,44 C30,38 38,40 40,44 C42,40 50,38 56,44 C52,50 44,48 40,48 C36,48 28,50 24,44Z' fill='#4a2a14'/>
        <ellipse cx='32' cy='30' rx='3.6' ry='5' fill='#fff'/><ellipse cx='48' cy='30' rx='3.6' ry='5' fill='#fff'/>
        <ellipse cx='33' cy='31' rx='1.8' ry='3' fill='#1e4fd6'/><ellipse cx='47' cy='31' rx='1.8' ry='3' fill='#1e4fd6'/>
        <path d='M22,28 L36,26 M58,28 L44,26' stroke='#4a2a14' stroke-width='2' stroke-linecap='round'/>
        <path d='M14,18 C14,0 66,0 66,18 C66,22 58,20 40,20 C22,20 14,22 14,18Z' fill='#e5251f'/>
        <path d='M10,22 C26,26 54,26 70,22 C70,16 60,18 40,18 C20,18 10,16 10,22Z' fill='#c41a15'/>
        <circle cx='40' cy='10' r='7' fill='#fff'/><text x='40' y='14' font-size='10' font-family='Arial' font-weight='bold' fill='#e5251f' text-anchor='middle'>M</text>
    `));

    add('kirby', 'Kirby', 0.2, 'pequeno', SV('0 0 110 100', `
        <ellipse cx='28' cy='94' rx='20' ry='7' fill='#e8365a' stroke='#8a1030' stroke-width='1.6'/>
        <ellipse cx='82' cy='94' rx='20' ry='7' fill='#e8365a' stroke='#8a1030' stroke-width='1.6'/>
        <ellipse cx='10' cy='56' rx='11' ry='8' fill='#f9a8c8' stroke='#b0436c' stroke-width='1.6' transform='rotate(-30 10 56)'/>
        <ellipse cx='100' cy='56' rx='11' ry='8' fill='#f9a8c8' stroke='#b0436c' stroke-width='1.6' transform='rotate(30 100 56)'/>
        <circle cx='55' cy='48' r='46' fill='#f9a8c8' stroke='#b0436c' stroke-width='1.8'/>
        <ellipse cx='36' cy='56' rx='9' ry='5' fill='#f46d96'/><ellipse cx='74' cy='56' rx='9' ry='5' fill='#f46d96'/>
        <ellipse cx='44' cy='38' rx='6' ry='12' fill='#111'/><ellipse cx='66' cy='38' rx='6' ry='12' fill='#111'/>
        <ellipse cx='44' cy='34' rx='5' ry='6.5' fill='#2f4bd0'/><ellipse cx='66' cy='34' rx='5' ry='6.5' fill='#2f4bd0'/>
        <ellipse cx='44' cy='30' rx='3.8' ry='5' fill='#fff'/><ellipse cx='66' cy='30' rx='3.8' ry='5' fill='#fff'/>
        <path d='M48,58 Q55,68 62,58 Q55,62 48,58Z' fill='#b0143c' stroke='#6e0c24' stroke-width='1.2'/>
    `));

    add('minion', 'Minion (Meu Malvado Favorito)', 1.07, 'medio_pequeno', SV('0 0 80 110', `
        <ellipse cx='28' cy='106' rx='13' ry='4.5' fill='#222'/><ellipse cx='52' cy='106' rx='13' ry='4.5' fill='#222'/>
        <path d='M22,60 L22,72 L58,72 L58,60Z' fill='#1e4fa3'/>
        <path d='M10,70 L8,88' stroke='#f7d117' stroke-width='6' stroke-linecap='round'/><path d='M70,70 L72,88' stroke='#f7d117' stroke-width='6' stroke-linecap='round'/>
        <circle cx='8' cy='92' r='5' fill='#222'/><circle cx='72' cy='92' r='5' fill='#222'/>
        <path d='M10,34 C10,10 70,10 70,34 L70,84 C70,98 62,102 52,102 L28,102 C18,102 10,98 10,84Z' fill='#f7d117' stroke='#8a6a00' stroke-width='1.8'/>
        <path d='M10,60 C12,62 14,62 16,60 L64,60 C66,62 68,62 70,60 L70,88 C70,98 62,102 52,102 L28,102 C18,102 10,98 10,88Z' fill='#1e4fa3'/>
        <rect x='14' y='58' width='6' height='8' fill='#1e4fa3'/><rect x='60' y='58' width='6' height='8' fill='#1e4fa3'/>
        <rect x='32' y='74' width='16' height='13' rx='2' fill='#173b7a'/>
        <rect x='9' y='26' width='62' height='9' fill='#2b2b2b'/>
        <circle cx='28' cy='30' r='12.5' fill='#c9c9c9' stroke='#6b6b6b' stroke-width='2'/>
        <circle cx='52' cy='30' r='12.5' fill='#c9c9c9' stroke='#6b6b6b' stroke-width='2'/>
        <circle cx='28' cy='30' r='9' fill='#fff'/><circle cx='52' cy='30' r='9' fill='#fff'/>
        <circle cx='29' cy='30' r='4' fill='#6b4423'/><circle cx='51' cy='30' r='4' fill='#6b4423'/>
        <circle cx='29' cy='30' r='1.8' fill='#111'/><circle cx='51' cy='30' r='1.8' fill='#111'/>
        <path d='M30,50 Q40,58 50,50' stroke='#5b3a00' stroke-width='2' fill='none' stroke-linecap='round'/>
        <path d='M34,12 C32,5 34,2 36,0 M40,12 C40,5 42,2 44,1 M46,12 C48,6 50,4 52,3' stroke='#222' stroke-width='1.4' fill='none' stroke-linecap='round'/>
    `));

    add('goku', 'Goku (Dragon Ball)', 1.75, 'medio', person({
        skin: '#f2c29b', top: '#f58220', pants: '#f58220', shoes: '#1e4fa8', sleeve: '#f58220',
        behind: `<polygon points='20,14 8,-0 20,2' fill='none'/>`,
        arms: `<path d='M18,27 L12,62' stroke='#f58220' stroke-width='9' stroke-linecap='round' fill='none'/><path d='M52,27 L58,62' stroke='#f58220' stroke-width='9' stroke-linecap='round' fill='none'/><rect x='7' y='56' width='10' height='6' fill='#1e4fa8'/><rect x='53' y='56' width='10' height='6' fill='#1e4fa8'/><circle cx='12' cy='66' r='4.5' fill='#f2c29b'/><circle cx='58' cy='66' r='4.5' fill='#f2c29b'/>`,
        torso: `<path d='M29,22 L35,34 L41,22 L41,26 L35,38 L29,26Z' fill='#1e4fa8'/><path d='M30,24 L35,50 L40,24' fill='none'/><rect x='19' y='56' width='32' height='6' fill='#1e4fa8'/><path d='M29,24 L24,40' stroke='#e06f10' stroke-width='1.4'/><circle cx='28' cy='42' r='0.1'/>`,
        legs: `<rect x='20' y='100' width='14' height='6' fill='#1e4fa8'/><rect x='36' y='100' width='14' height='6' fill='#1e4fa8'/>`,
        hair: `<path d='M26,8 C22,-2 24,-6 28,0 C28,-6 34,-8 35,-2 C37,-8 44,-6 42,0 C46,-4 50,-2 46,6 C42,2 28,2 26,8Z' fill='#0b0b10'/><polygon points='28,0 24,-4 32,-1' fill='#0b0b10'/>`,
        face: `<path d='M30,8 L33.5,9.6 M40,8 L36.5,9.6' stroke='#111' stroke-width='1.2'/><circle cx='32' cy='10.4' r='1' fill='#111'/><circle cx='38' cy='10.4' r='1' fill='#111'/><path d='M32,14.5 Q35,16.5 38,14.5' stroke='#7a3b2a' stroke-width='1' fill='none'/>`
    }));

    // Injeta no catálogo (sem duplicar)
    window.SIZE_IT_UP_ITEMS = window.SIZE_IT_UP_ITEMS || [];
    const have = new Set(window.SIZE_IT_UP_ITEMS.map(i => i.id));
    items.forEach(i => { if (!have.has(i.id)) window.SIZE_IT_UP_ITEMS.push(i); });
})();
