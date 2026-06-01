import React, { useState, useEffect, useRef } from "react";

// ==========================================
// DYNAMIC retro synthesizer using Web Audio API
// ==========================================
class SoundSynth {
    private ctx: AudioContext | null = null;
    public muted: boolean = true;

    init() {
        if (!this.ctx) {
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

function App() {
    // Declarative Screen state
    const [screen, setScreen] = useState<
        'start' | 'intro' | 'level1' | 'level2-flash' | 'level3-translation' | 'level4-spelling' | 'level5-morse' | 'level6-clicker' | 'gameover' | 'victory'
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
    const [totalImpostors, setTotalImpostors] = useState<number>(6);

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
 (oo)\\\\_______
 (__)\\\\       )\\/\\\\
     ||----w |
     ||     ||`,
`  (oo)
  /--\\\\_______
 (__)        )\\/\\\\
     ||----w |
     ||     ||`,
`  ^__^
  (xx)\\\\_______
  (__)\\\\       )\\/\\\\
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
        const activeScreens = ['level1', 'level2-flash', 'level3-translation', 'level4-spelling', 'level5-morse', 'level6-clicker'];
        if (!activeScreens.includes(screen)) return;

        const interval = setInterval(() => {
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
    }, [screen]);

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
    }, [screen]);

    // Focus input field hooks
    useEffect(() => {
        if (screen === 'level1' && l1InputRef.current) {
            l1InputRef.current.focus();
        }
    }, [screen, l1Target]);

    useEffect(() => {
        if (screen === 'level2-flash' && flashState === 'question' && l2FlashInputRef.current) {
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
        setPanelShake(false);

        if (levelNum === 1) {
            setL1Score(0);
            setL1Input("");
            setScoreLabel("TYPED");
            setScoreVal("0/20");
            setProgressPercentage(0);
            generateNextLevel1Word("");
            setScreen('level1');

        } else if (levelNum === 2) {
            setScoreLabel("PURGED");
            setScreen('level3-translation');
            setupLevel2Pasture();

        } else if (levelNum === 3) {
            setTimer(45);
            setScoreLabel("Letters Snapped");
            setScoreVal("0/4");
            setProgressPercentage(0);
            setL3FusionWin(false);
            setScreen('level4-spelling');
            setupLevel3SpellingBoard();

        } else if (levelNum === 4) {
            setFlashScore(0);
            setScoreLabel("FLASHED");
            setScoreVal("0/5");
            setProgressPercentage(0);
            setScreen('level2-flash');
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
            setTimer(20);
            setClickerScore(0);
            setScoreLabel("CLICKS");
            setScoreVal("0/3");
            setProgressPercentage(0);
            setScreen('level6-clicker');
        }
    };

    const handleLevelWin = (nextLevel: number) => {
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
            triggerScreenSparks();
        }, 2400);
        setTimeout(() => {
            startLevel(1);
        }, 4200);
    };

    // ==========================================
    // LEVEL 1: TYPING FRENZY
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
        setTotalImpostors(fakes.length);
        setScoreVal(`0/${fakes.length}`);
        setProgressPercentage(0);
    };

    const handleLevel2CowClick = (cow: L2Cow) => {
        if (cow.zapping || cow.wrongClick) return;

        if (cow.isImpostor) {
            // Purged successfully
            getSynth().playZap();
            setL2Cows(prev => prev.map(c => c.id === cow.id ? { ...c, zapping: true } : c));
            
            const nextPurged = purgedCount + 1;
            setPurgedCount(nextPurged);
            setScoreVal(`${nextPurged}/${totalImpostors}`);
            setProgressPercentage((nextPurged / totalImpostors) * 100);

            setTimeout(() => {
                setL2Cows(prev => prev.filter(c => c.id !== cow.id));
                if (nextPurged >= totalImpostors) {
                    handleLevelWin(3); // Advance to Level 3 (Spelling)
                }
            }, 380);
        } else {
            // Clicked valid win translation (Mistake)
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
        if (screen !== 'level4-spelling') return;

        const filledSlots = l3Slots.filter(s => s !== null);
        setScoreVal(`${filledSlots.length}/4`);
        setProgressPercentage((filledSlots.length / 4) * 100);

        if (filledSlots.length === 4) {
            const spelled = l3Slots.map(s => s?.char).join('');
            if (spelled === 'Win!') {
                // VICTORY FUSION
                setTimer(999);
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
                handleGameVictory();
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
 ___________________
&lt; <span id="l1-target-word">{l1Target}</span>{padSpaces}&gt;
 -------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
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
 ________________
&lt; {activeText}{padSpaces}&gt;
 ----------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
</pre>
        );
    };

    const renderIntroCow = () => {
        if (introFrame === 1) {
            return (
<pre className="ascii-art" style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
             *crunch*
      ^__^  /
     (..)\\\\_______
     (__)\\\\       )\\/\\
      \\/ ||----w |
         ||     ||  vvvv
</pre>
            );
        }
        if (introFrame === 2) {
            return (
<pre className="ascii-art" style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
             *munch*
      ^__^  /
     (--)\\\\_______
     (__)\\\\       )\\/\\
      \\/ ||----w |
         ||     ||  vv
</pre>
            );
        }
        if (introFrame === 3) {
            return (
<pre className="ascii-art" style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
             


      ^__^  
     (oo)\\_______
     (__)\\       )\\/\\
        ||----w |
        ||     ||
</pre>
            );
        }
        return (
<pre className="ascii-art" style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>
 ________________
&lt;      WIN!      &gt;
 ----------------
        \\\\   ^__^
         \\\\  (★★)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
</pre>
        );
    };

    const isGameScreenActive = ['level1', 'level2-flash', 'level3-translation', 'level4-spelling', 'level5-morse', 'level6-clicker'].includes(screen);

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
                        <button onClick={handleSkipLevel} className="btn-secondary" title="Skip Level">
                            Skip Level ⏭️
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
                        <p className="subtitle">A 3-stage game of typing, translation, and letters merging.</p>
                        
                        <div className="ascii-cow-wrapper">
                            <pre className="ascii-art">
 ____________________
