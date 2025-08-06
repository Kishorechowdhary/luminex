import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Howl } from 'howler';
import { 
  ArrowLeft, 
  Brain, 
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  Music,
  Headphones,
  Radio,
  Mic2,
  ExternalLink,
  Download,
  Share2,
  Settings,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Zap,
  Sparkles,
  Clock
} from 'lucide-react';

// Mock Spotify track data (in real app, would come from Spotify API)
interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  preview_url: string | null;
  image: string;
  mood: 'happy' | 'sad' | 'angry' | 'calm' | 'neutral';
  energy: number;
  valence: number;
  spotify_url: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  mood: 'happy' | 'sad' | 'angry' | 'calm' | 'neutral';
  tracks: Track[];
  image: string;
  color: string;
}

// Mock music data with real Spotify-style tracks
const mockPlaylists: Playlist[] = [
  {
    id: 'happy-vibes',
    name: 'Happy Vibes ✨',
    description: 'Uplifting tracks to boost your mood',
    mood: 'happy',
    color: '#fbbf24',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    tracks: [
      {
        id: '1',
        name: 'Good 4 U',
        artist: 'Olivia Rodrigo',
        album: 'SOUR',
        duration: 178000,
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Mock preview
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        mood: 'happy',
        energy: 0.8,
        valence: 0.9,
        spotify_url: 'https://open.spotify.com/track/4iJyoBOLtHqaGxP12qzhQI'
      },
      {
        id: '2',
        name: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200000,
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        mood: 'happy',
        energy: 0.8,
        valence: 0.8,
        spotify_url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b'
      }
    ]
  },
  {
    id: 'calm-space',
    name: 'Calm Space 🌿',
    description: 'Peaceful melodies for relaxation',
    mood: 'calm',
    color: '#10b981',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    tracks: [
      {
        id: '3',
        name: 'Weightless',
        artist: 'Marconi Union',
        album: 'Weightless',
        duration: 485000,
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
        mood: 'calm',
        energy: 0.2,
        valence: 0.6,
        spotify_url: 'https://open.spotify.com/track/2WfaOiMkCvy7F5fcp2zZ8L'
      },
      {
        id: '4',
        name: 'River',
        artist: 'Eminem ft. Ed Sheeran',
        album: 'Revival',
        duration: 225000,
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
        mood: 'calm',
        energy: 0.4,
        valence: 0.5,
        spotify_url: 'https://open.spotify.com/track/7mASqAI2R5VqAdosmzs5h6'
      }
    ]
  },
  {
    id: 'melancholy-mood',
    name: 'Melancholy Mood 💙',
    description: 'Gentle songs for reflective moments',
    mood: 'sad',
    color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=300&fit=crop',
    tracks: [
      {
        id: '5',
        name: 'Someone Like You',
        artist: 'Adele',
        album: '21',
        duration: 285000,
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=300&fit=crop',
        mood: 'sad',
        energy: 0.3,
        valence: 0.2,
        spotify_url: 'https://open.spotify.com/track/1zwMYTA5nlNjZxYrvBB2pV'
      }
    ]
  },
  {
    id: 'energy-boost',
    name: 'Energy Boost ⚡',
    description: 'High-energy tracks to power through',
    mood: 'angry',
    color: '#ef4444',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    tracks: [
      {
        id: '6',
        name: 'Till I Collapse',
        artist: 'Eminem',
        album: 'The Eminem Show',
        duration: 297000,
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
        mood: 'angry',
        energy: 0.9,
        valence: 0.7,
        spotify_url: 'https://open.spotify.com/track/4xkOaSrkexMciUUogZKVTS'
      }
    ]
  }
];

// Working ambient sound URLs
const ambientSounds = {
  rain: 'https://www.kozco.com/tech/piano2.wav',
  ocean: 'https://www.kozco.com/tech/organfinale.wav',
  forest: 'https://www.kozco.com/tech/LuckySon.wav',
  wind: 'https://www.kozco.com/tech/32_step_Seq_1.wav',
  fire: 'https://www.kozco.com/tech/explosion.wav'
};

