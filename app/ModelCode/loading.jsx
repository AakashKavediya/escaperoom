"use client";

import React, { useEffect, useState } from "react";

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [dots, setDots] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const phases = [
    { text: "INITIALIZING SYSTEMS", duration: 2000 },
    { text: "LOADING 3D ENVIRONMENT", duration: 2500 },
    { text: "LOADING CASE FILES", duration: 2000 },
    { text: "PREPARING INVESTIGATION", duration: 2000 },
    { text: "FINALIZING SETUP", duration: 1500 },
  ];

  useEffect(() => {
    let progressInterval;
    let phaseTimeouts = [];
    let dotsInterval;
    let completionTimeout;

    // Start animations only if visible
    if (isVisible) {
      // Progress bar animation - 10 seconds total
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1; // 100% in 10 seconds (1% per 100ms)
        });
      }, 100);

      // Phase changes with staggered timing
      let accumulatedTime = 0;
      phases.forEach((phase, index) => {
        const timeout = setTimeout(() => {
          setCurrentPhase(index);
        }, accumulatedTime);
        phaseTimeouts.push(timeout);
        accumulatedTime += phase.duration;
      });

      // Loading dots animation
      dotsInterval = setInterval(() => {
        setDots((prev) => {
          if (prev === "...") return "";
          return prev + ".";
        });
      }, 300);

      // Complete loading after 10 seconds
      completionTimeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500); // Small delay for fade-out animation
      }, 10000);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
      clearTimeout(completionTimeout);
      phaseTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isVisible, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`h-screen w-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0a] to-[#000000] flex items-center justify-center fixed top-0 left-0 z-50 transition-opacity duration-500 ${!isVisible ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[linear-gradient(rgba(220,20,60,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(220,20,60,0.15)_1px,transparent_1px)] bg-[size:60px_60px] animate-grid" />
      </div>

      {/* Floating Evidence Particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: '2px',
            height: '2px',
            backgroundColor: ['#DC143C', '#FFD700', '#FF6347'][Math.floor(Math.random() * 3)],
            animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 1}s`,
          }}
        />
      ))}

      {/* Crime Scene Tape - Top */}
      <div className="absolute top-0 left-0 w-full h-12 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-0 w-full h-8 bg-gradient-to-r from-transparent via-amber-500/15 to-transparent transform -rotate-1 animate-tape">
          <div className="flex items-center justify-center h-full">
            <span className="text-amber-400/50 text-[9px] font-bold tracking-[0.4em] whitespace-nowrap">
              ⚠️ CRIME SCENE • DO NOT CROSS • CRIME SCENE • DO NOT CROSS • CRIME SCENE ⚠️
            </span>
          </div>
        </div>
      </div>

      {/* Main Loading Container */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 w-full max-w-2xl px-8">
        {/* Case File Header */}
        <div className="text-center space-y-3">
          <div className="text-red-400 text-sm font-bold tracking-[0.3em] opacity-90 animate-pulse">
            ⚠️ CONFIDENTIAL ⚠️
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-red-600 tracking-widest drop-shadow-2xl font-serif animate-glow">
            CODE OF SILENCE
          </h1>
          <div className="text-red-200/70 text-sm font-light tracking-[0.2em]">
            MURDER CASE FILE #2847
          </div>
        </div>

        {/* Central Investigation Symbol */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Rotating Outer Ring */}
          <div className="absolute w-full h-full border-2 border-red-500/30 rounded-full animate-spin-slow" />
          
          {/* Pulsing Middle Ring */}
          <div className="absolute w-32 h-32 border border-amber-500/40 rounded-full animate-ping" />
          
          {/* Inner Circle with Icon */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-600 via-red-800 to-black flex items-center justify-center shadow-2xl shadow-red-600/50 border-2 border-red-500/60 animate-pulse">
            <div className="text-5xl animate-zoom">🔍</div>
          </div>

          {/* Rotating Evidence Markers */}
          <div className="absolute w-full h-full animate-spin-reverse">
            {[0, 90, 180, 270].map((angle, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-amber-400 opacity-70 animate-pulse"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${angle}deg) translate(70px) translate(-50%, -50%)`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading Phase Text */}
        <div className="text-center space-y-2">
          <div className="text-amber-400 text-lg font-bold tracking-wider animate-fadeIn">
            {phases[currentPhase].text}
            <span className="inline-block w-8 text-left">{dots}</span>
          </div>
          <div className="text-red-300/60 text-xs font-mono">
            PHASE {currentPhase + 1}/{phases.length} • {Math.floor(progress)}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between items-center text-xs text-red-300/80 font-mono">
            <span>LOADING INVESTIGATION TOOLS</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-black/60 rounded-full border border-red-500/30 overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-full transition-all duration-300 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
            </div>
          </div>
        </div>

        {/* Loading Steps Indicators */}
        <div className="flex items-center justify-center space-x-3">
          {phases.map((_, index) => (
            <div
              key={index}
              className="relative"
            >
              <div
                className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                  index < currentPhase
                    ? 'bg-lime-400 border-lime-400 shadow-lg shadow-lime-400/50'
                    : index === currentPhase
                    ? 'bg-amber-400 border-amber-400 shadow-lg shadow-amber-400/50 animate-pulse'
                    : 'bg-transparent border-red-500/30'
                }`}
              />
              {index < currentPhase && (
                <div className="absolute inset-0 flex items-center justify-center text-[8px] text-black font-bold">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Status Messages */}
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
            <span className="text-lime-400 font-semibold">3D MODEL LOADING</span>
          </div>
          <div className="w-px h-4 bg-red-500/30" />
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-300 font-semibold">ASSETS READY</span>
          </div>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute bottom-8 left-8 text-red-500/20 text-6xl transform rotate-12 animate-float">
        👆
      </div>
      <div className="absolute top-20 right-12 text-amber-400/20 text-4xl animate-float" style={{ animationDelay: '1s' }}>
        📋
      </div>

      {/* Bottom Warning */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-red-500/30">
          <div className="text-red-400/80 text-[10px] font-mono tracking-wider">
            LOADING 3D CRIME SCENE • PLEASE WAIT
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(12deg); }
          25% { transform: translate(10px, -10px) rotate(15deg); }
          50% { transform: translate(-5px, 5px) rotate(10deg); }
          75% { transform: translate(-10px, -5px) rotate(14deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(220, 20, 60, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(220, 20, 60, 0.8)); }
        }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes grid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        @keyframes tape {
          0% { transform: translateX(0) rotate(-1deg); }
          100% { transform: translateX(-50%) rotate(-1deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 4s linear infinite;
        }

        .animate-zoom {
          animation: zoom 1.5s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-shine {
          animation: shine 1.5s ease-in-out infinite;
        }

        .animate-grid {
          animation: grid 15s linear infinite;
        }

        .animate-tape {
          animation: tape 12s linear infinite;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .particle {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}