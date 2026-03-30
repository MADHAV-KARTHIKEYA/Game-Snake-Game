/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans overflow-hidden relative selection:bg-[#00FF00]/30">
      {/* Hardware background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#151619_1px,transparent_1px),linear-gradient(to_bottom,#151619_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
      
      <main className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-digital tracking-widest text-white mb-2 glitch-text" data-text="TERMINAL_SNAKE">
            TERMINAL_SNAKE
          </h1>
          <p className="text-[#8E9299] font-mono tracking-[0.2em] text-[10px] uppercase">
            Hardware Edition v2.0
          </p>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 w-full max-w-6xl mx-auto">
          {/* Game Container */}
          <div className="flex-1 w-full flex justify-center items-center">
            <SnakeGame />
          </div>

          {/* Music Player Container */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col justify-center items-center">
            <MusicPlayer />
          </div>
        </div>
      </main>
    </div>
  );
}
