import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Heart,
  Sparkles,
  MessageCircle,
  Lightbulb,
  Target,
  Book,
  RefreshCw,
  Volume2,
  Smile,
  Frown,
  ThumbsUp,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  mood?: 'supportive' | 'encouraging' | 'analytical' | 'empathetic';
  suggestions?: string[];
}

interface TherapySession {
  id: string;
  startTime: Date;
  duration: number;
  messageCount: number;
  mood: string;
  insights: string[];
}

const therapyPrompts = {
  welcome: [
    "Hello! I'm Luna, your AI therapy companion. How are you feeling today?",
    "Hi there! I'm here to listen and support you. What's on your mind?",
    "Welcome to our safe space. I'm Luna, and I'm here whenever you need to talk.",
  ],
  supportive: [
    "That sounds really challenging. You're being very brave by sharing this with me.",
    "I hear you, and your feelings are completely valid.",
    "Thank you for trusting me with these thoughts. You're not alone in this.",
    "It takes courage to open up about difficult feelings. I'm proud of you for that.",
  ],
  encouraging: [
    "You've overcome difficult situations before, and I believe you can work through this too.",
    "Small steps forward are still progress. You're doing better than you think.",
    "Your resilience is one of your strengths. Let's build on that.",
    "Every challenge is an opportunity to grow stronger. You've got this.",
  ],
  analytical: [
    "Let's explore this pattern you've noticed. When did you first become aware of it?",
    "What do you think might be the root cause of these feelings?",
    "Can you identify any triggers that tend to bring up these emotions?",
    "How do you typically respond when you feel this way?",
  ],
  questions: [
    "How has your sleep been lately?",
    "What activities usually help you feel better?",
    "Are there any specific situations that tend to stress you out?",
    "What are three things you're grateful for today?",
    "How would you rate your energy levels this week?",
    "What's one small thing that brought you joy recently?",
  ]
};

const moodResponses = {
  happy: {
    responses: [
      "It's wonderful to hear you're feeling happy! What's been bringing you joy lately?",
      "Your positive energy is infectious! Tell me more about what's going well.",
      "I love seeing you in such good spirits. What would you like to talk about today?",
    ],
    suggestions: ["Gratitude journaling", "Share your joy with others", "Plan a celebration"]
  },
  sad: {
    responses: [
      "I can sense you're going through a tough time. I'm here to listen without judgment.",
      "Sadness is a natural emotion, and it's okay to feel this way. You don't have to go through this alone.",
      "Thank you for sharing your feelings with me. What's been weighing on your heart?",
    ],
    suggestions: ["Gentle breathing exercises", "Reach out to a friend", "Practice self-compassion"]
  },
  angry: {
    responses: [
      "I can feel the intensity of your emotions. Let's work through this together.",
      "Anger often tells us something important. What's behind these feelings?",
      "It's okay to feel angry. Let's explore what's triggering these emotions.",
    ],
    suggestions: ["Take deep breaths", "Physical exercise", "Journal your thoughts"]
  },
  calm: {
    responses: [
      "I sense a peaceful energy from you today. It's beautiful to see you in this space.",
      "Your calmness is grounding. What's been helping you maintain this balance?",
      "This tranquil state is precious. How can we nurture this feeling?",
    ],
    suggestions: ["Mindfulness practice", "Nature connection", "Creative expression"]
  }
};

