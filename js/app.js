// ==========================================
// POPLIST - Voice Task Manager
// Smart keyword-based classification (No AI)
// Languages: English & Japanese
// ==========================================

// i18n translations
const i18n = {
    en: {
        speechLang: 'en-US',
        tagline: 'Have things popping up in your head?',
        description: 'Talk through what\'s on your mind.<br>Get a task list and start knocking it out.',
        cta: '',
        speak: 'Speak',
        speakAgain: 'Speak again',
        startNew: 'Start new list',
        recording: 'Recording...',
        tapToStop: 'Tap to stop',
        building: 'Building your list...',
        readyPrompt: 'Speak to build your task list',
        tasksAdded: (n) => `${n} task${n !== 1 ? 's' : ''} added`,
        micError: 'Error. Check mic permissions.',
        filterToday: 'Today',
        filterWeek: 'This Week',
        filterLater: 'Later',
        filterAll: 'All',
        settings: 'Settings',
        addTask: 'Add task',
        newTask: 'New task',
        newTasksSection: 'New Tasks',
        noMatch: 'No tasks match this filter',
        completionTitle: 'All done',
        completionMessage: 'Nice work.',
        categories: {
            work: { name: 'Work', color: '#555555' },
            home: { name: 'Home', color: '#777777' },
            personal: { name: 'Personal', color: '#999999' },
            other: { name: 'Other', color: '#AAAAAA' }
        }
    },
    ja: {
        speechLang: 'ja-JP',
        tagline: 'まずは話してみよう',
        description: 'リストができたら、あとはやるだけ',
        cta: '',
        speak: '話してみる',
        speakAgain: 'また話す',
        startNew: '新しいリスト',
        recording: '録音中...',
        tapToStop: 'タップして終了',
        building: 'リスト作成中...',
        readyPrompt: '話してタスクリストを作成',
        tasksAdded: (n) => `${n}件のタスクを追加しました`,
        micError: 'エラー。マイクの許可を確認してください。',
        filterToday: '今日',
        filterWeek: '今週',
        filterLater: 'そのうち',
        filterAll: 'すべて',
        settings: '設定',
        addTask: 'タスクを追加',
        newTask: '新しいタスク',
        newTasksSection: '新規タスク',
        noMatch: 'タスクが見つかりません',
        completionTitle: 'すべて完了!',
        completionMessage: 'お疲れ様でした。',
        categories: {
            work: { name: '仕事', color: '#555555' },
            home: { name: '家のこと', color: '#777777' },
            personal: { name: '自分のこと', color: '#999999' },
            other: { name: 'その他', color: '#AAAAAA' }
        }
    }
};

