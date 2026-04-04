# 🏃 Biegacz - Galloway Method Timer

Running timer app with hybrid audio engine. Interval training timer: bieg/marsz (run/walk).

## Stack

- **Web:** React + Vite + Tailwind CSS
- **Mobile:** React Native / Flutter (coming soon)
- **Audio:** Web Audio API (TTS + synth tones)

## Features

✅ Interval timer (Galloway method: run/walk)
✅ Polish + English
✅ Text-to-speech (TTS) voice cues
✅ Synthetic tone feedback (melodia)
✅ Wake lock (screen stays on during run)
✅ Mute toggle
✅ Total time tracking
✅ Settings panel

## Quick Start (Web)

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

## Deploy to Vercel

1. Push to GitHub
2. Connect repo on Vercel
3. Deploy (auto)

```bash
npm install -g vercel
vercel
```

## Mobile (Android/iOS)

### Android (React Native)

```bash
npx react-native init BiegaczApp --skip-install
cd BiegaczApp
npm install
npx react-native run-android
```

### iOS (Swift)

Xcode project setup:
```bash
cd ios && pod install && cd ..
```

---

Built with ❤️ for runners.
