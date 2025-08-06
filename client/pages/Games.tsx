import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  Heart,
  Gamepad2,
  Wind,
  Palette,
  Music,
  Puzzle,
  Target,
  Zap,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Award,
  Timer,
  Hammer
} from 'lucide-react';

// Game Sound System
class GameSounds {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported');
      this.isEnabled = false;
    }
  }

  private resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Create different types of sounds
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.audioContext || !this.isEnabled) return;

    this.resumeAudioContext();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Game-specific sounds
  playClick() {
    this.createTone(800, 0.1, 'square', 0.05);
  }

  playSuccess() {
    this.createTone(523, 0.2, 'sine', 0.1); // C note
    setTimeout(() => this.createTone(659, 0.2, 'sine', 0.1), 100); // E note
    setTimeout(() => this.createTone(784, 0.3, 'sine', 0.1), 200); // G note
  }

  playError() {
    this.createTone(200, 0.3, 'sawtooth', 0.08);
  }

  playBreathIn() {
    if (!this.audioContext || !this.isEnabled) return;
    this.resumeAudioContext();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(400, this.audioContext.currentTime + 4);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 3.5);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 4);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 4);
  }

  playBreathOut() {
    if (!this.audioContext || !this.isEnabled) return;
    this.resumeAudioContext();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(200, this.audioContext.currentTime + 6);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 5.5);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 6);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 6);
  }

  playBrushStroke() {
    // Simulate brush stroke with filtered noise
    if (!this.audioContext || !this.isEnabled) return;
    this.resumeAudioContext();

    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);

    source.start();
  }

  playBeat(pitch: number = 1) {
    this.createTone(60 * pitch, 0.1, 'square', 0.08);
    // Add a quick high-hat sound
    setTimeout(() => {
      this.createTone(800 * pitch, 0.05, 'square', 0.03);
    }, 50);
  }

  playBubblePop() {
    this.createTone(800, 0.05, 'sine', 0.06);
    setTimeout(() => this.createTone(600, 0.05, 'sine', 0.04), 50);
    setTimeout(() => this.createTone(400, 0.1, 'sine', 0.02), 100);
  }

  playTargetHit() {
    this.createTone(1000, 0.1, 'square', 0.06);
    setTimeout(() => this.createTone(1200, 0.1, 'square', 0.04), 50);
  }

  playSmash() {
    // Create a satisfying smash sound with multiple layers
    this.createTone(80, 0.2, 'sawtooth', 0.1); // Deep impact
    setTimeout(() => this.createTone(200, 0.15, 'square', 0.08), 10); // Crack
    setTimeout(() => this.createTone(400, 0.1, 'triangle', 0.06), 30); // Shatter
    setTimeout(() => this.createTone(800, 0.05, 'sine', 0.04), 50); // High sparkle
  }

  playCrush() {
    // Heavy crushing sound
    this.createTone(60, 0.3, 'sawtooth', 0.12);
    setTimeout(() => this.createTone(120, 0.2, 'square', 0.08), 50);
  }

  playPowerSmash() {
    // Extra powerful smash for combo hits
    this.createTone(40, 0.3, 'sawtooth', 0.15); // Very deep impact
    setTimeout(() => this.createTone(100, 0.25, 'square', 0.12), 20);
    setTimeout(() => this.createTone(300, 0.2, 'triangle', 0.08), 50);
    setTimeout(() => this.createTone(600, 0.15, 'sine', 0.06), 80);
    setTimeout(() => this.createTone(1200, 0.1, 'sine', 0.04), 120);
  }

  playPattern(correct: boolean) {
    if (correct) {
      this.createTone(523, 0.15, 'sine', 0.08); // C
      setTimeout(() => this.createTone(659, 0.15, 'sine', 0.08), 100); // E
    } else {
      this.createTone(200, 0.2, 'square', 0.06);
    }
  }

  playAmbient(type: 'calm' | 'creative' | 'focus' | 'energetic') {
    if (!this.audioContext || !this.isEnabled) return;
    this.resumeAudioContext();

    const ambientSettings = {
      calm: { freq: 110, type: 'sine' as OscillatorType, volume: 0.02 },
      creative: { freq: 220, type: 'triangle' as OscillatorType, volume: 0.015 },
      focus: { freq: 80, type: 'sine' as OscillatorType, volume: 0.025 },
      energetic: { freq: 165, type: 'sawtooth' as OscillatorType, volume: 0.02 }
    };

    const settings = ambientSettings[type];

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(settings.freq, this.audioContext.currentTime);
    oscillator.type = settings.type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(settings.volume, this.audioContext.currentTime + 2);

    oscillator.start();

    // Return cleanup function
    return () => {
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 1);
      oscillator.stop(this.audioContext!.currentTime + 1);
    };
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

