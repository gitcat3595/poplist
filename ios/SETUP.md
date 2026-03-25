# Poplist iOS — Setup Guide

SwiftUI app with Firebase Auth (Apple, Google, Email) + Firestore sync + StoreKit 2 (Pro subscription).

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
   - Bundle ID: `com.allerise.poplist`
   - Download **GoogleService-Info.plist**

---

## Step 2 — Create Xcode Project

1. Open Xcode → **File → New → Project → iOS → App**
   - Product Name: `Poplist`
   - Bundle Identifier: `com.allerise.poplist`
   - Interface: SwiftUI
   - Language: Swift
2. **Delete** the generated `ContentView.swift` (you have your own)
3. Drag all files from `ios/Poplist/` into the Xcode project navigator, keeping folder structure:
   ```
   Poplist/
   ├── PoplistApp.swift
   ├── Constants.swift
   ├── ContentView.swift
   ├── en.lproj/
   │   ├── Localizable.strings
   │   └── InfoPlist.strings
   ├── ja.lproj/
   │   ├── Localizable.strings
   │   └── InfoPlist.strings
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

> **StoreKit** is part of the iOS SDK — no additional package needed.

---

## Step 4 — Info.plist

Open `Info.plist` in Xcode and add the keys from `Info.plist.template`:

| Key | Value |
|-----|-------|
| `NSMicrophoneUsageDescription` | `Poplist uses your microphone to capture spoken tasks.` |
| `NSSpeechRecognitionUsageDescription` | `Poplist transcribes your speech to create tasks automatically.` |
| `ITSAppUsesNonExemptEncryption` | `NO` (Boolean false) |

Add a URL Scheme for Google Sign-In:
1. Select your target → **Info** tab → **URL Types** → click **+**
2. Set **URL Schemes** to the `REVERSED_CLIENT_ID` from your `GoogleService-Info.plist`

---

## Step 5 — Capabilities

Select your target → **Signing & Capabilities** tab, then add:

| Capability | Notes |
|------------|-------|
| **Sign in with Apple** | Mandatory when offering other social login |
| **In-App Purchase** | Required for Pro subscription (StoreKit 2) |

---

## Step 6 — App Store Connect — In-App Purchases

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → your app
2. Navigate to **Features → In-App Purchases** → click **+**
3. Create two Auto-Renewable Subscriptions in a new subscription group called **"Poplist Pro"**:

| Product ID | Type | Reference Name |
|------------|------|----------------|
| `com.allerise.poplist.pro.monthly` | Auto-Renewable Subscription | Poplist Pro Monthly |
| `com.allerise.poplist.pro.annual`  | Auto-Renewable Subscription | Poplist Pro Annual  |

4. For each product set:
   - Price tier
   - Subscription duration (1 Month / 1 Year)
   - Localised display name + description (EN + JA)
   - Review screenshot (can be a screenshot of ProGateView)

---

## Step 7 — Apple Sign-In in Firebase Console

Back in Firebase Console → Authentication → Sign-in method → Apple:
1. Paste your **Apple Services ID** (create at developer.apple.com → Identifiers → Services IDs)
2. Add your **OAuth redirect domain**: `your-project-id.firebaseapp.com`

---

## Step 8 — App Store Connect — App Metadata

Fill in before submitting for review:

| Field | Notes |
|-------|-------|
| **App name** | Poplist |
| **Subtitle** | Voice-first task list |
| **Description (EN)** | 170 chars max for above-fold |
| **Description (JA)** | Japanese translation |
| **Keywords (EN)** | 100 chars: task,list,voice,ai,todo,productivity,schedule,remind |
| **Keywords (JA)** | 100 chars: タスク,リスト,音声,AI,todo,生産性,スケジュール |
| **Support URL** | `https://allerise.com/support` |
| **Privacy Policy URL** | `https://allerise.com/privacy` |
| **Marketing URL** | `https://allerise.com` (optional) |
| **Age Rating** | Fill questionnaire → likely **4+** |
| **Category** | Productivity (primary), Utilities (secondary) |
| **Copyright** | © 2025 Allerise Pte. Ltd. |

---

## Step 9 — App Privacy Labels (App Store Connect)

Under **App Privacy → Data Types**, declare:

| Data Type | Collected | Purpose | Linked to User |
|-----------|-----------|---------|----------------|
| Email Address | Yes | App Functionality, Account Management | Yes |
| User ID | Yes | App Functionality | Yes |
| Name | Yes (optional, from Sign in with Apple) | App Functionality | Yes |
| Other Usage Data | Yes (anonymised analytics) | Analytics | No |
| Voice Data | **No** — processed on-device only, never sent to Allerise | — | — |

---

## Step 10 — Screenshots

Required sizes (at least one per device family):

