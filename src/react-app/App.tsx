import React, { useState, useEffect, useRef } from "react";

// ==========================================
// DYNAMIC retro synthesizer using Web Audio API
// ==========================================
class SoundSynth {
    private ctx: AudioContext | null = null;
    public muted: boolean = true;

    init() {
        if (!this.ctx) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute(): boolean {
        this.muted = !this.muted;
        this.init();
        return this.muted;
    }

    playMoo() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(115, now);
        osc1.frequency.linearRampToValueAtTime(135, now + 0.25);
        osc1.frequency.exponentialRampToValueAtTime(90, now + 0.9);

        osc2.frequency.setValueAtTime(117, now);
        osc2.frequency.linearRampToValueAtTime(137, now + 0.25);
        osc2.frequency.exponentialRampToValueAtTime(92, now + 0.9);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(250, now + 0.8);
        filter.Q.setValueAtTime(6, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.15);
        gainNode.gain.setValueAtTime(0.4, now + 0.35);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
    }

    playZap() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    playPop() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.06);

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playFailure() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.35);

        gainNode.gain.setValueAtTime(0.35, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
    }

    playSuccess() {
        if (this.muted || !this.ctx) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25];

        notes.forEach((freq, idx) => {
            const time = now + idx * 0.12;
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(0.2, time + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + 0.4);
        });
    }

    playTick() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);

        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }
}

// Interfaces for structured data
interface L2Cow {
    id: number;
    text: string;
    isImpostor: boolean;
    zapping: boolean;
    wrongClick: boolean;
}

interface LetterCow {
    id: number;
    char: string;
}

interface Spark {
    id: number;
    color: string;
    left: number;
    size: number;
    delay: number;
    drift: number;
}

interface BgCowData {
    id: number;
    pattern: string;
    top: number;
    duration: number;
    scale: number;
    delay: number;
}

interface AssemblyPart {
    id: number;
    type: 'bubble' | 'head' | 'body' | 'legs';
    text: string;
}

interface Position {
    x: number;
    y: number;
}