// Enhanced keyword dictionaries for classification
const categoryKeywords = {
    en: {
        work: [
            'meeting', 'email', 'report', 'presentation', 'deadline', 'project', 'client', 'customer',
            'boss', 'colleague', 'office', 'work', 'job', 'task', 'call', 'conference', 'review',
            'proposal', 'budget', 'invoice', 'contract', 'document', 'file', 'spreadsheet',
            'analysis', 'strategy', 'plan', 'schedule', 'appointment', 'interview', 'hire',
            'team', 'department', 'manager', 'employee', 'submit', 'deliver', 'complete',
            'prepare', 'organize', 'coordinate', 'follow up', 'respond', 'update', 'send'
        ],
        home: [
            'buy', 'shop', 'shopping', 'grocery', 'groceries', 'store', 'supermarket', 'mall',
            'clean', 'cleaning', 'vacuum', 'dishes', 'laundry', 'wash', 'sweep', 'mop',
            'cook', 'cooking', 'dinner', 'lunch', 'breakfast', 'meal', 'recipe', 'kitchen',
            'trash', 'garbage', 'recycling', 'take out', 'throw away',
            'repair', 'fix', 'maintenance', 'plumber', 'electrician', 'paint', 'renovate',
            'garden', 'yard', 'lawn', 'plants', 'water', 'feed', 'pet', 'dog', 'cat',
            'bills', 'utilities', 'rent', 'mortgage', 'insurance', 'pay',
            'organize', 'declutter', 'tidy', 'arrange', 'sort', 'fold', 'iron'
        ],
        personal: [
            'gym', 'workout', 'exercise', 'run', 'jog', 'fitness', 'yoga', 'pilates', 'sports',
            'doctor', 'dentist', 'hospital', 'clinic', 'appointment', 'checkup', 'health',
            'medicine', 'prescription', 'pharmacy', 'vitamins',
            'read', 'book', 'library', 'study', 'learn', 'course', 'class', 'lesson',
            'practice', 'training', 'skill', 'hobby', 'passion', 'interest',
            'movie', 'film', 'theater', 'concert', 'show', 'event', 'festival',
            'friend', 'family', 'relationship', 'birthday', 'anniversary', 'party', 'celebrate',
            'relax', 'rest', 'sleep', 'meditation', 'mindfulness', 'self-care',
            'haircut', 'salon', 'spa', 'massage', 'beauty', 'skincare',
            'game', 'gaming', 'music', 'instrument', 'art', 'draw', 'paint', 'craft'
        ]
    },
    ja: {
        work: [
            '会議', 'ミーティング', 'メール', '報告', 'レポート', 'プレゼン', 'プレゼンテーション',
            '資料', '書類', '提出', '締切', 'デッドライン', 'プロジェクト', '案件', '業務',
            'クライアント', '顧客', '取引先', '営業', '商談', '見積', '契約', '発注',
            '上司', '同僚', 'チーム', '部署', '打ち合わせ', '会社', 'オフィス', '仕事',
            '電話', '連絡', '確認', '相談', '依頼', '調整', 'スケジュール', '予定',
            '準備', '作成', '整理', '送信', '返信', '対応', '処理', '完了', '提案',
            '企画', '戦略', '計画', '分析', 'データ', '資料作成', '面接', '採用'
        ],
        home: [
            '買い物', '買う', 'スーパー', 'コンビニ', '店', '購入', 'ショッピング',
            '食材', '野菜', '肉', '魚', '牛乳', 'パン', '卵', '調味料', '飲み物',
            '掃除', '片付け', '整理', '洗濯', '洗う', '拭く', '磨く', '掃除機',
            '料理', '調理', 'ご飯', '食事', '夕食', '朝食', '昼食', 'レシピ', 'キッチン',
            'ゴミ', 'ゴミ出し', 'リサイクル', '捨てる', '処分',
            '修理', '直す', 'メンテナンス', '業者', '工事', 'リフォーム', 'ペンキ',
            '庭', '植物', '花', '水やり', 'ガーデニング', 'ペット', '犬', '猫', '餌',
            '支払い', '振込', '料金', '光熱費', '家賃', '保険', 'ローン', '税金'
        ],
        personal: [
            'ジム', '運動', 'トレーニング', 'ワークアウト', 'ランニング', 'ジョギング',
            'ヨガ', 'ピラティス', 'スポーツ', 'フィットネス', '筋トレ', 'ストレッチ',
            '病院', '医者', 'クリニック', '通院', '診察', '検診', '健康診断', '歯医者',
            '薬', '処方', '薬局', 'サプリ', 'ビタミン', '治療',
            '勉強', '学習', '本', '読書', '図書館', '習い事', 'レッスン', 'スクール',
            '資格', '試験', 'テスト', '英語', '語学', '練習', 'スキル', '趣味',
            '映画', 'コンサート', 'ライブ', 'イベント', '観劇', '美術館', '博物館',
            '友達', '友人', '家族', '誕生日', '記念日', 'パーティー', 'お祝い', 'プレゼント',
            '休憩', 'リラックス', '睡眠', '瞑想', 'マインドフルネス', 'セルフケア',
            '美容院', 'ヘアカット', 'エステ', 'マッサージ', 'ネイル', 'スキンケア',
            'ゲーム', '音楽', '楽器', 'アート', '絵', '創作', 'クラフト', '趣味'
        ]
    }
};

// App state
const app = {
    tasks: [],
    categories: {},
    currentFilter: 'all',
    currentLang: 'en',
    recognition: null
};

// Initialize app
function init() {
    loadLanguage(localStorage.getItem('poplist_lang') || 'en');
    loadCategories();
    loadTasks();
    renderTasks();
    initSpeechRecognition();
    bindEvents();
}

