const SUPABASE_URL = 'https://szscamhegxbywbulptyg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2NhbWhlZ3hieXdidWxwdHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTMzNTYsImV4cCI6MjA5NDIyOTM1Nn0.zDwmCpC3rV_NFQxflD469fDIWrH81_c-rcrLPun7w6M';

const TEAM_MEMBERS = ["LEANDRO", "IGOR", "YASMIM", "KAMILLE", "JOÃO", "EDSON", "LUIZ", "JORGE", "MARIANA", "VANESSA", "BRUNO", "VITOR"];

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
        const checkedHelpers = Array.from(formEl.querySelectorAll('input[name="whoHelpCheck"]:checked')).map(cb => cb.value);
        
        const draft = {
            tasks: typeof currentTasks !== 'undefined' ? currentTasks : [],
            helpNeeded: document.getElementById('helpNeeded') ? document.getElementById('helpNeeded').value : '',
            whoHelpCheck: checkedHelpers,
            blockers: document.getElementById('blockers') ? document.getElementById('blockers').value : '',
            energyLevel: energyChecked ? energyChecked.value : null,
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
            if (draft.helpNeeded && document.getElementById('helpNeeded')) document.getElementById('helpNeeded').value = draft.helpNeeded;
            if (draft.blockers && document.getElementById('blockers')) document.getElementById('blockers').value = draft.blockers;
            if (draft.whoHelpCheck && draft.whoHelpCheck.length > 0) {
                const formEl = document.getElementById('kickoffForm');
                if (formEl) {
                    formEl.querySelectorAll('input[name="whoHelpCheck"]').forEach(cb => {
                        cb.checked = draft.whoHelpCheck.includes(cb.value);
                    });
                }
            }
            if (draft.energyLevel) {
                const formEl = document.getElementById('kickoffForm');
                if (formEl) {
                    const radio = formEl.querySelector(`input[name="energyLevel"][value="${draft.energyLevel}"]`);
                    if (radio) radio.checked = true;
                }
            }
        } catch(e) { console.error("Erro ao carregar rascunho", e); }
    }

    function clearRadarDraft() {
        const u = typeof currentUser !== 'undefined' && currentUser ? currentUser : localStorage.getItem('currentUser');
        if (u) localStorage.removeItem('radarDraft_' + u);
    }

    // Task List Builder logic
    let currentTasks = [];
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
            let textStyle = isDone ? 'text-decoration: line-through; opacity: 0.6;' : '';
            if (isUrgent && !isDone) textStyle += 'color: #ff416c; font-weight: bold; ';
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
    window.playSatisfyingCheckSound = function() {
        try {
            const audio = new Audio('som concluido.MP3');
            audio.volume = 0.5; // Ajuste de volume se necessário
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
            btn.style.background = btn.dataset.target === 'tab-radar' ? '#6841f1' : (btn.dataset.target === 'tab-sucesso' ? '#ffd700' : '#02ceff');
            btn.style.color = btn.dataset.target === 'tab-radar' ? 'white' : '#0f0a1e';
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

    function playNameSound(nameStr) {
        if (!nameStr) return;
        // Pega só o primeiro nome e limpa acentos (ex: JOÃO -> JOAO)
        const firstName = nameStr.split(' ')[0].toUpperCase();
        const normalized = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const validNames = ['BRUNO', 'EDSON', 'IGOR', 'JOAO', 'JORGE', 'KAMILLE', 'LEANDRO', 'LUIZ', 'MARIANA', 'VANESSA', 'VITOR', 'YASMIM'];
        
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
    document.querySelectorAll('input[name="whoHelpCheck"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (e.target.checked) playNameSound(e.target.value);
        });
    });

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
    function calculateXP() {
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

        const streak = calculateStreak(myCheckins);
        
        const streakBadge = document.getElementById('streakBadge');
        const streakCountDisplay = document.getElementById('streakCountDisplay');
        if (streakBadge && streak > 0) {
            streakBadge.style.display = 'flex';
            streakCountDisplay.innerText = `${streak} Dias de Ofensiva`;
        } else if (streakBadge) {
            streakBadge.style.display = 'none';
        }

        renderAchievements(myCheckins.length, myPraises.length, xp);

        // Efeito Dopaminoso (Mostrar apenas 1x por sessão)
        if (streak > 0 && !sessionStorage.getItem('streakShown')) {
            showStreakPopup(streak);
            sessionStorage.setItem('streakShown', 'true');
        }
    }

    function calculateStreak(myCheckins) {
        if (!myCheckins.length) return 0;
        
        const checkinDates = [...new Set(myCheckins.map(e => {
            const d = new Date(e.created_at);
            return d.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD local
        }))].sort().reverse();
        
        let streak = 0;
        let dateToCheck = new Date();
        
        const toDateStr = (d) => d.toLocaleDateString('en-CA');
        const todayStr = toDateStr(dateToCheck);

        if (checkinDates.includes(todayStr)) {
            streak++;
            dateToCheck.setDate(dateToCheck.getDate() - 1);
        } else {
            // Ainda não fez hoje, começa a contar de ontem
            dateToCheck.setDate(dateToCheck.getDate() - 1);
        }

        while (true) {
            const dateStr = toDateStr(dateToCheck);
            const dayOfWeek = dateToCheck.getDay(); // 0 Dom, 6 Sab
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            if (checkinDates.includes(dateStr)) {
                streak++;
                dateToCheck.setDate(dateToCheck.getDate() - 1);
            } else if (isWeekend) {
                dateToCheck.setDate(dateToCheck.getDate() - 1); // Pula fim de semana
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

    function renderAchievements(checkinsCount, praisesCount, totalXp) {
        const achievements = [
            { id: 'primeiros_passos', title: 'Primeiros Passos', desc: '1º check-in realizado', icon: '🚀', condition: checkinsCount >= 1 },
            { id: 'em_chamas', title: 'Em Chamas', desc: '5 check-ins (Consistência)', icon: '🔥', condition: checkinsCount >= 5 },
            { id: 'mente_brilhante', title: 'Mente Brilhante', desc: 'Citado 3x em Elogios', icon: '💡', condition: praisesCount >= 3 },
            { id: 'coluna_time', title: 'Coluna do Time', desc: 'Citado 10x em Elogios', icon: '🤝', condition: praisesCount >= 10 },
            { id: 'veterano', title: 'Veterano', desc: 'Alcançou 500 XP', icon: '🏅', condition: totalXp >= 500 },
            { id: 'phone_hunter', title: 'Caçador de Telefones', desc: 'Pegou o telefone fujão', icon: '📞', condition: localStorage.getItem('phoneHunter') === 'true' }
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
        
        document.querySelectorAll('input[name="whoHelpCheck"]').forEach(cb => cb.checked = false);
        if (entry.who_help) {
            entry.who_help.split(', ').forEach(val => {
                const cb = document.querySelector(`input[name="whoHelpCheck"][value="${val}"]`);
                if (cb) cb.checked = true;
            });
        }

        document.getElementById('blockers').value = entry.blockers || '';
        if (entry.energy_level) {
            const radio = form.querySelector(`input[name="energyLevel"][value="${entry.energy_level}"]`);
            if (radio) radio.checked = true;
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
        presenceBar.innerHTML = uniqueUsers.map(u => `<div class="presence-avatar" title="${u.name}" style="background: ${u.color}">${getInitials(u.name)}</div>`).join('');
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
            const formattedTasks = (entry.today_tasks || '').split('\n').map(t => {
                let tClean = t.replace('• ', '').trim();
                if (!tClean) return '';
                const isDone = tClean.startsWith('✅ ');
                const isUrgent = tClean.includes('🚨 ');
                let spanStyle = 'flex:1;';
                if (isUrgent && !isDone) spanStyle += 'color: #ff416c; font-weight: bold;';
                if (isDone) spanStyle += 'text-decoration: line-through; opacity: 0.6;';
                return `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;"><i data-lucide="check-square" style="width:14px;height:14px;color:#8e6eff;flex-shrink:0;margin-top:3px;"></i> <span style="${spanStyle}">${tClean}</span></div>`;
            }).join('');

            const normStr = (s) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() : "";
            const currentU = normStr(currentUser || '');
            const isException = ['VANESSA', 'BRUNO', 'VITOR', 'LEANDRO'].includes(currentU);
            const canEdit = normStr(u.name) === currentU || isException;

            return `
            <div class="kickoff-item ${isUrgent ? 'urgent-item' : ''}" style="border-left: 4px solid ${isUrgent ? '#ff416c' : displayColor}; margin-bottom: 20px; padding: 25px; background: rgba(255,255,255,0.05); border-radius: 12px; transition: all 0.3s ease;">
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div class="avatar" style="background: ${displayColor}">${getInitials(u.name)}</div>
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
            const count = reactions[emoji] || 0;
            const hasReacted = localStorage.getItem(`reacted_${id}_${emoji}`);
            return `<button class="reaction-btn ${hasReacted ? 'active' : ''}" onclick="toggleReaction('${id}', '${table}', '${emoji}', event)">
                ${emoji} <span style="font-weight: bold; ${count === 0 ? 'opacity: 0.5' : ''}">${count > 0 ? count : ''}</span>
            </button>`;
        }).join('');
        return `<div class="reaction-bar" id="reactions_${id}">${barHtml}</div>`;
    }

    window.toggleReaction = async (id, table, emoji, event) => {
        const localKey = `reacted_${id}_${emoji}`;
        const hasReacted = localStorage.getItem(localKey);
        
        let entriesList = table === 'kickoffs' ? allEntries : allSucessos;
        let entry = entriesList.find(e => e.id.toString() === id.toString());
        if (!entry) return;
        
        if (!entry.reactions) entry.reactions = {};
        if (!entry.reactions[emoji]) entry.reactions[emoji] = 0;

        if (hasReacted) {
            entry.reactions[emoji] = Math.max(0, entry.reactions[emoji] - 1);
            localStorage.removeItem(localKey);
        } else {
            entry.reactions[emoji] += 1;
            localStorage.setItem(localKey, 'true');
        }

        const reactionBar = document.getElementById(`reactions_${id}`);
        if (reactionBar) {
            reactionBar.outerHTML = generateReactionBar(id, table, entry.reactions);
        }

        try {
            await supabaseClient.from(table).update({ reactions: entry.reactions }).eq('id', id);
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
            const checkedHelpers = Array.from(document.querySelectorAll('input[name="whoHelpCheck"]:checked')).map(cb => cb.value).join(', ');

            const entry = {
                username: `${userNameInput.value}|${userColorInput.value}`,
                today_tasks: todayTasksHidden.value,
                help_needed: document.getElementById('helpNeeded').value,
                who_help: checkedHelpers,
                blockers: document.getElementById('blockers').value,
                observations: '',
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
                document.querySelectorAll('input[name="whoHelpCheck"]').forEach(cb => cb.checked = false);
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
            <div class="kickoff-item" style="border-left: 4px solid ${displayColor}; margin-bottom: 20px; padding: 25px; background: rgba(255,255,255,0.05); border-radius: 12px; transition: all 0.3s ease;">
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div class="avatar" style="background: ${displayColor}; color: #0f0a1e;">${getInitials(u.name)}</div>
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
            if (data && data.length > 0) {
                container.innerHTML = data.map(item => `
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
                if (data.length === 0) {
                    container.innerHTML = `<div class="glass-card" style="padding: 15px; text-align: center; opacity: 0.5;">Nenhuma sugestão recebida ainda.</div>`;
                    return;
                }
                container.innerHTML = data.map(sg => `
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

});

// =============================================
// TERMO DO DIA - Wordle-style Mini-Game
// =============================================
(function() {
    // ----- Banco de palavras (5 letras, sem acento) -----
    const WORDBANK = [
        "ABRIR","ACOES","AJUDA","ALTOS","AINDA","AMBOS","ANTES","ARGOS","ARTES","ASSAZ",
        "BALDE","BANCO","BARCO","BATER","BEIRA","BELAS","BISPO","BOLSA","BOLSO","BORDA",
        "CABER","CABO","CALDO","CAMPO","CANTO","CAPAZ","CARGA","CARGO","CARRO","CARTA",
        "CENAS","CHAVE","CIELO","CINCO","CIRCO","CLUBE","COBRA","COISA","COLOR","CONTA",
        "CORTE","COURO","COUVE","CRIOU","CRIVO","CRUEL","CURTO","CURVA","DATAS","DELTA",
        "DENSO","DESDE","DEVER","DIANA","DISCO","DISSE","DITAR","DOCES","DONNA","DOSIL",
        "DUPLO","ECLAT","EDUCA","EMITE","ENJOY","ENTRE","ENVIO","EPICA","EQUIP","ERROS",
        "ESCOA","ESCOP","ETAPA","EVENT","EXTRA","FACAO","FALAR","FALTA","FAMIL","FASES",
        "FECHA","FENDA","FESTA","FIQUE","FIRMA","FITAR","FORCA","FORMA","FORTE","FREAR",
        "FRUTO","FUNDO","GANHA","GERAL","GESTO","GLOBO","GOLPE","GOSTO","GRAFO","GREVE",
        "GRUPO","GUIAR","HABIL","HONRA","HOTEL","HUMOR","IDEAL","IDEIA","IGUAL","IMPAR",
        "INICIO","INOVA","INPUT","INTER","ISOLA","JOGAR","JOINT","JUIZO","JUNTO","JUROS",
        "LANCE","LAPIS","LENTA","LICAO","LIDAR","LIGAR","LIGHT","LIMITE","LINDA","LINHA",
        "LOCAL","LOGICA","LUCRO","LUGAR","LONGO","MACRO","MANOS","MARCA","MARCA","MASSA",
        "MEDIA","MELHOR","METAS","METODO","MEIOS","MISTO","MODAL","MOEDA","MORAR","MOTOR",
        "MUNDO","NIVEL","NORMA","NOTAR","NOVAS","NOVOS","OBTER","ORDEM","OTIMO","NOSSA",
        "PACTO","PAPEL","PARTE","PASSO","PEDIR","PERDA","PESAR","PILHA","PILOT","PISTA",
        "PLANO","PODER","PONTO","PRECO","PRIMO","PROVA","PULSO","RENDA","RISCO","RITMO",
        "RIVAL","RODAS","ROLHA","ROTINA","SAIDA","SALDO","SETOR","SIGLA","SINAP","SLIDE",
        "SMART","SOBRE","SOFRE","SOLVE","SORTE","SUCESSO","SUITE","SUPER","TABELA","TARDE",
        "TARIFA","TAXA","TEMPO","TEXTO","TIMES","TITULO","TOMAR","TOQUE","TOTAL","TREINO",
        "TURNO","ULTRA","UNION","VALOR","VENDA","VERDE","VIGOR","VIRAL","VISAO","VISTA",
        "VOTAR","YIELD","ZERAR","AGORA","AMBOS","AMIGO","AMPLO","ANDAR","ANTES","APOIO",
        "BREVE","CAPAZ","CAUSA","CERTO","CICLO","COMBO","DIRETO","EQUIPE","FISCO","FOCAR",
        "FOREM","FUSAO","GERAR","GRADE","IMPOR","INERCIA","INOVAR","JOGO","LANCE","LIDERAR",
        "LOGAR","LUCRAR","MAPEAR","MARCO","NICHO","OPERAR","OTIMIZAR","PARTES","PERSONA","PILAR",
        "PRAZO","PRECO","PROPOR","RANKEAR","RATIO","REAGIR","SEGMENTO","SINTESE","SPARK","SPRINT",
        "STRAT","SUGERIR","TARGET","TICKET","TIRAR","TRACAR","TREINAR","UNICA","UNIR","URGENTE",
        "VALIDAR","VENCER","VERTER","VIRAR","VOAR","VOLTAR","ZAPP"
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
