import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Music } from 'lucide-react';

// ─── Języki ──────────────────────────────────────────────────────────────────
const LANGUAGES = {
  pl: {
    name: 'Polski', flag: '🇵🇱', locale: 'pl-PL',
    run: 'Bieg', walk: 'Marsz', three: 'Trzy', two: 'Dwa', one: 'Jeden',
    runLabel: '🏃 BIEG', walkLabel: '🚶 MARSZ',
    settings: 'Ustawienia', save: 'Zapisz',
    runMin: 'Bieg (min)', walkMin: 'Marsz (min)',
    totalTime: 'Czas całkowity', series: 'Seria',
    runColor: 'Kolor biegu', walkColor: 'Kolor marszu',
  },
  en: {
    name: 'English', flag: '🇬🇧', locale: 'en-US',
    run: 'Run', walk: 'Walk', three: 'Three', two: 'Two', one: 'One',
    runLabel: '🏃 RUN', walkLabel: '🚶 WALK',
    settings: 'Settings', save: 'Save',
    runMin: 'Run (min)', walkMin: 'Walk (min)',
    totalTime: 'Total time', series: 'Series',
    runColor: 'Run color', walkColor: 'Walk color',
  },
  es: {
    name: 'Español', flag: '🇪🇸', locale: 'es-ES',
    run: 'Corre', walk: 'Camina', three: 'Tres', two: 'Dos', one: 'Uno',
    runLabel: '🏃 CORRE', walkLabel: '🚶 CAMINA',
    settings: 'Ajustes', save: 'Guardar',
    runMin: 'Correr (min)', walkMin: 'Caminar (min)',
    totalTime: 'Tiempo total', series: 'Serie',
    runColor: 'Color correr', walkColor: 'Color caminar',
  },
  fr: {
    name: 'Français', flag: '🇫🇷', locale: 'fr-FR',
    run: 'Courez', walk: 'Marchez', three: 'Trois', two: 'Deux', one: 'Un',
    runLabel: '🏃 COUREZ', walkLabel: '🚶 MARCHEZ',
    settings: 'Paramètres', save: 'Enregistrer',
    runMin: 'Course (min)', walkMin: 'Marche (min)',
    totalTime: 'Temps total', series: 'Série',
    runColor: 'Couleur course', walkColor: 'Couleur marche',
  },
  de: {
    name: 'Deutsch', flag: '🇩🇪', locale: 'de-DE',
    run: 'Laufen', walk: 'Gehen', three: 'Drei', two: 'Zwei', one: 'Eins',
    runLabel: '🏃 LAUFEN', walkLabel: '🚶 GEHEN',
    settings: 'Einstellungen', save: 'Speichern',
    runMin: 'Laufen (min)', walkMin: 'Gehen (min)',
    totalTime: 'Gesamtzeit', series: 'Serie',
    runColor: 'Lauffarbe', walkColor: 'Gehfarbe',
  },
  it: {
    name: 'Italiano', flag: '🇮🇹', locale: 'it-IT',
    run: 'Corri', walk: 'Cammina', three: 'Tre', two: 'Due', one: 'Uno',
    runLabel: '🏃 CORRI', walkLabel: '🚶 CAMMINA',
    settings: 'Impostazioni', save: 'Salva',
    runMin: 'Corsa (min)', walkMin: 'Camminata (min)',
    totalTime: 'Tempo totale', series: 'Serie',
    runColor: 'Colore corsa', walkColor: 'Colore camminata',
  },
  pt: {
    name: 'Português', flag: '🇧🇷', locale: 'pt-BR',
    run: 'Corra', walk: 'Caminhe', three: 'Três', two: 'Dois', one: 'Um',
    runLabel: '🏃 CORRA', walkLabel: '🚶 CAMINHE',
    settings: 'Configurações', save: 'Salvar',
    runMin: 'Corrida (min)', walkMin: 'Caminhada (min)',
    totalTime: 'Tempo total', series: 'Série',
    runColor: 'Cor corrida', walkColor: 'Cor caminhada',
  },
  ru: {
    name: 'Русский', flag: '🇷🇺', locale: 'ru-RU',
    run: 'Бег', walk: 'Ходьба', three: 'Три', two: 'Два', one: 'Один',
    runLabel: '🏃 БЕГ', walkLabel: '🚶 ХОДЬБА',
    settings: 'Настройки', save: 'Сохранить',
    runMin: 'Бег (мин)', walkMin: 'Ходьба (мин)',
    totalTime: 'Общее время', series: 'Серия',
    runColor: 'Цвет бега', walkColor: 'Цвет ходьбы',
  },
  zh: {
    name: '中文', flag: '🇨🇳', locale: 'zh-CN',
    run: '跑步', walk: '走路', three: '三', two: '二', one: '一',
    runLabel: '🏃 跑步', walkLabel: '🚶 走路',
    settings: '设置', save: '保存',
    runMin: '跑步（分钟）', walkMin: '走路（分钟）',
    totalTime: '总时间', series: '组',
    runColor: '跑步颜色', walkColor: '走路颜色',
  },
  ja: {
    name: '日本語', flag: '🇯🇵', locale: 'ja-JP',
    run: '走る', walk: '歩く', three: 'さん', two: 'に', one: 'いち',
    runLabel: '🏃 走る', walkLabel: '🚶 歩く',
    settings: '設定', save: '保存',
    runMin: '走る（分）', walkMin: '歩く（分）',
    totalTime: '合計時間', series: 'セット',
    runColor: '走る色', walkColor: '歩く色',
  },
};

