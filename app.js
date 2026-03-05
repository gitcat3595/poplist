// i18n strings
const i18n = {
    en: {
        speechLang: 'en-US',
        tagline: 'Speak. Sort. Ship.',
        description: 'Talk through what\'s on your plate.<br>Get a task list. Start knocking it out.',
        cta: 'Overwhelmed? Just start talking.',
        speak: 'Speak',
        speakAgain: 'Speak again',
        startNew: 'Start new list',
        recording: 'Recording...',
        tapToStop: 'Tap to stop',
        building: 'Building your list...',
        readyPrompt: 'Speak to build your task list',
        tasksAdded: (n) => `${n} tasks added`,
        tasksDemoAdded: (n) => `${n} tasks added (demo)`,
        apiError: (msg) => `API error: ${msg}`,
        micError: 'Error. Check mic permissions.',
        filterToday: 'Today',
        filterWeek: 'This Week',
        filterLater: 'Later',
        filterAll: 'All',
        settings: 'Settings',
        addTask: 'Add task',
        newTask: 'New task',
        noMatch: 'No tasks match this filter',
        completionTitle: 'List cleared.<br>Get some rest.',
        completionMsg: 'Everything\'s done.<br>Whenever you\'re ready, start a new list.',
        modalCategories: 'Categories',
        categoryName: 'Category name',
        colorLabel: 'Color',
        timings: { today: 'Today', week: 'Week', later: 'Later' },
        cats: { work: 'Work', home: 'Home', personal: 'Personal', other: 'Other' },
        gptPrompt: `You are a task extraction assistant.
Extract actionable tasks from the user's speech and return them as JSON.

Return only this JSON format:
{
  "tasks": [
    {
      "text": "Task description",
      "category": "work" or "home" or "personal" or "other"
    }
  ]
}

Category rules:
- work: job-related (meetings, emails, reports, deadlines)
- home: household (shopping, cleaning, errands, repairs)
- personal: self (gym, health, hobbies, learning)
- other: anything else

Return only valid JSON, no other text.`
    },

    ja: {
        speechLang: 'ja-JP',
        tagline: '話す。整理する。実行する。',
        description: '頭の中にあることを話しましょう。<br>タスクリストを作成して、こなしていきましょう。',
        cta: '圧倒されていますか？ただ話し始めましょう。',
        speak: '話す',
        speakAgain: 'もう一度話す',
        startNew: '新しいリストを始める',
        recording: '録音中...',
        tapToStop: 'タップして停止',
        building: 'リストを作成中...',
        readyPrompt: '話してタスクリストを作成',
        tasksAdded: (n) => `${n}件のタスクを追加しました`,
        tasksDemoAdded: (n) => `${n}件のタスクを追加しました（デモ）`,
        apiError: (msg) => `APIエラー: ${msg}`,
        micError: 'エラー。マイクの権限を確認してください。',
        filterToday: '今日',
        filterWeek: '今週',
        filterLater: '後で',
        filterAll: 'すべて',
        settings: '設定',
        addTask: 'タスクを追加',
        newTask: '新しいタスク',
        noMatch: 'このフィルターに一致するタスクはありません',
        completionTitle: 'リスト完了。<br>ゆっくり休んでください。',
        completionMsg: 'すべて完了しました。<br>準備ができたら、新しいリストを始めましょう。',
        modalCategories: 'カテゴリー',
        categoryName: 'カテゴリー名',
        colorLabel: '色',
        timings: { today: '今日', week: '今週', later: '後で' },
        cats: { work: '仕事', home: '家', personal: '個人', other: 'その他' },
        gptPrompt: `あなたはタスク抽出アシスタントです。ユーザーの音声からアクションタスクを抽出し、JSONとして返してください。

以下のJSON形式のみで返してください：
{
  "tasks": [
    {
      "text": "タスクの説明",
      "category": "work" または "home" または "personal" または "other"
    }
  ]
}

カテゴリールール：
- work: 仕事関連（会議、メール、レポート、締め切り）
- home: 家庭関連（買い物、掃除、用事、修理）
- personal: 個人関連（ジム、健康、趣味、学習）
- other: その他すべて

有効なJSONのみを返してください。他のテキストは不要です。`
    },

    fr: {
        speechLang: 'fr-FR',
        tagline: 'Parlez. Triez. Livrez.',
        description: 'Exprimez ce que vous avez à faire.<br>Obtenez une liste. Commencez à avancer.',
        cta: 'Submergé ? Commencez juste à parler.',
        speak: 'Parler',
        speakAgain: 'Parler à nouveau',
        startNew: 'Commencer une nouvelle liste',
        recording: 'Enregistrement...',
        tapToStop: 'Appuyer pour arrêter',
        building: 'Construction de votre liste...',
        readyPrompt: 'Parlez pour créer votre liste de tâches',
        tasksAdded: (n) => `${n} tâches ajoutées`,
        tasksDemoAdded: (n) => `${n} tâches ajoutées (démo)`,
        apiError: (msg) => `Erreur API : ${msg}`,
        micError: 'Erreur. Vérifiez les permissions du microphone.',
        filterToday: "Aujourd'hui",
        filterWeek: 'Cette semaine',
        filterLater: 'Plus tard',
        filterAll: 'Tout',
        settings: 'Paramètres',
        addTask: 'Ajouter une tâche',
        newTask: 'Nouvelle tâche',
        noMatch: 'Aucune tâche ne correspond à ce filtre',
        completionTitle: 'Liste terminée.<br>Reposez-vous.',
        completionMsg: 'Tout est fait.<br>Quand vous êtes prêt, commencez une nouvelle liste.',
        modalCategories: 'Catégories',
        categoryName: 'Nom de la catégorie',
        colorLabel: 'Couleur',
        timings: { today: "Auj.", week: 'Semaine', later: 'Plus tard' },
        cats: { work: 'Travail', home: 'Maison', personal: 'Personnel', other: 'Autre' },
        gptPrompt: `Vous êtes un assistant d'extraction de tâches.
Extrayez les tâches actionnables du discours de l'utilisateur et renvoyez-les en JSON.

Renvoyez uniquement ce format JSON :
{
  "tasks": [
    {
      "text": "Description de la tâche",
      "category": "work" ou "home" ou "personal" ou "other"
    }
  ]
}

Règles de catégorie :
- work : lié au travail (réunions, emails, rapports, délais)
- home : ménage (courses, nettoyage, errands, réparations)
- personal : personnel (gym, santé, loisirs, apprentissage)
- other : tout le reste

Renvoyez uniquement du JSON valide, sans autre texte.`
    },

    zh: {
        speechLang: 'zh-CN',
        tagline: '说话。整理。完成。',
        description: '说出您要做的事情。<br>获取任务列表，开始行动。',
        cta: '不知所措？开始说话吧。',
        speak: '说话',
        speakAgain: '再次说话',
        startNew: '开始新列表',
        recording: '录音中...',
        tapToStop: '点击停止',
        building: '正在创建您的列表...',
        readyPrompt: '说话以创建任务列表',
        tasksAdded: (n) => `已添加 ${n} 个任务`,
        tasksDemoAdded: (n) => `已添加 ${n} 个任务（演示）`,
        apiError: (msg) => `API 错误：${msg}`,
        micError: '错误。请检查麦克风权限。',
        filterToday: '今天',
        filterWeek: '本周',
        filterLater: '稍后',
        filterAll: '全部',
        settings: '设置',
        addTask: '添加任务',
        newTask: '新任务',
        noMatch: '没有与此筛选器匹配的任务',
        completionTitle: '列表完成。<br>好好休息。',
        completionMsg: '一切都完成了。<br>准备好后，开始新列表。',
        modalCategories: '分类',
        categoryName: '分类名称',
        colorLabel: '颜色',
        timings: { today: '今天', week: '本周', later: '稍后' },
        cats: { work: '工作', home: '家庭', personal: '个人', other: '其他' },
        gptPrompt: `您是一个任务提取助手。
从用户的语音中提取可操作的任务，并以JSON格式返回。

仅返回以下JSON格式：
{
  "tasks": [
    {
      "text": "任务描述",
      "category": "work" 或 "home" 或 "personal" 或 "other"
    }
  ]
}

分类规则：
- work：工作相关（会议、邮件、报告、截止日期）
- home：家庭相关（购物、清洁、跑腿、维修）
- personal：个人相关（健身、健康、爱好、学习）
- other：其他任何事情

仅返回有效的JSON，不要包含其他文本。`
    }
};

