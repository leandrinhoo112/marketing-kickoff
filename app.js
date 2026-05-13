const SUPABASE_URL = 'https://szscamhegxbywbulptyg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2NhbWhlZ3hieXdidWxwdHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTMzNTYsImV4cCI6MjA5NDIyOTM1Nn0.zDwmCpC3rV_NFQxflD469fDIWrH81_c-rcrLPun7w6M';

// Tenta criar o cliente Supabase com segurança
let supabase;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("✅ Supabase conectado com sucesso!");
    } else {
        console.error("❌ Erro: Biblioteca do Supabase não carregada!");
    }
} catch (e) {
    console.error("❌ Erro ao iniciar Supabase:", e);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Aplicativo Iniciado");
    
    const form = document.getElementById('kickoffForm');
    const kickoffList = document.getElementById('kickoffList');
    const dateDisplay = document.getElementById('currentDate');

    if (dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // CARREGAR DADOS
    async function loadEntries() {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('kickoffs')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data && data.length > 0) {
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
            } else {
                kickoffList.innerHTML = '<div class="empty-state" style="text-align: center; padding: 40px; opacity: 0.5;"><p>Nenhum registro hoje.</p></div>';
            }
            if (window.lucide) window.lucide.createIcons();
        } catch (error) {
            console.error('Erro ao carregar:', error);
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // ISSO AQUI É O QUE IMPEDE A PÁGINA DE RECARREGAR
            console.log("📩 Tentando enviar...");

            if (!supabase) {
                alert("Erro: Banco de dados não inicializado.");
                return;
            }

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
                observations: document.getElementById('observations').value
            };

            try {
                const { error } = await supabase.from('kickoffs').insert([entry]);
                if (error) throw error;

                alert('✅ ENVIADO COM SUCESSO!');
                form.reset();
                loadEntries();
            } catch (error) {
                alert('Erro ao salvar no Supabase: ' + error.message);
                console.error(error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar Kickoff <i data-lucide="send"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        });
    }

    loadEntries();
    setInterval(loadEntries, 10000);
});
