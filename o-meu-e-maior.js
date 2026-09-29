/**
 * O MEU É MAIOR — Minigame de Comparação e Estimativa de Escala Real
 * Inspirado no Magnitudle (Size It Up)
 * Desenvolvido para o Radar Diário
 */

(function () {
    'use strict';

    // Banco de fallback de 70 itens com proporções e alturas reais (em metros)
    const FALLBACK_ITEMS = [
        // =====================================================================
        // CATEGORIA 1: PEQUENO (0.027m a 0.35m / 2.7 cm a 35 cm)
        // =====================================================================
        {
            id: 'moeda',
            name: 'Moeda de 1 Real',
            size: 0.027,
            unit: 'cm',
            display: '2,7 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="46" fill="currentColor"/><circle cx="50" cy="50" r="34" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="6"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="900" fill="rgba(0,0,0,0.4)" text-anchor="middle">R$1</text></svg>`
        },
        {
            id: 'caixa_fosforo',
            name: 'Caixa de Fósforos',
            size: 0.05,
            unit: 'cm',
            display: '5 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 70 100" width="100%" height="100%"><rect x="10" y="10" width="50" height="80" rx="4" fill="currentColor"/><rect x="15" y="15" width="40" height="70" fill="rgba(0,0,0,0.25)"/><rect x="10" y="35" width="50" height="30" fill="rgba(255,255,255,0.2)"/></svg>`
        },
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
            id: 'maca',
            name: 'Maçã',
            size: 0.085,
            unit: 'cm',
            display: '8,5 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 90 90" width="100%" height="100%"><path d="M45,20 C30,10 10,25 15,55 C20,75 38,85 45,85 C52,85 70,75 75,55 C80,25 60,10 45,20 Z" fill="currentColor"/><path d="M45,20 C48,10 55,5 60,4" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="4" stroke-linecap="round"/></svg>`
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
            id: 'tenis',
            name: 'Tênis de Corrida',
            size: 0.13,
            unit: 'cm',
            display: '13 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 140 70" width="100%" height="100%"><path d="M10,55 C10,55 20,62 50,62 C90,62 130,55 130,45 C130,30 110,25 95,28 L75,10 C65,10 55,20 45,35 L20,40 C12,43 10,50 10,55 Z" fill="currentColor"/><rect x="10" y="58" width="120" height="8" rx="4" fill="rgba(255,255,255,0.3)"/></svg>`
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
            id: 'pao_frances',
            name: 'Pão Francês',
            size: 0.15,
            unit: 'cm',
            display: '15 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 130 65" width="100%" height="100%"><ellipse cx="65" cy="35" rx="55" ry="25" fill="currentColor"/><path d="M35,20 Q45,35 40,48" stroke="rgba(0,0,0,0.3)" stroke-width="5" fill="none"/><path d="M65,15 Q75,35 70,48" stroke="rgba(0,0,0,0.3)" stroke-width="5" fill="none"/><path d="M95,20 Q105,35 100,48" stroke="rgba(0,0,0,0.3)" stroke-width="5" fill="none"/></svg>`
        },
        {
            id: 'copo_stanley',
            name: 'Copo Térmico (Stanley)',
            size: 0.17,
            unit: 'cm',
            display: '17 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 60 110" width="100%" height="100%"><polygon points="10,20 50,20 44,105 16,105" fill="currentColor"/><rect x="8" y="10" width="44" height="10" rx="3" fill="rgba(255,255,255,0.3)"/><rect x="26" y="2" width="8" height="8" rx="2" fill="rgba(255,255,255,0.4)"/></svg>`
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
            id: 'headphone',
            name: 'Headphone / Fone',
            size: 0.20,
            unit: 'cm',
            display: '20 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 100 110" width="100%" height="100%"><path d="M20,60 C20,25 80,25 80,60" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><rect x="12" y="55" width="16" height="35" rx="7" fill="currentColor"/><rect x="72" y="55" width="16" height="35" rx="7" fill="currentColor"/></svg>`
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
            id: 'notebook',
            name: 'Notebook Aberto',
            size: 0.24,
            unit: 'cm',
            display: '24 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 120 90" width="100%" height="100%"><polygon points="30,10 90,10 95,65 25,65" fill="currentColor"/><rect x="32" y="15" width="56" height="45" rx="2" fill="rgba(0,0,0,0.35)"/><polygon points="10,75 110,75 115,80 5,80" fill="currentColor"/><polygon points="25,65 95,65 110,75 10,75" fill="rgba(255,255,255,0.2)"/></svg>`
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
            id: 'livro',
            name: 'Livro Dicionário',
            size: 0.28,
            unit: 'cm',
            display: '28 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 80 110" width="100%" height="100%"><rect x="12" y="10" width="56" height="90" rx="4" fill="currentColor"/><rect x="16" y="15" width="48" height="80" rx="2" fill="rgba(0,0,0,0.25)"/><line x1="12" y1="10" x2="12" y2="100" stroke="rgba(255,255,255,0.4)" stroke-width="6"/></svg>`
        },
        {
            id: 'garrafa_vinho',
            name: 'Garrafa de Vinho',
            size: 0.30,
            unit: 'cm',
            display: '30 cm',
            category: 'pequeno',
            svg: `<svg viewBox="0 0 45 130" width="100%" height="100%"><rect x="18" y="5" width="9" height="30" rx="2" fill="currentColor"/><path d="M18,35 C10,50 8,65 8,85 L8,125 C8,128 10,130 14,130 L31,130 C35,130 37,128 37,125 L37,85 C37,65 35,50 27,35 Z" fill="currentColor"/><rect x="10" y="70" width="25" height="35" rx="3" fill="rgba(255,255,255,0.2)"/></svg>`
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

        // =====================================================================
        // CATEGORIA 2: MÉDIO-PEQUENO (0.35m a 1.15m / 35 cm a 115 cm)
        // =====================================================================
        {
            id: 'microondas',
            name: 'Forno Micro-ondas',
            size: 0.32,
            unit: 'cm',
            display: '32 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 110 80" width="100%" height="100%"><rect x="5" y="10" width="100" height="65" rx="8" fill="currentColor"/><rect x="12" y="18" width="60" height="49" rx="4" fill="rgba(0,0,0,0.35)"/><circle cx="88" cy="28" r="6" fill="rgba(255,255,255,0.3)"/><circle cx="88" cy="46" r="6" fill="rgba(255,255,255,0.3)"/><rect x="80" y="58" width="16" height="4" rx="2" fill="rgba(255,255,255,0.3)"/></svg>`
        },
        {
            id: 'pizza',
            name: 'Pizza Família (Caixa)',
            size: 0.40,
            unit: 'cm',
            display: '40 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 120 70" width="100%" height="100%"><polygon points="60,5 115,25 60,45 5,25" fill="currentColor"/><polygon points="5,25 60,45 60,65 5,45" fill="rgba(0,0,0,0.25)"/><polygon points="115,25 60,45 60,65 115,45" fill="rgba(0,0,0,0.15)"/></svg>`
        },
        {
            id: 'mochila',
            name: 'Mochila Escolar',
            size: 0.45,
            unit: 'cm',
            display: '45 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 80 110" width="100%" height="100%"><path d="M20,35 C20,15 60,15 60,35 L65,100 C65,105 60,110 55,110 L25,110 C20,110 15,105 15,100 Z" fill="currentColor"/><rect x="22" y="55" width="36" height="40" rx="5" fill="rgba(0,0,0,0.25)"/><path d="M30,15 C30,8 50,8 50,15" fill="none" stroke="currentColor" stroke-width="4"/></svg>`
        },
        {
            id: 'pneu',
            name: 'Pneu de Carro',
            size: 0.60,
            unit: 'cm',
            display: '60 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="46" fill="currentColor"/><circle cx="50" cy="50" r="28" fill="rgba(0,0,0,0.4)"/><circle cx="50" cy="50" r="16" fill="currentColor"/><circle cx="50" cy="50" r="5" fill="rgba(255,255,255,0.5)"/></svg>`
        },
        {
            id: 'capivara',
            name: 'Capivara',
            size: 0.60,
            unit: 'cm',
            display: '60 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 140 90" width="100%" height="100%"><ellipse cx="65" cy="50" rx="45" ry="30" fill="currentColor"/><path d="M95,35 C105,25 125,25 132,38 C135,45 132,55 125,60 L105,62 Z" fill="currentColor"/><ellipse cx="108" cy="24" rx="4" ry="6" fill="currentColor"/><rect x="35" y="70" width="12" height="18" rx="4" fill="currentColor"/><rect x="85" y="70" width="12" height="18" rx="4" fill="currentColor"/><circle cx="120" cy="38" r="2.5" fill="rgba(255,255,255,0.6)"/></svg>`
        },
        {
            id: 'cachorro_golden',
            name: 'Cachorro Golden Retriever',
            size: 0.60,
            unit: 'cm',
            display: '60 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 130 90" width="100%" height="100%"><ellipse cx="55" cy="50" rx="35" ry="22" fill="currentColor"/><circle cx="95" cy="32" r="15" fill="currentColor"/><path d="M102,32 L116,36 L114,44 L98,42 Z" fill="currentColor"/><path d="M88,26 C85,24 82,34 85,42" fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M22,48 C14,35 8,40 12,28" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><rect x="35" y="65" width="10" height="23" rx="4" fill="currentColor"/><rect x="75" y="65" width="10" height="23" rx="4" fill="currentColor"/></svg>`
        },
        {
            id: 'barril_chopp',
            name: 'Barril de Chopp (50L)',
            size: 0.60,
            unit: 'cm',
            display: '60 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 80 110" width="100%" height="100%"><path d="M20,15 C10,35 10,75 20,95 L60,95 C70,75 70,35 60,15 Z" fill="currentColor"/><ellipse cx="40" cy="15" rx="20" ry="6" fill="rgba(255,255,255,0.2)"/><ellipse cx="40" cy="95" rx="20" ry="6" fill="rgba(0,0,0,0.3)"/><line x1="12" y1="40" x2="68" y2="40" stroke="rgba(0,0,0,0.25)" stroke-width="3"/><line x1="12" y1="70" x2="68" y2="70" stroke="rgba(0,0,0,0.25)" stroke-width="3"/></svg>`
        },
        {
            id: 'mala_viagem',
            name: 'Mala de Viagem Média',
            size: 0.65,
            unit: 'cm',
            display: '65 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 80 115" width="100%" height="100%"><rect x="15" y="25" width="50" height="75" rx="8" fill="currentColor"/><rect x="32" y="10" width="16" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="24" cy="104" r="5" fill="rgba(255,255,255,0.4)"/><circle cx="56" cy="104" r="5" fill="rgba(255,255,255,0.4)"/><line x1="15" y1="55" x2="65" y2="55" stroke="rgba(0,0,0,0.2)" stroke-width="3"/></svg>`
        },
        {
            id: 'banqueta',
            name: 'Banqueta Alta de Bar',
            size: 0.75,
            unit: 'cm',
            display: '75 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 70 120" width="100%" height="100%"><ellipse cx="35" cy="15" rx="24" ry="7" fill="currentColor"/><line x1="20" y1="20" x2="10" y2="115" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><line x1="50" y1="20" x2="60" y2="115" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><line x1="15" y1="75" x2="55" y2="75" stroke="currentColor" stroke-width="4"/></svg>`
        },
        {
            id: 'skate',
            name: 'Skate (Skateboard)',
            size: 0.80,
            unit: 'cm',
            display: '80 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 120 40" width="100%" height="100%"><path d="M5,12 C15,18 105,18 115,12 C118,10 120,15 115,22 C105,25 15,25 5,22 C0,15 2,10 5,12 Z" fill="currentColor"/><circle cx="25" cy="30" r="6" fill="rgba(255,255,255,0.4)"/><circle cx="95" cy="30" r="6" fill="rgba(255,255,255,0.4)"/></svg>`
        },
        {
            id: 'maquina_lavar',
            name: 'Máquina de Lavar Roupa',
            size: 0.85,
            unit: 'cm',
            display: '85 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 90 110" width="100%" height="100%"><rect x="10" y="10" width="70" height="90" rx="6" fill="currentColor"/><circle cx="45" cy="65" r="24" fill="rgba(0,0,0,0.3)"/><circle cx="45" cy="65" r="16" fill="rgba(255,255,255,0.15)"/><circle cx="25" cy="22" r="4" fill="rgba(255,255,255,0.3)"/><circle cx="40" cy="22" r="4" fill="rgba(255,255,255,0.3)"/></svg>`
        },
        {
            id: 'cadeira_escritorio',
            name: 'Cadeira de Escritório',
            size: 0.95,
            unit: 'cm',
            display: '95 cm',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 80 120" width="100%" height="100%"><rect x="22" y="10" width="36" height="42" rx="6" fill="currentColor"/><rect x="15" y="55" width="50" height="12" rx="4" fill="currentColor"/><rect x="36" y="67" width="8" height="30" fill="currentColor"/><polygon points="40,97 15,115 65,115" fill="currentColor"/><circle cx="15" cy="115" r="4" fill="rgba(255,255,255,0.4)"/><circle cx="65" cy="115" r="4" fill="rgba(255,255,255,0.4)"/></svg>`
        },
        {
            id: 'violao',
            name: 'Violão Acústico',
            size: 1.00,
            unit: 'm',
            display: '1,00 m',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 60 130" width="100%" height="100%"><polygon points="27,5 33,5 33,60 27,60" fill="currentColor"/><ellipse cx="30" cy="80" rx="16" ry="18" fill="currentColor"/><ellipse cx="30" cy="105" rx="22" ry="24" fill="currentColor"/><circle cx="30" cy="85" r="7" fill="rgba(0,0,0,0.35)"/></svg>`
        },
        {
            id: 'guitarra',
            name: 'Guitarra Elétrica',
            size: 1.00,
            unit: 'm',
            display: '1,00 m',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 60 130" width="100%" height="100%"><polygon points="26,5 34,5 33,60 27,60" fill="currentColor"/><ellipse cx="30" cy="95" rx="22" ry="30" fill="currentColor"/><path d="M12,85 C8,70 18,65 24,75" fill="currentColor"/><path d="M48,85 C52,70 42,65 36,75" fill="currentColor"/><circle cx="30" cy="95" r="8" fill="rgba(0,0,0,0.3)"/></svg>`
        },
        {
            id: 'carrinho_bebe',
            name: 'Carrinho de Bebê',
            size: 1.05,
            unit: 'm',
            display: '1,05 m',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 100 110" width="100%" height="100%"><path d="M20,45 C20,30 45,25 60,35 L75,55 L35,55 Z" fill="currentColor"/><path d="M60,35 L80,15" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="95" r="10" fill="currentColor"/><circle cx="70" cy="95" r="10" fill="currentColor"/><line x1="30" y1="95" x2="48" y2="55" stroke="currentColor" stroke-width="4"/><line x1="70" y1="95" x2="52" y2="55" stroke="currentColor" stroke-width="4"/></svg>`
        },
        {
            id: 'pinguim',
            name: 'Pinguim-imperador',
            size: 1.15,
            unit: 'm',
            display: '1,15 m',
            category: 'medio_pequeno',
            svg: `<svg viewBox="0 0 70 120" width="100%" height="100%"><ellipse cx="35" cy="65" rx="22" ry="45" fill="currentColor"/><ellipse cx="35" cy="70" rx="14" ry="35" fill="rgba(255,255,255,0.25)"/><circle cx="35" cy="22" r="14" fill="currentColor"/><polygon points="35,22 55,26 35,30" fill="#facc15"/><ellipse cx="14" cy="60" rx="4" ry="22" fill="currentColor"/><ellipse cx="56" cy="60" rx="4" ry="22" fill="currentColor"/><polygon points="25,110 32,118 40,110" fill="#facc15"/><polygon points="40,110 48,118 55,110" fill="#facc15"/></svg>`
        },

        // =====================================================================
        // CATEGORIA 3: MÉDIO (1.15m a 2.50m)
        // =====================================================================
        {
            id: 'crianca',
            name: 'Criança de 6 anos',
            size: 1.15,
            unit: 'm',
            display: '1,15 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 60 120" width="100%" height="100%"><circle cx="30" cy="18" r="13" fill="currentColor"/><rect x="18" y="34" width="24" height="42" rx="6" fill="currentColor"/><line x1="16" y1="40" x2="6" y2="70" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="44" y1="40" x2="54" y2="70" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><rect x="20" y="78" width="8" height="38" rx="4" fill="currentColor"/><rect x="32" y="78" width="8" height="38" rx="4" fill="currentColor"/></svg>`
        },
        {
            id: 'moto',
            name: 'Moto Scooter',
            size: 1.20,
            unit: 'm',
            display: '1,20 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 130 90" width="100%" height="100%"><circle cx="25" cy="65" r="18" fill="currentColor"/><circle cx="105" cy="65" r="18" fill="currentColor"/><path d="M25,65 L55,65 L65,40 L90,40 L105,65" stroke="currentColor" stroke-width="8" fill="none" stroke-linejoin="round"/><rect x="40" y="32" width="28" height="12" rx="4" fill="currentColor"/><line x1="88" y1="40" x2="80" y2="18" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><line x1="74" y1="18" x2="86" y2="18" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>`
        },
        {
            id: 'fusca',
            name: 'Carro Popular (Fusca / Gol)',
            size: 1.45,
            unit: 'm',
            display: '1,45 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 160 80" width="100%" height="100%"><path d="M10,55 C10,50 20,40 35,40 L50,40 C60,25 75,18 95,18 C115,18 135,32 145,45 L155,50 C158,52 160,56 160,60 L160,68 C160,70 158,72 155,72 L145,72 C145,62 135,55 125,55 C115,55 105,62 105,72 L55,72 C55,62 45,55 35,55 C25,55 15,62 15,72 L5,72 C2,72 0,70 0,68 L0,60 Z" fill="currentColor"/><circle cx="35" cy="72" r="15" fill="rgba(0,0,0,0.4)"/><circle cx="125" cy="72" r="15" fill="rgba(0,0,0,0.4)"/><path d="M60,38 C68,26 80,24 95,24 C108,24 122,30 128,38 Z" fill="rgba(0,0,0,0.3)"/></svg>`
        },
        {
            id: 'vaca',
            name: 'Vaca Holandesa',
            size: 1.50,
            unit: 'm',
            display: '1,50 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 150 110" width="100%" height="100%"><ellipse cx="75" cy="55" rx="48" ry="30" fill="currentColor"/><path d="M115,40 C125,30 140,30 145,45 C145,55 138,65 125,68 Z" fill="currentColor"/><rect x="40" y="80" width="12" height="28" rx="4" fill="currentColor"/><rect x="95" y="80" width="12" height="28" rx="4" fill="currentColor"/><circle cx="60" cy="48" r="10" fill="rgba(0,0,0,0.3)"/><circle cx="95" cy="58" r="14" fill="rgba(0,0,0,0.3)"/></svg>`
        },
        {
            id: 'cavalo',
            name: 'Cavalo Manga-larga',
            size: 1.65,
            unit: 'm',
            display: '1,65 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 140 120" width="100%" height="100%"><ellipse cx="65" cy="65" rx="38" ry="24" fill="currentColor"/><path d="M85,55 L108,22 C115,18 122,25 118,35 L102,62 Z" fill="currentColor"/><polygon points="106,18 112,10 116,18" fill="currentColor"/><rect x="38" y="85" width="9" height="32" rx="4" fill="currentColor"/><rect x="85" y="85" width="9" height="32" rx="4" fill="currentColor"/><path d="M30,60 C20,70 18,90 22,100" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`
        },
        {
            id: 'pessoa',
            name: 'Pessoa Adulta',
            size: 1.75,
            unit: 'm',
            display: '1,75 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 60 140" width="100%" height="100%"><circle cx="30" cy="18" r="14" fill="currentColor"/><path d="M12,42 C12,36 18,34 30,34 C42,34 48,36 48,42 L45,82 L15,82 Z" fill="currentColor"/><line x1="12" y1="42" x2="3" y2="80" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><line x1="48" y1="42" x2="57" y2="80" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><rect x="18" y="84" width="9" height="52" rx="4" fill="currentColor"/><rect x="33" y="84" width="9" height="52" rx="4" fill="currentColor"/></svg>`
        },
        {
            id: 'picape',
            name: 'Picape Hilux',
            size: 1.80,
            unit: 'm',
            display: '1,80 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 170 80" width="100%" height="100%"><path d="M10,50 L40,50 L65,22 L110,22 L120,50 L160,50 L160,65 L10,65 Z" fill="currentColor"/><circle cx="45" cy="65" r="15" fill="rgba(0,0,0,0.4)"/><circle cx="130" cy="65" r="15" fill="rgba(0,0,0,0.4)"/><rect x="70" y="28" width="40" height="20" rx="3" fill="rgba(0,0,0,0.3)"/></svg>`
        },
        {
            id: 'geladeira',
            name: 'Geladeira Duplex',
            size: 1.85,
            unit: 'm',
            display: '1,85 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 60 130" width="100%" height="100%"><rect x="5" y="5" width="50" height="42" rx="5" fill="currentColor"/><rect x="5" y="50" width="50" height="75" rx="5" fill="currentColor"/><rect x="44" y="20" width="4" height="14" rx="2" fill="rgba(0,0,0,0.3)"/><rect x="44" y="65" width="4" height="25" rx="2" fill="rgba(0,0,0,0.3)"/><line x1="5" y1="48" x2="55" y2="48" stroke="rgba(0,0,0,0.2)" stroke-width="3"/></svg>`
        },
        {
            id: 'vending_machine',
            name: 'Máquina de Refrigerante',
            size: 1.90,
            unit: 'm',
            display: '1,90 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 70 125" width="100%" height="100%"><rect x="10" y="5" width="50" height="115" rx="6" fill="currentColor"/><rect x="16" y="15" width="38" height="60" rx="3" fill="rgba(0,0,0,0.35)"/><rect x="16" y="85" width="38" height="25" rx="3" fill="rgba(0,0,0,0.2)"/><circle cx="45" cy="80" r="3" fill="rgba(255,255,255,0.4)"/></svg>`
        },
        {
            id: 'kombi',
            name: 'Kombi Clássica',
            size: 2.05,
            unit: 'm',
            display: '2,05 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 150 95" width="100%" height="100%"><rect x="15" y="15" width="120" height="65" rx="14" fill="currentColor"/><rect x="22" y="22" width="28" height="22" rx="4" fill="rgba(0,0,0,0.3)"/><rect x="56" y="22" width="32" height="22" rx="4" fill="rgba(0,0,0,0.3)"/><rect x="94" y="22" width="32" height="22" rx="4" fill="rgba(0,0,0,0.3)"/><circle cx="42" cy="80" r="14" fill="rgba(0,0,0,0.4)"/><circle cx="108" cy="80" r="14" fill="rgba(0,0,0,0.4)"/></svg>`
        },
        {
            id: 'porta',
            name: 'Porta Residencial',
            size: 2.10,
            unit: 'm',
            display: '2,10 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 65 140" width="100%" height="100%"><rect x="5" y="5" width="55" height="130" fill="none" stroke="currentColor" stroke-width="4"/><rect x="10" y="10" width="45" height="125" fill="currentColor"/><circle cx="18" cy="75" r="4" fill="rgba(0,0,0,0.35)"/><rect x="18" y="20" width="30" height="40" fill="rgba(0,0,0,0.15)"/><rect x="18" y="70" width="30" height="55" fill="rgba(0,0,0,0.15)"/></svg>`
        },
        {
            id: 'guarda_sol',
            name: 'Guarda-Sol de Praia',
            size: 2.10,
            unit: 'm',
            display: '2,10 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 110 130" width="100%" height="100%"><path d="M10,45 C25,15 85,15 100,45 Z" fill="currentColor"/><line x1="55" y1="45" x2="55" y2="128" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><polygon points="50,45 60,45 55,10" fill="rgba(255,255,255,0.4)"/></svg>`
        },
        {
            id: 'trave_futebol',
            name: 'Trave de Futebol Oficial',
            size: 2.44,
            unit: 'm',
            display: '2,44 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 140 100" width="100%" height="100%"><rect x="15" y="10" width="110" height="85" fill="none" stroke="currentColor" stroke-width="8"/><line x1="15" y1="10" x2="35" y2="35" stroke="currentColor" stroke-width="4"/><line x1="125" y1="10" x2="105" y2="35" stroke="currentColor" stroke-width="4"/><line x1="35" y1="35" x2="105" y2="35" stroke="currentColor" stroke-width="4"/><line x1="35" y1="35" x2="35" y2="95" stroke="currentColor" stroke-width="4"/><line x1="105" y1="35" x2="105" y2="95" stroke="currentColor" stroke-width="4"/></svg>`
        },
        {
            id: 'urso',
            name: 'Urso Pardo em Pé',
            size: 2.50,
            unit: 'm',
            display: '2,50 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 90 140" width="100%" height="100%"><ellipse cx="45" cy="80" rx="30" ry="42" fill="currentColor"/><circle cx="45" cy="30" r="18" fill="currentColor"/><circle cx="32" cy="16" r="6" fill="currentColor"/><circle cx="58" cy="16" r="6" fill="currentColor"/><path d="M20,45 C10,55 8,75 16,85" stroke="currentColor" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M70,45 C80,55 82,75 74,85" stroke="currentColor" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="25" y="115" width="14" height="22" rx="5" fill="currentColor"/><rect x="51" y="115" width="14" height="22" rx="5" fill="currentColor"/></svg>`
        },
        {
            id: 'cabine_telefonica',
            name: 'Cabine Telefônica',
            size: 2.50,
            unit: 'm',
            display: '2,50 m',
            category: 'medio',
            svg: `<svg viewBox="0 0 65 140" width="100%" height="100%"><rect x="10" y="10" width="45" height="125" rx="6" fill="currentColor"/><path d="M10,18 C10,6 55,6 55,18" fill="currentColor"/><rect x="15" y="24" width="35" height="75" fill="rgba(0,0,0,0.3)"/><line x1="15" y1="50" x2="50" y2="50" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><line x1="15" y1="75" x2="50" y2="75" stroke="rgba(255,255,255,0.2)" stroke-width="2"/></svg>`
        },

        // =====================================================================
        // CATEGORIA 4: GRANDE (2.60m a 15.0m)
        // =====================================================================
        {
            id: 'van_escolar',
            name: 'Van Escolar / Sprinter',
            size: 2.60,
            unit: 'm',
            display: '2,60 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 160 85" width="100%" height="100%"><path d="M15,20 L115,20 L145,45 L145,68 L15,68 Z" fill="currentColor"/><rect x="25" y="28" width="30" height="18" rx="3" fill="rgba(0,0,0,0.3)"/><rect x="62" y="28" width="30" height="18" rx="3" fill="rgba(0,0,0,0.3)"/><polygon points="100,28 118,28 135,45 100,45" fill="rgba(0,0,0,0.3)"/><circle cx="45" cy="68" r="14" fill="rgba(0,0,0,0.4)"/><circle cx="120" cy="68" r="14" fill="rgba(0,0,0,0.4)"/></svg>`
        },
        {
            id: 'container',
            name: 'Container Marítimo',
            size: 2.60,
            unit: 'm',
            display: '2,60 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 170 70" width="100%" height="100%"><rect x="10" y="10" width="150" height="52" rx="4" fill="currentColor"/><line x1="25" y1="10" x2="25" y2="62" stroke="rgba(0,0,0,0.25)" stroke-width="4"/><line x1="45" y1="10" x2="45" y2="62" stroke="rgba(0,0,0,0.25)" stroke-width="4"/><line x1="65" y1="10" x2="65" y2="62" stroke="rgba(0,0,0,0.25)" stroke-width="4"/><line x1="85" y1="10" x2="85" y2="62" stroke="rgba(0,0,0,0.25)" stroke-width="4"/><line x1="105" y1="10" x2="105" y2="62" stroke="rgba(0,0,0,0.25)" stroke-width="4"/><line x1="125" y1="10" x2="125" y2="62" stroke="rgba(0,0,0,0.25)" stroke-width="4"/><line x1="145" y1="10" x2="145" y2="62" stroke="rgba(0,0,0,0.25)" stroke-width="4"/></svg>`
        },
        {
            id: 'tabela_basquete',
            name: 'Tabela de Basquete (Aro)',
            size: 3.05,
            unit: 'm',
            display: '3,05 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 90 140" width="100%" height="100%"><line x1="75" y1="10" x2="75" y2="135" stroke="currentColor" stroke-width="8"/><rect x="15" y="15" width="55" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="6"/><rect x="30" y="25" width="25" height="20" fill="none" stroke="currentColor" stroke-width="4"/><line x1="30" y1="45" x2="10" y2="45" stroke="#facc15" stroke-width="6"/><line x1="10" y1="45" x2="15" y2="60" stroke="rgba(255,255,255,0.4)" stroke-width="3"/></svg>`
        },
        {
            id: 'onibus',
            name: 'Ônibus Urbano',
            size: 3.20,
            unit: 'm',
            display: '3,20 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 170 85" width="100%" height="100%"><rect x="5" y="10" width="160" height="60" rx="8" fill="currentColor"/><rect x="12" y="18" width="30" height="22" rx="3" fill="rgba(0,0,0,0.35)"/><rect x="48" y="18" width="30" height="22" rx="3" fill="rgba(0,0,0,0.35)"/><rect x="84" y="18" width="30" height="22" rx="3" fill="rgba(0,0,0,0.35)"/><rect x="120" y="18" width="40" height="22" rx="3" fill="rgba(0,0,0,0.35)"/><circle cx="45" cy="70" r="14" fill="rgba(0,0,0,0.4)"/><circle cx="130" cy="70" r="14" fill="rgba(0,0,0,0.4)"/></svg>`
        },
        {
            id: 'elefante',
            name: 'Elefante Africano',
            size: 3.30,
            unit: 'm',
            display: '3,30 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 150 110" width="100%" height="100%"><ellipse cx="70" cy="55" rx="45" ry="35" fill="currentColor"/><circle cx="115" cy="45" r="22" fill="currentColor"/><path d="M125,45 C135,55 130,85 120,95 C115,100 122,102 125,95 C138,80 145,50 130,35" fill="currentColor"/><ellipse cx="102" cy="45" rx="14" ry="22" fill="rgba(0,0,0,0.2)"/><rect x="35" y="80" width="15" height="28" rx="5" fill="currentColor"/><rect x="60" y="80" width="15" height="28" rx="5" fill="currentColor"/><rect x="90" y="80" width="15" height="28" rx="5" fill="currentColor"/></svg>`
        },
        {
            id: 'caminhao_betoneira',
            name: 'Caminhão Betoneira',
            size: 3.80,
            unit: 'm',
            display: '3,80 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 160 90" width="100%" height="100%"><rect x="15" y="45" width="130" height="30" rx="4" fill="currentColor"/><polygon points="40,25 105,40 105,60 30,50" fill="currentColor"/><polygon points="115,35 140,40 145,65 115,65" fill="currentColor"/><circle cx="45" cy="75" r="14" fill="rgba(0,0,0,0.4)"/><circle cx="75" cy="75" r="14" fill="rgba(0,0,0,0.4)"/><circle cx="125" cy="75" r="14" fill="rgba(0,0,0,0.4)"/></svg>`
        },
        {
            id: 'semaforo',
            name: 'Poste com Semáforo',
            size: 4.50,
            unit: 'm',
            display: '4,50 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 50 140" width="100%" height="100%"><line x1="25" y1="40" x2="25" y2="138" stroke="currentColor" stroke-width="6"/><rect x="14" y="10" width="22" height="50" rx="5" fill="currentColor"/><circle cx="25" cy="20" r="5" fill="#ef4444"/><circle cx="25" cy="35" r="5" fill="#facc15"/><circle cx="25" cy="50" r="5" fill="#22c55e"/></svg>`
        },
        {
            id: 'trex',
            name: 'Tiranossauro Rex (T-Rex)',
            size: 4.50,
            unit: 'm',
            display: '4,50 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 160 120" width="100%" height="100%"><path d="M10,85 C30,75 50,70 65,65 L85,45 C95,30 115,25 135,28 L145,35 L125,50 L115,55 L105,75 C95,95 85,115 75,115 C65,115 70,95 60,85 Z" fill="currentColor"/><rect x="75" y="90" width="14" height="28" rx="6" fill="currentColor"/><line x1="90" y1="65" x2="105" y2="72" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>`
        },
        {
            id: 'girafa',
            name: 'Girafa Adulta',
            size: 5.50,
            unit: 'm',
            display: '5,50 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 100 160" width="100%" height="100%"><path d="M30,105 C30,90 45,85 60,95 L72,30 C74,20 82,18 84,24 L78,95 C82,100 85,110 80,115 Z" fill="currentColor"/><circle cx="84" cy="20" r="7" fill="currentColor"/><line x1="84" y1="16" x2="88" y2="10" stroke="currentColor" stroke-width="3"/><line x1="82" y1="16" x2="80" y2="10" stroke="currentColor" stroke-width="3"/><rect x="35" y="110" width="7" height="48" rx="3" fill="currentColor"/><rect x="50" y="110" width="7" height="48" rx="3" fill="currentColor"/><rect x="68" y="110" width="7" height="48" rx="3" fill="currentColor"/></svg>`
        },
        {
            id: 'casa_2andares',
            name: 'Casa de 2 Andares',
            size: 7.50,
            unit: 'm',
            display: '7,50 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 120 120" width="100%" height="100%"><polygon points="60,10 110,45 10,45" fill="currentColor"/><rect x="18" y="45" width="84" height="70" fill="currentColor"/><rect x="28" y="55" width="20" height="20" fill="rgba(0,0,0,0.3)"/><rect x="72" y="55" width="20" height="20" fill="rgba(0,0,0,0.3)"/><rect x="50" y="85" width="20" height="30" fill="rgba(0,0,0,0.3)"/></svg>`
        },
        {
            id: 'poste_luz',
            name: 'Poste de Luz de Rua',
            size: 8.00,
            unit: 'm',
            display: '8,00 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 60 160" width="100%" height="100%"><line x1="30" y1="20" x2="30" y2="158" stroke="currentColor" stroke-width="6"/><path d="M30,30 C30,10 52,10 52,25" fill="none" stroke="currentColor" stroke-width="5"/><polygon points="45,25 58,25 54,35 48,35" fill="#facc15"/></svg>`
        },
        {
            id: 'palmeira',
            name: 'Palmeira Imperial',
            size: 15.00,
            unit: 'm',
            display: '15,00 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 80 150" width="100%" height="100%"><line x1="40" y1="35" x2="40" y2="148" stroke="currentColor" stroke-width="7"/><path d="M40,35 C25,20 10,25 5,35" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M40,35 C55,20 70,25 75,35" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M40,35 C30,10 15,10 10,20" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M40,35 C50,10 65,10 70,20" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M40,35 C40,5 40,0 40,5" stroke="currentColor" stroke-width="5" fill="none"/></svg>`
        },
        {
            id: 'aviao_737',
            name: 'Avião Boeing 737',
            size: 12.50,
            unit: 'm',
            display: '12,50 m',
            category: 'grande',
            svg: `<svg viewBox="0 0 170 85" width="100%" height="100%"><path d="M10,48 C30,48 50,45 80,45 L115,20 L130,20 L120,45 L155,46 C165,47 168,52 155,54 L120,54 L105,75 L95,75 L102,54 L10,53 Z" fill="currentColor"/></svg>`
        },

        // =====================================================================
        // CATEGORIA 5: MONUMENTAL (30.0m a 330.0m)
        // =====================================================================
        {
            id: 'baleia_azul',
            name: 'Baleia Azul',
            size: 30.00,
            unit: 'm',
            display: '30,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 170 75" width="100%" height="100%"><path d="M10,40 C20,20 70,18 120,25 C145,28 160,35 168,22 C168,32 165,45 150,45 C120,45 70,55 30,52 Z" fill="currentColor"/><path d="M60,42 L50,60 L65,50" fill="currentColor"/></svg>`
        },
        {
            id: 'predio_10andares',
            name: 'Edifício de 10 Andares',
            size: 30.00,
            unit: 'm',
            display: '30,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 90 160" width="100%" height="100%"><rect x="15" y="10" width="60" height="148" fill="currentColor"/><rect x="23" y="18" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="40" y="18" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="57" y="18" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="23" y="38" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="40" y="38" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="57" y="38" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="23" y="58" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="40" y="58" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="57" y="58" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="23" y="78" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="40" y="78" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="57" y="78" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="23" y="98" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="40" y="98" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="57" y="98" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="23" y="118" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="40" y="118" width="10" height="10" fill="rgba(0,0,0,0.3)"/><rect x="57" y="118" width="10" height="10" fill="rgba(0,0,0,0.3)"/></svg>`
        },
        {
            id: 'cristo_redentor',
            name: 'Cristo Redentor (Rio de Janeiro)',
            size: 38.00,
            unit: 'm',
            display: '38,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 140 150" width="100%" height="100%"><polygon points="45,148 95,148 90,120 50,120" fill="rgba(0,0,0,0.3)"/><path d="M56,120 L58,45 L10,45 L10,38 L59,38 L65,18 C65,12 75,12 75,18 L81,38 L130,38 L130,45 L82,45 L84,120 Z" fill="currentColor"/><circle cx="70" cy="18" r="8" fill="currentColor"/></svg>`
        },
        {
            id: 'coliseu',
            name: 'Coliseu de Roma',
            size: 48.00,
            unit: 'm',
            display: '48,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 160 100" width="100%" height="100%"><rect x="15" y="30" width="130" height="65" rx="6" fill="currentColor"/><ellipse cx="80" cy="30" rx="65" ry="15" fill="rgba(255,255,255,0.2)"/><circle cx="35" cy="50" r="7" fill="rgba(0,0,0,0.3)"/><circle cx="65" cy="50" r="7" fill="rgba(0,0,0,0.3)"/><circle cx="95" cy="50" r="7" fill="rgba(0,0,0,0.3)"/><circle cx="125" cy="50" r="7" fill="rgba(0,0,0,0.3)"/><circle cx="35" cy="75" r="7" fill="rgba(0,0,0,0.3)"/><circle cx="65" cy="75" r="7" fill="rgba(0,0,0,0.3)"/><circle cx="95" cy="75" r="7" fill="rgba(0,0,0,0.3)"/><circle cx="125" cy="75" r="7" fill="rgba(0,0,0,0.3)"/></svg>`
        },
        {
            id: 'foguete_falcon',
            name: 'Foguete Orbital (Falcon 9)',
            size: 70.00,
            unit: 'm',
            display: '70,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 50 160" width="100%" height="100%"><polygon points="25,5 33,25 17,25" fill="currentColor"/><rect x="17" y="25" width="16" height="115" rx="2" fill="currentColor"/><polygon points="17,120 5,145 17,140" fill="currentColor"/><polygon points="33,120 45,145 33,140" fill="currentColor"/><ellipse cx="25" cy="145" rx="8" ry="4" fill="rgba(0,0,0,0.4)"/></svg>`
        },
        {
            id: 'roda_gigante',
            name: 'Roda-Gigante (Yup Star)',
            size: 88.00,
            unit: 'm',
            display: '88,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 130 150" width="100%" height="100%"><circle cx="65" cy="65" r="55" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="65" cy="65" r="6" fill="currentColor"/><line x1="65" y1="10" x2="65" y2="120" stroke="currentColor" stroke-width="3"/><line x1="10" y1="65" x2="120" y2="65" stroke="currentColor" stroke-width="3"/><line x1="26" y1="26" x2="104" y2="104" stroke="currentColor" stroke-width="3"/><line x1="104" y1="26" x2="26" y2="104" stroke="currentColor" stroke-width="3"/><line x1="65" y1="65" x2="35" y2="148" stroke="currentColor" stroke-width="6"/><line x1="65" y1="65" x2="95" y2="148" stroke="currentColor" stroke-width="6"/></svg>`
        },
        {
            id: 'estatua_liberdade',
            name: 'Estátua da Liberdade (Nova York)',
            size: 93.00,
            unit: 'm',
            display: '93,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 90 160" width="100%" height="100%"><polygon points="25,158 65,158 60,115 30,115" fill="rgba(0,0,0,0.3)"/><path d="M36,115 L32,60 L54,60 L50,115 Z" fill="currentColor"/><circle cx="43" cy="50" r="7" fill="currentColor"/><polygon points="38,44 48,44 43,36" fill="#facc15"/><line x1="53" y1="62" x2="68" y2="28" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><polygon points="65,22 72,25 70,30 63,27" fill="#ea580c"/></svg>`
        },
        {
            id: 'piramide_gize',
            name: 'Grande Pirâmide de Gizé',
            size: 138.00,
            unit: 'm',
            display: '138,00 m',
            category: 'monumento',
            svg: `<svg viewBox="0 0 150 100" width="100%" height="100%"><polygon points="75,10 140,90 10,90" fill="currentColor"/><polygon points="75,10 140,90 95,90" fill="rgba(0,0,0,0.25)"/></svg>`
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

    // Retorna o catálogo expandido de 540 itens se carregado via o-meu-e-maior-items.js, ou o fallback de 70
    function getGameItems() {
        if (typeof window !== 'undefined' && window.SIZE_IT_UP_ITEMS && Array.isArray(window.SIZE_IT_UP_ITEMS) && window.SIZE_IT_UP_ITEMS.length >= 500) {
            return window.SIZE_IT_UP_ITEMS;
        }
        return FALLBACK_ITEMS;
    }

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

    // Gera as 5 rodadas diárias com proporções controladas e balanceadas
    function generateDailyRounds(isUnlimited = false) {
        const items = getGameItems();
        const seedBase = isUnlimited ? Math.floor(Math.random() * 1000000) : getSeedFromString(getTodayKey());
        let seed = seedBase;

        // Plano balanceado de categorias: pares comparáveis visualmente
        const plan = [
            { refCat: ['micro_pequeno', 'pequeno'], targetCat: ['micro_pequeno', 'pequeno', 'medio_pequeno'], minRatio: 0.35, maxRatio: 4.5 },
            { refCat: ['pequeno', 'medio_pequeno'], targetCat: ['medio_pequeno'], minRatio: 0.4, maxRatio: 4.5 },
            { refCat: ['medio_pequeno', 'medio'], targetCat: ['medio'], minRatio: 0.35, maxRatio: 4.5 },
            { refCat: ['medio'], targetCat: ['medio', 'grande'], minRatio: 0.4, maxRatio: 5.0 },
            { refCat: ['grande'], targetCat: ['grande', 'monumento'], minRatio: 0.4, maxRatio: 6.0 }
        ];

        const rounds = [];
        const usedIds = new Set();

        plan.forEach((p, idx) => {
            const availableRefs = items.filter(it => p.refCat.includes(it.category) && !usedIds.has(it.id));
            const refPool = availableRefs.length > 0 ? availableRefs : items.filter(it => p.refCat.includes(it.category));
            const refIdx = Math.floor(pseudoRandom(seed++) * refPool.length);
            const refItem = refPool[refIdx];
            usedIds.add(refItem.id);

            // Filtra alvos dentro do intervalo aceitável de proporção (minRatio a maxRatio)
            let eligibleTargets = items.filter(it => {
                if (it.id === refItem.id || usedIds.has(it.id)) return false;
                if (!p.targetCat.includes(it.category)) return false;
                const ratio = it.size / refItem.size;
                return ratio >= p.minRatio && ratio <= p.maxRatio;
            });

            if (eligibleTargets.length === 0) {
                eligibleTargets = items.filter(it => it.id !== refItem.id && p.targetCat.includes(it.category));
            }
            if (eligibleTargets.length === 0) {
                eligibleTargets = items.filter(it => it.id !== refItem.id);
            }

            const targetIdx = Math.floor(pseudoRandom(seed++) * eligibleTargets.length);
            const targetItem = eligibleTargets[targetIdx];
            usedIds.add(targetItem.id);

            const trueRatio = targetItem.size / refItem.size;

            // Escala inicial afastada da real para propor desafio
            let initialGuessScale;
            if (trueRatio > 1.2) {
                initialGuessScale = Math.max(0.3, trueRatio * (0.35 + pseudoRandom(seed++) * 0.35));
            } else {
                initialGuessScale = Math.min(3.5, trueRatio * (1.6 + pseudoRandom(seed++) * 0.7));
            }

            // Limites de slider calculados dinamicamente para que a resposta NUNCA seja cortada!
            const sliderMin = Math.max(0.05, Math.floor(Math.min(0.2, trueRatio * 0.2) * 100) / 100);
            const sliderMax = Math.max(4.0, Math.ceil(Math.max(trueRatio * 2.3, 3.5) * 10) / 10);

            rounds.push({
                roundNum: idx + 1,
                ref: refItem,
                target: targetItem,
                trueRatio: trueRatio,
                initialGuessScale: Math.round(initialGuessScale * 100) / 100,
                sliderMin: sliderMin,
                sliderMax: sliderMax
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
                const round = gameState.rounds[gameState.currentRoundIndex];
                const minS = round ? round.sliderMin : 0.05;
                setGuessScale(Math.max(minS, gameState.currentGuessScale - 0.05));
            });
        }

        if (plusBtn && !plusBtn.dataset.bound) {
            plusBtn.dataset.bound = 'true';
            plusBtn.addEventListener('click', () => {
                if (gameState.isLocked) return;
                const round = gameState.rounds[gameState.currentRoundIndex];
                const maxS = round ? round.sliderMax : 6.0;
                setGuessScale(Math.min(maxS, gameState.currentGuessScale + 0.05));
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
        const round = gameState.rounds[gameState.currentRoundIndex];
        gameState.currentGuessScale = Math.round(val * 100) / 100;
        
        const slider = document.getElementById('sizeitup-slider');
        if (slider) slider.value = gameState.currentGuessScale;

        const ratioLabel = document.getElementById('sizeitup-relative-ratio-label');
        if (ratioLabel) {
            ratioLabel.textContent = `${gameState.currentGuessScale.toFixed(2)}x`;
        }

        // Mostra a altura estimada em metros/cm em tempo real
        const estimateDesc = document.getElementById('sizeitup-estimate-dimension');
        if (estimateDesc && round) {
            const estimatedMeters = round.ref.size * gameState.currentGuessScale;
            estimateDesc.innerHTML = `Estimando: <strong style="color: #02ceff;">${formatDimension(estimatedMeters)}</strong> <span style="opacity: 0.7;">(${gameState.currentGuessScale.toFixed(2)}x da ref)</span>`;
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

        // Pergunta clara em destaque
        const promptEl = document.getElementById('sizeitup-prompt-text');
        if (promptEl && round) {
            promptEl.innerHTML = `Quantas vezes o(a) <strong style="color: #02ceff;">${round.target.name}</strong> é maior ou menor que o(a) <strong style="color: #c4b5fd;">${round.ref.name}</strong>?`;
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

        // Configura limites dinâmicos do slider para esta rodada
        if (round) {
            const slider = document.getElementById('sizeitup-slider');
            const minLabel = document.getElementById('sizeitup-slider-min-label');
            const maxLabel = document.getElementById('sizeitup-slider-max-label');

            if (slider) {
                slider.min = round.sliderMin || 0.05;
                slider.max = round.sliderMax || 6.0;
                slider.step = (round.sliderMax > 10) ? '0.05' : '0.01';
            }
            if (minLabel) minLabel.textContent = `${(round.sliderMin || 0.05).toFixed(2)}x`;
            if (maxLabel) maxLabel.textContent = `${(round.sliderMax || 6.0).toFixed(1)}x`;
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
        const scaleIndicator = document.getElementById('sizeitup-scale-indicator');

        if (refBadge) {
            refBadge.innerHTML = `<span style="opacity:0.7; font-size:0.85em; display:block;">REFERÊNCIA</span>${round.ref.name}: <strong>${round.ref.display}</strong>`;
        }

        if (targetBadge) {
            targetBadge.innerHTML = gameState.isLocked 
                ? `<span style="opacity:0.7; font-size:0.85em; display:block;">ALVO REVELADO</span>${round.target.name}: <strong>${round.target.display}</strong>`
                : `<span style="opacity:0.7; font-size:0.85em; display:block;">ALVO A AJUSTAR</span>${round.target.name} <strong>(?)</strong>`;
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
                <div style="width: ${refWidthPx}px; height: ${baseRefHeightPx}px; color: #8e6eff; filter: drop-shadow(0 0 14px rgba(142, 110, 255, 0.45)); display: flex; align-items: flex-end; justify-content: center;">
                    ${round.ref.svg}
                </div>
            `;
        }

        // Calcula a altura desenhada do alvo pelo palpite do jogador
        const targetHeightPx = Math.max(16, baseRefHeightPx * gameState.currentGuessScale);
        const targetWidthPx = Math.max(16, 110 * gameState.currentGuessScale);

        // Auto zoom/fit para não estourar o palco
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
            desc = 'Treine mais um pouco no modo treino para calibrar seu olho!';
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

        // Salvar sempre no ranking local do dia como garantia
        saveToLocalRanking(loggedInUser, todayStr, totalScore, details);

        if (!window.supabaseClient) {
            fetchSizeItUpScores();
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('omeuemaior_scores')
                .select('id, pontos')
                .eq('usuario', loggedInUser)
                .eq('data_jogo', todayStr);

            if (error) {
                console.warn("Aviso ao consultar omeuemaior_scores no Supabase:", error);
                throw error;
            }

            if (data && data.length > 0) {
                if (data[0].pontos < totalScore) {
                    const { error: updErr } = await window.supabaseClient
                        .from('omeuemaior_scores')
                        .update({ pontos: totalScore, detalhes: details })
                        .eq('id', data[0].id);
                    if (updErr) throw updErr;
                }
            } else {
                const { error: insErr } = await window.supabaseClient
                    .from('omeuemaior_scores')
                    .insert([{
                        usuario: loggedInUser,
                        data_jogo: todayStr,
                        pontos: totalScore,
                        detalhes: details
                    }]);
                if (insErr) throw insErr;
            }

            fetchSizeItUpScores();
        } catch (e) {
            console.warn("Erro ao salvar placar no Supabase, mantendo ranking local:", e);
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

    async function syncLocalScoreToSupabase(todayStr, user, remoteScores) {
        if (!window.supabaseClient) return;
        try {
            const localStateKey = `sizeitupState_${todayStr}`;
            let localTotal = null;
            let localDetails = [];
            const stateStr = localStorage.getItem(localStateKey);
            if (stateStr) {
                try {
                    const parsed = JSON.parse(stateStr);
                    if (parsed && parsed.gameOver && typeof parsed.totalScore === 'number') {
                        localTotal = parsed.totalScore;
                        localDetails = parsed.roundScores || [];
                    }
                } catch (err) {}
            }
            if (localTotal === null) {
                const rankingKey = `sizeitup_ranking_${todayStr}`;
                try {
                    const localRanking = JSON.parse(localStorage.getItem(rankingKey) || '[]');
                    const found = localRanking.find(r => r.usuario === user);
                    if (found) {
                        localTotal = found.pontos;
                        localDetails = found.detalhes || [];
                    }
                } catch (err) {}
            }

            if (localTotal !== null && localTotal > 0) {
                const remoteUserEntry = (remoteScores || []).find(r => r.usuario === user);
                if (!remoteUserEntry) {
                    await window.supabaseClient.from('omeuemaior_scores').insert([{
                        usuario: user,
                        data_jogo: todayStr,
                        pontos: localTotal,
                        detalhes: localDetails
                    }]);
                } else if (remoteUserEntry.pontos < localTotal) {
                    await window.supabaseClient.from('omeuemaior_scores').update({
                        pontos: localTotal,
                        detalhes: localDetails
                    }).eq('id', remoteUserEntry.id);
                }
            }
        } catch (e) {
            console.warn("Aviso ao auto-sincronizar pontuação local com Supabase:", e);
        }
    }

    async function fetchSizeItUpScores() {
        const listContainer = document.getElementById('sizeitupLeaderboardList');
        if (!listContainer) return;

        const todayStr = new Date().toLocaleDateString('pt-BR');
        const loggedInUser = localStorage.getItem('currentUser') || 'Jogador';

        let isTableMissing = false;

        // Tenta buscar no Supabase
        if (window.supabaseClient) {
            try {
                listContainer.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Carregando ranking...</p>';
                const { data, error } = await window.supabaseClient
                    .from('omeuemaior_scores')
                    .select('*')
                    .eq('data_jogo', todayStr)
                    .order('pontos', { ascending: false });

                if (!error && data) {
                    // Sincroniza score local para o Supabase se ainda não foi enviado
                    await syncLocalScoreToSupabase(todayStr, loggedInUser, data);

                    // Re-renderiza com os dados atualizados
                    const { data: refreshedData } = await window.supabaseClient
                        .from('omeuemaior_scores')
                        .select('*')
                        .eq('data_jogo', todayStr)
                        .order('pontos', { ascending: false });

                    renderLeaderboard(refreshedData || data, false);
                    return;
                }

                if (error) {
                    console.warn("Supabase omeuemaior_scores error:", error);
                    const errMsg = (error.message || '').toLowerCase();
                    if (error.code === '42P01' || errMsg.includes('does not exist') || errMsg.includes('not found') || error.code === 'PGRST204') {
                        isTableMissing = true;
                    }
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

        renderLeaderboard(localData, isTableMissing);
    }

    function renderLeaderboard(scores, isTableMissing = false) {
        const list = document.getElementById('sizeitupLeaderboardList');
        if (!list) return;

        let warningHtml = '';
        if (isTableMissing) {
            warningHtml = `
                <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px; font-size: 0.85em; color: #fde68a; line-height: 1.4;">
                    <span style="font-size: 1.3em; line-height: 1;">⚠️</span>
                    <div>
                        <strong style="color: #fbbf24;">Atenção: Tabela 'omeuemaior_scores' pendente no Supabase</strong><br>
                        O jogo está exibindo apenas as pontuações salvas neste computador. Para compartilhar o ranking entre toda a equipe, execute o script SQL da tabela <code>omeuemaior_scores</code> no SQL Editor do Supabase. Assim que criada, os pontos sincronizam automaticamente!
                    </div>
                </div>
            `;
        }

        if (!scores || scores.length === 0) {
            list.innerHTML = warningHtml + '<p style="opacity: 0.5; text-align: center; margin: 0;">Ninguém jogou hoje ainda. Seja o primeiro a cravar as medidas!</p>';
            return;
        }

        let html = warningHtml;
        scores.forEach((s, i) => {
            let icon = '📏';
            if (i === 0) icon = '🥇';
            else if (i === 1) icon = '🥈';
            else if (i === 2) icon = '🥉';

            const ptsColor = s.pontos >= 400 ? '#22c55e' : (s.pontos >= 250 ? '#02ceff' : '#facc15');

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.05); border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); transition: transform 0.15s ease;">
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
