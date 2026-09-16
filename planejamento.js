// =========================================================================
// PLANEJAMENTO ESTRATÉGICO · HOSPEDAGEM DO MARKETING-INSPIRAR-MAIN
// Hospeda a plataforma oficial original na íntegra sem alterar cores ou estilos
// =========================================================================

(function() {
    'use strict';

    window.initPlanejamento = function() {
        const frame = document.getElementById('frame-planejamento');
        if (frame) {
            if (!frame.getAttribute('src') || frame.getAttribute('src') === 'about:blank') {
                frame.setAttribute('src', 'marketing-inspirar-main/index.html');
            }
        }
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    };

    window.togglePlanejamentoFullscreen = function() {
        const wrapper = document.getElementById('planejamento-frame-wrapper') || document.getElementById('frame-planejamento');
        if (!wrapper) return;
        if (!document.fullscreenElement) {
            if (wrapper.requestFullscreen) {
                wrapper.requestFullscreen();
            } else if (wrapper.webkitRequestFullscreen) {
                wrapper.webkitRequestFullscreen();
            } else if (wrapper.msRequestFullscreen) {
                wrapper.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    // Suporte a fallback caso marketing-inspirar-main não esteja na subpasta
    window.addEventListener('DOMContentLoaded', function() {
        const frame = document.getElementById('frame-planejamento');
        if (frame) {
            frame.addEventListener('error', function() {
                if (frame.src && frame.src.indexOf('planejamento-inspirar.html') === -1) {
                    console.warn('[Planejamento] Fallback para planejamento-inspirar.html');
                    frame.src = 'planejamento-inspirar.html';
                }
            });
        }
    });

})();