// Load language
function loadLanguage(lang) {
    app.currentLang = lang;
    localStorage.setItem('poplist_lang', lang);
    
    const t = i18n[lang];
    app.categories = {
        work: { id: 'work', ...t.categories.work },
        home: { id: 'home', ...t.categories.home },
        personal: { id: 'personal', ...t.categories.personal },
        other: { id: 'other', ...t.categories.other }
    };
    
    updateUI();
}

// Update UI with translations
function updateUI() {
    const t = i18n[app.currentLang];
    
    document.querySelector('.tagline').textContent = t.tagline;
    document.querySelector('.description').innerHTML = t.description;
    document.querySelector('.cta').textContent = t.cta;
    document.querySelector('.btn-text').textContent = t.speak;
    document.getElementById('statusText').textContent = t.readyPrompt;
    document.getElementById('settingsBtn').textContent = t.settings;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const filter = btn.dataset.filter;
        btn.textContent = t[`filter${filter.charAt(0).toUpperCase()}${filter.slice(1)}`];
    });
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === app.currentLang);
    });
    
    renderTasks();
}

// Speech recognition
function initSpeechRecognition() {
    console.log('Initializing speech recognition...');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.error('Speech recognition not supported');
        alert('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
        return false;
    }
    
    console.log('Speech recognition supported');
    
    app.recognition = new SpeechRecognition();
    app.recognition.continuous = true;
    app.recognition.interimResults = false;
    
    let transcript = '';
    
    app.recognition.onstart = () => {
        const t = i18n[app.currentLang];
        console.log('Recording started');
        
        const voiceBtn = document.getElementById('voiceBtn');
        const statusText = document.getElementById('statusText');
        
        voiceBtn.classList.add('recording');
        document.querySelector('.btn-text').textContent = t.recording;
        statusText.textContent = t.tapToStop;
        statusText.classList.add('recording');
        
        // Add audio bars animation
        addAudioBars();
        
        transcript = '';
    };
    
    app.recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript + ' ';
            }
        }
    };
    
    app.recognition.onend = () => {
        const t = i18n[app.currentLang];
        console.log('Recording stopped');
        
        const voiceBtn = document.getElementById('voiceBtn');
        const statusText = document.getElementById('statusText');
        
        voiceBtn.classList.remove('recording');
        document.querySelector('.btn-text').textContent = t.speak;
        statusText.classList.remove('recording');
        
        // Remove audio bars
        removeAudioBars();
        
        if (transcript.trim()) {
            console.log('Transcript:', transcript);
            document.getElementById('statusText').textContent = t.building;
            
            setTimeout(() => {
                processTranscript(transcript.trim());
            }, 500);
        } else {
            document.getElementById('statusText').textContent = t.readyPrompt;
        }
    };
    
    app.recognition.onerror = (event) => {
        const t = i18n[app.currentLang];
        console.error('Speech recognition error:', event.error);
        
        document.getElementById('voiceBtn').classList.remove('recording');
        document.querySelector('.btn-text').textContent = t.speak;
        document.getElementById('statusText').classList.remove('recording');
        
        // Show specific error messages
        let errorMsg = t.micError;
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            errorMsg = 'Microphone access denied. Please enable it in browser settings.';
        } else if (event.error === 'no-speech') {
            errorMsg = 'No speech detected. Please try again.';
        } else if (event.error === 'network') {
            errorMsg = 'Network error. Please check your connection.';
        }
        
        document.getElementById('statusText').textContent = errorMsg;
        
        setTimeout(() => {
            document.getElementById('statusText').textContent = t.readyPrompt;
        }, 4000);
    };
    
    console.log('Speech recognition initialized successfully');
    return true;
}

// Process transcript and extract tasks
function processTranscript(text) {
    console.log('Processing transcript:', text);
    
    // Clear existing tasks
    app.tasks = [];
    
    // Extract tasks
    const taskTexts = extractTasks(text);
    console.log('Extracted tasks:', taskTexts);
    
    // Create task objects
    taskTexts.forEach(taskText => {
        const category = categorizeTask(taskText);
        const task = {
            id: Date.now() + Math.random(),
            text: taskText,
            category: category,
            timing: 'later',
            completed: false,
            createdAt: Date.now()
        };
        app.tasks.push(task);
        console.log(`Task: "${taskText}" → ${category}`);
    });
    
    saveTasks();
    renderTasks();
    
    const t = i18n[app.currentLang];
    document.getElementById('statusText').textContent = t.tasksAdded(taskTexts.length);
    
    setTimeout(() => {
        document.getElementById('statusText').textContent = t.readyPrompt;
    }, 3000);
}

