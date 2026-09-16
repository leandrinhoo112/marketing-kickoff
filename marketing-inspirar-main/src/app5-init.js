/* =========================================================================
   INICIALIZAÇÃO
   ========================================================================= */
document.getElementById('overlay').addEventListener('click', closeSheet);
document.getElementById('sheetClose').addEventListener('click', closeSheet);
document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeSheet(); });
window.addEventListener('hashchange', function(){ readHash(); render(); });

readHash();
if(S.mode === 'pe' && S.tab === 'iniciativas' && S.arg) S.open[S.arg] = true;
render();
