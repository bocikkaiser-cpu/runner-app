import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Music } from 'lucide-react';

// ─── Języki ───────────────────────────────────────────────────────────────────
const LANGUAGES = {
  pl: { name: 'Polski',    flag: '🇵🇱', locale: 'pl-PL', run: 'Bieg',   walk: 'Marsz',   three: 'Trzy',  two: 'Dwa',   one: 'Jeden', runLabel: '🏃 BIEG',   walkLabel: '🚶 MARSZ',   settings: 'Ustawienia',    save: 'Zapisz',      runMin: 'Bieg (min)',       walkMin: 'Marsz (min)',      totalTime: 'Czas całkowity', series: 'Seria',  runColor: 'Kolor biegu',   walkColor: 'Kolor marszu'   },
  en: { name: 'English',   flag: '🇬🇧', locale: 'en-US', run: 'Run',    walk: 'Walk',    three: 'Three', two: 'Two',   one: 'One',   runLabel: '🏃 RUN',    walkLabel: '🚶 WALK',    settings: 'Settings',      save: 'Save',        runMin: 'Run (min)',        walkMin: 'Walk (min)',       totalTime: 'Total time',     series: 'Series', runColor: 'Run color',     walkColor: 'Walk color'     },
  es: { name: 'Español',   flag: '🇪🇸', locale: 'es-ES', run: 'Corre',  walk: 'Camina',  three: 'Tres',  two: 'Dos',   one: 'Uno',   runLabel: '🏃 CORRE',  walkLabel: '🚶 CAMINA',  settings: 'Ajustes',       save: 'Guardar',     runMin: 'Correr (min)',     walkMin: 'Caminar (min)',    totalTime: 'Tiempo total',   series: 'Serie',  runColor: 'Color correr',  walkColor: 'Color caminar'  },
  fr: { name: 'Français',  flag: '🇫🇷', locale: 'fr-FR', run: 'Courez', walk: 'Marchez', three: 'Trois', two: 'Deux',  one: 'Un',    runLabel: '🏃 COUREZ', walkLabel: '🚶 MARCHEZ', settings: 'Paramètres',    save: 'Enregistrer', runMin: 'Course (min)',     walkMin: 'Marche (min)',     totalTime: 'Temps total',    series: 'Série',  runColor: 'Couleur course',walkColor: 'Couleur marche' },
  de: { name: 'Deutsch',   flag: '🇩🇪', locale: 'de-DE', run: 'Laufen', walk: 'Gehen',   three: 'Drei',  two: 'Zwei',  one: 'Eins',  runLabel: '🏃 LAUFEN', walkLabel: '🚶 GEHEN',   settings: 'Einstellungen', save: 'Speichern',   runMin: 'Laufen (min)',     walkMin: 'Gehen (min)',      totalTime: 'Gesamtzeit',     series: 'Serie',  runColor: 'Lauffarbe',     walkColor: 'Gehfarbe'       },
  it: { name: 'Italiano',  flag: '🇮🇹', locale: 'it-IT', run: 'Corri',  walk: 'Cammina', three: 'Tre',   two: 'Due',   one: 'Uno',   runLabel: '🏃 CORRI',  walkLabel: '🚶 CAMMINA', settings: 'Impostazioni',  save: 'Salva',       runMin: 'Corsa (min)',      walkMin: 'Camminata (min)',  totalTime: 'Tempo totale',   series: 'Serie',  runColor: 'Colore corsa',  walkColor: 'Colore cammino' },
  pt: { name: 'Português', flag: '🇧🇷', locale: 'pt-BR', run: 'Corra',  walk: 'Caminhe', three: 'Três',  two: 'Dois',  one: 'Um',    runLabel: '🏃 CORRA',  walkLabel: '🚶 CAMINHE', settings: 'Configurações', save: 'Salvar',      runMin: 'Corrida (min)',    walkMin: 'Caminhada (min)', totalTime: 'Tempo total',    series: 'Série',  runColor: 'Cor corrida',   walkColor: 'Cor caminhada'  },
  ru: { name: 'Русский',   flag: '🇷🇺', locale: 'ru-RU', run: 'Бег',    walk: 'Ходьба',  three: 'Три',   two: 'Два',   one: 'Один',  runLabel: '🏃 БЕГ',    walkLabel: '🚶 ХОДЬБА',  settings: 'Настройки',     save: 'Сохранить',   runMin: 'Бег (мин)',        walkMin: 'Ходьба (мин)',     totalTime: 'Общее время',    series: 'Серия',  runColor: 'Цвет бега',     walkColor: 'Цвет ходьбы'    },
  zh: { name: '中文',       flag: '🇨🇳', locale: 'zh-CN', run: '跑步',   walk: '走路',    three: '三',    two: '二',    one: '一',    runLabel: '🏃 跑步',   walkLabel: '🚶 走路',    settings: '设置',          save: '保存',        runMin: '跑步（分钟）',     walkMin: '走路（分钟）',     totalTime: '总时间',         series: '组',     runColor: '跑步颜色',      walkColor: '走路颜色'       },
  ja: { name: '日本語',     flag: '🇯🇵', locale: 'ja-JP', run: '走る',   walk: '歩く',    three: 'さん',  two: 'に',    one: 'いち',  runLabel: '🏃 走る',   walkLabel: '🚶 歩く',    settings: '設定',          save: '保存',        runMin: '走る（分）',       walkMin: '歩く（分）',       totalTime: '合計時間',       series: 'セット', runColor: '走る色',        walkColor: '歩く色'         },
};