// Extract tasks from text
function extractTasks(text) {
    const lang = app.currentLang;
    let tasks = [];
    
    if (lang === 'ja') {
        // Japanese: split by 。、 and connectors
        let segments = text.split(/[。．]/);
        
        segments.forEach(segment => {
            segment = segment.trim();
            if (!segment) return;
            
            // Split by connectors: て、で、し、から、たら、ので
            const parts = segment.split(/、|(?<=て)|(?<=で)|(?<=し)|(?<=から)|(?<=たら)|(?<=ので)/);
            
            parts.forEach(part => {
                part = part.trim();
                // Remove leading conjunctions
                part = part.replace(/^(そして|それから|その後|また|あと|次に)\s*/g, '');
                // Remove trailing punctuation
                part = part.replace(/[、。．,\s]+$/g, '');
                
                if (part.length >= 3) {
                    tasks.push(part);
                }
            });
        });
    } else {
        // English: split by periods, commas, and connectors
        let segments = text.split(/\.|;/);
        
        segments.forEach(segment => {
            segment = segment.trim();
            if (!segment) return;
            
            // Split by "and", commas
            const parts = segment.split(/,|\sand\s/i);
            
            parts.forEach(part => {
                part = part.trim();
                // Remove leading words like "then", "also", "next"
                part = part.replace(/^(then|also|next|after that|and then)\s+/i, '');
                // Remove trailing punctuation
                part = part.replace(/[,.\s]+$/g, '');
                
                if (part.length >= 5) {
                    tasks.push(part);
                }
            });
        });
    }
    
    return tasks;
}

// Categorize task based on keywords
function categorizeTask(text) {
    const lang = app.currentLang;
    const keywords = categoryKeywords[lang];
    const textLower = text.toLowerCase();
    
    // Score each category
    const scores = {
        work: 0,
        home: 0,
        personal: 0
    };
    
    // Check for keyword matches
    for (const [category, words] of Object.entries(keywords)) {
        if (category === 'other') continue;
        
        for (const keyword of words) {
            if (textLower.includes(keyword.toLowerCase())) {
                scores[category]++;
            }
        }
    }
    
    // Find category with highest score
    let maxScore = 0;
    let bestCategory = 'other';
    
    for (const [category, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }
    
    return bestCategory;
}

// Create task element (reusable)
function createTaskElement(task, category) {
    const t = i18n[app.currentLang];
    
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.dataset.taskId = task.id;
    
    // Display text with placeholder if empty/new
    const displayText = task.text || t.newTask;
    const textClass = (!task.text || task.isNew) ? 'task-text placeholder' : 'task-text';
    
    // Show category selector ONLY for new tasks
    let metaHTML = '';
    if (task.isNew) {
        metaHTML = `
            <div class="task-meta">
                <select class="task-category-select" data-task-id="${task.id}">
                    ${Object.entries(app.categories).map(([catId, cat]) => 
                        `<option value="${catId}" ${task.category === catId ? 'selected' : ''}>${cat.name}</option>`
                    ).join('')}
                </select>
                <div class="task-timing timing-${task.timing}" data-task-id="${task.id}">${getTimingLabel(task.timing)}</div>
            </div>
        `;
    } else {
        metaHTML = `
            <div class="task-meta">
                <div class="task-timing timing-${task.timing}" data-task-id="${task.id}">${getTimingLabel(task.timing)}</div>
            </div>
        `;
    }
    
    taskItem.innerHTML = `
        <div class="task-bubble" style="background: ${category.color};" data-task-id="${task.id}"></div>
        <div class="task-content">
            <div class="${textClass}" contenteditable="false">${displayText}</div>
            ${metaHTML}
        </div>
    `;
    
    // Bubble click - complete task (only if not new)
    taskItem.querySelector('.task-bubble').addEventListener('click', (e) => {
        e.stopPropagation();
        if (!task.isNew && task.text) {
            completeTask(task.id);
        }
    });
    
    // Task text edit
    const taskTextEl = taskItem.querySelector('.task-text');
    
    // Handle click to edit
    taskTextEl.addEventListener('click', () => {
        taskTextEl.contentEditable = 'true';
        taskTextEl.focus();
        
        // If it's a new task with placeholder, clear it
        if (task.isNew && taskTextEl.textContent === t.newTask) {
            taskTextEl.textContent = '';
        }
    });
    
    // Handle blur (finish editing)
    taskTextEl.addEventListener('blur', () => {
        taskTextEl.contentEditable = 'false';
        const newText = taskTextEl.textContent.trim();
        
        // If empty, delete the task
        if (!newText) {
            app.tasks = app.tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
            return;
        }
        
        task.text = newText;
        task.isNew = false; // No longer new
        saveTasks();
        renderTasks();
    });
    
    // Handle Enter key
    taskTextEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            taskTextEl.blur();
        }
    });
    
    // Handle focus (when editing starts)
    taskTextEl.addEventListener('focus', () => {
        if (task.isNew && taskTextEl.textContent === t.newTask) {
            taskTextEl.textContent = '';
        }
    });
    
    // Category selector change (only if present)
    const categorySelect = taskItem.querySelector('.task-category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            e.stopPropagation();
            task.category = e.target.value;
            task.isNew = false;
            saveTasks();
            renderTasks();
        });
    }
    
    // Timing click - cycle through options
    taskItem.querySelector('.task-timing').addEventListener('click', () => {
        const timings = ['later', 'today', 'week'];
        const currentIndex = timings.indexOf(task.timing);
        task.timing = timings[(currentIndex + 1) % timings.length];
        saveTasks();
        renderTasks();
    });
    
    return taskItem;
}