// App state
const app = {
    tasks: [],
    categories: [
        { id: 'work',     name: 'Work',     color: '#505050' },
        { id: 'home',     name: 'Home',     color: '#3d4a3d' },
        { id: 'personal', name: 'Personal', color: '#3a3a4a' },
        { id: 'other',    name: 'Other',    color: '#333333' }
    ],
    currentFilter: 'all',
    recognition: null,
    lang: 'en',
    apiKey: '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'
};

// Clear tasks on load (dev mode)
localStorage.removeItem('poplist_tasks');

// Language persistence
function loadLang() {
    const saved = localStorage.getItem('poplist_lang');
    if (saved && i18n[saved]) app.lang = saved;
}

function setLanguage(lang) {
    app.lang = lang;
    document.documentElement.lang = lang;

    const t = i18n[lang];

    // Static DOM text
    document.querySelector('.tagline').textContent = t.tagline;
    document.querySelector('.description').innerHTML = t.description;
    document.querySelector('.cta-text').textContent = t.cta;
    document.querySelector('.btn-text').textContent = t.speak;
    document.getElementById('statusText').textContent = t.readyPrompt;

    // Filter buttons
    document.querySelector('[data-filter="today"]').textContent = t.filterToday;
    document.querySelector('[data-filter="week"]').textContent = t.filterWeek;
    document.querySelector('[data-filter="later"]').textContent = t.filterLater;
    document.querySelector('[data-filter="all"]').textContent = t.filterAll;

    // Settings button + modal header
    document.getElementById('settingsBtn').textContent = t.settings;
    document.querySelector('#settingsModal .modal-header h2').textContent = t.modalCategories;

    // Reset category names to lang defaults
    app.categories.forEach(cat => {
        if (t.cats[cat.id]) cat.name = t.cats[cat.id];
    });
    saveCategories();

    // Active lang button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update speech recognition lang
    if (app.recognition) {
        app.recognition.lang = t.speechLang;
    }

    // Persist
    localStorage.setItem('poplist_lang', lang);

    // Refresh rendered tasks if any exist
    if (app.tasks.length > 0) {
        renderTasks();
    }
}