// Global sound instance
const gameSounds = new GameSounds();

interface Game {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'creative' | 'rhythm' | 'puzzle' | 'focus';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  icon: React.ReactNode;
  color: string;
  moodBoost: string;
}

type GameCategory = 'all' | 'breathing' | 'creative' | 'rhythm' | 'puzzle' | 'focus';
type ActiveGame = string | null;

const games: Game[] = [
  {
    id: 'breath-flow',
    title: 'Breath Flow',
    description: 'Guided breathing with beautiful visual patterns',
    category: 'breathing',
    difficulty: 'easy',
    duration: '3-10 min',
    icon: <Wind className="w-6 h-6" />,
    color: 'from-mood-calm to-emerald-400',
    moodBoost: 'Reduces anxiety, increases calm'
  },
  {
    id: 'mood-paint',
    title: 'Mood Paint',
    description: 'Express your emotions through color therapy',
    category: 'creative',
    difficulty: 'easy',
    duration: '5-15 min',
    icon: <Palette className="w-6 h-6" />,
    color: 'from-mood-happy to-amber-400',
    moodBoost: 'Boosts creativity, releases stress'
  },
  {
    id: 'rhythm-zen',
    title: 'Rhythm Zen',
    description: 'Tap to calming beats and find your flow',
    category: 'rhythm',
    difficulty: 'medium',
    duration: '2-8 min',
    icon: <Music className="w-6 h-6" />,
    color: 'from-luminix-neon to-blue-400',
    moodBoost: 'Improves focus, energizes mood'
  },
  {
    id: 'pattern-peace',
    title: 'Pattern Peace',
    description: 'Match patterns to achieve mindful focus',
    category: 'puzzle',
    difficulty: 'medium',
    duration: '3-12 min',
    icon: <Puzzle className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    moodBoost: 'Enhances concentration, calms mind'
  },
  {
    id: 'focus-flow',
    title: 'Focus Flow',
    description: 'Target-based meditation and attention training',
    category: 'focus',
    difficulty: 'hard',
    duration: '5-20 min',
    icon: <Target className="w-6 h-6" />,
    color: 'from-mood-angry to-orange-400',
    moodBoost: 'Builds focus, reduces scattered thoughts'
  },
  {
    id: 'emotion-burst',
    title: 'Emotion Burst',
    description: 'Pop bubbles to release negative emotions',
    category: 'creative',
    difficulty: 'easy',
    duration: '2-5 min',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-mood-happy to-yellow-400',
    moodBoost: 'Quick stress relief, instant joy'
  },
  {
    id: 'stress-crusher',
    title: 'Stress Crusher',
    description: 'Smash stress objects for instant satisfaction',
    category: 'creative',
    difficulty: 'easy',
    duration: '1-5 min',
    icon: <Hammer className="w-6 h-6" />,
    color: 'from-red-500 to-orange-400',
    moodBoost: 'Releases tension, instant stress relief'
  }
];

const categories = [
  { id: 'all', label: 'All Games', icon: <Gamepad2 className="w-5 h-5" />, color: 'luminix-green' },
  { id: 'breathing', label: 'Breathing', icon: <Wind className="w-5 h-5" />, color: 'mood-calm' },
  { id: 'creative', label: 'Creative', icon: <Palette className="w-5 h-5" />, color: 'mood-happy' },
  { id: 'rhythm', label: 'Rhythm', icon: <Music className="w-5 h-5" />, color: 'luminix-neon' },
  { id: 'puzzle', label: 'Puzzle', icon: <Puzzle className="w-5 h-5" />, color: 'purple-500' },
  { id: 'focus', label: 'Focus', icon: <Target className="w-5 h-5" />, color: 'mood-angry' }
];