// Render tasks
function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const filterSection = document.querySelector('.filter-section');
    const header = document.querySelector('header');
    const t = i18n[app.currentLang];
    
    // Filter tasks
    let filteredTasks = app.tasks.filter(task => !task.completed);
    if (app.currentFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.timing === app.currentFilter);
    }
    
    // Group by category
    const tasksByCategory = {};
    Object.keys(app.categories).forEach(catId => {
        tasksByCategory[catId] = filteredTasks.filter(task => task.category === catId);
    });
    
    container.innerHTML = '';
    
    // Check if all tasks completed
    if (app.tasks.length > 0 && app.tasks.every(task => task.completed)) {
        showCompletionScreen();
        return;
    }
    
    // No tasks
    if (app.tasks.length === 0) {
        container.classList.add('hidden');
        filterSection.classList.add('hidden');
        header.classList.remove('hidden');
        return;
    }
    
    // Show tasks
    container.classList.remove('hidden');
    filterSection.classList.remove('hidden');
    header.classList.add('hidden');
    
      
    // Render categories with tasks
    Object.entries(app.categories).forEach(([catId, category]) => {
        const tasks = tasksByCategory[catId];
        if (tasks.length === 0) return;
        
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.style.background = category.color;
        categoryHeader.innerHTML = `
            <span>${category.name}</span>
            <span class="task-count">${tasks.length}</span>
        `;
        
        const tasksList = document.createElement('div');
        tasksList.className = 'tasks-list';
        
        tasks.forEach(task => {
            const taskItem = createTaskElement(task, category);
            tasksList.appendChild(taskItem);
        });
        
        categoryCard.appendChild(categoryHeader);
        categoryCard.appendChild(tasksList);
        container.appendChild(categoryCard);
    });
    
    // Add single "Add Task" button at the bottom (always show if we have tasks)
    if (app.tasks.filter(t => !t.completed).length > 0) {
        const addTaskBtn = document.createElement('button');
        addTaskBtn.className = 'add-task-btn-bottom';
        addTaskBtn.textContent = t.addTask;
        addTaskBtn.addEventListener('click', addNewTask);
        container.appendChild(addTaskBtn);
    }
}

// Get timing label
function getTimingLabel(timing) {
    const t = i18n[app.currentLang];
    const labels = {
        today: t.filterToday,
        week: t.filterWeek,
        later: t.filterLater
    };
    return labels[timing] || labels.later;
}