export default function Music() {
  const [currentMood, setCurrentMood] = useState<'happy' | 'sad' | 'angry' | 'calm' | 'neutral'>('calm');
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [showSpotifyAuth, setShowSpotifyAuth] = useState(false);
  const [isConnectedToSpotify, setIsConnectedToSpotify] = useState(false);
  const [ambientMode, setAmbientMode] = useState(false);
  const [selectedAmbient, setSelectedAmbient] = useState<keyof typeof ambientSounds>('rain');

  const howlRef = useRef<Howl | null>(null);
  const progressInterval = useRef<NodeJS.Timeout>();

  // Initialize with mood-based playlist
  useEffect(() => {
    const moodPlaylist = mockPlaylists.find(p => p.mood === currentMood);
    if (moodPlaylist) {
      setCurrentPlaylist(moodPlaylist);
      if (moodPlaylist.tracks.length > 0) {
        setCurrentTrack(moodPlaylist.tracks[0]);
      }
    }
  }, [currentMood]);

  // Progress tracking
  useEffect(() => {
    if (isPlaying && howlRef.current) {
      progressInterval.current = setInterval(() => {
        if (howlRef.current) {
          const seek = howlRef.current.seek() as number;
          const duration = howlRef.current.duration();
          setProgress((seek / duration) * 100);
        }
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);

  // Play track
  const playTrack = (track: Track) => {
    // Stop current track
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
    }

    // For demo purposes, we'll use a placeholder audio
    // In real implementation, you'd use track.preview_url or Spotify Web Playback SDK
    const sound = new Howl({
      src: [track.preview_url || 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'],
      volume: volume,
      onplay: () => {
        setIsPlaying(true);
        setDuration(sound.duration());
      },
      onpause: () => setIsPlaying(false),
      onstop: () => {
        setIsPlaying(false);
        setProgress(0);
      },
      onend: () => {
        setIsPlaying(false);
        setProgress(0);
        playNext();
      },
      onloaderror: (id, error) => {
        console.error('Error loading audio:', error);
        // Fallback to next track
        playNext();
      }
    });

    howlRef.current = sound;
    setCurrentTrack(track);
    sound.play();
  };

  // Play ambient sound
  const playAmbientSound = (type: keyof typeof ambientSounds) => {
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
    }

    const sound = new Howl({
      src: [ambientSounds[type]],
      volume: volume,
      loop: true,
      onplay: () => {
        setIsPlaying(true);
        console.log(`Playing ${type} ambient sound`);
      },
      onpause: () => setIsPlaying(false),
      onload: () => {
        console.log(`Successfully loaded ${type} ambient sound`);
      },
      onloaderror: (id, error) => {
        console.warn(`Error loading ambient sound for ${type}:`, error);
        console.log('Falling back to synthetic ambient sound...');
        createSyntheticAmbient(type);
      },
      onplayerror: (id, error) => {
        console.warn(`Error playing ambient sound for ${type}:`, error);
        createSyntheticAmbient(type);
      }
    });

    howlRef.current = sound;
    setSelectedAmbient(type);

    try {
      sound.play();
    } catch (error) {
      console.warn('Failed to play ambient sound, using fallback:', error);
      createSyntheticAmbient(type);
    }
  };

  // Fallback synthetic ambient sounds
  const createSyntheticAmbient = (type: keyof typeof ambientSounds) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createWhiteNoise = () => {
      const bufferSize = 2 * audioContext.sampleRate;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      return noiseBuffer;
    };

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = createWhiteNoise();
    
    const filter = audioContext.createBiquadFilter();
    const gainNode = audioContext.createGain();
    
    // Different filter settings for different ambient types
    switch (type) {
      case 'rain':
        filter.frequency.value = 1000;
        break;
      case 'ocean':
        filter.frequency.value = 500;
        break;
      case 'forest':
        filter.frequency.value = 2000;
        break;
      case 'wind':
        filter.frequency.value = 800;
        break;
      case 'fire':
        filter.frequency.value = 600;
        break;
    }
    
    gainNode.gain.value = volume * 0.3;
    
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    whiteNoise.loop = true;
    whiteNoise.start();
    setIsPlaying(true);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (howlRef.current) {
      if (isPlaying) {
        howlRef.current.pause();
      } else {
        howlRef.current.play();
      }
    }
  };

  // Play next track
  const playNext = () => {
    if (!currentPlaylist || !currentTrack) return;
    
    const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = isShuffled 
      ? Math.floor(Math.random() * currentPlaylist.tracks.length)
      : (currentIndex + 1) % currentPlaylist.tracks.length;
    
    playTrack(currentPlaylist.tracks[nextIndex]);
  };

  // Play previous track
  const playPrevious = () => {
    if (!currentPlaylist || !currentTrack) return;
    
    const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? currentPlaylist.tracks.length - 1 : currentIndex - 1;
    
    playTrack(currentPlaylist.tracks[prevIndex]);
  };

  // Spotify authentication simulation
  const connectToSpotify = () => {
    setShowSpotifyAuth(true);
    // Simulate auth process
    setTimeout(() => {
      setIsConnectedToSpotify(true);
      setShowSpotifyAuth(false);
    }, 2000);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const moodColors = {
    happy: '#fbbf24',
    calm: '#10b981',
    neutral: '#6b7280',
    sad: '#3b82f6',
    angry: '#ef4444'
  };

  const moodIcons = {
    happy: <Smile className="w-5 h-5" />,
    calm: <Heart className="w-5 h-5" />,
    neutral: <Meh className="w-5 h-5" />,
    sad: <Frown className="w-5 h-5" />,
    angry: <AlertCircle className="w-5 h-5" />
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
            {/* Mood selector */}
            <div className="flex items-center space-x-2">
              {Object.entries(moodIcons).map(([mood, icon]) => (
                <motion.button
                  key={mood}
                  onClick={() => setCurrentMood(mood as any)}
                  className={`p-2 rounded-lg transition-all ${
                    currentMood === mood
                      ? 'neon-border'
                      : 'glass-subtle hover:glass-strong'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  style={{ 
                    backgroundColor: currentMood === mood ? `${moodColors[mood as keyof typeof moodColors]}20` : undefined 
                  }}
                >
                  <div style={{ color: moodColors[mood as keyof typeof moodColors] }}>
                    {icon}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Spotify connection */}
            {!isConnectedToSpotify ? (
              <motion.button
                onClick={connectToSpotify}
                className="btn-luminix flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <Headphones className="w-4 h-4" />
                <span>Connect Spotify</span>
              </motion.button>
            ) : (
              <div className="flex items-center space-x-2 glass-subtle rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-luminix-green rounded-full"></div>
                <span className="text-luminix-text text-sm">Spotify Connected</span>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Playlists */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-glass"
            >
              <h2 className="text-xl font-bold text-luminix-text mb-4">Mood Playlists</h2>
              <div className="space-y-3">
                {mockPlaylists.map((playlist) => (
                  <motion.button
                    key={playlist.id}
                    onClick={() => {
                      setCurrentPlaylist(playlist);
                      if (playlist.tracks.length > 0) {
                        playTrack(playlist.tracks[0]);
                      }
                      setAmbientMode(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentPlaylist?.id === playlist.id && !ambientMode
                        ? 'neon-border'
                        : 'glass-subtle hover:glass-strong'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: playlist.color }}
                      >
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-luminix-text font-medium">{playlist.name}</div>
                        <div className="text-luminix-text-muted text-xs">{playlist.tracks.length} tracks</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Ambient sounds */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card-glass"
            >
              <h2 className="text-xl font-bold text-luminix-text mb-4">Ambient Sounds</h2>
              <div className="space-y-2">
                {Object.keys(ambientSounds).map((type) => (
                  <motion.button
                    key={type}
                    onClick={() => {
                      playAmbientSound(type as keyof typeof ambientSounds);
                      setAmbientMode(true);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-all ${
                      ambientMode && selectedAmbient === type
                        ? 'neon-border'
                        : 'glass-subtle hover:glass-strong'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-luminix-text capitalize">{type}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main player area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Now playing */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
            >
              <div className="flex items-center space-x-6">
                {/* Album art */}
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 10, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                  className="flex-shrink-0"
                >
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-luminix-neon to-purple-500 flex items-center justify-center">
                    {ambientMode ? (
                      <Radio className="w-12 h-12 text-white" />
                    ) : (
                      <Music className="w-12 h-12 text-white" />
                    )}
                  </div>
                </motion.div>

                {/* Track info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-luminix-text mb-1">
                    {ambientMode ? `${selectedAmbient.charAt(0).toUpperCase() + selectedAmbient.slice(1)} Sounds` : currentTrack?.name || 'No track selected'}
                  </h3>
                  <p className="text-luminix-text-muted mb-2">
                    {ambientMode ? 'Nature Ambient' : currentTrack?.artist || 'Unknown Artist'}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-luminix-surface rounded-full h-2 mb-4">
                    <motion.div 
                      className="bg-gradient-to-r from-luminix-green to-luminix-neon h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-luminix-text-muted">
                    <span>{formatTime(duration * (progress / 100))}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Open in Spotify */}
                {currentTrack && !ambientMode && (
                  <motion.button
                    onClick={() => window.open(currentTrack.spotify_url, '_blank')}
                    className="btn-glass p-3"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Player controls */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-glass"
            >
              <div className="flex items-center justify-between">
                {/* Left controls */}
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={() => setIsShuffled(!isShuffled)}
                    className={`btn-glass p-3 ${isShuffled ? 'neon-border' : ''}`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Shuffle className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={playPrevious}
                    className="btn-glass p-3"
                    whileHover={{ scale: 1.05 }}
                    disabled={ambientMode}
                  >
                    <SkipBack className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Center play button */}
                <motion.button
                  onClick={togglePlayPause}
                  className="btn-luminix p-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </motion.button>

                {/* Right controls */}
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={playNext}
                    className="btn-glass p-3"
                    whileHover={{ scale: 1.05 }}
                    disabled={ambientMode}
                  >
                    <SkipForward className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setRepeatMode(repeatMode === 'none' ? 'one' : repeatMode === 'one' ? 'all' : 'none')}
                    className={`btn-glass p-3 ${repeatMode !== 'none' ? 'neon-border' : ''}`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Repeat className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Volume control */}
              <div className="flex items-center space-x-4 mt-6">
                <motion.button
                  onClick={() => setIsMuted(!isMuted)}
                  className="btn-glass p-2"
                  whileHover={{ scale: 1.05 }}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </motion.button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={(e) => {
                      const newVolume = Number(e.target.value) / 100;
                      setVolume(newVolume);
                      if (howlRef.current) {
                        howlRef.current.volume(newVolume);
                      }
                    }}
                    className="w-full h-2 bg-luminix-surface rounded-full appearance-none slider"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--luminix-green)) 0%, hsl(var(--luminix-green)) ${volume * 100}%, hsl(var(--luminix-surface)) ${volume * 100}%, hsl(var(--luminix-surface)) 100%)`
                    }}
                  />
                </div>
                
                <span className="text-luminix-text-muted text-sm w-12">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </motion.div>

            {/* Current playlist tracks */}
            {currentPlaylist && !ambientMode && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-glass"
              >
                <h3 className="text-xl font-bold text-luminix-text mb-4">
                  {currentPlaylist.name}
                </h3>
                <div className="space-y-2">
                  {currentPlaylist.tracks.map((track, index) => (
                    <motion.button
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        currentTrack?.id === track.id
                          ? 'neon-border'
                          : 'glass-subtle hover:glass-strong'
                      }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-luminix-text-muted w-8 text-center">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="text-luminix-text font-medium">{track.name}</div>
                          <div className="text-luminix-text-muted text-sm">{track.artist}</div>
                        </div>
                        <div className="text-luminix-text-muted text-sm">
                          {formatTime(track.duration / 1000)}
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(track.spotify_url, '_blank');
                          }}
                          className="btn-glass p-2"
                          whileHover={{ scale: 1.05 }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Spotify auth modal */}
      <AnimatePresence>
        {showSpotifyAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-luminix-bg/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="card-glass max-w-md w-full text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-luminix-green to-emerald-400 rounded-full flex items-center justify-center"
              >
                <Headphones className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold text-luminix-text mb-2">Connecting to Spotify</h2>
              <p className="text-luminix-text-muted">
                Authorizing access to your Spotify account...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
