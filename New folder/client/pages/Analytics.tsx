import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  BarChart3, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Heart,
  Zap,
  Target,
  Award,
  Filter,
  Download,
  Share2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Activity,
  Smile,
  Frown,
  Meh,
  AlertCircle
} from 'lucide-react';

interface MoodEntry {
  date: string;
  mood: 'happy' | 'sad' | 'angry' | 'calm' | 'neutral';
  intensity: number;
  timestamp: string;
  activities: string[];
  location?: string;
  weather?: string;
}

interface WeeklyStats {
  week: string;
  averageMood: number;
  totalSessions: number;
  dominantMood: string;
  improvement: number;
}

const generateMockData = (): MoodEntry[] => {
  const moods: Array<'happy' | 'sad' | 'angry' | 'calm' | 'neutral'> = ['happy', 'sad', 'angry', 'calm', 'neutral'];
  const activities = ['meditation', 'exercise', 'work', 'socializing', 'reading', 'music', 'walking', 'relaxing'];
  const locations = ['home', 'office', 'park', 'gym', 'cafe'];
  const weather = ['sunny', 'cloudy', 'rainy', 'clear'];
  
  const data: MoodEntry[] = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate 1-3 entries per day
    const entriesPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < entriesPerDay; j++) {
      const hour = Math.floor(Math.random() * 16) + 6; // 6 AM to 10 PM
      const minute = Math.floor(Math.random() * 60);
      
      const entryDate = new Date(date);
      entryDate.setHours(hour, minute);
      
      data.push({
        date: date.toISOString().split('T')[0],
        mood: moods[Math.floor(Math.random() * moods.length)],
        intensity: Math.floor(Math.random() * 10) + 1,
        timestamp: entryDate.toISOString(),
        activities: activities.slice(0, Math.floor(Math.random() * 3) + 1),
        location: locations[Math.floor(Math.random() * locations.length)],
        weather: weather[Math.floor(Math.random() * weather.length)]
      });
    }
  }
  
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateWeeklyStats = (data: MoodEntry[]): WeeklyStats[] => {
  const weeks: WeeklyStats[] = [];
  const today = new Date();
  
  for (let i = 4; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekData = data.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
    
    if (weekData.length > 0) {
      const moodValues = { happy: 8, calm: 7, neutral: 5, sad: 3, angry: 2 };
      const avgMood = weekData.reduce((sum, entry) => sum + moodValues[entry.mood], 0) / weekData.length;
      
      const moodCounts = weekData.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dominantMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0][0];
      
      weeks.push({
        week: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        averageMood: avgMood,
        totalSessions: weekData.length,
        dominantMood,
        improvement: i === 4 ? 0 : Math.floor((Math.random() - 0.5) * 20)
      });
    }
  }
  
  return weeks;
};

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const data = generateMockData();
      setMoodData(data);
      setWeeklyStats(generateWeeklyStats(data));
      setIsLoading(false);
    }, 1000);
  }, []);

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

  // Calculate insights
  const recentEntries = moodData.slice(0, 7);
  const currentWeekMood = recentEntries.length > 0 
    ? recentEntries.reduce((sum, entry) => sum + ({ happy: 8, calm: 7, neutral: 5, sad: 3, angry: 2 }[entry.mood]), 0) / recentEntries.length
    : 5;

  const lastWeekEntries = moodData.slice(7, 14);
  const lastWeekMood = lastWeekEntries.length > 0
    ? lastWeekEntries.reduce((sum, entry) => sum + ({ happy: 8, calm: 7, neutral: 5, sad: 3, angry: 2 }[entry.mood]), 0) / lastWeekEntries.length
    : 5;

  const moodTrend = currentWeekMood - lastWeekMood;
  const totalSessions = moodData.length;
  const streakDays = 7; // Mock streak

  // Mood distribution for current period
  const moodDistribution = moodData.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-luminix-neon border-t-transparent rounded-full"
        />
      </div>
    );
  }

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
            {/* Period selector */}
            <div className="flex items-center space-x-2 glass-subtle rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-luminix-green text-luminix-bg'
                      : 'text-luminix-text-muted hover:text-luminix-text'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button 
                className="btn-glass p-2"
                whileHover={{ scale: 1.05 }}
              >
                <Download className="w-4 h-4" />
              </motion.button>
              <motion.button 
                className="btn-glass p-2"
                whileHover={{ scale: 1.05 }}
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            </div>
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
          <h1 className="text-4xl font-bold text-gradient-neon mb-4">Mood Analytics</h1>
          <p className="text-xl text-luminix-text-muted">
            Deep insights into your emotional patterns and wellness journey
          </p>
        </motion.div>

        {/* Key metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="card-glass text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-luminix-green to-emerald-400 rounded-full flex items-center justify-center"
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </motion.div>
            <div className="text-2xl font-bold text-luminix-text mb-1">{currentWeekMood.toFixed(1)}/10</div>
            <div className="text-luminix-text-muted text-sm">Average Mood</div>
            <div className={`text-xs mt-1 flex items-center justify-center ${
              moodTrend >= 0 ? 'text-luminix-green' : 'text-mood-sad'
            }`}>
              {moodTrend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(moodTrend).toFixed(1)} vs last week
            </div>
          </div>

          <div className="card-glass text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-luminix-neon to-blue-400 rounded-full flex items-center justify-center"
            >
              <Activity className="w-6 h-6 text-white" />
            </motion.div>
            <div className="text-2xl font-bold text-luminix-text mb-1">{totalSessions}</div>
            <div className="text-luminix-text-muted text-sm">Total Sessions</div>
            <div className="text-xs mt-1 text-luminix-green">+12 this week</div>
          </div>

          <div className="card-glass text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-mood-happy to-amber-400 rounded-full flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <div className="text-2xl font-bold text-luminix-text mb-1">{streakDays}</div>
            <div className="text-luminix-text-muted text-sm">Day Streak</div>
            <div className="text-xs mt-1 text-mood-happy">🔥 Keep it up!</div>
          </div>

          <div className="card-glass text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center"
            >
              <Award className="w-6 h-6 text-white" />
            </motion.div>
            <div className="text-2xl font-bold text-luminix-text mb-1">Level 5</div>
            <div className="text-luminix-text-muted text-sm">Mindfulness</div>
            <div className="text-xs mt-1 text-purple-400">1,247 XP</div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main chart area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood trend chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-glass"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-luminix-text">Mood Trends</h2>
                <div className="flex items-center space-x-2">
                  <motion.button className="btn-glass p-2" whileHover={{ scale: 1.05 }}>
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <span className="text-luminix-text-muted text-sm">Last 30 days</span>
                  <motion.button className="btn-glass p-2" whileHover={{ scale: 1.05 }}>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Simple line chart visualization */}
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line
                      key={i}
                      x1="40"
                      y1={40 + i * 30}
                      x2="380"
                      y2={40 + i * 30}
                      stroke="hsl(var(--luminix-surface))"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  ))}
                  
                  {/* Mood trend line */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    d={`M 40 ${170 - Math.random() * 80} ${Array.from({ length: 29 }, (_, i) => 
                      `L ${40 + (i + 1) * 11} ${170 - Math.random() * 80}`
                    ).join(' ')}`}
                    fill="none"
                    stroke="url(#moodGradient)"
                    strokeWidth="3"
                    className="drop-shadow-lg"
                  />
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="25%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#6b7280" />
                      <stop offset="75%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-8 text-xs text-luminix-text-muted">
                  <span>Happy</span>
                  <span>Calm</span>
                  <span>Neutral</span>
                  <span>Sad</span>
                  <span>Angry</span>
                </div>
              </div>
            </motion.div>

            {/* Weekly breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-glass"
            >
              <h2 className="text-xl font-bold text-luminix-text mb-6">Weekly Breakdown</h2>
              <div className="space-y-4">
                {weeklyStats.map((week, index) => (
                  <motion.div
                    key={week.week}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-4 glass-subtle rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                        week.averageMood >= 7 ? 'from-mood-happy to-amber-400' :
                        week.averageMood >= 6 ? 'from-mood-calm to-emerald-400' :
                        week.averageMood >= 4 ? 'from-gray-400 to-gray-500' :
                        'from-mood-sad to-blue-400'
                      }`} />
                      <div>
                        <div className="text-luminix-text font-medium">{week.week}</div>
                        <div className="text-luminix-text-muted text-sm">
                          {week.totalSessions} sessions • {week.dominantMood} mood
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-luminix-text font-bold">{week.averageMood.toFixed(1)}/10</div>
                      <div className={`text-xs flex items-center ${
                        week.improvement >= 0 ? 'text-luminix-green' : 'text-mood-sad'
                      }`}>
                        {week.improvement >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(week.improvement)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar with mood distribution and insights */}
          <div className="space-y-8">
            {/* Mood distribution */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-glass"
            >
              <h2 className="text-xl font-bold text-luminix-text mb-6">Mood Distribution</h2>
              <div className="space-y-4">
                {Object.entries(moodDistribution).map(([mood, count]) => {
                  const percentage = (count / totalSessions) * 100;
                  return (
                    <motion.div
                      key={mood}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center space-x-3"
                    >
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: moodColors[mood as keyof typeof moodColors] }}
                      >
                        {moodIcons[mood as keyof typeof moodIcons]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-luminix-text capitalize">{mood}</span>
                          <span className="text-luminix-text-muted text-sm">{count}</span>
                        </div>
                        <div className="w-full bg-luminix-surface rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.6, duration: 1 }}
                            className="h-2 rounded-full"
                            style={{ backgroundColor: moodColors[mood as keyof typeof moodColors] }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card-glass"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-5 h-5 text-luminix-neon" />
                <h2 className="text-xl font-bold text-luminix-text">AI Insights</h2>
              </div>
              <div className="space-y-4">
                <div className="p-3 glass-subtle rounded-lg">
                  <div className="text-luminix-green text-sm font-medium mb-1">✨ Pattern Detected</div>
                  <div className="text-luminix-text-muted text-sm">
                    Your mood tends to improve significantly during afternoon sessions. Consider scheduling important activities then.
                  </div>
                </div>
                <div className="p-3 glass-subtle rounded-lg">
                  <div className="text-luminix-neon text-sm font-medium mb-1">📈 Recommendation</div>
                  <div className="text-luminix-text-muted text-sm">
                    Try morning meditation - users with similar patterns see 23% mood improvement.
                  </div>
                </div>
                <div className="p-3 glass-subtle rounded-lg">
                  <div className="text-mood-happy text-sm font-medium mb-1">🎯 Next Goal</div>
                  <div className="text-luminix-text-muted text-sm">
                    Maintain your streak for 3 more days to unlock the "Mindful Master" achievement.
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card-glass"
            >
              <h2 className="text-xl font-bold text-luminix-text mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/games">
                  <motion.button
                    className="w-full btn-glass text-left flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Target className="w-4 h-4" />
                    <span>Mood Boost Games</span>
                  </motion.button>
                </Link>
                <Link to="/journal">
                  <motion.button
                    className="w-full btn-glass text-left flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Heart className="w-4 h-4" />
                    <span>Voice Journal</span>
                  </motion.button>
                </Link>
                <Link to="/music">
                  <motion.button
                    className="w-full btn-glass text-left flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Activity className="w-4 h-4" />
                    <span>Mood Music</span>
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
