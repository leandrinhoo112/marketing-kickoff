const SUPABASE_URL = 'https://szscamhegxbywbulptyg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2NhbWhlZ3hieXdidWxwdHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTMzNTYsImV4cCI6MjA5NDIyOTM1Nn0.zDwmCpC3rV_NFQxflD469fDIWrH81_c-rcrLPun7w6M';

let supabaseClient;
try {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) { console.error(e); }

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('kickoffForm');
    const kickoffList = document.getElementById('kickoffList');
    const dateDisplay = document.getElementById('currentDate');

    if (dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    async function loadEntries() {
        if (!supabaseClient) return;
        try {
            const { data, error } = await supabaseClient.from('kickoffs').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (data) {
                kickoffList.innerHTML = data.map(entry => {
                    const blockersVal = (entry.blockers || '').toLowerCase().trim();
                    const hasBlockers = blockersVal !== '' && !['não', 'nao', 'nada', 'n/a', 'no'].includes(blockersVal);
                    return `
                    <div class="kickoff-item" style="border-left: 4px solid #6841f1; margin-bottom: 20px; padding: 25px; background: rgba(255,255,255,0.05); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div class="item-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div class="user-info">
                                <h4 style="color: #8e6eff; font-size: 1.2em; margin: 0;">${entry.username || 'Membro do Time'}</h4>
                                <span style="opacity: 0.5; font-size: 0.85em;">${new Date(entry.created_at).toLocaleString('pt-BR')}</span>
                            </div>
                            ${hasBlockers ? '<span style="background: rgba(255, 65, 108, 0.1); color: #ff416c; padding: 4px 10px; border-radius: 6px; font-size: 0.8em; font-weight: bold;">⚠️ Impedido</span>' : ''}
                        </div>
                        <div class="item-content" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                            <div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Ontem</label><p>${entry.yesterday_tasks || '-'}</p></div>
                            <div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Hoje</label><p>${entry.today_tasks || '-'}</p></div>
                            ${entry.help_needed ? `<div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Ajuda</label><p style="color: #02ceff;">${entry.help_needed} ${entry.who_help ? `(${entry.who_help})` : ''}</p></div>` : ''}
                            ${entry.observations ? `<div class="content-block" style="grid-column: 1/-1;"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Obs</label><p>${entry.observations}</p></div>` : ''}
                        </div>
                    </div>`;
                }).join('');
            }
            if (window.lucide) window.lucide.createIcons();
        } catch (error) { console.error(error); }
    }

    async function sendTeamsAlert(entry) {
        if (!entry.help_needed && !entry.blockers) return;

        const PROXY_URL = '/api/send-teams'; 
        
        // FORMATO SIMPLES PARA WEBHOOK CLÁSSICO (O ÚNICO QUE FUNCIONA)
        const message = `🚨 **ALERTA DE RADAR**\n\n**Membro:** ${entry.username}\n**Ajuda:** ${entry.help_needed || 'Não'}\n**De quem:** ${entry.who_help || 'Alguém do time'}\n**Impedimentos:** ${entry.blockers || 'Não'}\n\n[Clique aqui para ver o Radar](${window.location.href})`;

        try {
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: message })
            });

            if (response.ok) {
                console.log("✅ Alerta enviado ao Teams!");
            } else {
                console.error("❌ Erro no envio:", response.status);
            }
        } catch (e) { console.error("Erro no alerta:", e); }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Enviando...';

            const entry = {
                username: document.getElementById('userName').value,
                yesterday_tasks: document.getElementById('yesterdayTasks').value,
                today_tasks: document.getElementById('todayTasks').value,
                help_needed: document.getElementById('helpNeeded').value,
                who_help: document.getElementById('whoHelp').value,
                blockers: document.getElementById('blockers').value,
                observations: document.getElementById('observations').value,
                created_at: new Date().toISOString()
            };

            try {
                const { error } = await supabaseClient.from('kickoffs').insert([entry]);
                if (error) throw error;
                await sendTeamsAlert(entry);
                alert('✅ RADAR ENVIADO COM SUCESSO!');
                form.reset();
                loadEntries();
            } catch (error) {
                alert('Erro: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar Radar <i data-lucide="send"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        });
    }

    loadEntries();
    setInterval(loadEntries, 10000);
});
