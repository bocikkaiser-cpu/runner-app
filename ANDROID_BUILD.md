# Budowanie apki Android

## Co zostało dodane

- **Capacitor 6** (React → natywny Android)
- **@capacitor-community/text-to-speech** – natywny TTS Androida, działa przy zablokowanym ekranie
- `src/nativeTts.js` – wrapper: w natywnej apce używa Android TTS, w przeglądarce fallback do Web Speech API
- `capacitor.config.json` – konfiguracja apki (`com.bocikkaiser.biegacz`, "Biegacz")
- `.github/workflows/android.yml` – automatyczny build APK + AAB na GitHubie

## Jak pobrać APK do testu na telefonie

1. Wrzuć zmiany na `main` (albo odpal workflow ręcznie: Actions → Build Android APK → Run workflow)
2. Poczekaj ~5 min aż build się skończy
3. W zakładce Actions otwórz ostatni run → na dole **Artifacts**:
   - `biegacz-debug-apk` – APK do zainstalowania bezpośrednio na telefonie (włącz "Instalacja z nieznanych źródeł")
   - `biegacz-release-aab-unsigned` – AAB do Google Play (wymaga podpisania, patrz niżej)

## Publikacja w Google Play

1. Wygeneruj keystore (jednorazowo, lokalnie):
   ```
   keytool -genkey -v -keystore biegacz.keystore -alias biegacz -keyalg RSA -keysize 2048 -validity 10000
   ```
2. W repo GitHub → Settings → Secrets → Actions, dodaj:
   - `KEYSTORE_BASE64` = `base64 biegacz.keystore`
   - `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`
3. Rozszerz workflow o krok podpisywania (mogę dodać, gdy będziesz gotowy)
4. Wgraj podpisany AAB w [Play Console](https://play.google.com/console) (konto `kaiser.domin@gmail.com`, jednorazowa opłata 25 USD)

## Build lokalny (opcjonalnie)

Wymaga Node 20+, Java 17, Android SDK:
```
npm install
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`
