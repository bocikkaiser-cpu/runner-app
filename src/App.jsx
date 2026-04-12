import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Music } from 'lucide-react';

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

  const timerRef = useRef(null);
  const wakeLockRef = useRef(null);
  const audioCtxRef = useRef(null);
  const mainGainRef = useRef(null);
  const speechKeepAliveRef = useRef(null);

  // Refs do precyzyjnego liczenia czasu opartego na Date.now()
  const phaseStartRef = useRef(null);
  const phaseInitialTimeRef = useRef(null);
  const totalStartRef = useRef(null);
  const totalOffsetRef = useRef(0); // skumulowany czas z poprzednich sesji pause/resume
  const announcedRef = useRef(new Set());

  // Utrzymuje speechSynthesis przy życiu przy zablokowanym ekranie
  const startSpeechKeepAlive = useCallback(() => {
    if (speechKeepAliveRef.current) clearInterval(speechKeepAliveRef.current);
    speechKeepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 10000);
  }, []);

  const stopSpeechKeepAlive = useCallback(() => {
    if (speechKeepAliveRef.current) {
      clearInterval(speechKeepAliveRef.current);
      speechKeepAliveRef.current = null;
    }
  }, []);

  const speakVoice = useCallback((textEn, textPl) => {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    const text = language === 'pl' ? textPl : textEn;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'pl' ? 'pl-PL' : 'en-US';
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  }, [isMuted, language]);

  const playTone = useCallback((frequency, startTimeOffset, duration, type = 'sine') => {
    if (isMuted || !audioCtxRef.current) return;

    const osc = audioCtxRef.current.createOscillator();
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
    osc.stop(startTime + duration);
  }, [isMuted]);

  const playCountdown = useCallback(() => {
    playTone(600, 0, 0.15, 'sine');
  }, [playTone]);

  const playRunMelody = useCallback(() => {
    playTone(440, 0.0, 0.15, 'triangle');
    playTone(554, 0.15, 0.15, 'triangle');
    playTone(659, 0.3, 0.15, 'triangle');
    playTone(880, 0.45, 0.5, 'triangle');
  }, [playTone]);

  const playWalkMelody = useCallback(() => {
    playTone(659, 0.0, 0.2, 'sine');
    playTone(554, 0.25, 0.2, 'sine');
    playTone(440, 0.5, 0.6, 'sine');
  }, [playTone]);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (err) {}
    }
  }, []);

  const startAudioEngine = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (!mainGainRef.current) {
      mainGainRef.current = audioCtxRef.current.createGain();
      mainGainRef.current.gain.value = 1.0;
      mainGainRef.current.connect(audioCtxRef.current.destination);
    }

    // Generator ciszy utrzymujący AudioContext przy zablokowanym ekranie
    const silentOsc = audioCtxRef.current.createOscillator();
    const silentGain = audioCtxRef.current.createGain();
    silentGain.gain.value = 0.00001;
    silentOsc.connect(silentGain);
    silentGain.connect(audioCtxRef.current.destination);
    silentOsc.start();
  };

  // Wznawianie po odblokowaniu ekranu / powrocie do karty
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Wznów AudioContext jeśli zawieszony
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        // Wznów speechSynthesis
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        // Ponów wake lock (jest zwalniany automatycznie przy blokadzie ekranu)
        if (isActive && !wakeLockRef.current) {
          await requestWakeLock();
        }
        // Zsynchronizuj czas - zaktualizuj phaseStart o czas gdy byliśmy niewidoczni
        // (nie rób nic - Date.now() automatycznie uwzględni czas w tle)
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, requestWakeLock]);

  const toggleStart = async () => {
    if (!isActive) {
      await startAudioEngine();
      await requestWakeLock();
      startSpeechKeepAlive();

      // Inicjalizacja czasomierzy
      phaseStartRef.current = Date.now();
      phaseInitialTimeRef.current = timeLeft;
      totalStartRef.current = Date.now();
      announcedRef.current = new Set();

      setIsActive(true);

      if (totalTime === 0) {
        if (phase === 'RUN') {
          playRunMelody();
          speakVoice('Run', 'Bieg');
        } else {
          playWalkMelody();
          speakVoice('Walk', 'Marsz');
        }
      }
    } else {
      setIsActive(false);
      stopSpeechKeepAlive();
      // Zapisz czas całkowity przy pauzie
      if (totalStartRef.current) {
        totalOffsetRef.current += Math.floor((Date.now() - totalStartRef.current) / 1000);
        totalStartRef.current = null;
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!isActive) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - phaseStartRef.current) / 1000);
      const remaining = phaseInitialTimeRef.current - elapsed;

      // Czas całkowity oparty na rzeczywistym czasie
      if (totalStartRef.current) {
        setTotalTime(totalOffsetRef.current + Math.floor((Date.now() - totalStartRef.current) / 1000));
      }

      // Ogłoszenia odliczania - każde tylko raz
      [3, 2, 1].forEach(n => {
        if (remaining === n && !announcedRef.current.has(`${phase}-${phaseInitialTimeRef.current}-${n}`)) {
          announcedRef.current.add(`${phase}-${phaseInitialTimeRef.current}-${n}`);
          playCountdown();
          if (n === 3) speakVoice('Three', 'Trzy');
          if (n === 2) speakVoice('Two', 'Dwa');
          if (n === 1) speakVoice('One', 'Jeden');
        }
      });

      if (remaining <= 0) {
        // Zmiana fazy
        const nextPhase = phase === 'RUN' ? 'REST' : 'RUN';
        const nextDuration = nextPhase === 'RUN' ? runMinutes * 60 : restMinutes * 60;

        phaseStartRef.current = Date.now();
        phaseInitialTimeRef.current = nextDuration;
        announcedRef.current = new Set();

        if (nextPhase === 'REST') {
          playWalkMelody();
          speakVoice('Walk', 'Marsz');
        } else {
          playRunMelody();
          speakVoice('Run', 'Bieg');
        }

        setPhase(nextPhase);
        setTimeLeft(nextDuration);
      } else {
        setTimeLeft(Math.max(0, remaining));
      }
    }, 500); // Poll co 500ms zamiast 1000ms dla większej dokładności

    return () => clearInterval(timerRef.current);
  }, [isActive, phase, runMinutes, restMinutes, playCountdown, playRunMelody, playWalkMelody, speakVoice]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col items-center justify-between p-4 sm:p-8 transition-colors duration-1000 ${
      phase === 'RUN' ? 'bg-orange-600' : 'bg-emerald-700'
    } text-white font-sans overflow-hidden`}>

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
          {phase === 'RUN' ? (language === 'pl' ? '🏃 BIEG' : '🏃 RUN') : (language === 'pl' ? '🚶 MARSZ' : '🚶 WALK')}
        </div>
        <div className="text-7xl sm:text-9xl md:text-[110px] font-black tabular-nums tracking-tighter leading-none mt-16 sm:mt-10">
          {formatTime(timeLeft)}
        </div>
        <div className="mt-8 opacity-60 bg-black/30 px-5 sm:px-6 py-2 rounded-2xl text-xs sm:text-sm font-bold tracking-widest uppercase">
          {language === 'pl' ? 'Czas całkowity' : 'Total time'}: {formatTime(totalTime)}
        </div>
      </div>

      <div className="w-full max-w-lg flex flex-col items-center gap-8 sm:gap-10 mb-6 sm:mb-12">
        <div className="flex items-center gap-10 sm:gap-14">
          <button
            onClick={() => {
              setIsActive(false);
              stopSpeechKeepAlive();
              totalOffsetRef.current = 0;
              totalStartRef.current = null;
              setTotalTime(0);
              setTimeLeft(runMinutes * 60);
              setPhase('RUN');
            }}
            className="p-4 sm:p-5 bg-white/10 rounded-full border border-white/10 active:rotate-180 transition-transform"
          >
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
              {language === 'pl' ? 'Ustawienia' : 'Settings'}
            </h2>

            <div className="space-y-8 sm:space-y-10">
              <div className="flex bg-zinc-800 p-1 rounded-2xl">
                <button
                  onClick={() => setLanguage('pl')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-widest transition-all ${language === 'pl' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
                >
                  POLSKI
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-widest transition-all ${language === 'en' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
                >
                  ENGLISH
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4 text-orange-500 font-bold">
                  <label className="text-[10px] sm:text-xs uppercase tracking-widest">{language === 'pl' ? 'Bieg (min)' : 'Run (min)'}</label>
                  <span className="text-3xl sm:text-4xl italic">{runMinutes}</span>
                </div>
                <input type="range" min="0.5" max="15" step="0.5" value={runMinutes} onChange={(e) => setRunMinutes(Number(e.target.value))} className="w-full h-3 sm:h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4 text-emerald-500 font-bold">
                  <label className="text-[10px] sm:text-xs uppercase tracking-widest">{language === 'pl' ? 'Marsz (min)' : 'Walk (min)'}</label>
                  <span className="text-3xl sm:text-4xl italic">{restMinutes}</span>
                </div>
                <input type="range" min="0.5" max="10" step="0.5" value={restMinutes} onChange={(e) => setRestMinutes(Number(e.target.value))} className="w-full h-3 sm:h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500" />
              </div>
            </div>

            <button
              onClick={() => { setIsSettingsOpen(false); if (!isActive) setTimeLeft(runMinutes * 60); }}
              className="w-full mt-10 sm:mt-12 bg-white text-black py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl active:scale-95 transition-transform shadow-xl hover:bg-zinc-200"
            >
              {language === 'pl' ? 'ZAPISZ' : 'SAVE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
