'use client';

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import CinematicIntro from '@/components/intro/CinematicIntro';

const SESSION_KEY = 'ys-intro-v4-redesign';

declare global {
  interface Window {
    __ysReplayIntro?: () => void;
  }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Start with showIntro = false on both server and client to avoid hydration mismatch.
  const [showIntro, setShowIntro] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    // 1. Check if user explicitly asked to trigger intro or hasn't seen this session
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const forceIntro = urlParams.get('intro') === '1';
      const seen = sessionStorage.getItem(SESSION_KEY);

      if (forceIntro || !seen) {
        setShowIntro(true);
        setIntroReady(true);
      } else {
        setIntroDone(true);
      }
    } catch {
      setIntroDone(true);
    }

    // 2. Event listener for replaying the intro on demand
    const handleReplay = () => {
      setShowIntro(true);
      setIntroReady(true);
      setIntroDone(false);
    };

    window.addEventListener('ys-replay-intro', handleReplay);
    window.__ysReplayIntro = handleReplay;

    return () => {
      window.removeEventListener('ys-replay-intro', handleReplay);
      delete window.__ysReplayIntro;
    };
  }, []);

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }
    setShowIntro(false);
    setIntroDone(true);
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        {/* Cinematic intro overlay */}
        {showIntro && (
          <CinematicIntro isActive={introReady} onComplete={handleIntroComplete} />
        )}

        {/* Main app content with smooth reveal */}
        <div
          style={{
            opacity: introDone ? 1 : 0,
            transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {children}
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
