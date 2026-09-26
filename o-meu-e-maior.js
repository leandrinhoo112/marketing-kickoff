/**
 * O MEU É MAIOR — Minigame de Comparação e Estimativa de Escala Real
 * Inspirado no Magnitudle (Size It Up)
 * Desenvolvido para o Radar Diário
 */

(function () {
    'use strict';

    // Banco de itens com proporções e alturas reais (em metros)
    const ITEMS = [
        {
            id: 'xicara',
            name: 'Xícara de Café',
            size: 0.08,
            unit: 'cm',
            display: '8 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 100 80" width="100%" height="100%"><path d="M15,10 L85,10 C85,55 70,75 50,75 C30,75 15,55 15,10 Z" fill="currentColor"/><path d="M85,20 C95,20 100,32 98,45 C95,55 85,55 80,52" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><ellipse cx="50" cy="10" rx="35" ry="6" fill="rgba(255,255,255,0.2)"/></svg>`
        },
        {
            id: 'lata_refri',
            name: 'Lata de Refrigerante',
            size: 0.12,
            unit: 'cm',
            display: '12 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 60 120" width="100%" height="100%"><rect x="5" y="10" width="50" height="100" rx="10" fill="currentColor"/><ellipse cx="30" cy="10" rx="22" ry="5" fill="rgba(255,255,255,0.25)"/><ellipse cx="30" cy="110" rx="22" ry="5" fill="rgba(0,0,0,0.2)"/><rect x="15" y="3" width="30" height="6" rx="2" fill="currentColor"/></svg>`
        },
        {
            id: 'iphone',
            name: 'Smartphone (iPhone)',
            size: 0.15,
            unit: 'cm',
            display: '15 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 65 130" width="100%" height="100%"><rect x="3" y="3" width="59" height="124" rx="12" fill="currentColor"/><rect x="8" y="12" width="49" height="106" rx="6" fill="rgba(0,0,0,0.35)"/><circle cx="32.5" cy="7" r="2.5" fill="rgba(255,255,255,0.3)"/></svg>`
        },
        {
            id: 'banana',
            name: 'Banana',
            size: 0.18,
            unit: 'cm',
            display: '18 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 80 120" width="100%" height="100%"><path d="M20,10 C55,30 65,75 40,110 C50,95 55,60 25,25 C20,20 18,14 20,10 Z" fill="currentColor"/></svg>`
        },
        {
            id: 'bola_futebol',
            name: 'Bola de Futebol',
            size: 0.22,
            unit: 'cm',
            display: '22 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="46" fill="currentColor"/><polygon points="50,30 65,42 60,58 40,58 35,42" fill="rgba(0,0,0,0.3)"/><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4"/></svg>`
        },
        {
            id: 'gato',
            name: 'Gato Doméstico',
            size: 0.25,
            unit: 'cm',
            display: '25 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 100 90" width="100%" height="100%"><ellipse cx="45" cy="55" rx="30" ry="25" fill="currentColor"/><circle cx="70" cy="35" r="16" fill="currentColor"/><polygon points="62,25 65,10 74,22" fill="currentColor"/><polygon points="73,22 82,10 85,25" fill="currentColor"/><path d="M20,55 C10,50 5,30 15,20 C18,16 22,25 18,35 C15,45 22,50 25,52" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><rect x="30" y="70" width="8" height="18" rx="4" fill="currentColor"/><rect x="55" y="70" width="8" height="18" rx="4" fill="currentColor"/></svg>`
        },
        {
            id: 'garrafa_pet',
            name: 'Garrafa PET 2L',
            size: 0.33,
            unit: 'cm',
            display: '33 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 50 140" width="100%" height="100%"><rect x="18" y="5" width="14" height="12" rx="2" fill="currentColor"/><path d="M19,17 C12,30 6,45 6,65 L6,125 C6,132 12,136 25,136 C38,136 44,132 44,125 L44,65 C44,45 38,30 31,17 Z" fill="currentColor"/><ellipse cx="25" cy="100" rx="18" ry="12" fill="rgba(255,255,255,0.15)"/></svg>`
        },
        {
            id: 'pizza',
            name: 'Pizza Família (Caixa)',
            size: 0.40,
            unit: 'cm',
            display: '40 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 120 70" width="100%" height="100%"><polygon points="60,5 115,25 60,45 5,25" fill="currentColor"/><polygon points="5,25 60,45 60,65 5,45" fill="rgba(0,0,0,0.25)"/><polygon points="115,25 60,45 60,65 115,45" fill="rgba(0,0,0,0.15)"/></svg>`
        },
        {
            id: 'capivara',
            name: 'Capivara',
            size: 0.60,
            unit: 'cm',
            display: '60 cm',
            category: 'medio',
            svg: `<svg viewBox="0 0 140 90" width="100%" height="100%"><ellipse cx="65" cy="50" rx="45" ry="30" fill="currentColor"/><path d="M95,35 C105,25 125,25 132,38 C135,45 132,55 125,60 L105,62 Z" fill="currentColor"/><ellipse cx="108" cy="24" rx="4" ry="6" fill="currentColor"/><rect x="35" y="70" width="12" height="18" rx="4" fill="currentColor"/><rect x="85" y="70" width="12" height="18" rx="4" fill="currentColor"/><circle cx="120" cy="38" r="2.5" fill="rgba(255,255,255,0.6)"/></svg>`
        },
        {
            id: 'cachorro_golden',
            name: 'Cachorro Golden Retriever',
            size: 0.60,
            unit: 'cm',
            display: '60 cm',
            category: 'medio',
            svg: `<svg viewBox="0 0 130 90" width="100%" height="100%"><ellipse cx="55" cy="50" rx="35" ry="22" fill="currentColor"/><circle cx="95" cy="32" r="15" fill="currentColor"/><path d="M102,32 L116,36 L114,44 L98,42 Z" fill="currentColor"/><path d="M88,26 C85,24 82,34 85,42" fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M22,48 C14,35 8,40 12,28" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><rect x="35" y="65" width="10" height="23" rx="4" fill="currentColor"/><rect x="75" y="65" width="10" height="23" rx="4" fill="currentColor"/></svg>`
        },
        {
            id: 'guitarra',
            name: 'Guitarra Elétrica',
            size: 1.00,
            unit: 'm',
            display: '1,00 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 50 140" width="100%" height="100%"><path d="M12,85 C6,95 8,125 25,135 C42,125 44,95 38,85 C32,78 36,65 30,60 L20,60 C14,65 18,78 12,85 Z" fill="currentColor"/><rect x="23" y="15" width="4" height="48" fill="currentColor"/><polygon points="21,5 29,5 28,15 22,15" fill="currentColor"/></svg>`
        },
        {
            id: 'carro_fusca',
            name: 'Carro Fusca',
            size: 1.50,
            unit: 'm',
            display: '1,50 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 160 85" width="100%" height="100%"><path d="M15,62 C15,50 35,42 50,40 C65,22 95,20 115,38 C135,40 150,50 150,62 L15,62 Z" fill="currentColor"/><circle cx="45" cy="65" r="16" fill="rgba(0,0,0,0.6)"/><circle cx="45" cy="65" r="8" fill="rgba(255,255,255,0.5)"/><circle cx="120" cy="65" r="16" fill="rgba(0,0,0,0.6)"/><circle cx="120" cy="65" r="8" fill="rgba(255,255,255,0.5)"/></svg>`
        },
        {
            id: 'homem',
            name: 'Homem Adulto (Estatura Média)',
            size: 1.75,
            unit: 'm',
            display: '1,75 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 60 140" width="100%" height="100%"><circle cx="30" cy="14" r="11" fill="currentColor"/><path d="M16,30 C16,28 44,28 44,30 L40,75 L34,75 L36,135 L24,135 L26,75 L20,75 Z" fill="currentColor"/><path d="M16,32 L6,70 L12,72 L18,38" fill="currentColor"/><path d="M44,32 L54,70 L48,72 L42,38" fill="currentColor"/></svg>`
        },
        {
            id: 'geladeira',
            name: 'Geladeira Duplex',
            size: 1.80,
            unit: 'm',
            display: '1,80 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 65 140" width="100%" height="100%"><rect x="5" y="5" width="55" height="130" rx="8" fill="currentColor"/><line x1="5" y1="52" x2="60" y2="52" stroke="rgba(0,0,0,0.3)" stroke-width="3"/><rect x="10" y="30" width="4" height="16" rx="2" fill="rgba(255,255,255,0.4)"/><rect x="10" y="60" width="4" height="24" rx="2" fill="rgba(255,255,255,0.4)"/></svg>`
        },
        {
            id: 'porta',
            name: 'Porta Residencial Padrão',
            size: 2.10,
            unit: 'm',
            display: '2,10 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 65 140" width="100%" height="100%"><rect x="5" y="5" width="55" height="132" rx="4" fill="currentColor"/><rect x="9" y="9" width="47" height="124" fill="rgba(0,0,0,0.15)"/><circle cx="50" cy="74" r="3.5" fill="rgba(255,255,255,0.7)"/></svg>`
        },
        {
            id: 'trave_futebol',
            name: 'Trave de Futebol Oficial',
            size: 2.44,
            unit: 'm',
            display: '2,44 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 140 100" width="100%" height="100%"><path d="M15,95 L15,10 L125,10 L125,95" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M15,10 L35,35 L105,35 L125,10" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3"/><line x1="35" y1="35" x2="35" y2="95" stroke="rgba(255,255,255,0.2)" stroke-width="3"/><line x1="105" y1="35" x2="105" y2="95" stroke="rgba(255,255,255,0.2)" stroke-width="3"/></svg>`
        },
        {
            id: 'cesta_basquete',
            name: 'Tabela de Basquete (Aro)',
            size: 3.05,
            unit: 'm',
            display: '3,05 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 80 140" width="100%" height="100%"><line x1="40" y1="140" x2="40" y2="30" stroke="currentColor" stroke-width="8"/><rect x="15" y="10" width="50" height="35" rx="3" fill="rgba(255,255,255,0.2)" stroke="currentColor" stroke-width="4"/><ellipse cx="40" cy="40" rx="14" ry="5" fill="none" stroke="#ea580c" stroke-width="4"/><path d="M28,42 L32,60 L48,60 L52,42 Z" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-dasharray="3,3"/></svg>`
        },
        {
            id: 'onibus',
            name: 'Ônibus Urbano',
            size: 3.20,
            unit: 'm',
            display: '3,20 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 170 75" width="100%" height="100%"><rect x="10" y="8" width="150" height="52" rx="8" fill="currentColor"/><rect x="18" y="16" width="30" height="20" rx="3" fill="rgba(0,0,0,0.4)"/><rect x="54" y="16" width="30" height="20" rx="3" fill="rgba(0,0,0,0.4)"/><rect x="90" y="16" width="30" height="20" rx="3" fill="rgba(0,0,0,0.4)"/><rect x="126" y="16" width="28" height="36" rx="3" fill="rgba(0,0,0,0.4)"/><circle cx="45" cy="62" r="12" fill="rgba(0,0,0,0.7)"/><circle cx="125" cy="62" r="12" fill="rgba(0,0,0,0.7)"/></svg>`
        },
        {
            id: 'elefante',
            name: 'Elefante Africano',
            size: 3.30,
            unit: 'm',
            display: '3,30 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 150 110" width="100%" height="100%"><ellipse cx="75" cy="55" rx="50" ry="38" fill="currentColor"/><circle cx="120" cy="45" r="22" fill="currentColor"/><path d="M130,55 C140,75 142,95 132,100 C128,102 124,92 126,80 L124,65" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><ellipse cx="108" cy="45" rx="14" ry="22" fill="rgba(0,0,0,0.2)"/><rect x="45" y="80" width="16" height="28" rx="6" fill="currentColor"/><rect x="85" y="80" width="16" height="28" rx="6" fill="currentColor"/></svg>`
        },
        {
            id: 'trex',
            name: 'Tiranossauro Rex (T-Rex)',
            size: 4.00,
            unit: 'm',
            display: '4,00 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 160 120" width="100%" height="100%"><path d="M15,95 C45,75 70,60 85,55 L105,40 L135,35 L145,50 L125,58 L110,65 L115,85 L100,115 L85,115 L92,85 C75,90 45,105 15,95 Z" fill="currentColor"/><path d="M102,62 L112,65 L108,72" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`
        },
        {
            id: 'girafa',
            name: 'Girafa Adulta',
            size: 5.50,
            unit: 'm',
            display: '5,50 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 100 160" width="100%" height="100%"><ellipse cx="40" cy="95" rx="28" ry="20" fill="currentColor"/><path d="M50,90 L75,30 L85,25 L88,35 L70,95 Z" fill="currentColor"/><circle cx="85" cy="22" r="8" fill="currentColor"/><line x1="84" y1="16" x2="83" y2="10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="88" y1="16" x2="89" y2="10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="25" y="105" width="8" height="52" rx="4" fill="currentColor"/><rect x="48" y="105" width="8" height="52" rx="4" fill="currentColor"/></svg>`
        },
        {
            id: 'poste',
            name: 'Poste de Iluminação Pública',
            size: 8.00,
            unit: 'm',
            display: '8,00 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 60 160" width="100%" height="100%"><rect x="27" y="15" width="6" height="142" fill="currentColor"/><path d="M30,25 C30,12 45,5 55,8" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><polygon points="45,10 58,10 56,18 47,18" fill="#facc15"/></svg>`
        },
        {
            id: 'aviao_737',
            name: 'Avião Comercial (Boeing 737)',
            size: 12.50,
            unit: 'm',
            display: '12,50 m (altura)',
            category: 'monumento',
            svg: `<svg viewBox="0 0 160 80" width="100%" height="100%"><path d="M15,45 L135,45 C150,45 155,52 145,55 L25,55 Z" fill="currentColor"/><polygon points="20,45 35,15 48,15 38,45" fill="currentColor"/><polygon points="80,52 110,75 125,75 105,52" fill="currentColor"/></svg>`
        },
        {
            id: 'baleia_azul',
            name: 'Baleia Azul (Comprimento)',
            size: 30.00,
            unit: 'm',
            display: '30,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 180 70" width="100%" height="100%"><path d="M170,30 C150,15 110,18 70,25 C40,30 20,45 5,30 C12,42 12,55 5,65 C25,50 50,55 80,55 C125,55 160,45 170,30 Z" fill="currentColor"/><polygon points="85,24 95,14 100,22" fill="currentColor"/></svg>`
        },
        {
            id: 'predio_10',
            name: 'Prédio Residencial (10 Andares)',
            size: 30.00,
            unit: 'm',
            display: '30,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 70 160" width="100%" height="100%"><rect x="10" y="10" width="50" height="148" fill="currentColor"/><g fill="rgba(0,0,0,0.35)"><rect x="16" y="20" width="8" height="8"/><rect x="31" y="20" width="8" height="8"/><rect x="46" y="20" width="8" height="8"/><rect x="16" y="35" width="8" height="8"/><rect x="31" y="35" width="8" height="8"/><rect x="46" y="35" width="8" height="8"/><rect x="16" y="50" width="8" height="8"/><rect x="31" y="50" width="8" height="8"/><rect x="46" y="50" width="8" height="8"/><rect x="16" y="65" width="8" height="8"/><rect x="31" y="65" width="8" height="8"/><rect x="46" y="65" width="8" height="8"/><rect x="16" y="80" width="8" height="8"/><rect x="31" y="80" width="8" height="8"/><rect x="46" y="80" width="8" height="8"/><rect x="16" y="95" width="8" height="8"/><rect x="31" y="95" width="8" height="8"/><rect x="46" y="95" width="8" height="8"/><rect x="16" y="110" width="8" height="8"/><rect x="31" y="110" width="8" height="8"/><rect x="46" y="110" width="8" height="8"/></g><rect x="28" y="138" width="14" height="20" fill="rgba(255,255,255,0.4)"/></svg>`
        },
        {
            id: 'cristo_redentor',
            name: 'Cristo Redentor (Rio de Janeiro)',
            size: 38.00,
            unit: 'm',
            display: '38,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 140 160" width="100%" height="100%"><polygon points="50,158 90,158 80,135 60,135" fill="rgba(0,0,0,0.4)"/><rect x="62" y="35" width="16" height="102" fill="currentColor"/><circle cx="70" cy="24" r="8" fill="currentColor"/><polygon points="10,40 130,40 130,50 78,55 62,55 10,50" fill="currentColor"/></svg>`
        },
        {
            id: 'estatua_liberdade',
            name: 'Estátua da Liberdade (com pedestal)',
            size: 93.00,
            unit: 'm',
            display: '93,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 90 160" width="100%" height="100%"><polygon points="25,158 65,158 60,115 30,115" fill="rgba(0,0,0,0.3)"/><path d="M36,115 L32,60 L54,60 L50,115 Z" fill="currentColor"/><circle cx="43" cy="50" r="7" fill="currentColor"/><polygon points="38,44 48,44 43,36" fill="#facc15"/><line x1="53" y1="62" x2="68" y2="28" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><polygon points="65,22 72,25 70,30 63,27" fill="#ea580c"/></svg>`
        },
        {
            id: 'torre_eiffel',
            name: 'Torre Eiffel (Paris)',
            size: 330.00,
            unit: 'm',
            display: '330,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 100 160" width="100%" height="100%"><polygon points="48,5 52,5 51,45 49,45" fill="currentColor"/><polygon points="46,45 54,45 58,95 42,95" fill="currentColor"/><path d="M20,158 L42,95 L58,95 L80,158 L68,158 L58,125 C55,118 45,118 42,125 L32,158 Z" fill="currentColor"/></svg>`
        }
    ];

    // Gerador de pares balanceados com base na data (Seed)
    function getTodayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function getSeedFromString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    function pseudoRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Gera as 5 rodadas diárias
    function generateDailyRounds(isUnlimited = false) {
        const seedBase = isUnlimited ? Math.floor(Math.random() * 1000000) : getSeedFromString(getTodayKey());
        let seed = seedBase;

        // Categorias balanceadas: pequeno x pequeno, pequeno x médio, médio x médio, médio x grande, grande x monumento
        const plan = [
            { refCat: ['pequeno'], targetCat: ['pequeno', 'medio'] },
            { refCat: ['pequeno', 'medio'], targetCat: ['medio'] },
            { refCat: ['medio'], targetCat: ['medio', 'grande'] },
            { refCat: ['medio', 'grande'], targetCat: ['grande'] },
            { refCat: ['grande'], targetCat: ['monumento'] }
        ];

        const rounds = [];
        const usedIds = new Set();

        plan.forEach((p, idx) => {
            const availableRefs = ITEMS.filter(it => p.refCat.includes(it.category) && !usedIds.has(it.id));
            const refPool = availableRefs.length > 0 ? availableRefs : ITEMS.filter(it => p.refCat.includes(it.category));
            const refIdx = Math.floor(pseudoRandom(seed++) * refPool.length);
            const refItem = refPool[refIdx];
            usedIds.add(refItem.id);

            const availableTargets = ITEMS.filter(it => p.targetCat.includes(it.category) && it.id !== refItem.id && !usedIds.has(it.id));
            const targetPool = availableTargets.length > 0 ? availableTargets : ITEMS.filter(it => it.id !== refItem.id);
            const targetIdx = Math.floor(pseudoRandom(seed++) * targetPool.length);
            const targetItem = targetPool[targetIdx];
            usedIds.add(targetItem.id);

            // Escala inicial aleatória distante da real para dar desafio
            const trueRatio = targetItem.size / refItem.size;
            let initialGuessScale;
            // Se o alvo for maior, começa menor; se for menor, começa maior
            if (trueRatio > 1.2) {
                initialGuessScale = Math.max(0.2, trueRatio * (0.3 + pseudoRandom(seed++) * 0.3));
            } else {
                initialGuessScale = Math.min(3.5, trueRatio * (1.8 + pseudoRandom(seed++) * 0.8));
            }

            rounds.push({
                roundNum: idx + 1,
                ref: refItem,
                target: targetItem,
                trueRatio: trueRatio,
                initialGuessScale: Math.round(initialGuessScale * 100) / 100
            });
        });

        return rounds;
    }

    // Estado do Jogo
    let gameState = {
        isUnlimited: false,
        rounds: [],
        currentRoundIndex: 0,
        currentGuessScale: 1.0,
        roundScores: [],
        totalScore: 0,
        isLocked: false,
        isCompleted: false
    };

    // Sons do projeto
    function playAudio(soundName) {
        try {
            const audio = new Audio(soundName);
            audio.volume = 0.65;
            audio.play().catch(() => {});
        } catch (e) {}
    }

    // Inicialização da interface
    window.initSizeItUp = function () {
        const container = document.getElementById('game-sizeItUp');
        if (!container) return;

        loadSavedDailyGame();
        bindEvents();
        fetchSizeItUpScores();
    };

    function loadSavedDailyGame() {
        const todayStr = getTodayKey();
        const saved = localStorage.getItem(`sizeitupState_${todayStr}`);
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.rounds && parsed.rounds.length === 5) {
                    gameState = parsed;
                    renderGameView();
                    return;
                }
            } catch (e) {}
        }

        // Novo jogo diário
        startNewGame(false);
    }

    function startNewGame(isUnlimited = false) {
        gameState = {
            isUnlimited: isUnlimited,
            rounds: generateDailyRounds(isUnlimited),
            currentRoundIndex: 0,
            currentGuessScale: 1.0,
            roundScores: [],
            totalScore: 0,
            isLocked: false,
            isCompleted: false
        };

        if (gameState.rounds.length > 0) {
            gameState.currentGuessScale = gameState.rounds[0].initialGuessScale;
        }

        saveLocalState();
        renderGameView();
    }

    function saveLocalState() {
        if (gameState.isUnlimited) return;
        const todayStr = getTodayKey();
        localStorage.setItem(`sizeitupState_${todayStr}`, JSON.stringify(gameState));
    }

    function bindEvents() {
        const slider = document.getElementById('sizeitup-slider');
        const minusBtn = document.getElementById('sizeitup-btn-minus');
        const plusBtn = document.getElementById('sizeitup-btn-plus');
        const lockinBtn = document.getElementById('sizeitup-lockin-btn');
        const nextBtn = document.getElementById('sizeitup-next-btn');
        const shareBtn = document.getElementById('sizeitup-share-btn');
        const unlimitedBtn = document.getElementById('sizeitup-unlimited-btn');
        const refreshRankingBtn = document.getElementById('refreshSizeItUpRankingBtn');

        if (slider && !slider.dataset.bound) {
            slider.dataset.bound = 'true';
            slider.addEventListener('input', (e) => {
                if (gameState.isLocked) return;
                setGuessScale(parseFloat(e.target.value));
            });
        }

        if (minusBtn && !minusBtn.dataset.bound) {
            minusBtn.dataset.bound = 'true';
            minusBtn.addEventListener('click', () => {
                if (gameState.isLocked) return;
                setGuessScale(Math.max(0.05, gameState.currentGuessScale - 0.05));
            });
        }

        if (plusBtn && !plusBtn.dataset.bound) {
            plusBtn.dataset.bound = 'true';
            plusBtn.addEventListener('click', () => {
                if (gameState.isLocked) return;
                setGuessScale(Math.min(5.0, gameState.currentGuessScale + 0.05));
            });
        }

        // Presets rápidos
        document.querySelectorAll('.sizeitup-preset-btn').forEach(btn => {
            if (!btn.dataset.bound) {
                btn.dataset.bound = 'true';
                btn.addEventListener('click', () => {
                    if (gameState.isLocked) return;
                    const scale = parseFloat(btn.getAttribute('data-scale'));
                    setGuessScale(scale);
                });
            }
        });

        if (lockinBtn && !lockinBtn.dataset.bound) {
            lockinBtn.dataset.bound = 'true';
            lockinBtn.addEventListener('click', lockInEstimate);
        }

        if (nextBtn && !nextBtn.dataset.bound) {
            nextBtn.dataset.bound = 'true';
            nextBtn.addEventListener('click', nextRound);
        }

        if (shareBtn && !shareBtn.dataset.bound) {
            shareBtn.dataset.bound = 'true';
            shareBtn.addEventListener('click', shareResults);
        }

        if (unlimitedBtn && !unlimitedBtn.dataset.bound) {
            unlimitedBtn.dataset.bound = 'true';
            unlimitedBtn.addEventListener('click', () => {
                startNewGame(true);
            });
        }

        if (refreshRankingBtn && !refreshRankingBtn.dataset.bound) {
            refreshRankingBtn.dataset.bound = 'true';
            refreshRankingBtn.addEventListener('click', fetchSizeItUpScores);
        }
    }

    function setGuessScale(val) {
        gameState.currentGuessScale = Math.round(val * 100) / 100;
        
        const slider = document.getElementById('sizeitup-slider');
        if (slider) slider.value = gameState.currentGuessScale;

        const ratioLabel = document.getElementById('sizeitup-relative-ratio-label');
        if (ratioLabel) {
            ratioLabel.textContent = `${gameState.currentGuessScale.toFixed(2)}x`;
        }

        updateStageSilhouettes();
    }

    function renderGameView() {
        const round = gameState.rounds[gameState.currentRoundIndex];
        const controls = document.getElementById('sizeitup-controls');
        const revealCard = document.getElementById('sizeitup-reveal-card');
        const gameoverCard = document.getElementById('sizeitup-gameover-card');

        // Atualizar headers
        const roundBadge = document.getElementById('sizeitup-round-badge');
        if (roundBadge) {
            roundBadge.textContent = `Rodada ${gameState.currentRoundIndex + 1} de 5`;
        }

        const modeBadge = document.getElementById('sizeitup-mode-badge');
        if (modeBadge) {
            modeBadge.textContent = gameState.isUnlimited ? '🔄 Modo Treino (Ilimitado)' : '📅 Desafio Diário';
            modeBadge.style.background = gameState.isUnlimited ? 'rgba(2, 206, 255, 0.15)' : 'rgba(255,255,255,0.1)';
            modeBadge.style.color = gameState.isUnlimited ? '#02ceff' : '#a0aec0';
        }

        const totalScoreEl = document.getElementById('sizeitup-total-score');
        if (totalScoreEl) {
            totalScoreEl.textContent = `${gameState.totalScore} pts`;
        }

        renderDots();

        // Se o jogo já terminou
        if (gameState.isCompleted) {
            if (controls) controls.style.display = 'none';
            if (revealCard) revealCard.style.display = 'none';
            if (gameoverCard) renderGameOverCard();
            updateStageSilhouettes(true);
            return;
        }

        // Se a rodada atual já foi travada (revelação)
        if (gameState.isLocked) {
            if (controls) controls.style.display = 'none';
            if (revealCard) renderRevealCard();
            if (gameoverCard) gameoverCard.style.display = 'none';
            updateStageSilhouettes(true);
        } else {
            // Em jogo
            if (controls) controls.style.display = 'block';
            if (revealCard) revealCard.style.display = 'none';
            if (gameoverCard) gameoverCard.style.display = 'none';
            setGuessScale(gameState.currentGuessScale);
        }
    }

    function renderDots() {
        const dotsContainer = document.getElementById('sizeitup-dots');
        if (!dotsContainer) return;

        let html = '';
        for (let i = 0; i < 5; i++) {
            if (i < gameState.roundScores.length) {
                const s = gameState.roundScores[i].score;
                let color = '#22c55e'; // verde
                if (s < 50) color = '#ef4444'; // vermelho
                else if (s < 85) color = '#facc15'; // amarelo
                html += `<span title="Rodada ${i+1}: ${s} pts" style="width: 11px; height: 11px; border-radius: 50%; background: ${color}; box-shadow: 0 0 8px ${color}88;"></span>`;
            } else if (i === gameState.currentRoundIndex) {
                html += `<span title="Rodada atual" style="width: 11px; height: 11px; border-radius: 50%; background: #02ceff; box-shadow: 0 0 10px #02ceff;"></span>`;
            } else {
                html += `<span style="width: 11px; height: 11px; border-radius: 50%; background: rgba(255,255,255,0.2);"></span>`;
            }
        }
        dotsContainer.innerHTML = html;
    }

    function updateStageSilhouettes(showGhost = false) {
        const round = gameState.rounds[gameState.currentRoundIndex];
        if (!round) return;

        const refBadge = document.getElementById('sizeitup-ref-badge');
        const refSilh = document.getElementById('sizeitup-ref-silhouette');
        const targetBadge = document.getElementById('sizeitup-target-badge');
        const targetSilh = document.getElementById('sizeitup-target-silhouette');
        const targetGhost = document.getElementById('sizeitup-target-ghost');
        const scaleIndicator = document.getElementById('sizeitup-scale-indicator');

        if (refBadge) {
            refBadge.innerHTML = `${round.ref.name}: <strong>${round.ref.display}</strong>`;
        }

        if (targetBadge) {
            targetBadge.innerHTML = gameState.isLocked 
                ? `${round.target.name}: <strong>${round.target.display}</strong>`
                : `${round.target.name} <strong>(?)</strong>`;
        }

        if (scaleIndicator) {
            scaleIndicator.textContent = `Referência: ${round.ref.display}`;
        }

        // Altura base no canvas para a referência
        const baseRefHeightPx = 150;
        const refWidthPx = 110;

        // Renderiza silhueta de referência
        if (refSilh) {
            refSilh.innerHTML = `
                <div style="width: ${refWidthPx}px; height: ${baseRefHeightPx}px; color: #8e6eff; filter: drop-shadow(0 0 12px rgba(142, 110, 255, 0.4)); display: flex; align-items: flex-end; justify-content: center;">
                    ${round.ref.svg}
                </div>
            `;
        }

        // Calcula a altura desenhada do alvo pelo palpite do jogador
        // targetHeightPx = baseRefHeightPx * (currentGuessScale)
        const targetHeightPx = Math.max(16, baseRefHeightPx * gameState.currentGuessScale);
        const targetWidthPx = Math.max(16, 110 * gameState.currentGuessScale);

        // Auto zoom/fit para não estourar os 300px do palco
        const maxHeight = Math.max(baseRefHeightPx, targetHeightPx, baseRefHeightPx * round.trueRatio);
        let stageZoom = 1.0;
        if (maxHeight > 240) {
            stageZoom = 240 / maxHeight;
        }

        const stageRef = document.getElementById('sizeitup-ref-container');
        const stageTarget = document.getElementById('sizeitup-target-container');
        if (stageRef) stageRef.style.transform = `scale(${stageZoom})`;
        if (stageTarget) stageTarget.style.transform = `scale(${stageZoom})`;

        // Renderiza silhueta do alvo
        if (targetSilh) {
            const targetColor = gameState.isLocked ? '#a0aec0' : '#02ceff';
            const targetGlow = gameState.isLocked ? 'none' : 'drop-shadow(0 0 16px rgba(2, 206, 255, 0.65))';

            targetSilh.innerHTML = `
                <div style="width: ${targetWidthPx}px; height: ${targetHeightPx}px; color: ${targetColor}; filter: ${targetGlow}; transition: width 0.05s ease, height 0.05s ease; display: flex; align-items: flex-end; justify-content: center;">
                    ${round.target.svg}
                </div>
                <div id="sizeitup-target-ghost" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); display: ${showGhost ? 'flex' : 'none'}; align-items: flex-end; justify-content: center; pointer-events: none;">
                    ${renderGhostSilhouette(round, baseRefHeightPx)}
                </div>
            `;
        }
    }

    function renderGhostSilhouette(round, baseRefHeightPx) {
        const trueHeightPx = baseRefHeightPx * round.trueRatio;
        const trueWidthPx = 110 * round.trueRatio;
        return `
            <div style="width: ${trueWidthPx}px; height: ${trueHeightPx}px; color: #22c55e; filter: drop-shadow(0 0 14px #22c55e); opacity: 0.85; border-bottom: 2px dashed #22c55e; display: flex; align-items: flex-end; justify-content: center;">
                ${round.target.svg}
            </div>
        `;
    }

    function lockInEstimate() {
        if (gameState.isLocked || gameState.isCompleted) return;

        const round = gameState.rounds[gameState.currentRoundIndex];
        const guessRatio = gameState.currentGuessScale;
        const trueRatio = round.trueRatio;

        // Fator de diferença (independente de ser maior ou menor)
        const diffFactor = Math.max(guessRatio / trueRatio, trueRatio / guessRatio);
        
        // Cálculo de pontuação de 0 a 100
        let roundScore = 0;
        if (diffFactor <= 1.05) {
            roundScore = 100; // Na mosca (≤ 5% erro)
        } else if (diffFactor >= 4.0) {
            roundScore = 0; // Errou rude (4x ou mais)
        } else {
            // Decaimento suave entre 1.05 e 4.0
            const decay = (diffFactor - 1.05) / (4.0 - 1.05);
            roundScore = Math.round(100 * Math.pow(1 - decay, 1.3));
        }

        const guessedMeters = round.ref.size * guessRatio;
        const actualMeters = round.target.size;
        const pctDiff = Math.round(Math.abs(diffFactor - 1) * 100);

        const scoreEntry = {
            roundNum: gameState.currentRoundIndex + 1,
            refName: round.ref.name,
            targetName: round.target.name,
            guessMeters: formatDimension(guessedMeters),
            actualMeters: formatDimension(actualMeters),
            diffPct: pctDiff,
            score: roundScore,
            isPerfect: roundScore === 100
        };

        gameState.roundScores.push(scoreEntry);
        gameState.totalScore += roundScore;
        gameState.isLocked = true;

        // Toca som apropriado
        if (roundScore >= 90) {
            playAudio('som concluido.MP3');
        } else if (roundScore >= 60) {
            playAudio('olha-so-olha-la.mp3');
        } else {
            playAudio('uiiiii.mp3');
        }

        saveLocalState();
        renderGameView();
    }

    function formatDimension(meters) {
        if (meters < 1.0) {
            return `${Math.round(meters * 100)} cm`;
        }
        return `${meters.toFixed(2).replace('.', ',')} m`;
    }

    function renderRevealCard() {
        const revealCard = document.getElementById('sizeitup-reveal-card');
        const scoreEntry = gameState.roundScores[gameState.currentRoundIndex];
        if (!revealCard || !scoreEntry) return;

        revealCard.style.display = 'block';

        const titleEl = document.getElementById('sizeitup-reveal-title');
        const scoreBadge = document.getElementById('sizeitup-reveal-score-badge');
        const guessEl = document.getElementById('sizeitup-reveal-guess');
        const realEl = document.getElementById('sizeitup-reveal-real');
        const nextBtn = document.getElementById('sizeitup-next-btn');

        if (scoreEntry.isPerfect) {
            titleEl.innerHTML = `<span style="color: #22c55e;">🎯 NA MOSCA! Escala Perfeita!</span>`;
        } else if (scoreEntry.score >= 80) {
            titleEl.innerHTML = `<span style="color: #02ceff;">👏 Muito Perto! Olho Excelente!</span>`;
        } else if (scoreEntry.score >= 50) {
            titleEl.innerHTML = `<span style="color: #facc15;">👌 Passou Perto!</span>`;
        } else {
            titleEl.innerHTML = `<span style="color: #ef4444;">🙈 Errou por Bastante!</span>`;
        }

        scoreBadge.innerHTML = `+${scoreEntry.score} <span style="font-size: 0.6em; opacity: 0.7;">pontos</span>`;
        guessEl.innerHTML = `${scoreEntry.guessMeters}`;
        realEl.innerHTML = `${scoreEntry.actualMeters} <small style="opacity:0.75;">(Dif: ${scoreEntry.diffPct}%)</small>`;

        if (nextBtn) {
            nextBtn.textContent = (gameState.currentRoundIndex === 4) ? 'Ver Resultado Final 🏆' : 'Próxima Rodada →';
        }
    }

    function nextRound() {
        if (gameState.currentRoundIndex < 4) {
            gameState.currentRoundIndex++;
            gameState.isLocked = false;
            const nextRoundObj = gameState.rounds[gameState.currentRoundIndex];
            gameState.currentGuessScale = nextRoundObj.initialGuessScale;
            saveLocalState();
            renderGameView();
        } else {
            // Final do jogo
            finishGame();
        }
    }

    function finishGame() {
        gameState.isCompleted = true;
        saveLocalState();
        renderGameView();

        // Salva score no Supabase e localStorage
        saveSizeItUpScoreToDB(gameState.totalScore, gameState.roundScores);

        // Desbloqueia conquista
        if (window.updateMinigameAchievements) {
            window.updateMinigameAchievements('sizeitup');
        }

        if (gameState.totalScore >= 400) {
            playAudio('incansavel.MP3');
        } else {
            playAudio('som concluido.MP3');
        }
    }

    function renderGameOverCard() {
        const gameoverCard = document.getElementById('sizeitup-gameover-card');
        if (!gameoverCard) return;

        gameoverCard.style.display = 'block';

        const headline = document.getElementById('sizeitup-gameover-headline');
        const tagline = document.getElementById('sizeitup-gameover-tagline');
        const finalScore = document.getElementById('sizeitup-final-score');
        const summaryList = document.getElementById('sizeitup-summary-rounds');

        let title = '🏆 Mestre das Medidas!';
        let desc = 'Você tem uma percepção espacial impressionante!';
        if (gameState.totalScore < 150) {
            title = '🙈 Miopia de Proporção!';
            desc = 'Treine mais um pouco para calibrar seu olho visual!';
        } else if (gameState.totalScore < 300) {
            title = '👌 Tá no Caminho!';
            desc = 'Bons palpites, quase acertou a maioria na mosca!';
        } else if (gameState.totalScore < 450) {
            title = '📏 Olho Biônico!';
            desc = 'Excelente noção de escala e tamanho relativo!';
        }

        if (headline) headline.textContent = title;
        if (tagline) tagline.textContent = desc;
        if (finalScore) finalScore.textContent = `${gameState.totalScore}/500`;

        if (summaryList) {
            summaryList.innerHTML = gameState.roundScores.map((s, idx) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.05); border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); font-size: 0.9em;">
                    <div style="text-align: left;">
                        <strong>${idx + 1}. ${s.targetName}</strong>
                        <div style="font-size: 0.8em; opacity: 0.7;">Estimou: ${s.guessMeters} | Real: ${s.actualMeters}</div>
                    </div>
                    <div style="font-weight: 800; color: ${s.score >= 80 ? '#22c55e' : (s.score >= 50 ? '#facc15' : '#ef4444')}; font-size: 1.1em;">
                        ${s.score} pts
                    </div>
                </div>
            `).join('');
        }
    }

    function shareResults() {
        const todayStr = new Date().toLocaleDateString('pt-BR');
        let emojis = '';
        gameState.roundScores.forEach(s => {
            if (s.score >= 95) emojis += '🟩';
            else if (s.score >= 70) emojis += '🟨';
            else if (s.score >= 40) emojis += '🟧';
            else emojis += '🟥';
        });

        const shareText = `📏 O MEU É MAIOR — Radar Diário (${todayStr})\n` +
                          `Pontuação: ${gameState.totalScore}/500 pts\n` +
                          `${emojis}\n` +
                          `Jogue você também na área de minigames!`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Resultado copiado para a área de transferência! Cole no Slack ou WhatsApp 🚀');
            }).catch(() => {
                prompt('Copie o seu resultado abaixo:', shareText);
            });
        } else {
            prompt('Copie o seu resultado abaixo:', shareText);
        }
    }

    // =========================================================================
    // PLACAR DE LÍDERES / SUPABASE & LOCALSTORAGE
    // =========================================================================
    async function saveSizeItUpScoreToDB(totalScore, details) {
        const loggedInUser = localStorage.getItem('currentUser') || 'Jogador';
        const todayStr = new Date().toLocaleDateString('pt-BR');

        // Salvar também no ranking local do dia
        saveToLocalRanking(loggedInUser, todayStr, totalScore, details);

        if (!window.supabaseClient) {
            fetchSizeItUpScores();
            return;
        }

        try {
            const { data } = await window.supabaseClient
                .from('omeuemaior_scores')
                .select('id, pontos')
                .eq('usuario', loggedInUser)
                .eq('data_jogo', todayStr);

            if (data && data.length > 0) {
                if (data[0].pontos < totalScore) {
                    await window.supabaseClient
                        .from('omeuemaior_scores')
                        .update({ pontos: totalScore, detalhes: details })
                        .eq('id', data[0].id);
                }
            } else {
                await window.supabaseClient
                    .from('omeuemaior_scores')
                    .insert([{
                        usuario: loggedInUser,
                        data_jogo: todayStr,
                        pontos: totalScore,
                        detalhes: details
                    }]);
            }

            fetchSizeItUpScores();
        } catch (e) {
            console.warn("Erro ao salvar placar no Supabase, usando ranking local:", e);
            fetchSizeItUpScores();
        }
    }

    function saveToLocalRanking(user, dateStr, score, details) {
        const key = `sizeitup_ranking_${dateStr}`;
        let list = [];
        try {
            list = JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            list = [];
        }

        const existingIdx = list.findIndex(item => item.usuario === user);
        if (existingIdx >= 0) {
            if (list[existingIdx].pontos < score) {
                list[existingIdx].pontos = score;
                list[existingIdx].detalhes = details;
            }
        } else {
            list.push({ usuario: user, data_jogo: dateStr, pontos: score, detalhes: details });
        }

        list.sort((a, b) => b.pontos - a.pontos);
        localStorage.setItem(key, JSON.stringify(list));
    }

    async function fetchSizeItUpScores() {
        const listContainer = document.getElementById('sizeitupLeaderboardList');
        if (!listContainer) return;

        const todayStr = new Date().toLocaleDateString('pt-BR');

        // Tenta buscar no Supabase
        if (window.supabaseClient) {
            try {
                listContainer.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Carregando ranking...</p>';
                const { data, error } = await window.supabaseClient
                    .from('omeuemaior_scores')
                    .select('*')
                    .eq('data_jogo', todayStr)
                    .order('pontos', { ascending: false });

                if (!error && data && data.length > 0) {
                    renderLeaderboard(data);
                    return;
                }
            } catch (e) {
                console.warn("Falha ao buscar Supabase, carregando ranking local", e);
            }
        }

        // Fallback para o ranking local
        const key = `sizeitup_ranking_${todayStr}`;
        let localData = [];
        try {
            localData = JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {}

        renderLeaderboard(localData);
    }

    function renderLeaderboard(scores) {
        const list = document.getElementById('sizeitupLeaderboardList');
        if (!list) return;

        if (!scores || scores.length === 0) {
            list.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Ninguém jogou hoje ainda. Seja o primeiro a cravar as medidas!</p>';
            return;
        }

        let html = '';
        scores.forEach((s, i) => {
            let icon = '📏';
            if (i === 0) icon = '🥇';
            else if (i === 1) icon = '🥈';
            else if (i === 2) icon = '🥉';

            const ptsColor = s.pontos >= 400 ? '#22c55e' : (s.pontos >= 250 ? '#02ceff' : '#facc15');

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.05); border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.3em;">${icon}</span>
                        <span style="font-weight: bold; color: white;">${s.usuario}</span>
                    </div>
                    <div style="text-align: right;">
                        <span style="color: ${ptsColor}; font-weight: 900; font-size: 1.15em;">${s.pontos}</span>
                        <span style="font-size: 0.8em; opacity: 0.7;">/500 pts</span>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    // Inicialização ao carregar o DOM
    document.addEventListener('DOMContentLoaded', () => {
        window.initSizeItUp();
    });

})();
