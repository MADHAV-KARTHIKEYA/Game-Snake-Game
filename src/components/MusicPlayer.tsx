import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'NEON_DRIFT.WAV', artist: 'SYS_ADMIN', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'DIGITAL_HORIZON.WAV', artist: 'NEURAL_NET', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'QUANTUM_PULSE.WAV', artist: 'ALGO_BEAT', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60).toString().padStart(2, '0');
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    playNext();
  };

  return (
    <div className="w-[380px] bg-[#151619] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-6 border border-[#2A2D35] font-mono relative overflow-hidden">
      {/* Hardware UI */}
      <div className="flex justify-between items-start mb-8 border-b border-[#2A2D35] pb-4">
        <div>
          <div className="text-[10px] tracking-[2px] uppercase text-[#8E9299] mb-2">Audio Output</div>
          <div className="text-white font-bold tracking-tight text-lg">{currentTrack.title}</div>
          <div className="text-[#8E9299] text-xs mt-1 tracking-widest">{currentTrack.artist}</div>
        </div>
        <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-[#00FF00] shadow-[0_0_12px_rgba(0,255,0,0.6)]' : 'bg-[#FF4444] shadow-[0_0_12px_rgba(255,68,68,0.6)]'}`} />
      </div>

      {/* Dashed radial track - evokes physical equipment */}
      <div className="flex justify-center mb-8">
        <div className={`relative w-32 h-32 rounded-full border-2 border-dashed ${isPlaying ? 'border-[#00FF00]/50 animate-[spin_10s_linear_infinite]' : 'border-[#8E9299]/30'} flex items-center justify-center`}>
          <div className="absolute inset-2 rounded-full border border-[#2A2D35] bg-[#0A0A0C] flex items-center justify-center">
             <Disc className={`w-12 h-12 ${isPlaying ? 'text-[#00FF00]' : 'text-[#8E9299]'}`} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] tracking-[1px] text-[#8E9299] uppercase">Master Control</div>
        <div className="text-[11px] tracking-[1px] text-white font-mono bg-[#0A0A0C] px-2 py-1 rounded border border-[#2A2D35]">
          {formatTime(currentTime)}
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#0A0A0C] p-2 rounded-lg border border-[#2A2D35]">
        <button onClick={playPrev} className="p-3 text-[#8E9299] hover:text-white transition-colors">
          <SkipBack size={20} />
        </button>
        
        <button onClick={togglePlay} className={`p-4 rounded-full transition-all ${isPlaying ? 'bg-[#00FF00] text-black shadow-[0_0_15px_rgba(0,255,0,0.4)]' : 'bg-[#2A2D35] text-white hover:bg-[#3A3D45]'}`}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>

        <button onClick={playNext} className="p-3 text-[#8E9299] hover:text-white transition-colors">
          <SkipForward size={20} />
        </button>
      </div>

      <div className="mt-6 flex justify-between items-center border-t border-[#2A2D35] pt-4">
        <div className="text-[10px] tracking-[1px] text-[#8E9299] uppercase">Vol</div>
        <button onClick={toggleMute} className="text-[#8E9299] hover:text-white transition-colors">
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <audio ref={audioRef} src={currentTrack.url} onEnded={handleEnded} onTimeUpdate={handleTimeUpdate} className="hidden" />
    </div>
  );
}
