import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  Mic,
  MicOff,
  Save,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Calendar,
  Heart,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Search,
  Filter,
  Download,
  Share2,
  PlusCircle,
  Edit3,
  Trash2,
  Clock,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Target
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  audioBlob?: Blob;
  mood: 'happy' | 'sad' | 'angry' | 'calm' | 'neutral';
  sentiment: number; // -1 to 1
  keywords: string[];
  duration: number;
  isVoice: boolean;
  aiInsights?: string[];
}

interface MoodAnalysis {
  dominant: string;
  distribution: Record<string, number>;
  trend: number;
  weeklyAverage: number;
}

const moodColors = {
  happy: '#fbbf24',
  calm: '#10b981',
  neutral: '#6b7280',
  sad: '#3b82f6',
  angry: '#ef4444'
};

const moodIcons = {
  happy: <Smile className="w-4 h-4" />,
  calm: <Heart className="w-4 h-4" />,
  neutral: <Meh className="w-4 h-4" />,
  sad: <Frown className="w-4 h-4" />,
  angry: <AlertCircle className="w-4 h-4" />
};

const generateMockEntries = (): JournalEntry[] => {
  const entries: JournalEntry[] = [];
  const moods: Array<'happy' | 'sad' | 'angry' | 'calm' | 'neutral'> = ['happy', 'sad', 'angry', 'calm', 'neutral'];
  const sampleContent = [
    "Today was a really good day. I felt energized and accomplished a lot at work. The weather was beautiful and I went for a nice walk in the park.",
    "I'm feeling a bit overwhelmed with everything going on. Work has been stressful and I haven't been sleeping well. Need to find better ways to manage stress.",
    "Had a wonderful conversation with my friend today. It reminded me how important it is to maintain close relationships and make time for the people I care about.",
    "Feeling grateful for the small things today. My morning coffee tasted especially good, and I noticed the flowers blooming on my way to work.",
    "Work was challenging today but in a good way. I learned something new and feel like I'm growing professionally. Looking forward to tomorrow."
  ];

  for (let i = 10; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    entries.push({
      id: `entry-${i}`,
      date: date.toISOString(),
      content: sampleContent[Math.floor(Math.random() * sampleContent.length)],
      mood: moods[Math.floor(Math.random() * moods.length)],
      sentiment: (Math.random() - 0.5) * 2,
      keywords: ['work', 'relationships', 'gratitude', 'stress', 'growth'].slice(0, Math.floor(Math.random() * 3) + 1),
      duration: Math.floor(Math.random() * 300) + 60,
      isVoice: Math.random() > 0.5,
      aiInsights: [
        "Your mood seems to improve when you spend time in nature",
        "Work-related stress appears to be a recurring theme",
        "You show strong resilience and positive coping strategies"
      ].slice(0, Math.floor(Math.random() * 2) + 1)
    });
  }
  
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const analyzeSentiment = (text: string): { sentiment: number; keywords: string[] } => {
  const positiveWords = ['good', 'great', 'happy', 'wonderful', 'amazing', 'love', 'joy', 'grateful', 'excited', 'peaceful'];
  const negativeWords = ['bad', 'terrible', 'sad', 'angry', 'stressed', 'overwhelmed', 'hate', 'worried', 'anxious', 'frustrated'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  const foundKeywords: string[] = [];

  words.forEach(word => {
    if (positiveWords.includes(word)) {
      score += 1;
      foundKeywords.push(word);
    } else if (negativeWords.includes(word)) {
      score -= 1;
      foundKeywords.push(word);
    }
  });

  const sentiment = Math.max(-1, Math.min(1, score / Math.max(words.length / 10, 1)));
  return { sentiment, keywords: [...new Set(foundKeywords)] };
};

const detectMoodFromText = (text: string): 'happy' | 'sad' | 'angry' | 'calm' | 'neutral' => {
  const analysis = analyzeSentiment(text);
  
  if (analysis.sentiment > 0.3) return 'happy';
  if (analysis.sentiment < -0.3) return 'sad';
  if (text.toLowerCase().includes('angry') || text.toLowerCase().includes('mad')) return 'angry';
  if (text.toLowerCase().includes('calm') || text.toLowerCase().includes('peaceful')) return 'calm';
  return 'neutral';
};

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentEntry, setCurrentEntry] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingEntry, setPlayingEntry] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'voice' | 'text'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedMood, setSelectedMood] = useState<'happy' | 'sad' | 'angry' | 'calm' | 'neutral'>('neutral');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout>();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentEntry(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current?.start();
        }
      };
    }

    // Load mock data
    setEntries(generateMockEntries());
  }, []);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setShowNewEntry(true);
      setCurrentEntry('');

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied. You can still create text entries.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        saveEntry(audioBlob);
      };
    }
  };

  // Save entry
  const saveEntry = (audioBlob?: Blob) => {
    if (!currentEntry.trim()) return;

    const analysis = analyzeSentiment(currentEntry);
    const detectedMood = detectMoodFromText(currentEntry);

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: currentEntry,
      audioBlob,
      mood: selectedMood || detectedMood,
      sentiment: analysis.sentiment,
      keywords: analysis.keywords,
      duration: recordingTime,
      isVoice: !!audioBlob,
      aiInsights: generateInsights(currentEntry, analysis.sentiment)
    };

    setEntries(prev => [newEntry, ...prev]);
    setCurrentEntry('');
    setShowNewEntry(false);
    setSelectedMood('neutral');
  };

  // Generate AI insights
  const generateInsights = (content: string, sentiment: number): string[] => {
    const insights: string[] = [];
    
    if (sentiment > 0.3) {
      insights.push("You're showing positive emotional patterns today!");
    } else if (sentiment < -0.3) {
      insights.push("Consider trying some mood-boosting activities");
    }

    if (content.toLowerCase().includes('work')) {
      insights.push("Work seems to be a significant part of your thoughts");
    }

    if (content.toLowerCase().includes('stress')) {
      insights.push("Try some breathing exercises to manage stress");
    }

    return insights;
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesFilter = filter === 'all' || 
      (filter === 'voice' && entry.isVoice) || 
      (filter === 'text' && !entry.isVoice);
    
    const matchesSearch = searchTerm === '' || 
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Calculate mood analysis
  const moodAnalysis: MoodAnalysis = {
    dominant: 'neutral',
    distribution: {},
    trend: 0,
    weeklyAverage: 0
  };

  if (entries.length > 0) {
    const recentEntries = entries.slice(0, 7);
    const moodCounts = recentEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    moodAnalysis.distribution = moodCounts;
    moodAnalysis.dominant = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
    moodAnalysis.weeklyAverage = recentEntries.reduce((sum, entry) => sum + entry.sentiment, 0) / recentEntries.length;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            {/* Filter buttons */}
            <div className="flex items-center space-x-2 glass-subtle rounded-lg p-1">
              {(['all', 'voice', 'text'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    filter === filterType
                      ? 'bg-luminix-green text-luminix-bg'
                      : 'text-luminix-text-muted hover:text-luminix-text'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
            
            <motion.button 
              onClick={startRecording}
              disabled={isRecording}
              className={`btn-glass p-3 ${isRecording ? 'neon-border' : ''}`}
              whileHover={{ scale: 1.05 }}
            >
              <Mic className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gradient-neon mb-4">Voice Mood Journal</h1>
          <p className="text-xl text-luminix-text-muted">
            Capture your thoughts and emotions with voice or text entries
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main journal area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recording interface */}
            <AnimatePresence>
              {(showNewEntry || isRecording) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card-glass"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-luminix-text">New Journal Entry</h2>
                    {isRecording && (
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-3 h-3 bg-red-500 rounded-full"
                        />
                        <span className="text-luminix-text font-medium">{formatTime(recordingTime)}</span>
                      </div>
                    )}
                  </div>

                  <textarea
                    value={currentEntry}
                    onChange={(e) => setCurrentEntry(e.target.value)}
                    placeholder={isRecording ? "Speak now... your words will appear here" : "Write your thoughts or start recording to speak them..."}
                    className="w-full h-32 p-4 bg-luminix-surface border border-luminix-surface rounded-lg text-luminix-text placeholder-luminix-text-muted focus:outline-none focus:border-luminix-neon transition-colors resize-none"
                    disabled={isRecording}
                  />

                  {/* Mood selector */}
                  <div className="mt-4">
                    <label className="block text-luminix-text-muted text-sm mb-2">How are you feeling?</label>
                    <div className="flex items-center space-x-3">
                      {Object.entries(moodIcons).map(([mood, icon]) => (
                        <motion.button
                          key={mood}
                          onClick={() => setSelectedMood(mood as any)}
                          className={`p-3 rounded-lg transition-all ${
                            selectedMood === mood
                              ? 'neon-border'
                              : 'glass-subtle hover:glass-strong'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          style={{ 
                            backgroundColor: selectedMood === mood ? `${moodColors[mood as keyof typeof moodColors]}20` : undefined 
                          }}
                        >
                          <div style={{ color: moodColors[mood as keyof typeof moodColors] }}>
                            {icon}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-3">
                      {isRecording ? (
                        <motion.button
                          onClick={stopRecording}
                          className="btn-glass bg-red-500/20 border-red-500 text-red-400"
                          whileHover={{ scale: 1.05 }}
                        >
                          <MicOff className="w-5 h-5 mr-2" />
                          Stop Recording
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={startRecording}
                          className="btn-glass"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Mic className="w-5 h-5 mr-2" />
                          Record Voice
                        </motion.button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => setShowNewEntry(false)}
                        className="btn-glass"
                        whileHover={{ scale: 1.05 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={() => saveEntry()}
                        disabled={!currentEntry.trim()}
                        className="btn-luminix disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Save Entry
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luminix-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your journal entries..."
                className="w-full pl-12 pr-4 py-3 bg-luminix-surface border border-luminix-surface rounded-lg text-luminix-text placeholder-luminix-text-muted focus:outline-none focus:border-luminix-neon transition-colors"
              />
            </div>

            {/* Journal entries */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-luminix-text">
                  Your Entries ({filteredEntries.length})
                </h2>
                {!showNewEntry && (
                  <motion.button
                    onClick={() => setShowNewEntry(true)}
                    className="btn-luminix flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>New Entry</span>
                  </motion.button>
                )}
              </div>

              <AnimatePresence>
                {filteredEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-glass"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: moodColors[entry.mood], color: 'white' }}
                        >
                          {moodIcons[entry.mood]}
                        </div>
                        <div>
                          <div className="text-luminix-text font-medium">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                          <div className="text-luminix-text-muted text-sm flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span>{entry.isVoice ? `Voice • ${formatTime(entry.duration)}` : 'Text entry'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {entry.audioBlob && (
                          <motion.button
                            onClick={() => setPlayingEntry(playingEntry === entry.id ? null : entry.id)}
                            className="btn-glass p-2"
                            whileHover={{ scale: 1.05 }}
                          >
                            {playingEntry === entry.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </motion.button>
                        )}
                        <motion.button className="btn-glass p-2" whileHover={{ scale: 1.05 }}>
                          <Share2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    <p className="text-luminix-text leading-relaxed mb-4">{entry.content}</p>

                    {entry.keywords.length > 0 && (
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-luminix-text-muted text-sm">Keywords:</span>
                        {entry.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-luminix-surface rounded-full text-xs text-luminix-text"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}

                    {entry.aiInsights && entry.aiInsights.length > 0 && (
                      <div className="glass-subtle rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Brain className="w-4 h-4 text-luminix-neon" />
                          <span className="text-luminix-neon text-sm font-medium">AI Insights</span>
                        </div>
                        <ul className="space-y-1">
                          {entry.aiInsights.map((insight, idx) => (
                            <li key={idx} className="text-luminix-text-muted text-sm flex items-start space-x-2">
                              <Sparkles className="w-3 h-3 mt-0.5 text-luminix-neon" />
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredEntries.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <MessageSquare className="w-16 h-16 text-luminix-text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-luminix-text mb-2">No entries found</h3>
                  <p className="text-luminix-text-muted">
                    {searchTerm ? 'Try adjusting your search terms' : 'Start your journal journey by creating your first entry'}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar with insights */}
          <div className="space-y-6">
            {/* Mood overview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-glass"
            >
              <h3 className="text-lg font-bold text-luminix-text mb-4">Mood Overview</h3>
              
              <div className="text-center mb-4">
                <div 
                  className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: moodColors[moodAnalysis.dominant as keyof typeof moodColors] || moodColors.neutral }}
                >
                  {moodIcons[moodAnalysis.dominant as keyof typeof moodIcons] || moodIcons.neutral}
                </div>
                <div className="text-luminix-text font-medium capitalize">{moodAnalysis.dominant}</div>
                <div className="text-luminix-text-muted text-sm">Dominant this week</div>
              </div>

              <div className="space-y-3">
                {Object.entries(moodAnalysis.distribution).map(([mood, count]) => (
                  <div key={mood} className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: moodColors[mood as keyof typeof moodColors] }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-luminix-text capitalize">{mood}</span>
                        <span className="text-luminix-text-muted">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-glass"
            >
              <h3 className="text-lg font-bold text-luminix-text mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-luminix-text-muted">Total Entries</span>
                  <span className="text-luminix-text font-medium">{entries.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-luminix-text-muted">This Week</span>
                  <span className="text-luminix-text font-medium">{entries.slice(0, 7).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-luminix-text-muted">Voice Entries</span>
                  <span className="text-luminix-text font-medium">{entries.filter(e => e.isVoice).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-luminix-text-muted">Avg. Sentiment</span>
                  <span className={`font-medium ${moodAnalysis.weeklyAverage >= 0 ? 'text-luminix-green' : 'text-mood-sad'}`}>
                    {moodAnalysis.weeklyAverage >= 0 ? '+' : ''}{moodAnalysis.weeklyAverage.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-glass"
            >
              <h3 className="text-lg font-bold text-luminix-text mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/analytics">
                  <motion.button
                    className="w-full btn-glass text-left flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>View Analytics</span>
                  </motion.button>
                </Link>
                <Link to="/games">
                  <motion.button
                    className="w-full btn-glass text-left flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Target className="w-4 h-4" />
                    <span>Mood Games</span>
                  </motion.button>
                </Link>
                <Link to="/therapy">
                  <motion.button
                    className="w-full btn-glass text-left flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Talk to Luna</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