const RUN_COLORS  = ['#ea580c','#dc2626','#e11d48','#9333ea','#4338ca','#2563eb','#d97706','#db2777'];
const WALK_COLORS = ['#047857','#16a34a','#0f766e','#0e7490','#0284c7','#4d7c0f','#334155','#6d28d9'];

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  const [runMinutes, setRunMinutes] = useState(2);
  const [restMinutes, setRestMinutes] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('RUN');
  const [timeLeft, setTimeLeft] = useState(runMinutes * 60);
  const [totalTime, setTotalTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState('pl');
  const [runColor, setRunColor]   = useState(RUN_COLORS[0]);
  const [walkColor, setWalkColor] = useState(WALK_COLORS[0]);
  const [series, setSeries] = useState(1);

  const t = LANGUAGES[language];

  const timerRef    = useRef(null);
  const wakeLockRef = useRef(null);
  const audioCtxRef = useRef(null);
  const mainGainRef = useRef(null);

  // Timing oparty na Date.now() – NIE na odejmowaniu sekundy co tick
  const wallStartRef = useRef(null); // Date.now() w chwili ostatniego Resume
  const offsetRef    = useRef(0);    // skumulowane sekundy z poprzednich play-okresów
  const runSecRef    = useRef(runMinutes * 60);
  const restSecRef   = useRef(restMinutes * 60);

  // ── AUDIO – oryginalny playTone ─────────────────────────────────────────────
  const playTone = useCallback((frequency, startTimeOffset, duration, type = 'sine') => {
    if (!audioCtxRef.current || !mainGainRef.current) return;
    const osc  = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    const startTime = audioCtxRef.current.currentTime + startTimeOffset;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(mainGainRef.current);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }, []);

  const playRunMelodyAt = useCallback((offset) => {
    playTone(440, offset + 0.0,  0.15, 'triangle');
    playTone(554, offset + 0.15, 0.15, 'triangle');
    playTone(659, offset + 0.3,  0.15, 'triangle');
    playTone(880, offset + 0.45, 0.5,  'triangle');
  }, [playTone]);

  const playWalkMelodyAt = useCallback((offset) => {
    playTone(659, offset + 0.0,  0.2, 'sine');
    playTone(554, offset + 0.25, 0.2, 'sine');
    playTone(440, offset + 0.5,  0.6, 'sine');
  }, [playTone]);

  const playCountdownAt = useCallback((offset) => {
    playTone(600, offset, 0.15, 'sine');
  }, [playTone]);

  // TTS – działa TYLKO gdy ekran odblokowany. Na web nie da się inaczej.
  const speakVoice = useCallback((key) => {
    if (isMuted) return;
    const lang = LANGUAGES[language];
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(lang[key]);
    u.lang = lang.locale;
    u.rate = 1.1;
    window.speechSynthesis.speak(u);
  }, [isMuted, language]);

  // Zaplanuj WSZYSTKIE dźwięki dla N cykli do przodu – AudioContext nie jest throttlowany
  const schedulePhaseAudio = useCallback((startOffset, runSec, restSec, cycles) => {
    const cycleSec = runSec + restSec;
    for (let i = 0; i < cycles; i++) {
      const base = startOffset + i * cycleSec;
      // Start biegu (pomiń i=0 bo melodia startowa grana osobno natychmiast)
      if (i > 0) playRunMelodyAt(base);
      // Odliczanie przed końcem biegu
      playCountdownAt(base + runSec - 3);
      playCountdownAt(base + runSec - 2);
      playCountdownAt(base + runSec - 1);
      // Start marszu
      playWalkMelodyAt(base + runSec);
      // Odliczanie przed końcem marszu
      playCountdownAt(base + cycleSec - 3);
      playCountdownAt(base + cycleSec - 2);
      playCountdownAt(base + cycleSec - 1);
    }
  }, [playRunMelodyAt, playWalkMelodyAt, playCountdownAt]);

  // Mute przez gain – nie przez pomijanie wywołań playTone
  useEffect(() => {
    if (mainGainRef.current) {
      mainGainRef.current.gain.value = isMuted ? 0 : 1.0;
    }
  }, [isMuted]);

  const startAudioEngine = async () => {
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
    // Cichy oscylator trzyma AudioContext aktywny przy zablokowanym ekranie
    const silentOsc  = audioCtxRef.current.createOscillator();
    const silentGain = audioCtxRef.current.createGain();
    silentGain.gain.value = 0.00001;
    silentOsc.connect(silentGain);
    silentGain.connect(audioCtxRef.current.destination);
    silentOsc.start();
  };

  const toggleStart = async () => {
    if (!isActive) {
      await startAudioEngine();
      if ('wakeLock' in navigator) {
        try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch (err) {}
      }

      // Przy pierwszym starcie: zamroź czasy i zaplanuj audio
      if (offsetRef.current === 0 && wallStartRef.current === null) {
        runSecRef.current  = runMinutes * 60;
        restSecRef.current = restMinutes * 60;
        // Natychmiastowa melodia startowa (jak w oryginale)
        playRunMelodyAt(0);
        speakVoice('run');
        // Pre-scheduluj 120 cykli do przodu – AudioContext zagra je nawet przy zablokowanym ekranie
        schedulePhaseAudio(0, runSecRef.current, restSecRef.current, 120);
      } else {
        // Resume po pauzie – doplanuj audio od aktualnej pozycji w cyklu
        const runSec = runSecRef.current;
        const restSec = restSecRef.current;
        const cycleSec = runSec + restSec;
        const alreadyElapsed = offsetRef.current;
        const cyclePos = alreadyElapsed % cycleSec;
        const currentCycle = Math.floor(alreadyElapsed / cycleSec);
        // Doplanuj bieżący cykl (od miejsca w którym jesteśmy) + 120 kolejnych cykli
        // Uproszczone: planuj od "teraz - cyclePos" na osi AudioContext
        schedulePhaseAudio(-cyclePos, runSec, restSec, 120);
        // Zagraj również melodię bieżącej fazy od razu dla informacji
        if (cyclePos < runSec) playRunMelodyAt(0); else playWalkMelodyAt(0);
      }

      wallStartRef.current = Date.now();
      setIsActive(true);
    } else {
      // Pauza – zapisz skumulowany czas, zamknij AudioContext by anulować zaplanowane
      if (wallStartRef.current) {
        offsetRef.current += Math.floor((Date.now() - wallStartRef.current) / 1000);
        wallStartRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
        mainGainRef.current = null;
      }
      setIsActive(false);
      if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }
    }
  };

  const handleReset = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      mainGainRef.current = null;
    }
    wallStartRef.current = null;
    offsetRef.current = 0;
    if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }
    setIsActive(false);
    setPhase('RUN');
    setTimeLeft(runMinutes * 60);
    setTotalTime(0);
    setSeries(1);
  };

  // ── Pętla wyświetlania – oblicza stan z Date.now() (odporna na throttling) ──
  useEffect(() => {
    if (!isActive) { clearInterval(timerRef.current); return; }

    const tick = () => {
      if (!wallStartRef.current) return;
      const elapsed = offsetRef.current + Math.floor((Date.now() - wallStartRef.current) / 1000);
      const runSec = runSecRef.current;
      const restSec = restSecRef.current;
      const cycleSec = runSec + restSec;
      const cyclePos = elapsed % cycleSec;
      const newSeries = Math.floor(elapsed / cycleSec) + 1;
      let newPhase, newTimeLeft;
      if (cyclePos < runSec) {
        newPhase = 'RUN';
        newTimeLeft = runSec - cyclePos;
      } else {
        newPhase = 'REST';
        newTimeLeft = cycleSec - cyclePos;
      }
      setTotalTime(elapsed);
      setTimeLeft(newTimeLeft);
      setPhase(newPhase);
      setSeries(newSeries);
    };

    tick(); // natychmiastowa aktualizacja
    timerRef.current = setInterval(tick, 500);
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  // Wznowienie po odblokowaniu ekranu
  useEffect(() => {
    const handle = async () => {
      if (document.visibilityState === 'visible') {
        if (audioCtxRef.current?.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        if (isActive && !wakeLockRef.current && 'wakeLock' in navigator) {
          try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch (_) {}
        }
      }
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [isActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-between p-4 sm:p-8 transition-colors duration-1000 text-white font-sans overflow-hidden"
      style={{ backgroundColor: phase === 'RUN' ? runColor : walkColor }}
    >
      <div className="w-full max-w-lg flex justify-between items-center pt-2 sm:pt-6">
        <button onClick={() => setIsMuted(!isMuted)} className="p-3 sm:p-4 bg-white/20 rounded-2xl backdrop-blur-md transition-transform active:scale-90">
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

      <div className="w-full max-w-lg flex flex-col items-center gap-8 sm:gap-10 mb-6 sm:mb-12">
        <div className="flex items-center gap-10 sm:gap-14">
          <button onClick={handleReset} className="p-4 sm:p-5 bg-white/10 rounded-full border border-white/10 active:rotate-180 transition-transform">
            <RotateCcw size={28} />
          </button>
          <button
            onClick={toggleStart}
            className="w-24 h-24 sm:w-32 sm:h-32 bg-white text-gray-900 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center active:scale-95 transition-transform"
          >
            {isActive ? <Pause size={48} className="sm:w-16 sm:h-16" fill="currentColor" /> : <Play size={48} className="sm:w-16 sm:h-16 ml-2 sm:ml-3" fill="currentColor" />}
          </button>
          <div className="w-[62px] sm:w-[84px]" />
        </div>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="bg-zinc-900 border border-white/10 text-white w-full max-w-md rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-black mb-8 sm:mb-10 tracking-widest italic text-center uppercase border-b border-white/10 pb-4 sm:pb-6">
              {t.settings}
            </h2>
            <div className="space-y-8 sm:space-y-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3">Language / Język</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <button key={code} onClick={() => setLanguage(code)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all ${language === code ? 'bg-white text-black shadow-md' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-3">{t.runColor}</p>
                <div className="flex flex-wrap gap-3">
                  {RUN_COLORS.map(c => (
                    <button key={c} onClick={() => setRunColor(c)}
                      className={`w-9 h-9 rounded-full transition-transform active:scale-90 ${runColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-3">{t.walkColor}</p>
                <div className="flex flex-wrap gap-3">
                  {WALK_COLORS.map(c => (
                    <button key={c} onClick={() => setWalkColor(c)}
                      className={`w-9 h-9 rounded-full transition-transform active:scale-90 ${walkColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4 text-orange-500 font-bold">
                  <label className="text-[10px] sm:text-xs uppercase tracking-widest">{t.runMin}</label>
                  <span className="text-3xl sm:text-4xl italic">{runMinutes}</span>
                </div>
                <input type="range" min="0.5" max="15" step="0.5" value={runMinutes}
                  onChange={(e) => setRunMinutes(Number(e.target.value))}
                  className="w-full h-3 sm:h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4 text-emerald-500 font-bold">
                  <label className="text-[10px] sm:text-xs uppercase tracking-widest">{t.walkMin}</label>
                  <span className="text-3xl sm:text-4xl italic">{restMinutes}</span>
                </div>
                <input type="range" min="0.5" max="10" step="0.5" value={restMinutes}
                  onChange={(e) => setRestMinutes(Number(e.target.value))}
                  className="w-full h-3 sm:h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500" />
              </div>
            </div>

            <button
              onClick={() => { setIsSettingsOpen(false); if (!isActive) { handleReset(); } }}
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
