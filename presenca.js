// ==========================================
// CALENDÁRIO DE PRESENÇA (Folgas, Férias, Home Office)
// Armazenado em sugestoes: username = pessoa, sugestao = 'AUSENCIA:' + JSON {type,start,end,note,by}
// type: 'folga' | 'ferias' (protegem a ofensiva) | 'home' (só informativo)
// ==========================================
(function () {
    const TEAM = ["LEANDRO", "IGOR", "YASMIM", "JOÃO", "EDSON", "LUIZ", "MARIANA", "VANESSA", "BRUNO"]; // Vitor não entra na marcação de presença;
    const TYPES = {
        folga:  { label: 'Folga',       icon: '😴', color: '#ff9f43' },
        ferias: { label: 'Férias',      icon: '🌴', color: '#22c55e' },
        home:   { label: 'Home Office', icon: '🏠', color: '#02ceff' }
    };
    const HOLIDAYS = {
        '2026-01-01': 'Confraternização', '2026-04-03': 'Sexta-feira Santa', '2026-04-21': 'Tiradentes',
        '2026-05-01': 'Dia do Trabalho', '2026-06-04': 'Corpus Christi', '2026-09-07': 'Independência',
        '2026-10-12': 'N. Sra. Aparecida', '2026-11-02': 'Finados', '2026-11-15': 'Proclamação da República',
        '2026-11-20': 'Consciência Negra', '2026-12-25': 'Natal',
        '2027-01-01': 'Confraternização', '2027-03-26': 'Sexta-feira Santa', '2027-04-21': 'Tiradentes',
        '2027-05-01': 'Dia do Trabalho', '2027-05-27': 'Corpus Christi', '2027-09-07': 'Independência',
        '2027-10-12': 'N. Sra. Aparecida', '2027-11-02': 'Finados', '2027-11-15': 'Proclamação da República',
        '2027-11-20': 'Consciência Negra', '2027-12-25': 'Natal'
    };
    const norm = s => s ? s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim() : '';
    const ymd = d => d.toLocaleDateString('en-CA');
    const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const me = () => (typeof window.currentUser !== 'undefined' && window.currentUser) || localStorage.getItem('currentUser') || '';
    const teamName = n => TEAM.find(t => norm(t) === norm(n)) || (n || '').toUpperCase();

    let entries = [];          // {id, person, type, start, end, note, by}
    let viewMonth = new Date(); viewMonth.setDate(1);
    let selectedDay = ymd(new Date());

    function expand(e) {
        const out = [];
        const cur = new Date(e.start + 'T12:00:00');
        const end = new Date(e.end + 'T12:00:00');
        while (cur <= end) { out.push(ymd(cur)); cur.setDate(cur.getDate() + 1); }
        return out;
    }

    // Datas de folga/férias de uma pessoa (usadas pela ofensiva)
    window.getProtectedAbsenceDates = function (person) {
        const p = norm(person);
        const s = new Set();
        entries.filter(e => norm(e.person) === p && !e.days && (e.type === 'folga' || e.type === 'ferias'))
               .forEach(e => expand(e).forEach(d => s.add(d)));
        return [...s];
    };

    function statusOf(person, day) {
        const p = norm(person);
        // Prioridade: férias > folga > home
        const wd = new Date(day + 'T12:00:00').getDay();
        const hits = entries.filter(e => norm(e.person) === p && day >= e.start && (e.days
            ? ((!e.end || day <= e.end) && e.days.includes(wd))
            : day <= e.end));
        for (const t of ['ferias', 'folga', 'home']) {
            const h = hits.find(e => e.type === t);
            if (h) return h;
        }
        return null;
    }

    function dayInfo(day) {
        const d = new Date(day + 'T12:00:00');
        const weekend = d.getDay() === 0 || d.getDay() === 6;
        const groups = { presencial: [], home: [], folga: [], ferias: [] };
        TEAM.forEach(p => {
            const st = statusOf(p, day);
            if (st) groups[st.type].push({ name: p, entry: st });
            else groups.presencial.push({ name: p });
        });
        return { weekend, holiday: HOLIDAYS[day], groups };
    }

    window.loadPresenca = async function () {
        if (!window.supabaseClient) return;
        try {
            const [{ data: a }, { data: v }] = await Promise.all([
                window.supabaseClient.from('sugestoes').select('*').like('sugestao', 'AUSENCIA:%'),
                window.supabaseClient.from('sugestoes').select('*').like('sugestao', 'VACATION:%')
            ]);
            const list = [];
            (a || []).forEach(r => {
                try { const j = JSON.parse(r.sugestao.slice(9)); list.push({ id: r.id, person: teamName(r.username), ...j }); } catch (e) {}
            });
            // Férias antigas do "Modo Férias" também aparecem no calendário
            (v || []).forEach(r => {
                try { const j = JSON.parse(r.sugestao.slice(9)); list.push({ id: r.id, person: teamName(r.username), type: 'ferias', start: j.start, end: j.end, legacy: true, by: r.username }); } catch (e) {}
            });
            entries = list.filter(e => e.start && (e.end || e.days) && TYPES[e.type]);
        } catch (e) { console.error('Erro ao carregar presença:', e); }
        render();
        renderBadge();
    };

    function renderBadge() {
        const el = document.getElementById('presencaTodayCount');
        if (!el) return;
        const today = ymd(new Date());
        const info = dayInfo(today);
        el.textContent = (info.weekend || info.holiday) ? 'folga hoje' : `🏢 ${info.groups.presencial.length} hoje`;
        el.title = 'Pessoas no escritório hoje';
    }

    function chip(name, type, small) {
        const c = type ? TYPES[type].color : '#a0aec0';
        const ic = type ? TYPES[type].icon + ' ' : '';
        return `<span style="display:inline-flex;align-items:center;gap:3px;background:${c}22;border:1px solid ${c}66;color:${type ? c : '#e2e8f0'};padding:${small ? '1px 5px' : '4px 10px'};border-radius:999px;font-size:${small ? '0.68em' : '0.85em'};font-weight:700;white-space:nowrap">${ic}${esc(small ? name.slice(0, 3) : name)}</span>`;
    }

    function render() {
        const grid = document.getElementById('presencaGrid');
        if (!grid) return;
        const title = document.getElementById('presencaMonthTitle');
        title.textContent = viewMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        const first = new Date(viewMonth);
        const startOffset = first.getDay();
        const daysIn = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
        const today = ymd(new Date());
        let html = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => `<div class="pz-wd">${d}</div>`).join('');
        for (let i = 0; i < startOffset; i++) html += '<div></div>';
        for (let dn = 1; dn <= daysIn; dn++) {
            const day = ymd(new Date(first.getFullYear(), first.getMonth(), dn, 12));
            const info = dayInfo(day);
            const away = [...info.groups.ferias.map(x => [x.name, 'ferias']), ...info.groups.folga.map(x => [x.name, 'folga']), ...info.groups.home.map(x => [x.name, 'home'])];
            const off = info.weekend || info.holiday;
            html += `<button class="pz-day${off ? ' off' : ''}${day === today ? ' today' : ''}${day === selectedDay ? ' sel' : ''}" data-day="${day}">
                <div class="pz-dn"><span>${dn}</span>${off ? '' : `<span class="pz-count" title="Presenciais">🏢 ${info.groups.presencial.length}</span>`}</div>
                ${info.holiday ? `<div class="pz-hol">🎉 ${esc(info.holiday)}</div>` : ''}
                <div class="pz-chips">${away.map(([n, t]) => chip(n, t, true)).join('')}</div>
            </button>`;
        }
        grid.innerHTML = html;
        grid.querySelectorAll('.pz-day').forEach(b => b.onclick = () => { selectedDay = b.dataset.day; render(); });
        renderDetail();
        renderMine();
    }

    function renderDetail() {
        const box = document.getElementById('presencaDetail');
        if (!box) return;
        const info = dayInfo(selectedDay);
        const d = new Date(selectedDay + 'T12:00:00');
        const isToday = selectedDay === ymd(new Date());
        const head = `${isToday ? 'Hoje · ' : ''}${d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}`;
        const sec = (label, color, arr, type) => `
            <div style="margin-top:14px">
                <div style="font-size:0.78em;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${color};margin-bottom:6px">${label} (${arr.length})</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px">${arr.length ? arr.map(x => chip(x.name, type) + (x.entry && x.entry.note ? `<span style="font-size:0.75em;color:#a0aec0;align-self:center">${esc(x.entry.note)}</span>` : '')).join('') : '<span style="font-size:0.85em;color:#718096;font-style:italic">Ninguém</span>'}</div>
            </div>`;
        let body;
        if (info.weekend || info.holiday) {
            body = `<p style="color:#a0aec0;margin:12px 0 0">${info.holiday ? '🎉 Feriado: ' + esc(info.holiday) : 'Fim de semana'} — sem expediente.</p>`;
            if (info.groups.home.length + info.groups.folga.length + info.groups.ferias.length === 0) body += '';
        } else {
            body = sec('🏢 No escritório', '#e2e8f0', info.groups.presencial, null)
                 + sec('🏠 Home Office', TYPES.home.color, info.groups.home, 'home')
                 + sec('😴 Folga', TYPES.folga.color, info.groups.folga, 'folga')
                 + sec('🌴 Férias', TYPES.ferias.color, info.groups.ferias, 'ferias');
        }
        box.innerHTML = `<h3 style="margin:0;color:white;text-transform:capitalize;font-size:1.1em">${head}</h3>${body}`;
        const f = document.getElementById('pzStart');
        if (f && !f.dataset.touched) { f.value = selectedDay; document.getElementById('pzEnd').value = selectedDay; }
    }

    function renderMine() {
        const box = document.getElementById('presencaMine');
        if (!box) return;
        const today = ymd(new Date());
        const list = entries.filter(e => !e.end || e.end >= today).sort((a, b) => (b.days ? 1 : 0) - (a.days ? 1 : 0) || a.start.localeCompare(b.start));
        if (!list.length) { box.innerHTML = '<div style="font-size:0.85em;color:#718096;font-style:italic">Nenhuma marcação futura.</div>'; return; }
        const fmtD = s => new Date(s + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
        const fmt = s => s; // compat
        list.forEach(e => {
            if (e.days) e._when = '🔁 Toda ' + e.days.slice().sort().map(d => WD[d]).join(', ') + (e.start > today ? ' · a partir de ' + fmtD(e.start) : '') + (e.end ? ' · até ' + fmtD(e.end) : '');
            else e._when = fmtD(e.start) + (e.end !== e.start ? ' → ' + fmtD(e.end) : '');
        });
        box.innerHTML = list.map(e => `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,0.03);border-left:3px solid ${TYPES[e.type].color}">
                <div style="font-size:0.85em;color:#e2e8f0"><strong>${esc(e.person)}</strong> · ${TYPES[e.type].icon} ${TYPES[e.type].label} · ${e._when}${e.note ? ` <span style="color:#a0aec0">— ${esc(e.note)}</span>` : ''}</div>
                <button data-del="${e.id}" title="Remover" style="background:none;border:none;color:#ff416c;cursor:pointer;font-size:1em">✕</button>
            </div>`).join('');
        box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => del(b.dataset.del));
    }

    async function del(id) {
        if (!confirm('Remover esta marcação?')) return;
        const { error } = await window.supabaseClient.from('sugestoes').delete().eq('id', id);
        if (error) return alert('Erro ao remover: ' + error.message);
        window.showToast && window.showToast('Marcação removida', 'success');
        await window.loadPresenca();
        window.calculateXP && window.calculateXP();
    }

    async function save(ev) {
        ev.preventDefault();
        const person = document.getElementById('pzPerson').value;
        const type = document.querySelector('input[name="pzType"]:checked').value;
        const start = document.getElementById('pzStart').value;
        const recurring = type === 'home' && document.getElementById('pzRecurring').checked;
        const days = recurring ? [...document.querySelectorAll('input[name="pzWd"]:checked')].map(i => +i.value) : null;
        let end = document.getElementById('pzEnd').value || (recurring ? null : start);
        const note = document.getElementById('pzNote').value.trim();
        if (!person || !start) return alert('Escolha a pessoa e a data.');
        if (recurring && !days.length) return alert('Escolha pelo menos um dia da semana.');
        if (end && end < start) return alert('A data final não pode ser antes da inicial.');
        const btn = ev.submitter || document.getElementById('pzSave');
        btn.disabled = true;
        try {
            const { error } = await window.supabaseClient.from('sugestoes').insert({
                username: person,
                sugestao: 'AUSENCIA:' + JSON.stringify(recurring ? { type, start, end, days, note, by: me() } : { type, start, end, note, by: me() })
            });
            if (error) throw error;
            window.showToast && window.showToast(`${TYPES[type].icon} ${TYPES[type].label} marcada para ${person}!` + (type !== 'home' ? ' Ofensiva protegida 🔥' : ''), 'success');
            document.getElementById('pzNote').value = '';
            await window.loadPresenca();
            window.calculateXP && window.calculateXP();
        } catch (e) { alert('Erro ao salvar: ' + e.message); }
        finally { btn.disabled = false; }
    }

    function init() {
        const sel = document.getElementById('pzPerson');
        if (!sel) return;
        sel.innerHTML = TEAM.map(t => `<option value="${t}">${t}</option>`).join('');
        const cu = teamName(me());
        if (TEAM.includes(cu)) sel.value = cu;
        document.getElementById('presencaForm').onsubmit = save;
        const syncRec = () => {
            const isHome = document.querySelector('input[name="pzType"]:checked').value === 'home';
            const rec = document.getElementById('pzRecurring');
            document.getElementById('pzRecWrap').style.display = isHome ? 'block' : 'none';
            if (!isHome) rec.checked = false;
            document.getElementById('pzWdWrap').style.display = rec.checked ? 'flex' : 'none';
            document.getElementById('pzEndLabel').firstChild.textContent = rec.checked ? 'Até (vazio = sempre)' : 'Até';
        };
        document.querySelectorAll('input[name="pzType"]').forEach(r => r.addEventListener('change', syncRec));
        document.getElementById('pzRecurring').addEventListener('change', () => {
            if (document.getElementById('pzRecurring').checked) document.getElementById('pzEnd').value = '';
            syncRec();
        });
        syncRec();
        document.getElementById('pzStart').addEventListener('change', e => {
            e.target.dataset.touched = '1';
            const endEl = document.getElementById('pzEnd');
            if (!endEl.value || endEl.value < e.target.value) endEl.value = e.target.value;
        });
        document.getElementById('presencaPrev').onclick = () => { viewMonth.setMonth(viewMonth.getMonth() - 1); render(); };
        document.getElementById('presencaNext').onclick = () => { viewMonth.setMonth(viewMonth.getMonth() + 1); render(); };
        document.getElementById('presencaToday').onclick = () => { viewMonth = new Date(); viewMonth.setDate(1); selectedDay = ymd(new Date()); render(); };
        const tabBtn = document.querySelector('.tab-btn[data-target="tab-presenca"]');
        if (tabBtn) tabBtn.addEventListener('click', () => {
            const cu2 = teamName(me()); if (TEAM.includes(cu2)) sel.value = cu2;
            window.loadPresenca();
        });
        window.loadPresenca();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
