# Android APK via Capacitor 8 — Setup Notes & Action Items

**Status (2026-10-05):** Capacitor 8 scaffolding committed on `develop_hung`.
Web shell + native Android project exist; APK is NOT built yet (needs Android
SDK + Hung's action items below). Nothing was published to the Play Store.

## What was done (this commit)

- Installed `@capacitor/core@8.5.2`, `@capacitor/cli@8.5.2`, `@capacitor/android@8.5.2`
  (core pinned >= 8.5.1 per the WebView CVE noted in planning).
- `capacitor.config.ts`: appId `club.fudever.devertown`, appName `DEVER TOWN`,
  webDir `dist` (Vite output). WebView/background colors set to the game's
  canvas color `#070a12` so there is no white flash on load or room transitions.
- Added the Android platform (`android/`): native project scaffold only.
  Generated web assets (`android/app/src/main/assets/public`) are gitignored —
  they are re-copied from `dist` on every `npx cap sync`.

## Native bridges needed LATER (not yet implemented — follow-ups)

1. **WebRTC camera/mic permissions (Android 12+, API 31+).** The game uses
   proximity voice + video. On Android, WebRTC needs runtime `CAMERA` and
   `RECORD_AUDIO` permission requests plus `onPermissionRequest` handling in
   the WebView. Capacitor's `@capacitor/camera` plugin covers still capture,
   but live WebRTC inside the WebView needs a permission-bridge (custom native
   code in `android/app/.../MainActivity.java` or a small Capacitor plugin)
   that grants the WebView's `PermissionRequest` for camera/mic. Must be wired
   before any APK with voice/video goes to testers.
2. **Hardware back-button vs. the game's modal stack.** Android's back button
   should pop the topmost game modal (inventory, chat, quiz, settings...) and
   only exit the app when the stack is empty. This needs Capacitor's App
   plugin `backButton` listener wired into the game's modal manager
   (`src/managers/` / modal open-close tracking). Without it, one back-press
   kills the game — bad UX and lost session state.
3. **(Future) Push notifications:** needs a Firebase project + FCM plugin.
   Deferred — not needed for the first APK.

## How to build the APK (on a machine with Android Studio / SDK)

```bash
npm run build        # Vite → dist/
npx cap sync android # copy web assets + update plugins
# then either:
npx cap open android # Android Studio → Build > Generate Signed Bundle/APK
```

The Android SDK was NOT present on the machine that ran this setup
(`java`/`ANDROID_HOME` missing), so no build was attempted.

---

## Action items for Hung (Nguyen Thai Hung)

### 1. Google Play Console registration — $25 one-time

- Go to **https://play.google.com/console** and create a developer account
  (individual). One-time **$25 USD** fee, identity verification required.
- After approval, create the app entry (use package name
  `club.fudever.devertown` — it must match the appId in `capacitor.config.ts`
  and can never change after the first upload).
- Note: even internal/tester distribution via Play Console's internal track
  needs the account; alternatively distribute the debug APK directly to club
  members via link for the first tests (no account needed).

### 2. Keystore — who holds it, how to generate, why losing it is catastrophic

- **Who holds it:** you, Hung — personally. Keep the `.keystore` (or `.jks`)
  file and its passwords in your own secure backup (e.g. your Google Drive +
  a USB copy), NOT in the repo, NOT in chat. Muse must never create or store
  signing keys.
- **Generate (on your machine, in the `android/` folder):**
  ```bash
  keytool -genkeypair -v -storetype JKS -keystore dever-town-release.keystore \
    -alias dever_town -keyalg RSA -keysize 2048 -validity 10000
  ```
  Choose strong passwords for both the keystore and the key — write them down
  in your password manager.
- **Why losing it is catastrophic:** Google Play signs every update with the
  SAME key as the first release. If the keystore is lost, you can NEVER update
  the existing app — you must publish a brand-new app listing (new package
  name, all users reinstall, all ratings/reviews/downloads lost). Google's
  "Play App Signing" can partially mitigate this going forward, but keeping
  your own upload keystore safe is the baseline rule.

### 3. Firebase project (for future push notifications) — CAN BE DEFERRED

- Not needed for the first APK or internal testing.
- Needed later only if you want push notifications (event reminders, quest
  pings). When the time comes: create the project at
  https://console.firebase.google.com, add an Android app with package
  `club.fudever.devertown`, drop `google-services.json` into
  `android/app/`, and add the FCM Capacitor plugin.