// Init speech recognition
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.log('SpeechRecognition not supported');
        return false;
    }

    app.recognition = new SpeechRecognition();
    app.recognition.lang = i18n[app.lang].speechLang;
    app.recognition.continuous = false;
    app.recognition.interimResults = false;

    let transcript = '';

    app.recognition.onstart = () => {
        document.getElementById('voiceBtn').classList.add('recording');
        document.querySelector('.btn-text').textContent = i18n[app.lang].recording;
        const statusText = document.getElementById('statusText');
        statusText.textContent = i18n[app.lang].tapToStop;
        statusText.classList.add('recording');
        transcript = '';
    };

    app.recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript;
            }
        }
    };

    app.recognition.onend = () => {
        document.getElementById('voiceBtn').classList.remove('recording');
        document.querySelector('.btn-text').textContent = i18n[app.lang].speak;
        const statusText = document.getElementById('statusText');
        statusText.classList.remove('recording');

        if (transcript.trim()) {
            statusText.textContent = i18n[app.lang].building;
            app.tasks = [];
            setTimeout(() => {
                processWithChatGPT(transcript);
                transcript = '';
            }, 50);
        } else {
            statusText.textContent = i18n[app.lang].readyPrompt;
        }
    };

    app.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        document.getElementById('voiceBtn').classList.remove('recording');
        document.querySelector('.btn-text').textContent = i18n[app.lang].speak;
        const statusText = document.getElementById('statusText');
        statusText.classList.remove('recording');

        if (event.error === 'no-speech') {
            // Silence — just reset quietly
            statusText.textContent = i18n[app.lang].readyPrompt;
            return;
        }

        if (event.error === 'service-not-allowed' || event.error === 'not-allowed') {
            statusText.textContent = 'Mic blocked — open via a local server (not file://)';
            setTimeout(() => {
                statusText.textContent = i18n[app.lang].readyPrompt;
            }, 4000);
            return;
        }

        // Network or other errors — show message then load demo data
        statusText.textContent = i18n[app.lang].micError;
        setTimeout(() => {
            if (app.tasks.length === 0) useDummyData('');
            else statusText.textContent = i18n[app.lang].readyPrompt;
        }, 2000);
    };

    return true;
}

