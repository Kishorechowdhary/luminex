import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function Placeholder({ title, description, icon }: PlaceholderProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="ambient-orb"></div>
      <div className="ambient-orb"></div>
      <div className="ambient-orb"></div>

      <div className="relative z-10">
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

        {/* Main content */}
        <main className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
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
              className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-luminix-neon to-luminix-green rounded-full flex items-center justify-center"
            >
              {icon || <Sparkles className="w-12 h-12 text-luminix-bg" />}
            </motion.div>

            <motion.h1 
              className="text-4xl font-bold text-gradient-neon mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>

            <motion.p 
              className="text-xl text-luminix-text-muted mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card-glass max-w-lg mx-auto p-8"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center justify-center space-x-2 mb-4"
              >
                <div className="w-2 h-2 bg-luminix-neon rounded-full"></div>
                <div className="w-2 h-2 bg-luminix-green rounded-full"></div>
                <div className="w-2 h-2 bg-mood-happy rounded-full"></div>
              </motion.div>
              
              <p className="text-luminix-text-muted mb-6">
                This amazing feature is coming soon! Continue prompting to have me build out this page with all the functionality you need.
              </p>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-luminix w-full"
                >
                  Request This Feature
                </motion.button>
                
                <Link to="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-glass w-full"
                  >
                    Back to Dashboard
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                "AI-Powered Features",
                "Real-time Analytics", 
                "Personalized Experience"
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="glass-subtle rounded-lg p-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-luminix-neon to-luminix-green rounded-lg mb-3 mx-auto"></div>
                  <p className="text-sm text-luminix-text-muted">{feature}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
