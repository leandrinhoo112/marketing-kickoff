const SUPABASE_URL = 'https://szscamhegxbywbulptyg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2NhbWhlZ3hieXdidWxwdHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTMzNTYsImV4cCI6MjA5NDIyOTM1Nn0.zDwmCpC3rV_NFQxflD469fDIWrH81_c-rcrLPun7w6M';

// Reset temporário para liberar as tentativas de hoje
if (!localStorage.getItem('reset_26_06_2026_v3')) {
    const todayKey = new Date().toLocaleDateString('pt-BR');
    localStorage.removeItem('wordleState_' + todayKey);
    localStorage.removeItem('cacaPalavras_' + todayKey);
    // Também remove chaves antigas (sem data) por segurança
    localStorage.removeItem('wordleState');
    localStorage.removeItem('cacaPalavrasState');
    localStorage.setItem('reset_26_06_2026_v3', 'true');
}

const TEAM_MEMBERS = ["LEANDRO", "IGOR", "YASMIM", "JOÃO", "EDSON", "LUIZ", "JORGE", "MARIANA", "VANESSA", "BRUNO", "VITOR"];

const COPA_TEAMS = [
    "África do Sul", "Alemanha", "Arábia Saudita", "Argélia", "Argentina", "Austrália", "Áustria", "Bélgica", "Bósnia e Herzegovina", "Brasil", "Cabo Verde", "Canadá", "Catar", "Colômbia", "Coreia do Sul", "Costa do Marfim", "Croácia", "Curaçau", "Egito", "Equador", "Escócia", "Espanha", "Estados Unidos", "França", "Gana", "Haiti", "Holanda", "Inglaterra", "Irã", "Iraque", "Japão", "Jordânia", "Marrocos", "México", "Nova Zelândia", "Noruega", "Panamá", "Paraguai", "Portugal", "RD do Congo", "República Tcheca", "Senegal", "Suécia", "Suíça", "Turquia", "Tunísia", "Uruguai", "Uzbequistão"
].sort();