// Extract tasks with ChatGPT
async function processWithChatGPT(text) {
    console.log('Extracting tasks with ChatGPT...');

    if (!app.apiKey) {
        console.log('No API key - using dummy data');
        useDummyData(text);
        return;
    }

    const t = i18n[app.lang];

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${app.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: t.gptPrompt
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const result = JSON.parse(content);

        console.log(`Tasks extracted: ${result.tasks.length}`);

        result.tasks.forEach((taskData) => {
            app.tasks.push({
                id: Date.now() + Math.random(),
                text: taskData.text,
                category: taskData.category,
                timing: 'later',
                completed: false,
                createdAt: Date.now()
            });
        });

        saveTasks();
        renderTasks();

        document.getElementById('statusText').textContent = t.tasksAdded(result.tasks.length);
        setTimeout(() => {
            document.getElementById('statusText').textContent = t.readyPrompt;
        }, 3000);

    } catch (error) {
        console.error('ChatGPT API error:', error.message);
        document.getElementById('statusText').textContent = t.apiError(error.message);
        setTimeout(() => {
            useDummyData(text);
        }, 1000);
    }
}

// Dummy data for testing
function useDummyData(text) {
    const dummyTasks = [
        { text: 'Prep meeting slides', category: 'work' },
        { text: 'Reply to client emails', category: 'work' },
        { text: 'Finish project report and get sign-off before EOD', category: 'work' },
        { text: 'Grocery run — get food for the week', category: 'home' },
        { text: 'Pick up dry cleaning', category: 'home' },
        { text: 'Hit the gym', category: 'personal' },
        { text: 'Read for 30 minutes', category: 'personal' },
        { text: 'Book dentist appointment', category: 'other' }
    ];

    dummyTasks.forEach((taskData) => {
        app.tasks.push({
            id: Date.now() + Math.random(),
            text: taskData.text,
            category: taskData.category,
            timing: 'later',
            completed: false,
            createdAt: Date.now()
        });
    });

    saveTasks();
    renderTasks();

    const t = i18n[app.lang];
    document.getElementById('statusText').textContent = t.tasksDemoAdded(dummyTasks.length);
    setTimeout(() => {
        document.getElementById('statusText').textContent = t.readyPrompt;
    }, 3000);
}

// Lighten a hex color
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

// Darken a hex color
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 +
        (R > 0 ? R : 0) * 0x10000 +
        (G > 0 ? G : 0) * 0x100 +
        (B > 0 ? B : 0))
        .toString(16).slice(1);
}

// Get category name
function getCategoryName(categoryId) {
    const category = app.categories.find(c => c.id === categoryId);
    return category ? category.name : i18n[app.lang].cats.other;
}

