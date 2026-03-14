# Poplist iOS — Setup Guide

SwiftUI app with Firebase Auth (Apple, Google, Email) + Firestore sync.

---

## Prerequisites

- Xcode 15+
- Apple Developer account (paid, required for Sign in with Apple + App Store)
- Firebase project (free tier is fine)

---

## Step 1 — Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → name it `poplist`
2. In the project, go to **Authentication → Sign-in method** and enable:
   - **Email/Password**
   - **Google**
   - **Apple** (requires your Apple Developer Team ID — find it at developer.apple.com)
3. Go to **Firestore Database** → **Create database** → choose production mode
4. Set these **Security Rules** in Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

5. Go to **Project Settings → Your apps** → click the iOS icon
   - Bundle ID: `com.yourname.poplist` (pick any reverse-domain ID, use it consistently)
   - Download **GoogleService-Info.plist**

---

## Step 2 — Create Xcode Project

1. Open Xcode → **File → New → Project → iOS → App**
   - Product Name: `Poplist`
   - Bundle Identifier: same as you used in Firebase (e.g. `com.yourname.poplist`)
   - Interface: SwiftUI
   - Language: Swift
2. **Delete** the generated `ContentView.swift` (you have your own)
3. Drag all files from `ios/Poplist/` into the Xcode project navigator, keeping folder structure:
   ```
   Poplist/
   ├── PoplistApp.swift
   ├── Constants.swift
   ├── ContentView.swift
   ├── Authentication/
   ├── Models/
   ├── Services/
   └── Views/
   ```
4. Drag **GoogleService-Info.plist** into the project root (tick "Copy items if needed")

---

## Step 3 — Add Swift Packages (SPM)

In Xcode: **File → Add Package Dependencies**

| Package | URL | Version |
|---------|-----|---------|
| Firebase iOS SDK | `https://github.com/firebase/firebase-ios-sdk` | Up to Next Major (11.x) |
| Google Sign-In iOS | `https://github.com/google/GoogleSignIn-iOS` | Up to Next Major (7.x) |

After adding Firebase, in **"Choose Package Products"** select:
- `FirebaseAuth`
- `FirebaseFirestore`
- `FirebaseFirestoreSwift`

After adding Google Sign-In, select:
- `GoogleSignIn`
- `GoogleSignInSwift`

---

## Step 4 — Info.plist

Open `Info.plist` in Xcode and add these keys (or copy from `Info.plist.template`):

| Key | Value |
|-----|-------|
| `NSMicrophoneUsageDescription` | `Poplist uses your microphone to capture spoken tasks.` |
| `NSSpeechRecognitionUsageDescription` | `Poplist transcribes your speech to create tasks automatically.` |

Add a URL Scheme for Google Sign-In:
1. Select your target → **Info** tab → **URL Types** → click **+**
2. Set **URL Schemes** to the `REVERSED_CLIENT_ID` from your `GoogleService-Info.plist`
   (looks like `com.googleusercontent.apps.1234567890-abc123...`)

---

## Step 5 — Entitlements (Sign in with Apple)

1. Select your target → **Signing & Capabilities** tab
2. Click **+ Capability** → add **Sign in with Apple**
3. Xcode will create a `.entitlements` file — you can replace it with the provided `Poplist.entitlements`

---

## Step 6 — Apple Sign-In in Firebase Console

Back in Firebase Console → Authentication → Sign-in method → Apple:
1. Paste your **Apple Services ID** (create at developer.apple.com → Identifiers → Services IDs)
2. Add your **OAuth redirect domain**: `your-project-id.firebaseapp.com`

---

## Step 7 — Build & Run

Select an iOS 16+ simulator or device and press **Run (⌘R)**.

If you see a build error about `GIDSignInError`, make sure you imported `GoogleSignIn` (not just `GoogleSignInSwift`) in the target.

---

## App Store Requirements Checklist

- [x] **Sign in with Apple** included (mandatory when offering any other social login)
- [x] Sign in with Apple is the **first** login option (required by Apple HIG)
- [x] `NSMicrophoneUsageDescription` in Info.plist
- [x] `NSSpeechRecognitionUsageDescription` in Info.plist
- [ ] **Privacy Policy URL** — update the link in `SettingsView.swift` before submitting
- [ ] **Terms of Service URL** — same
- [ ] App Privacy labels filled in App Store Connect (data types: User ID, Email, Name)
- [ ] Minimum iOS version set to 16.0+ in your target's Deployment Info

---

## Firestore Index

Firestore will prompt you with a link to create a composite index when you first run the app. Click the link it logs to the Xcode console — it takes ~2 minutes to build.

The required index is:
- Collection: `tasks`
- Fields: `userId ASC`, `isDone ASC`, `createdAt DESC`

---

## Folder Structure

```
ios/
└── Poplist/
    ├── PoplistApp.swift          ← @main, Firebase + Google init
    ├── Constants.swift           ← API URL config
    ├── ContentView.swift         ← Auth gate (loading / signed-in / sign-in)
    ├── Poplist.entitlements      ← Sign in with Apple entitlement
    ├── Info.plist.template       ← Copy keys into Xcode Info.plist
    ├── Authentication/
    │   ├── AuthViewModel.swift   ← All auth logic (Apple / Google / Email)
    │   ├── SignInView.swift      ← Login screen
    │   └── EmailAuthView.swift   ← Email sign-in / create account sheet
    ├── Models/
    │   └── PopTask.swift         ← Task model + TaskCategory + TaskTiming enums
    ├── Services/
    │   ├── FirestoreService.swift  ← Real-time Firestore listener + CRUD
    │   ├── ClassifierService.swift ← Calls Cloudflare /api/classify + local fallback
    │   └── VoiceService.swift      ← SFSpeechRecognizer wrapper
    └── Views/
        ├── TaskListView.swift    ← Main screen, grouped by timing
        ├── TaskBubbleView.swift  ← Task card with swipe-to-delete
        ├── VoiceInputView.swift  ← Mic sheet with live transcript
        └── SettingsView.swift    ← Account info + sign out
```
