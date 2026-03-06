/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Trophy, Zap, Cpu } from 'lucide-react';
import { GameCanvas } from './components/GameCanvas';
import { GameStatus } from './types';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('neon_high_score');
    return saved ? parseInt(saved) : 0;
  });

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('neon_high_score', finalScore.toString());
    }
    setStatus('GAMEOVER');
  };

  const startGame = () => {
    setScore(0);
    setStatus('PLAYING');
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,40,1)_0%,rgba(0,0,0,1)_100%)]" />
      
      {/* Game Canvas Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-5xl max-h-[600px] relative border border-white/10 overflow-hidden">
          {status === 'PLAYING' && (
            <GameCanvas onGameOver={handleGameOver} isPaused={false} />
          )}
          
          {/* HUD */}
          {status === 'PLAYING' && (
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-cyan-400/60 font-mono">Distance</span>
                <span className="text-3xl font-bold tracking-tighter italic">
                  {Math.floor(score).toLocaleString()}
                  <span className="text-sm ml-1 text-cyan-400">m</span>
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-pink-500/60 font-mono">Record</span>
                <span className="text-xl font-bold tracking-tighter opacity-80">
                  {highScore.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Overlays */}
          <AnimatePresence>
            {status === 'START' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
                    <span className="text-xs uppercase tracking-[0.3em] text-cyan-400/80 font-mono">System Online</span>
                  </div>
                  <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                    NEON<br/>OVERDRIVE
                  </h1>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-12">
                    <div className="p-4 border border-white/10 bg-white/5 rounded-xl">
                      <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                      <p className="text-[10px] uppercase tracking-widest text-white/40">Space / Click</p>
                      <p className="text-sm font-bold">Double Jump</p>
                    </div>
                    <div className="p-4 border border-white/10 bg-white/5 rounded-xl">
                      <Trophy className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                      <p className="text-[10px] uppercase tracking-widest text-white/40">High Score</p>
                      <p className="text-sm font-bold">{highScore.toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="group relative px-12 py-4 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    <span className="relative flex items-center gap-2">
                      <Play className="w-5 h-5 fill-current" />
                      Initiate Run
                    </span>
                  </button>
                </motion.div>
              </motion.div>
            )}

            {status === 'GAMEOVER' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <span className="text-xs uppercase tracking-[0.5em] text-red-500 font-mono mb-4 block">Connection Lost</span>
                  <h2 className="text-6xl font-black italic tracking-tighter mb-2">SYSTEM CRASH</h2>
                  <p className="text-white/60 mb-8">Neural link severed at {Math.floor(score)} meters</p>
                  
                  <div className="flex flex-col gap-4 items-center">
                    <button
                      onClick={startGame}
                      className="group flex items-center gap-3 px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reboot System
                    </button>
                    <button
                      onClick={() => setStatus('START')}
                      className="text-white/40 uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                    >
                      Return to Terminal
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
    </div>
  );
}
