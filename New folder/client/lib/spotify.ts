import { SpotifyApi, SpotifyWebApi } from '@spotify/web-api-ts-sdk';

// Spotify configuration
const SPOTIFY_CONFIG = {
  client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'demo_client_id',
  client_secret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || 'demo_client_secret',
  redirect_uri: window.location.origin + '/auth/spotify/callback',
  scopes: [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative'
  ]
};

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  energy?: number;
  valence?: number;
  danceability?: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: SpotifyTrack[];
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

class SpotifyService {
  private sdk: SpotifyWebApi | null = null;
  private player: Spotify.Player | null = null;
  private device_id: string | null = null;
  private isInitialized = false;

  // Initialize Spotify SDK
  async initialize(): Promise<boolean> {
    try {
      console.log('🎵 Initializing Spotify service...');

      // Check if we have actual Spotify credentials
      const hasCredentials = SPOTIFY_CONFIG.client_id !== 'demo_client_id' &&
                            SPOTIFY_CONFIG.client_id.length > 10;

      if (hasCredentials) {
        // Load Spotify Web Playback SDK for real integration
        await this.loadSpotifySDK();
        console.log('🎵 Spotify SDK loaded - real integration available');
      } else {
        console.log('🎵 Running in demo mode - using preview tracks');
      }

      this.isInitialized = true;
      console.log('✅ Spotify service initialized');
      return true;
    } catch (error) {
      console.warn('⚠️ Spotify SDK load failed, using demo mode:', error);
      this.isInitialized = true; // Still allow demo mode
      return true;
    }
  }

  // Load Spotify Web Playback SDK
  private async loadSpotifySDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if SDK is already loaded
      if (window.Spotify) {
        console.log('🎵 Spotify SDK already loaded');
        resolve();
        return;
      }