let supabaseClient;
try {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabaseClient = supabaseClient; // Expõe globalmente para o IIFE do minigame
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
    const colorHexDisplay = document.getElementById('colorHexDisplay');

    // Sync color input with hex display
    if (userColorInput && colorHexDisplay) {
        userColorInput.addEventListener('input', () => {
            colorHexDisplay.textContent = userColorInput.value;
        });
    }

    // Funções de Rascunho (Draft)
    function saveRadarDraft() {
        const u = typeof currentUser !== 'undefined' && currentUser ? currentUser : localStorage.getItem('currentUser');
        if (!u) return;
        const formEl = document.getElementById('kickoffForm');
        if (!formEl) return;
        const energyChecked = formEl.querySelector('input[name="energyLevel"]:checked');
        const mentioned = [];
        if (typeof currentHelps !== 'undefined') {
            currentHelps.forEach(h => {
                const matches = h.match(/\(@([^)]+)\)/g);
                if (matches) matches.forEach(m => mentioned.push(m.replace('(@', '').replace(')', '')));
            });
        }
        const checkedHelpers = [...new Set(mentioned)];
        
        const moodChecked = formEl.querySelector('input[name="moodEmoji"]:checked');
        
        const draft = {
            tasks: typeof currentTasks !== 'undefined' ? currentTasks : [],
            helpNeeded: document.getElementById('helpNeeded') ? document.getElementById('helpNeeded').value : '',
            whoHelpCheck: checkedHelpers,
            blockers: document.getElementById('blockers') ? document.getElementById('blockers').value : '',
            energyLevel: energyChecked ? energyChecked.value : null,
            mood: moodChecked ? moodChecked.value : null,
            editingId: typeof editingId !== 'undefined' ? editingId : null
        };
        localStorage.setItem('radarDraft_' + u, JSON.stringify(draft));
    }

    function loadRadarDraft() {
        const u = typeof currentUser !== 'undefined' && currentUser ? currentUser : localStorage.getItem('currentUser');
        if (!u) return;
        const draftStr = localStorage.getItem('radarDraft_' + u);
        if (!draftStr) return;
        
        try {
            const draft = JSON.parse(draftStr);
            if (draft.editingId) {
                if (typeof editingId !== 'undefined') editingId = draft.editingId;
                const formEl = document.getElementById('kickoffForm');
                if (formEl) {
                    const submitBtn = formEl.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerHTML = 'Atualizar Radar <i data-lucide="save"></i>';
                    }
                }
            }
            if (draft.tasks && typeof currentTasks !== 'undefined') {
                currentTasks = draft.tasks;
                // Só renderiza se tiver algo pra não sobrescrever reset inicial atoa
                if (currentTasks.length > 0 && typeof renderTaskBuilder === 'function') renderTaskBuilder();
            }
            if (draft.helpNeeded && document.getElementById('helpNeeded')) {
                document.getElementById('helpNeeded').value = draft.helpNeeded;
                currentHelps = (draft.helpNeeded || '').split('\n').map(h => h.replace(/^• /, '')).filter(h => h.trim() !== '');
                if (typeof renderHelpBuilder === 'function') renderHelpBuilder();
            }
            if (draft.blockers && document.getElementById('blockers')) document.getElementById('blockers').value = draft.blockers;
            if (draft.energyLevel) {
                const formEl = document.getElementById('kickoffForm');
                if (formEl) {
                    const radio = formEl.querySelector(`input[name="energyLevel"][value="${draft.energyLevel}"]`);
                    if (radio) radio.checked = true;
                }
            }
            if (draft.mood) {
                const formEl2 = document.getElementById('kickoffForm');
                if (formEl2) {
                    const mRadio = formEl2.querySelector(`input[name="moodEmoji"][value="${draft.mood}"]`);
                    if (mRadio) {
                        mRadio.checked = true;
                        const label = mRadio.closest('.mood-option');
                        if (label) {
                            label.style.border = '2px solid #f472b6';
                            label.style.background = 'rgba(244, 114, 182, 0.15)';
                            label.style.transform = 'scale(1.15)';
                        }
                    }
                }
            }
        } catch(e) { console.error("Erro ao carregar rascunho", e); }
    }

    function clearRadarDraft() {
        const u = typeof currentUser !== 'undefined' && currentUser ? currentUser : localStorage.getItem('currentUser');
        if (u) localStorage.removeItem('radarDraft_' + u);
    }

    // Task & Help list state
    let currentTasks = [];
    let currentHelps = [];
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskListUI = document.getElementById('taskListUI');
    const todayTasksHidden = document.getElementById('todayTasks');

    const urgentTaskCheck = document.getElementById('urgentTaskCheck');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            if(taskInput.value.trim() !== '') {
                let text = taskInput.value.trim();
                if (urgentTaskCheck && urgentTaskCheck.checked) {
                    text = '🚨 ' + text;
                    currentTasks.unshift(text);
                } else {
                    currentTasks.push(text);
                }
                taskInput.value = '';
                if (urgentTaskCheck) urgentTaskCheck.checked = false;
                renderTaskBuilder();
            }
        });
    }

    window.toggleTaskUrgent = function(index) {
        let task = currentTasks[index];
        currentTasks.splice(index, 1);
        if (task.includes('🚨 ')) {
            task = task.replace('🚨 ', '');
            currentTasks.push(task);
        } else {
            task = '🚨 ' + task;
            currentTasks.unshift(task);
        }
        renderTaskBuilder();
    };

    window.toggleTaskRework = function(index) {
        let task = currentTasks[index];
        if (task.includes('🔄 ')) {
            currentTasks[index] = task.replace('🔄 ', '');
        } else {
            currentTasks[index] = '🔄 ' + task;
        }
        renderTaskBuilder();
    };
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                addTaskBtn.click();
            }
        });
    }
    let draggedTaskIndex = null;

    window.dragTaskStart = function(e, index) {
        draggedTaskIndex = index;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => e.target.style.opacity = '0.4', 0);
    };

    window.dragTaskOver = function(e, index) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedTaskIndex !== null && draggedTaskIndex !== index) {
            const targetItem = e.currentTarget;
            targetItem.style.background = 'rgba(142, 110, 255, 0.2)';
            targetItem.style.transform = 'scale(1.02)';
        }
    };

    window.dragTaskLeave = function(e) {
        const targetItem = e.currentTarget;
        targetItem.style.background = 'rgba(255,255,255,0.05)';
        targetItem.style.transform = 'scale(1)';
    };

    window.dropTask = function(e, targetIndex) {
        e.preventDefault();
        if (draggedTaskIndex !== null && draggedTaskIndex !== targetIndex) {
            const taskToMove = currentTasks.splice(draggedTaskIndex, 1)[0];
            currentTasks.splice(targetIndex, 0, taskToMove);
            renderTaskBuilder();
        } else {
            const targetItem = e.currentTarget;
            targetItem.style.background = 'rgba(255,255,255,0.05)';
            targetItem.style.transform = 'scale(1)';
            targetItem.style.opacity = '1';
        }
        draggedTaskIndex = null;
    };

    function renderTaskBuilder() {
        if (!taskListUI) return;
        taskListUI.innerHTML = currentTasks.map((t, index) => {
            const isDone = t.startsWith('✅ ');
            let isUrgent = t.includes('🚨 ');
            let isRework = t.includes('🔄 ');
            let textStyle = isDone ? 'text-decoration: line-through; opacity: 0.6;' : '';
            if (isUrgent && !isDone) textStyle += 'color: #ff416c; font-weight: bold; ';
            if (isRework && !isDone) textStyle += 'color: #f59e0b; font-style: italic; ';
            const iconName = isDone ? 'check-circle' : 'circle';
            const iconColor = isDone ? '#22c55e' : '#8e6eff';
            return `
            <li draggable="true" 
                ondragstart="dragTaskStart(event, ${index})" 
                ondragover="dragTaskOver(event, ${index})" 
                ondragleave="dragTaskLeave(event)" 
                ondrop="dropTask(event, ${index})"
                style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 8px; cursor: grab; transition: transform 0.2s, background 0.2s;">
                <span style="${textStyle} flex: 1; display: flex; align-items: center;">
                    <i data-lucide="grip-vertical" style="width: 14px; height: 14px; margin-right: 8px; color: rgba(255,255,255,0.3);"></i>
                    <i data-lucide="${iconName}" style="width: 14px; height: 14px; margin-right: 5px; color: ${iconColor};"></i> 
                    ${t}
                </span>
                <div style="display: flex; gap: 8px;">
                    <button type="button" onclick="toggleTaskRework(${index})" style="background: none; border: none; color: ${isRework ? '#f59e0b' : 'rgba(255,255,255,0.4)'}; cursor: pointer;" title="Marcar como Retrabalho"><i data-lucide="refresh-cw" style="width: 16px; height: 16px;"></i></button>
                    <button type="button" onclick="toggleTaskUrgent(${index})" style="background: none; border: none; color: ${isUrgent ? '#ff416c' : 'rgba(255,255,255,0.4)'}; cursor: pointer;" title="Alternar Urgência"><i data-lucide="siren" style="width: 16px; height: 16px;"></i></button>
                    <button type="button" onclick="toggleTaskDone(${index})" style="background: none; border: none; color: #22c55e; cursor: pointer;" title="Concluir Tarefa"><i data-lucide="check" style="width: 16px; height: 16px;"></i></button>
                    <button type="button" onclick="removeTask(${index})" style="background: none; border: none; color: #ff416c; cursor: pointer;" title="Remover Tarefa"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
                </div>
            </li>
            `;
        }).join('');
        if (window.lucide) window.lucide.createIcons();
        todayTasksHidden.value = currentTasks.map(t => `• ${t}`).join('\n');
        if (typeof saveRadarDraft === 'function') saveRadarDraft();
    }
    window.removeTask = function(index) {
        currentTasks.splice(index, 1);
        renderTaskBuilder();
    };

    // Help Builder logic
    const helpInput = document.getElementById('helpInput');
    const addHelpBtn = document.getElementById('addHelpBtn');
    const helpListUI = document.getElementById('helpListUI');
    const helpNeededHidden = document.getElementById('helpNeeded');

    if (addHelpBtn) {
        addHelpBtn.addEventListener('click', () => {
            if(helpInput.value.trim() !== '') {
                let text = helpInput.value.trim();
                const personSelect = document.getElementById('helpPersonSelect');
                if (personSelect && personSelect.value !== '') {
                    text += ` (@${personSelect.value})`;
                }
                currentHelps.push(text);
                helpInput.value = '';
                if (personSelect) personSelect.value = '';
                renderHelpBuilder();
            }
        });
    }

    if (helpInput) {
        helpInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                addHelpBtn.click();
            }
        });
    }

    function renderHelpBuilder() {
        if (!helpListUI) return;
        helpListUI.innerHTML = currentHelps.map((h, index) => {
            return `
            <li draggable="true" 
                ondragstart="dragHelpStart(event, ${index})" 
                ondragover="dragHelpOver(event, ${index})" 
                ondragleave="dragHelpLeave(event)" 
                ondrop="dropHelp(event, ${index})"
                style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 8px; cursor: grab; transition: transform 0.2s, background 0.2s;">
                <span style="flex: 1; display: flex; align-items: center;">
                    <i data-lucide="grip-vertical" style="width: 14px; height: 14px; margin-right: 8px; color: rgba(255,255,255,0.3);"></i>
                    <i data-lucide="help-circle" style="width: 14px; height: 14px; margin-right: 5px; color: #facc15;"></i> 
                    ${h}
                </span>
                <button type="button" onclick="removeHelp(${index})" style="background: none; border: none; color: #ff416c; cursor: pointer;" title="Remover"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
            </li>
            `;
        }).join('');
        if (window.lucide) window.lucide.createIcons();
        helpNeededHidden.value = currentHelps.map(h => `• ${h}`).join('\n');
        if (typeof saveRadarDraft === 'function') saveRadarDraft();
    }
    
    let draggedHelpIndex = null;
    window.dragHelpStart = function(e, index) {
        draggedHelpIndex = index;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => e.target.style.opacity = '0.4', 0);
    };
    window.dragHelpOver = function(e, index) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedHelpIndex !== null && draggedHelpIndex !== index) {
            const targetItem = e.currentTarget;
            targetItem.style.background = 'rgba(142, 110, 255, 0.2)';
            targetItem.style.transform = 'scale(1.02)';
        }
    };
    window.dragHelpLeave = function(e) {
        const targetItem = e.currentTarget;
        targetItem.style.background = 'rgba(255,255,255,0.05)';
        targetItem.style.transform = 'scale(1)';
    };
    window.dropHelp = function(e, targetIndex) {
        e.preventDefault();
        if (draggedHelpIndex !== null && draggedHelpIndex !== targetIndex) {
            const helpToMove = currentHelps.splice(draggedHelpIndex, 1)[0];
            currentHelps.splice(targetIndex, 0, helpToMove);
            renderHelpBuilder();
        } else {
            const targetItem = e.currentTarget;
            targetItem.style.background = 'rgba(255,255,255,0.05)';
            targetItem.style.transform = 'scale(1)';
            targetItem.style.opacity = '1';
        }
        draggedHelpIndex = null;
    };
    
    window.removeHelp = function(index) {
        currentHelps.splice(index, 1);
        renderHelpBuilder();
    };

    window.playSatisfyingCheckSound = function() {
        try {
            const audio = new Audio('0709.MP3');
            audio.volume = 0.5; // Ajuste de volume se necessário
            audio.play().catch(e => console.error("Audio error", e));
        } catch(e) { console.error("Audio error", e); }
    };

    window.playEditarSound = function() {
        try {
            const audio = new Audio('EDITAR.MP3');
            audio.volume = 0.6;
            audio.play().catch(e => console.error("Audio error", e));
        } catch(e) { console.error("Audio error", e); }
    };

    window.toggleTaskDone = function(index) {
        if (currentTasks[index].startsWith('✅ ')) {
            currentTasks[index] = currentTasks[index].replace('✅ ', '');
        } else {
            currentTasks[index] = '✅ ' + currentTasks[index];
            window.playSatisfyingCheckSound(); // Toca o som ao marcar
        }
        renderTaskBuilder();
    };

    // Tabs
    let latestNovidadeId = null;
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.style.background = 'transparent';
                b.style.color = '#a0aec0';
                b.classList.remove('active');
            });
            let activeBg = '#02ceff';
            if (btn.dataset.target === 'tab-radar') activeBg = '#6841f1';
            else if (btn.dataset.target === 'tab-sucesso') activeBg = '#ffd700';
            else if (btn.dataset.target === 'tab-minigame') activeBg = '#ff416c';
            else if (btn.dataset.target === 'tab-bolao') activeBg = '#22c55e';
            else if (btn.dataset.target === 'tab-enquetes') activeBg = '#8e6eff';
            
            btn.style.background = activeBg;
            btn.style.color = (btn.dataset.target === 'tab-radar' || btn.dataset.target === 'tab-minigame' || btn.dataset.target === 'tab-enquetes') ? 'white' : '#0f0a1e';
            btn.classList.add('active');

            tabPanes.forEach(pane => {
                pane.style.display = 'none';
            });
            document.getElementById(btn.dataset.target).style.display = 'block';

            // Se o usuário clicar na aba de Novidades, marcar como visto e remover a notificação
            if (btn.dataset.target === 'tab-novidades' && latestNovidadeId) {
                const _d = new Date();
                const _key = 'novidadeNotified_' + latestNovidadeId + '_' + _d.getFullYear() + '-' + (_d.getMonth()+1) + '-' + _d.getDate();
                localStorage.setItem(_key, 'true');
                const toastContainer = document.querySelector('.toast-container');
                if (toastContainer) {
                    const toasts = toastContainer.querySelectorAll('.toast');
                    toasts.forEach(toast => {
                        if (toast.textContent.includes("Tem atualização nova na plataforma!")) {
                            toast.remove();
                        }
                    });
                }
            }
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
    const xaropinhoSound = new Audio('vinheta-xaropinho-rapaz-cut-mp3.mp3');
    xaropinhoSound.volume = 0.8;
    const tomeSound = new Audio('tome-rodrigo-faro_xDXKGwq.mp3');
    tomeSound.volume = 0.8;
    const uiiiSound = new Audio('uiiiii.mp3');
    uiiiSound.volume = 0.8;
    const olhaSoSound = new Audio('olha-so-olha-la.mp3');
    olhaSoSound.volume = 0.8;
    const startSound = new Audio();
    startSound.volume = 0.8;
    let hasPlayedStartSound = false;

    // Função para tocar o áudio correto de início
    function playStartSoundForUser(userName) {
        const d = new Date();
        const todayKey = 'startSound_' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        if (localStorage.getItem(todayKey)) return;
        localStorage.setItem(todayKey, 'true');
        
        if (hasPlayedStartSound) return;
        hasPlayedStartSound = true;
        
        if (userName && userName.toUpperCase() === 'VANESSA') {
            startSound.src = 'boas vindas vanessa.wav';
        } else {
            startSound.src = 'audio inicio.wav';
        }
        
        startSound.play().catch(() => {
            document.body.addEventListener('click', () => {
                startSound.play().catch(() => {});
            }, { once: true });
        });
    }

    // --- BRINCADEIRA DO TELEFONE FUJÃO ---
    const runawayPhone = document.createElement('div');
    runawayPhone.innerHTML = '📞';
    runawayPhone.style.cssText = 'position: fixed; font-size: 60px; cursor: pointer; z-index: 9999; transition: left 0.25s ease-out, top 0.25s ease-out, transform 0.25s ease-out; user-select: none; top: 80px; left: 80px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));';
    document.body.appendChild(runawayPhone);

    // Usar base64 embutido no phone_audio.js para evitar problemas de extensão/case na Vercel
    const telefone1Sound = new Audio(typeof TELEFONE1_B64 !== 'undefined' ? TELEFONE1_B64 : 'telefone1.mp3');
    telefone1Sound.volume = 0.8;
    const telefone2Sound = new Audio(typeof TELEFONE2_B64 !== 'undefined' ? TELEFONE2_B64 : 'telefone2.mp3');
    telefone2Sound.volume = 1.0;

    let phoneCaught = false;
    let phoneActivated = false; // Garante que o áudio seja liberado num clique real
    let escapeTimeout = null;

    runawayPhone.addEventListener('mouseover', () => {
        if (!phoneActivated || phoneCaught) return; // Só foge DEPOIS que for ativado com um clique inicial
        
        // Toca audio 1
        telefone1Sound.currentTime = 0;
        telefone1Sound.play().catch(() => {});
        
        // Foge com um pequeno atraso para dar chance de clicar
        clearTimeout(escapeTimeout);
        escapeTimeout = setTimeout(() => {
            if (phoneCaught) return;
            
            const maxX = window.innerWidth - 100;
            const maxY = window.innerHeight - 100;
            const newX = Math.max(20, Math.random() * maxX);
            const newY = Math.max(20, Math.random() * maxY);
            
            runawayPhone.style.left = `${newX}px`;
            runawayPhone.style.top = `${newY}px`;
            runawayPhone.style.transform = `rotate(${Math.random() * 360}deg)`;
        }, 70); 
    });

    runawayPhone.addEventListener('click', () => {
        // Primeiro clique: Ativa o modo fujão e foge a primeira vez
        if (!phoneActivated) {
            phoneActivated = true;
            telefone1Sound.currentTime = 0;
            telefone1Sound.play().catch(() => {});
            
            // Foge imediatamente para mostrar que começou
            const maxX = window.innerWidth - 100;
            const maxY = window.innerHeight - 100;
            runawayPhone.style.left = `${Math.max(20, Math.random() * maxX)}px`;
            runawayPhone.style.top = `${Math.max(20, Math.random() * maxY)}px`;
            runawayPhone.style.transform = `rotate(${Math.random() * 360}deg)`;
            return;
        }

        // Cliques subsequentes (se conseguir): Captura o telefone
        if (phoneCaught) return;
        phoneCaught = true;
        clearTimeout(escapeTimeout);
        
        // Para o audio 1 e toca o 2
        telefone1Sound.pause();
        telefone2Sound.play().catch(() => {});
        
        // Efeito visual de capturado
        runawayPhone.style.transform = 'rotate(0deg) scale(1.3)';
        runawayPhone.style.filter = 'drop-shadow(0 0 20px #22c55e)';
        
        // --- CONQUISTA ---
        localStorage.setItem('phoneHunter', 'true');
        
        if (window.confetti) {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, zIndex: 10000 });
        }
        if (typeof showToast === 'function') {
            showToast("🏆 Conquista Desbloqueada: Caçador de Telefones!", "success");
        }
        
        if (typeof calculateXP === 'function') {
            calculateXP();
        }
        
        const currentUser = localStorage.getItem('radarMarketingUser');
        if (currentUser && typeof applyCurrentUser === 'function') {
            const btn = document.getElementById('submitBtn');
            if (btn) loadEntries(); 
        }
        // -----------------

        // Depois de 6 segundos, ele volta a fugir (mas já ativado)
        setTimeout(() => {
            phoneCaught = false;
            runawayPhone.style.transform = 'rotate(0deg) scale(1)';
            runawayPhone.style.filter = 'drop-shadow(0 0 10px rgba(255,255,255,0.5))';
        }, 6000);
    });
    // --- FIM BRINCADEIRA DO TELEFONE ---

    // --- BRINCADEIRA DA BOLA FUJONA ---
    const runawayBall = document.createElement('div');
    runawayBall.innerHTML = '⚽';
    runawayBall.style.cssText = 'position: fixed; font-size: 60px; cursor: pointer; z-index: 9999; transition: left 0.25s ease-out, top 0.25s ease-out, transform 0.25s ease-out; user-select: none; top: 180px; left: 180px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));';
    document.body.appendChild(runawayBall);

    const oleSound = new Audio('ole.MP3');
    oleSound.volume = 0.8;
    const recuperouSound = new Audio('recuperou.MP3');
    recuperouSound.volume = 1.0;

    let ballCaught = false;
    let ballActivated = false;
    let ballEscapeTimeout = null;

    runawayBall.addEventListener('mouseover', () => {
        if (!ballActivated || ballCaught) return;
        
        oleSound.currentTime = 0;
        oleSound.play().catch(() => {});
        
        clearTimeout(ballEscapeTimeout);
        ballEscapeTimeout = setTimeout(() => {
            if (ballCaught) return;
            
            const maxX = window.innerWidth - 100;
            const maxY = window.innerHeight - 100;
            const newX = Math.max(20, Math.random() * maxX);
            const newY = Math.max(20, Math.random() * maxY);
            
            runawayBall.style.left = `${newX}px`;
            runawayBall.style.top = `${newY}px`;
            runawayBall.style.transform = `rotate(${Math.random() * 360}deg)`;
        }, 80); 
    });

    runawayBall.addEventListener('click', () => {
        if (!ballActivated) {
            ballActivated = true;
            oleSound.currentTime = 0;
            oleSound.play().catch(() => {});
            
            const maxX = window.innerWidth - 100;
            const maxY = window.innerHeight - 100;
            runawayBall.style.left = `${Math.max(20, Math.random() * maxX)}px`;
            runawayBall.style.top = `${Math.max(20, Math.random() * maxY)}px`;
            runawayBall.style.transform = `rotate(${Math.random() * 360}deg)`;
            return;
        }

        if (ballCaught) return;
        ballCaught = true;
        clearTimeout(ballEscapeTimeout);
        
        oleSound.pause();
        recuperouSound.currentTime = 0;
        recuperouSound.play().catch(() => {});
        
        runawayBall.style.transform = 'rotate(0deg) scale(1.3)';
        runawayBall.style.filter = 'drop-shadow(0 0 20px #22c55e)';
        
        localStorage.setItem('ballHunter', 'true');
        
        if (window.confetti) {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, zIndex: 10000 });
        }
        if (typeof showToast === 'function') {
            showToast("⚽ Você recuperou a bola fujona! Olé!", "success");
        }
        
        if (typeof calculateXP === 'function') {
            calculateXP();
        }
        
        setTimeout(() => {
            ballCaught = false;
            runawayBall.style.transform = 'rotate(0deg) scale(1)';
            runawayBall.style.filter = 'drop-shadow(0 0 10px rgba(255,255,255,0.5))';
        }, 6000);
    });
    // --- FIM BRINCADEIRA DA BOLA FUJONA ---

    function playNameSound(nameStr) {
        if (!nameStr) return;
        // Pega só o primeiro nome e limpa acentos (ex: JOÃO -> JOAO)
        const firstName = nameStr.split(' ')[0].toUpperCase();
        const normalized = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const validNames = ['BRUNO', 'EDSON', 'IGOR', 'JOAO', 'JORGE', 'LEANDRO', 'LUIZ', 'MARIANA', 'VANESSA', 'VITOR', 'YASMIM'];
        
        if (validNames.includes(normalized)) {
            const sound = new Audio(`${normalized}.wav`);
            sound.volume = 0.8;
            sound.play().catch(e => console.log('Erro ao tocar som:', e));
        }
    }

    const statTotal = document.getElementById('statTotal');
    const statHelp = document.getElementById('statHelp');
    const statBlockers = document.getElementById('statBlockers');

    // Easter Egg Logo Audios
    const headerLogo = document.getElementById('headerLogo');
    let logoAudioIndex = 1;
    const maxLogoAudios = 6;
    
    if (headerLogo) {
        headerLogo.addEventListener('click', () => {
            const secretSound = new Audio(`logo audio${logoAudioIndex}.wav`);
            secretSound.volume = 0.8;
            secretSound.play().catch(e => console.log('Erro no easter egg:', e));
            
            // Incrementa o índice pra tocar o próximo no próximo clique
            logoAudioIndex++;
            if (logoAudioIndex > maxLogoAudios) {
                logoAudioIndex = 1; // Reseta pro primeiro se passar do limite
            }
            
            // Efeito visual maroto no clique
            headerLogo.style.transform = 'scale(0.9)';
            setTimeout(() => headerLogo.style.transform = 'scale(1)', 100);
        });
    }

    let allEntries = [];
    let editingId = null;
    let userColors = {};

    // CONFIGURAÇÃO INICIAL: FILTRAR POR HOJE POR PADRÃO
    if (dateFilter) dateFilter.value = 'today';

    // LOGIN & SESSÃO (Boas-vindas)
    const welcomeModal = document.getElementById('welcomeModal');
    const loginName = document.getElementById('loginName');
    const enterAppBtn = document.getElementById('enterAppBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileNameDisplay = document.getElementById('profileNameDisplay');
    
    let currentUser = null; // Modificado para sempre mostrar o modal de login

    if (welcomeModal) {
        welcomeModal.style.display = 'flex';
    }

    if (loginName) {
        // name sound removed on login
    }

    // Tocar som também quando marcar a caixinha de "quem precisa de ajuda"
    const helpPersonSelectElement = document.getElementById('helpPersonSelect');
    if (helpPersonSelectElement) {
        helpPersonSelectElement.addEventListener('change', (e) => {
            if (e.target.value !== '') playNameSound(e.target.value);
        });
    }

    if (enterAppBtn) {
        enterAppBtn.addEventListener('click', () => {
            if (!loginName.value) {
                alert('Por favor, selecione quem é você antes de entrar!');
                return;
            }
            currentUser = loginName.value;
            localStorage.setItem('currentUser', currentUser);
            applyCurrentUser();
            welcomeModal.style.display = 'none';
            calculateXP(); // Recalcular ao entrar
            // Dispara o aviso do Bolão imediatamente ao entrar
            if (typeof window.initBolao === 'function') window.initBolao();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            location.reload();
        });
    }

    function applyCurrentUser() {
        if (userNameInput) userNameInput.value = currentUser;
        if (sucessoUserName) sucessoUserName.value = currentUser;
        if (profileNameDisplay) profileNameDisplay.innerText = currentUser;
        
        // Puxa a cor do usuário: prioriza preferência salva no localStorage
        const savedColorPref = localStorage.getItem(`userColorPref_${currentUser}`);
        if (savedColorPref) {
            userColors[currentUser] = savedColorPref;
            if (userColorInput) userColorInput.value = savedColorPref;
        } else if (userColors[currentUser] && userColorInput) {
            userColorInput.value = userColors[currentUser];
        }
        
        checkPreviousDayTasks();
        
        if (typeof loadRadarDraft === 'function') loadRadarDraft();
        
        // Tocar o som de início agora que sabemos quem é o usuário
        if (typeof playStartSoundForUser === 'function') {
            playStartSoundForUser(currentUser);
        }
        if (typeof window.loadSymplaEvents === 'function') {
            window.loadSymplaEvents();
        }
    }

    let previousTasksData = null; // Store radar entry to edit later

    function checkPreviousDayTasks() {
        if (!currentUser) return;
        
        const norm = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";
        const currentUserNorm = norm(currentUser);
        
        const myCheckins = allEntries.filter(e => norm(decodeUser(e.username).name) === currentUserNorm);
        if (!myCheckins.length) return;

        const todayStr = new Date().toLocaleDateString('pt-BR');
        // Pega o último checkin que não seja de hoje
        const pastCheckins = myCheckins.filter(e => new Date(e.created_at).toLocaleDateString('pt-BR') !== todayStr);
        if (!pastCheckins.length) return;

        const lastRadar = pastCheckins[0]; // já ordenado DESC por created_at
        const allTasks = (lastRadar.today_tasks || '').split('\n').map(t => t.trim()).filter(t => t);
        const pendingTasks = allTasks.filter(t => !t.includes('✅'));

        // Se tem pendentes e ainda não exibiu nesta sessão
        if (pendingTasks.length > 0 && !sessionStorage.getItem(`previousTasksShown_${lastRadar.id}`)) {
            previousTasksData = { radar: lastRadar, pending: pendingTasks, all: allTasks };
            
            const listEl = document.getElementById('previousTasksList');
            if (listEl) {
                listEl.innerHTML = pendingTasks.map((t, idx) => `
                    <div style="display:flex; align-items: flex-start; gap:8px; margin-bottom:12px;">
                        <input type="checkbox" id="prevTask_${idx}" onchange="if(this.checked) window.playSatisfyingCheckSound && window.playSatisfyingCheckSound()" style="width:16px; height:16px; accent-color:#22c55e; cursor:pointer; margin-top:2px;">
                        <label for="prevTask_${idx}" style="cursor:pointer; flex:1;">${t}</label>
                    </div>
                `).join('');
                if (window.lucide) window.lucide.createIcons();
            }

            const modal = document.getElementById('previousTasksModal');
            if (modal) modal.style.display = 'flex';
            
            sessionStorage.setItem(`previousTasksShown_${lastRadar.id}`, 'true');
        }
    }

    // Modal de Tarefas Anteriores - Eventos
    const prevTasksModal = document.getElementById('previousTasksModal');
    
    document.getElementById('btnIgnorePreviousTasks')?.addEventListener('click', () => {
        if (prevTasksModal) prevTasksModal.style.display = 'none';
        previousTasksData = null;
    });

    document.getElementById('btnPassToTodayTasks')?.addEventListener('click', () => {
        if (prevTasksModal) prevTasksModal.style.display = 'none';
        if (!previousTasksData) return;
        
        // Joga as que NÃO foram marcadas para a lista atual
        previousTasksData.pending.forEach((t, idx) => {
            const checkbox = document.getElementById(`prevTask_${idx}`);
            if (!checkbox || !checkbox.checked) {
                currentTasks.push(t);
            }
        });
        renderTaskBuilder();
        
        showToast("Tarefas pendentes passadas para hoje!");
        previousTasksData = null;
    });

    document.getElementById('btnCompleteSelectedTasks')?.addEventListener('click', async () => {
        if (!previousTasksData || !supabaseClient) return;
        
        const btn = document.getElementById('btnCompleteSelectedTasks');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = 'Atualizando...';
        btn.disabled = true;

        try {
            // Quais foram marcadas no modal?
            const checkedIndexes = new Set();
            previousTasksData.pending.forEach((t, idx) => {
                const checkbox = document.getElementById(`prevTask_${idx}`);
                if (checkbox && checkbox.checked) {
                    checkedIndexes.add(idx);
                }
            });

            if (checkedIndexes.size === 0) {
                showToast("Selecione pelo menos uma tarefa!", "error");
                btn.innerHTML = originalHtml;
                btn.disabled = false;
                return;
            }

            let pendingCount = 0;
            const newTasksText = previousTasksData.all.map(t => {
                if (!t.includes('✅')) {
                    if (checkedIndexes.has(pendingCount)) {
                        pendingCount++;
                        return '✅ ' + t;
                    }
                    pendingCount++;
                }
                return t;
            }).join('\n');

            const entryToUpdate = { ...previousTasksData.radar, today_tasks: newTasksText };
            
            const { error } = await supabaseClient.from('kickoffs').update(entryToUpdate).eq('id', previousTasksData.radar.id);
            if (error) throw error;
            
            showToast("Radar anterior atualizado com as concluídas!", "success");
            loadEntries(); // recarrega o feed
            
            // Remove the checked ones from the modal list visually so they can pass the rest if they want
            previousTasksData.all = newTasksText.split('\n').map(t => t.trim()).filter(t => t);
            previousTasksData.pending = previousTasksData.all.filter(t => !t.includes('✅'));
            
            if (previousTasksData.pending.length === 0) {
                if (prevTasksModal) prevTasksModal.style.display = 'none';
                previousTasksData = null;
            } else {
                // Re-render the remaining tasks in the modal
                const listEl = document.getElementById('previousTasksList');
                if (listEl) {
                    listEl.innerHTML = previousTasksData.pending.map((t, idx) => `
                        <div style="display:flex; align-items: flex-start; gap:8px; margin-bottom:12px;">
                            <input type="checkbox" id="prevTask_${idx}" onchange="if(this.checked) window.playSatisfyingCheckSound && window.playSatisfyingCheckSound()" style="width:16px; height:16px; accent-color:#22c55e; cursor:pointer; margin-top:2px;">
                            <label for="prevTask_${idx}" style="cursor:pointer; flex:1;">${t}</label>
                        </div>
                    `).join('');
                }
            }
        } catch (e) {
            console.error(e);
            showToast("Erro ao atualizar o radar passado.", "error");
        } finally {
            if (btn) {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        }
    });

    // Gamificação (Cálculo de XP)
    async function calculateXP() {
        const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
        if (!currentUser || allEntries.length === 0) return;
        
        let xp = 0;
        
        const norm = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";
        const currentUserNorm = norm(currentUser);

        // +10 XP por cada Check-in (Radar)
        const myCheckins = allEntries.filter(e => norm(decodeUser(e.username).name) === currentUserNorm);
        xp += myCheckins.length * 10;

        // +30 XP por cada Elogio Recebido no Sucesso Semanal
        const myPraises = allSucessos.filter(e => {
            const praiseText = norm(e.praise || '');
            return praiseText.includes(currentUserNorm);
        });
        xp += myPraises.length * 30;

        const userXpDisplay = document.getElementById('userXpDisplay');
        if (userXpDisplay) userXpDisplay.innerText = xp;

        let vacationDates = [];
        try {
            const { data: vacData } = await window.supabaseClient
                .from('sugestoes')
                .select('*')
                .eq('username', currentUser)
                .like('sugestao', 'VACATION:%');
            
            if (vacData) {
                window.myVacations = vacData.map(item => {
                    try {
                        const range = JSON.parse(item.sugestao.replace('VACATION:', ''));
                        range.id = item.id;
                        return range;
                    } catch(e) { return null; }
                }).filter(r => r !== null);

                window.myVacations.forEach(range => {
                    let current = new Date(range.start + 'T00:00:00');
                    const end = new Date(range.end + 'T23:59:59');
                    while (current <= end) {
                        vacationDates.push(current.toLocaleDateString('en-CA'));
                        current.setDate(current.getDate() + 1);
                    }
                });
            }
        } catch (e) {
            console.error("Erro ao carregar férias:", e);
        }

        if (typeof window.renderVacationsList === 'function') {
            window.renderVacationsList();
        }

        const streak = calculateStreak(myCheckins, vacationDates);
        
        const streakBadge = document.getElementById('streakBadge');
        const streakCountDisplay = document.getElementById('streakCountDisplay');
        if (streakBadge && streak > 0) {
            streakBadge.style.display = 'flex';
            streakCountDisplay.innerText = `${streak} Dias de Ofensiva`;
        } else if (streakBadge) {
            streakBadge.style.display = 'none';
        }

        window.currentStats = { checkins: myCheckins.length, praises: myPraises.length, xp: xp };
        renderAchievements(myCheckins.length, myPraises.length, xp);

        // Efeito Dopaminoso (Mostrar apenas 1x por sessão)
        if (streak > 0 && !sessionStorage.getItem('streakShown')) {
            showStreakPopup(streak);
            sessionStorage.setItem('streakShown', 'true');
        }
    }
    window.calculateXP = calculateXP;

    function calculateStreak(myCheckins, vacationDates = []) {
        if (!myCheckins.length) return 0;
        
        const checkinDates = [...new Set(myCheckins.map(e => {
            const d = new Date(e.created_at);
            return d.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD local
        }))].sort().reverse();
        
        let streak = 0;
        let dateToCheck = new Date();
        const toDateStr = (d) => d.toLocaleDateString('en-CA');
        const todayStr = toDateStr(new Date());

        // 1. Pula dias iniciais (incluindo hoje) protegidos por fim de semana ou férias sem check-in
        while (true) {
            const dateStr = toDateStr(dateToCheck);
            const dayOfWeek = dateToCheck.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isVacation = vacationDates.includes(dateStr);
            
            if (checkinDates.includes(dateStr)) {
                break;
            }
            if (isWeekend || isVacation) {
                dateToCheck.setDate(dateToCheck.getDate() - 1);
            } else {
                break;
            }
        }

        // 2. Verifica o ponto de partida
        const startStr = toDateStr(dateToCheck);
        if (checkinDates.includes(startStr)) {
            streak++;
            dateToCheck.setDate(dateToCheck.getDate() - 1);
        } else {
            // Se hoje o usuário não fez check-in, mas hoje é o ponto de partida útil, começa a contar de ontem
            if (startStr === todayStr) {
                dateToCheck.setDate(dateToCheck.getDate() - 1);
            } else {
                return 0; // Quebrou ontem ou antes
            }
        }

        // 3. Conta os dias anteriores consecutivos
        while (true) {
            const dateStr = toDateStr(dateToCheck);
            const dayOfWeek = dateToCheck.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isVacation = vacationDates.includes(dateStr);

            if (checkinDates.includes(dateStr)) {
                streak++;
                dateToCheck.setDate(dateToCheck.getDate() - 1);
            } else if (isWeekend || isVacation) {
                dateToCheck.setDate(dateToCheck.getDate() - 1); // Pula dias protegidos
            } else {
                break; // Quebrou
            }
        }
        return streak;
    }

    window.showStreakPopup = function(streak) {
        const popup = document.getElementById('streakPopup');
        const content = document.getElementById('streakPopupContent');
        const number = document.getElementById('streakPopupNumber');
        if (!popup) return;

        popup.style.display = 'flex';
        number.innerText = streak;
        
        setTimeout(() => {
            content.style.transform = 'scale(1)';
            number.style.opacity = '1';
        }, 10);

        if (window.confetti) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6841f1', '#ff5470', '#00e676', '#fdd835']
            });
        }

        // Esconde depois de 4 segundos para a pessoa aproveitar a glória
        setTimeout(() => {
            content.style.transform = 'scale(0.8)';
            content.style.opacity = '0';
            setTimeout(() => {
                popup.style.display = 'none';
                content.style.opacity = '1';
                content.style.transform = 'scale(1)';
            }, 300);
        }, 4000);
    };

    window.updateMinigameAchievements = function(game) {
        localStorage.setItem(`achv_${game}`, 'true');
        if (window.currentStats) {
            renderAchievements(window.currentStats.checkins, window.currentStats.praises, window.currentStats.xp);
        }
    };

    function renderAchievements(checkinsCount, praisesCount, totalXp) {
        const achievements = [
            { id: 'primeiros_passos', title: 'Primeiros Passos', desc: '1º check-in realizado', icon: '🚀', condition: checkinsCount >= 1 },
            { id: 'em_chamas', title: 'Em Chamas', desc: '5 check-ins (Consistência)', icon: '🔥', condition: checkinsCount >= 5 },
            { id: 'mente_brilhante', title: 'Mente Brilhante', desc: 'Citado 3x em Elogios', icon: '💡', condition: praisesCount >= 3 },
            { id: 'coluna_time', title: 'Coluna do Time', desc: 'Citado 10x em Elogios', icon: '🤝', condition: praisesCount >= 10 },
            { id: 'veterano', title: 'Veterano', desc: 'Alcançou 500 XP', icon: '🏅', condition: totalXp >= 500 },
            { id: 'phone_hunter', title: 'Caçador de Telefones', desc: 'Pegou o telefone fujão', icon: '📞', condition: localStorage.getItem('phoneHunter') === 'true' },
            { id: 'ball_hunter', title: 'Craque do Drible', desc: 'Pegou a bola fujona', icon: '⚽', condition: localStorage.getItem('ballHunter') === 'true' },
            { id: 'termo_master', title: 'Sabe-Tudo', desc: 'Jogou o Termo diário', icon: '🧠', condition: localStorage.getItem('achv_termo') === 'true' },
            { id: 'caca_palavras', title: 'Olho de Águia', desc: 'Jogou o Caça-Palavras', icon: '🦅', condition: localStorage.getItem('achv_caca') === 'true' },
            { id: 'pe_na_areia', title: 'Pé na Areia', desc: 'Programou férias (Streak Protect)', icon: '🌴', condition: (window.myVacations && window.myVacations.length > 0) }
        ];

        const list = document.getElementById('achievementsList');
        if (!list) return;

        list.innerHTML = achievements.map(ach => `
            <div class="achievement-badge ${ach.condition ? 'unlocked' : ''}">
                <div class="achievement-icon">${ach.condition ? ach.icon : '🔒'}</div>
                <div>
                    <div class="achievement-title">${ach.condition ? ach.title : 'Secreto'}</div>
                    <div class="achievement-desc">${ach.condition ? ach.desc : 'Continue no app...'}</div>
                </div>
            </div>
        `).join('');
    }

    function showToast(message, type = 'success', duration = 4000, onClose = null) {
        window.showToast = showToast;
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';
        
        if (duration === 0) {
            toast.innerHTML = `<i data-lucide="${icon}"></i> <span style="flex:1;">${message}</span> <button class="toast-close-btn" style="background:transparent;border:none;color:inherit;cursor:pointer;opacity:0.7;"><i data-lucide="x" style="width:16px;height:16px;"></i></button>`;
            const closeBtn = toast.querySelector('.toast-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    toast.remove();
                    if (typeof onClose === 'function') onClose();
                });
            }
        } else {
            toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
        }

        container.appendChild(toast);
        if (window.lucide) window.lucide.createIcons();
        
        if (duration > 0) {
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, duration);
        }
    }

    // Toggle Admin Panel with Password
    window.toggleAdmin = () => {
        if (adminArea.style.display === 'none') {
            const password = prompt("Senha do Gestor:");
            if (password === "CampeãoInspirar") {
                adminArea.style.display = 'block';
                updateAdminPanel();
                loadFeedbacks();
                if (typeof loadAdminSugestoes === 'function') loadAdminSugestoes();
                if (typeof loadAdminNovidades === 'function') loadAdminNovidades();
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

        // 7. ATUALIZAR GRÁFICO DE ENERGIA (CHART.JS)
        const ctx = document.getElementById('energyChart');
        if (ctx) {
            // Agrupar dados por data (DD/MM)
            const datesMap = {};
            // filtered está ordenado desc, vamos reverter pra plotar do mais antigo pro mais novo (esq -> dir)
            const chartEntries = [...filtered].reverse(); 
            
            chartEntries.forEach(e => {
                const dateObj = new Date(e.created_at);
                const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
                
                if (!datesMap[dateStr]) {
                    datesMap[dateStr] = { explodindo: 0, normal: 0, livre: 0 };
                }
                
                const en = e.energy_level || '';
                if (en.includes('Explodindo')) datesMap[dateStr].explodindo++;
                else if (en.includes('Livre')) datesMap[dateStr].livre++;
                else datesMap[dateStr].normal++;
            });

            const labels = Object.keys(datesMap);
            const dataExplodindo = labels.map(l => datesMap[l].explodindo);
            const dataLivre = labels.map(l => datesMap[l].livre);
            const dataNormal = labels.map(l => datesMap[l].normal);

            if (window.energyChartInstance) {
                window.energyChartInstance.destroy();
            }

            // Apenas renderiza se a biblioteca Chart existir no window (carregada do CDN)
            if (window.Chart) {
                window.energyChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Explodindo 🔴',
                                data: dataExplodindo,
                                borderColor: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                tension: 0.4,
                                fill: true
                            },
                            {
                                label: 'Normal 🟡',
                                data: dataNormal,
                                borderColor: '#eab308',
                                backgroundColor: 'transparent',
                                tension: 0.4
                            },
                            {
                                label: 'Livre 🟢',
                                data: dataLivre,
                                borderColor: '#22c55e',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                tension: 0.4,
                                fill: true
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: { color: '#e2e8f0', font: { family: 'Inter' } }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { color: '#94a3b8', stepSize: 1 },
                                grid: { color: 'rgba(255,255,255,0.05)' }
                            },
                            x: {
                                ticks: { color: '#94a3b8' },
                                grid: { color: 'rgba(255,255,255,0.05)' }
                            }
                        }
                    }
                });
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
        if (typeof window.playEditarSound === 'function') window.playEditarSound();
        const entry = allEntries.find(e => e.id == id);
        if (!entry) return;
        editingId = id;
        const u = decodeUser(entry.username);
        userNameInput.value = u.name;
        userColorInput.value = u.color;
        
        todayTasksHidden.value = entry.today_tasks || '';
        // Tratar o "• " ou "  " e limpar
        currentTasks = (entry.today_tasks || '').split('\n').map(t => t.replace(/^• |^  /, '')).filter(t => t.trim() !== '');
        renderTaskBuilder();

        document.getElementById('helpNeeded').value = entry.help_needed || '';
        currentHelps = (entry.help_needed || '').split('\n').map(h => h.replace(/^• /, '')).filter(h => h.trim() !== '');
        if (typeof renderHelpBuilder === 'function') renderHelpBuilder();

        document.getElementById('blockers').value = entry.blockers || '';
        if (entry.energy_level) {
            const radio = form.querySelector(`input[name="energyLevel"][value="${entry.energy_level}"]`);
            if (radio) radio.checked = true;
        }
        // Restore mood
        if (entry.observations) {
            const moodRadio = form.querySelector(`input[name="moodEmoji"][value="${entry.observations}"]`);
            if (moodRadio) {
                moodRadio.checked = true;
                const label = moodRadio.closest('.mood-option');
                if (label) {
                    document.querySelectorAll('.mood-option').forEach(o => {
                        o.style.border = '2px solid transparent';
                        o.style.background = 'rgba(255,255,255,0.05)';
                        o.style.transform = 'scale(1)';
                    });
                    label.style.border = '2px solid #f472b6';
                    label.style.background = 'rgba(244, 114, 182, 0.15)';
                    label.style.transform = 'scale(1.15)';
                }
            }
        }
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = 'Atualizar Radar <i data-lucide="save"></i>';
        if (window.lucide) window.lucide.createIcons();
        window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
        
        if (typeof saveRadarDraft === 'function') saveRadarDraft();
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
        presenceBar.innerHTML = uniqueUsers.map(u => `<div class="presence-avatar" title="${u.name}" style="border: 2px solid ${u.color}; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 0;"><img src="${u.name.toLowerCase()}.png" alt="${u.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size:0.8em;font-weight:bold;color:${u.color};\\'>'+getInitials('${u.name}')+'</span>';"></div>`).join('');

        const editShortcutBtn = document.getElementById('editMyReportShortcutBtn');
        if (editShortcutBtn) {
            // Mostra o botão apenas se o usuário logado já fez o radar hoje
            const rawCurrent = localStorage.getItem('currentUser') || '';
            const normName = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
            const currentNorm = normName(rawCurrent);
            const iAlreadyPosted = currentNorm && todayEntries.some(e => normName(decodeUser(e.username).name) === currentNorm);

            if (iAlreadyPosted) {
                editShortcutBtn.style.display = 'flex';
                // Busca o ID no momento do clique (quando allEntries está certamente carregado)
                editShortcutBtn.onclick = () => {
                    const todayStr = new Date().toLocaleDateString('pt-BR');
                    const me = allEntries.find(e => {
                        const d = new Date(e.created_at).toLocaleDateString('pt-BR');
                        return d === todayStr && normName(decodeUser(e.username).name) === currentNorm;
                    });
                    if (me) {
                        window.editEntry(me.id);
                    } else {
                        showToast('Não encontramos seu radar de hoje. Recarregando...', 'error');
                        loadEntries();
                    }
                };
            } else {
                editShortcutBtn.style.display = 'none';
            }
        }
    }

    function copyDailySummary() {
        const todayStr = new Date().toLocaleDateString('pt-BR');
        const todayEntries = allEntries.filter(e => new Date(e.created_at).toLocaleDateString('pt-BR') === todayStr);
        if (todayEntries.length === 0) { showToast("Nenhum registro hoje.", "error"); return; }
        let summary = `*🚀 RESUMO DO RADAR DIÁRIO - ${todayStr}*\n\n`;
        todayEntries.forEach(e => {
            const u = decodeUser(e.username);
            summary += `👤 *${u.name}*\n🎯 Hoje: \n${e.today_tasks}\n`;
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
            
            let matchesGlobal = true;
            if (window.globalStatFilter === 'help') {
                const needsHelp = entry.help_needed && entry.help_needed.trim() !== '';
                matchesGlobal = needsHelp;
            } else if (window.globalStatFilter === 'blocker') {
                const blockersVal = (entry.blockers || '').toLowerCase().trim();
                const hasBlockers = blockersVal !== '' && !['não', 'nao', 'nada', 'n/a', 'no'].includes(blockersVal);
                matchesGlobal = hasBlockers;
            }

            return matchesSearch && matchesDate && matchesGlobal;
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
            const formattedTasks = (entry.today_tasks || '').split('\n').map(t => {
                let tClean = t.replace('• ', '').trim();
                if (!tClean) return '';
                const isDone = tClean.startsWith('✅ ');
                const isUrgent = tClean.includes('🚨 ');
                const isRework = tClean.includes('🔄 ');
                let spanStyle = 'flex:1;';
                if (isUrgent && !isDone) spanStyle += 'color: #ff416c; font-weight: bold; ';
                if (isRework && !isDone) spanStyle += 'color: #f59e0b; font-style: italic; ';
                if (isDone) spanStyle += 'text-decoration: line-through; opacity: 0.6; ';
                return `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;"><i data-lucide="check-square" style="width:14px;height:14px;color:#8e6eff;flex-shrink:0;margin-top:3px;"></i> <span style="${spanStyle}">${tClean}</span></div>`;
            }).join('');

            const normStr = (s) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";
            const currentU = normStr(currentUser || '');
            const isException = ['VANESSA', 'BRUNO', 'VITOR', 'LEANDRO'].includes(currentU);
            const canEdit = normStr(u.name) === currentU || isException;

            return `
            <div class="kickoff-item ${isUrgent ? 'urgent-item' : ''}" style="border: 2px solid ${isUrgent ? '#ff416c' : displayColor}; margin-bottom: 20px; padding: 25px; background: rgba(255,255,255,0.05); border-radius: 12px; transition: all 0.3s ease;">
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 45px; height: 45px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background-color: rgba(255,255,255,0.05);">
                            <img src="${u.name.toLowerCase()}.png" alt="${u.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color:${displayColor};font-weight:bold;font-size:1.1em;\\'>'+getInitials('${u.name}')+'</span>';">
                        </div>
                        <div class="user-info">
                            <h4 style="color: ${displayColor}; font-size: 1.2em; margin: 0;">${u.name}</h4>
                            <span style="opacity: 0.5; font-size: 0.85em;">${timeAgo(entry.created_at)}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        ${canEdit ? `
                        <div class="item-actions">
                            <button class="action-btn edit" onclick="editEntry('${entry.id}')" title="Editar"><i data-lucide="edit-3"></i></button>
                            <button class="action-btn delete" onclick="deleteEntry('${entry.id}')" title="Remover"><i data-lucide="trash-2"></i></button>
                        </div>
                        ` : ''}
                        <div style="display: flex; gap: 8px;">
                            ${needsHelp ? '<span class="help-badge" style="background: rgba(2, 206, 255, 0.1); color: #02ceff; padding: 4px 10px; border-radius: 6px; font-size: 0.7em; font-weight: bold;">🆘 Ajuda</span>' : ''}
                            ${hasBlockers ? '<span class="help-badge blocker-badge" style="background: rgba(255, 65, 108, 0.1); color: #ff416c; padding: 4px 10px; border-radius: 6px; font-size: 0.7em; font-weight: bold;">⛔ Impedido</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="item-content" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    ${entry.yesterday_tasks ? `<div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Ontem</label><p>${entry.yesterday_tasks}</p></div>` : ''}
                    <div class="content-block" style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 8px; grid-column: 1/-1;">
                        <label style="font-size: 0.75em; text-transform: uppercase; color: #8e6eff; font-weight: bold; margin-bottom: 10px; display: block;"><i data-lucide="target" style="width: 14px; height: 14px; margin-right: 5px;"></i> O que farei hoje</label>
                        <div>${formattedTasks}</div>
                    </div>
                    ${entry.help_needed ? `<div class="content-block"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Ajuda</label><p style="color: #02ceff; font-weight: 500;">${entry.help_needed} ${entry.who_help ? `(${entry.who_help})` : ''}</p></div>` : ''}
                    ${entry.observations ? `<div class="content-block" style="grid-column: 1/-1; text-align: center;"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Humor do Dia</label><p style="font-size: 2.5em; margin: 5px 0;">${entry.observations}</p></div>` : ''}
                    ${entry.energy_level ? `<div class="content-block" style="grid-column: 1/-1;"><label style="font-size: 0.7em; text-transform: uppercase; color: #a0aec0;">Nível de Energia</label><p style="font-weight: bold; display: flex; align-items: center; gap: 8px;">${entry.energy_level}</p></div>` : ''}
                </div>
                ${generateReactionBar(entry.id, 'kickoffs', entry.reactions || {})}
            </div>`;
        }).join('');
        if (window.lucide) window.lucide.createIcons();
    }

    function generateReactionBar(id, table, reactions) {
        const emojis = ['👏', '🔥', '💡', '🚀', '✅'];
        const barHtml = emojis.map(emoji => {
            let data = reactions[emoji] || [];
            let count = 0;
            let names = '';
            if (typeof data === 'number') {
                count = data;
                names = `${count} pessoa(s)`;
            } else if (Array.isArray(data)) {
                count = data.length;
                names = data.join(', ');
            }
            const hasReacted = localStorage.getItem(`reacted_${id}_${emoji}`);
            return `<button class="reaction-btn ${hasReacted ? 'active' : ''}" title="${names || 'Reagir'}" onclick="toggleReaction('${id}', '${table}', '${emoji}', event)">
                ${emoji} <span style="font-weight: bold; ${count === 0 ? 'opacity: 0.5' : ''}">${count > 0 ? count : ''}</span>
            </button>`;
        }).join('');
        return `<div class="reaction-bar" id="reactions_${id}">${barHtml}</div>`;
    }
    window.generateReactionBar = generateReactionBar;

    window.toggleReaction = async (id, table, emoji, event) => {
        if (event) event.stopPropagation();
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return;
        const user = decodeUser(userStr).name;
        const localKey = `reacted_${id}_${emoji}`;
        const hasReacted = localStorage.getItem(localKey);
        
        let entry = null;
        let isPhoto = false;

        if (table === 'kickoffs') entry = allEntries.find(e => e.id == id);
        else if (table === 'sucessos') entry = allSucessos.find(e => e.id == id);
        else if (table === 'sugestoes') {
            try {
                const { data } = await window.supabaseClient.from('sugestoes').select('*').eq('id', id).single();
                if (data) {
                    entry = data;
                    isPhoto = true;
                    let parsed = {};
                    try {
                        const jsonStr = entry.sugestao.replace('FOTO:', '');
                        parsed = JSON.parse(jsonStr).reactions || {};
                    } catch(e) {}
                    entry.reactions = parsed;
                }
            } catch(e) { console.error(e); }
        }
        
        if (!entry) return;

        if (!entry.reactions) entry.reactions = {};
        
        // Migrate number to array for backward compatibility
        if (typeof entry.reactions[emoji] === 'number') {
            entry.reactions[emoji] = Array(entry.reactions[emoji]).fill('Alguém');
        } else if (!Array.isArray(entry.reactions[emoji])) {
            entry.reactions[emoji] = [];
        }

        if (hasReacted) {
            const idx = entry.reactions[emoji].indexOf(user);
            if (idx > -1) {
                entry.reactions[emoji].splice(idx, 1);
            } else {
                const anonIdx = entry.reactions[emoji].indexOf('Alguém');
                if (anonIdx > -1) entry.reactions[emoji].splice(anonIdx, 1);
            }
            localStorage.removeItem(localKey);
        } else {
            if (!entry.reactions[emoji].includes(user)) {
                entry.reactions[emoji].push(user);
            }
            localStorage.setItem(localKey, 'true');
        }

        const reactionBar = document.getElementById(`reactions_${id}`);
        if (reactionBar) {
            reactionBar.outerHTML = generateReactionBar(id, table, entry.reactions);
        }

        try {
            if (isPhoto) {
                let photoObj = {};
                try {
                    const jsonStr = entry.sugestao.replace('FOTO:', '');
                    photoObj = JSON.parse(jsonStr);
                } catch(e) {}
                photoObj.reactions = entry.reactions;
                const newSugestao = 'FOTO:' + JSON.stringify(photoObj);
                await window.supabaseClient.from('sugestoes').update({ sugestao: newSugestao }).eq('id', id);
            } else {
                await window.supabaseClient.from(table).update({ reactions: entry.reactions }).eq('id', id);
            }
        } catch (error) {
            console.error('Erro ao atualizar reação', error);
        }
    };

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
                // Override com preferência salva no localStorage (cor escolhida pelo usuário)
                Object.keys(userColors).forEach(name => {
                    const saved = localStorage.getItem(`userColorPref_${name}`);
                    if (saved) userColors[name] = saved;
                });
                if (currentUser) applyCurrentUser(); // Atualiza cor do form
                updateStats(data); 
                updatePresence(data); 
                applyFilters();
                calculateXP(); // Calcula XP ao carregar os dados
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
        form.addEventListener('input', () => { if (typeof saveRadarDraft === 'function') saveRadarDraft(); });
        form.addEventListener('change', () => { if (typeof saveRadarDraft === 'function') saveRadarDraft(); });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            const energyChecked = form.querySelector('input[name="energyLevel"]:checked');
            
            const mentioned = [];
            if (typeof currentHelps !== 'undefined') {
                currentHelps.forEach(h => {
                    const matches = h.match(/\(@([^)]+)\)/g);
                    if (matches) matches.forEach(m => mentioned.push(m.replace('(@', '').replace(')', '')));
                });
            }
            const checkedHelpers = [...new Set(mentioned)].join(', ');

            const moodChecked = form.querySelector('input[name="moodEmoji"]:checked');

            const entry = {
                username: `${userNameInput.value}|${userColorInput.value}`,
                today_tasks: todayTasksHidden.value,
                help_needed: document.getElementById('helpNeeded').value,
                who_help: checkedHelpers,
                blockers: document.getElementById('blockers').value,
                observations: moodChecked ? moodChecked.value : '',
                energy_level: energyChecked ? energyChecked.value : '😐 Normal',
                created_at: new Date().toISOString()
            };
            try {
                if (editingId) {
                    delete entry.created_at; // Mantém a data original do relatório
                    await supabaseClient.from('kickoffs').update(entry).eq('id', editingId);
                    showToast("Atualizado!"); 
                    // Não enviar alerta do Teams ao editar (isUpdate = true)
                    editingId = null;
                } else {
                    await supabaseClient.from('kickoffs').insert([entry]);
                    xaropinhoSound.play(); 
                    if (window.showStreakPopup) {
                        // Re-calcular a streak rapidinho e somar 1 para mostrar o novo valor na hora
                        const myCheckins = allEntries.filter(e => decodeUser(e.username).name.toUpperCase() === currentUser);
                        const currentStreak = calculateStreak(myCheckins);
                        showStreakPopup(currentStreak + 1);
                    }
                    await sendTeamsAlert(entry); showToast("Enviado!");
                }
                form.reset();
                currentTasks = [];
                renderTaskBuilder();
                currentHelps = [];
                if (typeof renderHelpBuilder === 'function') renderHelpBuilder();
                submitBtn.innerHTML = 'Enviar Radar <i data-lucide="send"></i>'; loadEntries();
                if (typeof clearRadarDraft === 'function') clearRadarDraft();
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
            const chosenColor = e.target.value;
            userColors[selectedName] = chosenColor;
            // Salvar preferência de cor no localStorage para persistir entre sessões
            localStorage.setItem(`userColorPref_${selectedName}`, chosenColor);
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
                calculateXP(); // Calcula XP ao carregar os dados de sucesso
            }
        } catch (error) { showToast('Erro ao carregar sucessos: ' + error.message, 'error'); }
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
            <div class="kickoff-item" style="border: 2px solid ${displayColor}; margin-bottom: 20px; padding: 25px; background: rgba(255,255,255,0.05); border-radius: 12px; transition: all 0.3s ease;">
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 45px; height: 45px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background-color: rgba(255,255,255,0.05);">
                            <img src="${u.name.toLowerCase()}.png" alt="${u.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color:${displayColor};font-weight:bold;font-size:1.1em;\\'>'+getInitials('${u.name}')+'</span>';">
                        </div>
                        <div class="user-info">
                            <h4 style="color: ${displayColor}; font-size: 1.2em; margin: 0;">${u.name} ${destaqueBadge}</h4>
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
                ${generateReactionBar(entry.id, 'sucessos', entry.reactions || {})}
            </div>`;
        }).join('');
        if (window.lucide) window.lucide.createIcons();
    }

    if (sucessoForm) {
        sucessoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = sucessoForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            
            const praiseTo = document.getElementById('sucessoPraiseTo').value;
            const praiseText = document.getElementById('sucessoPraiseText').value;
            const finalPraise = praiseTo ? `Para [${praiseTo}]: ${praiseText}` : praiseText;

            const entry = {
                username: `${sucessoUserName.value}|#ffd700`,
                victory: document.getElementById('sucessoVictory').value,
                praise: finalPraise,
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
                    tomeSound.play(); 
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

    // --- LÓGICA DA ABA DE SUGESTÕES ---
    const sugestaoForm = document.getElementById('sugestaoForm');
    const sugestaoText = document.getElementById('sugestaoText');
    const submitSugestaoBtn = document.getElementById('submitSugestaoBtn');

    if (sugestaoForm) {
        sugestaoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = sugestaoText.value.trim();
            if (!text) return;
            
            submitSugestaoBtn.innerHTML = 'Enviando... <i data-lucide="loader-2" class="spin"></i>';
            submitSugestaoBtn.disabled = true;

            try {
                const entry = {
                    username: currentUser || 'Anônimo',
                    sugestao: text,
                    created_at: new Date().toISOString()
                };

                const { error } = await supabaseClient.from('sugestoes').insert([entry]);
                
                if (error) throw error;
                
                olhaSoSound.play().catch(() => {});
                
                if (typeof showToast === 'function') {
                    showToast('Sugestão enviada com sucesso! Muito obrigado ❤️', 'success');
                } else {
                    alert('Sugestão enviada com sucesso!');
                }
                sugestaoForm.reset();
                if (typeof loadSugestoes === 'function') loadSugestoes();
            } catch (err) {
                if (typeof showToast === 'function') {
                    showToast('Erro ao enviar sugestão.', 'error');
                } else {
                    alert('Erro ao enviar sugestão.');
                }
            } finally {
                submitSugestaoBtn.innerHTML = 'Enviar Sugestão <i data-lucide="send"></i>';
                submitSugestaoBtn.disabled = false;
                if (window.lucide) window.lucide.createIcons();
            }
        });
    }

    // --- CARREGAR FEED DE SUGESTÕES ---
    window.loadSugestoes = async () => {
        const container = document.getElementById('sugestoesFeedContainer');
        if (!container) return;
        try {
            const { data, error } = await supabaseClient.from('sugestoes').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            const filtered = data ? data.filter(item => !item.sugestao.startsWith('FOTO:') && !item.sugestao.startsWith('ENQUETE:') && !item.sugestao.startsWith('SYMPLA:')) : [];
            if (filtered.length > 0) {
                container.innerHTML = filtered.map(item => `
                    <div class="glass-card" style="padding: 15px; border-left: 4px solid #02ceff; background: rgba(2, 206, 255, 0.05);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <strong style="color: #02ceff;"><i data-lucide="user" style="width: 14px; height: 14px;"></i> ${item.username}</strong>
                            <span style="font-size: 0.8em; color: #a0aec0;">${new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p style="margin: 0; line-height: 1.5; color: white;">${item.sugestao.replace(/\n/g, '<br>')}</p>
                    </div>
                `).join('');
                if (window.lucide) window.lucide.createIcons();
            } else {
                container.innerHTML = '<div class="glass-card" style="padding: 15px; text-align: center;"><p style="margin: 0; opacity: 0.5;">Nenhuma sugestão enviada ainda. Seja o primeiro!</p></div>';
            }
        } catch (e) {
            container.innerHTML = '<div class="glass-card" style="padding: 15px; text-align: center;"><p style="margin: 0; color: #ff416c;">Erro ao carregar sugestões.</p></div>';
        }
    };
    if (document.getElementById('sugestoesFeedContainer')) {
        loadSugestoes();
    }

    // --- CARREGAR FEED DE NOVIDADES ---
    window.loadNovidades = async () => {
        const container = document.getElementById('novidadesFeedContainer');
        if (!container) return;
        try {
            const { data, error } = await supabaseClient.from('novidades').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (data && data.length > 0) {
                const latest = data[0];
                latestNovidadeId = latest.id;
                const latestDateObj = new Date(latest.created_at);
                const todayObj = new Date();
                const isToday = latestDateObj.getFullYear() === todayObj.getFullYear() &&
                                latestDateObj.getMonth() === todayObj.getMonth() &&
                                latestDateObj.getDate() === todayObj.getDate();
                const todayKey = todayObj.getFullYear() + '-' + (todayObj.getMonth()+1) + '-' + todayObj.getDate();
                const storageKey = 'novidadeNotified_' + latest.id + '_' + todayKey;
                
                if (isToday && !localStorage.getItem(storageKey)) {
                    setTimeout(() => {
                        if (typeof showToast === 'function') {
                            showToast(
                                "✨ Tem atualização nova na plataforma! Vá na aba 'Novidades' para conferir.", 
                                "success", 
                                0,
                                () => {
                                    localStorage.setItem(storageKey, 'true');
                                }
                            );
                        }
                    }, 2500);
                }

                container.innerHTML = data.map(item => `
                    <div class="glass-card" style="padding: 25px; border-left: 4px solid #22c55e; background: rgba(34, 197, 94, 0.05); text-align: left;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center;">
                            <h3 style="color: #22c55e; margin: 0; font-size: 1.4em;">${item.titulo}</h3>
                            <span style="font-size: 0.85em; color: #a0aec0; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px;">
                                <i data-lucide="calendar" style="width: 12px; height: 12px;"></i> ${new Date(item.created_at).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        <p style="margin: 0; line-height: 1.6; color: white; font-size: 1.05em;">${item.descricao.replace(/\n/g, '<br>')}</p>
                    </div>
                `).join('');
                if (window.lucide) window.lucide.createIcons();
            } else {
                container.innerHTML = '<div class="glass-card" style="padding: 30px; text-align: center;"><p style="margin: 0; opacity: 0.5;">Nenhuma novidade publicada ainda.</p></div>';
            }
        } catch (e) {
            container.innerHTML = '<div class="glass-card" style="padding: 30px; text-align: center;"><p style="margin: 0; color: #ff416c;">Erro ao carregar novidades.</p></div>';
        }
    };
    if (document.getElementById('novidadesFeedContainer')) {
        loadNovidades();
    }

    window.deleteSucesso = async (id) => {
        if (!confirm('Certeza que deseja apagar este sucesso?')) return;
        try {
            await supabaseClient.from('sucessos').delete().eq('id', id);
            showToast("Sucesso apagado!", "error"); loadSucessos();
        } catch (e) { showToast('Erro', 'error'); }
    }

    window.editSucesso = (id) => {
        if (typeof window.playEditarSound === 'function') window.playEditarSound();
        const entry = allSucessos.find(e => e.id == id);
        if (!entry) return;
        editingSucessoId = id;
        const u = decodeUser(entry.username);
        // Popular options de elogio
        const praiseToSelect = document.getElementById('sucessoPraiseTo');
        if (praiseToSelect) {
            praiseToSelect.innerHTML = '<option value="">(Opcional) Elogiar alguém?</option>' + 
                TEAM_MEMBERS.map(member => `<option value="${member}">${member}</option>`).join('');
                
            praiseToSelect.addEventListener('change', (e) => {
                playNameSound(e.target.value);
            });
        };
        sucessoUserName.value = u.name;
        document.getElementById('sucessoVictory').value = entry.victory || '';
        
        const pTo = document.getElementById('sucessoPraiseTo');
        const pText = document.getElementById('sucessoPraiseText');
        if (entry.praise && entry.praise.startsWith('Para [')) {
            const match = entry.praise.match(/^Para \[([^\]]+)\]:\s*(.*)/);
            if (match) {
                pTo.value = match[1];
                pText.value = match[2];
            } else {
                pTo.value = '';
                pText.value = entry.praise;
            }
        } else {
            pTo.value = '';
            pText.value = entry.praise || '';
        }

        document.getElementById('sucessoInsight').value = entry.insight || '';
        
        sucessoForm.scrollIntoView({ behavior: 'smooth' });
        sucessoForm.querySelector('button[type="submit"]').innerHTML = 'Atualizar Sucesso <i data-lucide="refresh-cw"></i>';
    }

    if (searchInput) searchInput.addEventListener('input', () => { window.globalStatFilter = 'all'; applyFilters(); });
    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            window.globalStatFilter = 'all';
            if (dateFilter.value === 'custom') customDateInput.style.display = 'block';
            else { customDateInput.style.display = 'none'; applyFilters(); }
        });
    }
    if (customDateInput) customDateInput.addEventListener('change', () => { window.globalStatFilter = 'all'; applyFilters(); });

    window.goToReportsAndFilter = function(filter) {
        window.globalStatFilter = filter;
        if (dateFilter) dateFilter.value = 'today';
        if (searchInput) searchInput.value = '';
        
        const radarBtn = document.querySelector('[data-target="tab-radar"]');
        if (radarBtn) radarBtn.click();
        
        setTimeout(() => {
            const list = document.getElementById('kickoffList');
            if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
            applyFilters();
        }, 50);
    };
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
                uiiiSound.play();
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

    window.loadAdminSugestoes = async () => {
        if (!supabaseClient) return;
        try {
            const { data, error } = await supabaseClient.from('sugestoes').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            const container = document.getElementById('adminSugestoesContainer');
            if (data && container) {
                const filtered = data.filter(sg => !sg.sugestao.startsWith('FOTO:') && !sg.sugestao.startsWith('ENQUETE:') && !sg.sugestao.startsWith('SYMPLA:'));
                if (filtered.length === 0) {
                    container.innerHTML = `<div class="glass-card" style="padding: 15px; text-align: center; opacity: 0.5;">Nenhuma sugestão recebida ainda.</div>`;
                    return;
                }
                container.innerHTML = filtered.map(sg => `
                    <div class="glass-card" style="padding: 15px; border-left: 4px solid #facc15; margin-bottom: 15px; background: rgba(250, 204, 21, 0.05); position: relative;">
                        <button onclick="deleteSugestao('${sg.id}')" style="position: absolute; top: 15px; right: 15px; background: rgba(255, 65, 108, 0.1); border: none; color: #ff416c; padding: 5px; border-radius: 5px; cursor: pointer; transition: all 0.3s;" title="Apagar Sugestão">
                            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                        <span style="font-size: 0.7em; color: #a0aec0; display: block; margin-bottom: 10px;">Enviado por <strong>${sg.username}</strong> em: ${new Date(sg.created_at).toLocaleDateString('pt-BR')} às ${new Date(sg.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        <div style="margin-bottom: 10px; padding-right: 25px;">
                            <p style="margin: 5px 0 0 0; font-size: 0.9em;">${sg.sugestao}</p>
                        </div>
                    </div>
                `).join('');
                if (window.lucide) window.lucide.createIcons();
            }
        } catch (error) { console.error(error); }
    };

    window.deleteSugestao = async (id) => {
        if (!confirm('Certeza que deseja apagar esta sugestão?')) return;
        try {
            const { error } = await supabaseClient.from('sugestoes').delete().eq('id', id);
            if (error) throw error;
            showToast("Sugestão removida!", "error");
            loadAdminSugestoes();
            if (typeof loadSugestoes === 'function') loadSugestoes();
        } catch (error) {
            console.error(error);
            showToast("Erro ao apagar sugestão", "error");
        }
    };

    // NOVIDADES ADMIN LOGIC
    let editingAdminNovidadeId = null;
    let allAdminNovidadesList = [];
    const adminNovidadeForm = document.getElementById('adminNovidadeForm');
    if (adminNovidadeForm) {
        adminNovidadeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titulo = document.getElementById('novidadeTitulo').value;
            const descricao = document.getElementById('novidadeDescricao').value;
            const btn = document.getElementById('submitNovidadeBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Enviando...';
            btn.disabled = true;

            try {
                const entry = { titulo, descricao, autor: 'Gestor' };
                if (editingAdminNovidadeId) {
                    const { error } = await supabaseClient.from('novidades').update(entry).eq('id', editingAdminNovidadeId);
                    if (error) throw error;
                    showToast("Novidade atualizada com sucesso!");
                    editingAdminNovidadeId = null;
                } else {
                    const { error } = await supabaseClient.from('novidades').insert([entry]);
                    if (error) throw error;
                    showToast("Novidade publicada com sucesso!");
                }
                adminNovidadeForm.reset();
                btn.innerHTML = 'Publicar Novidade <i data-lucide="send"></i>';
                if (window.lucide) window.lucide.createIcons();
                if (typeof loadAdminNovidades === 'function') loadAdminNovidades();
                if (typeof loadNovidades === 'function') loadNovidades();
            } catch (error) {
                console.error(error);
                showToast("Erro ao publicar novidade", "error");
                btn.innerHTML = originalText;
            } finally {
                btn.disabled = false;
            }
        });
    }

    window.editAdminNovidade = (id) => {
        const n = allAdminNovidadesList.find(x => x.id.toString() === id.toString());
        if (!n) return;
        editingAdminNovidadeId = n.id;
        document.getElementById('novidadeTitulo').value = n.titulo;
        document.getElementById('novidadeDescricao').value = n.descricao;
        document.getElementById('submitNovidadeBtn').innerHTML = 'Atualizar Novidade <i data-lucide="refresh-cw"></i>';
        if (window.lucide) window.lucide.createIcons();
        adminNovidadeForm.scrollIntoView({ behavior: 'smooth' });
    };

    window.loadAdminNovidades = async () => {
        if (!supabaseClient) return;
        try {
            const { data, error } = await supabaseClient.from('novidades').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            allAdminNovidadesList = data || [];
            const container = document.getElementById('adminNovidadesContainer');
            if (allAdminNovidadesList && container) {
                if (allAdminNovidadesList.length === 0) {
                    container.innerHTML = `<div class="glass-card" style="padding: 15px; text-align: center; opacity: 0.5;">Nenhuma novidade cadastrada ainda.</div>`;
                    return;
                }
                container.innerHTML = allAdminNovidadesList.map(n => `
                    <div class="glass-card" style="padding: 15px; border-left: 4px solid #22c55e; margin-bottom: 15px; background: rgba(34, 197, 94, 0.05); position: relative;">
                        <div style="position: absolute; top: 15px; right: 15px; display: flex; gap: 8px;">
                            <button onclick="editAdminNovidade('${n.id}')" style="background: rgba(255, 255, 255, 0.1); border: none; color: white; padding: 5px; border-radius: 5px; cursor: pointer; transition: all 0.3s;" title="Editar Novidade">
                                <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button onclick="deleteNovidade('${n.id}')" style="background: rgba(255, 65, 108, 0.1); border: none; color: #ff416c; padding: 5px; border-radius: 5px; cursor: pointer; transition: all 0.3s;" title="Apagar Novidade">
                                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                        <span style="font-size: 0.7em; color: #a0aec0; display: block; margin-bottom: 5px;">Publicado em: ${new Date(n.created_at).toLocaleDateString('pt-BR')}</span>
                        <h4 style="margin: 0 0 5px 0; color: #22c55e;">${n.titulo}</h4>
                        <div style="margin-bottom: 10px; padding-right: 25px;">
                            <p style="margin: 5px 0 0 0; font-size: 0.9em;">${n.descricao}</p>
                        </div>
                    </div>
                `).join('');
                if (window.lucide) window.lucide.createIcons();
            }
        } catch (error) { console.error(error); }
    };

    window.deleteNovidade = async (id) => {
        if (!confirm('Certeza que deseja apagar esta novidade?')) return;
        try {
            const { error } = await supabaseClient.from('novidades').delete().eq('id', id);
            if (error) throw error;
            showToast("Novidade removida!", "error");
            loadAdminNovidades();
            if (typeof loadNovidades === 'function') loadNovidades();
        } catch (error) {
            console.error(error);
            showToast("Erro ao apagar novidade", "error");
        }
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
            
            // Usar o "Hoje" (que agora é a base principal)
            monthEntries.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).forEach(e => {
                const tt = (e.today_tasks || '').trim();
                if(tt !== '' && tt !== '-' && tt !== 'nada' && tt !== 'nao' && tt !== 'não') {
                    const formattedTasks = tt.split('\n').map(t => {
                        let tClean = t.replace('• ', '').trim();
                        if (!tClean) return '';
                        const isDone = tClean.startsWith('✅ ');
                        const isUrgent = tClean.includes('🚨 ');
                        let spanStyle = 'flex:1;';
                        if (isUrgent && !isDone) spanStyle += 'color: #ff416c; font-weight: bold;';
                        if (isDone) spanStyle += 'text-decoration: line-through; opacity: 0.6;';
                        return `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;"><i data-lucide="check-square" style="width:14px;height:14px;color:#8e6eff;flex-shrink:0;margin-top:3px;"></i> <span style="${spanStyle}">${tClean}</span></div>`;
                    }).join('');
                    
                    html += `
                        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-left: 3px solid #02ceff; margin-bottom: 15px;">
                            <span style="font-size: 0.7em; color: #a0aec0; display: block; margin-bottom: 10px;">Planejado/Executado em: ${new Date(e.created_at).toLocaleDateString('pt-BR')}</span>
                            <div style="margin: 0; font-size: 0.9em; white-space: normal;">${formattedTasks}</div>
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

    // =============================================
    // SISTEMA DE NOTIFICAÇÕES DE AJUDA EM TEMPO REAL
    // =============================================
    function playNotificationSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) { console.warn("Audio not supported"); }
    }

    // Chave com data para resetar automaticamente todo dia
    const todayKey = 'notifiedHelpIds_' + new Date().toLocaleDateString('pt-BR');
    let notifiedHelpIds = JSON.parse(localStorage.getItem(todayKey) || '[]');

    function showHelpNotification(entry) {
        document.getElementById('helpNotificationText').innerHTML = `<strong>${entry.nome}</strong> marcou você agora mesmo:<br><br><span style="color: white; font-style: italic;">"${entry.ajuda_texto}"</span>`;
        const popup = document.getElementById('helpNotificationPopup');
        popup.style.display = 'block';
        if (window.lucide) window.lucide.createIcons();
        playNotificationSound();
    }

    window.pollHelpRequests = async () => {
        if (!supabaseClient) return;
        const myName = localStorage.getItem('currentUser'); // chave correta
        if (!myName) return;

        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            
            const { data, error } = await supabaseClient
                .from('kickoffs')
                .select('id, username, help_needed, who_help, created_at')
                .gte('created_at', todayStart.toISOString())
                .ilike('who_help', `%${myName}%`);
            
            if (error) throw error;
            if (data && data.length > 0) {
                data.forEach(entry => {
                    const u = entry.username.split('|')[0];
                    if (!notifiedHelpIds.includes(entry.id) && u !== myName) {
                        notifiedHelpIds.push(entry.id);
                        localStorage.setItem(todayKey, JSON.stringify(notifiedHelpIds));
                        showHelpNotification({ nome: u, ajuda_texto: entry.help_needed || 'Precisa de ajuda com o radar de hoje.' });
                    }
                });
            }
        } catch (e) {
            console.error("Erro ao fazer polling de ajudas", e);
        }
    };

    // Polling a cada 30 segundos
    setInterval(window.pollHelpRequests, 30000);
    // Checa imediatamente ao carregar (sem delay)
    window.pollHelpRequests();

});

// =============================================
// TERMO DO DIA - Wordle-style Mini-Game
// =============================================
(function() {
    // ----- Banco de palavras (5 letras, sem acento) -----
    const WORDBANK = [
        "ABRIR","ACOES","AJUDA","ALTOS","AINDA","AMBOS","ANTES","ARGOS","ARTES","ASSAZ",
        "BALDE","BANCO","BARCO","BATER","BEIRA","BELAS","BISPO","BOLSA","BOLSO","BORDA",
        "CABER","CALDO","CAMPO","CANTO","CAPAZ","CARGA","CARGO","CARRO","CARTA",
        "CENAS","CHAVE","CINCO","CIRCO","CLUBE","COBRA","COISA","CONTA",
        "CORTE","COURO","COUVE","CRIOU","CRIVO","CRUEL","CURTO","CURVA","DATAS","DELTA",
        "DENSO","DESDE","DEVER","DIANA","DISCO","DISSE","DITAR","DOCES",
        "DUPLO","EDUCA","EMITE","ENTRE","ENVIO","EPICO","ERROS",
        "ESCOA","ETAPA","EXTRA","FACAO","FALAR","FALTA","FASES",
        "FECHA","FENDA","FESTA","FIQUE","FIRMA","FITAR","FORCA","FORMA","FORTE","FREAR",
        "FRUTO","FUNDO","GANHA","GERAL","GESTO","GLOBO","GOLPE","GOSTO","GRAFO","GREVE",
        "GRUPO","GUIAR","HABIL","HONRA","HOTEL","HUMOR","IDEAL","IDEIA","IGUAL","IMPAR",
        "INICIO","INOVA","ISOLA","JOGAR","JUIZO","JUNTO","JUROS",
        "LANCE","LAPIS","LENTA","LICAO","LIDAR","LIGAR","LIMITE","LINDA","LINHA",
        "LOCAL","LOGICA","LUCRO","LUGAR","LONGO","MANOS","MARCA","MASSA",
        "MEDIA","MELHOR","METAS","METODO","MEIOS","MISTO","MODAL","MOEDA","MORAR","MOTOR",
        "MUNDO","NIVEL","NORMA","NOTAR","NOVAS","NOVOS","OBTER","ORDEM","OTIMO","NOSSA",
        "PACTO","PAPEL","PARTE","PASSO","PEDIR","PERDA","PESAR","PILHA","PISTA",
        "PLANO","PODER","PONTO","PRECO","PRIMO","PROVA","PULSO","RENDA","RISCO","RITMO",
        "RIVAL","RODAS","ROLHA","ROTINA","SAIDA","SALDO","SETOR","SIGLA","SOBRE","SOFRE",
        "SOLVE","SORTE","SUCESSO","SUITE","SUPER","TABELA","TARDE",
        "TARIFA","TAXA","TEMPO","TEXTO","TIMES","TITULO","TOMAR","TOQUE","TOTAL","TREINO",
        "TURNO","ULTRA","VALOR","VENDA","VERDE","VIGOR","VIRAL","VISAO","VISTA",
        "VOTAR","ZERAR","AGORA","AMIGO","AMPLO","ANDAR","APOIO",
        "BREVE","CAUSA","CERTO","CICLO","COMBO","DIRETO","EQUIPE","FISCO","FOCAR",
        "FOREM","FUSAO","GERAR","GRADE","IMPOR","INERCIA","INOVAR","JOGO","LIDERAR",
        "LOGAR","LUCRAR","MAPEAR","MARCO","NICHO","OPERAR","OTIMIZAR","PARTES","PERSONA","PILAR",
        "PRAZO","PROPOR","RANKEAR","REAGIR","SEGMENTO","SINTESE","SUGERIR",
        "TIRAR","TRACAR","TREINAR","UNICA","UNIR","URGENTE",
        "VALIDAR","VENCER","VERTER","VIRAR","VOAR","VOLTAR"
    ].map(w => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase())
     .filter(w => w.length === 5);

    const UNIQUE_WORDS = [...new Set(WORDBANK)];

    // Escolhe palavra do dia baseado na data (todos usam a mesma!)
    function getTodayWord() {
        const now = new Date();
        const dayIndex = Math.floor((now - new Date('2025-01-01')) / 86400000);
        return UNIQUE_WORDS[dayIndex % UNIQUE_WORDS.length];
    }

    const MAX_TRIES = 6;
    const WORD_LEN = 5;
    let targetWord = '';
    let guesses = [];
    let currentGuess = '';
    let gameOver = false;
    const TODAY_KEY = 'wordleState_' + new Date().toLocaleDateString('pt-BR');

    function saveState() {
        localStorage.setItem(TODAY_KEY, JSON.stringify({ guesses, gameOver, won: guesses.some(g => g === targetWord) }));
    }

    function loadState() {
        const raw = localStorage.getItem(TODAY_KEY);
        if (!raw) return false;
        try {
            const st = JSON.parse(raw);
            guesses = st.guesses || [];
            gameOver = st.gameOver || false;
            return true;
        } catch { return false; }
    }

    function evaluateGuess(guess) {
        const result = Array(WORD_LEN).fill('absent');
        const targetArr = targetWord.split('');
        const guessArr = guess.split('');
        const used = Array(WORD_LEN).fill(false);

        // First pass: correct positions
        for (let i = 0; i < WORD_LEN; i++) {
            if (guessArr[i] === targetArr[i]) {
                result[i] = 'correct';
                used[i] = true;
            }
        }
        // Second pass: present but wrong position
        for (let i = 0; i < WORD_LEN; i++) {
            if (result[i] === 'correct') continue;
            for (let j = 0; j < WORD_LEN; j++) {
                if (!used[j] && guessArr[i] === targetArr[j]) {
                    result[i] = 'present';
                    used[j] = true;
                    break;
                }
            }
        }
        return result;
    }

    function colorForState(state) {
        if (state === 'correct') return '#22c55e';
        if (state === 'present') return '#facc15';
        return 'rgba(255,255,255,0.15)';
    }

    function renderGrid() {
        const grid = document.getElementById('wordleGrid');
        if (!grid) return;
        grid.innerHTML = '';
        for (let r = 0; r < MAX_TRIES; r++) {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;gap:8px;';
            for (let c = 0; c < WORD_LEN; c++) {
                const cell = document.createElement('div');
                cell.style.cssText = `
                    width:58px;height:58px;border-radius:8px;display:flex;
                    align-items:center;justify-content:center;font-size:1.6em;
                    font-weight:900;letter-spacing:0;transition:background 0.3s, transform 0.15s;
                    border:2px solid rgba(255,255,255,0.15);color:white;
                    user-select:none;
                `;
                if (r < guesses.length) {
                    const guess = guesses[r];
                    const result = evaluateGuess(guess);
                    cell.textContent = guess[c] || '';
                    cell.style.background = colorForState(result[c]);
                    cell.style.borderColor = colorForState(result[c]);
                } else if (r === guesses.length && !gameOver) {
                    // Current input row
                    cell.textContent = currentGuess[c] || '';
                    cell.style.borderColor = currentGuess[c] ? '#8e6eff' : 'rgba(255,255,255,0.2)';
                    cell.style.background = currentGuess[c] ? 'rgba(142,110,255,0.15)' : 'rgba(255,255,255,0.04)';
                } else {
                    cell.style.background = 'rgba(255,255,255,0.04)';
                }
                row.appendChild(cell);
            }
            grid.appendChild(row);
        }
    }

    function renderKeyboard() {
        const kb = document.getElementById('wordleKeyboard');
        if (!kb) return;
        const rows = [
            ['Q','W','E','R','T','Y','U','I','O','P'],
            ['A','S','D','F','G','H','J','K','L'],
            ['ENTER','Z','X','C','V','B','N','M','⌫']
        ];
        // Track letter states
        const letterState = {};
        guesses.forEach(guess => {
            const result = evaluateGuess(guess);
            guess.split('').forEach((ch, i) => {
                const cur = letterState[ch];
                if (result[i] === 'correct') letterState[ch] = 'correct';
                else if (result[i] === 'present' && cur !== 'correct') letterState[ch] = 'present';
                else if (!cur) letterState[ch] = 'absent';
            });
        });
        kb.innerHTML = '';
        rows.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.style.cssText = 'display:flex;gap:6px;justify-content:center;';
            row.forEach(key => {
                const btn = document.createElement('button');
                const st = letterState[key];
                btn.textContent = key;
                btn.type = 'button';
                btn.setAttribute('data-key', key);
                btn.style.cssText = `
                    min-width:${key.length > 1 ? '62px' : '38px'};height:52px;
                    border-radius:8px;border:none;font-weight:bold;font-size:${key.length > 1 ? '0.7em' : '1em'};
                    cursor:pointer;transition:all 0.2s;
                    background:${st === 'correct' ? '#22c55e' : st === 'present' ? '#facc15' : st === 'absent' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)'};
                    color:${st === 'present' ? '#1a152e' : 'white'};
                    box-shadow:0 2px 8px rgba(0,0,0,0.2);
                `;
                btn.addEventListener('click', () => handleKey(key));
                rowEl.appendChild(btn);
            });
            kb.appendChild(rowEl);
        });
    }

    function showMessage(msg, color) {
        const el = document.getElementById('wordleMessage');
        if (!el) return;
        el.textContent = msg;
        el.style.color = color || 'white';
    }

    function startCountdown() {
        const timerEl = document.getElementById('wordleNextTimer');
        const countdownEl = document.getElementById('wordleCountdown');
        if (!timerEl || !countdownEl) return;
        timerEl.style.display = 'block';
        function update() {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const diff = tomorrow - now;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            countdownEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
        update();
        setInterval(update, 1000);
    }

    function updateStatusBar() {
        const bar = document.getElementById('gameStatusBar');
        if (!bar) return;
        const won = guesses.some(g => g === targetWord);
        bar.innerHTML = `
            <div style="background:rgba(255,255,255,0.08);padding:8px 18px;border-radius:20px;text-align:center;">
                <div style="font-size:0.7em;opacity:0.6;text-transform:uppercase;letter-spacing:1px;">Tentativas</div>
                <div style="font-size:1.3em;font-weight:bold;color:#facc15;">${guesses.length} / ${MAX_TRIES}</div>
            </div>
            ${gameOver ? `<div style="background:${won?'rgba(34,197,94,0.15)':'rgba(255,65,108,0.15)'};padding:8px 18px;border-radius:20px;text-align:center;border:1px solid ${won?'#22c55e':'#ff416c'};">
                <div style="font-size:0.7em;opacity:0.6;text-transform:uppercase;letter-spacing:1px;">${won?'Parabéns!':'Game Over'}</div>
                <div style="font-size:1em;font-weight:bold;color:${won?'#22c55e':'#ff416c'};">${won?'🏆 Você venceu!':'A palavra era: '+targetWord}</div>
            </div>` : ''}
        `;
    }

    function handleKey(key) {
        if (gameOver) return;
        if (key === '⌫' || key === 'BACKSPACE') {
            currentGuess = currentGuess.slice(0, -1);
            renderGrid();
            return;
        }
        if (key === 'ENTER') {
            if (currentGuess.length < WORD_LEN) {
                showMessage('A palavra precisa ter 5 letras!', '#facc15');
                setTimeout(() => showMessage(''), 1500);
                return;
            }
            guesses.push(currentGuess);
            const won = currentGuess === targetWord;
            if (won || guesses.length >= MAX_TRIES) {
                gameOver = true;
                saveState();
                renderGrid();
                renderKeyboard();
                updateStatusBar();
                if (won) {
                    showMessage('🎉 Incrível! Você acertou!', '#22c55e');
                    // +XP bônus — salva no localStorage
                    const xpKey = 'wordleXP_' + new Date().toLocaleDateString('pt-BR');
                    if (!localStorage.getItem(xpKey)) {
                        localStorage.setItem(xpKey, 'won');
                    }
                } else {
                    showMessage(`😔 Era: ${targetWord}`, '#ff416c');
                }
                startCountdown();
                saveScoreToDB(won, guesses.length);
            } else {
                saveState();
                currentGuess = '';
                renderGrid();
                renderKeyboard();
            }
            return;
        }
        if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LEN) {
            currentGuess += key;
            renderGrid();
            renderKeyboard();
        }
    }

    function initWordle() {
        if (!document.getElementById('wordleGrid')) return;
        targetWord = getTodayWord();
        currentGuess = '';
        loadState();
        renderGrid();
        renderKeyboard();
        updateStatusBar();
        if (gameOver) {
            const won = guesses.some(g => g === targetWord);
            showMessage(won ? '🎉 Você já venceu hoje!' : `😔 Palavra era: ${targetWord}`, won ? '#22c55e' : '#ff416c');
            startCountdown();
            // Tenta salvar no banco caso o usuário tenha jogado antes de lançarmos o ranking
            saveScoreToDB(won, guesses.length);
        }
        fetchMinigameScores();
        
        // Adiciona botão de refresh no ranking
        const leaderboard = document.getElementById('wordleLeaderboard');
        if (leaderboard && !document.getElementById('refreshRankingBtn')) {
            const btn = document.createElement('button');
            btn.id = 'refreshRankingBtn';
            btn.textContent = '🔄 Atualizar Ranking';
            btn.style.cssText = 'margin-top: 15px; width: 100%; padding: 8px; background: rgba(142,110,255,0.2); border: 1px solid #8e6eff; border-radius: 8px; color: #8e6eff; cursor: pointer; font-size: 0.9em;';
            btn.onclick = fetchMinigameScores;
            leaderboard.appendChild(btn);
        }
    }

    async function fetchMinigameScores() {
        const list = document.getElementById('wordleLeaderboardList');
        if (!window.supabaseClient) {
            if (list) list.innerHTML = '<p style="color: #f59e0b; text-align: center; margin: 0; font-size: 0.9em;">⚠️ Banco de dados não conectado. Verifique a tabela <strong>minigame_scores</strong> no Supabase.</p>';
            return;
        }
        try {
            if (list) list.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Carregando...</p>';
            const todayStr = new Date().toLocaleDateString('pt-BR');
            const { data, error } = await window.supabaseClient
                .from('minigame_scores')
                .select('*')
                .eq('data_jogo', todayStr)
                .order('tentativas', { ascending: true });
            
            if (error) throw error;
            renderLeaderboard(data);
        } catch (e) {
            console.error("Erro ao carregar ranking", e);
            if (list) {
                list.innerHTML = `<p style="color: #ff416c; text-align: center; margin: 0; font-size: 0.9em;">❌ Erro: ${e.message}. Crie a tabela 'minigame_scores' no Supabase.</p>`;
            }
        }
    }

    function renderLeaderboard(scores) {
        const list = document.getElementById('wordleLeaderboardList');
        if (!list) return;
        if (!scores || scores.length === 0) {
            list.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Ninguém jogou hoje ainda. Seja o primeiro!</p>';
            return;
        }

        // Ordenar: primeiro quem venceu, depois por tentativas, depois quem perdeu
        const sorted = [...scores].sort((a, b) => {
            if (a.venceu && !b.venceu) return -1;
            if (!a.venceu && b.venceu) return 1;
            if (a.venceu && b.venceu) return a.tentativas - b.tentativas;
            return 0; // ambos perderam
        });

        let html = '';
        sorted.forEach((s, i) => {
            let icon = s.venceu ? '🎉' : '🔴';
            if (i === 0 && s.venceu) icon = '🥇';
            else if (i === 1 && s.venceu) icon = '🥈';
            else if (i === 2 && s.venceu) icon = '🥉';

            let desc = s.venceu ? `${s.tentativas} tentativa(s)` : `Não acertou`;
            html += `
                <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="font-weight: bold; color: white;">${icon} ${s.usuario}</span>
                    <span style="color: ${s.venceu ? '#22c55e' : '#ff416c'}; font-size: 0.9em;">${desc}</span>
                </div>
            `;
        });
        list.innerHTML = html;
    }

    async function saveScoreToDB(won, attempts) {
        if (!window.supabaseClient) return;
        const loggedInUser = localStorage.getItem('currentUser'); // chave correta
        if (!loggedInUser) return;
        
        try {
            const todayStr = new Date().toLocaleDateString('pt-BR');
            // Check se já salvou hoje
            const { data } = await supabaseClient
                .from('minigame_scores')
                .select('id')
                .eq('usuario', loggedInUser)
                .eq('data_jogo', todayStr);

            if (data && data.length > 0) return; // Ja salvou

            await supabaseClient.from('minigame_scores').insert([{
                usuario: loggedInUser,
                data_jogo: todayStr,
                tentativas: attempts,
                venceu: won
            }]);
            fetchMinigameScores(); // Recarrega placar
            if (window.updateMinigameAchievements) window.updateMinigameAchievements('termo');
        } catch (e) {
            console.error("Erro ao salvar pontuacao", e);
        }
    }

    // Keyboard listener
    document.addEventListener('keydown', (e) => {
        // Only active when mini-game tab is visible
        const tab = document.getElementById('tab-minigame');
        if (!tab || tab.style.display === 'none') return;
        const key = e.key.toUpperCase();
        if (key === 'BACKSPACE') handleKey('BACKSPACE');
        else if (key === 'ENTER') handleKey('ENTER');
        else if (/^[A-Z]$/.test(key)) handleKey(key);
    });

    // Init immediately since script is deferred and DOM is ready
    initWordle();
    
    // Export globally just in case
    window.initWordle = initWordle;

})();

// =============================================
// CAÇA-PALAVRAS DIÁRIO
// =============================================
(function() {
    const ALL_WORDS = [
        "LEAD", "FUNIL", "VENDA", "METRICA", "CLIENTE", "RETORNO", "LUCRO", "EQUIPE", 
        "PROJETO", "AGIL", "FUTURO", "DADOS", "CLOUD", "SISTEMA", "REDE", "INOVACAO",
        "MARCA", "DESIGN", "CODIGO", "TESTE", "ACESSO", "IMPACTO", "VALOR", "CUSTO",
        "IDEIA", "TEMPO", "METAS", "FOCO", "PLANO", "MERCADO", "NUVEM", "BUSCA",
        "CANAL", "AUDIO", "VIDEO", "MIDIA", "TEXTO", "EMAIL", "SITE", "APP", "MOBILE",
        // Novas palavras gerais (portugues)
        "AMOR", "NATUREZA", "SORRISO", "FAMILIA", "VIAGEM", "SONHO", "AMIGO",
        "ALEGRIA", "CORAGEM", "SUCESSO", "TRABALHO", "ESTUDO", "LIVRO", "MUSICA", "ARTE",
        "ESPORTE", "SAUDE", "VIDA", "MUNDO", "CIDADE", "PRAIA", "ESTRELA",
        "CRIANCA", "ESCOLA", "FLOR", "ANIMAL", "GATO", "CACHORRO", "CARRO", "AVIAO",
        "BARCO", "FESTA", "BOLO", "DOCE", "AGUA", "FOGO", "TERRA", "VENTO", "LUZ", "SOM",
        "ROUPA", "SAPATO", "RELOGIO", "FOTO", "CINEMA", "TEATRO", "MUSEU", "PARQUE",
        "ARVORE", "MONTANHA", "OCEANO", "NUVEM", "CHUVA", "NEVE",
        "FRIO", "CALOR", "INVERNO", "VERAO", "OUTONO", "PRIMAVERA", "NOITE",
        "MANHA", "TARDE", "HOJE", "AMANHA", "ONTEM", "SEMANA", "SECULO",
        "HISTORIA", "CIENCIA", "FISICA", "QUIMICA", "BIOLOGIA", "GEOGRAFIA",
        "SABEDORIA", "VERDADE", "MENTIRA", "RESPEITO", "LIBERDADE", "EMPATIA",
        "CORACAO", "ESPERANCA", "FUTURO", "PASSADO", "PRESENTE", "VITORIA",
        "PODER", "FORCA", "ENERGIA", "CAMINHO", "DESTINO", "SORTE", "VIAGEM",
        "INVERNO", "ESTRADA", "FLORESTA", "DESERTO", "PLANETA", "UNIVERSO",
        "AMIZADE", "CARINHO", "ABRACO", "SAUDADE", "LEMBRANCA", "MEMORIA"
    ].map(w => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase());

    const GRID_SIZE = 10;
    let grid = [];
    let wordsToFind = [];
    let foundWords = [];
    let isSelecting = false;
    let startCell = null;
    let currentPath = [];

    function randomSeed(seed) {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    function generateDailyGame() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
            hash = (hash << 5) - hash + dateStr.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        let seed = Math.abs(hash) + 1234;

        wordsToFind = [];
        let tempWords = [...ALL_WORDS];
        for (let i = 0; i < 5; i++) {
            const idx = Math.floor(randomSeed(seed++) * tempWords.length);
            wordsToFind.push(tempWords.splice(idx, 1)[0]);
        }

        grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));

        wordsToFind.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                attempts++;
                const dir = Math.floor(randomSeed(seed++) * 3); 
                const row = Math.floor(randomSeed(seed++) * GRID_SIZE);
                const col = Math.floor(randomSeed(seed++) * GRID_SIZE);

                let dRow = dir === 1 || dir === 2 ? 1 : 0;
                let dCol = dir === 0 || dir === 2 ? 1 : 0;

                let fits = true;
                for (let i = 0; i < word.length; i++) {
                    let r = row + dRow * i;
                    let c = col + dCol * i;
                    if (r >= GRID_SIZE || c >= GRID_SIZE || (grid[r][c] !== '' && grid[r][c] !== word[i])) {
                        fits = false;
                        break;
                    }
                }

                if (fits) {
                    for (let i = 0; i < word.length; i++) {
                        grid[row + dRow * i][col + dCol * i] = word[i];
                    }
                    placed = true;
                }
            }
        });

        const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === '') {
                    grid[r][c] = LETTERS[Math.floor(randomSeed(seed++) * LETTERS.length)];
                }
            }
        }
    }

    function loadState() {
        const todayKey = 'cacaPalavras_' + new Date().toLocaleDateString('pt-BR');
        const state = JSON.parse(localStorage.getItem(todayKey) || '{}');
        if (state && state.foundWords) {
            foundWords = state.foundWords;
        } else {
            foundWords = [];
        }
    }

    function saveState() {
        const todayKey = 'cacaPalavras_' + new Date().toLocaleDateString('pt-BR');
        localStorage.setItem(todayKey, JSON.stringify({ foundWords }));
    }

    function renderGrid() {
        const container = document.getElementById('wordSearchGrid');
        if (!container) return;
        container.innerHTML = '';
        
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const div = document.createElement('div');
                div.textContent = grid[r][c];
                div.dataset.row = r;
                div.dataset.col = c;
                div.style.cssText = `
                    width: 30px; height: 30px; 
                    display: flex; align-items: center; justify-content: center; 
                    background: rgba(255,255,255,0.05); border-radius: 4px;
                    font-weight: bold; cursor: pointer; transition: all 0.2s;
                    color: white; border: 1px solid rgba(255,255,255,0.1);
                `;

                div.addEventListener('mousedown', (e) => startSelection(r, c, e));
                div.addEventListener('mouseenter', (e) => updateSelection(r, c, e));
                div.addEventListener('touchstart', (e) => { e.preventDefault(); startSelection(r, c, e); });
                div.addEventListener('touchmove', (e) => handleTouchMove(e));
                
                container.appendChild(div);
            }
        }
        document.addEventListener('mouseup', endSelection);
        document.addEventListener('touchend', endSelection);
        updateHighlights();
    }

    function renderWords() {
        const container = document.getElementById('wordSearchWords');
        if (!container) return;
        container.innerHTML = '';
        wordsToFind.forEach(word => {
            const isFound = foundWords.includes(word);
            const div = document.createElement('div');
            
            // Dica: primeira letra e underlines para o resto
            div.textContent = isFound ? word : word[0] + " " + Array(word.length - 1).fill('_').join(' ');
            
            div.style.cssText = `
                padding: 5px 12px; border-radius: 15px; font-weight: bold; font-size: 0.9em;
                background: ${isFound ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)'};
                color: ${isFound ? '#22c55e' : '#a0aec0'};
                border: 1px solid ${isFound ? '#22c55e' : 'rgba(255,255,255,0.1)'};
                letter-spacing: ${isFound ? 'normal' : '2px'};
            `;
            container.appendChild(div);
        });

        const winMsg = document.getElementById('wordSearchWinMsg');
        if (winMsg) {
            if (foundWords.length === wordsToFind.length && wordsToFind.length > 0) {
                winMsg.style.display = 'block';
            } else {
                winMsg.style.display = 'none';
            }
        }
    }

    function updateHighlights() {
        const cells = document.querySelectorAll('#wordSearchGrid div');
        cells.forEach(c => {
            c.style.background = 'rgba(255,255,255,0.05)';
            c.style.color = 'white';
            c.style.borderColor = 'rgba(255,255,255,0.1)';
        });

        foundWords.forEach(word => {
            let painted = false;
            for (let r = 0; r < GRID_SIZE && !painted; r++) {
                for (let c = 0; c < GRID_SIZE && !painted; c++) {
                    for (let dir = 0; dir < 3 && !painted; dir++) {
                        let dRow = dir === 1 || dir === 2 ? 1 : 0;
                        let dCol = dir === 0 || dir === 2 ? 1 : 0;
                        
                        let match = true;
                        let path = [];
                        for (let i = 0; i < word.length; i++) {
                            let currR = r + dRow * i;
                            let currC = c + dCol * i;
                            if (currR >= GRID_SIZE || currC >= GRID_SIZE || grid[currR][currC] !== word[i]) {
                                match = false;
                                break;
                            }
                            path.push({r: currR, c: currC});
                        }
                        if (match) {
                            path.forEach(p => {
                                const el = document.querySelector(`#wordSearchGrid div[data-row="${p.r}"][data-col="${p.c}"]`);
                                if (el) {
                                    el.style.background = 'rgba(34,197,94,0.3)';
                                    el.style.borderColor = '#22c55e';
                                }
                            });
                            painted = true;
                        }
                    }
                }
            }
        });

        currentPath.forEach(p => {
            const el = document.querySelector(`#wordSearchGrid div[data-row="${p.r}"][data-col="${p.c}"]`);
            if (el) {
                el.style.background = '#8e6eff';
                el.style.borderColor = '#8e6eff';
            }
        });
    }

    function startSelection(r, c, e) {
        if (foundWords.length === wordsToFind.length) return;
        isSelecting = true;
        startCell = {r, c};
        currentPath = [{r, c}];
        updateHighlights();
    }

    function handleTouchMove(e) {
        if (!isSelecting) return;
        const touch = e.touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (el && el.dataset.row) {
            updateSelection(parseInt(el.dataset.row), parseInt(el.dataset.col), e);
        }
    }

    function updateSelection(r, c, e) {
        if (!isSelecting || !startCell) return;
        
        let dRow = Math.sign(r - startCell.r);
        let dCol = Math.sign(c - startCell.c);
        let dist = Math.max(Math.abs(r - startCell.r), Math.abs(c - startCell.c));

        if (dRow !== 0 && dCol !== 0 && Math.abs(r - startCell.r) !== Math.abs(c - startCell.c)) {
            return; 
        }

        currentPath = [];
        for (let i = 0; i <= dist; i++) {
            currentPath.push({ r: startCell.r + dRow * i, c: startCell.c + dCol * i });
        }
        updateHighlights();
    }

    function endSelection() {
        if (!isSelecting) return;
        isSelecting = false;
        
        let selectedWord = currentPath.map(p => grid[p.r][p.c]).join('');
        let reversedWord = selectedWord.split('').reverse().join('');
        let wordWasFound = false;

        if (wordsToFind.includes(selectedWord) && !foundWords.includes(selectedWord)) {
            foundWords.push(selectedWord);
            wordWasFound = true;
        } else if (wordsToFind.includes(reversedWord) && !foundWords.includes(reversedWord)) {
            foundWords.push(reversedWord);
            wordWasFound = true;
        }

        if (wordWasFound) {
            if (window.xaropinhoSound) window.xaropinhoSound.play();
            saveState();
            saveCacaPalavrasScoreToDB(foundWords.length);
        }

        currentPath = [];
        updateHighlights();
        renderWords();
    }

    async function fetchCacaPalavrasScores() {
        const list = document.getElementById('cacaPalavrasLeaderboardList');
        if (!window.supabaseClient) {
            if (list) list.innerHTML = '<p style="color: #f59e0b; text-align: center; margin: 0; font-size: 0.9em;">⚠️ Banco não conectado. Verifique a tabela <strong>cacapalavras_scores</strong> no Supabase.</p>';
            return;
        }
        try {
            if (list) list.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Carregando...</p>';
            const todayStr = new Date().toLocaleDateString('pt-BR');
            const { data, error } = await window.supabaseClient
                .from('cacapalavras_scores')
                .select('*')
                .eq('data_jogo', todayStr)
                .order('palavras_achadas', { ascending: false });
            
            if (error) throw error;
            renderCacaPalavrasLeaderboard(data);
        } catch (e) {
            console.error("Erro ao carregar ranking", e);
            if (list) {
                list.innerHTML = `<p style="color: #ff416c; text-align: center; margin: 0; font-size: 0.9em;">❌ Erro: Crie a tabela 'cacapalavras_scores' no Supabase.</p>`;
            }
        }
    }

    function renderCacaPalavrasLeaderboard(scores) {
        const list = document.getElementById('cacaPalavrasLeaderboardList');
        if (!list) return;
        if (!scores || scores.length === 0) {
            list.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Ninguém jogou hoje ainda. Seja o primeiro!</p>';
            return;
        }

        let html = '';
        scores.forEach((s, i) => {
            let icon = s.palavras_achadas === 5 ? '🎉' : '🔍';
            if (i === 0 && s.palavras_achadas === 5) icon = '🥇';
            else if (i === 1 && s.palavras_achadas === 5) icon = '🥈';
            else if (i === 2 && s.palavras_achadas === 5) icon = '🥉';

            html += `
                <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="font-weight: bold; color: white;">${icon} ${s.usuario}</span>
                    <span style="color: ${s.palavras_achadas === 5 ? '#22c55e' : '#facc15'}; font-size: 0.9em;">${s.palavras_achadas}/5 achadas</span>
                </div>
            `;
        });
        list.innerHTML = html;
    }

    async function saveCacaPalavrasScoreToDB(count) {
        if (!window.supabaseClient) return;
        const loggedInUser = localStorage.getItem('currentUser');
        if (!loggedInUser) return;
        
        try {
            const todayStr = new Date().toLocaleDateString('pt-BR');
            const { data } = await window.supabaseClient
                .from('cacapalavras_scores')
                .select('id, palavras_achadas')
                .eq('usuario', loggedInUser)
                .eq('data_jogo', todayStr);

            if (data && data.length > 0) {
                if (data[0].palavras_achadas < count) {
                    await window.supabaseClient.from('cacapalavras_scores').update({ palavras_achadas: count }).eq('id', data[0].id);
                }
            } else {
                await window.supabaseClient.from('cacapalavras_scores').insert([{
                    usuario: loggedInUser,
                    data_jogo: todayStr,
                    palavras_achadas: count
                }]);
            }
            fetchCacaPalavrasScores();
            if (window.updateMinigameAchievements) window.updateMinigameAchievements('caca');
        } catch (e) {
            console.error("Erro ao salvar pontuacao caça-palavras", e);
        }
    }

    function initCacaPalavras() {
        if (!document.getElementById('wordSearchGrid')) return;
        generateDailyGame();
        loadState();
        renderGrid();
        renderWords();
        
        // Sincroniza dados locais antigos no banco (caso o usuário tenha jogado antes de criarmos o ranking)
        if (foundWords.length > 0) {
            saveCacaPalavrasScoreToDB(foundWords.length);
        }
        
        fetchCacaPalavrasScores();

        const leaderboard = document.getElementById('cacaPalavrasLeaderboard');
        if (leaderboard && !document.getElementById('refreshCacaBtn')) {
            const btn = document.createElement('button');
            btn.id = 'refreshCacaBtn';
            btn.textContent = '🔄 Atualizar Ranking';
            btn.style.cssText = 'margin-top: 15px; width: 100%; padding: 8px; background: rgba(142,110,255,0.2); border: 1px solid #8e6eff; border-radius: 8px; color: #8e6eff; cursor: pointer; font-size: 0.9em;';
            btn.onclick = fetchCacaPalavrasScores;
            leaderboard.appendChild(btn);
        }
    }

    async function fetchMonthlyRankings() {
        if (!window.supabaseClient) return;
        const termoList = document.getElementById('monthlyTermoList');
        const cacaList = document.getElementById('monthlyCacaList');
        if (termoList) termoList.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Carregando...</p>';
        if (cacaList) cacaList.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Carregando...</p>';

        const now = new Date();
        const monthStr = String(now.getMonth() + 1).padStart(2, '0');
        const yearStr = String(now.getFullYear());
        const monthSuffix = `/${monthStr}/${yearStr}`;

        try {
            const { data: termoData } = await window.supabaseClient
                .from('minigame_scores')
                .select('usuario, data_jogo')
                .like('data_jogo', `%${monthSuffix}`);
            
            if (termoData) {
                const termoCounts = {};
                termoData.forEach(row => {
                    if (!termoCounts[row.usuario]) termoCounts[row.usuario] = new Set();
                    termoCounts[row.usuario].add(row.data_jogo);
                });
                renderMonthlyList(termoList, termoCounts, '#6841f1');
            }

            const { data: cacaData } = await window.supabaseClient
                .from('cacapalavras_scores')
                .select('usuario, data_jogo, palavras_achadas')
                .like('data_jogo', `%${monthSuffix}`)
                .gt('palavras_achadas', 0);

            if (cacaData) {
                const cacaCounts = {};
                cacaData.forEach(row => {
                    if (!cacaCounts[row.usuario]) cacaCounts[row.usuario] = new Set();
                    cacaCounts[row.usuario].add(row.data_jogo);
                });
                renderMonthlyList(cacaList, cacaCounts, '#facc15');
            }
        } catch (e) {
            console.error("Erro ao carregar ranking mensal", e);
        }
    }

    function renderMonthlyList(container, countsObj, color) {
        if (!container) return;
        const arr = Object.keys(countsObj).map(u => ({
            usuario: u,
            dias: countsObj[u].size
        })).sort((a, b) => b.dias - a.dias);

        if (arr.length === 0) {
            container.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Ninguém jogou neste mês ainda.</p>';
            return;
        }

        let html = '';
        arr.forEach((item, i) => {
            let icon = '🔥';
            if (i === 0) icon = '🥇';
            else if (i === 1) icon = '🥈';
            else if (i === 2) icon = '🥉';

            html += `
                <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="font-weight: bold; color: white;">${icon} ${item.usuario}</span>
                    <span style="color: ${color}; font-size: 0.9em; font-weight: bold;">${item.dias} dias</span>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    document.addEventListener('DOMContentLoaded', () => {
        initCacaPalavras();
        
        const gameBtns = document.querySelectorAll('.game-tab-btn');
        gameBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                gameBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'rgba(255,255,255,0.1)';
                    b.style.color = '#a0aec0';
                });
                btn.classList.add('active');
                btn.style.background = '#6841f1';
                btn.style.color = 'white';
                
                const gameId = btn.getAttribute('data-game');
                document.getElementById('game-wordle').style.display = gameId === 'wordle' ? 'block' : 'none';
                document.getElementById('game-cacaPalavras').style.display = gameId === 'cacaPalavras' ? 'block' : 'none';
                const mensalContainer = document.getElementById('game-mensal');
                if (mensalContainer) mensalContainer.style.display = gameId === 'mensal' ? 'block' : 'none';
                
                if (gameId === 'mensal') {
                    fetchMonthlyRankings();
                }
            });
        });
    });

})();

// --- BOLÃO DA COPA ---
document.addEventListener('DOMContentLoaded', () => {
    const adminBolaoForm = document.getElementById('adminBolaoForm');
    const bolaoTeamA = document.getElementById('bolaoTeamA');
    const bolaoTeamB = document.getElementById('bolaoTeamB');
    const bolaoMatchesList = document.getElementById('bolaoMatchesList');
    const bolaoMatchesCount = document.getElementById('bolaoMatchesCount');
    const adminBolaoPendingContainer = document.getElementById('adminBolaoPendingContainer');
    const bolaoLeaderboardList = document.getElementById('bolaoLeaderboardList');

    // Popula seleções
    COPA_TEAMS.forEach(team => {
        bolaoTeamA.add(new Option(team, team));
        bolaoTeamB.add(new Option(team, team));
    });

    const todayISO = new Date().toISOString().split('T')[0];
    const bolaoDateInput = document.getElementById('bolaoDate');
    if(bolaoDateInput) bolaoDateInput.value = todayISO;

    adminBolaoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = bolaoDateInput.value;
        const timeInput = document.getElementById('bolaoTime');
        const timeVal = timeInput ? timeInput.value : '';
        const ta = bolaoTeamA.value;
        const tb = bolaoTeamB.value;
        const specialInput = document.getElementById('bolaoSpecialCondition');
        const specialVal = specialInput ? specialInput.value : '';
        if (ta === tb) { alert("Os times devem ser diferentes!"); return; }

        if (window.supabaseClient) {
            const btn = e.target.querySelector('button');
            btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Adicionando...';
            const { error } = await window.supabaseClient.from('bolao_matches').insert([{
                match_date: date,
                match_time: timeVal,
                team_a: ta,
                team_b: tb,
                status: 'pending',
                special_condition: specialVal
            }]);
            btn.innerHTML = 'Adicionar Jogo <i data-lucide="plus-circle"></i>';
            if (window.lucide) window.lucide.createIcons();

            if (error) { console.error(error); alert("Erro ao criar jogo"); }
            else { alert("Jogo adicionado!"); initBolao(); }
        }
    });

    window.initBolao = async function initBolao() {
        if (!window.supabaseClient) return;

        const { data: matches } = await window.supabaseClient
            .from('bolao_matches')
            .select('*')
            .order('match_date', { ascending: false })
            .order('id', { ascending: false });

        const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
        let allPredictions = [];
        if (matches && matches.length > 0) {
            const matchIds = matches.map(m => m.id);
            const { data: preds } = await window.supabaseClient
                .from('bolao_predictions')
                .select('*')
                .in('match_id', matchIds);
            if (preds) allPredictions = preds;
        }

        renderBolaoMatches(matches || [], allPredictions, currentUser);

        const { data: pendingMatches } = await window.supabaseClient
            .from('bolao_matches')
            .select('*')
            .eq('status', 'pending')
            .order('match_date', { ascending: false });
        renderBolaoAdminPending(pendingMatches || []);

        const { data: ranking } = await window.supabaseClient
            .from('bolao_predictions')
            .select('username, points_awarded')
            .gt('points_awarded', 0);
        renderBolaoLeaderboard(ranking || []);
    }

    function renderBolaoMatches(matches, allPredictions, currentUser) {
        if (!bolaoMatchesCount || !bolaoMatchesList) return;
        bolaoMatchesCount.textContent = `${matches.length} jogo(s)`;
        if (matches.length === 0) {
            bolaoMatchesList.innerHTML = `<div class="glass-card" style="text-align: center; padding: 20px;"><p style="opacity: 0.6; margin: 0;">Nenhum jogo agendado para hoje.</p></div>`;
            return;
        }
        
        let html = '';
        matches.forEach(m => {
            const matchPreds = allPredictions.filter(p => p.match_id === m.id);
            const pred = currentUser ? matchPreds.find(p => p.username === currentUser) : null;
            let isStarted = false;
            if (m.match_time) {
                const now = new Date();
                const matchDate = new Date(`${m.match_date}T${m.match_time}:00`);
                if (now >= matchDate) {
                    isStarted = true;
                }
            }
            
            const isFinished = m.status === 'finished';
            const disableInput = isFinished || isStarted || pred ? 'disabled' : '';
            const valA = pred ? pred.guess_a : (isFinished ? m.score_a : '');
            const valB = pred ? pred.guess_b : (isFinished ? m.score_b : '');

            let pointsMsg = '';
            if (isFinished && pred) {
                const color = pred.points_awarded === 50 ? '#22c55e' : (pred.points_awarded === 15 ? '#facc15' : '#ff416c');
                pointsMsg = `<div style="text-align: center; margin-top: 15px; background: rgba(34, 197, 94, 0.1); padding: 10px; border-radius: 8px; color: ${color}; font-weight: bold; border: 1px solid ${color};">
                    Você ganhou ${pred.points_awarded} pontos!
                </div>`;
            } else if (pred && !isFinished) {
                pointsMsg = `<div style="text-align: center; margin-top: 15px; color: #a0aec0; font-size: 0.9em;">Palpite registrado! Boa sorte! 🍀</div>`;
            } else if (isStarted && !isFinished && !pred) {
                pointsMsg = `<div style="text-align: center; margin-top: 15px; color: #ff416c; font-size: 0.9em; font-weight: bold;"><i data-lucide="lock" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> Apostas encerradas (O jogo já começou)</div>`;
            }

            let finalScoreHtml = '';
            if (isFinished) {
                finalScoreHtml = `<div style="text-align: center; margin-bottom: 15px; font-weight: bold; color: #22c55e; font-size: 1.1em; background: rgba(34, 197, 94, 0.1); padding: 5px; border-radius: 5px;">🏆 Placar Final: ${m.score_a} x ${m.score_b}</div>`;
            }
            
            const dStr = m.match_date ? m.match_date.split('-').reverse().join('/') : '';
            const matchTimeDisplay = m.match_time ? `<div style="text-align: center; font-size: 0.85em; opacity: 0.6; margin-bottom: 15px;"><i data-lucide="clock" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> ${dStr} às ${m.match_time}</div>` : (dStr ? `<div style="text-align: center; font-size: 0.85em; opacity: 0.6; margin-bottom: 15px;"><i data-lucide="calendar" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> ${dStr}</div>` : '');

            let specialQuestionHtml = '';
            let valSpecial = pred && pred.guess_special !== null ? (pred.guess_special ? 'true' : 'false') : 'none';
            if (m.special_condition) {
                specialQuestionHtml = `
                    <div style="margin-top: 15px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
                        <strong style="color: #facc15; font-size: 0.9em; text-transform: uppercase;">Aposta Bônus (+10pts)</strong>
                        <p style="margin: 5px 0 10px; font-size: 0.95em;">${m.special_condition}</p>
                        <div style="display: flex; justify-content: center; gap: 15px;">
                            <label style="cursor: pointer; opacity: ${disableInput ? '0.6' : '1'}; display: flex; align-items: center; gap: 5px;">
                                <input type="radio" name="guess_special_${m.id}" value="true" ${valSpecial === 'true' ? 'checked' : ''} ${disableInput}> Sim
                            </label>
                            <label style="cursor: pointer; opacity: ${disableInput ? '0.6' : '1'}; display: flex; align-items: center; gap: 5px;">
                                <input type="radio" name="guess_special_${m.id}" value="false" ${valSpecial === 'false' ? 'checked' : ''} ${disableInput}> Não
                            </label>
                        </div>
                    </div>
                `;
            }

            html += `
            <div class="glass-card" style="padding: 25px; transition: transform 0.2s;">
                ${finalScoreHtml}
                ${matchTimeDisplay}
                <div style="display: flex; justify-content: center; align-items: center; gap: 15px;">
                    <div style="flex: 1; text-align: right; font-weight: bold; font-size: 1.2em; color: white;">${m.team_a}</div>
                    <input type="number" id="guess_a_${m.id}" value="${valA}" ${disableInput} style="width: 60px; height: 60px; text-align: center; font-size: 1.5em; border-radius: 12px; border: 2px solid ${pred?'transparent':'rgba(255,255,255,0.2)'}; background: ${pred?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.05)'}; color: white; padding: 0; box-sizing: border-box;" min="0">
                    <span style="font-weight: bold; color: rgba(255,255,255,0.3); font-size: 1.2em;">X</span>
                    <input type="number" id="guess_b_${m.id}" value="${valB}" ${disableInput} style="width: 60px; height: 60px; text-align: center; font-size: 1.5em; border-radius: 12px; border: 2px solid ${pred?'transparent':'rgba(255,255,255,0.2)'}; background: ${pred?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.05)'}; color: white; padding: 0; box-sizing: border-box;" min="0">
                    <div style="flex: 1; text-align: left; font-weight: bold; font-size: 1.2em; color: white;">${m.team_b}</div>
                </div>
                ${specialQuestionHtml}
                ${!pred && !isFinished && !isStarted ? `<div style="text-align: center; margin-top: 20px;"><button class="pulse-button" onclick="window.submitBolaoPrediction(${m.id})" style="padding: 10px 25px; background: #22c55e; border: none; border-radius: 8px; color: #0f0a1e; font-weight: bold; cursor: pointer; width: 100%;">Confirmar Palpite</button></div>` : ''}
                ${pointsMsg}
                ${matchPreds.length > 0 ? `
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85em;">
                    <div style="opacity: 0.6; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; font-size: 0.9em;"><i data-lucide="users" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> Palpites do Time:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${matchPreds.map(p => {
                            const isMe = currentUser && p.username === currentUser;
                            let specialLabel = '';
                            if (m.special_condition && p.guess_special !== null) {
                                specialLabel = p.guess_special ? ' <span style="color:#facc15;font-size:0.85em;margin-left:4px;">(Bônus: Sim)</span>' : ' <span style="opacity:0.6;font-size:0.85em;margin-left:4px;">(Bônus: Não)</span>';
                            }
                            return `<span style="background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); color: ${isMe ? '#02ceff' : '#e2e8f0'};">
                                <strong>${p.username}</strong>: ${p.guess_a}x${p.guess_b}${specialLabel}
                            </span>`;
                        }).join('')}
                    </div>
                </div>` : ''}
            </div>
            `;
        });
        bolaoMatchesList.innerHTML = html;
        
        let missingCount = 0;
        matches.forEach(m => {
            const matchPreds = allPredictions.filter(p => p.match_id === m.id);
            const pred = currentUser ? matchPreds.find(p => p.username === currentUser) : null;
            let isStarted = false;
            if (m.match_time) {
                const now = new Date();
                const matchDate = new Date(`${m.match_date}T${m.match_time}:00`);
                if (now >= matchDate) isStarted = true;
            }
            if (m.status !== 'finished' && !isStarted && !pred) missingCount++;
        });

        const existingPopup = document.getElementById('bolaoReminderPopup');
        if (missingCount > 0 && currentUser) {
            if (!existingPopup) {
                const popup = document.createElement('div');
                popup.id = 'bolaoReminderPopup';
                popup.style = "position: fixed; bottom: 20px; right: 20px; background: rgba(34, 197, 94, 0.95); color: white; padding: 15px 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 10000; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); transition: transform 0.3s; animation: slideUp 0.3s ease-out;";
                popup.innerHTML = `
                    <style>
                    @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    #bolaoReminderPopup:hover { transform: scale(1.05); }
                    </style>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i data-lucide="alert-circle" style="width: 24px; height: 24px; color: #0f0a1e;"></i>
                        <div>
                            <h4 style="margin: 0; font-size: 1.1em; color: #0f0a1e; font-weight: 800; text-transform: uppercase;">Bolão da Copa</h4>
                            <p id="bolaoReminderText" style="margin: 3px 0 0; font-size: 0.9em; color: #0f0a1e; font-weight: 600;">Faltam ${missingCount} palpite(s) de hoje!</p>
                        </div>
                    </div>
                `;
                popup.onclick = () => {
                    const bolaoTabBtn = document.querySelector('.tab-btn[data-target="tab-bolao"]');
                    if (bolaoTabBtn) bolaoTabBtn.click();
                    popup.style.transform = 'scale(0.9)';
                    setTimeout(() => popup.style.transform = 'scale(1)', 150);
                };
                document.body.appendChild(popup);
                if (window.lucide) window.lucide.createIcons();
            } else {
                document.getElementById('bolaoReminderText').innerText = `Faltam ${missingCount} palpite(s) de hoje!`;
                existingPopup.style.display = 'block';
            }
        } else if (existingPopup) {
            existingPopup.style.display = 'none';
        }
    }

    window.submitBolaoPrediction = async function(matchId) {
        const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
        if (!currentUser) { alert("Ops! Você precisa se identificar (selecione seu nome na aba Radar) para poder dar palpites."); return; }
        
        const ga = document.getElementById('guess_a_'+matchId).value;
        const gb = document.getElementById('guess_b_'+matchId).value;
        
        if (ga === '' || gb === '') { alert("Preencha o placar dos dois times!"); return; }

        let guessSpecial = null;
        const specialRadios = document.getElementsByName('guess_special_'+matchId);
        if (specialRadios && specialRadios.length > 0) {
            let selected = false;
            for (let r of specialRadios) {
                if (r.checked) {
                    guessSpecial = r.value === 'true';
                    selected = true;
                    break;
                }
            }
            if (!selected) {
                alert("Por favor, responda a Aposta Bônus (Sim ou Não)!");
                return;
            }
        }

        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Enviando...';
        btn.disabled = true;

        if (window.supabaseClient) {
            const { error } = await window.supabaseClient.from('bolao_predictions').insert([{
                match_id: matchId,
                username: currentUser,
                guess_a: parseInt(ga),
                guess_b: parseInt(gb),
                guess_special: guessSpecial
            }]);
            if (error) { 
                console.error(error); 
                alert("Erro ao enviar palpite"); 
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
            else { initBolao(); }
        }
    }

    function renderBolaoAdminPending(matches) {
        if (!adminBolaoPendingContainer) return;
        if (matches.length === 0) {
            adminBolaoPendingContainer.innerHTML = '<div class="glass-card" style="padding: 15px;"><p style="margin: 0; opacity: 0.5;">Nenhum jogo pendente.</p></div>';
            return;
        }
        let html = '';
        matches.forEach(m => {
            // format date
            const d = m.match_date.split('-').reverse().join('/');
            const t = m.match_time ? ` às ${m.match_time}` : '';
            
            let specialHtml = '';
            if (m.special_condition) {
                specialHtml = `
                    <div style="margin-top: 10px; font-size: 0.85em; opacity: 0.9;">
                        <strong>Condição:</strong> ${m.special_condition}
                        <select id="special_result_${m.id}" style="margin-left: 10px; background: rgba(0,0,0,0.4); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 2px 5px;">
                            <option value="none">-- Escolha --</option>
                            <option value="true">Sim (+10pts)</option>
                            <option value="false">Não</option>
                        </select>
                    </div>
                `;
            }
            
            html += `
            <div class="glass-card" style="padding: 15px; display: flex; align-items: center; justify-content: space-between; border-left: 3px solid #facc15;">
                <div style="flex: 1;">
                    <div style="font-size: 0.75em; opacity: 0.6; margin-bottom: 4px;"><i data-lucide="calendar"></i> ${d}${t}</div>
                    <strong style="color: white;">${m.team_a} <span style="opacity:0.5;">x</span> ${m.team_b}</strong>
                    ${specialHtml}
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="number" id="final_a_${m.id}" style="width: 45px; height: 35px; text-align: center; border-radius: 5px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; padding: 0; box-sizing: border-box;" placeholder="A">
                    <span style="opacity:0.5; font-size:0.8em;">x</span>
                    <input type="number" id="final_b_${m.id}" style="width: 45px; height: 35px; text-align: center; border-radius: 5px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; padding: 0; box-sizing: border-box;" placeholder="B">
                    <button class="btn-primary" onclick="window.resolveBolaoMatch(${m.id})" style="padding: 8px 12px; background: #facc15; color: #0f0a1e; margin-left: 5px;" title="Resolver"><i data-lucide="check"></i></button>
                    <button class="btn-primary" onclick="window.deleteBolaoMatch(${m.id})" style="padding: 8px 12px; background: #ff416c; color: #fff; margin-left: 5px;" title="Excluir"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
            `;
        });
        adminBolaoPendingContainer.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    }

    window.deleteBolaoMatch = async function(matchId) {
        if (confirm("Tem certeza que deseja excluir este jogo? Todos os palpites atrelados a ele também poderão ser perdidos.")) {
            if (window.supabaseClient) {
                const { error } = await window.supabaseClient.from('bolao_matches').delete().eq('id', matchId);
                if (error) {
                    alert("Erro ao excluir: " + error.message);
                } else {
                    alert("Jogo excluído com sucesso.");
                    initBolao();
                }
            }
        }
    }

    window.resolveBolaoMatch = async function(matchId) {
        const fa = parseInt(document.getElementById('final_a_'+matchId).value);
        const fb = parseInt(document.getElementById('final_b_'+matchId).value);
        if (isNaN(fa) || isNaN(fb)) { alert("Preencha o placar final corretamente!"); return; }

        let specialResult = null;
        const specialSelect = document.getElementById('special_result_'+matchId);
        if (specialSelect) {
            if (specialSelect.value === 'none') {
                alert("Selecione se a condição especial aconteceu ou não!"); return;
            }
            specialResult = specialSelect.value === 'true';
        }

        if (confirm(`Confirmar o resultado de ${fa} x ${fb}? Esta ação encerrará o jogo e distribuirá os pontos.`)) {
            const btn = event.target.closest('button');
            btn.disabled = true;
            btn.innerHTML = '...';

            if (window.supabaseClient) {
                await window.supabaseClient.from('bolao_matches').update({ status: 'finished', score_a: fa, score_b: fb, special_result: specialResult }).eq('id', matchId);
                
                const { data: preds } = await window.supabaseClient.from('bolao_predictions').select('*').eq('match_id', matchId);
                if (preds) {
                    for (let p of preds) {
                        let pts = 0;
                        if (p.guess_a === fa && p.guess_b === fb) {
                            pts = 50; 
                        } else {
                            const matchResult = Math.sign(fa - fb);
                            const guessResult = Math.sign(p.guess_a - p.guess_b);
                            if (matchResult === guessResult) pts = 15;
                        }
                        
                        if (specialResult !== null && p.guess_special !== null && p.guess_special === specialResult) {
                            pts += 10;
                        }

                        if (pts > 0) {
                            await window.supabaseClient.from('bolao_predictions').update({ points_awarded: pts }).eq('id', p.id);
                        }
                    }
                }
                alert("Resultado salvo! Pontos do bolão calculados e distribuídos.");
                initBolao();
            }
        }
    }

    function renderBolaoLeaderboard(rankingData) {
        if (!bolaoLeaderboardList) return;
        const scores = {};
        rankingData.forEach(r => {
            // Normalizar o nome para juntar pontuações da mesma pessoa (evita erros de case)
            let name = (r.username || "Desconhecido").toUpperCase();
            scores[name] = (scores[name] || 0) + (r.points_awarded || 0);
        });

        const arr = Object.keys(scores).map(u => ({ username: u, pts: scores[u] })).sort((a,b) => b.pts - a.pts);

        if (arr.length === 0) {
            bolaoLeaderboardList.innerHTML = '<p style="opacity: 0.5; text-align: center; margin: 0;">Nenhum ponto registrado ainda na copa.</p>';
            return;
        }

        let html = '';
        arr.forEach((item, i) => {
            let icon = '⚽';
            let style = '';
            if (i === 0) { icon = '🥇'; style = 'border: 1px solid #ffd700; background: rgba(255, 215, 0, 0.1); transform: scale(1.02);'; }
            else if (i === 1) { icon = '🥈'; style = 'border: 1px solid #c0c0c0; background: rgba(192, 192, 192, 0.1);'; }
            else if (i === 2) { icon = '🥉'; style = 'border: 1px solid #cd7f32; background: rgba(205, 127, 50, 0.1);'; }

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 5px; ${style}">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2em;">${icon}</span>
                        <span style="font-weight: bold; color: white;">${item.username}</span>
                    </div>
                    <div style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.9em; box-shadow: 0 0 10px rgba(34,197,94,0.2);">
                        ${item.pts} pts
                    </div>
                </div>
            `;
        });
        bolaoLeaderboardList.innerHTML = html;
    }

    // Chama a renderizacao inicial
    window.initBolao();
});