// Render tasks
function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const filterSection = document.querySelector('.filter-section');
    const header = document.querySelector('header');
    const voiceSection = document.querySelector('.voice-input-section');
    const t = i18n[app.lang];

    let visibleTasks = app.tasks;

    if (app.currentFilter !== 'all') {
        visibleTasks = visibleTasks.filter(task => task.timing === app.currentFilter);
    }

    container.innerHTML = '';

    if (app.tasks.length === 0) {
        container.classList.add('hidden');
        filterSection.classList.add('hidden');
        header.classList.remove('hidden');
        document.getElementById('settingsBtn').style.display = 'none';
        return;
    }

    container.classList.remove('hidden');
    filterSection.classList.remove('hidden');
    document.getElementById('settingsBtn').style.display = 'block';
    header.classList.add('hidden');

    if (visibleTasks.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:40px;color:#444;grid-column:1/-1;">${t.noMatch}</div>`;
        if (voiceSection) {
            container.appendChild(voiceSection);
            voiceSection.classList.remove('hidden');
        }
        return;
    }

    const tasksByCategory = {};
    app.categories.forEach(cat => {
        tasksByCategory[cat.id] = visibleTasks.filter(task => task.category === cat.id);
    });

    app.categories.forEach(category => {
        const tasks = tasksByCategory[category.id];
        if (tasks.length === 0) return;

        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';

        let pressTimer;
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';

        categoryCard.style.borderLeft = `3px solid ${category.color}`;

        categoryHeader.innerHTML = `
            <span>${category.name}</span>
            <span class="task-count">${tasks.length}</span>
        `;

        categoryHeader.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => openCategoryEdit(category.id), 500);
        });
        categoryHeader.addEventListener('mouseup', () => clearTimeout(pressTimer));
        categoryHeader.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        categoryHeader.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pressTimer = setTimeout(() => openCategoryEdit(category.id), 500);
        });
        categoryHeader.addEventListener('touchend', () => clearTimeout(pressTimer));

        categoryCard.appendChild(categoryHeader);

        const tasksList = document.createElement('div');
        tasksList.className = 'tasks-list';
        tasksList.innerHTML = tasks.map(task => {
            const bubbleColor = lightenColor(category.color, 20);
            return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}" data-category="${category.id}" draggable="true">
                <div class="task-bubble" style="--bubble-color: ${bubbleColor}; background: ${bubbleColor};" onclick="toggleTask(${task.id})"></div>
                <div class="task-content">
                    <span class="task-text" onclick="editTask(${task.id})" contenteditable="false">${task.text}</span>
                    <div class="task-timing" onclick="cycleTiming(${task.id})">
                        <span class="timing-display">${getTimingLabel(task.timing)}</span>
                    </div>
                </div>
            </div>
        `}).join('');

        const addButton = document.createElement('button');
        addButton.className = 'add-task-btn';
        addButton.textContent = t.addTask;
        addButton.onclick = () => addNewTask(category.id);
        tasksList.appendChild(addButton);

        categoryCard.appendChild(tasksList);
        container.appendChild(categoryCard);
    });

    setupDragAndDrop();

    if (voiceSection) {
        container.appendChild(voiceSection);
        voiceSection.classList.remove('hidden');
        const voiceBtnText = voiceSection.querySelector('.btn-text');
        if (voiceBtnText) voiceBtnText.textContent = t.speakAgain;
    }
}

// Completion screen
function showCompletionScreen() {
    const container = document.getElementById('tasksContainer');
    const filterSection = document.querySelector('.filter-section');
    const voiceSection = document.querySelector('.voice-input-section');
    const settingsBtn = document.getElementById('settingsBtn');
    const t = i18n[app.lang];

    if (settingsBtn) settingsBtn.style.display = 'none';

    container.classList.remove('hidden');
    filterSection.classList.add('hidden');

    container.innerHTML = `
        <div class="completion-screen">
            <h2 class="completion-title">${t.completionTitle}</h2>
            <p class="completion-message">
                ${t.completionMsg}
            </p>
        </div>
    `;

    container.appendChild(voiceSection);
    voiceSection.classList.remove('hidden');
    const voiceBtnText = voiceSection.querySelector('.btn-text');
    if (voiceBtnText) voiceBtnText.textContent = t.startNew;

    createMassiveBubbleBurst();
}

// Mass bubble burst on completion
function createMassiveBubbleBurst() {
    const bubbleCount = 50;
    const colors = ['#ffffff', '#bbbbbb', '#888888', '#555555', '#aaaaaa', '#dddddd'];

    for (let i = 0; i < bubbleCount; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';

            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const angle = Math.random() * 360;
            const distance = 100 + Math.random() * 200;
            const size = 10 + Math.random() * 20;

            bubble.style.left = x + 'px';
            bubble.style.top = y + 'px';
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            bubble.style.setProperty('--tx', Math.cos(angle * Math.PI / 180) * distance + 'px');
            bubble.style.setProperty('--ty', Math.sin(angle * Math.PI / 180) * distance + 'px');
            bubble.style.animationDuration = (0.6 + Math.random() * 0.8) + 's';

            document.body.appendChild(bubble);
            setTimeout(() => bubble.remove(), 2000);
        }, i * 30);
    }
}

// Add new task
function addNewTask(categoryId) {
    const newTask = {
        id: Date.now() + Math.random(),
        text: '',
        category: categoryId,
        timing: 'later',
        completed: false,
        createdAt: Date.now()
    };

    app.tasks.push(newTask);
    saveTasks();
    renderTasks();

    setTimeout(() => editTask(newTask.id), 100);
}

// Timing label
function getTimingLabel(timing) {
    const timings = i18n[app.lang].timings;
    return timings[timing] || timings.later;
}

// Cycle timing on tap
function cycleTiming(taskId) {
    const task = app.tasks.find(t => t.id === taskId);
    if (!task) return;

    const timings = ['later', 'today', 'week'];
    task.timing = timings[(timings.indexOf(task.timing) + 1) % timings.length];
    saveTasks();
    renderTasks();
}

// Drag and drop
function setupDragAndDrop() {
    let draggedTaskId = null;

    document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedTaskId = parseFloat(item.dataset.taskId);
            item.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
        });
        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
            draggedTaskId = null;
        });
    });

    document.querySelectorAll('.category-card').forEach((card, index) => {
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            card.classList.add('drag-over');
        });
        card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            if (!draggedTaskId) return;

            const targetCategory = app.categories[index]?.id;
            if (!targetCategory) return;

            const task = app.tasks.find(t => t.id === draggedTaskId);
            if (task && task.category !== targetCategory) {
                task.category = targetCategory;
                saveTasks();
                renderTasks();
            }
        });
    });
}

// Edit task inline
function editTask(taskId) {
    const task = app.tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskElement = document.querySelector(`[data-task-id="${taskId}"] .task-text`);
    if (!taskElement) return;

    if (!task.text || !task.text.trim()) {
        taskElement.setAttribute('data-placeholder', i18n[app.lang].newTask);
    }

    taskElement.contentEditable = true;
    taskElement.focus();

    taskElement.addEventListener('blur', function handler() {
        taskElement.contentEditable = false;
        task.text = taskElement.textContent.trim();
        saveTasks();
        taskElement.removeEventListener('blur', handler);
    });

    taskElement.addEventListener('keydown', function handler(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            taskElement.blur();
            taskElement.removeEventListener('keydown', handler);
        }
    });
}

// Open category edit (long press on header)
function openCategoryEdit(categoryId) {
    const category = app.categories.find(c => c.id === categoryId);
    if (!category) return;

    const t = i18n[app.lang];
    const modal = document.getElementById('settingsModal');
    document.getElementById('categorySettings').innerHTML = `
        <div class="category-setting-item">
            <label>${t.categoryName}</label>
            <input type="text" value="${category.name}"
                   onchange="updateCategoryName('${category.id}', this.value)">
            <label>${t.colorLabel}</label>
            <div class="color-options">
                ${getColorOptions().map(color => `
                    <div class="color-option ${category.color === color ? 'selected' : ''}"
                         style="background-color: ${color};"
                         onclick="updateCategoryColor('${category.id}', '${color}')"></div>
                `).join('')}
            </div>
        </div>
    `;

    modal.classList.add('show');
}

// Toggle task completion + bubble pop
function toggleTask(taskId) {
    const task = app.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = true;

    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        const rect = taskElement.getBoundingClientRect();
        createBubbleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    setTimeout(() => {
        app.tasks = app.tasks.filter(t => t.id !== taskId);
        saveTasks();

        if (app.tasks.length === 0) {
            showCompletionScreen();
        } else {
            renderTasks();
        }
    }, 300);
}

// Single task bubble pop
function createBubbleBurst(x, y) {
    const colors = ['#ffffff', '#aaaaaa', '#777777', '#555555', '#cccccc'];

    for (let i = 0; i < 12; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        const angle = (360 / 12) * i;
        const distance = 40 + Math.random() * 50;
        const size = 8 + Math.random() * 10;

        bubble.style.left = x + 'px';
        bubble.style.top = y + 'px';
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        bubble.style.setProperty('--tx', Math.cos(angle * Math.PI / 180) * distance + 'px');
        bubble.style.setProperty('--ty', Math.sin(angle * Math.PI / 180) * distance + 'px');

        document.body.appendChild(bubble);
        setTimeout(() => bubble.remove(), 800);
    }
}

// Filter
function setFilter(filter) {
    app.currentFilter = filter;

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    renderTasks();
}

// Settings modal
function openSettings() {
    const t = i18n[app.lang];
    const settingsContainer = document.getElementById('categorySettings');
    settingsContainer.innerHTML = app.categories.map(category => `
        <div class="category-setting-item">
            <label>${t.categoryName}</label>
            <input type="text" value="${category.name}"
                   onchange="updateCategoryName('${category.id}', this.value)">
            <label>${t.colorLabel}</label>
            <div class="color-options">
                ${getColorOptions().map(color => `
                    <div class="color-option ${category.color === color ? 'selected' : ''}"
                         style="background-color: ${color};"
                         onclick="updateCategoryColor('${category.id}', '${color}')"></div>
                `).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('settingsModal').classList.add('show');
}

// Grey-scale color palette for category customization
function getColorOptions() {
    return [
        '#222222', '#333333', '#444444', '#555555',
        '#3d4a3d', '#3a3a4a', '#4a3a3a', '#3d3d2a',
        '#2a3d4a', '#4a3d2a', '#2a4a3d', '#3a2a4a',
        '#606060', '#707070'
    ];
}

function updateCategoryName(categoryId, newName) {
    const category = app.categories.find(c => c.id === categoryId);
    if (category) {
        category.name = newName;
        saveCategories();
        renderTasks();
        openSettings();
    }
}

function updateCategoryColor(categoryId, newColor) {
    const category = app.categories.find(c => c.id === categoryId);
    if (category) {
        category.color = newColor;
        saveCategories();
        renderTasks();
        openSettings();
    }
}

// Persistence
function saveTasks()      { localStorage.setItem('poplist_tasks', JSON.stringify(app.tasks)); }
function saveCategories() { localStorage.setItem('poplist_categories', JSON.stringify(app.categories)); }

function loadTasks() {
    const saved = localStorage.getItem('poplist_tasks');
    if (saved) app.tasks = JSON.parse(saved);
}

function loadCategories() {
    const saved = localStorage.getItem('poplist_categories');
    if (saved) app.categories = JSON.parse(saved);
}

function loadApiKey() {
    const saved = localStorage.getItem('poplist_apikey');
    if (saved) app.apiKey = saved;
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
    loadLang();
    loadCategories();
    loadTasks();
    loadApiKey();

    setLanguage(app.lang);

    renderTasks();

    const recognitionReady = initSpeechRecognition();

    document.getElementById('voiceBtn').addEventListener('click', () => {
        if (!recognitionReady) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        const btn = document.getElementById('voiceBtn');
        if (btn.classList.contains('recording')) {
            app.recognition.stop();
        } else {
            app.recognition.lang = i18n[app.lang].speechLang;
            app.recognition.start();
        }
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            if (filter) setFilter(filter);
        });
    });

    document.getElementById('settingsBtn')?.addEventListener('click', openSettings);

    document.getElementById('closeModal')?.addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('show');
    });

    document.getElementById('settingsModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') e.currentTarget.classList.remove('show');
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
});
