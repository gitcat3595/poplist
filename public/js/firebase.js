/* Load /js/firebase-config.js before this file. */
const FIREBASE_CONFIG =
  typeof window !== 'undefined' && window.__POPLIST_FIREBASE_CONFIG__
    ? window.__POPLIST_FIREBASE_CONFIG__
    : {};

// Guest mode: max tasks before sign-in is required for sync
const GUEST_MAX_TASKS = 5;

let _auth = null, _db = null;
const FB_READY = (() => {
  if (!FIREBASE_CONFIG.apiKey || String(FIREBASE_CONFIG.apiKey).startsWith('REPLACE')) return false;
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    _auth = firebase.auth();
    _db   = firebase.firestore();
    return true;
  } catch (e) {
    console.info('Firebase init failed — guest mode:', e.message);
    return false;
  }
})();

// When Firebase is not configured, unlock Pro so the demo works fully
if (!FB_READY) state.isProUser = true;

/* ── Firestore helpers ── */
async function fsAddTask(text, category, timing) {
  if (!_db || !state.userId) return null;
  try {
    const ref = await _db.collection('tasks').add({
      text, category, timing,
      isDone:    false,
      userId:    state.userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  } catch (e) { console.warn('fsAddTask:', e); return null; }
}

async function fsMarkDone(fsId) {
  if (!_db || !fsId) return;
  try { await _db.collection('tasks').doc(fsId).update({ isDone: true }); }
  catch (e) { console.warn('fsMarkDone:', e); }
}

async function fsLoadTasks(uid) {
  if (!_db) return;
  try {
    const snap = await _db.collection('tasks')
      .where('userId', '==', uid)
      .where('isDone', '==', false)
      .orderBy('createdAt', 'desc')
      .get();
    snap.forEach(doc => {
      if (document.querySelector(`[data-fs-id="${doc.id}"]`)) return; // already in DOM
      const d = doc.data();
      makeTaskItem(d.text, d.timing || 'This Week', d.category || 'Other', doc.id);
    });
    updateScreenState();
  } catch (e) { console.warn('fsLoadTasks:', e); }
}

async function fsCheckPro(uid) {
  if (!_db) return false;
  try {
    const doc = await _db.collection('users').doc(uid).get();
    return doc.exists && doc.data()?.isPro === true;
  } catch { return false; }
}

/* ── Guest → account merge (uploads local tasks without a Firestore ID) ── */
async function mergePendingGuestTasks(uid) {
  const localItems = [...document.querySelectorAll('.task-item:not([data-fs-id])')];
  if (!localItems.length) return;
  await Promise.all(localItems.map(async item => {
    const text   = item.querySelector('.task-text')?.textContent?.trim();
    const timing = item.querySelector('.timing-chip')?.dataset?.timing || 'This Week';
    const cat    = item.closest('.category-card')?.dataset?.cat        || 'Other';
    if (!text) return;
    const id = await fsAddTask(text, cat, timing);
    if (id) item.dataset.fsId = id;
  }));
  showToast(state.lang === 'ja' ? 'タスクを同期しました ✓' : 'Local tasks synced to cloud ✓');
}

/* ── Auth UI updater ── */
function updateAuthUI(user) {
  const dot         = document.getElementById('fbStatusDot');
  const statusText  = document.getElementById('fbStatusText');
  const statusSub   = document.getElementById('fbStatusSub');
  const signInRow   = document.getElementById('authSignInRow');
  const accountRow  = document.getElementById('authAccountRow');
  const emailLabel  = document.getElementById('authEmailLabel');

  if (user) {
    if (dot)        dot.className       = 'fb-dot connected';
    if (statusText) statusText.textContent = user.displayName || user.email || (state.lang === 'ja' ? 'サインイン済み' : 'Signed in');
    if (statusSub)  statusSub.textContent  = user.email || '';
    if (signInRow)  signInRow.style.display  = 'none';
    if (accountRow) accountRow.style.display = '';
    if (emailLabel) emailLabel.textContent   = user.email || user.displayName || 'Signed in';
  } else {
    if (dot)        dot.className       = 'fb-dot disconnected';
    if (statusText) statusText.textContent = state.lang === 'ja' ? '未サインイン' : 'Not signed in';
    if (statusSub)  statusSub.textContent  = state.lang === 'ja' ? 'サインインでデバイス間同期' : 'Sign in to sync across devices';
    if (signInRow)  signInRow.style.display  = '';
    if (accountRow) accountRow.style.display = 'none';
  }

  // Update Service section
  const freeRow = document.getElementById('serviceFreeRow');
  const proRow  = document.getElementById('serviceProRow');
  if (freeRow) freeRow.style.display = state.isProUser ? 'none' : '';
  if (proRow)  proRow.style.display  = state.isProUser ? '' : 'none';
}

/* ── Sign-in helpers ── */
function signInWithGoogle() {
  if (!_auth) return;
  const provider = new firebase.auth.GoogleAuthProvider();
  _auth.signInWithPopup(provider).catch(e => {
    if (e.code !== 'auth/popup-closed-by-user') showToast(e.message);
  });
}

function signInWithApple() {
  if (!_auth) return;
  const provider = new firebase.auth.OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  _auth.signInWithPopup(provider).catch(e => {
    if (e.code !== 'auth/popup-closed-by-user') showToast(e.message);
  });
}

function _handleEmailAuth(email, password, isNew) {
  if (!_auth) return;
  const p = isNew
    ? _auth.createUserWithEmailAndPassword(email, password)
    : _auth.signInWithEmailAndPassword(email, password);
  p.catch(e => showToast(_friendlyAuthError(e)));
}

function _friendlyAuthError(e) {
  switch (e.code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return state.lang === 'ja' ? 'メールまたはパスワードが違います' : 'Incorrect email or password';
    case 'auth/user-not-found':
      return state.lang === 'ja' ? 'アカウントが見つかりません' : 'No account found';
    case 'auth/email-already-in-use':
      return state.lang === 'ja' ? 'このメールは既に使用中です' : 'Email already in use';
    case 'auth/weak-password':
      return state.lang === 'ja' ? 'パスワードは6文字以上' : 'Password must be 6+ characters';
    default:
      return e.message;
  }
}