const RUN_COLORS = [
  { label: 'Orange', value: '#ea580c' },
  { label: 'Red',    value: '#dc2626' },
  { label: 'Rose',   value: '#e11d48' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Indigo', value: '#4338ca' },
  { label: 'Blue',   value: '#2563eb' },
  { label: 'Amber',  value: '#d97706' },
  { label: 'Pink',   value: '#db2777' },
];

const WALK_COLORS = [
  { label: 'Emerald', value: '#047857' },
  { label: 'Green',   value: '#16a34a' },
  { label: 'Teal',    value: '#0f766e' },
  { label: 'Cyan',    value: '#0e7490' },
  { label: 'Sky',     value: '#0284c7' },
  { label: 'Lime',    value: '#4d7c0f' },
  { label: 'Slate',   value: '#334155' },
  { label: 'Violet',  value: '#6d28d9' },
];

// ─── Pomocnik: zaplanuj pojedynczy ton na osi czasu AudioContext ──────────────
// Kluczowy trick: AudioContext.currentTime NIE jest throttlowany przez przeglądarkę
// nawet przy zablokowanym ekranie – dźwięk zagra o zaplanowanej godzinie.
function scheduleTone(ctx, mainGain, frequency, atTime, duration, type = 'sine') {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, atTime);
  gain.gain.linearRampToValueAtTime(0.3, atTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, atTime + duration);
  osc.connect(gain);
  gain.connect(mainGain);
  osc.start(atTime);
  osc.stop(atTime + duration + 0.1);
}

function scheduleRunMelody(ctx, mainGain, atTime) {
  scheduleTone(ctx, mainGain, 440, atTime + 0.00, 0.15, 'triangle');
  scheduleTone(ctx, mainGain, 554, atTime + 0.15, 0.15, 'triangle');
  scheduleTone(ctx, mainGain, 659, atTime + 0.30, 0.15, 'triangle');
  scheduleTone(ctx, mainGain, 880, atTime + 0.45, 0.50, 'triangle');
}

function scheduleWalkMelody(ctx, mainGain, atTime) {
  scheduleTone(ctx, mainGain, 659, atTime + 0.00, 0.20, 'sine');
  scheduleTone(ctx, mainGain, 554, atTime + 0.25, 0.20, 'sine');
  scheduleTone(ctx, mainGain, 440, atTime + 0.50, 0.60, 'sine');
}

function scheduleCountdownBeep(ctx, mainGain, atTime) {
  scheduleTone(ctx, mainGain, 600, atTime, 0.15, 'sine');
}