export default function Therapy() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentMood, setCurrentMood] = useState<'happy' | 'sad' | 'angry' | 'calm'>('calm');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [aiPersonality, setAiPersonality] = useState<'supportive' | 'encouraging' | 'analytical'>('supportive');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout>();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Session timer
  useEffect(() => {
    if (sessionStarted) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [sessionStarted]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start therapy session
  const startSession = () => {
    setSessionStarted(true);
    const welcomeMessage = therapyPrompts.welcome[Math.floor(Math.random() * therapyPrompts.welcome.length)];
    
    setMessages([{
      id: '1',
      type: 'ai',
      content: welcomeMessage,
      timestamp: new Date(),
      mood: 'supportive',
      suggestions: ['Tell me about your day', 'I\'m feeling anxious', 'I need support', 'I want to talk about relationships']
    }]);
  };

  // Generate AI response
  const generateAIResponse = (userMessage: string): Message => {
    const messageWords = userMessage.toLowerCase();
    let detectedMood: 'happy' | 'sad' | 'angry' | 'calm' = 'calm';
    
    // Simple keyword-based mood detection
    if (messageWords.includes('happy') || messageWords.includes('great') || messageWords.includes('excited') || messageWords.includes('good')) {
      detectedMood = 'happy';
    } else if (messageWords.includes('sad') || messageWords.includes('depressed') || messageWords.includes('down') || messageWords.includes('terrible')) {
      detectedMood = 'sad';
    } else if (messageWords.includes('angry') || messageWords.includes('mad') || messageWords.includes('furious') || messageWords.includes('hate')) {
      detectedMood = 'angry';
    }

    setCurrentMood(detectedMood);

    // Select appropriate response based on detected mood and AI personality
    let responsePool: string[] = [];
    let suggestions: string[] = [];

    if (moodResponses[detectedMood]) {
      responsePool = moodResponses[detectedMood].responses;
      suggestions = moodResponses[detectedMood].suggestions;
    } else {
      responsePool = therapyPrompts[aiPersonality];
    }

    // Add some contextual responses
    if (messageWords.includes('work') || messageWords.includes('job')) {
      responsePool = [
        "Work can be a significant source of stress. What's been challenging you at work lately?",
        "It sounds like work is on your mind. How has it been affecting your wellbeing?",
        "Let's talk about your work situation. What would make it feel more manageable?"
      ];
      suggestions = ['Work-life balance tips', 'Stress management', 'Career guidance'];
    } else if (messageWords.includes('relationship') || messageWords.includes('partner') || messageWords.includes('friend')) {
      responsePool = [
        "Relationships can be complex. Tell me more about what's happening.",
        "It sounds like there's something important about your relationships you'd like to explore.",
        "Human connections are so meaningful. What's been on your mind about your relationships?"
      ];
      suggestions = ['Communication tips', 'Relationship boundaries', 'Conflict resolution'];
    } else if (messageWords.includes('anxiety') || messageWords.includes('anxious') || messageWords.includes('worried')) {
      responsePool = [
        "Anxiety can feel overwhelming. You're not alone in this feeling.",
        "I hear that you're experiencing anxiety. Let's work through this together.",
        "Anxiety is your mind trying to protect you, but sometimes it can be too much. What's been triggering these feelings?"
      ];
      suggestions = ['Breathing exercises', 'Grounding techniques', 'Mindfulness practice'];
    }

    const response = responsePool[Math.floor(Math.random() * responsePool.length)];

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      mood: aiPersonality,
      suggestions: suggestions.length > 0 ? suggestions : therapyPrompts.questions.slice(0, 3)
    };
  };

  // Send message
  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  // Voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Format session time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sessionStarted) {
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
          </div>
        </motion.header>

        {/* Welcome screen */}
        <main className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
              className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-luminix-neon to-purple-500 rounded-full flex items-center justify-center"
            >
              <Bot className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold text-gradient-neon mb-6">
              AI MoodBot Therapist
            </h1>

            <p className="text-xl text-luminix-text-muted mb-12 leading-relaxed">
              Meet Luna, your personal AI therapy companion. Available 24/7 for emotional support, 
              guidance, and meaningful conversations about your mental wellness journey.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Heart, title: "Empathetic", desc: "Understanding and compassionate responses" },
                { icon: Brain, title: "Intelligent", desc: "Evidence-based therapeutic techniques" },
                { icon: MessageCircle, title: "Available", desc: "24/7 support whenever you need it" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="card-glass text-center"
                >
                  <feature.icon className="w-8 h-8 text-luminix-green mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-luminix-text mb-2">{feature.title}</h3>
                  <p className="text-luminix-text-muted text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={startSession}
              className="btn-luminix text-lg px-12 py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Therapy Session
            </motion.button>

            <p className="text-luminix-text-muted text-sm mt-6">
              Your conversations are private and secure. Luna is here to support, not replace professional therapy.
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Ambient background orbs */}
      <div className="ambient-orb"></div>
      <div className="ambient-orb"></div>
      <div className="ambient-orb"></div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-subtle border-b border-luminix-surface p-4 flex-shrink-0"
      >
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4 group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-luminix-neon to-luminix-green flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-luminix-bg" />
            </motion.div>
            <h1 className="text-xl font-bold text-gradient-neon">Luna AI Therapist</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="glass-subtle rounded-lg px-3 py-1 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-luminix-green" />
              <span className="text-luminix-text font-medium">{formatTime(sessionTime)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {(['supportive', 'encouraging', 'analytical'] as const).map((personality) => (
                <button
                  key={personality}
                  onClick={() => setAiPersonality(personality)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    aiPersonality === personality
                      ? 'bg-luminix-green text-luminix-bg'
                      : 'text-luminix-text-muted hover:text-luminix-text'
                  }`}
                >
                  {personality}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-lg ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-luminix-green to-emerald-400' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                    >
                      {message.type === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </motion.div>
                    
                    <div className={`glass-strong rounded-lg p-4 ${message.type === 'user' ? 'bg-luminix-green/10' : ''}`}>
                      <p className="text-luminix-text leading-relaxed">{message.content}</p>
                      <div className="text-luminix-text-muted text-xs mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      
                      {message.suggestions && message.type === 'ai' && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <motion.button
                              key={index}
                              onClick={() => setInputMessage(suggestion)}
                              className="btn-glass text-xs px-3 py-1"
                              whileHover={{ scale: 1.05 }}
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <Bot className="w-5 h-5 text-white" />
                </motion.div>
                <div className="glass-strong rounded-lg p-4">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 bg-luminix-text-muted rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="glass-subtle border-t border-luminix-surface p-4 flex-shrink-0">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={toggleVoiceInput}
              className={`btn-glass p-3 ${isListening ? 'neon-border' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isListening ? "Listening..." : "Share your thoughts with Luna..."}
                className="w-full px-4 py-3 bg-luminix-surface border border-luminix-surface rounded-lg text-luminix-text placeholder-luminix-text-muted focus:outline-none focus:border-luminix-neon transition-colors"
                disabled={isTyping}
              />
            </div>
            
            <motion.button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="btn-luminix p-3 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
