// Wrapper TTS: używa natywnego Android TTS przez Capacitor, gdy apka działa jako
// natywna (APK/AAB), a w przeglądarce fallback na Web Speech API.
// Natywny TTS działa przy zablokowanym ekranie Androida – webowy nie.

let NativeTTS = null;
let isNative = false;

try {
  // Ładowane dynamicznie - w buildzie webowym te moduły po prostu nie istnieją
  // i blok catch wyłapie błąd. W buildzie Capacitora będą dostępne.
  // eslint-disable-next-line
  const cap = window.Capacitor;
  if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
    isNative = true;
    // Wtyczka rejestruje się globalnie jako Capacitor.Plugins.TextToSpeech
    NativeTTS = cap.Plugins && cap.Plugins.TextToSpeech;
  }
} catch (e) {
  isNative = false;
}

export function isNativeApp() {
  return isNative;
}

export async function speak(text, locale = 'pl-PL', rate = 1.1) {
  if (!text) return;
  if (isNative && NativeTTS) {
    try {
      await NativeTTS.stop();
    } catch (e) { /* ignore */ }
    try {
      await NativeTTS.speak({
        text,
        lang: locale,
        rate,
        pitch: 1.0,
        volume: 1.0,
        category: 'playback',
      });
      return;
    } catch (e) {
      console.warn('Native TTS failed, falling back to web:', e);
    }
  }
  // Fallback web
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    u.rate = rate;
    window.speechSynthesis.speak(u);
  }
}