      // Set up SDK ready callback before loading script
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('🎵 Spotify Web Playback SDK ready');
        resolve();
      };

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
      if (existingScript) {
        console.log('🎵 Spotify SDK script already loading...');
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      script.onload = () => {
        console.log('🎵 Spotify SDK script loaded');
        // SDK ready callback will be called automatically
      };

      script.onerror = (error) => {
        console.warn('⚠️ Failed to load Spotify SDK script:', error);
        reject(new Error('Failed to load Spotify SDK'));
      };

      document.head.appendChild(script);

      // Timeout fallback
      setTimeout(() => {
        if (!window.Spotify) {
          reject(new Error('Spotify SDK load timeout'));
        }
      }, 10000);
    });
  }

  // Initialize Web Playback SDK
  async initializePlayer(accessToken: string): Promise<boolean> {
    try {
      if (!window.Spotify) {
        throw new Error('Spotify SDK not loaded');
      }

      this.player = new window.Spotify.Player({
        name: 'LUMINIX ECO MIND Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(accessToken);
        },
        volume: 0.3
      });

      // Set up event listeners
      this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('🎵 Spotify player ready with Device ID:', device_id);
        this.device_id = device_id;
      });

      this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('⚠️ Device ID has gone offline:', device_id);
      });

      this.player.addListener('player_state_changed', (state: Spotify.PlaybackState | null) => {
        if (state) {
          console.log('🎵 Player state changed:', state);
        }
      });

      // Connect to the player
      const connected = await this.player.connect();
      return connected;
    } catch (error) {
      console.error('❌ Failed to initialize Spotify player:', error);
      return false;
    }
  }

  // Get mood-based playlists
  async getMoodPlaylists(mood: string): Promise<SpotifyPlaylist[]> {
    // Mock playlists for demo - in production, use Spotify API
    const mockPlaylists: SpotifyPlaylist[] = [
      {
        id: `${mood}-playlist-1`,
        name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes`,
        description: `Perfect ${mood} music for your mood`,
        images: [{
          url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
          height: 300,
          width: 300
        }],
        tracks: await this.getMoodTracks(mood)
      }
    ];

    return mockPlaylists;
  }

  // Get tracks for specific mood
  async getMoodTracks(mood: string): Promise<SpotifyTrack[]> {
    // Mock tracks for demo - in production, use Spotify API search
    const moodTracks: Record<string, SpotifyTrack[]> = {
      happy: [
        {
          id: 'happy-1',
          name: 'Good 4 U',
          artist: 'Olivia Rodrigo',
          album: 'SOUR',
          duration_ms: 178000,
          preview_url: 'https://www.kozco.com/tech/piano2.wav',
          external_urls: { spotify: 'https://open.spotify.com/track/4iJyoBOLtHqaGxP12qzhQI' },
          images: [{
            url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            height: 300,
            width: 300
          }],
          energy: 0.8,
          valence: 0.9
        },
        {
          id: 'happy-2',
          name: 'Blinding Lights',
          artist: 'The Weeknd',
          album: 'After Hours',
          duration_ms: 200000,
          preview_url: 'https://www.kozco.com/tech/piano2.wav',
          external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b' },
          images: [{
            url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            height: 300,
            width: 300
          }],
          energy: 0.8,
          valence: 0.8
        }
      ],
      calm: [
        {
          id: 'calm-1',
          name: 'Weightless',
          artist: 'Marconi Union',
          album: 'Weightless',
          duration_ms: 485000,
          preview_url: 'https://www.kozco.com/tech/piano2.wav',
          external_urls: { spotify: 'https://open.spotify.com/track/2WfaOiMkCvy7F5fcp2zZ8L' },
          images: [{
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
            height: 300,
            width: 300
          }],
          energy: 0.2,
          valence: 0.6
        }
      ],
      sad: [
        {
          id: 'sad-1',
          name: 'Someone Like You',
          artist: 'Adele',
          album: '21',
          duration_ms: 285000,
          preview_url: 'https://www.kozco.com/tech/piano2.wav',
          external_urls: { spotify: 'https://open.spotify.com/track/1zwMYTA5nlNjZxYrvBB2pV' },
          images: [{
            url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=300&fit=crop',
            height: 300,
            width: 300
          }],
          energy: 0.3,
          valence: 0.2
        }
      ],
      angry: [
        {
          id: 'angry-1',
          name: 'Till I Collapse',
          artist: 'Eminem',
          album: 'The Eminem Show',
          duration_ms: 297000,
          preview_url: 'https://www.kozco.com/tech/piano2.wav',
          external_urls: { spotify: 'https://open.spotify.com/track/4xkOaSrkexMciUUogZKVTS' },
          images: [{
            url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
            height: 300,
            width: 300
          }],
          energy: 0.9,
          valence: 0.7
        }
      ],
      neutral: [
        {
          id: 'neutral-1',
          name: 'Memories',
          artist: 'Maroon 5',
          album: 'Jordi',
          duration_ms: 189000,
          preview_url: 'https://www.kozco.com/tech/piano2.wav',
          external_urls: { spotify: 'https://open.spotify.com/track/2b8fOow8UzyDFAE27YhOZM' },
          images: [{
            url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            height: 300,
            width: 300
          }],
          energy: 0.5,
          valence: 0.5
        }
      ]
    };

    return moodTracks[mood] || moodTracks.neutral;
  }

  // Play a track
  async playTrack(trackId: string): Promise<boolean> {
    try {
      if (!this.player || !this.device_id) {
        console.warn('⚠️ Spotify player not ready, using preview mode');
        return false;
      }

      // In production, use Spotify Web API to play tracks
      console.log(`🎵 Playing track: ${trackId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to play track:', error);
      return false;
    }
  }

  // Control playback
  async play(): Promise<boolean> {
    try {
      if (this.player) {
        await this.player.resume();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to play:', error);
      return false;
    }
  }

  async pause(): Promise<boolean> {
    try {
      if (this.player) {
        await this.player.pause();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to pause:', error);
      return false;
    }
  }

  async setVolume(volume: number): Promise<boolean> {
    try {
      if (this.player) {
        await this.player.setVolume(volume);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to set volume:', error);
      return false;
    }
  }

  // Get current playback state
  async getCurrentState(): Promise<Spotify.PlaybackState | null> {
    try {
      if (this.player) {
        return await this.player.getCurrentState();
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get current state:', error);
      return null;
    }
  }

  // Search for tracks
  async searchTracks(query: string, mood?: string): Promise<SpotifyTrack[]> {
    // Mock search for demo - in production, use Spotify Web API
    console.log(`🔍 Searching for: ${query} (mood: ${mood})`);
    
    if (mood) {
      return await this.getMoodTracks(mood);
    }
    
    return [];
  }

  // Authenticate with Spotify
  getAuthUrl(): string {
    // In demo mode, return a placeholder URL
    if (SPOTIFY_CONFIG.client_id === 'demo_client_id') {
      console.log('🎵 Demo mode - Spotify auth not available');
      return '#demo-mode';
    }

    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.client_id,
      response_type: 'code',
      redirect_uri: SPOTIFY_CONFIG.redirect_uri,
      scope: SPOTIFY_CONFIG.scopes.join(' '),
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Check if connected
  isConnected(): boolean {
    return this.isInitialized && this.player !== null;
  }

  // Disconnect
  disconnect(): void {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
      this.device_id = null;
    }
    this.isInitialized = false;
  }
}

// Extend Window interface for Spotify
declare global {
  interface Window {
    Spotify: typeof Spotify;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

// Create singleton instance
export const spotifyService = new SpotifyService();

export default SpotifyService;
