/**
 * Poplist pre-release — local only, max 10 tasks, 4 fixed categories, 2 accents, no sync/login.
 */
(function () {
  'use strict';

  var MAX_TASKS = 10;
  var STORAGE_KEY = 'poplist_pre_release_v1';

  var ACCENTS = {
    blue: {
      '--blue': '#3B82F6',
      '--blue-dim': '#1D4ED8',
      '--blue-lt': '#EFF6FF',
      '--blue-glow': 'rgba(59,130,246,.18)',
      '--shbtn': '0 4px 20px rgba(59,130,246,.35)',
    },
    teal: {
      '--blue': '#0D9488',
      '--blue-dim': '#0f766e',
      '--blue-lt': '#F0FDFA',
      '--blue-glow': 'rgba(13,148,136,.18)',
      '--shbtn': '0 4px 16px rgba(13,148,136,.38)',
    },
  };

  var CATS = [
    { id: 'work', labels: { en: 'WORK', ja: '仕事' } },
    { id: 'home', labels: { en: 'HOME', ja: '家' } },
    { id: 'personal', labels: { en: 'PERSONAL', ja: '自分' } },
    { id: 'other', labels: { en: 'OTHERS', ja: 'その他' } },
  ];

  var TIMINGS = [
    { id: 'Today', labels: { en: 'Today', ja: '今日' } },
    { id: 'This Week', labels: { en: 'This Week', ja: '今週' } },
    { id: 'Later', labels: { en: 'Later', ja: 'そのうち' } },
  ];

  function defaultState() {
    return { v: 1, lang: 'en', accent: 'blue', tasks: [] };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var o = JSON.parse(raw);
      if (!o || !Array.isArray(o.tasks)) return defaultState();
      return {
        v: o.v || 1,
        lang: o.lang === 'ja' ? 'ja' : 'en',
        accent: o.accent === 'teal' ? 'teal' : 'blue',
        tasks: o.tasks,
      };
    } catch (e) {
      return defaultState();
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function applyAccent(accent) {
    var map = ACCENTS[accent] || ACCENTS.blue;
    var root = document.documentElement;
    Object.keys(map).forEach(function (k) {
      root.style.setProperty(k, map[k]);
    });
  }

  function applyLangClass(lang) {
    document.body.classList.toggle('lang-ja', lang === 'ja');
    document.documentElement.lang = lang === 'ja' ? 'ja' : 'en';
  }

  function t(state, en, ja) {
    return state.lang === 'ja' ? ja : en;
  }

  function uid() {
    return 'pre_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
  }

  /* ── Settings-only page ── */
  function initSettingsPage() {
    var state = loadState();
    applyAccent(state.accent);
    applyLangClass(state.lang);

    var enBtn = document.getElementById('langEN');
    var jpBtn = document.getElementById('langJP');
    if (enBtn) enBtn.classList.toggle('active', state.lang === 'en');
    if (jpBtn) jpBtn.classList.toggle('active', state.lang === 'ja');

    function refreshLabels() {
      document.querySelectorAll('[data-t-en]').forEach(function (el) {
        el.textContent = t(state, el.getAttribute('data-t-en'), el.getAttribute('data-t-ja'));
      });
    }
    refreshLabels();

    document.querySelectorAll('.accent-swatch').forEach(function (sw) {
      sw.classList.toggle('sel', sw.getAttribute('data-accent') === state.accent);
      sw.onclick = function () {
        state.accent = sw.getAttribute('data-accent') === 'teal' ? 'teal' : 'blue';
        applyAccent(state.accent);
        saveState(state);
        document.querySelectorAll('.accent-swatch').forEach(function (s) {
          s.classList.toggle('sel', s.getAttribute('data-accent') === state.accent);
        });
      };
    });

    if (enBtn)
      enBtn.onclick = function () {
        state.lang = 'en';
        saveState(state);
        applyLangClass(state.lang);
        if (enBtn) enBtn.classList.add('active');
        if (jpBtn) jpBtn.classList.remove('active');
        refreshLabels();
      };
    if (jpBtn)
      jpBtn.onclick = function () {
        state.lang = 'ja';
        saveState(state);
        applyLangClass(state.lang);
        if (jpBtn) jpBtn.classList.add('active');
        if (enBtn) enBtn.classList.remove('active');
        refreshLabels();
      };
  }

  /* ── App page ── */
  function initAppPage() {
    var state = loadState();
    applyAccent(state.accent);
    applyLangClass(state.lang);

    var enBtn = document.getElementById('langEN');
    var jpBtn = document.getElementById('langJP');
    if (enBtn) enBtn.classList.toggle('active', state.lang === 'en');
    if (jpBtn) jpBtn.classList.toggle('active', state.lang === 'ja');

    var tasksContainer = document.getElementById('preTasksContainer');
    var taskCountEl = document.getElementById('preTaskCount');
    var fab = document.getElementById('preFabBtn');
    var modal = document.getElementById('preAddModal');
    var modalTitle = document.getElementById('preModalTitle');
    var inpText = document.getElementById('preInputText');
    var selCat = document.getElementById('preSelCat');
    var selTiming = document.getElementById('preSelTiming');
    var btnCancel = document.getElementById('preModalCancel');
    var btnSave = document.getElementById('preModalSave');
    var settingsBtn = document.getElementById('preSettingsBtn');

    function refreshStaticCopy() {
      document.querySelectorAll('[data-t-en]').forEach(function (el) {
        el.textContent = t(state, el.getAttribute('data-t-en'), el.getAttribute('data-t-ja'));
      });
      if (modalTitle)
        modalTitle.textContent = t(state, 'New task', '新しいタスク');
      if (fab)
        fab.textContent = t(state, 'Add task', 'タスクを追加');
      document.querySelectorAll('[data-ph-en]').forEach(function (el) {
        el.placeholder = t(state, el.getAttribute('data-ph-en'), el.getAttribute('data-ph-ja'));
      });
      if (selCat) {
        CATS.forEach(function (c) {
          var opt = selCat.querySelector('option[value="' + c.id + '"]');
          if (opt) opt.textContent = t(state, c.labels.en, c.labels.ja);
        });
      }
      if (selTiming) {
        TIMINGS.forEach(function (tm) {
          var opt = selTiming.querySelector('option[value="' + tm.id + '"]');
          if (opt) opt.textContent = t(state, tm.labels.en, tm.labels.ja);
        });
      }
    }

    function totalTasks() {
      return state.tasks.length;
    }

    function render() {
      if (!tasksContainer) return;
      tasksContainer.innerHTML = '';
      CATS.forEach(function (cat) {
        var list = state.tasks.filter(function (x) {
          return x.cat === cat.id;
        });
        var card = document.createElement('div');
        card.className = 'category-card';
        card.dataset.cat = cat.id;
        var hdr = document.createElement('div');
        hdr.className = 'category-header';
        hdr.innerHTML =
          '<span class="cat-name">' +
          t(state, cat.labels.en, cat.labels.ja) +
          '</span><span class="cat-count">' +
          list.length +
          '</span>';
        var body = document.createElement('div');
        body.className = 'cat-body';
        list.forEach(function (task) {
          var row = document.createElement('div');
          row.className = 'task-item';
          row.dataset.id = task.id;
          var bub = document.createElement('button');
          bub.type = 'button';
          bub.className = 'task-bubble' + (task.done ? ' done' : '');
          bub.setAttribute('aria-label', 'toggle');
          bub.onclick = function () {
            task.done = !task.done;
            saveState(state);
            render();
            updateChrome();
          };
          var tx = document.createElement('div');
          tx.className = 'task-text' + (task.done ? ' done' : '');
          tx.textContent = task.text;
          var chip = document.createElement('span');
          chip.className = 'timing-chip';
          var tm = TIMINGS.find(function (x) {
            return x.id === task.timing;
          });
          chip.textContent = tm ? t(state, tm.labels.en, tm.labels.ja) : task.timing;
          row.appendChild(bub);
          row.appendChild(tx);
          row.appendChild(chip);
          body.appendChild(row);
        });
        card.appendChild(hdr);
        card.appendChild(body);
        tasksContainer.appendChild(card);
      });

      if (taskCountEl) {
        taskCountEl.textContent = t(
          state,
          totalTasks() + ' / ' + MAX_TASKS + ' tasks · local only · no sync',
          'タスク ' + totalTasks() + ' / ' + MAX_TASKS + ' 件 · 端末内のみ · 同期なし'
        );
      }
    }

    function updateChrome() {
      if (fab) fab.disabled = totalTasks() >= MAX_TASKS;
      render();
    }

    function openModal() {
      if (totalTasks() >= MAX_TASKS) return;
      if (inpText) inpText.value = '';
      if (selCat) selCat.value = 'other';
      if (selTiming) selTiming.value = 'This Week';
      refreshStaticCopy();
      if (modalTitle) modalTitle.textContent = t(state, 'New task', '新しいタスク');
      if (modal) modal.classList.add('open');
      if (inpText) setTimeout(function () { inpText.focus(); }, 80);
    }

    function closeModal() {
      if (modal) modal.classList.remove('open');
    }

    function saveNewTask() {
      var text = (inpText && inpText.value.trim()) || '';
      if (!text) return;
      if (totalTasks() >= MAX_TASKS) return;
      var cat = (selCat && selCat.value) || 'other';
      var timing = (selTiming && selTiming.value) || 'This Week';
      state.tasks.push({ id: uid(), text: text, cat: cat, timing: timing, done: false });
      saveState(state);
      closeModal();
      updateChrome();
    }

    if (enBtn)
      enBtn.onclick = function () {
        state.lang = 'en';
        saveState(state);
        applyLangClass(state.lang);
        if (enBtn) enBtn.classList.add('active');
        if (jpBtn) jpBtn.classList.remove('active');
        refreshStaticCopy();
        render();
      };
    if (jpBtn)
      jpBtn.onclick = function () {
        state.lang = 'ja';
        saveState(state);
        applyLangClass(state.lang);
        if (jpBtn) jpBtn.classList.add('active');
        if (enBtn) enBtn.classList.remove('active');
        refreshStaticCopy();
        render();
      };

    if (fab) fab.onclick = openModal;
    if (btnCancel) btnCancel.onclick = closeModal;
    if (btnSave) btnSave.onclick = saveNewTask;
    if (modal)
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    if (settingsBtn) settingsBtn.onclick = function () {
      window.location.href = 'pre-settings.html';
    };

    refreshStaticCopy();
    updateChrome();
  }

  function initLpPage() {
    var state = loadState();
    applyAccent(state.accent);
    applyLangClass(state.lang);
    var enBtn = document.getElementById('langEN');
    var jpBtn = document.getElementById('langJP');
    if (enBtn) enBtn.classList.toggle('active', state.lang === 'en');
    if (jpBtn) jpBtn.classList.toggle('active', state.lang === 'ja');

    function refresh() {
      document.querySelectorAll('[data-t-en]').forEach(function (el) {
        el.textContent = t(state, el.getAttribute('data-t-en'), el.getAttribute('data-t-ja'));
      });
    }
    refresh();

    if (enBtn)
      enBtn.onclick = function () {
        state.lang = 'en';
        saveState(state);
        applyLangClass(state.lang);
        if (enBtn) enBtn.classList.add('active');
        if (jpBtn) jpBtn.classList.remove('active');
        refresh();
      };
    if (jpBtn)
      jpBtn.onclick = function () {
        state.lang = 'ja';
        saveState(state);
        applyLangClass(state.lang);
        if (jpBtn) jpBtn.classList.add('active');
        if (enBtn) enBtn.classList.remove('active');
        refresh();
      };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-pre-page') || 'app';
    if (page === 'settings') initSettingsPage();
    else if (page === 'lp') initLpPage();
    else initAppPage();
  });
})();