// ─── Zaplanuj CAŁĄ sekwencję dźwięków dla N cykli z wyprzedzeniem ─────────────
// Dzięki temu dźwięki zagrają nawet gdy JS jest całkowicie uśpiony.
function scheduleAllAudio(ctx, mainGain, startAudioTime, runSec, restSec, cycles = 60) {
  const cycle = runSec + restSec;
  for (let i = 0; i < cycles; i++) {
    const cycleStart = startAudioTime + i * cycle;

    // Start biegu
    scheduleRunMelody(ctx, mainGain, cycleStart);

    // Odliczanie przed końcem biegu: 3, 2, 1
    const runEnd = cycleStart + runSec;
    scheduleCountdownBeep(ctx, mainGain, runEnd - 3);
    scheduleCountdownBeep(ctx, mainGain, runEnd - 2);
    scheduleCountdownBeep(ctx, mainGain, runEnd - 1);

    // Start marszu
    scheduleWalkMelody(ctx, mainGain, runEnd);

    // Odliczanie przed końcem marszu: 3, 2, 1
    const restEnd = cycleStart + cycle;
    scheduleCountdownBeep(ctx, mainGain, restEnd - 3);
    scheduleCountdownBeep(ctx, mainGain, restEnd - 2);
    scheduleCountdownBeep(ctx, mainGain, restEnd - 1);
  }
}

