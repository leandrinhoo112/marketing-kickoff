const SUPABASE_URL = 'https://szscamhegxbywbulptyg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2NhbWhlZ3hieXdidWxwdHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTMzNTYsImV4cCI6MjA5NDIyOTM1Nn0.zDwmCpC3rV_NFQxflD469fDIWrH81_c-rcrLPun7w6M';

const TEAM_MEMBERS = ["LEANDRO", "IGOR", "YASMIM", "KAMILLE", "JOÃO", "EDSON", "LUIZ", "JORGE", "VANESSA", "BRUNO"];

let supabaseClient;
try {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) { console.error(e); }

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW fail:', err));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('kickoffForm');
    const kickoffList = document.getElementById('kickoffList');
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');
    const customDateInput = document.getElementById('customDateInput');
    const dateDisplay = document.getElementById('currentDate');
    const copySummaryBtn = document.getElementById('copySummaryBtn');
    const presenceBar = document.getElementById('presenceBar');
    const dynamicGreeting = document.getElementById('dynamicGreeting');
    const userNameInput = document.getElementById('userName');
    const userColorInput = document.getElementById('userColor');

    // Admin Elements
    const adminArea = document.getElementById('adminArea');
    const checkinStatus = document.getElementById('checkinStatus');
    const adminStatParticipation = document.getElementById('adminStatParticipation');
    const adminStatTasks = document.getElementById('adminStatTasks');
    const adminStatBlockers = document.getElementById('adminStatBlockers');
    const adminTimeRange = document.getElementById('adminTimeRange');
    const adminMemberSelect = document.getElementById('adminMemberSelect');
    const adminIndividualCard = document.getElementById('adminIndividualCard');

    const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    successSound.volume = 0.5;

    const statTotal = document.getElementById('statTotal');
    const statHelp = document.getElementById('statHelp');
    const statBlockers = document.getElementById('statBlockers');

    let allEntries = [];
    let editingId = null;
    let userColors = {};

    // CONFIGURAÇÃO INICIAL: FILTRAR POR HOJE POR PADRÃO
    if (dateFilter) dateFilter.value = 'today';

    function showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';
        toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
    }

    // Toggle Admin Panel with Password
    window.toggleAdmin = () => {
        if (adminArea.style.display === 'none') {
            const password = prompt("Por favor, digite a senha de acesso administrativo:");
            if (password === "CampeãoInspirar") {
                adminArea.style.display = 'block';
                adminArea.scrollIntoView({ behavior: 'smooth' });
                updateAdminPanel();
                showToast('Acesso Administrador Liberado', 'success');
            } else if (password !== null) {
                showToast('Senha Incorreta!', 'error');
            }
        } else {
            adminArea.style.display = 'none';
        }
    };

    function filterByRange(entries, range) {
        const now = new Date();
        const todayStr = now.toLocaleDateString('pt-BR');
        
        return entries.filter(e => {
            const entryDateStr = new Date(e.created_at).toLocaleDateString('pt-BR');
            const entryDate = new Date(e.created_at);
            
            if (range === 'today') return entryDateStr === todayStr;
            if (range === 'thisWeek') {
                const lw = new Date(); lw.setDate(now.getDate() - 7);
                return entryDate >= lw;
            }
            if (range === 'thisMonth') {
                return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
    }

    function updateAdminPanel() {
        const range = adminTimeRange.value;
        const filtered = filterByRange(allEntries, range);
        
        // 1. Adesão (Baseado apenas em HOJE para ser realista)
        const todayEntries = filterByRange(allEntries, 'today');
        const namesWhoPostedToday = todayEntries.map(e => decodeUser(e.username).name.toUpperCase());
        const participation = Math.round((namesWhoPostedToday.length / TEAM_MEMBERS.length) * 100);
        adminStatParticipation.innerText = `${participation}%`;

        // 2. Total de Tarefas (Soma aproximada de linhas nos campos hoje/ontem)
        let totalTasks = 0;
        filtered.forEach(e => {
            const count = (str) => (str || '').split('\n').filter(l => l.trim().length > 0).length || 1;
            totalTasks += count(e.today_tasks);
        });
        adminStatTasks.innerText = totalTasks;

        // 3. Impedimentos no período
        const blockersCount = filtered.filter(e => {
            const b = (e.blockers || '').toLowerCase().trim();
            return b !== '' && !['não', 'nao', 'nada', 'n/a', 'no'].includes(b);
        }).length;
        adminStatBlockers.innerText = blockersCount;

        // 4. Status de Check-in (Sempre Hoje)
        checkinStatus.innerHTML = TEAM_MEMBERS.map(member => {
            const hasPosted = namesWhoPostedToday.includes(member);
            return `
                <div style="background: ${hasPosted ? 'rgba(2, 206, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'}; 
                            color: ${hasPosted ? '#02ceff' : 'rgba(255,255,255,0.3)'}; 
                            padding: 8px 12px; border-radius: 8px; border: 1px solid ${hasPosted ? '#02ceff' : 'transparent'};
                            font-size: 0.8em; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                    <i data-lucide="${hasPosted ? 'check-circle' : 'circle'}"></i> ${member}
                </div>
            `;
        }).join('');

        updateIndividualAnalysis();
        if (window.lucide) window.lucide.createIcons();
    }

    function updateIndividualAnalysis() {
        const selectedMember = adminMemberSelect.value;
        if (!selectedMember) { adminIndividualCard.style.display = 'none'; return; }
        
        const memberEntries = allEntries.filter(e => decodeUser(e.username).name.toUpperCase() === selectedMember);
        const lastEntry = memberEntries[0];
        
        adminIndividualCard.style.display = 'block';
        if (memberEntries.length === 0) {
            adminIndividualCard.innerHTML = `<p style="opacity: 0.5;">Nenhum registro encontrado para ${selectedMember}.</p>`;
            return;
        }

        const totalTasks = memberEntries.reduce((acc, e) => acc + (e.today_tasks.split('\n').length || 1), 0);
        const blockersCount = memberEntries.filter(e => e.blockers && e.blockers.trim() !== '').length;

        adminIndividualCard.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Total de Check-ins:</span> <strong>${memberEntries.length}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Estimativa de Entregas:</span> <strong style="color: #02ceff;">${totalTasks} tarefas</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Alertas Gerados:</span> <strong style="color: #ff416c;">${blockersCount} impedimentos</strong>
                </div>
                <div style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                    <label style="font-size: 0.7em; color: var(--text-muted);">ÚLTIMO STATUS (${timeAgo(lastEntry.created_at)}):</label>
                    <p style="font-size: 0.9em; margin-top: 5px;">"${lastEntry.today_tasks.substring(0, 100)}${lastEntry.today_tasks.length > 100 ? '...' : ''}"</p>
                </div>
            </div>
        `;
    }

    if (adminTimeRange) adminTimeRange.addEventListener('change', updateAdminPanel);
    if (adminMemberSelect) adminMemberSelect.addEventListener('change', updateIndividualAnalysis);

    function getInitials(name) { return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(); }

    function decodeUser(fullString) {
        const parts = (fullString || '').split('|');
        return { name: (parts[0] || 'Membro').trim(), color: (parts[1] || '#6841f1').toLowerCase().trim() };
    }

    window.deleteEntry = async (id) => {
        if (!confirm('Deseja remover este radar?')) return;
        try {
            await supabaseClient.from('kickoffs').delete().eq('id', id);
            showToast('Removido!'); loadEntries();
        } catch (e) { showToast('Erro: ' + e.message, 'error'); }
    };

    window.editEntry = (id) => {
        const entry = allEntries.find(e => e.id == id);
        if (!entry) return;
        editingId = id;
        const u = decodeUser(entry.username);
        userNameInput.value = u.name;
        userColorInput.value = u.color;
        document.getElementById('yesterdayTasks').value = entry.yesterday_tasks;
        document.getElementById('todayTasks').value = entry.today_tasks;
        document.getElementById('helpNeeded').value = entry.help_needed || '';
        document.getElementById('whoHelp').value = entry.who_help || '';
        document.getElementById('blockers').value = entry.blockers || '';
        document.getElementById('observations').value = entry.observations || '';
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = 'Atualizar Radar <i data-lucide="save"></i>';
        if (window.lucide) window.lucide.createIcons();
        window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
    };

    function updatePresence(entries) {
        const todayStr = new Date().toLocaleDateString('pt-BR');
        const todayEntries = entries.filter(e => new Date(e.created_at).toLocaleDateString('pt-BR') === todayStr);
        const hour = new Date().getHours();
        let gp = "Bom dia"; if (hour >= 12 && hour < 18) gp = "Boa tarde"; else if (hour >= 18) gp = "Boa noite";
        dynamicGreeting.innerText = todayEntries.length === 0 ? `${gp}, Time! Vamos ser o primeiro? 🚀` : `${gp}! Já somos ${todayEntries.length} ativos hoje! 🔥`;
        const uniqueUsers = []; const seenNames = new Set();
        todayEntries.forEach(e => {
            const u = decodeUser(e.username);
            if (!seenNames.has(u.name.toLowerCase())) { 
                u.color = userColors[u.name] || u.color;
                uniqueUsers.push(u); 
                seenNames.add(u.name.toLowerCase()); 
            }
        });
        presenceBar.innerHTML = uniqueUsers.map(u => `<div class="presence-avatar" title="${u.name}" style="background: ${u.color}">${getInitials(u.name)}</div>`).join('');
    }

    function copyDailySummary() {
        const todayStr = new Date().toLocaleDateString('pt-BR');
        const todayEntries = allEntries.filter(e => new Date(e.created_at).toLocaleDateString('pt-BR') === todayStr);
        if (todayEntries.length === 0) { showToast("Nenhum registro hoje.", "error"); return; }
        let summary = `*🚀 RESUMO DO RADAR DIÁRIO - ${todayStr}*\n\n`;
        todayEntries.forEach(e => {
            const u = decodeUser(e.username);
            summary += `👤 *${u.name}*\n✅ Ontem: ${e.yesterday_tasks}\n🎯 Hoje: ${e.today_tasks}\n`;
            if (e.help_needed) summary += `🆘 Ajuda: ${e.help_needed} (com ${e.who_help || '?'})\n`;
            const blk = (e.blockers || '').toLowerCase();
            if (blk && !['não','nao','nada'].includes(blk)) summary += `⚠️ Impedimento: ${e.blockers}\n`;
            summary += `----------------------------\n`;
        });
        navigator.clipboard.writeText(summary).then(() => showToast("Copiado! 🎉"));
    }

    if (copySummaryBtn) copySummaryBtn.addEventListener('click', copyDailySummary);

    function updateStats(entries) {
        const todayStr = new Date().toLocaleDateString('pt-BR');
        const todayEntries = entries.filter(e => new Date(e.created_at).toLocaleDateString('pt-BR') === todayStr);
        statTotal.innerText = todayEntries.length;
        statHelp.innerText = todayEntries.filter(e => e.help_needed && e.help_needed.trim() !== '').length;
        const bc = todayEntries.filter(e => {
            const b = (e.blockers || '').toLowerCase().trim();
            return b !== '' && !['não', 'nao', 'nada', 'n/a', 'no'].includes(b);
        }).length;
        statBlockers.innerText = bc;
        if (adminArea && adminArea.style.display !== 'none') updateAdminPanel();
    }

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'agora mesmo';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `há ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `há ${hours} h`;
        return new Date(date).toLocaleDateString('pt-BR');
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterType = dateFilter.value;
        const now = new Date();
        const filtered = allEntries.filter(entry => {
            const u = decodeUser(entry.username);
            const matchesSearch = u.name.toLowerCase().includes(searchTerm) || entry.today_tasks.toLowerCase().includes(searchTerm);
            let matchesDate = true;
            const entryDateStr = new Date(entry.created_at).toLocaleDateString('pt-BR');
            const entryDate = new Date(entry.created_at);
            
            if (filterType === 'today') matchesDate = entryDateStr === now.toLocaleDateString('pt-BR');
            else if (filterType === 'yesterday') { const yest = new Date(); yest.setDate(now.getDate() - 1); matchesDate = entryDateStr === yest.toLocaleDateString('pt-BR'); }
            else if (filterType === 'thisWeek') { const lw = new Date(); lw.setDate(now.getDate() - 7); matchesDate = entryDate >= lw; }
            else if (filterType === 'thisMonth') { matchesDate = entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear(); }
            else if (filterType === 'custom' && customDateInput.value) { 
                const customDate = new Date(customDateInput.value + 'T00:00:00').toLocaleDateString('pt-BR');
                matchesDate = entryDateStr === customDate;
            }
            return matchesSearch && matchesDate;
        });
        renderEntries(filtered);
    }

    function renderEntries(entries) {
        if (!entries.length) { kickoffList.innerHTML = '<div class="empty-state"><p>Nada encontrado.</p></div>'; return; }
        kickoffList.innerHTML = entries.map(entry => {
            const u = decodeUser(entry.username);
            const displayColor = userColors[u.name] || u.color;
            const blockersVal = (entry.blockers || '').toLowerCase().trim();
            const hasBlockers = blockersVal !== '' && !['não', 'nao', 'nada', 'n/a', 'no'].includes(blockersVal);
            const needsHelp = entry.help_needed && entry.help_needed.trim() !== '';
            const isUrgent = hasBlockers || needsHelp;
            return `
            <div class="kickoff-item ${isUrgent ? 'urgent-item' : ''}" style="border-left: 4px solid ${isUrgent ? '#ff416c' : displayColor}; margin-bottom: 20px; padding: 25px; background: rgba(255,255,255,0.05); border-radius: 12px; transition: all 0.3s ease;">
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div class="avatar" style="background: ${isUrgent ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)' : displayColor}">${getInitials(u.name)}</div>
                        <div class="user-info">
                            <h4 style="color: ${isUrgent ? '#ff416c' : displayColor}; font-size: 1.2em; margin: 0;">${u.name}</h4>
                            <span style="opacity: 0.5; font-size: 0.85em;">${timeAgo(entry.created_at)}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="item-actions">
                            <button class="action-btn edit" onclick="editEntry('${entry.id}')" title="Editar"><i data-lucide="edit-3"></i></button>
                            <button class="action-btn delete" onclick="deleteEntry('${entry.id}')" title="Remover"><i data-lucide="trash-2"></i></button>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${needsHelp ? '<span class="help-badge" style="background: rgba(2, 206, 255, 0.1); color: #02ceff; padding: 4px 10px; border-radius: 6px; font-size: 0.7em; font-weight: bold;">🆘 Ajuda</span>' : ''}
                            ${hasBlockers ? '<span class="help-badge blocker-badge" style="background: rgba(255, 65, 108, 0.1); color: #ff416c; padding: 4px 10px; border-radius: 6px; font-size: 0.7em; font-weight: bold;">⛔ Impedido</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="item-content" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    <div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Ontem</label><p>${entry.yesterday_tasks || '-'}</p></div>
                    <div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Hoje</label><p>${entry.today_tasks || '-'}</p></div>
                    ${entry.help_needed ? `<div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Ajuda</label><p style="color: #02ceff; font-weight: 500;">${entry.help_needed} ${entry.who_help ? `(${entry.who_help})` : ''}</p></div>` : ''}
                    ${entry.observations ? `<div class="content-block" style="grid-column: 1/-1;"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Obs</label><p>${entry.observations}</p></div>` : ''}
                </div>
            </div>`;
        }).join('');
        if (window.lucide) window.lucide.createIcons();
    }

    async function loadEntries() {
        if (!supabaseClient) {
            showToast('Erro crítico: Supabase não inicializado', 'error');
            return;
        }
        try {
            const { data, error } = await supabaseClient.from('kickoffs').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (data) { 
                allEntries = data; 
                userColors = {};
                data.forEach(entry => {
                    const u = decodeUser(entry.username);
                    if (!userColors[u.name]) userColors[u.name] = u.color;
                });
                updateStats(data); 
                updatePresence(data); 
                applyFilters(); 
            }
        } catch (error) { 
            console.error(error);
            showToast('Erro ao carregar dados: ' + error.message, 'error');
        }
    }

    async function sendTeamsAlert(entry, isUpdate = false) {
        if (!entry.help_needed && !entry.blockers) return;
        const u = decodeUser(entry.username);
        const PROXY_URL = '/api/send-teams'; 
        const message = `${isUpdate ? '🔄 **RADAR ATUALIZADO**' : '🚨 **ALERTA DE RADAR**'}\n\n**Membro:** ${u.name}\n**Ajuda:** ${entry.help_needed || 'Não'}\n**De quem:** ${entry.who_help || 'Alguém'}\n**Impedimentos:** ${entry.blockers || 'Não'}\n\n[Ver no site](${window.location.href})`;
        try { await fetch(PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: message }) }); } catch (e) {}
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            const entry = {
                username: `${userNameInput.value}|${userColorInput.value}`,
                yesterday_tasks: document.getElementById('yesterdayTasks').value,
                today_tasks: document.getElementById('todayTasks').value,
                help_needed: document.getElementById('helpNeeded').value,
                who_help: document.getElementById('whoHelp').value,
                blockers: document.getElementById('blockers').value,
                observations: document.getElementById('observations').value,
                created_at: new Date().toISOString()
            };
            try {
                if (editingId) {
                    await supabaseClient.from('kickoffs').update(entry).eq('id', editingId);
                    showToast("Atualizado!"); await sendTeamsAlert(entry, true);
                    editingId = null;
                } else {
                    await supabaseClient.from('kickoffs').insert([entry]);
                    successSound.play(); if (window.confetti) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                    await sendTeamsAlert(entry); showToast("Enviado!");
                }
                form.reset();
                submitBtn.innerHTML = 'Enviar Radar <i data-lucide="send"></i>'; loadEntries();
            } catch (error) { showToast('Erro: ' + error.message, 'error'); } 
            finally { submitBtn.disabled = false; if (window.lucide) window.lucide.createIcons(); }
        });
    }

    if (userNameInput) {
        userNameInput.addEventListener('change', () => {
            const selectedName = userNameInput.value;
            if (userColors[selectedName]) {
                userColorInput.value = userColors[selectedName];
            }
        });
    }

    if (userColorInput) {
        userColorInput.addEventListener('input', (e) => {
            const selectedName = userNameInput.value;
            if (!selectedName) return;
            userColors[selectedName] = e.target.value;
            updatePresence(allEntries);
            applyFilters();
        });
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            if (dateFilter.value === 'custom') customDateInput.style.display = 'block';
            else { customDateInput.style.display = 'none'; applyFilters(); }
        });
    }
    if (customDateInput) customDateInput.addEventListener('change', applyFilters);
    loadEntries(); setInterval(loadEntries, 10000);
});