// --- MOOD PICKER INTERACTIVITY ---
document.addEventListener('DOMContentLoaded', () => {
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            moodOptions.forEach(o => {
                o.style.border = '2px solid transparent';
                o.style.background = 'rgba(255,255,255,0.05)';
                o.style.transform = 'scale(1)';
            });
            opt.style.border = '2px solid #f472b6';
            opt.style.background = 'rgba(244, 114, 182, 0.15)';
            opt.style.transform = 'scale(1.15)';
        });
    });
});

// --- MURAL DE FOTOS ---
document.addEventListener('DOMContentLoaded', () => {
    const photoDropzone = document.getElementById('photoDropzone');
    const photoFileInput = document.getElementById('photoFileInput');
    const photoPreview = document.getElementById('photoPreview');
    const photoCaption = document.getElementById('photoCaption');
    const photoSubmitBtn = document.getElementById('photoSubmitBtn');
    const photoGallery = document.getElementById('photoGallery');

    if (!photoDropzone || !photoGallery) return;

    let selectedPhotoBase64 = null;

    // Dropzone click
    photoDropzone.addEventListener('click', () => photoFileInput.click());

    // Dropzone drag events
    photoDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoDropzone.style.borderColor = '#f472b6';
        photoDropzone.style.background = 'rgba(244, 114, 182, 0.1)';
    });
    photoDropzone.addEventListener('dragleave', () => {
        photoDropzone.style.borderColor = 'rgba(244, 114, 182, 0.4)';
        photoDropzone.style.background = 'rgba(255,255,255,0.02)';
    });
    photoDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        photoDropzone.style.borderColor = 'rgba(244, 114, 182, 0.4)';
        photoDropzone.style.background = 'rgba(255,255,255,0.02)';
        if (e.dataTransfer.files.length > 0) {
            handlePhotoFile(e.dataTransfer.files[0]);
        }
    });

    photoFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handlePhotoFile(e.target.files[0]);
    });

    function handlePhotoFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem.');
            return;
        }
        // Resize and compress
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 600;
                let w = img.width, h = img.height;
                if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
                else { if (h > MAX) { w = w * MAX / h; h = MAX; } }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                selectedPhotoBase64 = canvas.toDataURL('image/jpeg', 0.7);
                photoPreview.src = selectedPhotoBase64;
                photoPreview.style.display = 'block';
                photoSubmitBtn.disabled = false;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Submit photo
    photoSubmitBtn.addEventListener('click', async () => {
        if (!selectedPhotoBase64 || !window.supabaseClient) return;
        const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
        if (!currentUser) { alert('Faça login primeiro!'); return; }

        photoSubmitBtn.disabled = true;
        photoSubmitBtn.textContent = 'Enviando...';

        try {
            const entry = {
                username: currentUser,
                sugestao: 'FOTO:' + JSON.stringify({
                    photo: selectedPhotoBase64,
                    caption: photoCaption.value.trim() || '',
                    timestamp: new Date().toISOString()
                }),
                created_at: new Date().toISOString()
            };
            const { error } = await window.supabaseClient.from('sugestoes').insert([entry]);
            if (error) throw error;
            
            if (typeof showToast === 'function') showToast('Foto publicada no mural! 📸', 'success');
            selectedPhotoBase64 = null;
            photoPreview.style.display = 'none';
            photoCaption.value = '';
            photoFileInput.value = '';
            loadPhotoGallery();
        } catch (err) {
            alert('Erro ao publicar foto: ' + err.message);
        } finally {
            photoSubmitBtn.disabled = false;
            photoSubmitBtn.innerHTML = '<i data-lucide="send" style="width:16px;height:16px;vertical-align:middle;"></i> Publicar no Mural';
            if (window.lucide) window.lucide.createIcons();
        }
    });

    // Load and render gallery
    async function loadPhotoGallery() {
        if (!window.supabaseClient) return;
        try {
            const { data, error } = await window.supabaseClient
                .from('sugestoes')
                .select('*')
                .like('sugestao', 'FOTO:%')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                photoGallery.innerHTML = '<div style="text-align: center; padding: 40px; opacity: 0.5; grid-column: 1/-1;">Nenhuma foto ainda. Seja o primeiro a postar! 📷</div>';
                return;
            }

            const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
            const normStr = (s) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";
            const currentU = normStr(currentUser || '');
            const isAdmin = ['VANESSA', 'BRUNO', 'VITOR', 'LEANDRO'].includes(currentU);

            photoGallery.innerHTML = data.map(item => {
                try {
                    const jsonStr = item.sugestao.replace('FOTO:', '');
                    const photo = JSON.parse(jsonStr);
                    const date = new Date(photo.timestamp || item.created_at);
                    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    const rotation = (Math.random() * 6 - 3).toFixed(1);
                    const canDelete = normStr(item.username) === currentU || isAdmin;

                    return `
                    <div class="polaroid-card" style="
                        background: white;
                        padding: 12px 12px 40px 12px;
                        border-radius: 4px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3);
                        transform: rotate(${rotation}deg);
                        transition: all 0.3s ease;
                        position: relative;
                    " onmouseenter="this.style.zIndex='10';"
                       onmouseleave="this.style.zIndex='1';">
                        <img src="${photo.photo}" alt="${photo.caption}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; border-radius: 2px;">
                        <div style="padding: 10px 4px 0; font-family: 'Segoe UI', sans-serif;">
                            ${photo.caption ? `<p style="color: #333; font-size: 0.9em; margin: 0 0 6px; font-style: italic; word-wrap: break-word;">"${photo.caption}"</p>` : ''}
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: #888; font-size: 0.75em;">${item.username} • ${dateStr} ${timeStr}</span>
                                ${canDelete ? `<button onclick="window.deletePhoto(${item.id})" style="background: none; border: none; color: #ff416c; cursor: pointer; font-size: 0.75em; padding: 2px 6px;">✕</button>` : ''}
                             </div>
                            ${window.generateReactionBar(item.id, 'sugestoes', photo.reactions || {})}
                        </div>
                    </div>`;
                } catch (e) {
                    console.error("Error rendering photo:", e);
                    return `<div style="color:red; background:white; padding:10px;">Erro: ${e.message}</div>`;
                }
            }).join('');
        } catch (err) {
            photoGallery.innerHTML = '<div style="text-align: center; padding: 40px; opacity: 0.5; grid-column: 1/-1;">Erro ao carregar fotos.</div>';
        }
    }

    window.deletePhoto = async function(id) {
        if (!confirm('Remover esta foto do mural?')) return;
        try {
            await window.supabaseClient.from('sugestoes').delete().eq('id', id);
            if (typeof showToast === 'function') showToast('Foto removida!', 'error');
            loadPhotoGallery();
        } catch (e) {
            alert('Erro ao remover: ' + e.message);
        }
    };

    // Initial load
    loadPhotoGallery();
    // Refresh when tab is clicked
    const fotosTabBtn = document.querySelector('[data-target="tab-fotos"]');
    if (fotosTabBtn) {
        fotosTabBtn.addEventListener('click', loadPhotoGallery);
    }

    // ==========================================
    // ENQUETES GLOBAIS E NOTIFICAÇÃO DE FOTOS
    // ==========================================

    const addPollOptionBtn = document.getElementById('addPollOptionBtn');
    const extraPollOptions = document.getElementById('extraPollOptions');
    if (addPollOptionBtn && extraPollOptions) {
        addPollOptionBtn.addEventListener('click', () => {
            const inputsCount = document.querySelectorAll('.poll-option-input').length;
            if (inputsCount >= 10) {
                if (typeof window.showToast === 'function') window.showToast('Máximo de 10 opções atingido!', 'error');
                return;
            }
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'poll-option-input';
            input.placeholder = `Opção ${inputsCount + 1}`;
            input.required = true;
            input.style.cssText = 'padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white;';
            extraPollOptions.appendChild(input);
        });
    }

    const pollCreationForm = document.getElementById('pollCreationForm');
    if (pollCreationForm) {
        pollCreationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = pollCreationForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            
            const questionVal = document.getElementById('pollQuestion').value;
            const optionInputs = document.querySelectorAll('.poll-option-input');
            const optionsArr = Array.from(optionInputs).map(inp => inp.value.trim()).filter(val => val !== '');
            
            if (optionsArr.length < 2) {
                if (typeof window.showToast === 'function') window.showToast('Insira pelo menos 2 opções!', 'error');
                submitBtn.disabled = false;
                return;
            }
            
            const votesObj = {};
            optionsArr.forEach(opt => {
                votesObj[opt] = [];
            });
            
            const expiry = new Date();
            expiry.setHours(23, 59, 59, 999);
            
            const pollData = {
                pergunta: questionVal,
                opcoes: optionsArr,
                votos: votesObj,
                criado_em: new Date().toISOString(),
                expira_em: expiry.toISOString()
            };
            
            const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser') || 'Anônimo';
            
            try {
                const { error } = await window.supabaseClient.from('sugestoes').insert({
                    username: currentUser,
                    sugestao: 'ENQUETE:' + JSON.stringify(pollData)
                });
                
                if (error) throw error;
                
                if (typeof window.showToast === 'function') window.showToast('Enquete lançada com sucesso! 🗳️', 'success');
                pollCreationForm.reset();
                if (extraPollOptions) extraPollOptions.innerHTML = '';
                loadEnquetes();
            } catch(err) {
                alert('Erro ao criar enquete: ' + err.message);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    let activePoll = null;
    
    async function loadEnquetes() {
        if (!window.supabaseClient) return;
        
        const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
        const normStr = (s) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";
        const currentU = normStr(currentUser || '');
        
        const creatorCard = document.getElementById('creatorPollCard');
        if (creatorCard) {
            creatorCard.style.display = 'block';
        }
        
        try {
            const { data, error } = await window.supabaseClient
                .from('sugestoes')
                .select('*')
                .like('sugestao', 'ENQUETE:%')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            const activePollContainer = document.getElementById('activePollContainer');
            const expiredPollsContainer = document.getElementById('expiredPollsContainer');
            
            const activeList = [];
            const expiredList = [];
            const now = new Date();
            
            if (data) {
                data.forEach(item => {
                    try {
                        const jsonStr = item.sugestao.replace('ENQUETE:', '');
                        const poll = JSON.parse(jsonStr);
                        poll.id = item.id;
                        
                        const expDate = new Date(poll.expira_em);
                        if (expDate > now) {
                            activeList.push(poll);
                        } else {
                            expiredList.push(poll);
                        }
                    } catch(e) {}
                });
            }
            
            if (activeList.length > 0) {
                activePoll = activeList[0];
                
                let userVoted = false;
                let userVoteChoice = '';
                for (const opt in activePoll.votos) {
                    if (activePoll.votos[opt].includes(currentUser)) {
                        userVoted = true;
                        userVoteChoice = opt;
                        break;
                    }
                }
                
                let totalVotes = 0;
                for (const opt in activePoll.votos) {
                    totalVotes += activePoll.votos[opt].length;
                }
                
                let activeHtml = `
                    <div class="glass-card" style="padding: 30px; border-left: 4px solid #8e6eff;">
                        <span style="background: rgba(142, 110, 255, 0.2); color: #8e6eff; padding: 4px 10px; border-radius: 20px; font-size: 0.75em; font-weight: bold; text-transform: uppercase;">Enquete Ativa</span>
                        <h3 style="color: white; margin: 15px 0; font-size: 1.4em;">${activePoll.pergunta}</h3>
                `;
                
                if (userVoted) {
                    activeHtml += `<div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">`;
                    activePoll.opcoes.forEach(opt => {
                        const votes = activePoll.votos[opt] || [];
                        const pct = totalVotes > 0 ? Math.round((votes.length / totalVotes) * 100) : 0;
                        const isUserChoice = opt === userVoteChoice;
                        const votersNames = votes.join(', ');
                        
                        activeHtml += `
                            <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.95em; margin-bottom: 5px; color: ${isUserChoice ? '#8e6eff' : 'white'}; font-weight: ${isUserChoice ? 'bold' : 'normal'};">
                                    <span>${opt} ${isUserChoice ? '⭐ (Seu voto)' : ''}</span>
                                    <span>${votes.length} voto(s) (${pct}%)</span>
                                </div>
                                <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; overflow: hidden; position: relative;" title="${votersNames || 'Sem votos'}">
                                    <div style="width: ${pct}%; height: 100%; background: #8e6eff; border-radius: 5px; transition: width 1s ease;"></div>
                                </div>
                                <span style="font-size: 0.75em; color: #a0aec0; display: block; margin-top: 3px; opacity: 0.8;">Quem votou: ${votersNames || 'Ninguém'}</span>
                            </div>
                        `;
                    });
                    activeHtml += `</div>
                        <p style="margin: 20px 0 0 0; font-size: 0.85em; color: #a0aec0; text-align: center;">Total de votos: ${totalVotes} • Expira hoje às 23:59</p>
                    </div>`;
                } else {
                    activeHtml += `<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">`;
                    activePoll.opcoes.forEach(opt => {
                        activeHtml += `
                            <button class="glass-card" onclick="window.voteInPoll('${activePoll.id}', '${opt}')" style="background: rgba(255,255,255,0.02); text-align: left; padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); color: white; cursor: pointer; font-size: 1em; transition: all 0.2s;" onmouseenter="this.style.borderColor='#8e6eff'; this.style.background='rgba(142, 110, 255, 0.05)';" onmouseleave="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.02)';">
                                ${opt}
                            </button>
                        `;
                    });
                    activeHtml += `</div></div>`;
                }
                
                if (activePollContainer) {
                    activePollContainer.innerHTML = activeHtml;
                }
            } else {
                activePoll = null;
                if (activePollContainer) {
                    activePollContainer.innerHTML = `
                        <div class="glass-card" style="padding: 30px; text-align: center; opacity: 0.6;">
                            <i data-lucide="help-circle" style="width: 40px; height: 40px; color: #a0aec0; margin-bottom: 10px;"></i>
                            <p style="margin: 0;">Nenhuma enquete ativa no momento.</p>
                        </div>
                    `;
                }
            }
            
            if (expiredList.length > 0) {
                let expiredHtml = '';
                expiredList.forEach(poll => {
                    let totalVotes = 0;
                    for (const opt in poll.votos) {
                        totalVotes += poll.votos[opt].length;
                    }
                    const formattedDate = new Date(poll.criado_em).toLocaleDateString('pt-BR');
                    
                    expiredHtml += `
                        <div class="glass-card" style="padding: 20px; opacity: 0.85; border-left: 4px solid #a0aec0; margin-bottom: 15px;">
                            <span style="background: rgba(255,255,255,0.1); color: #a0aec0; padding: 2px 8px; border-radius: 20px; font-size: 0.7em; font-weight: bold; text-transform: uppercase;">Encerrada em ${formattedDate}</span>
                            <h4 style="color: white; margin: 10px 0; font-size: 1.15em;">${poll.pergunta}</h4>
                            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                    `;
                    
                    poll.opcoes.forEach(opt => {
                        const votes = poll.votos[opt] || [];
                        const pct = totalVotes > 0 ? Math.round((votes.length / totalVotes) * 100) : 0;
                        const votersNames = votes.join(', ');
                        
                        expiredHtml += `
                            <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85em; margin-bottom: 3px; color: #a0aec0;">
                                    <span>${opt}</span>
                                    <span>${votes.length} voto(s) (${pct}%)</span>
                                </div>
                                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;" title="${votersNames || 'Sem votos'}">
                                    <div style="width: ${pct}%; height: 100%; background: #a0aec0; border-radius: 3px;"></div>
                                </div>
                                <span style="font-size: 0.7em; color: #718096; display: block; margin-top: 2px;">Votos: ${votersNames || 'Nenhum'}</span>
                            </div>
                        `;
                    });
                    
                    expiredHtml += `</div>
                        <p style="margin: 15px 0 0 0; font-size: 0.85em; color: #718096; text-align: right;">Total de votos: ${totalVotes}</p>
                    </div>`;
                });
                
                if (expiredPollsContainer) {
                    expiredPollsContainer.innerHTML = expiredHtml;
                }
            } else {
                if (expiredPollsContainer) {
                    expiredPollsContainer.innerHTML = `<div style="text-align: center; padding: 20px; opacity: 0.5;">Nenhuma enquete antiga encontrada.</div>`;
                }
            }
            if (window.lucide) window.lucide.createIcons();
        } catch(err) {
            console.error("Erro ao carregar enquetes:", err);
        }
    }

    window.voteInPoll = async function(pollId, selectedOption) {
        const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        try {
            const { data, error } = await window.supabaseClient.from('sugestoes').select('*').eq('id', pollId).single();
            if (error) throw error;
            
            const jsonStr = data.sugestao.replace('ENQUETE:', '');
            const pollObj = JSON.parse(jsonStr);
            
            for (const opt in pollObj.votos) {
                const idx = pollObj.votos[opt].indexOf(currentUser);
                if (idx > -1) {
                    pollObj.votos[opt].splice(idx, 1);
                }
            }
            
            if (!pollObj.votos[selectedOption]) {
                pollObj.votos[selectedOption] = [];
            }
            pollObj.votos[selectedOption].push(currentUser);
            
            const updatedPayload = 'ENQUETE:' + JSON.stringify(pollObj);
            const { error: updateError } = await window.supabaseClient.from('sugestoes').update({ sugestao: updatedPayload }).eq('id', pollId);
            if (updateError) throw updateError;
            
            if (typeof window.showToast === 'function') window.showToast('Voto confirmado! 🗳️', 'success');
            
            const forcedPollModal = document.getElementById('forcedPollModal');
            if (forcedPollModal) forcedPollModal.style.display = 'none';
            
            loadEnquetes();
        } catch(err) {
            alert('Erro ao computar voto: ' + err.message);
        }
    };

    async function checkActivePollAndForcedOverlay() {
        if (!window.supabaseClient) return;
        const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        try {
            const { data, error } = await window.supabaseClient
                .from('sugestoes')
                .select('*')
                .like('sugestao', 'ENQUETE:%')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            let activePoll = null;
            const now = new Date();
            
            if (data) {
                for (const item of data) {
                    try {
                        const jsonStr = item.sugestao.replace('ENQUETE:', '');
                        const poll = JSON.parse(jsonStr);
                        poll.id = item.id;
                        
                        const expDate = new Date(poll.expira_em);
                        if (expDate > now) {
                            activePoll = poll;
                            break;
                        }
                    } catch(e) {}
                }
            }
            
            const forcedModal = document.getElementById('forcedPollModal');
            if (activePoll) {
                let userVoted = false;
                for (const opt in activePoll.votos) {
                    if (activePoll.votos[opt].includes(currentUser)) {
                        userVoted = true;
                        break;
                    }
                }
                
                if (!userVoted) {
                    if (forcedModal && forcedModal.style.display !== 'flex') {
                        document.getElementById('forcedPollQuestion').innerText = activePoll.pergunta;
                        
                        const container = document.getElementById('forcedPollOptionsContainer');
                        container.innerHTML = '';
                        
                        let selectedOpt = '';
                        const voteBtn = document.getElementById('forcedPollVoteBtn');
                        voteBtn.disabled = true;
                        voteBtn.style.opacity = '0.5';
                        voteBtn.style.cursor = 'not-allowed';
                        
                        activePoll.opcoes.forEach(opt => {
                            const btn = document.createElement('button');
                            btn.className = 'glass-card';
                            btn.innerText = opt;
                            btn.style.cssText = 'background: rgba(255,255,255,0.02); text-align: left; padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); color: white; cursor: pointer; font-size: 1.05em; transition: all 0.2s; width: 100%;';
                            
                            btn.onclick = () => {
                                Array.from(container.children).forEach(child => {
                                    child.style.borderColor = 'rgba(255,255,255,0.1)';
                                    child.style.background = 'rgba(255,255,255,0.02)';
                                    child.style.transform = 'scale(1)';
                                    child.style.boxShadow = 'none';
                                });
                                
                                btn.style.borderColor = '#8e6eff';
                                btn.style.background = 'rgba(142, 110, 255, 0.1)';
                                btn.style.transform = 'scale(1.02)';
                                btn.style.boxShadow = '0 0 15px rgba(142, 110, 255, 0.2)';
                                selectedOpt = opt;
                                
                                voteBtn.disabled = false;
                                voteBtn.style.opacity = '1';
                                voteBtn.style.cursor = 'pointer';
                            };
                            
                            container.appendChild(btn);
                        });
                        
                        voteBtn.onclick = () => {
                            if (selectedOpt) {
                                window.voteInPoll(activePoll.id, selectedOpt);
                            }
                        };
                        
                        forcedModal.style.display = 'flex';
                    }
                } else {
                    if (forcedModal) forcedModal.style.display = 'none';
                }
            } else {
                if (forcedModal) forcedModal.style.display = 'none';
            }
        } catch(e) {
            console.error("Erro na verificação da enquete ativa:", e);
        }
    }

    async function checkForNewPhotosAndPolls() {
        const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        await checkActivePollAndForcedOverlay();
        
        try {
            const { data: photos, error } = await window.supabaseClient
                .from('sugestoes')
                .select('id, username, created_at')
                .like('sugestao', 'FOTO:%')
                .order('id', { ascending: false })
                .limit(1);
                
            if (error) throw error;
            
            if (photos && photos.length > 0) {
                const latestPhoto = photos[0];
                const lastSeenId = localStorage.getItem('last_seen_photo_id');
                
                if (!lastSeenId) {
                    localStorage.setItem('last_seen_photo_id', latestPhoto.id.toString());
                } else if (latestPhoto.id > parseInt(lastSeenId)) {
                    const normStr = (s) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";
                    if (normStr(latestPhoto.username) !== normStr(currentUser)) {
                        if (typeof window.showToast === 'function') {
                            window.showToast(`Nova foto no Mural de Fotos postada por ${latestPhoto.username}! 📸`, 'success', 6000);
                        }
                    }
                    localStorage.setItem('last_seen_photo_id', latestPhoto.id.toString());
                    
                    const fotosTab = document.getElementById('tab-fotos');
                    if (fotosTab && fotosTab.style.display !== 'none') {
                        loadPhotoGallery();
                    }
                }
            }
        } catch(e) {
            console.error("Erro na verificação de fotos:", e);
        }
    }

    // Refresh when tab is clicked
    const enquetesTabBtn = document.querySelector('[data-target="tab-enquetes"]');
    if (enquetesTabBtn) {
        enquetesTabBtn.addEventListener('click', loadEnquetes);
    }

    // ==========================================
    // INTEGRAÇÃO SYMPLA - FACULDADE INSPIRAR
    // ==========================================

    window.loadSymplaEvents = async function() {
        if (!window.supabaseClient) return;
        
        const container = document.getElementById('symplaEventsList');
        if (!container) return;

        const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
        const normStr = (s) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";
        const currentU = normStr(currentUser || '');
        const isManager = ['VANESSA', 'BRUNO', 'VITOR', 'LEANDRO'].includes(currentU);
        
        const addBtn = document.getElementById('addSymplaEventBtn');
        if (addBtn) addBtn.style.display = isManager ? 'flex' : 'none';

        let realEvents = [];
        let manualEvents = [];

        // 1. Tenta obter os eventos reais da API de raspagem (Vercel)
        try {
            const response = await fetch('/api/get-sympla-events');
            if (response.ok) {
                const resJson = await response.json();
                if (resJson.events) {
                    realEvents = resJson.events;
                }
            } else {
                throw new Error("API local retornou status: " + response.status);
            }
        } catch (e) {
            console.warn("Erro ao buscar API local do Sympla, tentando oficial direta...", e);
            // Fallback 1: Tenta chamar a API oficial direta da Sympla no client-side
            try {
                const token = '3c53762d14d139ec276692b86d49fa2e478279608c6aa00a4b8b11124176f580';
                const response = await fetch('https://api.sympla.com.br/public/v3/events?sort=DESC&page_size=100', {
                    headers: { 's_token': token }
                });
                if (response.ok) {
                    const resJson = await response.json();
                    if (resJson.data && resJson.data.length > 0) {
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        
                        realEvents = resJson.data
                            .map(e => {
                                let location = 'Online';
                                if (e.address && !Array.isArray(e.address)) {
                                    location = e.address.name || e.address.city || 'Presencial';
                                } else if (e.address && Array.isArray(e.address) && e.address.length > 0) {
                                    location = e.address[0].name || e.address[0].city || 'Presencial';
                                }
                                return {
                                    title: e.name || '',
                                    date: e.start_date || '',
                                    description: e.detail || '',
                                    location: location,
                                    link: e.url || `https://www.sympla.com.br/evento/${e.id}`,
                                    image: e.image || '',
                                    official: true
                                };
                            })
                            .filter(e => {
                                if (!e.date) return false;
                                const eventDate = new Date(e.date.replace(' ', 'T'));
                                return eventDate >= today;
                            });
                    }
                } else {
                    throw new Error("API oficial retornou status: " + response.status);
                }
            } catch (errOff) {
                console.warn("Chamada direta à API oficial falhou, tentando proxy público...", errOff);
                // Fallback 2: Fallback para AllOrigins CORS Proxy (permite testar localmente em localhost/file://)
                try {
                    const targetUrl = 'https://www.sympla.com.br/produtor/faculdadeinspirar';
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
                    const response = await fetch(proxyUrl);
                    if (response.ok) {
                        const resJson = await response.json();
                        const html = resJson.contents;
                    const match = html.match(/<script id="symplaDiscovery">window\.symplaDiscovery="([^"]+)"<\/script>/) || html.match(/window\.symplaDiscovery="([^"]+)"/);
                    let data = null;

                    if (match) {
                        try {
                            let enc = match[1];
                            const t = enc.length;
                            for (let r = t - 1; r >= 0; r--) {
                                enc = enc.substring(0, r) + enc.charAt(t - 1 - r) + enc.substring(r + 1);
                            }
                            const binary = atob(enc);
                            let decrypted = "";
                            for (let a = 0; a < binary.length; a++) {
                                decrypted += String.fromCharCode(binary.charCodeAt(a) ^ (a % 10));
                            }
                            data = JSON.parse(decrypted);
                        } catch(decErr) {
                            console.error("Erro ao descriptografar symplaDiscovery:", decErr);
                        }
                    } else {
                        const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
                        if (nextMatch) {
                            data = JSON.parse(nextMatch[1]);
                        }
                    }

                    if (data) {
                        let events = [];

                        const findEventsArray = (obj) => {
                            if (!obj || typeof obj !== 'object') return false;
                            for (const key in obj) {
                                try {
                                    const val = obj[key];
                                    if (Array.isArray(val)) {
                                        if (val.length > 0 && val[0] && (val[0].name || val[0].title) && (val[0].startDate || val[0].date || val[0].start_date)) {
                                            events = val;
                                            return true;
                                        }
                                    } else if (val && typeof val === 'object') {
                                        if (findEventsArray(val)) return true;
                                    }
                                } catch(err) {}
                            }
                            return false;
                        };

                        findEventsArray(data);

                        realEvents = events.map(e => {
                            const title = e.name || e.title || '';
                            const date = e.startDate || e.date || e.start_date || '';
                            let description = e.description || e.detail || e.summary || '';
                            if (description) {
                                description = description.replace(/<[^>]*>/g, '').substring(0, 150) + (description.length > 150 ? '...' : '');
                            }

                            let location = 'Online';
                            if (e.address) {
                                location = e.address.name || e.address.city || e.address.address_line || 'Presencial';
                            } else if (e.location) {
                                location = e.location.name || e.location.city || 'Presencial';
                            } else if (e.city) {
                                location = e.city;
                            }

                            const link = e.url || e.link || `https://www.sympla.com.br/evento/${e.id}`;

                            return { title, description, date, location, link, image: e.image || e.flyer || '' };
                        });
                    }
                }
            } catch (proxyErr) {
                console.error("Erro no fallback do proxy público:", proxyErr);
            }
        }
    }

        // 2. Busca do Supabase (eventos manuais)
        try {
            const { data, error } = await window.supabaseClient
                .from('sugestoes')
                .select('*')
                .like('sugestao', 'SYMPLA:%')
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                manualEvents = data.map(item => {
                    try {
                        const jsonStr = item.sugestao.replace('SYMPLA:', '');
                        const evObj = JSON.parse(jsonStr);
                        evObj.id = item.id; // Guarda ID para deletar
                        evObj.username = item.username; // Guarda o username para saber se é inventado
                        return evObj;
                    } catch(e) {
                        return null;
                    }
                }).filter(e => e !== null);
            } else if (realEvents.length === 0) {
                // Se tudo estiver vazio (erro no scraper E sem eventos no Supabase), criamos eventos padrão
                const today = new Date();
                const getFutureDate = (daysAhead, hour) => {
                    const d = new Date(today);
                    d.setDate(today.getDate() + daysAhead);
                    d.setHours(hour, 0, 0, 0);
                    return d.toISOString();
                };

                const isFriday = today.getDay() === 5;
                const weekendOffset = isFriday ? 1 : 2;

                const seedData = [
                    {
                        title: "Inspirar Conecta - Autismo e Inclusão",
                        description: "Um dia de palestras e trocas de experiências com foco no espectro autista.",
                        date: getFutureDate(0, 19),
                        location: "Auditório Principal / Online",
                        link: "https://www.sympla.com.br"
                    },
                    {
                        title: "II Ergonomia Inspirar Summit",
                        description: "Rede nacional reunida para discutir as inovações em ergonomia e saúde corporativa.",
                        date: getFutureDate(weekendOffset, 9),
                        location: "Unidade Curitiba",
                        link: "https://www.sympla.com.br"
                    },
                    {
                        title: "VII Simpósio Nacional de Acupuntura",
                        description: "Pesquisas científicas e prática clínica na medicina tradicional chinesa.",
                        date: getFutureDate(4, 14),
                        location: "Online (Transmissão Streaming)",
                        link: "https://www.sympla.com.br"
                    }
                ];

                for (const seed of seedData) {
                    await window.supabaseClient.from('sugestoes').insert({
                        username: "Inspirar",
                        sugestao: 'SYMPLA:' + JSON.stringify(seed)
                    });
                }
                loadSymplaEvents();
                return;
            }
        } catch (err) {
            console.error("Erro ao carregar eventos manuais do Supabase:", err);
        }

        // 3. Mesclar as listas (removendo duplicados por título) e ordenar por data
        const mergedMap = new Map();
        
        realEvents.forEach(e => {
            mergedMap.set(e.title.toLowerCase().trim(), e);
        });

        manualEvents.forEach(e => {
            // Se tivermos eventos oficiais reais, desconsideramos os fictícios de teste ("Inspirar")
            if (realEvents.length > 0 && e.username === 'Inspirar') {
                return;
            }
            mergedMap.set(e.title.toLowerCase().trim(), e);
        });

        if (typeof window.symplaShowAll === 'undefined') {
            window.symplaShowAll = false;
        }

        const sortedEvents = Array.from(mergedMap.values()).sort((a, b) => new Date(a.date.replace(' ', 'T')) - new Date(b.date.replace(' ', 'T')));

        const displayEvents = window.symplaShowAll ? sortedEvents : sortedEvents.slice(0, 3);

        const today = new Date();
        const todayStr = today.toDateString();

        const html = displayEvents.map(event => {
            try {
                const eventDate = new Date(event.date.replace(' ', 'T'));
                const isToday = eventDate.toDateString() === todayStr;
                
                let isWeekendWarning = false;
                if (today.getDay() === 5) {
                    const eventDay = eventDate.getDay();
                    const diffTime = eventDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays >= 0 && diffDays <= 3 && (eventDay === 6 || eventDay === 0)) {
                        isWeekendWarning = true;
                    }
                }

                const dateFormatted = eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeFormatted = eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                let warningBadge = '';
                let cardBorder = 'border-top: 3px solid rgba(255,255,255,0.1);';
                if (isToday) {
                    warningBadge = `<span class="pulse-badge" style="background: #ff416c; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.7em; font-weight: bold; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 0 10px rgba(255, 65, 108, 0.4);"><i data-lucide="alert-circle" style="width:10px;height:10px;"></i> HOJE!</span>`;
                    cardBorder = 'border-top: 3px solid #ff416c; background: rgba(255, 65, 108, 0.03);';
                } else if (isWeekendWarning) {
                    warningBadge = `<span style="background: #ffd700; color: #0f0a1e; padding: 4px 8px; border-radius: 6px; font-size: 0.7em; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="calendar" style="width:10px;height:10px;"></i> FDS!</span>`;
                    cardBorder = 'border-top: 3px solid #ffd700; background: rgba(250, 204, 21, 0.02);';
                }

                const deleteBtn = (isManager && event.id) ? `<button onclick="window.deleteSymplaEvent('${event.id}')" style="background: rgba(255, 65, 108, 0.1); border: none; color: #ff416c; padding: 6px 12px; border-radius: 6px; font-size: 0.8em; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.background='rgba(255, 65, 108, 0.2)'" onmouseout="this.style.background='rgba(255, 65, 108, 0.1)'">Excluir</button>` : '';

                let syncBadge = '';
                if (event.id) {
                    syncBadge = `<span style="background: rgba(255,255,255,0.1); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.6em;">Manual</span>`;
                } else if (event.official) {
                    syncBadge = `<span style="background: #00c1e8; color: #0f0a1e; padding: 2px 6px; border-radius: 4px; font-size: 0.6em; font-weight: bold; display: inline-flex; align-items: center; gap: 2px;"><i data-lucide="shield-check" style="width:8px;height:8px;"></i> Oficial</span>`;
                } else {
                    syncBadge = `<span style="background: rgba(0, 193, 232, 0.2); color: #00c1e8; padding: 2px 6px; border-radius: 4px; font-size: 0.6em; font-weight: bold; display: inline-flex; align-items: center; gap: 2px;"><i data-lucide="refresh-cw" style="width:8px;height:8px;animation:spin 4s linear infinite;"></i> Live</span>`;
                }

                const isValidImage = (url) => {
                    if (!url || typeof url !== 'string') return false;
                    const u = url.trim();
                    if (u === 'https://images.sympla.com.br/' || u === 'https://images.sympla.com.br' || u === 'http://images.sympla.com.br/' || u === 'http://images.sympla.com.br') {
                        return false;
                    }
                    return u.startsWith('http://') || u.startsWith('https://');
                };

                const coverImage = isValidImage(event.image) ? event.image : 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80';

                return `
                    <div class="glass-card" style="padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: transform 0.3s, box-shadow 0.3s; ${cardBorder}">
                        <div style="width: 100%; height: 150px; overflow: hidden; border-radius: 8px; position: relative; background: #000;">
                            <img src="${coverImage}" alt="${event.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; align-items: center;">
                                ${syncBadge}
                                ${warningBadge}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
                            <h4 style="margin: 0; color: white; font-size: 1.1em; font-weight: bold; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${event.title}</h4>
                            
                            <div style="display: flex; flex-direction: column; gap: 4px; margin-top: auto; padding-top: 8px;">
                                <span style="font-size: 0.78em; color: #00c1e8; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                                    <i data-lucide="clock" style="width:12px;height:12px;"></i> ${dateFormatted} às ${timeFormatted}
                                </span>
                                <span style="font-size: 0.78em; color: #a0aec0; display: flex; align-items: center; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    <i data-lucide="map-pin" style="width:12px;height:12px;"></i> ${event.location}
                                </span>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
                            <a href="${event.link}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; background: #00c1e8; color: #0f0a1e; padding: 6px 12px; border-radius: 6px; font-size: 0.8em; font-weight: bold; text-decoration: none; transition: background 0.3s;" onmouseover="this.style.background='#00deff'" onmouseout="this.style.background='#00c1e8'">
                                Inscrever <i data-lucide="external-link" style="width:10px;height:10px;"></i>
                            </a>
                            ${deleteBtn}
                        </div>
                    </div>
                `;
            } catch(e) {
                return '';
            }
        }).join('');

        container.innerHTML = html || '<div style="text-align: center; padding: 20px; opacity: 0.5; grid-column: 1 / -1;">Nenhum evento futuro encontrado.</div>';

        // Atualiza o botão Ver Mais / Ver Menos
        const loadMoreContainer = document.getElementById('symplaLoadMoreContainer');
        if (loadMoreContainer) {
            if (sortedEvents.length > 3) {
                if (window.symplaShowAll) {
                    loadMoreContainer.innerHTML = `
                        <button onclick="window.toggleSymplaShowAll(false)" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px 20px; border-radius: 8px; font-size: 0.85em; font-weight: bold; cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; gap: 6px;">
                            Ver menos <i data-lucide="chevron-up" style="width: 14px; height: 14px;"></i>
                        </button>
                    `;
                } else {
                    loadMoreContainer.innerHTML = `
                        <button onclick="window.toggleSymplaShowAll(true)" style="background: rgba(0, 193, 232, 0.1); border: 1px solid rgba(0, 193, 232, 0.3); color: #00c1e8; padding: 8px 20px; border-radius: 8px; font-size: 0.85em; font-weight: bold; cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; gap: 6px;" onmouseover="this.style.background='rgba(0, 193, 232, 0.2)'" onmouseout="this.style.background='rgba(0, 193, 232, 0.1)'">
                            Ver mais (${sortedEvents.length - 3} novos) <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
                        </button>
                    `;
                }
            } else {
                loadMoreContainer.innerHTML = '';
            }
        }

        window.toggleSymplaShowAll = function(showAll) {
            window.symplaShowAll = showAll;
            loadSymplaEvents();
        };

        if (window.lucide) window.lucide.createIcons();
    };

    window.deleteSymplaEvent = async function(id) {
        if (!confirm('Deseja realmente remover este evento?')) return;
        try {
            const { error } = await window.supabaseClient.from('sugestoes').delete().eq('id', id);
            if (error) throw error;
            if (typeof window.showToast === 'function') window.showToast('Evento removido!', 'success');
            loadSymplaEvents();
        } catch(err) {
            alert('Erro ao deletar evento: ' + err.message);
        }
    };

    const addSymplaEventBtn = document.getElementById('addSymplaEventBtn');
    const formContainer = document.getElementById('symplaEventFormContainer');
    const cancelSymplaEventBtn = document.getElementById('cancelSymplaEventBtn');
    const symplaEventForm = document.getElementById('symplaEventForm');

    if (addSymplaEventBtn && formContainer) {
        addSymplaEventBtn.onclick = () => formContainer.style.display = 'block';
    }
    if (cancelSymplaEventBtn && formContainer) {
        cancelSymplaEventBtn.onclick = () => formContainer.style.display = 'none';
    }

    if (symplaEventForm) {
        symplaEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = symplaEventForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            const title = document.getElementById('seTitle').value;
            const description = document.getElementById('seDesc').value;
            const date = document.getElementById('seDate').value;
            const location = document.getElementById('seLocation').value;
            const link = document.getElementById('seLink').value;
            const image = document.getElementById('seImage').value;

            const eventData = {
                title,
                description,
                date: new Date(date).toISOString(),
                location,
                link,
                image
            };

            try {
                const { error } = await window.supabaseClient.from('sugestoes').insert({
                    username: "Inspirar",
                    sugestao: 'SYMPLA:' + JSON.stringify(eventData)
                });

                if (error) throw error;

                if (typeof window.showToast === 'function') window.showToast('Evento lançado no Sympla!', 'success');
                symplaEventForm.reset();
                if (formContainer) formContainer.style.display = 'none';
                loadSymplaEvents();
            } catch(err) {
                alert('Erro ao salvar evento: ' + err.message);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // LOGIC & UI FOR VACATION MODE (STREAK PROTECT)
    // ==========================================
    window.renderVacationsList = function() {
        const listContainer = document.getElementById('vacationList');
        if (!listContainer) return;

        const vacations = window.myVacations || [];
        if (vacations.length === 0) {
            listContainer.innerHTML = '<div style="font-size: 0.85em; color: #718096; font-style: italic; padding: 5px 0;">Nenhum período de férias programado.</div>';
            return;
        }

        listContainer.innerHTML = vacations.map(v => {
            const startD = new Date(v.start + 'T00:00:00').toLocaleDateString('pt-BR');
            const endD = new Date(v.end + 'T00:00:00').toLocaleDateString('pt-BR');
            
            // Verifica se está de férias hoje
            const todayStr = new Date().toLocaleDateString('en-CA');
            let current = new Date(v.start + 'T00:00:00');
            const end = new Date(v.end + 'T23:59:59');
            let isCurrent = false;
            while (current <= end) {
                if (current.toLocaleDateString('en-CA') === todayStr) {
                    isCurrent = true;
                    break;
                }
                current.setDate(current.getDate() + 1);
            }

            const currentBadge = isCurrent ? 
                `<span style="background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.4); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; font-weight: bold; margin-left: 8px;">ATIVO AGORA 🌴</span>` : '';

            return `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <div>
                        <div style="font-weight: 500; font-size: 0.88em; color: white; display: flex; align-items: center; flex-wrap: wrap;">
                            De ${startD} até ${endD} ${currentBadge}
                        </div>
                    </div>
                    <button onclick="window.deleteVacation('${v.id}')" style="background: none; border: none; color: #ff416c; cursor: pointer; padding: 4px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'" title="Remover Férias">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        if (window.lucide) window.lucide.createIcons();
    };

    window.deleteVacation = async function(id) {
        if (!confirm("Deseja cancelar esta programação de férias?")) return;
        try {
            const { error } = await window.supabaseClient
                .from('sugestoes')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            if (typeof window.showToast === 'function') window.showToast("Férias canceladas!", "success");
            
            // Recarrega estatísticas para recalcular XP/Streak
            if (typeof window.calculateXP === 'function') {
                window.calculateXP();
            }
        } catch(err) {
            alert("Erro ao excluir férias: " + err.message);
        }
    };

    const addVacationBtn = document.getElementById('addVacationBtn');
    const vacationFormContainer = document.getElementById('vacationFormContainer');
    const cancelVacationBtn = document.getElementById('cancelVacationBtn');
    const vacationForm = document.getElementById('vacationForm');

    if (addVacationBtn && vacationFormContainer) {
        addVacationBtn.onclick = () => {
            vacationFormContainer.style.display = 'block';
            addVacationBtn.style.display = 'none';
        };
    }

    if (cancelVacationBtn && vacationFormContainer && addVacationBtn) {
        cancelVacationBtn.onclick = () => {
            vacationFormContainer.style.display = 'none';
            addVacationBtn.style.display = 'inline-flex';
            vacationForm.reset();
        };
    }

    if (vacationForm) {
        vacationForm.onsubmit = async (e) => {
            e.preventDefault();
            const start = document.getElementById('vacStart').value;
            const end = document.getElementById('vacEnd').value;

            if (new Date(start) > new Date(end)) {
                alert("A data de início não pode ser posterior à data de fim!");
                return;
            }

            const currentUser = typeof window.currentUser !== 'undefined' ? window.currentUser : localStorage.getItem('currentUser');
            if (!currentUser) {
                alert("Nenhum usuário detectado. Faça login antes de agendar férias.");
                return;
            }

            const range = { start, end };
            try {
                const { error } = await window.supabaseClient.from('sugestoes').insert({
                    username: currentUser,
                    sugestao: 'VACATION:' + JSON.stringify(range)
                });
                
                if (error) throw error;

                const isFirstVacation = (!window.myVacations || window.myVacations.length === 0);
                if (typeof window.showToast === 'function') {
                    window.showToast("Período de férias salvo!", "success");
                    if (isFirstVacation) {
                        setTimeout(() => {
                            window.showToast("Conquista Desbloqueada: Pé na Areia! 🌴", "success");
                        }, 1000);
                    }
                }
                vacationForm.reset();
                vacationFormContainer.style.display = 'none';
                addVacationBtn.style.display = 'inline-flex';
                
                // Recarrega XP e Streak
                if (typeof window.calculateXP === 'function') {
                    window.calculateXP();
                }
            } catch(err) {
                alert("Erro ao salvar férias: " + err.message);
            }
        };
    }

    // Carregar na inicialização
    loadSymplaEvents();

    // Initial check for active poll/new photos
    loadEnquetes();
    checkForNewPhotosAndPolls();
    setInterval(checkForNewPhotosAndPolls, 12000);
});