// Complete task with animation
function completeTask(taskId) {
    const task = app.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.completed = true;
    
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        createBubbleBurst(taskElement);
    }
    
    setTimeout(() => {
        saveTasks();
        
        // Check if ALL tasks are now completed
        const allCompleted = app.tasks.length > 0 && app.tasks.every(t => t.completed);
        
        if (allCompleted) {
            // Create massive celebration burst
            setTimeout(() => {
                showCompletionScreen();
            }, 200);
        } else {
            renderTasks();
        }
    }, 300);
}

// Bubble burst animation
function createBubbleBurst(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const colors = ['#888888', '#AAAAAA', '#CCCCCC', '#999999'];

    for (let i = 0; i < 12; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.cssText = `
            position: fixed;
            width: ${Math.random() * 30 + 10}px;
            height: ${Math.random() * 30 + 10}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            left: ${centerX}px;
            top: ${centerY}px;
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(bubble);
        
        const angle = (Math.PI * 2 * i) / 12;
        const distance = Math.random() * 100 + 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        bubble.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
            duration: 800,
            easing: 'ease-out'
        }).onfinish = () => bubble.remove();
    }
}

// Show completion screen
function showCompletionScreen() {
    const container = document.getElementById('tasksContainer');
    const filterSection = document.querySelector('.filter-section');
    const header = document.querySelector('header');
    const t = i18n[app.currentLang];
    
    container.classList.remove('hidden');
    filterSection.classList.add('hidden');
    header.classList.add('hidden');
    
    container.innerHTML = `
        <div class="completion-screen">
            <h2 class="completion-title">${t.completionTitle}</h2>
            <p class="completion-message">${t.completionMessage}</p>
            <button class="restart-btn" onclick="restartApp()">${t.startNew}</button>
        </div>
    `;
    
    // Create MASSIVE celebration bubble burst (100 bubbles!)
    const colors = ['#888888', '#AAAAAA', '#CCCCCC', '#999999', '#777777', '#BBBBBB'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'celebration-bubble';
            const size = Math.random() * 60 + 20;
            const startX = Math.random() * window.innerWidth;
            const startY = window.innerHeight + 100; // Start from below screen
            const endY = Math.random() * (window.innerHeight * 0.7);
            
            bubble.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                left: ${startX}px;
                top: ${startY}px;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                opacity: 0.9;
            `;
            document.body.appendChild(bubble);
            
            // Bubbles float up and then pop
            bubble.animate([
                { 
                    transform: 'translateY(0) scale(1)', 
                    opacity: 0 
                },
                { 
                    transform: `translateY(-${window.innerHeight - endY}px) scale(1)`, 
                    opacity: 0.9,
                    offset: 0.7
                },
                { 
                    transform: `translateY(-${window.innerHeight - endY}px) scale(1.5)`, 
                    opacity: 0 
                }
            ], {
                duration: 3000 + Math.random() * 2000,
                easing: 'ease-out'
            }).onfinish = () => bubble.remove();
        }, i * 30);
    }
    
    // Add extra sparkle effect
    setTimeout(() => {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                const size = Math.random() * 8 + 4;
                sparkle.style.cssText = `
                    position: fixed;
                    width: ${size}px;
                    height: ${size}px;
                    background: white;
                    border-radius: 50%;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${Math.random() * window.innerHeight * 0.6}px;
                    pointer-events: none;
                    z-index: 10000;
                    box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
                `;
                document.body.appendChild(sparkle);
                
                sparkle.animate([
                    { transform: 'scale(0)', opacity: 1 },
                    { transform: 'scale(2)', opacity: 0 }
                ], {
                    duration: 800,
                    easing: 'ease-out'
                }).onfinish = () => sparkle.remove();
            }, i * 40);
        }
    }, 500);
}

// Restart app
function restartApp() {
    app.tasks = [];
    saveTasks();
    renderTasks();
}