| Device | Canvas |
|--------|--------|
| iPhone 6.7" (iPhone 15 Pro Max) | 1290 × 2796 |
| iPhone 6.1" (iPhone 15) | 1179 × 2556 |
| iPad 12.9" (if iPad supported) | 2048 × 2732 |

Tip: Use the Xcode Simulator + Screenshot feature, or a design tool like Figma/Sketch.

---

## Step 11 — App Icon

All sizes are generated from a single **1024×1024 PNG** in `Assets.xcassets → AppIcon`.

In Xcode 15+, you only need to supply the 1024×1024 image — Xcode generates all other sizes automatically. Drag your 1024×1024 PNG into the `AppIcon` well in the asset catalogue.

Design guidelines:
- No transparency / alpha channel
- No rounded corners (system applies them)
- Allerise brand colour recommended

---

## Step 12 — Build & Submit

1. Select **Any iOS Device** as the build target
2. **Product → Archive**
3. In Organizer, click **Distribute App → App Store Connect → Upload**
4. In App Store Connect, select the build and submit for review

---

## App Store Requirements Checklist

### Code / Technical
- [x] Sign in with Apple included (mandatory when offering other social login)
- [x] Sign in with Apple is the **first** login option (required by Apple HIG)
- [x] `NSMicrophoneUsageDescription` in Info.plist
- [x] `NSSpeechRecognitionUsageDescription` in Info.plist
- [x] `ITSAppUsesNonExemptEncryption = NO` in Info.plist
- [x] In-App Purchase capability + StoreKit 2 implementation (ProStore.swift)
- [x] **Restore Purchases** button (ProGateView + SettingsView)
- [x] **Account deletion** in-app (Apple mandatory since Jun 30 2022)
- [x] **Privacy Policy** link in SettingsView
- [x] **Terms of Service** link in SettingsView
- [x] **EULA** link in SettingsView
- [x] **Data Deletion Request** link in SettingsView
- [x] Subscription terms displayed before purchase (ProGateView)
- [x] English + Japanese localisation (Localizable.strings + InfoPlist.strings)
- [x] Deployment target: iOS 16.0+
- [ ] In-App Purchase products created in App Store Connect
- [ ] App icon (1024×1024 PNG in AppIcon asset catalogue)
- [ ] `GoogleService-Info.plist` added to Xcode project

### App Store Connect
- [ ] Privacy Policy URL set to `https://allerise.com/privacy`
- [ ] Support URL set to `https://allerise.com/support`
- [ ] App description (EN + JA)
- [ ] Keywords (EN + JA)
- [ ] Screenshots (iPhone 6.7" + 6.1" minimum)
- [ ] Age rating questionnaire completed (expected: 4+)
- [ ] App Privacy labels filled in
- [ ] Copyright: © 2025 Allerise Pte. Ltd.
- [ ] Demo account credentials added to App Review notes (if sign-in is required for testing)

---

## Folder Structure

```
ios/
├── SETUP.md
└── Poplist/
    ├── PoplistApp.swift          ← @main, Firebase + Google init
    ├── Constants.swift           ← API URL config
    ├── ContentView.swift         ← Auth gate + ProStore injection
    ├── Info.plist.template       ← Copy keys into Xcode Info.plist
    ├── Poplist.entitlements      ← Sign in with Apple + In-App Purchase
    ├── en.lproj/
    │   ├── Localizable.strings   ← English UI strings
    │   └── InfoPlist.strings     ← English permission descriptions
    ├── ja.lproj/
    │   ├── Localizable.strings   ← Japanese UI strings
    │   └── InfoPlist.strings     ← Japanese permission descriptions
    ├── Authentication/
    │   ├── AuthViewModel.swift   ← Auth + deleteAccount()
    │   ├── SignInView.swift      ← Login screen (Apple first)
    │   └── EmailAuthView.swift   ← Email sign-in / create account
    ├── Models/
    │   └── PopTask.swift         ← Task model + enums
    ├── Services/
    │   ├── ProStore.swift        ← StoreKit 2 subscription manager
    │   ├── FirestoreService.swift
    │   ├── ClassifierService.swift
    │   └── VoiceService.swift    ← SFSpeechRecognizer wrapper
    └── Views/
        ├── TaskListView.swift    ← Main screen
        ├── TaskBubbleView.swift  ← Task card
        ├── VoiceInputView.swift  ← Mic sheet
        ├── ProGateView.swift     ← Pro paywall sheet
        └── SettingsView.swift    ← Account + Pro + Legal + Danger zone
```

---

## Firestore Index

Firestore will prompt you with a link to create a composite index when you first run the app. Click the link it logs to the Xcode console — it takes ~2 minutes to build.

The required index is:
- Collection: `tasks`
- Fields: `userId ASC`, `isDone ASC`, `createdAt DESC`
