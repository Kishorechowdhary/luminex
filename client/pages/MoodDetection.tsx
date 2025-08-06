import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Brain } from 'lucide-react';

interface MoodDetectionProps {
  currentMood: 'happy' | 'sad' | 'angry' | 'calm' | 'neutral';
  currentMoodConfig: {
    emoji: string;
    message: string;
  };
  isDetecting: boolean;
  cameraReady: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  handleGetStarted: () => Promise<void>;
  stopDetection: () => void;
  startCamera: () => Promise<boolean>;
}

export default function MoodDetection({
  currentMood,
  currentMoodConfig,
  isDetecting,
  cameraReady,
  videoRef,
  handleGetStarted,
  stopDetection,
  startCamera
}: MoodDetectionProps) {
  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-2 space-y-6"
    >
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-3xl border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center"
              animate={{ 
                background: [
                  "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
                  "linear-gradient(135deg, #8b5cf6, #ec4899, #10b981)",
                  "linear-gradient(135deg, #ec4899, #10b981, #3b82f6)",
                  "linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)"
                ]
              }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <Brain className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Mood Detection
              </h2>
              <p className="text-white/70 text-sm">
                Real-time emotion analysis
              </p>
            </div>
          </div>
          
          <motion.div
            className="flex items-center space-x-3"
            animate={isDetecting ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={`w-3 h-3 rounded-full ${
              isDetecting ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              isDetecting ? 'text-green-400' : 'text-gray-400'
            }`}>
              {isDetecting ? 'Active' : 'Inactive'}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Camera and Analysis Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera Feed Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl overflow-hidden border border-white/10"
        >
          <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Video element */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                cameraReady ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* Camera placeholder */}
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <Camera className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">
                    {isDetecting ? 'Starting camera...' : 'Camera inactive'}
                  </p>
                  <p className="text-xs text-white/40">
                    {isDetecting ? 'Allow camera access' : 'Click start to begin'}
                  </p>
                </motion.div>
              </div>
            )}
            
            {/* Status badges */}
            {cameraReady && isDetecting && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                  <span className="text-xs text-white font-semibold">LIVE</span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span className="text-xs text-white font-semibold">ANALYZING</span>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
        
        {/* Current Mood Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col justify-center"
        >
          <motion.div
            key={currentMood}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center"
          >
            <motion.div
              className="text-8xl mb-4"
              animate={{
                scale: [1, 1.1, 1],
                rotate: currentMood === 'happy' ? [0, 5, -5, 0] : [0, 2, -2, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentMoodConfig.emoji}
            </motion.div>
            
            <h3 className="text-3xl font-bold text-white mb-2 capitalize">
              {currentMood}
            </h3>
            
            <p className="text-white/70 text-lg mb-6">
              {currentMoodConfig.message}
            </p>
            
            {/* Confidence indicators */}
            {isDetecting && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Confidence</span>
                  <span className="text-white font-semibold">85%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Stability</span>
                  <span className="text-white font-semibold">72%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "72%" }}
                    transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6 rounded-3xl border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Detection Status
            </h3>
            <p className="text-white/60 text-sm">
              {!isDetecting ? (
                !navigator.mediaDevices ?
                  '🧠 Smart activity-based detection ready' :
                  '📸 Camera-based emotion analysis ready'
              ) : (
                cameraReady ?
                  '📸 Live camera analysis active' :
                  '🧠 Behavior analysis active'
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isDetecting ? (
              <motion.button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Detection
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={stopDetection}
                  className="bg-white/10 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Stop Detection
                </motion.button>
                
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
                    className="bg-green-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📸 Enable Camera
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
