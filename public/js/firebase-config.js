/**
 * Poplist — Firebase Web config (safe to expose in the browser; not a secret).
 *
 * 1. Log into Firebase Console with your MAIN Google account.
 * 2. Create a new project (e.g. display name "Poplist") or pick an existing one.
 * 3. Add a Web app → copy the `firebaseConfig` object from Project settings → General.
 * 4. Replace every REPLACE_* value below with the exact strings from that snippet.
 * 5. Enable Authentication (Google, Email/Password, etc.) and create Firestore.
 * 6. Paste `firestore.rules` from the repo into Firestore → Rules → Publish.
 * 7. Authentication → Settings → Authorized domains: add poplist.site, www, pages.dev as needed.
 * 8. iOS: download GoogleService-Info.plist for this same app and add it to the Xcode project.
 */
window.__POPLIST_FIREBASE_CONFIG__ = {
  apiKey: 'REPLACE_API_KEY',
  authDomain: 'REPLACE_PROJECT_ID.firebaseapp.com',
  projectId: 'REPLACE_PROJECT_ID',
  storageBucket: 'REPLACE_STORAGE_BUCKET',
  messagingSenderId: 'REPLACE_MESSAGING_SENDER_ID',
  appId: 'REPLACE_APP_ID',
  // measurementId: 'G-XXXX', // optional: only if your snippet includes Firebase Analytics
};
