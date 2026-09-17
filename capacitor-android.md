# Android APK packaging

This project is a dependency-free web MVP. Capacitor packages the existing `index.html`, `app.js`, `style.css`, and `luma-avatar.png` into an Android app without rewriting the UI.

## Build on a machine with Android Studio

1. Install Node.js 20+, Android Studio, and an Android SDK.
2. From the repository root run:

   ```powershell
   npm install
   npx cap add android
   npm run build:android
   npx cap open android
   ```

3. In Android Studio choose **Build > Generate App Bundles or APKs**.

The first build should use an emulator or device for verification. A release APK/AAB must be signed with a private upload key before publishing to Google Play.

## Four banner ad placements

The current browser UI contains an explicit sponsored card as a safe placeholder. Real Play Store monetization should use Google Mobile Ads (AdMob) in the Android project and only replace test IDs after review:

- Home screen top placement
- Content Studio placement
- Schedule screen placement
- Screen Guidance placement

Use Google's test banner unit ID while developing:

`ca-app-pub-3940256099942544/6300978111`

Do not hard-code a personal publisher ID into source control. Configure the AdMob app ID and production unit IDs through Android resources or release configuration, add a consent flow where required, and label ads clearly. Never click or encourage users to click their own ads.

## Native capability boundary

The current web app can request screen sharing only after user approval through the browser API. A production Android build needs a visible `MediaProjection` foreground service for approved screen guidance, and must show an ongoing notification while capture is active. Background wake-word listening and automatic social posting also require explicit native permissions, platform APIs, and a backend queue; they are not silently enabled by this wrapper.