&lt; PLAY COWSAY GAME! &gt;
 --------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
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

                    {/* SCREEN: LEVEL 1 (TYPING) */}
                    <section className={`screen ${screen === 'level1' ? 'active' : ''}`}>
                        <h2>Level 1: Typing</h2>
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

                    {/* SCREEN: LEVEL 2 (TRANSLATION PURGE) */}
                    <section className={`screen ${screen === 'level3-translation' ? 'active' : ''}`}>
                        <h2>Level 2: Translation</h2>
                        <p className="subtitle">Zap cows that do NOT say "Win!" in another language.</p>

                        <div className="pasture-grid">
                            {l2Cows.map(cow => (
                                <div
                                    key={cow.id}
                                    onClick={() => handleLevel2CowClick(cow)}
                                    className={`pasture-cow ${cow.zapping ? 'zapping' : ''} ${cow.wrongClick ? 'wrong-click' : ''}`}
                                >
                                    <div className="bubble">{cow.text}</div>
                                    <pre className="ascii-art" style={{ fontSize: "0.75rem", lineHeight: 1.15, width: "fit-content", margin: "0 auto" }}>
                                         (oo)
                                        /---\\\\
                                        *   *
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 3 (SPELLING BOARD) */}
                    <section className={`screen ${screen === 'level4-spelling' ? 'active' : ''}`}>
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
                                        <pre className="ascii-art" style={{ fontSize: "0.6rem", lineHeight: 1.2 }}>
                                           _____
                                          &lt;  {slot.char}  &gt;
                                           -----
                                             \\   ^__^
                                              \\ (oo)\\___
                                                (__)\\   )\\/\\
                                                    ||-w|
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
                                        <pre className="ascii-art" style={{ fontSize: "0.7rem", lineHeight: 1.2 }}>
                                           _____
                                          &lt;  {letter.char}  &gt;
                                           -----
                                             \\   ^__^
                                              \\ (oo)\\___
                                                (__)\\   )\\/\\
                                                    ||-w|
                                        </pre>
                                    </div>
                                ))
                            ) : (
                                <div className="ascii-cow-wrapper text-center victory-cow" style={{ width: "100%" }}>
                                    <pre className="ascii-art">
 ___________________
&lt; Win!              &gt;
 -------------------
        \\   ^__^
         \\  (★★)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
                                    </pre>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SCREEN: LEVEL 4 (FLASH MEMORY) */}
                    <section className={`screen ${screen === 'level2-flash' ? 'active' : ''}`}>
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
                    <section className={`screen ${screen === 'level5-morse' ? 'active' : ''}`}>
                        <h2>Level 5: Morse Code</h2>
                        <p className="subtitle">Translate the word into Morse (spaces between letters).</p>

                        <div className={`ascii-cow-wrapper ${morseSuccess ? 'success-flash' : ''} ${morseFail ? 'fail-flash' : ''}`}>
                            <pre className="ascii-art">
 ________________
&lt; Translate: {morseTargets[morseTargetIdx] ?? ""} &gt;
 ----------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
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

                        {renderMorseChart()}
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
 ________________
&lt; {clickerWord}            &gt;
 ----------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
                            </pre>
                        </div>
                    </section>

                    {/* SCREEN: GAME OVER */}
                    <section className={`screen ${screen === 'gameover' ? 'active' : ''}`}>
                        <h2 className="error-title">Fail</h2>
                        <p className="subtitle">{gameoverReason}</p>
                        
                        <div className="ascii-cow-wrapper error-cow">
                            <pre className="ascii-art">
 ___________________
&lt; MOOO-ve along... &gt;
 -------------------
        \\   ^__^
         \\  (xx)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
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
 _______________________________________
&lt; WINNER! COWSAY RULES THE PASTURE! &gt;
 ---------------------------------------
        \\   ^__^
         \\  (★☆)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
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