// Breathing Game Component
const BreathingGame = ({ onClose }: { onClose: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const ambientCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying) {
      timer = setInterval(() => {
        setCount(prev => {
          if (prev <= 1) {
            if (phase === 'inhale') {
              setPhase('hold');
              return 2;
            } else if (phase === 'hold') {
              setPhase('exhale');
              gameSounds.playBreathOut(); // Play breath out sound
              return 4;
            } else {
              setPhase('inhale');
              gameSounds.playBreathIn(); // Play breath in sound
              setCycles(c => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isPlaying, phase]);

  // Start/stop ambient sounds for breathing
  useEffect(() => {
    if (isPlaying) {
      ambientCleanup.current = gameSounds.playAmbient('calm');
    } else if (ambientCleanup.current) {
      ambientCleanup.current();
      ambientCleanup.current = null;
    }

    return () => {
      if (ambientCleanup.current) {
        ambientCleanup.current();
      }
    };
  }, [isPlaying]);

  const phaseConfig = {
    inhale: { text: 'Breathe In', color: 'from-mood-calm to-emerald-400', scale: 1.3 },
    hold: { text: 'Hold', color: 'from-luminix-neon to-blue-400', scale: 1.3 },
    exhale: { text: 'Breathe Out', color: 'from-purple-500 to-pink-500', scale: 0.7 }
  };

  const current = phaseConfig[phase];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-luminix-bg/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log('Clicked overlay background - closing Breathing Game');
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="card-glass max-w-lg w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-luminix-text">Breath Flow</h2>
          <motion.button
            onClick={() => {
              console.log('Breath Flow close button clicked');
              onClose();
            }}
            className="btn-glass text-sm p-3 hover:bg-red-500/20 transition-colors z-10 relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </div>

        {/* Breathing Circle */}
        <div className="relative mb-8">
          <motion.div
            animate={{ 
              scale: current.scale,
              rotate: 360
            }}
            transition={{ 
              scale: { duration: count, ease: "easeInOut" },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
            className={`w-48 h-48 mx-auto rounded-full bg-gradient-to-br ${current.color} opacity-20 blur-sm`}
          />
          <motion.div
            animate={{ scale: current.scale }}
            transition={{ duration: count, ease: "easeInOut" }}
            className={`absolute inset-0 w-48 h-48 mx-auto rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center`}
          >
            <div className="text-center text-luminix-bg">
              <div className="text-3xl font-bold mb-2">{count}</div>
              <div className="text-lg">{current.text}</div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-luminix-green font-bold text-xl">{cycles}</div>
            <div className="text-luminix-text-muted text-sm">Cycles</div>
          </div>
          <div className="text-center">
            <div className="text-luminix-neon font-bold text-xl">{Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</div>
            <div className="text-luminix-text-muted text-sm">Time</div>
          </div>
          <div className="text-center">
            <div className="text-mood-calm font-bold text-xl">{Math.floor(cycles * 0.8 + sessionTime * 0.1)}</div>
            <div className="text-luminix-text-muted text-sm">Points</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-luminix flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isPlaying ? 'Pause' : 'Start'}</span>
          </motion.button>
          
          <motion.button
            onClick={() => {
              setIsPlaying(false);
              setCycles(0);
              setSessionTime(0);
              setPhase('inhale');
              setCount(4);
            }}
            className="btn-glass flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Mood Paint Game Component
const MoodPaintGame = ({ onClose }: { onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#22d3ee');
  const [brushSize, setBrushSize] = useState(10);
  const [strokes, setStrokes] = useState(0);

  const colors = [
    { color: '#22d3ee', mood: 'Calm', label: 'Cyan' },
    { color: '#10b981', mood: 'Peaceful', label: 'Green' },
    { color: '#f59e0b', mood: 'Happy', label: 'Yellow' },
    { color: '#ef4444', mood: 'Energetic', label: 'Red' },
    { color: '#8b5cf6', mood: 'Creative', label: 'Purple' },
    { color: '#ec4899', mood: 'Playful', label: 'Pink' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fill with dark background
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = currentColor;
    ctx.shadowColor = currentColor;
    ctx.shadowBlur = 10;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    setStrokes(prev => prev + 1);

    // Play brush stroke sound
    if (Math.random() > 0.7) { // Don't play too often to avoid spam
      gameSounds.playBrushStroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStrokes(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-luminix-bg/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        // Close if clicking the overlay background
        if (e.target === e.currentTarget) {
          console.log('Clicked overlay background - closing Mood Paint');
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="card-glass max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the game content
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-luminix-text">Mood Paint</h2>
          <motion.button
            onClick={() => {
              console.log('Mood Paint close button clicked');
              onClose();
            }}
            className="btn-glass text-sm p-3 hover:bg-red-500/20 transition-colors z-10 relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-3">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-64 lg:h-80 bg-luminix-bg-darker rounded-lg border border-luminix-surface cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
            />
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Color Palette */}
            <div>
              <h3 className="text-lg font-semibold text-luminix-text mb-3">Mood Colors</h3>
              <div className="grid grid-cols-2 gap-2">
                {colors.map((colorItem) => (
                  <motion.button
                    key={colorItem.color}
                    onClick={() => {
                      setCurrentColor(colorItem.color);
                      gameSounds.playClick();
                    }}
                    className={`p-3 rounded-lg border-2 ${
                      currentColor === colorItem.color 
                        ? 'border-luminix-neon' 
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: colorItem.color }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-white text-xs font-medium">{colorItem.label}</div>
                    <div className="text-white/80 text-xs">{colorItem.mood}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Brush Size */}
            <div>
              <h3 className="text-lg font-semibold text-luminix-text mb-3">Brush Size</h3>
              <input
                type="range"
                min="5"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-luminix-text-muted mt-2">{brushSize}px</div>
            </div>

            {/* Stats */}
            <div className="glass-subtle rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-luminix-green mb-1">{strokes}</div>
                <div className="text-luminix-text-muted text-sm">Brush Strokes</div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <motion.button
                onClick={() => {
                  clearCanvas();
                  gameSounds.playClick();
                }}
                className="w-full btn-glass"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear Canvas
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Rhythm Zen Game Component
const RhythmZenGame = ({ onClose }: { onClose: () => void }) => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const ambientCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = (prev + 1) % 4;
          // Play beat sound for visual beat indicator
          gameSounds.playBeat(0.5 + (nextBeat * 0.1));
          return nextBeat;
        });
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Start/stop ambient sounds for rhythm
  useEffect(() => {
    if (isPlaying) {
      ambientCleanup.current = gameSounds.playAmbient('energetic');
    } else if (ambientCleanup.current) {
      ambientCleanup.current();
      ambientCleanup.current = null;
    }

    return () => {
      if (ambientCleanup.current) {
        ambientCleanup.current();
      }
    };
  }, [isPlaying]);

  const handleBeatTap = () => {
    setScore(prev => prev + 10);
    setStreak(prev => prev + 1);
    gameSounds.playBeat(1 + (currentBeat * 0.1)); // Different pitch for each beat
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-luminix-bg/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="card-glass max-w-2xl w-full text-center"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-luminix-text">Rhythm Zen</h2>
          <motion.button
            onClick={() => {
              console.log('Rhythm Zen close button clicked');
              onClose();
            }}
            className="btn-glass text-sm p-3 hover:bg-red-500/20 transition-colors z-10 relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-luminix-neon">{score}</div>
            <div className="text-luminix-text-muted">Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-luminix-green">{streak}</div>
            <div className="text-luminix-text-muted">Streak</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((beat) => (
            <motion.button
              key={beat}
              onClick={handleBeatTap}
              className={`w-16 h-16 rounded-full ${
                currentBeat === beat ? 'bg-luminix-neon' : 'bg-luminix-surface'
              }`}
              animate={currentBeat === beat ? { scale: [1, 1.2, 1] } : {}}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        <motion.button
          onClick={() => setIsPlaying(!isPlaying)}
          className="btn-luminix"
          whileHover={{ scale: 1.05 }}
        >
          {isPlaying ? 'Pause' : 'Start'} Rhythm
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// Pattern Peace Game Component
const PatternPeaceGame = ({ onClose }: { onClose: () => void }) => {
  const [patterns, setPatterns] = useState<string[]>([]);
  const [userPattern, setUserPattern] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const colors = ['🔴', '🟡', '🟢', '🔵', '🟣'];

  const generatePattern = () => {
    const newPattern = [];
    for (let i = 0; i < level + 2; i++) {
      newPattern.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    setPatterns(newPattern);
    setUserPattern([]);
  };

  useEffect(() => {
    generatePattern();
  }, [level]);

  const handleColorClick = (color: string) => {
    const newUserPattern = [...userPattern, color];
    setUserPattern(newUserPattern);

    gameSounds.playClick(); // Play click sound

    if (newUserPattern.length === patterns.length) {
      if (JSON.stringify(newUserPattern) === JSON.stringify(patterns)) {
        setScore(prev => prev + level * 10);
        setLevel(prev => prev + 1);
        gameSounds.playPattern(true); // Success sound
      } else {
        setLevel(1);
        setScore(0);
        gameSounds.playPattern(false); // Error sound
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-luminix-bg/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="card-glass max-w-lg w-full text-center"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-luminix-text">Pattern Peace</h2>
          <motion.button
            onClick={() => {
              console.log('Pattern Peace close button clicked');
              onClose();
            }}
            className="btn-glass text-sm p-3 hover:bg-red-500/20 transition-colors z-10 relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-luminix-neon">Level {level}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-luminix-green">{score}</div>
            <div className="text-luminix-text-muted">Score</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-luminix-text mb-4">Remember this pattern:</h3>
          <div className="flex justify-center space-x-2 mb-4">
            {patterns.map((color, index) => (
              <span key={index} className="text-3xl">{color}</span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-luminix-text mb-4">Recreate it:</h3>
          <div className="flex justify-center space-x-2 mb-4">
            {userPattern.map((color, index) => (
              <span key={index} className="text-3xl">{color}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {colors.map((color) => (
            <motion.button
              key={color}
              onClick={() => handleColorClick(color)}
              className="text-4xl p-3 bg-luminix-surface rounded-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {color}
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={generatePattern}
          className="btn-luminix"
          whileHover={{ scale: 1.05 }}
        >
          New Pattern
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// Focus Flow Game Component
const FocusFlowGame = ({ onClose }: { onClose: () => void }) => {
  const [targets, setTargets] = useState<{id: number, x: number, y: number}[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const ambientCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setTargets(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 80,
          y: Math.random() * 60
        }]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  // Start/stop ambient sounds for focus
  useEffect(() => {
    if (isActive) {
      ambientCleanup.current = gameSounds.playAmbient('focus');
    } else if (ambientCleanup.current) {
      ambientCleanup.current();
      ambientCleanup.current = null;
    }

    return () => {
      if (ambientCleanup.current) {
        ambientCleanup.current();
      }
    };
  }, [isActive]);

  const hitTarget = (id: number) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    setScore(prev => prev + 10);
    gameSounds.playTargetHit(); // Play target hit sound
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-luminix-bg/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="card-glass max-w-4xl w-full h-96"
      >
        <div className="flex items-center justify-between mb-4 p-4">
          <h2 className="text-2xl font-bold text-luminix-text">Focus Flow</h2>
          <div className="flex items-center space-x-4">
            <div className="text-luminix-green font-bold">Score: {score}</div>
            <div className="text-luminix-neon font-bold">Time: {timeLeft}s</div>
            <motion.button
              onClick={() => {
                console.log('Focus Flow close button clicked');
                onClose();
              }}
              className="btn-glass text-sm p-3 hover:bg-red-500/20 transition-colors z-10 relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </div>
        </div>

        <div className="relative h-64 bg-luminix-surface/30 rounded-lg m-4 overflow-hidden">
          {targets.map((target) => (
            <motion.button
              key={target.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => hitTarget(target.id)}
              className="absolute w-8 h-8 bg-luminix-neon rounded-full"
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        <div className="p-4 text-center">
          <motion.button
            onClick={() => setIsActive(!isActive)}
            className="btn-luminix"
            whileHover={{ scale: 1.05 }}
          >
            {isActive ? 'Pause' : 'Start'} Focus Training
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Emotion Burst Game Component
const EmotionBurstGame = ({ onClose }: { onClose: () => void }) => {
  const [bubbles, setBubbles] = useState<{id: number, x: number, y: number, emotion: string, color: string}[]>([]);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const ambientCleanup = useRef<(() => void) | null>(null);

  const emotions = [
    { emoji: '😤', color: 'bg-red-500', points: 15, name: 'anger' },
    { emoji: '😰', color: 'bg-blue-500', points: 10, name: 'worry' },
    { emoji: '😔', color: 'bg-gray-500', points: 12, name: 'sadness' },
    { emoji: '😖', color: 'bg-yellow-500', points: 8, name: 'stress' }
  ];

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        setBubbles(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 90,
          y: 100,
          emotion: emotion.emoji,
          color: emotion.color
        }]);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setBubbles(prev => prev.map(bubble => ({
        ...bubble,
        y: bubble.y - 2
      })).filter(bubble => bubble.y > -10));
    }, 50);
    return () => clearInterval(animationInterval);
  }, []);

  // Start/stop ambient sounds for emotion burst
  useEffect(() => {
    if (isActive) {
      ambientCleanup.current = gameSounds.playAmbient('creative');
    } else if (ambientCleanup.current) {
      ambientCleanup.current();
      ambientCleanup.current = null;
    }

    return () => {
      if (ambientCleanup.current) {
        ambientCleanup.current();
      }
    };
  }, [isActive]);

  const popBubble = (id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(prev => prev + 10);
    gameSounds.playBubblePop(); // Play bubble pop sound
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-luminix-bg/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="card-glass max-w-2xl w-full h-96"
      >
        <div className="flex items-center justify-between mb-4 p-4">
          <h2 className="text-2xl font-bold text-luminix-text">Emotion Burst</h2>
          <div className="flex items-center space-x-4">
            <div className="text-luminix-green font-bold">Released: {score}</div>
            <motion.button
              onClick={() => {
                console.log('Emotion Burst close button clicked');
                onClose();
              }}
              className="btn-glass text-sm p-3 hover:bg-red-500/20 transition-colors z-10 relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </div>
        </div>

        <div className="relative h-64 bg-gradient-to-b from-luminix-surface/30 to-luminix-bg rounded-lg m-4 overflow-hidden">
          {bubbles.map((bubble) => (
            <motion.button
              key={bubble.id}
              onClick={() => popBubble(bubble.id)}
              className={`absolute w-12 h-12 ${bubble.color} rounded-full flex items-center justify-center text-xl shadow-lg`}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              whileHover={{ scale: 1.2 }}
              animate={{
                y: [0, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                y: { duration: 2, repeat: Infinity },
                scale: { duration: 1, repeat: Infinity }
              }}
            >
              {bubble.emotion}
            </motion.button>
          ))}
        </div>

        <div className="p-4 text-center">
          <p className="text-luminix-text-muted mb-4">Pop the negative emotion bubbles to release stress!</p>
          <motion.button
            onClick={() => setIsActive(!isActive)}
            className="btn-luminix"
            whileHover={{ scale: 1.05 }}
          >
            {isActive ? 'Pause' : 'Start'} Emotion Release
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Stress Crusher Game Component
const StressCrusherGame = ({ onClose }: { onClose: () => void }) => {
  const [stressObjects, setStressObjects] = useState<{
    id: number;
    x: number;
    y: number;
    type: string;
    size: number;
    health: number;
    maxHealth: number;
  }[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const ambientCleanup = useRef<(() => void) | null>(null);

  const stressTypes = [
    { emoji: '😡', name: 'anger', points: 10, health: 1 },
    { emoji: '😰', name: 'worry', points: 15, health: 2 },
    { emoji: '💀', name: 'burnout', points: 25, health: 3 }
  ];

  // Timer countdown
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, timeLeft]);

  // Spawn stress objects
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        if (stressObjects.length < 6) {
          const stressType = stressTypes[Math.floor(Math.random() * stressTypes.length)];
          setStressObjects(prev => [...prev, {
            id: Date.now() + Math.random(),
            x: Math.random() * 80,
            y: Math.random() * 60,
            type: stressType.emoji,
            size: 50,
            health: stressType.health,
            maxHealth: stressType.health
          }]);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isActive, stressObjects.length]);

  // Start/stop ambient sounds
  useEffect(() => {
    if (isActive) {
      ambientCleanup.current = gameSounds.playAmbient('energetic');
    } else if (ambientCleanup.current) {
      ambientCleanup.current();
      ambientCleanup.current = null;
    }

    return () => {
      if (ambientCleanup.current) {
        ambientCleanup.current();
      }
    };
  }, [isActive]);

  const crushStress = (id: number) => {
    setStressObjects(prev => {
      return prev.map(obj => {
        if (obj.id === id) {
          const newHealth = obj.health - 1;
          if (newHealth <= 0) {
            // Object destroyed
            const points = 10 + (combo * 5);
            setScore(s => s + points);
            setCombo(c => c + 1);

            // Play sound
            if (combo >= 3) {
              gameSounds.playPowerSmash();
            } else {
              gameSounds.playSmash();
            }

            return null;
          } else {
            gameSounds.playClick();
            return { ...obj, health: newHealth };
          }
        }
        return obj;
      }).filter((obj): obj is NonNullable<typeof obj> => obj !== null);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-luminix-bg/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="card-glass max-w-4xl w-full h-96"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 p-4">
          <h2 className="text-2xl font-bold text-luminix-text">Stress Crusher</h2>
          <div className="flex items-center space-x-4">
            <div className="text-luminix-green font-bold">Score: {score}</div>
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-luminix-neon font-bold"
              >
                {combo}x Combo!
              </motion.div>
            )}
            <div className="text-luminix-text font-bold">Time: {timeLeft}s</div>
            <motion.button
              onClick={onClose}
              className="btn-glass text-sm p-3 hover:bg-red-500/20 transition-colors z-10 relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </div>
        </div>

        <div className="relative h-64 bg-gradient-to-b from-red-900/20 to-orange-900/20 rounded-lg m-4 overflow-hidden border-2 border-red-500/30">
          {/* Stress Objects */}
          {stressObjects.map((obj) => (
            <motion.button
              key={obj.id}
              onClick={() => crushStress(obj.id)}
              className="absolute w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-2xl shadow-lg cursor-pointer"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.7 }}
              animate={{
                rotate: [0, 5, -5, 0],
                scale: obj.health < obj.maxHealth ? [1, 1.1, 1] : 1
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity },
                scale: { duration: 0.5, repeat: obj.health < obj.maxHealth ? Infinity : 0 }
              }}
            >
              {obj.type}
            </motion.button>
          ))}

          {/* Game instructions */}
          {stressObjects.length === 0 && isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-luminix-text-muted text-lg">Stress objects incoming...</p>
            </div>
          )}
        </div>

        <div className="p-4 text-center">
          <p className="text-luminix-text-muted mb-4">
            {isActive ? 'Smash the stress! Click rapidly for combos!' : 'Ready to crush some stress?'}
          </p>
          <motion.button
            onClick={() => setIsActive(!isActive)}
            className="btn-luminix"
            whileHover={{ scale: 1.05 }}
          >
            {isActive ? 'Pause Crushing' : 'Start Crushing!'}
          </motion.button>

          <div className="mt-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg p-3">
            <p className="text-luminix-text-muted text-xs">
              💡 Take deep breaths between smashes - you're releasing real stress with every hit!
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Games() {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const renderGame = () => {
    switch (activeGame) {
      case 'breath-flow':
        return <BreathingGame onClose={() => setActiveGame(null)} />;
      case 'mood-paint':
        return <MoodPaintGame onClose={() => setActiveGame(null)} />;
      case 'rhythm-zen':
        return <RhythmZenGame onClose={() => setActiveGame(null)} />;
      case 'pattern-peace':
        return <PatternPeaceGame onClose={() => setActiveGame(null)} />;
      case 'focus-flow':
        return <FocusFlowGame onClose={() => setActiveGame(null)} />;
      case 'emotion-burst':
        return <EmotionBurstGame onClose={() => setActiveGame(null)} />;
      case 'stress-crusher':
        return <StressCrusherGame onClose={() => setActiveGame(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="ambient-orb"></div>
      <div className="ambient-orb"></div>
      <div className="ambient-orb"></div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-subtle border-b border-luminix-surface p-6"
      >
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4 group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-luminix-neon to-luminix-green flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-luminix-bg" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gradient-neon group-hover:scale-105 transition-transform">
              LUMINIX ECO MIND
            </h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => {
                const newState = gameSounds.toggle();
                setSoundEnabled(newState);
                gameSounds.playClick();
              }}
              className={`glass-subtle rounded-lg p-2 flex items-center space-x-2 transition-colors ${
                soundEnabled ? 'text-luminix-green' : 'text-luminix-text-muted'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Music className="w-5 h-5" />
              <span className="text-sm font-medium">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
            </motion.button>

            <div className="glass-subtle rounded-lg p-2 flex items-center space-x-2">
              <Award className="w-5 h-5 text-luminix-green" />
              <span className="text-luminix-text font-medium">Level 5</span>
            </div>
            <div className="glass-subtle rounded-lg p-2 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-luminix-neon" />
              <span className="text-luminix-text font-medium">1,247 XP</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-4xl font-bold text-gradient-neon mb-4"
            animate={{ 
              textShadow: [
                "0 0 20px rgba(34, 211, 238, 0.5)",
                "0 0 40px rgba(34, 211, 238, 0.8)",
                "0 0 20px rgba(34, 211, 238, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Mood Games Collection
          </motion.h1>
          <p className="text-xl text-luminix-text-muted">
            Play your way to better mental wellness with 20+ therapeutic games
          </p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as GameCategory)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'glass-strong neon-border text-luminix-text'
                  : 'glass text-luminix-text-muted hover:text-luminix-text'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.icon}
              <span>{category.label}</span>
              {selectedCategory === category.id && (
                <motion.div
                  layoutId="category-indicator"
                  className="w-2 h-2 bg-luminix-neon rounded-full"
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Games grid */}
        <motion.div
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="card-glass group cursor-pointer overflow-hidden"
                onClick={() => setActiveGame(game.id)}
              >
                {/* Game header */}
                <div className={`relative h-32 bg-gradient-to-br ${game.color} rounded-lg mb-4 flex items-center justify-center overflow-hidden`}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 opacity-10"
                  >
                    <div className="w-full h-full bg-gradient-to-r from-white/20 to-transparent" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="relative z-10 text-white"
                  >
                    {game.icon}
                  </motion.div>
                  
                  {/* Difficulty badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      game.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                      game.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {game.difficulty}
                    </span>
                  </div>
                </div>

                {/* Game info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-luminix-text group-hover:text-gradient-neon transition-all">
                      {game.title}
                    </h3>
                    <div className="flex items-center space-x-1 text-luminix-text-muted">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm">{game.duration}</span>
                    </div>
                  </div>
                  
                  <p className="text-luminix-text-muted leading-relaxed">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-luminix-green">
                      💡 {game.moodBoost}
                    </span>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="text-luminix-neon"
                    >
                      <Play className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Coming soon games */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-gradient-neon text-center mb-12">
            More Games Coming Soon
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              'Memory Matrix', 'Emotion Bubbles', 'Zen Garden', 'Rhythm Therapy',
              'Color Flow', 'Mind Maze', 'Stress Crusher', 'Balance Beam'
            ].map((title, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="glass-subtle rounded-lg p-6 text-center"
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-luminix-neon to-luminix-green rounded-lg flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6 text-luminix-bg" />
                </motion.div>
                <h3 className="text-luminix-text font-medium">{title}</h3>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Active game overlay */}
      <AnimatePresence>
        {activeGame && renderGame()}
      </AnimatePresence>
    </div>
  );
}