// Add new task (single button at bottom)
function addNewTask() {
    const t = i18n[app.currentLang];
    
    // Default to 'other' category
    const task = {
        id: Date.now() + Math.random(),
        text: '',
        category: 'other',
        timing: 'later',
        completed: false,
        createdAt: Date.now(),
        isNew: true
    };
    
    app.tasks.push(task);
    saveTasks();
    renderTasks();
    
    // Focus on new task after render - scroll to bottom
    setTimeout(() => {
        const newTaskEl = document.querySelector(`[data-task-id="${task.id}"] .task-text`);
        if (newTaskEl) {
            // Scroll into view
            newTaskEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Enter edit mode
            newTaskEl.contentEditable = 'true';
            newTaskEl.focus();
            
            // Select all placeholder text
            const range = document.createRange();
            range.selectNodeContents(newTaskEl);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }, 150);
}

// Set filter
function setFilter(filter) {
    app.currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTasks();
}

// Storage
function saveTasks() {
    localStorage.setItem('poplist_tasks', JSON.stringify(app.tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('poplist_tasks');
    if (saved) {
        app.tasks = JSON.parse(saved);
    }
}

function saveCategories() {
    const categoriesToSave = {};
    Object.entries(app.categories).forEach(([id, cat]) => {
        categoriesToSave[id] = { name: cat.name, color: cat.color };
    });
    localStorage.setItem('poplist_categories', JSON.stringify(categoriesToSave));
}

function loadCategories() {
    const saved = localStorage.getItem('poplist_categories');
    if (saved) {
        const savedCategories = JSON.parse(saved);
        Object.keys(savedCategories).forEach(id => {
            if (app.categories[id]) {
                app.categories[id] = {
                    ...app.categories[id],
                    ...savedCategories[id]
                };
            }
        });
    }
}

// Settings modal
function openSettings() {
    const modal = document.getElementById('settingsModal');
    const settingsContainer = document.getElementById('categorySettings');
    const t = i18n[app.currentLang];
    
    settingsContainer.innerHTML = Object.entries(app.categories).map(([id, category]) => `
        <div class="category-setting-item">
            <label>Category Name</label>
            <input type="text" value="${category.name}" 
                   onchange="updateCategoryName('${id}', this.value)">
            <label>Color</label>
            <div class="color-options">
                <input type="color" value="${category.color}" 
                       onchange="updateCategoryColor('${id}', this.value)">
            </div>
        </div>
    `).join('');
    
    modal.classList.add('show');
}

function updateCategoryName(categoryId, newName) {
    if (app.categories[categoryId]) {
        app.categories[categoryId].name = newName;
        saveCategories();
        renderTasks();
    }
}

function updateCategoryColor(categoryId, newColor) {
    if (app.categories[categoryId]) {
        app.categories[categoryId].color = newColor;
        saveCategories();
        renderTasks();
    }
}

// Bind events
function bindEvents() {
    // Voice button
    document.getElementById('voiceBtn').addEventListener('click', () => {
        console.log('Voice button clicked');
        
        if (!app.recognition) {
            console.error('Speech recognition not initialized');
            alert('Speech recognition not available. Please refresh and try again.');
            return;
        }
        
        if (document.getElementById('voiceBtn').classList.contains('recording')) {
            console.log('Stopping recording...');
            app.recognition.stop();
        } else {
            console.log('Starting recording...');
            app.recognition.lang = i18n[app.currentLang].speechLang;
            console.log('Language set to:', app.recognition.lang);
            
            try {
                app.recognition.start();
            } catch (error) {
                console.error('Failed to start recognition:', error);
                alert('Failed to start recording. Please check microphone permissions.');
            }
        }
    });
    
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            loadLanguage(btn.dataset.lang);
        });
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });
    
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    
    // Close modal
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('show');
    });
    
    // Click outside modal to close
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') {
            document.getElementById('settingsModal').classList.remove('show');
        }
    });
}

// Audio visualization bars
function addAudioBars() {
    const voiceSection = document.querySelector('.voice-input-section');
    
    // Remove existing bars if any
    removeAudioBars();
    
    // Create bars container
    const barsContainer = document.createElement('div');
    barsContainer.className = 'audio-bars';
    barsContainer.id = 'audioBars';
    
    // Create 5 bars
    for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.className = 'audio-bar';
        bar.style.animationDelay = `${i * 0.1}s`;
        barsContainer.appendChild(bar);
    }
    
    // Insert after voice button
    const statusText = document.getElementById('statusText');
    voiceSection.insertBefore(barsContainer, statusText);
}

function removeAudioBars() {
    const bars = document.getElementById('audioBars');
    if (bars) {
        bars.remove();
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
