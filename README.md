# Luma — social media companion

Luma is a browser MVP for a warm AI companion and creator workspace. It combines:

- An AI-avatar home experience with chat and browser speech recognition.
- Browser text-to-speech with a female-voice preference, pitch/rate tuning, and animated lip-sync while Luma speaks.
- Connected-account views for Instagram, YouTube, and TikTok.
- A content studio that generates an SEO-ready title, description, and hashtags.
- Local clip upload and preview with a simulated analysis summary, hook, title, and optimized tags.
- Account surfaces for Facebook, WhatsApp Business, and X in addition to Instagram, YouTube, and TikTok.
- A scheduling and automation center for queuing posts by date/time, selecting cross-post channels, and enabling smart timing suggestions.
- A video calendar queue with connection-aware status and an auto-publish-when-connected option.
- A clearly labeled sponsored placement on the signed-in home workspace, with a user hide control.
- First-use name setup that personalizes Luma’s greeting and welcome conversation, with a Settings path to change it.
- More conversational welcome behavior: Luma greets the user by name and speaks the welcome after setup when browser voice is available.
- Conversation follow-ups after five minutes without a reply, plus calm apology, repair, and forgiveness responses when a user is upset.
- Avatar motion treatment with walk-in depth, idle 3D-style sway, pointer parallax, breathing shadow, speaking gestures, and state-aware mood text.
- An explicit Screen Guidance view using `getDisplayMedia()` so the user chooses and can stop the screen/window Luma may view.
- A user-controlled "Hey baby" wake-word listener using the browser Speech Recognition API while the page is open.
- A clear safety boundary: Luma is supportive, but not a therapist or emergency service.

## Run locally

Open `index.html` in a browser. No build step or dependencies are required. Voice input works in browsers that support the Web Speech API and may require microphone permission.

Voice playback uses the browser’s Speech Synthesis API. Luma selects an installed English voice whose name suggests a female voice (for example Samantha, Ava, Karen, Victoria, or Zira); if none is available, the browser’s default voice is used. For reliable voice availability across devices, run the app in a browser with an English female system voice installed.

The account rows and SEO generation are intentionally local UI behavior. Production integrations should use each platform’s official OAuth APIs and store tokens securely on a backend.

This repository currently contains the responsive web MVP, not signed Android APK or iOS binaries. To ship native apps, wrap this UI with Capacitor (or implement a native client), add secure backend video analysis, and configure official OAuth/API integrations for each platform. WhatsApp posting requires the WhatsApp Business Platform; personal WhatsApp automation is not supported.

Scheduling in the MVP is a local interaction demo. Production automation needs a backend job queue, durable database, platform-specific publishing permissions, timezone handling, retries, and an explicit review/approval step before posts go live.

The connection banner uses the browser’s online/offline signal to demonstrate queue behavior. A file opened directly in a browser cannot reliably publish in the background while the app is closed. The production mobile version should use Android WorkManager / foreground services and iOS background tasks, with a secure server queue and official APIs to publish when connectivity is restored.

The sponsored card is a UI placeholder, not a live ad network integration. To earn advertising revenue, register the production web app with Google Ad Manager/AdSense or use Google Mobile Ads (AdMob) in the Android/iOS shell, configure app/site identifiers, implement consent and privacy disclosures, and only show ads after the user has accepted the applicable consent choices. Never click or encourage users to click your own ads.

The five-minute follow-up runs while the web app is open. A production mobile app should move this behavior into a user-controlled notification system, with quiet hours, opt-out controls, and no repeated notifications during distress.

The current motion is a layered 2D presentation of the supplied artwork. Natural hand joints, facial expressions, walking cycles, and true 3D movement require a rigged avatar asset such as VRM or GLB plus an animation runtime.

Screen Guidance is opt-in and view-only in the browser MVP. Luma does not receive screen access until the user accepts the browser prompt and cannot click or type. A production Android implementation should use `MediaProjection` only after user consent, run it as a foreground service with a persistent notification, encrypt any processing, and provide an obvious stop control. iOS uses ReplayKit and has comparable OS restrictions; silent background capture is not supported.

The wake word is opt-in: the user must press the "Hey baby off" control to enable it and grant microphone permission. It listens only while the page is open and the browser supports Speech Recognition. A production mobile assistant needs a native foreground audio service, an OS-visible microphone indicator, battery controls, and a clear disable action; hidden always-on listening is not implemented.
