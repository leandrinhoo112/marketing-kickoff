const SUPABASE_URL = 'https://szscamhegxbywbulptyg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2NhbWhlZ3hieXdidWxwdHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTMzNTYsImV4cCI6MjA5NDIyOTM1Nn0.zDwmCpC3rV_NFQxflD469fDIWrH81_c-rcrLPun7w6M';

const TEAM_MEMBERS = ["LEANDRO", "IGOR", "YASMIM", "KAMILLE", "JOÃO", "EDSON", "LUIZ", "JORGE", "MARIANA", "VANESSA", "BRUNO"];

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

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.style.background = 'transparent';
                b.style.color = '#a0aec0';
                b.classList.remove('active');
            });
            btn.style.background = btn.dataset.target === 'tab-radar' ? '#6841f1' : (btn.dataset.target === 'tab-sucesso' ? '#ffd700' : '#02ceff');
            btn.style.color = btn.dataset.target === 'tab-radar' ? 'white' : '#0f0a1e';
            btn.classList.add('active');

            tabPanes.forEach(pane => {
                pane.style.display = 'none';
            });
            document.getElementById(btn.dataset.target).style.display = 'block';
        });
    });

    // Sucesso Semanal Elements
    const sucessoForm = document.getElementById('sucessoForm');
    const sucessoList = document.getElementById('sucessoList');
    const sucessoUserName = document.getElementById('sucessoUserName');
    let allSucessos = [];
    let editingSucessoId = null;

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
            const password = prompt("Senha do Gestor:");
            if (password === "CampeãoInspirar") {
                adminArea.style.display = 'block';
                updateAdminPanel();
                loadFeedbacks();
                setTimeout(() => {
                    adminArea.scrollIntoView({ behavior: 'smooth' });
                }, 100);
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

        // 5. MAPA DE CARGA DE TRABALHO (SEMANAL)
        const thisWeekEntries = filterByRange(allEntries, 'thisWeek');
        const userStats = {};
        TEAM_MEMBERS.forEach(m => userStats[m] = { tasks: 0, blockers: 0 });

        thisWeekEntries.forEach(e => {
            const uName = decodeUser(e.username).name.toUpperCase();
            if (!userStats[uName]) userStats[uName] = { tasks: 0, blockers: 0 };
            const taskCount = (e.today_tasks || '').split('\n').filter(l => l.trim().length > 0).length || 1;
            userStats[uName].tasks += taskCount;
            const b = (e.blockers || '').toLowerCase().trim();
            if (b !== '' && !['não', 'nao', 'nada', 'n/a', 'no'].includes(b)) {
                userStats[uName].blockers += 1;
            }
        });

        const activeUsers = Object.keys(userStats).filter(u => userStats[u].tasks > 0 || userStats[u].blockers > 0);
        const energyMap = { explodindo: [], limite: [], livre: [] };

        activeUsers.forEach(u => {
            const userLatestEntries = thisWeekEntries.filter(e => decodeUser(e.username).name.toUpperCase() === u).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            if (userLatestEntries.length > 0) {
                const latestEnergy = userLatestEntries[0].energy_level || '';
                if (latestEnergy.includes('Explodindo')) {
                    energyMap.explodindo.push(u);
                } else if (latestEnergy.includes('No limite')) {
                    energyMap.limite.push(u);
                } else if (latestEnergy.includes('Livre')) {
                    energyMap.livre.push(u);
                }
            }
        });

        const renderEnergyList = (arr) => arr.length ? arr.map(name => `<li style="margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px;"><strong>${name}</strong></li>`).join('') : '<li style="opacity: 0.5;">Ninguém.</li>';

        const olList = document.getElementById('overloadedList');
        const limitList = document.getElementById('limitList');
        const llList = document.getElementById('lightloadList');

        if(olList) olList.innerHTML = renderEnergyList(energyMap.explodindo);
        if(limitList) limitList.innerHTML = renderEnergyList(energyMap.limite);
        if(llList) llList.innerHTML = renderEnergyList(energyMap.livre);

        // 6. DETECTOR DE GARGALOS REPETIDOS
        const bottleneckAlertsContainer = document.getElementById('bottleneckAlerts');
        if (bottleneckAlertsContainer) {
            const commonBlockers = {};
            thisWeekEntries.forEach(e => {
                const b = (e.blockers || '').toLowerCase().trim();
                if (b !== '' && !['não', 'nao', 'nada', 'n/a', 'no'].includes(b)) {
                    const keywords = ['aprovação', 'aprovacao', 'cliente', 'criativo', 'ti', 'sistema', 'acesso', 'reunião', 'reuniao', 'briefing', 'pagamento'];
                    keywords.forEach(kw => {
                        if (b.includes(kw)) {
                            commonBlockers[kw] = (commonBlockers[kw] || 0) + 1;
                        }
                    });
                }
            });

            const alertsHTML = [];
            for (const [kw, count] of Object.entries(commonBlockers)) {
                if (count >= 2) {
                    alertsHTML.push(`
                        <div class="glass-card" style="padding: 15px; background: rgba(255, 65, 108, 0.1); border-left: 4px solid #ff416c;">
                            <p style="margin: 0; color: #ff416c;">⚠️ <strong>${kw.toUpperCase()}</strong> está sendo um gargalo recorrente (${count} ocorrências nesta semana).</p>
                        </div>
                    `);
                }
            }

            if (alertsHTML.length > 0) {
                bottleneckAlertsContainer.innerHTML = alertsHTML.join('');
            } else {
                bottleneckAlertsContainer.innerHTML = `
                    <div class="glass-card" style="padding: 15px; background: rgba(2, 206, 255, 0.1); border-left: 4px solid #02ceff;">
                        <p style="margin: 0; color: #02ceff;">✅ Nenhum padrão de gargalo repetido detectado na semana.</p>
                    </div>
                `;
            }
        }

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
                <button onclick="document.getElementById('myReportBtn').click(); setTimeout(() => { document.getElementById('reportUserName').value='${selectedMember}'; document.getElementById('reportUserName').dispatchEvent(new Event('change')); }, 100);" class="btn-primary" style="margin-top: 15px; background: #02ceff; color: #0f0a1e; font-size: 0.85em; padding: 10px; border-radius: 8px; cursor: pointer; border: none; font-weight: bold; width: 100%;">
                    <i data-lucide="file-text"></i> Abrir Relatório Mensal Detalhado
                </button>
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
        if (entry.energy_level) {
            const radio = form.querySelector(`input[name="energyLevel"][value="${entry.energy_level}"]`);
            if (radio) radio.checked = true;
        }
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
        
        const filterFn = (entry, searchFields) => {
            const u = decodeUser(entry.username);
            let matchesSearch = u.name.toLowerCase().includes(searchTerm);
            if (!matchesSearch && searchTerm) {
                matchesSearch = searchFields.some(field => (entry[field] || '').toLowerCase().includes(searchTerm));
            } else if (!searchTerm) {
                matchesSearch = true;
            }
            
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
        };

        const filteredRadar = allEntries.filter(e => filterFn(e, ['today_tasks', 'yesterday_tasks', 'observations']));
        renderEntries(filteredRadar);

        const filteredSucessos = allSucessos.filter(e => filterFn(e, ['victory', 'praise', 'insight']));
        renderSucessos(filteredSucessos);
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
                    ${entry.energy_level ? `<div class="content-block" style="grid-column: 1/-1;"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Nível de Energia</label><p style="font-weight: bold; display: flex; align-items: center; gap: 8px;">${entry.energy_level}</p></div>` : ''}
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
            const energyChecked = form.querySelector('input[name="energyLevel"]:checked');
            const entry = {
                username: `${userNameInput.value}|${userColorInput.value}`,
                yesterday_tasks: document.getElementById('yesterdayTasks').value,
                today_tasks: document.getElementById('todayTasks').value,
                help_needed: document.getElementById('helpNeeded').value,
                who_help: document.getElementById('whoHelp').value,
                blockers: document.getElementById('blockers').value,
                observations: document.getElementById('observations').value,
                energy_level: energyChecked ? energyChecked.value : '😐 Normal',
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

    // SUCESSO SEMANAL LOGIC
    async function loadSucessos() {
        if (!supabaseClient) return;
        try {
            const { data, error } = await supabaseClient.from('sucessos').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (data) { 
                allSucessos = data;
                renderSucessos(data);
            }
        } catch (error) { 
            console.error(error);
        }
    }

    function renderSucessos(entries) {
        if (!entries.length) { 
            sucessoList.innerHTML = '<div class="empty-state"><i data-lucide="star"></i><p>Nenhum sucesso registrado ainda.</p></div>'; 
            if (window.lucide) window.lucide.createIcons();
            return; 
        }

        const praiseCounts = {};
        entries.forEach(e => {
            const praiseText = (e.praise || '').toLowerCase();
            TEAM_MEMBERS.forEach(m => {
                const nameLow = m.toLowerCase();
                const regex = new RegExp(`\\b${nameLow}\\b`, 'g');
                const matches = praiseText.match(regex);
                if (matches) {
                    praiseCounts[m] = (praiseCounts[m] || 0) + matches.length;
                }
            });
        });

        sucessoList.innerHTML = entries.map(entry => {
            const u = decodeUser(entry.username);
            const displayColor = '#ffd700';
            
            const isDestaque = (praiseCounts[u.name.toUpperCase()] >= 3);
            const destaqueBadge = isDestaque ? `<span style="background: linear-gradient(135deg, #ff416c, #ff4b2b); color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.6em; margin-left: 8px; text-transform: uppercase; font-weight: bold; vertical-align: middle;">🔥 Destaque da Semana</span>` : '';

            return `
            <div class="kickoff-item" style="border-left: 4px solid ${displayColor}; margin-bottom: 20px; padding: 25px; background: rgba(255,255,255,0.05); border-radius: 12px; transition: all 0.3s ease;">
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div class="avatar" style="background: ${displayColor}; color: #0f0a1e;">${getInitials(u.name)}</div>
                        <div class="user-info">
                            <h4 style="color: ${displayColor}; font-size: 1.2em; margin: 0; display: flex; align-items: center;">${u.name} ${destaqueBadge}</h4>
                            <span style="opacity: 0.5; font-size: 0.85em;">${new Date(entry.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                    <div class="actions" style="display: flex; gap: 10px;">
                        <button onclick="editSucesso(${entry.id})" class="btn-icon" style="background: none; border: none; color: #a0aec0; cursor: pointer; transition: color 0.3s;" title="Editar"><i data-lucide="edit-2"></i></button>
                        <button onclick="deleteSucesso(${entry.id})" class="btn-icon" style="background: none; border: none; color: #ff416c; cursor: pointer; transition: color 0.3s;" title="Apagar"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
                <div class="item-content" style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    <div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #ffd700;">A Minha Vitória</label><p>🏆 ${entry.victory}</p></div>
                    <div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #ffd700;">Elogio ao Colega</label><p>🏆 ${entry.praise}</p></div>
                    <div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #ffd700;">O que aprendi (Ou quero aprender)</label><p>🏆 ${entry.insight}</p></div>
                    ${entry.monthly_goal_progress ? `<div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #ffd700;">Meta do Mês (Evolução)</label><p>🎯 ${entry.monthly_goal_progress}</p></div>` : ''}
                </div>
            </div>`;
        }).join('');
        if (window.lucide) window.lucide.createIcons();
    }

    if (sucessoForm) {
        sucessoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = sucessoForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            const entry = {
                username: `${sucessoUserName.value}|#ffd700`,
                victory: document.getElementById('sucessoVictory').value,
                praise: document.getElementById('sucessoPraise').value,
                insight: document.getElementById('sucessoInsight').value,
                monthly_goal_progress: document.getElementById('sucessoGoal').value,
                created_at: new Date().toISOString()
            };
            try {
                if (editingSucessoId) {
                    await supabaseClient.from('sucessos').update(entry).eq('id', editingSucessoId);
                    showToast("Sucesso Atualizado!");
                    editingSucessoId = null;
                } else {
                    await supabaseClient.from('sucessos').insert([entry]);
                    successSound.play(); 
                    if (window.confetti) confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#ffd700', '#ffffff', '#6841f1'] });
                    showToast("Sucesso Celebrado! 🎉");
                }
                sucessoForm.reset();
                submitBtn.innerHTML = 'Celebrar Sucesso <i data-lucide="star"></i>'; 
                loadSucessos();
            } catch (error) { 
                showToast('Erro: ' + error.message, 'error'); 
            } finally { 
                submitBtn.disabled = false; 
                if (window.lucide) window.lucide.createIcons(); 
            }
        });
    }

    window.deleteSucesso = async (id) => {
        if (!confirm('Certeza que deseja apagar este sucesso?')) return;
        try {
            await supabaseClient.from('sucessos').delete().eq('id', id);
            showToast("Sucesso apagado!", "error"); loadSucessos();
        } catch (e) { showToast('Erro', 'error'); }
    }

    window.editSucesso = (id) => {
        const entry = allSucessos.find(e => e.id == id);
        if (!entry) return;
        editingSucessoId = id;
        const u = decodeUser(entry.username);
        sucessoUserName.value = u.name;
        document.getElementById('sucessoVictory').value = entry.victory || '';
        document.getElementById('sucessoPraise').value = entry.praise || '';
        document.getElementById('sucessoInsight').value = entry.insight || '';
        
        sucessoForm.scrollIntoView({ behavior: 'smooth' });
        sucessoForm.querySelector('button[type="submit"]').innerHTML = 'Atualizar Sucesso <i data-lucide="refresh-cw"></i>';
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            if (dateFilter.value === 'custom') customDateInput.style.display = 'block';
            else { customDateInput.style.display = 'none'; applyFilters(); }
        });
    }
    if (customDateInput) customDateInput.addEventListener('change', applyFilters);
    loadEntries(); 
    loadSucessos();
    setInterval(() => {
        loadEntries();
        loadSucessos();
    }, 10000);

    // FEEDBACK ANÔNIMO E RELATÓRIO MENSAL
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = feedbackForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            const sobreChecked = feedbackForm.querySelector('input[name="fbSobrecarregado"]:checked');
            
            const entry = {
                desempenho: document.getElementById('fbDesempenho').value,
                melhorar_marketing: document.getElementById('fbMelhorar').value,
                sugestao: document.getElementById('fbSugestao') ? document.getElementById('fbSugestao').value : '',
                sobrecarregado: sobreChecked ? sobreChecked.value : 'Não informado',
                created_at: new Date().toISOString()
            };
            try {
                if (!supabaseClient) throw new Error("Supabase não inicializado.");
                await supabaseClient.from('feedbacks').insert([entry]);
                showToast("Feedback enviado com sucesso! Obrigado.", "success");
                feedbackForm.reset();
                if (window.confetti) confetti({ particleCount: 100, spread: 60, origin: { y: 0.8 }, colors: ['#02ceff', '#ffffff'] });
            } catch (error) { 
                showToast('Erro: A tabela feedbacks foi criada com as colunas certas? (' + error.message + ')', 'error'); 
            } finally { 
                submitBtn.disabled = false; 
            }
        });
    }

    window.loadFeedbacks = async () => {
        if (!supabaseClient) return;
        try {
            const { data, error } = await supabaseClient.from('feedbacks').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            const container = document.getElementById('adminFeedbacksContainer');
            if (data && container) {
                if (data.length === 0) {
                    container.innerHTML = `<div class="glass-card" style="padding: 15px; text-align: center; opacity: 0.5;">Nenhum feedback recebido ainda.</div>`;
                    return;
                }
                container.innerHTML = data.map(fb => `
                    <div class="glass-card" style="padding: 15px; border-left: 4px solid #02ceff; margin-bottom: 15px; background: rgba(2, 206, 255, 0.05); position: relative;">
                        <button onclick="deleteFeedback('${fb.id}')" style="position: absolute; top: 15px; right: 15px; background: rgba(255, 65, 108, 0.1); border: none; color: #ff416c; padding: 5px; border-radius: 5px; cursor: pointer; transition: all 0.3s;" title="Apagar Feedback">
                            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                        <span style="font-size: 0.7em; color: #a0aec0; display: block; margin-bottom: 10px;">Enviado em: ${new Date(fb.created_at).toLocaleDateString('pt-BR')} às ${new Date(fb.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        <div style="margin-bottom: 10px; padding-right: 25px;">
                            <strong style="color: #02ceff; font-size: 0.8em; text-transform: uppercase;">Travando o Desempenho:</strong>
                            <p style="margin: 5px 0 0 0; font-size: 0.9em;">${fb.desempenho || '-'}</p>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <strong style="color: #02ceff; font-size: 0.8em; text-transform: uppercase;">Poderia Melhorar:</strong>
                            <p style="margin: 5px 0 0 0; font-size: 0.9em;">${fb.melhorar_marketing || '-'}</p>
                        </div>
                        ${fb.sugestao ? `
                        <div style="margin-bottom: 10px;">
                            <strong style="color: #ffd700; font-size: 0.8em; text-transform: uppercase;">Sugestão de Solução:</strong>
                            <p style="margin: 5px 0 0 0; font-size: 0.9em;">${fb.sugestao}</p>
                        </div>
                        ` : ''}
                        <div>
                            <strong style="color: #02ceff; font-size: 0.8em; text-transform: uppercase;">Sobrecarregado:</strong>
                            <p style="margin: 5px 0 0 0; font-size: 0.9em;">${fb.sobrecarregado || '-'}</p>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) { console.error(error); }
    };

    window.deleteFeedback = async (id) => {
        if (!confirm('Tem certeza que deseja apagar este feedback permanentemente?')) return;
        try {
            const { error } = await supabaseClient.from('feedbacks').delete().eq('id', id);
            if (error) throw error;
            showToast("Feedback removido!", "error");
            loadFeedbacks();
        } catch (error) {
            showToast('Erro ao remover: ' + error.message, 'error');
        }
    };

    const myReportBtn = document.getElementById('myReportBtn');
    const monthlyReportModal = document.getElementById('monthlyReportModal');
    const closeReportModal = document.getElementById('closeReportModal');
    const reportUserName = document.getElementById('reportUserName');
    const monthlyReportContent = document.getElementById('monthlyReportContent');

    if (myReportBtn) {
        myReportBtn.addEventListener('click', () => {
            monthlyReportModal.style.display = 'flex';
            if (userNameInput && userNameInput.value) {
                reportUserName.value = userNameInput.value;
                reportUserName.dispatchEvent(new Event('change'));
            }
        });
    }

    if (closeReportModal) {
        closeReportModal.addEventListener('click', () => {
            monthlyReportModal.style.display = 'none';
        });
    }

    if (reportUserName) {
        reportUserName.addEventListener('change', () => {
            const selected = reportUserName.value;
            if (!selected) return;
            const now = new Date();
            const monthEntries = allEntries.filter(e => {
                const u = decodeUser(e.username);
                const d = new Date(e.created_at);
                return u.name.toUpperCase() === selected && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });

            if (monthEntries.length === 0) {
                monthlyReportContent.innerHTML = `<p style="opacity: 0.5; text-align: center; padding: 20px;">Nenhuma entrega encontrada para ${selected} neste mês.</p>`;
                return;
            }

            const monthName = now.toLocaleString('pt-BR', { month: 'long' });
            let html = `<h4 style="color: #02ceff; margin-bottom: 15px; text-align: center;">🚀 Entregas de ${selected} em ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h4>`;
            
            // Só pegar o "Ontem" (que é o que foi concluído)
            monthEntries.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).forEach(e => {
                const yt = (e.yesterday_tasks || '').trim();
                if(yt !== '' && yt !== '-' && yt !== 'nada' && yt !== 'nao' && yt !== 'não') {
                    // Como a data do checkin representa o dia do envio, a tarefa concluída ontem se refere ao dia anterior, mas vamos exibir a data do checkin mesmo
                    html += `
                        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-left: 3px solid #02ceff;">
                            <span style="font-size: 0.7em; color: #a0aec0; display: block; margin-bottom: 5px;">Relatado em: ${new Date(e.created_at).toLocaleDateString('pt-BR')}</span>
                            <p style="margin: 0; font-size: 0.9em; white-space: pre-wrap;">${yt}</p>
                        </div>
                    `;
                }
            });

            monthlyReportContent.innerHTML = html;
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === monthlyReportModal) {
            monthlyReportModal.style.display = 'none';
        }
    });

});