function App() {
    // Declarative Screen state
    const [screen, setScreen] = useState<
        | 'start'
        | 'intro'
        | 'level1-assemble'
        | 'level2-translation'
        | 'level3-spelling'
        | 'level4-flash'
        | 'level5-morse'
        | 'level6-clicker'
        | 'level7-typing'
        | 'level8-pinjata'
        | 'level9-blindcow'
        | 'gameover'
        | 'victory'
    >('start');

    // Global HUD states
    const [timer, setTimer] = useState<number>(30);
    const [scoreVal, setScoreVal] = useState<string>("0/20");
    const [scoreLabel, setScoreLabel] = useState<string>("Score");
    const [progressPercentage, setProgressPercentage] = useState<number>(0);
    const [soundMuted, setSoundMuted] = useState<boolean>(true);
    const [gameoverReason, setGameoverReason] = useState<string>("Time ran out.");
    const [finalTime, setFinalTime] = useState<number>(0);
    const [finalRank, setFinalRank] = useState<string>("C-TIER");
    const [showSkip, setShowSkip] = useState<boolean>(false);
    const [timerPaused, setTimerPaused] = useState<boolean>(false);

    // Audio synthesizer reference
    const synthRef = useRef<SoundSynth | null>(null);

    const getSynth = (): SoundSynth => {
        if (!synthRef.current) {
            synthRef.current = new SoundSynth();
        }
        return synthRef.current;
    };

    // Keystroke focus elements refs
    const l1InputRef = useRef<HTMLInputElement | null>(null);
    const l2FlashInputRef = useRef<HTMLInputElement | null>(null);
    const l5InputRef = useRef<HTMLInputElement | null>(null);

    // Global timeline counters
    const startTimeRef = useRef<number | null>(null);
    const currentLevelRef = useRef<number>(1);

    // Level 1: Assembly states
    const initialAssemblyParts: AssemblyPart[] = [
        { id: 0, type: 'bubble', text: " _________________\n<      Win!       >\n -----------------" },
        { id: 1, type: 'head', text: "        \\   ^__^\n         \\  (oo)\\_______" },
        { id: 2, type: 'body', text: "            (__)\\       )\\/\\" },
        { id: 3, type: 'legs', text: "                ||----w |\n                ||     ||" }
    ];
    const [l1AssembleParts, setL1AssembleParts] = useState<AssemblyPart[]>([]);
    const [l1AssembleSlots, setL1AssembleSlots] = useState<(AssemblyPart | null)[]>([null, null, null, null]);
    const [l1SlotsShake, setL1SlotsShake] = useState<boolean>(false);
    const [l1AssembleWin, setL1AssembleWin] = useState<boolean>(false);

    // Level 8: Pinjata states
    const [l8HitsLeft, setL8HitsLeft] = useState<number>(30);
    const [l8PinjataShake, setL8PinjataShake] = useState<boolean>(false);
    const [l8PinjataWin, setL8PinjataWin] = useState<boolean>(false);
    const l8StartedRef = useRef<boolean>(false);

    // Level 9: Blind Cow states
    const [l9PlayerPos, setL9PlayerPos] = useState<Position>({ x: 0, y: 0 });
    const [l9Opponents, setL9Opponents] = useState<Position[]>([]);
    const [l9OpponentsActive, setL9OpponentsActive] = useState<boolean[]>([]);
    const [l9Message, setL9Message] = useState<string>("Catch an opponent!");

    // Level 1: Typing Frenzy states
    const [l1Target, setL1Target] = useState<string>("win!");
    const [l1Input, setL1Input] = useState<string>("");
    const [l1Score, setL1Score] = useState<number>(0);
    const [l1Success, setL1Success] = useState<boolean>(false);
    const [l1Fail, setL1Fail] = useState<boolean>(false);

    // Level 2: Translation Pasture states
    const winTranslations = ["Ganar!", "Gagner!", "Gewinnen!", "Vincere!", "Vencer!", "Winnen!", "胜利!", "勝つ!"];
    const impostorWords = ["Moo!", "Milk!", "Grass!", "Cow!", "Hay!", "Farm!", "Sleep!", "Eat!", "Barn!", "Beef!", "Burger!"];
    const [l2Cows, setL2Cows] = useState<L2Cow[]>([]);
    const [purgedCount, setPurgedCount] = useState<number>(0);

    // Level 3: Spelling Board states
    const [l3PastureLetters, setL3PastureLetters] = useState<LetterCow[]>([]);
    const [l3Slots, setL3Slots] = useState<(LetterCow | null)[]>([null, null, null, null]);
    const [l3SlotsShake, setL3SlotsShake] = useState<boolean>(false);
    const [l3FusionWin, setL3FusionWin] = useState<boolean>(false);

    // Level 4: Flash Memory states
    const flashWords = ["MILK", "MOOO", "HAYY", "FARM", "TAIL", "HORN", "PASTURE", "CLOVER", "BULL", "CALF"];
    const [flashWord, setFlashWord] = useState<string>("");
    const [flashScore, setFlashScore] = useState<number>(0);
    const [flashState, setFlashState] = useState<'ready' | 'countdown' | 'flashing' | 'question' | 'success' | 'fail'>('ready');
    const [flashCountdownVal, setFlashCountdownVal] = useState<string>("3...");
    const [flashInputVal, setFlashInputVal] = useState<string>("");

    // Level 5: Morse Code states
    const morseMap: Record<string, string> = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..', '!': '-.-.--'
    };
    const morseTargets = ["Win", "Cow", "Win!"];
    const morseSolutions = [".-- .. -.", "-.-. --- .--", ".-- .. -. -.-.--"];
    const [morseTargetIdx, setMorseTargetIdx] = useState<number>(0);
    const [morseInputVal, setMorseInputVal] = useState<string>("");
    const [morseSuccess, setMorseSuccess] = useState<boolean>(false);
    const [morseFail, setMorseFail] = useState<boolean>(false);

    // Level 6: Reaction Clicker states
    const clickerWords = ["MOO", "COW", "MILK", "GRASS", "HAY", "PASTURE", "WIN!", "BULL", "CALF", "WIN!", "CLOVER"];
    const [clickerWord, setClickerWord] = useState<string>("MOO");
    const [clickerScore, setClickerScore] = useState<number>(0);
    const [l6FlashSuccess, setL6FlashSuccess] = useState<boolean>(false);
    const [l6FlashFail, setL6FlashFail] = useState<boolean>(false);

    // Global animations & particles
    const [backgroundHerd, setBackgroundHerd] = useState<BgCowData[]>([]);
    const [victorySparks, setVictorySparks] = useState<Spark[]>([]);
    const [panelShake, setPanelShake] = useState<boolean>(false);
    const [introFrame, setIntroFrame] = useState<number>(1);

    // Dynamic background herd effect hook
    useEffect(() => {
        const cowPatterns = [
`  ^__^
 (oo)\\_______
 (__)\\       )\\/\\
     ||----w |
     ||     ||`,
`  (oo)
  /--\\_______
 (__)        )\\/\\
     ||----w |
     ||     ||`,
`  ^__^
  (xx)\\_______
  (__)\\       )\\/\\
      ||----w |
      ||     ||`
        ];

        let idCounter = 0;
        const spawnCow = (initialDelay = false) => {
            const id = idCounter++;
            const pattern = cowPatterns[Math.floor(Math.random() * cowPatterns.length)];
            const top = Math.random() * 65 + 15;
            const duration = Math.random() * 20 + 25;
            const scale = Math.random() * 0.4 + 0.65;
            const delay = initialDelay ? -Math.random() * 15 : 0;

            const newCow = { id, pattern, top, duration, scale, delay };
            setBackgroundHerd(prev => [...prev, newCow]);

            setTimeout(() => {
                setBackgroundHerd(prev => prev.filter(c => c.id !== id));
            }, duration * 1000);
        };

        for (let i = 0; i < 3; i++) {
            setTimeout(() => spawnCow(true), i * 400);
        }

        const herdInterval = setInterval(() => {
            if (!document.hidden) {
                spawnCow(false);
            }
        }, 12000);

        return () => clearInterval(herdInterval);
    }, []);

    // Game countdown timer loop hook
    useEffect(() => {
        const activeScreens = [
            'level1-assemble',
            'level2-translation',
            'level3-spelling',
            'level4-flash',
            'level5-morse',
            'level6-clicker',
            'level7-typing',
            'level8-pinjata',
            'level9-blindcow'
        ];
        if (!activeScreens.includes(screen)) return;

        const interval = setInterval(() => {
            if (timerPaused) return;
            if (screen === 'level8-pinjata' && !l8StartedRef.current) {
                return;
            }
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleLevelLoss("Time has run out! The pasture demands faster reflexes.");
                    return 0;
                }
                if (prev <= 6) {
                    getSynth().playTick();
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen, timerPaused]);

    // Developer console commands to show/hide skip level button
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).enableSkip = () => {
            setShowSkip(true);
            console.log("Developer skip button enabled.");
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).disableSkip = () => {
            setShowSkip(false);
            console.log("Developer skip button disabled.");
        };
        return () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).enableSkip;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).disableSkip;
        };
    }, []);

    // Level 6 cycle hook
    useEffect(() => {
        if (screen !== 'level6-clicker') return;

        const cycleInterval = setInterval(() => {
            setClickerWord(prev => {
                let next = clickerWords[Math.floor(Math.random() * clickerWords.length)];
                if (next === prev) {
                    next = clickerWords[(clickerWords.indexOf(prev) + 1) % clickerWords.length];
                }
                return next;
            });
        }, 200);

        return () => clearInterval(cycleInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen]);

    // Focus input field hooks
    useEffect(() => {
        if (screen === 'level7-typing' && l1InputRef.current) {
            l1InputRef.current.focus();
        }
    }, [screen, l1Target]);

    useEffect(() => {
        if (screen === 'level4-flash' && flashState === 'question' && l2FlashInputRef.current) {
            l2FlashInputRef.current.focus();
        }
    }, [screen, flashState]);

    useEffect(() => {
        if (screen === 'level5-morse' && l5InputRef.current) {
            l5InputRef.current.focus();
        }
    }, [screen, morseTargetIdx]);

    // ==========================================
    // STATE RESET & TRANSITIONS
    // ==========================================
    const startGame = () => {
        getSynth().init();
        getSynth().playMoo();
        startTimeRef.current = Date.now();
        playIntroCinematic();
    };

    const startLevel = (levelNum: number) => {
        currentLevelRef.current = levelNum;
        setTimer(30);
        setTimerPaused(false);
        setPanelShake(false);

        if (levelNum === 1) {
            setTimer(45);
            setL1AssembleSlots([null, null, null, null]);
            setL1AssembleParts([...initialAssemblyParts].sort(() => 0.5 - Math.random()));
            setL1AssembleWin(false);
            setScoreLabel("Parts Snapped");
            setScoreVal("0/4");
            setProgressPercentage(0);
            setScreen('level1-assemble');

        } else if (levelNum === 2) {
            setTimer(30);
            setScoreLabel("Wins Found");
            setScoreVal("0/4");
            setProgressPercentage(0);
            setScreen('level2-translation');
            setupLevel2Pasture();

        } else if (levelNum === 3) {
            setTimer(30);
            setScoreLabel("Letters Snapped");
            setScoreVal("0/4");
            setProgressPercentage(0);
            setL3FusionWin(false);
            setScreen('level3-spelling');
            setupLevel3SpellingBoard();

        } else if (levelNum === 4) {
            setTimer(30);
            setFlashScore(0);
            setScoreLabel("FLASHED");
            setScoreVal("0/5");
            setProgressPercentage(0);
            setScreen('level4-flash');
            startLevel2Flash();

        } else if (levelNum === 5) {
            setTimer(45);
            setMorseTargetIdx(0);
            setMorseInputVal("");
            setScoreLabel("MORSE TRANSLATED");
            setScoreVal("0/3");
            setProgressPercentage(0);
            setScreen('level5-morse');

        } else if (levelNum === 6) {
            setTimer(30);
            setClickerScore(0);
            setScoreLabel("CLICKS");
            setScoreVal("0/3");
            setProgressPercentage(0);
            setScreen('level6-clicker');

        } else if (levelNum === 7) {
            setTimer(40);
            setL1Score(0);
            setL1Input("");
            setScoreLabel("TYPED");
            setScoreVal("0/20");
            setProgressPercentage(0);
            generateNextLevel1Word("");
            setScreen('level7-typing');

        } else if (levelNum === 8) {
            setTimer(5);
            setL8HitsLeft(30);
            setL8PinjataShake(false);
            setL8PinjataWin(false);
            l8StartedRef.current = false;
            setScoreLabel("HITS LEFT");
            setScoreVal("30 HP");
            setProgressPercentage(0);
            setScreen('level8-pinjata');

        } else if (levelNum === 9) {
            setTimer(40);
            setL9PlayerPos({ x: 0, y: 0 });
            setL9Opponents([
                { x: 5, y: 5 },
                { x: 6, y: 2 },
                { x: 3, y: 6 }
            ]);
            setL9OpponentsActive([true, true, true]);
            setL9Message("Catch an opponent!");
            setScoreLabel("OPPONENTS");
            setScoreVal("3 LEFT");
            setProgressPercentage(0);
            setScreen('level9-blindcow');
        }
    };

    const handleLevelWin = (nextLevel: number) => {
        setTimerPaused(true);
        getSynth().playSuccess();
        triggerScreenSparks();
        setTimeout(() => {
            startLevel(nextLevel);
        }, 1200);
    };

    const handleLevelLoss = (reason: string) => {
        getSynth().playFailure();
        setGameoverReason(reason);
        setScreen('gameover');
    };

    const handleGameVictory = () => {
        setTimerPaused(true);
        getSynth().playMoo();
        const duration = Math.round((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
        setFinalTime(duration);

        let rank = "C-TIER";
        if (duration < 35) rank = "S-TIER";
        else if (duration < 50) rank = "A-TIER";
        else if (duration < 70) rank = "B-TIER";

        setFinalRank(rank);
        setScreen('victory');
    };

    // Confetti loop hook during Victory
    useEffect(() => {
        if (screen !== 'victory') return;
        triggerScreenSparks();
        const sparksInterval = setInterval(triggerScreenSparks, 800);
        return () => clearInterval(sparksInterval);
    }, [screen]);

    const triggerScreenSparks = () => {
        const colors = ['#00ffaa', '#b026ff', '#00f0ff', '#ffd700', '#ff3838'];
        const sparks: Spark[] = [];
        let idCounter = 0;

        for (let i = 0; i < 40; i++) {
            const id = idCounter++;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const size = Math.random() * 8 + 5;
            const delay = Math.random() * 0.2;
            const drift = (Math.random() - 0.5) * 150;
            sparks.push({ id, color, left, size, delay, drift });
        }
        setVictorySparks(sparks);
    };

    const handleToggleMute = () => {
        const isMuted = getSynth().toggleMute();
        setSoundMuted(isMuted);
    };

    // ==========================================
    // CINEMATIC GRAZING INTRO PIPELINE
    // ==========================================
    const playIntroCinematic = () => {
        setScreen('intro');
        setIntroFrame(1);
        getSynth().playPop();

        setTimeout(() => setIntroFrame(2), 600);
        setTimeout(() => setIntroFrame(1), 1200);
        setTimeout(() => setIntroFrame(3), 1800);
        setTimeout(() => {
            setIntroFrame(4);
            getSynth().playMoo();
        }, 2400);
        setTimeout(() => {
            startLevel(1);
        }, 4200);
    };

    // ==========================================
    // LEVEL 1: COW ASSEMBLY
    // ==========================================
    const handleAssemblyPartTap = (part: AssemblyPart, isInsideSlot: boolean, slotIndex?: number) => {
        if (screen !== 'level1-assemble' || l1AssembleWin) return;
        if (isInsideSlot && slotIndex !== undefined) {
            setL1AssembleSlots(prev => {
                const next = [...prev];
                next[slotIndex] = null;
                return next;
            });
            setL1AssembleParts(prev => [...prev, part]);
            getSynth().playPop();
        } else {
            const firstEmptyIdx = l1AssembleSlots.findIndex(s => s === null);
            if (firstEmptyIdx !== -1) {
                setL1AssembleSlots(prev => {
                    const next = [...prev];
                    next[firstEmptyIdx] = part;
                    return next;
                });
                setL1AssembleParts(prev => prev.filter(p => p.id !== part.id));
                getSynth().playPop();
            }
        }
    };

    const handleAssemblyDragStart = (e: React.DragEvent, part: AssemblyPart, sourceSlotIdx?: number) => {
        if (l1AssembleWin) return;
        e.dataTransfer.setData("text/plain", JSON.stringify({ part, sourceSlotIdx }));
    };

    const handleAssemblyDrop = (e: React.DragEvent, targetSlotIdx: number) => {
        e.preventDefault();
        if (l1AssembleWin) return;
        try {
            const dataStr = e.dataTransfer.getData("text/plain");
            if (!dataStr) return;
            const { part, sourceSlotIdx } = JSON.parse(dataStr) as { part: AssemblyPart, sourceSlotIdx?: number };

            if (l1AssembleSlots[targetSlotIdx] !== null) return;

            if (sourceSlotIdx !== undefined) {
                setL1AssembleSlots(prev => {
                    const next = [...prev];
                    next[sourceSlotIdx] = null;
                    return next;
                });
            } else {
                setL1AssembleParts(prev => prev.filter(p => p.id !== part.id));
            }

            setL1AssembleSlots(prev => {
                const next = [...prev];
                next[targetSlotIdx] = part;
                return next;
            });
            getSynth().playPop();
        } catch (err) {
            console.error("Assembly drop failed", err);
        }
    };

    const handleAssemblyDropPasture = (e: React.DragEvent) => {
        e.preventDefault();
        if (l1AssembleWin) return;
        try {
            const dataStr = e.dataTransfer.getData("text/plain");
            if (!dataStr) return;
            const { part, sourceSlotIdx } = JSON.parse(dataStr) as { part: AssemblyPart, sourceSlotIdx?: number };

            if (sourceSlotIdx !== undefined) {
                setL1AssembleSlots(prev => {
                    const next = [...prev];
                    next[sourceSlotIdx] = null;
                    return next;
                });
                setL1AssembleParts(prev => [...prev, part]);
                getSynth().playPop();
            }
        } catch (err) {
            console.error("Assembly pasture drop failed", err);
        }
    };

    useEffect(() => {
        if (screen !== 'level1-assemble') return;

        const filledSlots = l1AssembleSlots.filter(s => s !== null);
        setScoreVal(`${filledSlots.length}/4`);
        setProgressPercentage((filledSlots.length / 4) * 100);

        if (filledSlots.length === 4) {
            const types = l1AssembleSlots.map(s => s?.type);
            const isCorrect = types[0] === 'bubble' && types[1] === 'head' && types[2] === 'body' && types[3] === 'legs';

            if (isCorrect) {
                setTimerPaused(true);
                getSynth().playSuccess();
                triggerScreenSparks();
                setL1AssembleWin(true);
                setTimeout(() => {
                    handleLevelWin(2);
                }, 1800);
            } else {
                getSynth().playFailure();
                setL1SlotsShake(true);
                setTimeout(() => setL1SlotsShake(false), 450);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [l1AssembleSlots, screen]);

    // ==========================================
    // LEVEL 7: TYPING FRENZY
    // ==========================================
    const generateNextLevel1Word = (currentWord: string) => {
        const base = "win!";
        let word = "";
        for (let i = 0; i < base.length; i++) {
            word += Math.random() > 0.5 ? base[i].toUpperCase() : base[i].toLowerCase();
        }
        if (word === currentWord) {
            generateNextLevel1Word(currentWord);
            return;
        }
        setL1Target(word);
    };

    const handleLevel1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentVal = e.target.value;
        setL1Input(currentVal);

        if (l1Target.startsWith(currentVal)) {
            setL1Fail(false);
            setPanelShake(false);
        } else {
            // Mistake
            setL1Fail(true);
            setPanelShake(true);
            getSynth().playFailure();
            setTimeout(() => {
                setL1Input("");
                setL1Fail(false);
                setPanelShake(false);
            }, 300);
            return;
        }

        if (currentVal === l1Target) {
            // Success match
            const nextScore = l1Score + 1;
            setL1Score(nextScore);
            getSynth().playPop();
            setL1Success(true);
            setScoreVal(`${nextScore}/20`);
            setProgressPercentage((nextScore / 20) * 100);
            setL1Input("");

            setTimeout(() => setL1Success(false), 300);

            if (nextScore >= 20) {
                handleLevelWin(2);
            } else {
                generateNextLevel1Word(l1Target);
            }
        }
    };

    // ==========================================
    // LEVEL 2: TRANSLATION PASTURE
    // ==========================================
    const setupLevel2Pasture = () => {
        const wins = [...winTranslations].sort(() => 0.5 - Math.random()).slice(0, 4);
        const fakes = [...impostorWords].sort(() => 0.5 - Math.random()).slice(0, 6);
        
        const pool: L2Cow[] = [];
        let cowId = 0;

        wins.forEach(txt => pool.push({ id: cowId++, text: txt, isImpostor: false, zapping: false, wrongClick: false }));
        fakes.forEach(txt => pool.push({ id: cowId++, text: txt, isImpostor: true, zapping: false, wrongClick: false }));

        pool.sort(() => 0.5 - Math.random());
        
        setL2Cows(pool);
        setPurgedCount(0);
        setScoreVal(`0/4`);
        setProgressPercentage(0);
    };

    const handleLevel2CowClick = (cow: L2Cow) => {
        if (cow.zapping || cow.wrongClick) return;

        if (!cow.isImpostor) {
            // Clicked correct translation: collected/saved!
            getSynth().playZap();
            setL2Cows(prev => prev.map(c => c.id === cow.id ? { ...c, zapping: true } : c));
            
            const nextPurged = purgedCount + 1;
            setPurgedCount(nextPurged);
            setScoreVal(`${nextPurged}/4`);
            setProgressPercentage((nextPurged / 4) * 100);

            setTimeout(() => {
                setL2Cows(prev => prev.filter(c => c.id !== cow.id));
                if (nextPurged >= 4) {
                    handleLevelWin(3); // Advance to Level 3 (Spelling)
                }
            }, 380);
        } else {
            // Clicked impostor word (Mistake)
            getSynth().playFailure();
            setL2Cows(prev => prev.map(c => c.id === cow.id ? { ...c, wrongClick: true } : c));
            setPanelShake(true);

            setTimer(prev => Math.max(1, prev - 3));

            setTimeout(() => {
                setL2Cows(prev => prev.map(c => c.id === cow.id ? { ...c, wrongClick: false } : c));
                setPanelShake(false);
            }, 400);
        }
    };

    // ==========================================
    // LEVEL 3: SPELLING BOARD
    // ==========================================
    const setupLevel3SpellingBoard = () => {
        const correct = ['W', 'i', 'n', '!'];
        const distractors = ['x', 'a', 'o', 'k', 'p'];
        
        const pool: LetterCow[] = [];
        let letterId = 0;

        correct.forEach(ch => pool.push({ id: letterId++, char: ch }));
        distractors.forEach(ch => pool.push({ id: letterId++, char: ch }));

        pool.sort(() => 0.5 - Math.random());

        setL3PastureLetters(pool);
        setL3Slots([null, null, null, null]);
        setProgressPercentage(0);
    };

    const handleSpellingLetterTap = (letter: LetterCow, isInsideSlot: boolean, slotIndex?: number) => {
        if (isInsideSlot && slotIndex !== undefined) {
            // Return cow to pasture list
            setL3Slots(prev => {
                const next = [...prev];
                next[slotIndex] = null;
                return next;
            });
            setL3PastureLetters(prev => [...prev, letter]);
            getSynth().playPop();
        } else {
            // Place in first empty slot
            const firstEmptyIdx = l3Slots.findIndex(s => s === null);
            if (firstEmptyIdx !== -1) {
                setL3Slots(prev => {
                    const next = [...prev];
                    next[firstEmptyIdx] = letter;
                    return next;
                });
                setL3PastureLetters(prev => prev.filter(l => l.id !== letter.id));
                getSynth().playPop();
            }
        }
    };

    // Check spelling after slot update
    useEffect(() => {
        if (screen !== 'level3-spelling') return;

        const filledSlots = l3Slots.filter(s => s !== null);
        setScoreVal(`${filledSlots.length}/4`);
        setProgressPercentage((filledSlots.length / 4) * 100);

        if (filledSlots.length === 4) {
            const spelled = l3Slots.map(s => s?.char).join('');
            if (spelled === 'Win!') {
                // VICTORY FUSION
                setTimerPaused(true);
                getSynth().playSuccess();
                triggerScreenSparks();
                setTimeout(() => {
                    setL3FusionWin(true);
                    setTimeout(() => {
                        handleLevelWin(4); // Advance to Level 4 (Flash)
                    }, 1800);
                }, 600);
            } else {
                // Incorrect spelled
                getSynth().playFailure();
                setL3SlotsShake(true);
                setTimeout(() => setL3SlotsShake(false), 450);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [l3Slots, screen]);

    // HTML5 Drag Event Handles
    const handleDragStart = (e: React.DragEvent, letter: LetterCow, sourceSlotIdx?: number) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ letter, sourceSlotIdx }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetSlotIdx: number) => {
        e.preventDefault();
        try {
            const dataStr = e.dataTransfer.getData("text/plain");
            if (!dataStr) return;
            const { letter, sourceSlotIdx } = JSON.parse(dataStr) as { letter: LetterCow, sourceSlotIdx?: number };

            if (l3Slots[targetSlotIdx] !== null) return; // slot is occupied

            // If it came from another slot, empty that slot first
            if (sourceSlotIdx !== undefined) {
                setL3Slots(prev => {
                    const next = [...prev];
                    next[sourceSlotIdx] = null;
                    return next;
                });
            } else {
                // Came from pasture
                setL3PastureLetters(prev => prev.filter(l => l.id !== letter.id));
            }

            // Snap in slot
            setL3Slots(prev => {
                const next = [...prev];
                next[targetSlotIdx] = letter;
                return next;
            });
            getSynth().playPop();
        } catch (err) {
            console.error("Drop parsed failed", err);
        }
    };

    const handleDropPasture = (e: React.DragEvent) => {
        e.preventDefault();
        try {
            const dataStr = e.dataTransfer.getData("text/plain");
            if (!dataStr) return;
            const { letter, sourceSlotIdx } = JSON.parse(dataStr) as { letter: LetterCow, sourceSlotIdx?: number };

            if (sourceSlotIdx !== undefined) {
                // Return slot element back to pasture list
                setL3Slots(prev => {
                    const next = [...prev];
                    next[sourceSlotIdx] = null;
                    return next;
                });
                setL3PastureLetters(prev => [...prev, letter]);
                getSynth().playPop();
            }
        } catch (err) {
            console.error("Pasture drop failed", err);
        }
    };

    // ==========================================
    // LEVEL 4: FLASH MEMORY
    // ==========================================
    const startLevel2Flash = () => {
        setFlashScore(0);
        triggerNewFlashRound();
    };

    const triggerNewFlashRound = () => {
        setFlashInputVal("");
        setFlashState('countdown');
        setFlashCountdownVal("Ready...");

        const picked = flashWords[Math.floor(Math.random() * flashWords.length)];
        setFlashWord(picked);

        setTimeout(() => {
            if (currentLevelRef.current !== 4) return;
            setFlashCountdownVal("3...");
            getSynth().playTick();
        }, 600);

        setTimeout(() => {
            if (currentLevelRef.current !== 4) return;
            setFlashCountdownVal("2...");
            getSynth().playTick();
        }, 1200);

        setTimeout(() => {
            if (currentLevelRef.current !== 4) return;
            setFlashCountdownVal("1...");
            getSynth().playTick();
        }, 1800);

        // Flash word
        setTimeout(() => {
            if (currentLevelRef.current !== 4) return;
            setFlashState('flashing');
            getSynth().playPop();
        }, 2400);

        // Hide word (250ms)
        setTimeout(() => {
            if (currentLevelRef.current !== 4) return;
            setFlashState('question');
        }, 2650);
    };

    const handleFlashSubmit = () => {
        const typed = flashInputVal.trim().toUpperCase();
        const targetWord = flashWord.toUpperCase();

        if (typed === targetWord) {
            // Correct
            const nextScore = flashScore + 1;
            setFlashScore(nextScore);
            getSynth().playPop();
            triggerScreenSparks();
            setFlashState('success');
            setScoreVal(`${nextScore}/5`);
            setProgressPercentage((nextScore / 5) * 100);

            if (nextScore >= 5) {
                handleLevelWin(5); // Advance to Level 5 (Morse)
            } else {
                setTimeout(() => {
                    if (currentLevelRef.current === 4) triggerNewFlashRound();
                }, 1000);
            }
        } else {
            // Mistake
            getSynth().playFailure();
            setFlashState('fail');
            setPanelShake(true);

            setTimeout(() => {
                setPanelShake(false);
                if (currentLevelRef.current === 4) triggerNewFlashRound();
            }, 1000);
        }
    };

    // ==========================================
    // LEVEL 5: MORSE CODE CHALLENGE
    // ==========================================
    const handleMorseSubmit = () => {
        const typed = morseInputVal.trim();
        const solution = morseSolutions[morseTargetIdx];

        if (typed === solution) {
            const nextIdx = morseTargetIdx + 1;
            setMorseTargetIdx(nextIdx);
            getSynth().playPop();
            triggerScreenSparks();
            setMorseSuccess(true);
            setMorseInputVal("");

            setScoreVal(`${nextIdx}/3`);
            setProgressPercentage((nextIdx / 3) * 100);

            setTimeout(() => setMorseSuccess(false), 300);

            if (nextIdx >= 3) {
                handleLevelWin(6); // Advance to Level 6 (Reaction)
            }
        } else {
            getSynth().playFailure();
            setMorseFail(true);
            setPanelShake(true);

            setTimeout(() => {
                setMorseFail(false);
                setPanelShake(false);
            }, 500);
        }
    };

    const renderMorseChart = () => {
        const items = Object.entries(morseMap).sort((a, b) => a[0].localeCompare(b[0]));
        return (
            <div className="morse-chart-container">
                <div className="morse-chart-title">Morse Code Legend</div>
                <div className="morse-chart-grid">
                    {items.map(([char, code]) => (
                        <div key={char} className="morse-chart-item">
                            <span className="char">{char}</span>
                            <span className="code">{code}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ==========================================
    // LEVEL 6: REACTION CLICKER
    // ==========================================
    const handleLevel6CowClick = () => {
        if (clickerWord === 'WIN!') {
            const nextScore = clickerScore + 1;
            setClickerScore(nextScore);
            getSynth().playPop();
            triggerScreenSparks();
            
            setL6FlashSuccess(true);
            setScoreVal(`${nextScore}/3`);
            setProgressPercentage((nextScore / 3) * 100);
            
            setTimeout(() => setL6FlashSuccess(false), 200);

            if (nextScore >= 3) {
                handleLevelWin(7); // Advance to Level 7 (Typing)
            }
        } else {
            getSynth().playFailure();
            setL6FlashFail(true);
            setPanelShake(true);
            
            setTimer(prev => Math.max(1, prev - 3));

            setTimeout(() => {
                setL6FlashFail(false);
                setPanelShake(false);
            }, 300);
        }
    };

    // ==========================================
    // LEVEL 8: PINJATA
    // ==========================================
    const handlePinjataHit = () => {
        if (l8PinjataWin || timer <= 0) return;

        if (!l8StartedRef.current) {
            l8StartedRef.current = true;
        }

        getSynth().playZap();
        setL8PinjataShake(true);
        setTimeout(() => setL8PinjataShake(false), 80);

        const nextHits = l8HitsLeft - 1;
        setL8HitsLeft(nextHits);
        setScoreVal(`${nextHits} HP`);
        setProgressPercentage(((30 - nextHits) / 30) * 100);

        triggerScreenSparks();

        if (nextHits <= 0) {
            setTimerPaused(true);
            getSynth().playSuccess();
            setL8PinjataWin(true);
            setTimeout(() => {
                handleLevelWin(9); // Advance to Level 9 (Blind Cow)
            }, 1800);
        }
    };

    // ==========================================
    // LEVEL 9: BLIND COW
    // ==========================================
    const moveBlindCow = (dx: number, dy: number) => {
        if (screen !== 'level9-blindcow' || timer <= 0) return;

        const newX = Math.max(0, Math.min(7, l9PlayerPos.x + dx));
        const newY = Math.max(0, Math.min(7, l9PlayerPos.y + dy));
        const newPos = { x: newX, y: newY };
        
        setL9PlayerPos(newPos);
        getSynth().playTick();

        // Check catch before opponents move
        let caughtIndex = -1;
        l9Opponents.forEach((opp, idx) => {
            if (l9OpponentsActive[idx] && opp.x === newPos.x && opp.y === newPos.y) {
                caughtIndex = idx;
            }
        });

        if (caughtIndex !== -1) {
            handleBlindCowCatch(caughtIndex);
            return;
        }

        // Move opponents
        setL9Opponents(prev => {
            return prev.map((opp, idx) => {
                if (!l9OpponentsActive[idx]) return opp;

                // 25% chance of staying still
                if (Math.random() < 0.25) return opp;

                // Possible moves
                const moves = [
                    { x: opp.x, y: opp.y },
                    { x: opp.x + 1, y: opp.y },
                    { x: opp.x - 1, y: opp.y },
                    { x: opp.x, y: opp.y + 1 },
                    { x: opp.x, y: opp.y - 1 }
                ].filter(m => m.x >= 0 && m.x <= 7 && m.y >= 0 && m.y <= 7);

                let bestMove = opp;
                let maxDist = -1;

                moves.forEach(m => {
                    const dist = Math.abs(m.x - newPos.x) + Math.abs(m.y - newPos.y);
                    if (dist > maxDist) {
                        maxDist = dist;
                        bestMove = m;
                    }
                });

                return bestMove;
            });
        });
    };

    const handleBlindCowCatch = (idx: number) => {
        setL9OpponentsActive(prev => {
            const next = [...prev];
            next[idx] = false;
            return next;
        });

        setTimerPaused(true);
        getSynth().playSuccess();
        triggerScreenSparks();
        setL9Message("Opponent caught! Mooo-ve to Victory!");
        setScoreVal("0 LEFT");
        setProgressPercentage(100);

        setTimeout(() => {
            handleGameVictory();
        }, 1500);
    };

    useEffect(() => {
        if (screen !== 'level9-blindcow') return;
        
        let caughtIndex = -1;
        l9Opponents.forEach((opp, idx) => {
            if (l9OpponentsActive[idx] && opp.x === l9PlayerPos.x && opp.y === l9PlayerPos.y) {
                caughtIndex = idx;
            }
        });

        if (caughtIndex !== -1) {
            handleBlindCowCatch(caughtIndex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [l9Opponents, l9PlayerPos, screen]);

    useEffect(() => {
        if (screen !== 'level9-blindcow') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                moveBlindCow(0, -1);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                moveBlindCow(0, 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                moveBlindCow(-1, 0);
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                moveBlindCow(1, 0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen, l9PlayerPos, l9Opponents, l9OpponentsActive]);

    // Developer skip level controls trigger
    const handleSkipLevel = () => {
        getSynth().playSuccess();
        if (currentLevelRef.current === 1) {
            handleLevelWin(2);
        } else if (currentLevelRef.current === 2) {
            handleLevelWin(3);
        } else if (currentLevelRef.current === 3) {
            handleLevelWin(4);
        } else if (currentLevelRef.current === 4) {
            handleLevelWin(5);
        } else if (currentLevelRef.current === 5) {
            handleLevelWin(6);
        } else if (currentLevelRef.current === 6) {
            handleLevelWin(7);
        } else if (currentLevelRef.current === 7) {
            handleLevelWin(8);
        } else if (currentLevelRef.current === 8) {
            handleLevelWin(9);
        } else if (currentLevelRef.current === 9) {
            handleGameVictory();
        }
    };

    // ==========================================
    // COW DISPLAY RENDER COMPONENT HELPERS
    // ==========================================
    const renderLevel1Cow = () => {
        const totalBubbleWidth = 14;
        const padSpaces = " ".repeat(Math.max(0, totalBubbleWidth - l1Target.length));
        return (
            <pre className="ascii-art">
                {` ___________________
< `}
                <span id="l1-target-word">{l1Target}</span>
                {`${padSpaces}>
 -------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
            </pre>
        );
    };

    const renderLevel2Cow = () => {
        const renderText = () => {
            if (flashState === 'ready') return "Ready...";
            if (flashState === 'countdown') return flashCountdownVal;
            if (flashState === 'flashing') return flashWord;
            return "?";
        };
        const activeText = renderText();
        const totalBubbleWidth = 14;
        const padSpaces = " ".repeat(Math.max(0, totalBubbleWidth - activeText.length));

        return (
            <pre className="ascii-art">
                {` ________________
< ${activeText}${padSpaces}>
 ----------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
            </pre>
        );
    };

    const renderIntroCow = () => {
        if (introFrame === 1) {
            return (
                <pre className="ascii-art" style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
                    {`             *crunch*
      ^__^  /
     (..)\\_______
     (__)\\       )\\/\\
      \\/ ||----w |
         ||     ||  vvvv`}
                </pre>
            );
        }
        if (introFrame === 2) {
            return (
                <pre className="ascii-art" style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
                    {`             *munch*
      ^__^  /
     (--)\\_______
     (__)\\       )\\/\\
      \\/ ||----w |
         ||     ||  vv`}
                </pre>
            );
        }
        if (introFrame === 3) {
            return (
                <pre className="ascii-art" style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
                    {`      ^__^  
     (oo)\\_______
     (__)\\       )\\/\\
        ||----w |
        ||     ||`}
                </pre>
            );
        }
        return (
            <pre className="ascii-art" style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
                {` ________________
<      Moo!      >
 ----------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
            </pre>
        );
    };

    const isGameScreenActive = [
        'level1-assemble',
        'level2-translation',
        'level3-spelling',
        'level4-flash',
        'level5-morse',
        'level6-clicker',
        'level7-typing',
        'level8-pinjata',
        'level9-blindcow'
    ].includes(screen);

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Background grazers Pasture */}
            <div id="background-pasture">
                {backgroundHerd.map(cow => (
                    <div
                        key={cow.id}
                        className="bg-cow"
                        style={{
                            top: `${cow.top}%`,
                            animationDuration: `${cow.duration}s`,
                            animationDelay: `${cow.delay}s`,
                            transform: `scale(${cow.scale})`
                        }}
                    >
                        {cow.pattern}
                    </div>
                ))}
            </div>

            {/* Header */}
            <header>
                <div className="logo-container">
                    <span className="logo-text">COWSAY.WIN</span>
                </div>
                <div className="nav-controls">
                    {isGameScreenActive && (
                        <button onClick={() => startLevel(currentLevelRef.current)} className="btn-secondary" title="Restart Level">
                            <span className="desktop-text">Restart Level </span>🔄
                        </button>
                    )}
                    {isGameScreenActive && showSkip && (
                        <button onClick={handleSkipLevel} className="btn-secondary" title="Skip Level">
                            <span className="desktop-text">Skip Level </span>⏭️
                        </button>
                    )}
                    <button onClick={handleToggleMute} className="btn-icon" title="Toggle Sound">
                        {soundMuted ? '🔇' : '🔊'}
                    </button>
                </div>
            </header>

            {/* Main Board */}
            <main>
                <div className={`game-card ${panelShake ? 'shake-animation' : ''}`} id="game-container">
                    
                    {/* sparks victory Sparks container */}
                    <div className="confetti-container" id="confetti-holder">
                        {victorySparks.map(spark => (
                            <div
                                key={spark.id}
                                className="confetti-particle"
                                style={{
                                    backgroundColor: spark.color,
                                    left: `${spark.left}%`,
                                    width: `${spark.size}px`,
                                    height: `${spark.size}px`,
                                    animationDelay: `${spark.delay}s`,
                                    WebkitTransform: `translateX(${spark.drift}px)`,
                                    transform: `translateX(${spark.drift}px)`
                                }}
                            />
                        ))}
                    </div>

                    {/* Level HUD Dashboard */}
                    {isGameScreenActive && (
                        <div className="stats-panel" id="level-hud" style={{ display: "flex" }}>
                            <div className="stat-item">
                                <span className="stat-val">{currentLevelRef.current}</span>
                                <span className="stat-label">Level</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-val">{scoreVal}</span>
                                <span className="stat-label">{scoreLabel}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-val" style={{ color: timer <= 5 ? "var(--danger)" : "inherit" }}>
                                    {timer}s
                                </span>
                                <span className="stat-label">Time</span>
                            </div>
                        </div>
                    )}

                    {/* HUD Progress Bar */}
                    {isGameScreenActive && (
                        <div className="progress-bar-container" id="progress-hud" style={{ display: "block" }}>
                            <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
                        </div>
                    )}

                    {/* SCREEN: START */}
                    <section className={`screen ${screen === 'start' ? 'active' : ''}`}>
                        <h1>COWSAY.WIN</h1>
                        <p className="subtitle">A 9-stage game of assembly, translation, spelling, memory, morse code, reaction, typing, pinjata, and grid chase.</p>
                        
                        <div className="ascii-cow-wrapper">
                            <pre className="ascii-art">
                                {` ____________________
< PLAY COWSAY GAME! >
 --------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
                            </pre>
                        </div>
                        
                        <button onClick={startGame} className="btn-primary">Play Game</button>
                    </section>

                    {/* SCREEN: INTRO CUTSCENE */}
                    <section className={`screen ${screen === 'intro' ? 'active' : ''}`}>
                        <div className="ascii-cow-wrapper text-center" style={{ border: "none", background: "transparent", padding: "1.5rem 0" }}>
                            {renderIntroCow()}
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 1 (COW ASSEMBLY) */}
                    <section className={`screen ${screen === 'level1-assemble' ? 'active' : ''}`}>
                        <h2>Level 1: Assemble the Cow</h2>
                        <p className="subtitle">Assemble the parts of a cow so she can win! Drag the parts or click them to place them in order.</p>

                        <div className={`assembly-slots-container ${l1SlotsShake ? 'shake-animation' : ''}`}>
                            {l1AssembleSlots.map((slot, idx) => (
                                <div
                                    key={idx}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleAssemblyDrop(e, idx)}
                                    onClick={() => { if (slot) handleAssemblyPartTap(slot, true, idx); }}
                                    className={`assembly-slot ${slot ? 'filled' : ''}`}
                                >
                                    {slot ? (
                                        <pre className="ascii-art" style={{ fontSize: "0.8rem", lineHeight: 1.25, margin: "0 auto", width: "320px", textAlign: "left" }}>
                                            {slot.text}
                                        </pre>
                                    ) : (
                                        <span className="slot-label">
                                            {idx === 0 ? '[Slot 1: Speech Bubble]' : idx === 1 ? '[Slot 2: Cow Head]' : idx === 2 ? '[Slot 3: Cow Body]' : '[Slot 4: Cow Legs]'}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleAssemblyDropPasture}
                            className="assembly-pasture"
                        >
                            {!l1AssembleWin ? (
                                l1AssembleParts.map(part => (
                                    <div
                                        key={part.id}
                                        draggable
                                        onDragStart={(e) => handleAssemblyDragStart(e, part)}
                                        onClick={() => handleAssemblyPartTap(part, false)}
                                        className="assembly-part"
                                    >
                                        <pre className="ascii-art" style={{ fontSize: "0.75rem", lineHeight: 1.25, margin: 0 }}>
                                            {part.text}
                                        </pre>
                                    </div>
                                ))
                            ) : (
                                <div className="ascii-cow-wrapper text-center victory-cow" style={{ width: "100%", border: "none", background: "transparent" }}>
                                    <pre className="ascii-art" style={{ color: "var(--accent)" }}>
                                        {` ___________________
< Win!              >
 -------------------
        \\   ^__^
         \\  (★★)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 2 (TRANSLATION) */}
                    <section className={`screen ${screen === 'level2-translation' ? 'active' : ''}`}>
                        <h2>Level 2: Translation</h2>
                        <p className="subtitle">Click/zap the cows that DO say "Win!" in another language.</p>

                        <div className="pasture-grid">
                            {l2Cows.map(cow => (
                                <div
                                    key={cow.id}
                                    onClick={() => handleLevel2CowClick(cow)}
                                    className={`pasture-cow ${cow.zapping ? 'zapping' : ''} ${cow.wrongClick ? 'wrong-click' : ''}`}
                                >
                                    <div className="bubble">{cow.text}</div>
                                    <pre className="ascii-art" style={{ fontSize: "0.65rem", lineHeight: 1.15, width: "fit-content", margin: "0 auto" }}>
                                        {`  ^__^
 (oo)\\_______
 (__)\\       )\\/\\
     ||----w |
     ||     ||`}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 3 (SPELLING) */}
                    <section className={`screen ${screen === 'level3-spelling' ? 'active' : ''}`}>
                        <h2>Level 3: Spelling</h2>
                        <p className="subtitle">Drag letters in order to spell "Win!".</p>

                        {/* Slots */}
                        <div className={`drop-slots-container ${l3SlotsShake ? 'shake-animation' : ''}`}>
                            {l3Slots.map((slot, idx) => (
                                <div
                                    key={idx}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    onClick={() => { if (slot) handleSpellingLetterTap(slot, true, idx); }}
                                    className={`drop-slot ${slot ? 'filled' : ''}`}
                                >
                                    {slot ? (
                                        <pre className="ascii-art" style={{ fontSize: "0.75rem", lineHeight: 1.15, margin: "0 auto" }}>
                                            {`  __
< `}{slot.char}{` >
  --
  \\  ^__^
   \\ (oo)
     (__)\\
     ||-w|`}
                                        </pre>
                                    ) : (
                                        <span className="slot-label">
                                            {idx === 0 ? 'W' : idx === 1 ? 'i' : idx === 2 ? 'n' : '!'}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pasture board of letter cows */}
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDropPasture}
                            className="drag-pasture"
                        >
                            {!l3FusionWin ? (
                                l3PastureLetters.map(letter => (
                                    <div
                                        key={letter.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, letter)}
                                        onClick={() => handleSpellingLetterTap(letter, false)}
                                        className="drag-cow"
                                    >
                                        <pre className="ascii-art" style={{ fontSize: "0.75rem", lineHeight: 1.15, margin: "0 auto" }}>
                                            {`  __
< `}{letter.char}{` >
  --
  \\  ^__^
   \\ (oo)
     (__)\\
     ||-w|`}
                                        </pre>
                                    </div>
                                ))
                            ) : (
                                <div className="ascii-cow-wrapper text-center victory-cow" style={{ width: "100%" }}>
                                    <pre className="ascii-art">
                                        {` ___________________
< Win!              >
 -------------------
        \\   ^__^
         \\  (★★)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 4 (FLASH MEMORY) */}
                    <section className={`screen ${screen === 'level4-flash' ? 'active' : ''}`}>
                        <h2>Level 4: Flash</h2>
                        <p className="subtitle">A word will flash. Type what you saw.</p>

                        <div className={`ascii-cow-wrapper ${flashState === 'flashing' || flashState === 'success' ? 'success-flash' : ''} ${flashState === 'fail' ? 'fail-flash' : ''}`}>
                            {renderLevel2Cow()}
                        </div>

                        <div className="game-input-container">
                            {flashState === 'question' && (
                                <>
                                    <input
                                        ref={l2FlashInputRef}
                                        type="text"
                                        className="input-field"
                                        value={flashInputVal}
                                        onChange={(e) => setFlashInputVal(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleFlashSubmit(); }}
                                        placeholder="..."
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                    <button onClick={handleFlashSubmit} className="btn-primary" style={{ margin: "1rem auto 0", display: "block" }}>
                                        Submit
                                    </button>
                                </>
                            )}
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 5 (MORSE CODE) */}
                    <section className={`screen ${screen === 'level5-morse' ? 'active' : ''}`} style={{ width: "100%" }}>
                        <h2>Level 5: Morse Code</h2>
                        <p className="subtitle">Translate the word into Morse (spaces between letters).</p>

                        <div className="morse-layout" style={{ display: "flex", width: "100%", gap: "2rem", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
                            <div className="morse-left" style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div className={`ascii-cow-wrapper ${morseSuccess ? 'success-flash' : ''} ${morseFail ? 'fail-flash' : ''}`}>
                                    <pre className="ascii-art">
                                        {` ________________
< Translate: ${morseTargets[morseTargetIdx] ?? ""} >
 ----------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
                                    </pre>
                                </div>

                                <div className="game-input-container">
                                    <input
                                        ref={l5InputRef}
                                        type="text"
                                        className="input-field"
                                        value={morseInputVal}
                                        onChange={(e) => setMorseInputVal(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleMorseSubmit(); }}
                                        placeholder="e.g. .-- .. -."
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                    <button onClick={handleMorseSubmit} className="btn-primary" style={{ margin: "1rem auto 0", display: "block" }}>
                                        Submit
                                    </button>
                                </div>
                            </div>
                            <div className="morse-right" style={{ flex: "1 1 200px", maxWidth: "260px" }}>
                                {renderMorseChart()}
                            </div>
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 6 (REACTION CLICKER) */}
                    <section className={`screen ${screen === 'level6-clicker' ? 'active' : ''}`}>
                        <h2>Level 6: Reaction</h2>
                        <p className="subtitle">Click the cow ONLY when it says WIN! (cycles every 200ms)</p>

                        <div
                            onClick={handleLevel6CowClick}
                            className={`ascii-cow-wrapper reaction-active ${l6FlashSuccess ? 'success-flash' : ''} ${l6FlashFail ? 'fail-flash' : ''}`}
                        >
                            <pre className="ascii-art">
                                {` ________________
< ${clickerWord}${" ".repeat(Math.max(0, 14 - clickerWord.length))}>
 ----------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
                            </pre>
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 7 (TYPING FRENZY) */}
                    <section className={`screen ${screen === 'level7-typing' ? 'active' : ''}`}>
                        <h2>Level 7: Typing Frenzy</h2>
                        <p className="subtitle">Type case-sensitive matches exactly as shown.</p>

                        <div className={`ascii-cow-wrapper ${l1Success ? 'success-flash' : ''} ${l1Fail ? 'fail-flash' : ''}`}>
                            {renderLevel1Cow()}
                        </div>

                        <div className="game-input-container">
                            <input
                                ref={l1InputRef}
                                type="text"
                                className="input-field"
                                value={l1Input}
                                onChange={handleLevel1Change}
                                placeholder="..."
                                autoComplete="off"
                                spellCheck={false}
                            />
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 8 (PINJATA) */}
                    <section className={`screen ${screen === 'level8-pinjata' ? 'active' : ''}`}>
                        <h2>Level 8: Pinjata</h2>
                        <p className="subtitle">Hit the Pinjata until the cow wins! Click on the Pinjata box repeatedly.</p>

                        <div className="pinjata-container">
                            <div className="pinjata-hp-bar">
                                <div className="pinjata-hp-fill" style={{ width: `${(l8HitsLeft / 30) * 100}%` }}></div>
                            </div>
                            
                            <div
                                onClick={handlePinjataHit}
                                className={`pinjata-wrapper ${l8PinjataShake ? 'hitting' : ''}`}
                            >
                                <pre className="ascii-art" style={{ fontSize: "0.85rem", lineHeight: 1.3, cursor: "pointer" }}>
                                    {l8PinjataWin ? (
                                        `  _________________
 <   Moo-ve Out!   >
  -----------------
         \\   ^__^
          \\  (★★)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||`
                                    ) : l8HitsLeft <= 10 ? (
                                        `           |
       x__x |
      (x.x)  = =____
      (xx)        /  /
          ||      ||
      [ BROKEN SECT ]`
                                    ) : l8HitsLeft <= 20 ? (
                                        `           |
       ^__^ |
      (o/o)\\= =____
      (/__)\\      /)\\/\\
          ||- - -w|
          ||     ||
      [ CRACKED HP ]`
                                    ) : (
                                        `           |
       ^__^ |
      (o.o)\\|= =____
      (__)\\       )\\/\\
          ||-----w|
          ||     ||
       [ COW PINJATA ]`
                                    )}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 9 (BLIND COW) */}
                    <section className={`screen ${screen === 'level9-blindcow' ? 'active' : ''}`}>
                        <h2>Level 9: Blind Cow Pasture</h2>
                        <p className="subtitle">Guide the blind cow (xx) using WASD / Arrow Keys or the D-pad to catch the fleeing opponents (oo)!</p>

                        <div className="blindcow-container">
                            <div className="blindcow-grid">
                                {Array.from({ length: 8 }).map((_, r) => (
                                    Array.from({ length: 8 }).map((_, c) => {
                                        const isPlayer = l9PlayerPos.x === c && l9PlayerPos.y === r;
                                        let isOpponent = false;
                                        l9Opponents.forEach((opp, idx) => {
                                            if (l9OpponentsActive[idx] && opp.x === c && opp.y === r) {
                                                isOpponent = true;
                                            }
                                        });

                                        return (
                                            <div
                                                key={`${r}-${c}`}
                                                className={`blindcow-cell ${isPlayer ? 'player' : ''} ${isOpponent ? 'opponent' : ''}`}
                                            >
                                                {isPlayer ? (
                                                    <span>(xx)</span>
                                                ) : isOpponent ? (
                                                    <span>(oo)</span>
                                                ) : (
                                                    <span style={{ opacity: 0.15 }}>.</span>
                                                )}
                                            </div>
                                        );
                                    })
                                ))}
                            </div>

                            <p style={{ fontSize: "0.9rem", color: "var(--accent)", marginBottom: "1rem" }}>
                                {l9Message}
                            </p>

                            <div className="blindcow-controls">
                                <div className="dpad-empty"></div>
                                <button className="dpad-btn" onClick={() => moveBlindCow(0, -1)}>▲</button>
                                <div className="dpad-empty"></div>
                                <button className="dpad-btn" onClick={() => moveBlindCow(-1, 0)}>◀</button>
                                <div className="dpad-empty"></div>
                                <button className="dpad-btn" onClick={() => moveBlindCow(1, 0)}>▶</button>
                                <div className="dpad-empty"></div>
                                <button className="dpad-btn" onClick={() => moveBlindCow(0, 1)}>▼</button>
                                <div className="dpad-empty"></div>
                            </div>
                        </div>
                    </section>

                    {/* SCREEN: GAME OVER */}
                    <section className={`screen ${screen === 'gameover' ? 'active' : ''}`}>
                        <h2 className="error-title">Fail</h2>
                        <p className="subtitle">{gameoverReason}</p>
                        
                        <div className="ascii-cow-wrapper error-cow">
                            <pre className="ascii-art">
                                {` ___________________
< MOOO-ve along... >
 -------------------
        \\   ^__^
         \\  (xx)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
                            </pre>
                        </div>

                        <button onClick={() => startLevel(currentLevelRef.current)} className="btn-primary">Retry</button>
                    </section>

                    {/* SCREEN: VICTORY */}
                    <section className={`screen ${screen === 'victory' ? 'active' : ''}`}>
                        <h2>Win</h2>
                        <p className="subtitle">Completed in record time.</p>

                        <div className="ascii-cow-wrapper victory-cow" id="victory-cow-display">
                            <pre className="ascii-art">
                                {` _______________________________________
< WINNER! COWSAY RULES THE PASTURE! >
 ---------------------------------------
        \\   ^__^
         \\  (★☆)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
                            </pre>
                        </div>

                        <div className="stats-panel">
                            <div className="stat-item">
                                <span className="stat-val">{finalRank}</span>
                                <span className="stat-label">Rank</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-val">{finalTime}s</span>
                                <span className="stat-label">Time</span>
                            </div>
                        </div>

                        <button onClick={() => startLevel(1)} className="btn-primary">Play Again</button>
                    </section>

                </div>
            </main>

            {/* Footer */}
            <footer>
                <p>cowsay.win</p>
            </footer>
        </div>
    );
}

export default App;
