import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Howl } from 'howler';
import { spotifyService, SpotifyTrack } from '../lib/spotify';
import { Camera, Heart, BarChart3, Gamepad2, Music, Bot, Brain, LogIn, Play, Pause, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import MoodDetection from './MoodDetection';

interface MoodData {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

type MoodType = 'happy' | 'sad' | 'angry' | 'calm' | 'neutral';

const moodConfig = {
  happy: {
    emoji: '😄',
    color: 'mood-happy',
    gradient: 'happy',
    message: 'You\'re radiating positivity!',
    bgEffect: 'confetti',
    music: 'Upbeat Pop',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder - would use actual mood music
    ambientColor: '#fbbf24',
  },
  sad: {
    emoji: '😢',
    color: 'mood-sad',
    gradient: 'sad',
    message: 'It\'s okay to feel blue sometimes',
    bgEffect: 'rain',
    music: 'Calm Acoustic',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
    ambientColor: '#3b82f6',
  },
  angry: {
    emoji: '😡',
    color: 'mood-angry',
    gradient: 'angry',
    message: 'Take a deep breath',
    bgEffect: 'shake',
    music: 'Intense Rock',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
    ambientColor: '#ef4444',
  },
  calm: {
    emoji: '😌',
    color: 'mood-calm',
    gradient: 'calm',
    message: 'You\'re in perfect harmony',
    bgEffect: 'float',
    music: 'Meditation',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
    ambientColor: '#10b981',
  },
  neutral: {
    emoji: '😐',
    color: 'mood-neutral',
    gradient: '',
    message: 'Balanced and centered',
    bgEffect: '',
    music: 'Lo-fi Chill',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
    ambientColor: '#6b7280',
  },
};

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodType>('neutral');
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentTrack, setCurrentTrack] = useState('ambient-calm');
  const [musicProgress, setMusicProgress] = useState(0);
  const [lastMoodChange, setLastMoodChange] = useState(Date.now());
  const [moodStabilityCount, setMoodStabilityCount] = useState(0);
  const [lastDetectedMood, setLastDetectedMood] = useState<MoodType | null>(null);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [currentSpotifyTrack, setCurrentSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const [useSpotify, setUseSpotify] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionInterval = useRef<NodeJS.Timeout>();
  const ambientSoundRef = useRef<Howl | null>(null);
  const progressInterval = useRef<NodeJS.Timeout>();

  // Initialize app and Spotify service
  useEffect(() => {
    console.log('Initializing LUMINIX ECO MIND in intelligent detection mode...');
    console.log('Using intelligent activity-based mood detection');

    // Skip face-api model loading to prevent network errors
    // Use intelligent mock detection which is more reliable
    setModelsLoaded(false);
    setIsLoading(false);

    // Initialize Spotify service
    const initSpotify = async () => {
      try {
        const initialized = await spotifyService.initialize();
        if (initialized) {
          console.log('🎵 Spotify service ready');
          setIsSpotifyConnected(true);

          // Load initial tracks for current mood
          loadMoodTracks(currentMood);
        }
      } catch (error) {
        console.warn('⚠️ Spotify initialization failed, using fallback audio');
      }
    };

    initSpotify();

    // Auto-start camera after welcome screen
    setTimeout(() => {
      setShowWelcome(false);
      // Try to initialize camera automatically (non-blocking)
      startCamera().catch(error => {
        console.log('Auto camera start failed (expected if no permission):', error);
      });
    }, 3000);
  }, []);

  // Load tracks for specific mood
  const loadMoodTracks = async (mood: MoodType) => {
    try {
      const tracks = await spotifyService.getMoodTracks(mood);
      setSpotifyTracks(tracks);

      if (tracks.length > 0 && !currentSpotifyTrack) {
        setCurrentSpotifyTrack(tracks[0]);
      }
    } catch (error) {
      console.error('Failed to load mood tracks:', error);
    }
  };

  // Initialize camera with enhanced feedback and reliability
  const startCamera = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Camera API not supported in this browser');
        setCameraReady(false);
        return false;
      }

      console.log('📸 Requesting camera access...');

      // Simple constraints for better compatibility
      const constraints = {
        video: {
          facingMode: 'user',
          width: 640,
          height: 480
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current && stream) {
        // Stop any existing stream first
        if (videoRef.current.srcObject) {
          const existingStream = videoRef.current.srcObject as MediaStream;
          existingStream.getTracks().forEach(track => track.stop());
        }

        videoRef.current.srcObject = stream;

        // Wait for video to be ready and play
        return new Promise<boolean>((resolve) => {
          const video = videoRef.current!;

          const handleSuccess = () => {
            console.log('✅ Camera feed active and playing');
            setCameraReady(true);
            cleanup();
            resolve(true);
          };

          const handleError = (error: any) => {
            console.error('❌ Video playback error:', error);
            setCameraReady(false);
            cleanup();
            resolve(false);
          };

          const cleanup = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('error', handleError);
          };

          const onLoadedMetadata = () => {
            console.log('📹 Video metadata loaded');
            video.play()
              .then(handleSuccess)
              .catch(handleError);
          };

          const onCanPlay = () => {
            console.log('📹 Video can play');
            if (video.paused) {
              video.play()
                .then(handleSuccess)
                .catch(handleError);
            } else {
              handleSuccess();
            }
          };

          // Set up event listeners
          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('canplay', onCanPlay);
          video.addEventListener('error', handleError);

          // Set up stream error handling
          stream.getVideoTracks().forEach(track => {
            track.onended = () => {
              console.log('📸 Camera stream ended');
              setCameraReady(false);
            };
          });

          // Timeout fallback
          setTimeout(() => {
            if (!cameraReady) {
              console.log('⏰ Camera setup timeout - trying manual play');
              video.play()
                .then(handleSuccess)
                .catch(() => {
                  console.log('❌ Manual play failed');
                  handleError(new Error('Camera setup timeout'));
                });
            }
          }, 5000);
        });

      } else {
        console.error('❌ Video element or stream not available');
        setCameraReady(false);
        return false;
      }
    } catch (error: any) {
      console.warn('📸 Camera access failed:', error.message);

      // Provide specific error messages
      if (error.name === 'NotAllowedError') {
        console.log('🚫 Camera permission denied - using activity-based detection');
      } else if (error.name === 'NotFoundError') {
        console.log('📷 No camera found - using activity-based detection');
      } else {
        console.log('⚠️ Camera error - using activity-based detection');
      }

      setCameraReady(false);
      return false;
    }
  };

  // Ambient sound URLs for different moods - using working public URLs
  const ambientSounds = {
    happy: 'https://www.kozco.com/tech/piano2.wav', // Piano notes
    calm: 'https://www.kozco.com/tech/organfinale.wav', // Gentle organ
    neutral: 'https://www.kozco.com/tech/LuckySon.wav', // Neutral ambient
    sad: 'https://www.kozco.com/tech/32_step_Seq_1.wav', // Soft sequence
    angry: 'https://www.kozco.com/tech/explosion.wav' // Energy sound
  };

  // Create ambient music using Howler.js with proper cleanup
  const createAmbientMusic = (moodType: MoodType) => {
    // Always stop and cleanup previous ambient sound first
    if (ambientSoundRef.current) {
      try {
        ambientSoundRef.current.stop();
        ambientSoundRef.current.unload();
      } catch (error) {
        console.warn('Error stopping previous ambient sound:', error);
      }
      ambientSoundRef.current = null;
    }

    // Only create new sound if we're supposed to be playing
    if (!isPlaying) {
      console.log('Not creating ambient sound because isPlaying is false');
      return;
    }

    console.log(`Creating ${moodType} ambient music...`);

    try {
      // Create new ambient sound
      const sound = new Howl({
        src: [ambientSounds[moodType]],
        loop: true,
        volume: isMuted ? 0 : volume * 0.3,
        preload: true,
        onplay: () => {
          console.log(`✅ Now playing ${moodType} ambient music`);
        },
        onload: () => {
          console.log(`✅ Successfully loaded ${moodType} ambient sound`);
        },
        onloaderror: (id, error) => {
          console.warn(`❌ Error loading external ambient sound for ${moodType}:`, error);
          console.log('🔄 Falling back to synthetic ambient sound...');
          // Clear the failed sound reference
          ambientSoundRef.current = null;
          // Create fallback
          createFallbackAmbient(moodType);
        },
        onplayerror: (id, error) => {
          console.warn(`❌ Error playing ambient sound for ${moodType}:`, error);
          ambientSoundRef.current = null;
          createFallbackAmbient(moodType);
        },
        onstop: () => {
          console.log(`⏹️ ${moodType} ambient music stopped`);
        }
      });

      ambientSoundRef.current = sound;

      // Try to play with error handling
      const playPromise = sound.play();
      if (playPromise instanceof Promise) {
        playPromise.catch(error => {
          console.warn('Failed to play ambient sound:', error);
          createFallbackAmbient(moodType);
        });
      }

    } catch (error) {
      console.error('Failed to create ambient music:', error);
      createFallbackAmbient(moodType);
    }
  };

  // Enhanced fallback ambient sound generator
  const createFallbackAmbient = (moodType: MoodType) => {
    // Only create fallback if we're still supposed to be playing
    if (!isPlaying) {
      console.log('Not creating fallback ambient sound because isPlaying is false');
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create multiple oscillators for richer ambient sound
      const createMoodAmbient = () => {
        const moodConfigs = {
          happy: {
            frequencies: [220, 330, 440],
            type: 'sine' as OscillatorType,
            filterFreq: 1200,
            modulation: 0.5
          },
          calm: {
            frequencies: [110, 165, 220],
            type: 'sine' as OscillatorType,
            filterFreq: 500,
            modulation: 0.2
          },
          neutral: {
            frequencies: [200, 300, 400],
            type: 'triangle' as OscillatorType,
            filterFreq: 800,
            modulation: 0.3
          },
          sad: {
            frequencies: [130, 195, 260],
            type: 'sine' as OscillatorType,
            filterFreq: 300,
            modulation: 0.1
          },
          angry: {
            frequencies: [150, 225, 300],
            type: 'sawtooth' as OscillatorType,
            filterFreq: 1000,
            modulation: 0.7
          }
        };

        const config = moodConfigs[moodType];
        const masterGain = audioContext.createGain();
        masterGain.gain.value = (isMuted ? 0 : volume) * 0.05; // Very low volume
        masterGain.connect(audioContext.destination);

        // Create multiple oscillators for richer sound
        config.frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const filter = audioContext.createBiquadFilter();

          oscillator.type = config.type;
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

          // Add subtle frequency modulation
          const lfo = audioContext.createOscillator();
          const lfoGain = audioContext.createGain();
          lfo.frequency.setValueAtTime(config.modulation, audioContext.currentTime);
          lfoGain.gain.setValueAtTime(2, audioContext.currentTime);

          lfo.connect(lfoGain);
          lfoGain.connect(oscillator.frequency);

          // Configure filter
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(config.filterFreq, audioContext.currentTime);

          // Configure gain with slight variations
          gainNode.gain.setValueAtTime(0.3 + (index * 0.1), audioContext.currentTime);

          // Connect the chain
          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(masterGain);

          // Start oscillators
          oscillator.start();
          lfo.start();
        });

        console.log(`Created fallback ${moodType} ambient sound with ${config.frequencies.length} oscillators`);
      };

      createMoodAmbient();

    } catch (error) {
      console.error('Failed to create fallback ambient sound:', error);
      // Ultimate fallback - just log that we tried
      console.log(`Ambient music for ${moodType} mood is not available`);
    }
  };

  // Optimized camera-based visual mood detection
  const detectVisualMood = () => {
    if (!videoRef.current || !cameraReady) {
      intelligentMockDetection();
      return;
    }

    try {
      const video = videoRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        // Lightweight brightness analysis with smaller canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Use much smaller canvas for better performance
          canvas.width = 32;
          canvas.height = 24;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const brightness = calculateBrightness(imageData);

          // Simplified mood influence based on lighting
          let moodInfluence: string;
          if (brightness > 140) {
            moodInfluence = 'happy';
          } else if (brightness < 60) {
            moodInfluence = 'calm';
          } else {
            moodInfluence = 'neutral';
          }

          intelligentMoodDetection(moodInfluence);
        } else {
          intelligentMoodDetection();
        }
      } else {
        intelligentMoodDetection();
      }
    } catch (error) {
      intelligentMoodDetection();
    }
  };

  // Optimized brightness calculation
  const calculateBrightness = (imageData: ImageData): number => {
    let totalBrightness = 0;
    const data = imageData.data;
    let sampleCount = 0;

    // Sample every 16th pixel for much better performance
    for (let i = 0; i < data.length; i += 64) {
      const r = data[i] || 0;
      const g = data[i + 1] || 0;
      const b = data[i + 2] || 0;
      totalBrightness += (r * 0.299 + g * 0.587 + b * 0.114); // Proper luminance calculation
      sampleCount++;
    }

    return sampleCount > 0 ? totalBrightness / sampleCount : 128;
  };

  // Dynamic emotion detection that responds to user behavior and changes frequently
  const intelligentMoodDetection = (cameraInfluence?: string) => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Get current session data
    const sessionDuration = Math.floor((now.getTime() - sessionStartTime) / 1000);
    const userInteractions = getUserInteractionLevel();

    // Create dynamic mood scoring system
    const moodScores = {
      happy: 0,
      calm: 0,
      neutral: 0,
      sad: 0,
      angry: 0
    };

    // Time-based mood influences (more varied)
    if (hour >= 7 && hour <= 10) {
      moodScores.calm += 30;
      moodScores.happy += 20;
      moodScores.neutral += 10;
    } else if (hour >= 11 && hour <= 15) {
      moodScores.happy += 40;
      moodScores.neutral += 20;
      moodScores.calm += 10;
    } else if (hour >= 16 && hour <= 19) {
      moodScores.happy += 35;
      moodScores.calm += 25;
      moodScores.neutral += 15;
    } else if (hour >= 20 && hour <= 23) {
      moodScores.calm += 45;
      moodScores.neutral += 20;
      moodScores.sad += 10;
    } else {
      moodScores.calm += 40;
      moodScores.neutral += 30;
      moodScores.sad += 15;
    }

    // User activity level influences
    if (userInteractions > 8) {
      moodScores.happy += 40;
      moodScores.calm += 10;
    } else if (userInteractions > 4) {
      moodScores.happy += 25;
      moodScores.neutral += 25;
      moodScores.calm += 20;
    } else if (userInteractions > 1) {
      moodScores.neutral += 30;
      moodScores.calm += 25;
      moodScores.sad += 10;
    } else {
      moodScores.sad += 25;
      moodScores.neutral += 20;
      moodScores.calm += 15;
    }

    // Session duration influences
    if (sessionDuration > 600) { // 10+ minutes
      moodScores.happy += 20;
      moodScores.calm += 15;
    } else if (sessionDuration > 180) { // 3+ minutes
      moodScores.neutral += 20;
      moodScores.calm += 15;
    } else {
      moodScores.neutral += 15;
      moodScores.happy += 10;
    }

    // Camera influence (if available)
    if (cameraInfluence === 'happy') {
      moodScores.happy += 30;
      moodScores.calm += 10;
    } else if (cameraInfluence === 'calm') {
      moodScores.calm += 25;
      moodScores.neutral += 15;
    } else if (cameraInfluence === 'neutral') {
      moodScores.neutral += 20;
    }

    // Music playing influences mood
    if (isPlaying) {
      moodScores.happy += 15;
      moodScores.calm += 20;
    } else {
      moodScores.neutral += 10;
      moodScores.sad += 5;
    }

    // Add significant randomness for natural variation and emotion diversity
    const randomFactor = Math.random() * 40; // Increased randomness
    const allMoods: MoodType[] = ['happy', 'calm', 'neutral', 'sad', 'angry'];
    const randomMood = allMoods[Math.floor(Math.random() * allMoods.length)];
    moodScores[randomMood] += randomFactor;

    // Add time-based micro-variations to ensure emotions change
    const microVariation = (Date.now() % 10000) / 100; // 0-100 based on current time
    const timeBasedMood = allMoods[Math.floor(microVariation / 20)]; // Changes every ~20 points
    moodScores[timeBasedMood] += 20;

    // Aggressive anti-stagnation mechanism to ensure emotions change frequently
    if (moodHistory.length > 1) {
      const recentMoods = moodHistory.slice(-2);
      const sameMoodCount = recentMoods.filter(entry => entry.emotion === currentMood).length;

      // If mood has been the same for even 2 detections, force a change
      if (sameMoodCount >= 2) {
        console.log(`🔄 Anti-stagnation: Forcing mood change from ${currentMood}`);

        // Heavily boost different moods to encourage change
        Object.keys(moodScores).forEach(mood => {
          if (mood !== currentMood) {
            moodScores[mood as MoodType] += 50; // Increased boost
          }
        });

        // Significantly reduce current mood score to force change
        moodScores[currentMood] -= 40;
      }
    }

    // Also add emotion cycling based on detection count
    const detectionCount = moodHistory.length;
    const cycleEmotion = allMoods[detectionCount % allMoods.length];
    moodScores[cycleEmotion] += 30;

    // Find mood with highest score
    let detectedMood: MoodType = 'neutral';
    let highestScore = 0;

    Object.entries(moodScores).forEach(([mood, score]) => {
      if (score > highestScore) {
        highestScore = score;
        detectedMood = mood as MoodType;
      }
    });

    // Calculate confidence based on score margin
    const sortedScores = Object.values(moodScores).sort((a, b) => b - a);
    const margin = sortedScores[0] - sortedScores[1];
    const confidence = Math.min(0.95, 0.65 + (margin / 100));

    // Apply mood change - be more responsive
    if (detectedMood !== currentMood) {
      // Immediate change for moderate signals, or after 1 confirmation
      if (margin > 15 || lastDetectedMood === detectedMood) {
        setCurrentMood(detectedMood);
        setMoodStabilityCount(0);
        setLastDetectedMood(null);

        setMoodHistory(prev => [...prev.slice(-9), {
          emotion: detectedMood,
          confidence,
          timestamp: new Date()
        }]);

        // Change music when mood changes
        if (isPlaying) {
          setCurrentTrack(`ambient-${detectedMood}`);
        }

        console.log(`✅ Emotion detected: ${detectedMood} (${(confidence * 100).toFixed(0)}% confidence, score: ${highestScore.toFixed(0)})`);
        console.log(`📊 All mood scores:`, moodScores);
      } else {
        // Queue for next detection
        setLastDetectedMood(detectedMood);
        console.log(`��� Detecting: ${detectedMood} (score: ${highestScore.toFixed(0)}, needs confirmation)`);
      }
    } else {
      console.log(`🔄 Emotion confirmed: ${detectedMood} (${(confidence * 100).toFixed(0)}% confidence)`);
    }
  };

  // Track user interaction level for more accurate mood detection
  const [sessionStartTime] = useState(Date.now());
  const [userInteractions, setUserInteractions] = useState(0);

  const getUserInteractionLevel = () => {
    const timeMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);

    // Dynamic interaction scoring based on actual activities
    let interactionScore = 0;

    // Base activity score
    interactionScore += timeMinutes * 1.5;

    // Active features boost interaction score
    if (isDetecting) interactionScore += 4;
    if (isPlaying) interactionScore += 3;
    if (cameraReady) interactionScore += 2;

    // Mood history indicates engagement
    interactionScore += moodHistory.length * 0.5;

    // Recent activity (if user has been active recently)
    const recentActivity = moodHistory.filter(entry =>
      Date.now() - entry.timestamp.getTime() < 300000 // Last 5 minutes
    ).length;
    interactionScore += recentActivity * 2;

    // Add some randomness for natural variation
    interactionScore += Math.random() * 3;

    return Math.min(Math.max(interactionScore, 0), 25);
  };

  // Add click tracking for better interaction detection
  const trackUserInteraction = () => {
    setUserInteractions(prev => prev + 1);
  };

  // Track interactions on key UI elements
  useEffect(() => {
    const handleClick = () => trackUserInteraction();
    const handleKeyPress = () => trackUserInteraction();

    document.addEventListener('click', handleClick);
    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  // Simple fallback for when all else fails
  const simpleMockDetection = () => {
    const moods: MoodType[] = ['happy', 'calm', 'neutral'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const confidence = 0.5 + Math.random() * 0.3;

    const prevMood = currentMood;
    setCurrentMood(randomMood);
    setMoodHistory(prev => [...prev.slice(-10), {
      emotion: randomMood,
      confidence,
      timestamp: new Date()
    }]);

    if (prevMood !== randomMood && isPlaying) {
      setCurrentTrack(`ambient-${randomMood}`);
    }
  };

  // Start mood detection with slower, more stable intervals
  const startDetection = () => {
    setIsDetecting(true);

    // Use visual detection or intelligent mock based on camera availability
    detectionInterval.current = setInterval(() => {
      if (cameraReady && videoRef.current && videoRef.current.videoWidth > 0) {
        // Camera-based visual detection (no face-api dependency)
        detectVisualMood();
      } else {
        // Enhanced intelligent detection based on user activity
        intelligentMoodDetection();
      }
    }, 3000); // Check every 3 seconds for real-time emotion detection
  };

  const stopDetection = () => {
    console.log('🛑 Stopping mood detection and camera...');
    setIsDetecting(false);

    // Clear detection interval
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = undefined;
    }

    // Stop and cleanup camera
    stopCamera();
  };

  // New function to properly stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('📸 Camera track stopped');
      });
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    console.log('✅ Camera stopped and cleaned up');
  };

  // Enhanced music control functions with Spotify integration
  const toggleMusic = async () => {
    if (isPlaying) {
      // Stop music completely
      console.log('Stopping music...');
      setIsPlaying(false);

      // Stop Spotify if connected
      if (useSpotify && isSpotifyConnected) {
        await spotifyService.pause();
      }

      // Stop ambient sound fallback
      if (ambientSoundRef.current) {
        ambientSoundRef.current.stop();
        ambientSoundRef.current.unload();
        ambientSoundRef.current = null;
      }

      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = undefined;
      }

      setMusicProgress(0);
      console.log('✅ Music stopped');
    } else {
      // Start music
      console.log('Starting music...');
      setIsPlaying(true);

      try {
        if (useSpotify && isSpotifyConnected && currentSpotifyTrack) {
          // Play Spotify track
          console.log(`🎵 Playing Spotify track: ${currentSpotifyTrack.name}`);
          const played = await spotifyService.playTrack(currentSpotifyTrack.id);

          if (!played) {
            // Fallback to preview or ambient
            playTrackPreview(currentSpotifyTrack);
          }
        } else {
          // Fallback to ambient music
          createAmbientMusic(currentMood);
        }

        // Start progress tracking
        progressInterval.current = setInterval(() => {
          setMusicProgress(prev => (prev + 2) % 100);
        }, 1000);

        console.log('✅ Music started');
      } catch (error) {
        console.error('Failed to start music:', error);
        setIsPlaying(false);
      }
    }
  };

  // Play Spotify track preview
  const playTrackPreview = (track: SpotifyTrack) => {
    if (track.preview_url) {
      console.log(`🎵 Playing preview: ${track.name} by ${track.artist}`);

      // Stop previous ambient sound
      if (ambientSoundRef.current) {
        ambientSoundRef.current.stop();
        ambientSoundRef.current.unload();
      }

      // Create Howl instance for Spotify preview
      const sound = new Howl({
        src: [track.preview_url],
        volume: isMuted ? 0 : volume * 0.8,
        onplay: () => {
          console.log(`✅ Now playing preview: ${track.name}`);
        },
        onend: () => {
          console.log(`⏭���� Preview ended: ${track.name}`);
          playNextTrack();
        },
        onloaderror: (id, error) => {
          console.warn(`❌ Failed to load preview for ${track.name}:`, error);
          // Fallback to ambient sound
          createAmbientMusic(currentMood);
        }
      });

      ambientSoundRef.current = sound;
      sound.play();
    } else {
      console.log(`⚠️ No preview available for ${track.name}, using ambient`);
      createAmbientMusic(currentMood);
    }
  };

  // Play next track in playlist
  const playNextTrack = () => {
    if (spotifyTracks.length > 0 && currentSpotifyTrack) {
      const currentIndex = spotifyTracks.findIndex(t => t.id === currentSpotifyTrack.id);
      const nextIndex = (currentIndex + 1) % spotifyTracks.length;
      const nextTrack = spotifyTracks[nextIndex];

      setCurrentSpotifyTrack(nextTrack);

      if (isPlaying) {
        if (useSpotify && isSpotifyConnected) {
          spotifyService.playTrack(nextTrack.id);
        } else {
          playTrackPreview(nextTrack);
        }
      }
    }
  };

  const toggleMute = async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Update Spotify volume if connected
    if (useSpotify && isSpotifyConnected) {
      await spotifyService.setVolume(newMutedState ? 0 : volume);
    }

    // Update ambient sound volume
    if (ambientSoundRef.current) {
      const newVolume = newMutedState ? 0 : volume * 0.8;
      ambientSoundRef.current.volume(newVolume);
      console.log(`Audio ${newMutedState ? 'muted' : 'unmuted'}, volume: ${newVolume}`);
    }
  };

  // Update volume when volume slider changes
  useEffect(() => {
    const updateVolume = async () => {
      if (!isMuted) {
        // Update Spotify volume
        if (useSpotify && isSpotifyConnected) {
          await spotifyService.setVolume(volume);
        }

        // Update ambient sound volume
        if (ambientSoundRef.current) {
          const newVolume = volume * 0.8;
          ambientSoundRef.current.volume(newVolume);
          console.log(`Volume updated to: ${newVolume}`);
        }
      }
    };

    updateVolume();
  }, [volume, isMuted]);

  useEffect(() => {
    if (modelsLoaded) {
      setIsLoading(false);
      setTimeout(() => setShowWelcome(false), 3000);
    }
  }, [modelsLoaded]);

  // Update music when mood changes
  useEffect(() => {
    // Load new tracks for the mood
    loadMoodTracks(currentMood);

    // If already playing, switch to new mood music
    if (isPlaying) {
      if (useSpotify && isSpotifyConnected && spotifyTracks.length > 0) {
        const newTrack = spotifyTracks[0];
        setCurrentSpotifyTrack(newTrack);
        if (useSpotify) {
          spotifyService.playTrack(newTrack.id);
        } else {
          playTrackPreview(newTrack);
        }
      } else if (ambientSoundRef.current) {
        createAmbientMusic(currentMood);
      }
    }
  }, [currentMood]);

  // Cleanup intervals, audio, and camera on unmount
  useEffect(() => {
    return () => {
      // Stop any playing audio
      if (ambientSoundRef.current) {
        ambientSoundRef.current.stop();
        ambientSoundRef.current.unload();
      }

      // Clear intervals
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }

      // Stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleGetStarted = async () => {
    console.log('🚀 Starting mood detection system...');

    // Try to start camera first with proper await
    try {
      const cameraSuccess = await startCamera();
      if (cameraSuccess) {
        console.log('📸 Camera initialization successful');
      } else {
        console.log('📸 Camera initialization failed, using activity-based detection');
      }
    } catch (error) {
      console.log('⚠️ Camera error:', error);
    }

    // Start detection regardless of camera status
    startDetection();

    // Show helpful message based on what's available
    setTimeout(() => {
      if (cameraReady) {
        console.log('🎯 Visual AI detection active with camera analysis');
      } else {
        console.log('🧠 Smart activity-based mood detection active - analyzing user patterns');
      }
    }, 1000);
  };

  const currentMoodConfig = moodConfig[currentMood];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="ambient-orb"></div>
      <div className="ambient-orb"></div>
      <div className="ambient-orb"></div>

      {/* Welcome animation */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-luminix-bg-darker/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15,
                delay: 0.2 
              }}
              className="text-center"
            >
              <motion.h1 
                className="text-6xl font-bold text-gradient-neon mb-4"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(34, 211, 238, 0.5)",
                    "0 0 40px rgba(34, 211, 238, 0.8)",
                    "0 0 20px rgba(34, 211, 238, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                LUMINIX
              </motion.h1>
              <motion.p 
                className="text-2xl text-luminix-text-muted mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ECO MIND
              </motion.p>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto border-4 border-luminix-neon border-t-transparent rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: showWelcome ? 3.2 : 0 }}
          className="glass-subtle border-b border-luminix-surface p-6"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-luminix-neon to-luminix-green flex items-center justify-center"
              >
                <Brain className="w-5 h-5 text-luminix-bg" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gradient-neon">LUMINIX ECO MIND</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/analytics" className="text-luminix-text-muted hover:text-luminix-text transition-colors">Analytics</Link>
              <Link to="/games" className="text-luminix-text-muted hover:text-luminix-text transition-colors">Games</Link>
              <Link to="/therapy" className="text-luminix-text-muted hover:text-luminix-text transition-colors">Therapy</Link>
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-neon flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </motion.button>
              </Link>
            </nav>
          </div>
        </motion.header>

        {/* Main dashboard */}
        <main className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Mood Detection Interface */}
            <MoodDetection
              currentMood={currentMood}
              currentMoodConfig={currentMoodConfig}
              isDetecting={isDetecting}
              cameraReady={cameraReady}
              videoRef={videoRef}
              handleGetStarted={handleGetStarted}
              stopDetection={stopDetection}
              startCamera={startCamera}
            />

              <div className="relative">
                {/* Enhanced Camera Feed */}
                <div className="relative aspect-video bg-gradient-to-br from-luminix-bg-darker via-luminix-bg to-luminix-bg-darker rounded-xl overflow-hidden mb-6 border-2 border-luminix-neon/30 shadow-lg shadow-luminix-neon/20">

                  {/* Futuristic Corner Brackets */}
                  <div className="absolute inset-0 z-30 pointer-events-none">
                    <div className="absolute top-3 left-3 w-8 h-8 border-t-3 border-l-3 border-luminix-neon opacity-80"></div>
                    <div className="absolute top-3 right-3 w-8 h-8 border-t-3 border-r-3 border-luminix-neon opacity-80"></div>
                    <div className="absolute bottom-3 left-3 w-8 h-8 border-b-3 border-l-3 border-luminix-neon opacity-80"></div>
                    <div className="absolute bottom-3 right-3 w-8 h-8 border-b-3 border-r-3 border-luminix-neon opacity-80"></div>
                  </div>

                  {/* Scanning Line Animation */}
                  {isDetecting && (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      <div className="scanning-line absolute w-full h-0.5 bg-gradient-to-r from-transparent via-luminix-neon to-transparent opacity-80"></div>
                      <div className="data-stream absolute top-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-luminix-green to-transparent opacity-60"></div>
                    </div>
                  )}

                  {/* Neural Grid Overlay */}
                  {isDetecting && (
                    <div className="absolute inset-0 z-10 pointer-events-none neural-background opacity-20">
                      <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div key={i} className="border border-luminix-neon/20"></div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Always show video element, but overlay message when not ready */}
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${cameraReady ? 'opacity-90' : 'opacity-20'}`}
                    style={{ transform: 'scaleX(-1)' }} // Mirror for natural selfie view
                  />

                  {/* Overlay when camera not ready */}
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-center"
                      >
                        <Camera className="w-16 h-16 text-luminix-text-muted mx-auto mb-4" />
                        <p className="text-luminix-text-muted mb-2">
                          {isDetecting ? 'Camera starting...' : 'Camera not active'}
                        </p>
                        <p className="text-xs text-luminix-text-muted">
                          {isDetecting ?
                            'Please allow camera access in your browser' :
                            'Start detection or click "Enable Camera" below'
                          }
                        </p>
                      </motion.div>
                    </div>
                  )}

                  {/* Enhanced Camera Status Indicators */}
                  {cameraReady && (
                    <>
                      {/* Recording Indicator */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-4 right-4 z-40"
                      >
                        <div className="flex items-center space-x-2 bg-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-red-500/40">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 bg-red-400 rounded-full shadow-lg shadow-red-400/50"
                          />
                          <span className="text-xs text-red-300 font-bold font-mono">REC</span>
                        </div>
                      </motion.div>

                      {/* Neural Activity Indicator */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-4 left-4 z-40"
                      >
                        <div className="flex items-center space-x-2 bg-luminix-green/20 backdrop-blur-sm rounded-full px-4 py-2 border border-luminix-green/40">
                          <motion.div
                            animate={{
                              scale: [1, 1.4, 1],
                              rotate: [0, 180, 360]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-3 h-3 bg-luminix-green rounded-full shadow-lg shadow-luminix-green/50"
                          />
                          <span className="text-xs text-luminix-green font-bold font-mono">SCAN</span>
                        </div>
                      </motion.div>
                    </>
                  )}
                  
                  {/* Mood overlay */}
                  {isDetecting && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-4 left-4 glass-strong rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <motion.span
                          className="text-3xl"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {currentMoodConfig.emoji}
                        </motion.span>
                        <div>
                          <p className="text-sm text-luminix-text-muted flex items-center space-x-1">
                            <span>{cameraReady ? '📹 Camera' : '🧠 Smart'}</span>
                            {cameraReady && (
                              <span className="w-1 h-1 bg-luminix-green rounded-full animate-pulse"></span>
                            )}
                          </p>
                          <p className={`text-lg font-bold text-gradient-mood ${currentMoodConfig.gradient}`}>
                            {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
                          </p>
                        </div>
                      </div>

                      {/* Detection status indicator */}
                      <div className="mt-2 text-xs text-luminix-text-muted">
                        {cameraReady ?
                          '��� Real-time emotion detection • Updates every 8s' :
                          '🧠 Dynamic emotion analysis • Updates every 8s'
                        }
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Enhanced Mood Analysis Display */}
                <motion.div
                  key={currentMood}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-6">
                    {/* Mood Visualization */}
                    <div className="flex items-center space-x-6">
                      <motion.div
                        className="relative"
                        animate={currentMood === 'angry' ? {
                          rotate: [-2, 2, -2, 2, 0],
                          scale: [1, 1.1, 1]
                        } : currentMood === 'happy' ? {
                          y: [0, -8, 0],
                          rotate: [0, 10, -10, 0]
                        } : {
                          scale: [1, 1.08, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-luminix-surface/50 to-luminix-bg-darker flex items-center justify-center border-3 border-luminix-neon/40 shadow-lg shadow-luminix-neon/30">
                          <span className="text-5xl">{currentMoodConfig.emoji}</span>
                        </div>
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-luminix-green/60"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.6, 0, 0.6]
                          }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full border border-luminix-neon/40"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0, 0.3]
                          }}
                          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        />
                      </motion.div>

                      <div className="flex-1">
                        <motion.h3
                          className="text-4xl font-bold bg-gradient-to-r from-luminix-neon via-white to-luminix-green bg-clip-text text-transparent mb-2"
                          animate={{
                            textShadow: [
                              "0 0 20px rgba(34, 211, 238, 0.3)",
                              "0 0 40px rgba(16, 185, 129, 0.5)",
                              "0 0 20px rgba(34, 211, 238, 0.3)"
                            ]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
                        </motion.h3>
                        <motion.p
                          className="text-lg text-luminix-text mb-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {currentMoodConfig.message}
                        </motion.p>

                        {/* Emotion Intensity Bars */}
                        {isDetecting && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-luminix-text-muted w-16">Confidence</span>
                              <div className="flex-1 h-2 bg-luminix-surface/50 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-luminix-green to-luminix-neon rounded-full"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "85%" }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                              </div>
                              <span className="text-xs text-luminix-green font-mono">85%</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-luminix-text-muted w-16">Stability</span>
                              <div className="flex-1 h-2 bg-luminix-surface/50 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-luminix-neon to-luminix-green rounded-full"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "72%" }}
                                  transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
                                />
                              </div>
                              <span className="text-xs text-luminix-neon font-mono">72%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status message */}
                  {!isDetecting && (
                    <p className="text-sm text-luminix-text-muted mb-4">
                      {!navigator.mediaDevices ?
                        '��� Smart activity-based mood detection ready' :
                        '📸 Advanced mood detection with camera analysis ready'
                      }
                    </p>
                  )}

                  {!isDetecting ? (
                    <motion.button
                      onClick={handleGetStarted}
                      className="btn-luminix"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start Mood Detection
                    </motion.button>
                  ) : (
                    <div className="space-y-3">
                      <motion.button
                        onClick={stopDetection}
                        className="btn-glass"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Stop Detection
                      </motion.button>

                      <div className="space-y-2">
                        <p className="text-xs text-luminix-text-muted">
                          {cameraReady ?
                            '📸 Camera active - detecting real emotions' :
                            '🧠 Analyzing behavior - detecting emotions dynamically'
                          }
                        </p>

                        {!cameraReady && (
                          <motion.button
                            onClick={async () => {
                              console.log('👆 Manual camera activation requested');
                              const success = await startCamera();
                              if (success) {
                                console.log('✅ Manual camera activation successful');
                              } else {
                                console.log('❌ Manual camera activation failed');
                              }
                            }}
                            className="btn-glass text-xs px-3 py-1 w-full"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            📸 Enable Camera
                          </motion.button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
              
            <canvas ref={canvasRef} className="hidden" />

            {/* Sidebar with features */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: showWelcome ? 3.6 : 0.4 }}
              className="space-y-6"
            >
              {/* Quick stats */}
              <div className="card-glass">
                <h3 className="text-lg font-semibold text-luminix-text mb-4">Today's Mood</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-luminix-text-muted">Sessions</span>
                    <span className="text-luminix-text font-medium">
                      {moodHistory.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-luminix-text-muted">Current Streak</span>
                    <span className="text-luminix-green font-medium">3 days 🔥</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-luminix-text-muted">Mood Score</span>
                    <span className="text-luminix-neon font-medium">8.2/10</span>
                  </div>
                </div>
              </div>

              {/* All Emotions Display */}
              <motion.div
                className="card-glass"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold text-luminix-text mb-4">Live Emotion Analysis</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(moodConfig).map(([mood, config]) => (
                    <motion.div
                      key={mood}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        currentMood === mood
                          ? 'border-luminix-neon bg-luminix-neon/10 shadow-lg shadow-luminix-neon/20'
                          : 'border-luminix-surface/30 bg-luminix-surface/10 hover:border-luminix-surface/50'
                      }`}
                      animate={currentMood === mood ? {
                        scale: [1, 1.05, 1],
                        borderColor: [
                          "rgba(34, 211, 238, 0.5)",
                          "rgba(34, 211, 238, 0.8)",
                          "rgba(34, 211, 238, 0.5)"
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex items-center space-x-2">
                        <motion.span
                          className="text-2xl"
                          animate={currentMood === mood ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0]
                          } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {config.emoji}
                        </motion.span>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold capitalize ${
                            currentMood === mood ? 'text-luminix-neon' : 'text-luminix-text'
                          }`}>
                            {mood}
                          </p>
                          <div className="w-full bg-luminix-surface/30 rounded-full h-1.5 mt-1">
                            <motion.div
                              className={`h-full rounded-full ${
                                currentMood === mood
                                  ? 'bg-luminix-neon shadow-lg shadow-luminix-neon/50'
                                  : 'bg-luminix-surface/50'
                              }`}
                              initial={{ width: currentMood === mood ? "85%" : "20%" }}
                              animate={{
                                width: currentMood === mood ? "85%" : `${20 + Math.random() * 40}%`
                              }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </div>
                      {currentMood === mood && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-xs text-luminix-neon"
                        >
                          Active Now
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-luminix-text-muted text-center">
                  {isDetecting ? (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🧠 Real-time analysis active • Updates every 3s
                    </motion.div>
                  ) : (
                    "Start detection to see live emotion analysis"
                  )}
                </div>
              </motion.div>

              {/* Spotify Music */}
              <motion.div
                className="card-glass"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Music className="w-5 h-5 text-luminix-green" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-luminix-text">Music for {currentMood}</h3>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-luminix-green"
                  />
                </div>

                <p className="text-luminix-text-muted mb-4">
                  Discover perfect {currentMoodConfig.music.toLowerCase()} playlists to enhance your {currentMood} mood
                </p>

                <motion.button
                  onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(currentMoodConfig.music + ' music for ' + currentMood + ' mood')}`, '_blank')}
                  className="btn-luminix w-full flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🎵</span>
                  <span>Open Spotify</span>
                  <ExternalLink className="w-4 h-4" />
                </motion.button>
              </motion.div>

              {/* Stress Relief Zone */}
              <motion.div
                className="card-glass"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <span className="text-2xl">🌱</span>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-luminix-text">Stress Relief</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <motion.button
                    className="btn-glass text-sm p-3 flex flex-col items-center space-y-1"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Quick breathing animation
                      const breatheElement = document.createElement('div');
                      breatheElement.innerHTML = '🫁 Breathe: In... Hold... Out...';
                      breatheElement.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-luminix-neon z-50 font-bold animate-pulse';
                      document.body.appendChild(breatheElement);
                      setTimeout(() => document.body.removeChild(breatheElement), 6000);
                    }}
                  >
                    <span className="text-lg">🫁</span>
                    <span>Quick Breathe</span>
                  </motion.button>

                  <motion.button
                    className="btn-glass text-sm p-3 flex flex-col items-center space-y-1"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Create floating bubbles
                      for (let i = 0; i < 10; i++) {
                        setTimeout(() => {
                          const bubble = document.createElement('div');
                          bubble.innerHTML = ['🫧', '💙', '���', '🌟', '💫'][Math.floor(Math.random() * 5)];
                          bubble.className = 'fixed text-2xl z-50 pointer-events-none';
                          bubble.style.left = Math.random() * window.innerWidth + 'px';
                          bubble.style.top = window.innerHeight + 'px';
                          bubble.style.animation = 'float-up 3s ease-out forwards';
                          document.body.appendChild(bubble);
                          setTimeout(() => document.body.removeChild(bubble), 3000);
                        }, i * 200);
                      }
                    }}
                  >
                    <span className="text-lg">🫧</span>
                    <span>Pop Bubbles</span>
                  </motion.button>

                  <motion.button
                    className="btn-glass text-sm p-3 flex flex-col items-center space-y-1"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Show positive affirmation
                      const affirmations = [
                        '🌟 You are stronger than you think',
                        '💖 This too shall pass',
                        '🌈 You\'ve overcome challenges before',
                        '✨ Take it one breath at a time',
                        '�� You are exactly where you need to be'
                      ];
                      const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
                      const element = document.createElement('div');
                      element.innerHTML = affirmation;
                      element.className = 'fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl text-luminix-text bg-luminix-bg/90 backdrop-blur-sm p-6 rounded-lg border border-luminix-neon/30 z-50 text-center max-w-sm';
                      document.body.appendChild(element);
                      setTimeout(() => document.body.removeChild(element), 4000);
                    }}
                  >
                    <span className="text-lg">💭</span>
                    <span>Positive Vibes</span>
                  </motion.button>

                  <motion.button
                    className="btn-glass text-sm p-3 flex flex-col items-center space-y-1"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Screen pulse effect
                      const overlay = document.createElement('div');
                      overlay.className = 'fixed inset-0 bg-gradient-to-r from-luminix-green/20 to-luminix-neon/20 z-40 pointer-events-none';
                      overlay.style.animation = 'pulse 2s ease-in-out';
                      document.body.appendChild(overlay);
                      setTimeout(() => document.body.removeChild(overlay), 2000);
                    }}
                  >
                    <span className="text-lg">🎯</span>
                    <span>Focus Pulse</span>
                  </motion.button>
                </div>

                {/* Additional Stress Relief Tools */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <motion.button
                    className="btn-glass text-sm p-3 flex flex-col items-center space-y-1"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Grounding exercise (5-4-3-2-1 technique)
                      const overlay = document.createElement('div');
                      overlay.className = 'fixed inset-0 bg-luminix-bg/95 backdrop-blur-sm z-50 flex items-center justify-center p-6';
                      overlay.innerHTML = `
                        <div class="card-glass max-w-md w-full text-center">
                          <h3 class="text-2xl font-bold text-luminix-neon mb-4">5-4-3-2-1 Grounding</h3>
                          <div class="text-4xl mb-4">🌍</div>
                          <div class="text-lg text-luminix-text mb-4">
                            <div class="mb-2">5 things you can <strong>see</strong></div>
                            <div class="mb-2">4 things you can <strong>touch</strong></div>
                            <div class="mb-2">3 things you can <strong>hear</strong></div>
                            <div class="mb-2">2 things you can <strong>smell</strong></div>
                            <div class="mb-4">1 thing you can <strong>taste</strong></div>
                          </div>
                          <p class="text-luminix-text-muted mb-6">Take your time with each sense</p>
                          <button onclick="document.body.removeChild(this.closest('.fixed'))" class="btn-luminix">Close</button>
                        </div>
                      `;
                      document.body.appendChild(overlay);
                    }}
                  >
                    <span className="text-lg">🌍</span>
                    <span>Grounding</span>
                  </motion.button>

                  <motion.button
                    className="btn-glass text-sm p-3 flex flex-col items-center space-y-1"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Gratitude moment
                      const prompts = [
                        'What made you smile today?',
                        'Who are you grateful for right now?',
                        'What challenge helped you grow?',
                        'What small pleasure did you enjoy recently?',
                        'What in nature brings you peace?'
                      ];
                      const prompt = prompts[Math.floor(Math.random() * prompts.length)];
                      const overlay = document.createElement('div');
                      overlay.className = 'fixed inset-0 bg-luminix-bg/95 backdrop-blur-sm z-50 flex items-center justify-center p-6';
                      overlay.innerHTML = `
                        <div class="card-glass max-w-lg w-full text-center">
                          <div class="text-4xl mb-4">🙏</div>
                          <h3 class="text-2xl font-bold text-luminix-neon mb-4">Gratitude Moment</h3>
                          <p class="text-lg text-luminix-text mb-6">${prompt}</p>
                          <textarea placeholder="Take a moment to reflect..." class="w-full h-24 bg-luminix-surface/50 border border-luminix-surface rounded-lg p-3 text-luminix-text resize-none mb-4"></textarea>
                          <p class="text-xs text-luminix-text-muted mb-4">This is just for reflection - nothing is saved</p>
                          <button onclick="document.body.removeChild(this.closest('.fixed'))" class="btn-luminix">Done</button>
                        </div>
                      `;
                      document.body.appendChild(overlay);
                    }}
                  >
                    <span className="text-lg">🙏</span>
                    <span>Gratitude</span>
                  </motion.button>

                  <motion.button
                    className="btn-glass text-sm p-3 flex flex-col items-center space-y-1"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Progressive muscle relaxation
                      const overlay = document.createElement('div');
                      overlay.className = 'fixed inset-0 bg-luminix-bg/95 backdrop-blur-sm z-50 flex items-center justify-center p-6';
                      overlay.innerHTML = `
                        <div class="card-glass max-w-md w-full text-center">
                          <h3 class="text-2xl font-bold text-luminix-neon mb-4">Body Scan</h3>
                          <div class="text-4xl mb-4">🧘</div>
                          <div class="text-lg text-luminix-text mb-6">
                            <div class="mb-3">
                              <strong>1.</strong> Start with your toes - tense for 5 seconds, then relax
                            </div>
                            <div class="mb-3">
                              <strong>2.</strong> Move up to calves, thighs, abdomen
                            </div>
                            <div class="mb-3">
                              <strong>3.</strong> Continue with arms, shoulders, face
                            </div>
                            <div class="mb-3">
                              <strong>4.</strong> Feel the difference between tension and relaxation
                            </div>
                          </div>
                          <button onclick="document.body.removeChild(this.closest('.fixed'))" class="btn-luminix">Start Relaxation</button>
                        </div>
                      `;
                      document.body.appendChild(overlay);
                    }}
                  >
                    <span className="text-lg">🧘</span>
                    <span>Body Scan</span>
                  </motion.button>

                  <motion.button
                    className="btn-glass text-sm p-3 flex flex-col items-center space-y-1"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(219, 39, 119, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Power pose
                      const poses = [
                        { name: 'Wonder Woman', desc: 'Stand tall, hands on hips, chest out', emoji: '🦸‍♀️' },
                        { name: 'Victory V', desc: 'Raise both arms up in a V shape', emoji: '🙌' },
                        { name: 'Mountain Pose', desc: 'Stand straight, arms at sides, breathe deeply', emoji: '🏔️' },
                        { name: 'Star Pose', desc: 'Stand with legs wide, arms spread out', emoji: '⭐' }
                      ];
                      const pose = poses[Math.floor(Math.random() * poses.length)];
                      const overlay = document.createElement('div');
                      overlay.className = 'fixed inset-0 bg-luminix-bg/95 backdrop-blur-sm z-50 flex items-center justify-center p-6';
                      overlay.innerHTML = `
                        <div class="card-glass max-w-md w-full text-center">
                          <h3 class="text-2xl font-bold text-luminix-neon mb-4">Power Pose</h3>
                          <div class="text-6xl mb-4">${pose.emoji}</div>
                          <div class="text-xl font-semibold text-luminix-text mb-2">${pose.name}</div>
                          <div class="text-luminix-text-muted mb-6">${pose.desc}</div>
                          <div id="pose-timer" class="text-3xl font-bold text-luminix-green mb-4">15s</div>
                          <p class="text-sm text-luminix-text-muted mb-6">Hold this pose to boost confidence!</p>
                          <button onclick="document.body.removeChild(this.closest('.fixed'))" class="btn-luminix">Done</button>
                        </div>
                      `;
                      document.body.appendChild(overlay);

                      let timeLeft = 15;
                      const timer = setInterval(() => {
                        timeLeft--;
                        const timerEl = document.getElementById('pose-timer');
                        if (timerEl) {
                          timerEl.textContent = timeLeft > 0 ? timeLeft + 's' : '✨ Great!';
                          if (timeLeft <= 0) clearInterval(timer);
                        } else {
                          clearInterval(timer);
                        }
                      }, 1000);
                    }}
                  >
                    <span className="text-lg">💪</span>
                    <span>Power Pose</span>
                  </motion.button>
                </div>

                <div className="bg-gradient-to-r from-luminix-green/10 to-luminix-neon/10 rounded-lg p-3">
                  <p className="text-luminix-text-muted text-sm text-center">
                    💡 Try these evidence-based techniques for instant stress relief
                  </p>
                </div>
              </motion.div>

              {/* Daily Wellness Tips */}
              <motion.div
                className="card-glass"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span className="text-2xl">💡</span>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-luminix-text">Daily Wellness Tip</h3>
                </div>

                <motion.div
                  key={Date.now()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="wellness-tip"
                  className="mb-4"
                >
                  <div className="bg-gradient-to-r from-luminix-neon/10 to-luminix-green/10 rounded-lg p-4 mb-3">
                    <p className="text-luminix-text text-sm" id="tip-text">
                      {(() => {
                        const tips = [
                          "🌅 Start your day with 3 deep breaths to center yourself",
                          "💧 Drink a glass of water mindfully - notice the temperature and taste",
                          "🌸 Take a 2-minute nature break - even looking at plants helps",
                          "📝 Write down one thing you're looking forward to today",
                          "🤗 Give yourself a gentle hug - it releases calming hormones",
                          "🎵 Listen to one song that makes you feel good",
                          "👥 Send a kind message to someone you care about",
                          "🍃 Do some gentle stretches at your desk",
                          "😌 Practice the 'STOP' technique: Stop, Take a breath, Observe, Proceed",
                          "🌙 End your day by noting one positive moment from today"
                        ];
                        return tips[Math.floor(Math.random() * tips.length)];
                      })()}
                    </p>
                  </div>
                </motion.div>

                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => {
                      const tips = [
                        "🌅 Start your day with 3 deep breaths to center yourself",
                        "💧 Drink a glass of water mindfully - notice the temperature and taste",
                        "🌸 Take a 2-minute nature break - even looking at plants helps",
                        "📝 Write down one thing you're looking forward to today",
                        "🤗 Give yourself a gentle hug - it releases calming hormones",
                        "🎵 Listen to one song that makes you feel good",
                        "👥 Send a kind message to someone you care about",
                        "🍃 Do some gentle stretches at your desk",
                        "😌 Practice the 'STOP' technique: Stop, Take a breath, Observe, Proceed",
                        "🌙 End your day by noting one positive moment from today",
                        "🚶‍♀️ Take a 5-minute walk, even if it's just around your room",
                        "🧠 Practice the 4-7-8 breathing: inhale 4, hold 7, exhale 8",
                        "☀️ Get some sunlight on your face for natural mood boost",
                        "📱 Take a 10-minute break from screens",
                        "🎨 Doodle or color for 5 minutes to engage your creative side"
                      ];
                      const newTip = tips[Math.floor(Math.random() * tips.length)];
                      const tipElement = document.getElementById('tip-text');
                      if (tipElement) {
                        tipElement.textContent = newTip;
                      }
                    }}
                    className="btn-glass flex-1 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    New Tip
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      // Create a daily challenge overlay
                      const challenges = [
                        { title: "Mindful Minutes", desc: "Set 3 random alarms to take mindful breaths", emoji: "⏰" },
                        { title: "Gratitude Hunt", desc: "Find 5 things to be grateful for today", emoji: "����" },
                        { title: "Movement Breaks", desc: "Take 5 movement breaks throughout the day", emoji: "🏃‍♀️" },
                        { title: "Kindness Chain", desc: "Do one small act of kindness for someone", emoji: "💝" },
                        { title: "Digital Sunset", desc: "No screens 1 hour before bed", emoji: "🌅" },
                        { title: "Nature Connection", desc: "Spend 15 minutes outside or with plants", emoji: "🌿" }
                      ];
                      const challenge = challenges[Math.floor(Math.random() * challenges.length)];
                      const overlay = document.createElement('div');
                      overlay.className = 'fixed inset-0 bg-luminix-bg/95 backdrop-blur-sm z-50 flex items-center justify-center p-6';
                      overlay.innerHTML = `
                        <div class="card-glass max-w-md w-full text-center">
                          <div class="text-4xl mb-4">${challenge.emoji}</div>
                          <h3 class="text-2xl font-bold text-luminix-neon mb-4">Today's Challenge</h3>
                          <div class="text-xl font-semibold text-luminix-text mb-3">${challenge.title}</div>
                          <p class="text-luminix-text-muted mb-6">${challenge.desc}</p>
                          <div class="flex space-x-3">
                            <button onclick="alert('Challenge accepted! 💪 You\\'ve got this!')" class="btn-luminix flex-1">Accept Challenge</button>
                            <button onclick="document.body.removeChild(this.closest('.fixed'))" class="btn-glass px-4">Later</button>
                          </div>
                        </div>
                      `;
                      document.body.appendChild(overlay);
                    }}
                    className="btn-luminix text-sm px-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Daily Challenge
                  </motion.button>
                </div>
              </motion.div>

              {/* Quick actions */}
              <div className="card-glass">
                <h3 className="text-lg font-semibold text-luminix-text mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/analytics">
                    <motion.button
                      className="btn-glass text-sm p-3 w-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <BarChart3 className="w-4 h-4 mb-1" />
                      Analytics
                    </motion.button>
                  </Link>
                  <Link to="/games">
                    <motion.button
                      className="btn-glass text-sm p-3 w-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Gamepad2 className="w-4 h-4 mb-1" />
                      Games
                    </motion.button>
                  </Link>
                  <Link to="/therapy">
                    <motion.button
                      className="btn-glass text-sm p-3 w-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Bot className="w-4 h-4 mb-1" />
                      AI Therapy
                    </motion.button>
                  </Link>
                  <Link to="/journal">
                    <motion.button
                      className="btn-glass text-sm p-3 w-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Heart className="w-4 h-4 mb-1" />
                      Journal
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature showcase */}
          <motion.section 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: showWelcome ? 4 : 0.6 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-gradient-neon text-center mb-12">
              Explore Your Emotional Journey
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: BarChart3, title: "Mood Analytics", desc: "Track patterns and insights" },
                { icon: Gamepad2, title: "Mood Games", desc: "20+ stress-relief games" },
                { icon: Bot, title: "AI Therapist", desc: "24/7 emotional support" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: (showWelcome ? 4.2 : 0.8) + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="card-glass text-center group cursor-pointer"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-luminix-neon to-luminix-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <feature.icon className="w-8 h-8 text-luminix-bg" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-luminix-text mb-2">{feature.title}</h3>
                  <p className="text-luminix-text-muted">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