// ─── Komponent ───────────────────────────────────────────────────────────────
const App = () => {
  const [runMinutes, setRunMinutes]     = useState(2);
  const [restMinutes, setRestMinutes]   = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isActive, setIsActive]         = useState(false);
  const [phase, setPhase]               = useState('RUN');
  const [timeLeft, setTimeLeft]         = useState(runMinutes * 60);
  const [totalTime, setTotalTime]       = useState(0);
  const [series, setSeries]             = useState(1);
  const [isMuted, setIsMuted]           = useState(false);
  const [language, setLanguage]         = useState('pl');
  const [runColor, setRunColor]         = useState(RUN_COLORS[0].value);
  const [walkColor, setWalkColor]       = useState(WALK_COLORS[0].value);

  const t = LANGUAGES[language];

  const timerRef      = useRef(null);
  const wakeLockRef   = useRef(null);
  const audioCtxRef   = useRef(null);
  const mainGainRef   = useRef(null);

  // Czas startu sesji na osi AudioContext (nie Date.now) – do synchronizacji
  const audioStartTimeRef = useRef(null); // audioCtx.currentTime w chwili startu
  const wallStartRef      = useRef(null); // Date.now() w chwili startu
  const offsetRef         = useRef(0);    // skumulowane sekundy z poprzednich play-sesji
  const runSecRef         = useRef(runMinutes * 60);
  const restSecRef        = useRef(restMinutes * 60);

  // ── Audio engine ────────────────────────────────────────────────────────────
  const initAudio = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    if (!mainGainRef.current) {
      mainGainRef.current = audioCtxRef.current.createGain();
      mainGainRef.current.gain.value = isMuted ? 0 : 1.0;
      mainGainRef.current.connect(audioCtxRef.current.destination);
    }
    // Cichy oscylator trzyma AudioContext i wątek audio alive przy zablokowanym ekranie
    const silentOsc  = audioCtxRef.current.createOscillator();
    const silentGain = audioCtxRef.current.createGain();
    silentGain.gain.value = 0.00001;
    silentOsc.connect(silentGain);
    silentGain.connect(audioCtxRef.current.destination);
    silentOsc.start();
  };

  // Mute/unmute przez gain zamiast pomijania funkcji
  useEffect(() => {
    if (mainGainRef.current) {
      mainGainRef.current.gain.value = isMuted ? 0 : 1.0;
    }
  }, [isMuted]);

  // ── Wake Lock ───────────────────────────────────────────────────────────────
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch (_) {}
    }
  };

  // Wznowienie wake lock po odblokowaniu ekranu
  useEffect(() => {
    const handle = async () => {
      if (document.visibilityState === 'visible') {
        if (audioCtxRef.current?.state === 'suspended') await audioCtxRef.current.resume();
        if (isActive && !wakeLockRef.current) await requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [isActive]);

  // ── Start / Pauza ───────────────────────────────────────────────────────────
  const toggleStart = async () => {
    if (!isActive) {
      await initAudio();
      await requestWakeLock();

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Przy pierwszym starcie zamroź ustawienia i zaplanuj WSZYSTKIE dźwięki
      if (offsetRef.current === 0 && wallStartRef.current === null) {
        runSecRef.current  = runMinutes * 60;
        restSecRef.current = restMinutes * 60;
        // Zaplanuj 60 cykli do przodu – AudioContext zagra je niezależnie od JS
        scheduleAllAudio(ctx, mainGainRef.current, now, runSecRef.current, restSecRef.current, 60);
      }

      audioStartTimeRef.current = now - offsetRef.current; // punkt zero na osi audio
      wallStartRef.current = Date.now();
      setIsActive(true);
    } else {
      // Pauza – zapisz skumulowany czas
      if (wallStartRef.current) {
        offsetRef.current += Math.floor((Date.now() - wallStartRef.current) / 1000);
        wallStartRef.current = null;
      }
      setIsActive(false);
      if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setIsActive(false);
    wallStartRef.current      = null;
    audioStartTimeRef.current = null;
    offsetRef.current         = 0;
    // Zamknij stary AudioContext żeby anulować zaplanowane dźwięki
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      mainGainRef.current = null;
    }
    if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }
    setPhase('RUN');
    setTimeLeft(runMinutes * 60);
    setTotalTime(0);
    setSeries(1);
  };

  // ── Pętla wyświetlania (tylko UI – dźwięki już zaplanowane) ─────────────────
  useEffect(() => {
    if (!isActive) { clearInterval(timerRef.current); return; }

    timerRef.current = setInterval(() => {
      if (!wallStartRef.current) return;
      const elapsed = offsetRef.current + Math.floor((Date.now() - wallStartRef.current) / 1000);

      const runSec  = runSecRef.current;
      const restSec = restSecRef.current;
      const cycle   = runSec + restSec;
      const cyclePos = elapsed % cycle;
      const newSeries = Math.floor(elapsed / cycle) + 1;

      let newPhase, newTimeLeft;
      if (cyclePos < runSec) {
        newPhase    = 'RUN';
        newTimeLeft = runSec - cyclePos;
      } else {
        newPhase    = 'REST';
        newTimeLeft = cycle - cyclePos;
      }

      setTotalTime(elapsed);
      setTimeLeft(newTimeLeft);
      setPhase(newPhase);
      setSeries(newSeries);
    }, 500);

    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const bgColor = phase === 'RUN' ? runColor : walkColor;

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-between p-4 sm:p-8 text-white font-sans overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center pt-2 sm:pt-6">
        <button onClick={() => setIsMuted(m => !m)} className="p-3 sm:p-4 bg-white/20 rounded-2xl backdrop-blur-md transition-transform active:scale-90">
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <div className="text-center flex flex-col items-center">
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] opacity-60 uppercase mb-1">Galloway Method</p>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest">
            <Music size={12} /> HYBRID ENGINE
          </div>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="p-3 sm:p-4 bg-white/20 rounded-2xl backdrop-blur-md transition-transform active:scale-90">
          <Settings size={24} />
        </button>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center flex-1 justify-center w-full relative my-8 sm:my-0">
        <div className="absolute top-0 sm:top-8 px-8 sm:px-10 py-2 bg-black/20 rounded-full border border-white/10 uppercase font-black italic tracking-widest text-lg sm:text-xl">
          {phase === 'RUN' ? t.runLabel : t.walkLabel}
        </div>
        <div className="text-7xl sm:text-9xl md:text-[110px] font-black tabular-nums tracking-tighter leading-none mt-16 sm:mt-10">
          {formatTime(timeLeft)}
        </div>
        <div className="mt-8 flex gap-3 flex-wrap justify-center">
          <div className="bg-black/40 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold tracking-widest uppercase">
            {t.series} {series}
          </div>
          <div className="opacity-60 bg-black/30 px-5 sm:px-6 py-2 rounded-2xl text-xs sm:text-sm font-bold tracking-widest uppercase">
            {t.totalTime}: {formatTime(totalTime)}
          </div>
        </div>
      </div>

      {/* Kontrolki */}
      <div className="w-full max-w-lg flex flex-col items-center gap-8 sm:gap-10 mb-6 sm:mb-12">
        <div className="flex items-center gap-10 sm:gap-14">
          <button onClick={handleReset} className="p-4 sm:p-5 bg-white/10 rounded-full border border-white/10 active:rotate-180 transition-transform">
            <RotateCcw size={28} />
          </button>
          <button
            onClick={toggleStart}
            className="w-24 h-24 sm:w-32 sm:h-32 bg-white text-gray-900 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center active:scale-95 transition-transform"
          >
            {isActive
              ? <Pause size={48} className="sm:w-16 sm:h-16" fill="currentColor" />
              : <Play  size={48} className="sm:w-16 sm:h-16 ml-2 sm:ml-3" fill="currentColor" />}
          </button>
          <div className="w-[62px] sm:w-[84px]" />
        </div>
      </div>

      {/* Modal ustawień */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="bg-zinc-900 border border-white/10 text-white w-full max-w-md rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-black mb-8 sm:mb-10 tracking-widest italic text-center uppercase border-b border-white/10 pb-4 sm:pb-6">
              {t.settings}
            </h2>
            <div className="space-y-8 sm:space-y-10">

              {/* Język */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3">Language / Język</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <button key={code} onClick={() => setLanguage(code)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all ${
                        language === code ? 'bg-white text-black shadow-md' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kolor biegu */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-3">{t.runColor}</p>
                <div className="flex flex-wrap gap-3">
                  {RUN_COLORS.map(c => (
                    <button key={c.value} onClick={() => setRunColor(c.value)}
                      className={`w-9 h-9 rounded-full transition-transform active:scale-90 ${runColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : ''}`}
                      style={{ backgroundColor: c.value }} title={c.label} />
                  ))}
                </div>
              </div>

              {/* Kolor marszu */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-3">{t.walkColor}</p>
                <div className="flex flex-wrap gap-3">
                  {WALK_COLORS.map(c => (
                    <button key={c.value} onClick={() => setWalkColor(c.value)}
                      className={`w-9 h-9 rounded-full transition-transform active:scale-90 ${walkColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : ''}`}
                      style={{ backgroundColor: c.value }} title={c.label} />
                  ))}
                </div>
              </div>

              {/* Czas biegu */}
              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4 font-bold" style={{ color: runColor }}>
                  <label className="text-[10px] sm:text-xs uppercase tracking-widest">{t.runMin}</label>
                  <span className="text-3xl sm:text-4xl italic">{runMinutes}</span>
                </div>
                <input type="range" min="0.5" max="15" step="0.5" value={runMinutes}
                  onChange={e => setRunMinutes(Number(e.target.value))}
                  className="w-full h-3 sm:h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: runColor }} />
              </div>

              {/* Czas marszu */}
              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4 font-bold" style={{ color: walkColor }}>
                  <label className="text-[10px] sm:text-xs uppercase tracking-widest">{t.walkMin}</label>
                  <span className="text-3xl sm:text-4xl italic">{restMinutes}</span>
                </div>
                <input type="range" min="0.5" max="10" step="0.5" value={restMinutes}
                  onChange={e => setRestMinutes(Number(e.target.value))}
                  className="w-full h-3 sm:h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: walkColor }} />
              </div>
            </div>

            <button
              onClick={() => { setIsSettingsOpen(false); if (!isActive) setTimeLeft(runMinutes * 60); }}
              className="w-full mt-10 sm:mt-12 bg-white text-black py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl active:scale-95 transition-transform shadow-xl hover:bg-zinc-200"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
