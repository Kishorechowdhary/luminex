import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Brain, 
  Sparkles, 
  Heart,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

type AuthMode = 'login' | 'signup';
type WelcomeMood = 'happy' | 'calm' | 'excited' | 'focused';

const welcomeMessages = {
  happy: {
    emoji: '😄',
    message: "Welcome back! Ready to brighten your day?",
    color: 'mood-happy',
    bg: 'from-amber-500/20 to-yellow-500/20',
    particles: '✨🌟⭐'
  },
  calm: {
    emoji: '😌',
    message: "Find your inner peace and emotional balance",
    color: 'mood-calm',
    bg: 'from-emerald-500/20 to-teal-500/20',
    particles: '���🌿🌱'
  },
  excited: {
    emoji: '🚀',
    message: "Let's explore your emotional universe together!",
    color: 'luminix-neon',
    bg: 'from-cyan-500/20 to-blue-500/20',
    particles: '💫⚡🔥'
  },
  focused: {
    emoji: '🧠',
    message: "Harness the power of emotional intelligence",
    color: 'luminix-green',
    bg: 'from-green-500/20 to-blue-500/20',
    particles: '🎯🔮💎'
  }
};

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [welcomeMood, setWelcomeMood] = useState<WelcomeMood>('excited');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const currentWelcome = welcomeMessages[welcomeMood];

  // Cycle through welcome moods
  useEffect(() => {
    const moods: WelcomeMood[] = ['excited', 'happy', 'calm', 'focused'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % moods.length;
      setWelcomeMood(moods[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    // Redirect to main app would happen here
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic background with mood-based gradient */}
      <motion.div
        key={welcomeMood}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={`absolute inset-0 bg-gradient-to-br ${currentWelcome.bg} opacity-20`}
      />

      {/* Animated background orbs */}
      <div className="ambient-orb"></div>
      <div className="ambient-orb"></div>
      <div className="ambient-orb"></div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {currentWelcome.particles.split('').map((particle, index) => (
          <motion.div
            key={`${welcomeMood}-${index}`}
            initial={{ 
              opacity: 0, 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [null, -100],
              rotate: 360
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute text-2xl pointer-events-none"
          >
            {particle}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Welcome section */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12"
        >
          <Link to="/" className="flex items-center space-x-3 mb-12 group">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-luminix-neon to-luminix-green flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <Brain className="w-6 h-6 text-luminix-bg" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gradient-neon">LUMINIX ECO MIND</h1>
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={welcomeMood}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                {currentWelcome.emoji}
              </motion.div>
              <h2 className={`text-4xl font-bold text-gradient-mood ${welcomeMood} mb-4`}>
                {currentWelcome.message}
              </h2>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {[
              { icon: Brain, text: "AI-powered mood detection" },
              { icon: Heart, text: "Personalized emotional insights" },
              { icon: Sparkles, text: "24/7 wellness companion" },
              { icon: Zap, text: "Real-time music & activity sync" }
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-luminix-neon to-luminix-green flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-luminix-bg" />
                </div>
                <span className="text-luminix-text text-lg">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right side - Auth form */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-1/2 flex items-center justify-center p-8"
        >
          <div className="w-full max-w-md">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-luminix-neon to-luminix-green flex items-center justify-center"
              >
                <Brain className="w-8 h-8 text-luminix-bg" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gradient-neon">LUMINIX ECO MIND</h1>
            </div>

            {/* Auth form card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="card-glass"
            >
              {/* Form header */}
              <div className="text-center mb-8">
                <motion.h2 
                  key={authMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-luminix-text mb-2"
                >
                  {authMode === 'login' ? 'Welcome Back' : 'Join LUMINIX'}
                </motion.h2>
                <p className="text-luminix-text-muted">
                  {authMode === 'login' 
                    ? 'Continue your emotional journey' 
                    : 'Start your path to emotional wellness'
                  }
                </p>
              </div>

              {/* Auth mode toggle */}
              <div className="flex mb-6 p-1 bg-luminix-surface rounded-lg">
                {(['login', 'signup'] as AuthMode[]).map((mode) => (
                  <motion.button
                    key={mode}
                    onClick={() => setAuthMode(mode)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      authMode === mode
                        ? 'bg-luminix-green text-luminix-bg'
                        : 'text-luminix-text-muted hover:text-luminix-text'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {mode === 'login' ? 'Sign In' : 'Sign Up'}
                  </motion.button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={authMode}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {authMode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                      >
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luminix-text-muted" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-luminix-surface border border-luminix-surface rounded-lg text-luminix-text placeholder-luminix-text-muted focus:outline-none focus:border-luminix-neon transition-colors"
                        />
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: authMode === 'signup' ? 0.1 : 0 }}
                      className="relative"
                    >
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luminix-text-muted" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-luminix-surface border border-luminix-surface rounded-lg text-luminix-text placeholder-luminix-text-muted focus:outline-none focus:border-luminix-neon transition-colors"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: authMode === 'signup' ? 0.2 : 0.1 }}
                      className="relative"
                    >
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luminix-text-muted" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-luminix-surface border border-luminix-surface rounded-lg text-luminix-text placeholder-luminix-text-muted focus:outline-none focus:border-luminix-neon transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-luminix-text-muted hover:text-luminix-text transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </motion.div>

                    {authMode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative"
                      >
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luminix-text-muted" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-luminix-surface border border-luminix-surface rounded-lg text-luminix-text placeholder-luminix-text-muted focus:outline-none focus:border-luminix-neon transition-colors"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-luminix flex items-center justify-center space-x-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-luminix-bg border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-luminix-surface"></div>
                <span className="px-4 text-luminix-text-muted text-sm">or</span>
                <div className="flex-1 border-t border-luminix-surface"></div>
              </div>

              {/* Social login */}
              <div className="space-y-3">
                <motion.button
                  className="w-full btn-glass flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Continue with Google</span>
                </motion.button>
              </div>

              {/* Footer */}
              <div className="text-center mt-6">
                <p className="text-luminix-text-muted text-sm">
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-luminix-green hover:text-luminix-green-hover transition-colors"
                  >
                    {authMode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
