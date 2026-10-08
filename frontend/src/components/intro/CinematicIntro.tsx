'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  isActive: boolean;
  onComplete: () => void;
}

// ─── 4 Clean, Charming Citizen Archetypes (Zero Clutter) ─────────────────────
const CITIZENS = [
  {
    id: 'farmer',
    name: 'Farmer',
    avatar: '🌾',
    sub: 'Agriculture & Irrigation',
    scheme: 'PM-KISAN • ₹6,000/yr',
    color: '#22C55E',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.35)',
  },
  {
    id: 'student',
    name: 'Student',
    avatar: '🎓',
    sub: 'Higher Education',
    scheme: 'NSP • Full Tuition Waiver',
    color: '#60A5FA',
    bg: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.35)',
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    avatar: '👩‍💼',
    sub: 'Small Business',
    scheme: 'MUDRA • ₹10L Credit',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  {
    id: 'family',
    name: 'Family',
    avatar: '👨‍👩‍👧',
    sub: 'Housing & Health',
    scheme: 'Ayushman • ₹5L Free Care',
    color: '#F472B6',
    bg: 'rgba(244, 114, 182, 0.12)',
    border: 'rgba(244, 114, 182, 0.35)',
  },
];

// ─── 6 Floating Scheme Tokens (Evenly Spaced) ─────────────────────────────────
const SCHEME_TOKENS = [
  { icon: '🌾', label: 'Agriculture', color: '#22C55E' },
  { icon: '🎓', label: 'Education', color: '#60A5FA' },
  { icon: '🏥', label: 'Healthcare', color: '#F472B6' },
  { icon: '🏠', label: 'Housing', color: '#FB923C' },
  { icon: '💰', label: 'Loans & Finance', color: '#FACC15' },
  { icon: '🛡️', label: 'Social Welfare', color: '#C084FC' },
];

export default function CinematicIntro({ isActive, onComplete }: Props) {
  // Phase 1: 0-1s (First Citizen appears)
  // Phase 2: 1-2s (All 4 Citizens line up cleanly)
  // Phase 3: 2-3s (Floating 3D scheme tokens appear)
  // Phase 4: 3-4s (AI Core connects citizens with light trails)
  // Phase 5: 4-5.2s (YojanaSetu logo reveal)
  const [phase, setPhase] = useState<number>(0);
  const [exiting, setExiting] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleComplete = useCallback(() => {
    setExiting(true);
    const t = setTimeout(onComplete, 600);
    return () => clearTimeout(t);
  }, [onComplete]);

  const skip = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    handleComplete();
  }, [handleComplete]);

  // Keyboard Escape listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [skip]);

  // Phase Sequencer
  useEffect(() => {
    if (!isActive) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setPhase(5);
      const t = setTimeout(handleComplete, 1200);
      timersRef.current = [t];
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => setPhase(1), 100);   // Scene 1: Initial citizen
    const t2 = setTimeout(() => setPhase(2), 1050);  // Scene 2: 4 citizens appear
    const t3 = setTimeout(() => setPhase(3), 2150);  // Scene 3: Scheme tokens float in
    const t4 = setTimeout(() => setPhase(4), 3250);  // Scene 4: AI Core connecting them
    const t5 = setTimeout(() => setPhase(5), 4300);  // Scene 5: Logo reveal
    const t6 = setTimeout(handleComplete, 5450);     // Fade to homepage

    timersRef.current = [t1, t2, t3, t4, t5, t6];
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive, handleComplete]);

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #080D21 0%, #030611 60%, #010207 100%)',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: exiting ? 'none' : 'all',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="YojanaSetu Introduction"
    >
      {/* ── Subtle Background Ambient Glow ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-1000"
        style={{
          width: phase >= 4 ? 600 : 380,
          height: phase >= 4 ? 600 : 380,
          background: 'radial-gradient(circle, rgba(255, 153, 51, 0.12) 0%, rgba(30, 58, 138, 0.08) 50%, transparent 75%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ── Top-Right Skip Button ── */}
      <button
        onClick={skip}
        className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-slate-400 hover:text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg"
        aria-label="Skip intro"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
      </button>

      {/* ── Bottom Micro Progress Line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 transition-all duration-1000 ease-linear"
          style={{ width: `${Math.min(100, (phase / 5) * 100)}%` }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════
          SCENE 1: Single Citizen in Spotlight (0-1s)
      ══════════════════════════════════════════════════════ */}
      {phase === 1 && (
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/30 to-blue-500/20 border border-amber-500/40 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/20 mb-4 animate-bounce">
            🇮🇳
          </div>
          <span className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-1">
            Over 1.4 Billion Citizens
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Looking for Government Support
          </h2>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SCENE 2 & 3: Citizens & Floating Scheme Tokens (1-3.2s)
      ══════════════════════════════════════════════════════ */}
      {(phase === 2 || phase === 3) && (
        <div className="w-full max-w-4xl px-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          {/* Header Title */}
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              {phase === 2 ? 'Citizens Across India' : 'Matching Their Needs'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {phase === 2
                ? 'Every Citizen has Unique Aspirations'
                : 'Over 24+ Central & State Welfare Schemes'}
            </h2>
          </div>

          {/* Scheme Tokens Floating in 3D (Phase 3) */}
          {phase === 3 && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              {SCHEME_TOKENS.map((token, i) => (
                <div
                  key={token.label}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border flex items-center gap-2 shadow-lg backdrop-blur-md transition-all duration-300"
                  style={{
                    borderColor: `${token.color}45`,
                    boxShadow: `0 4px 16px ${token.color}20`,
                    transform: `translateY(${i % 2 === 0 ? '-3px' : '3px'})`,
                  }}
                >
                  <span className="text-base">{token.icon}</span>
                  <span className="text-xs font-semibold text-white">{token.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* 4 Clean, Beautifully Spaced Citizen Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {CITIZENS.map((c, idx) => (
              <div
                key={c.id}
                className="rounded-2xl p-4 border flex flex-col items-center text-center backdrop-blur-xl transition-all duration-500 shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 30, 0.95) 100%)',
                  borderColor: c.border,
                  boxShadow: `0 8px 24px ${c.color}15`,
                  animationDelay: `${idx * 100}ms`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-inner"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                  {c.avatar}
                </div>
                <h4 className="font-bold text-sm text-white">{c.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>

                {phase === 3 && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 w-full animate-in fade-in duration-300">
                    <span className="text-[10px] font-semibold text-emerald-400 block truncate">
                      ✓ {c.scheme}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SCENE 4: AI Core Intelligently Connects Everything (3.2-4.3s)
      ══════════════════════════════════════════════════════ */}
      {phase === 4 && (
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-90 duration-500 max-w-xl px-4">
          {/* Luminous Central AI Core */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF9933] via-[#EA580C] to-[#1E3A8A] p-[2.5px] shadow-2xl shadow-orange-500/40 animate-pulse">
              <div className="w-full h-full bg-[#070B19] rounded-full flex items-center justify-center relative overflow-hidden">
                <span className="text-3xl font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                  य
                </span>
              </div>
            </div>
            {/* Pulsing Aura Rings */}
            <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Grounded AI Retrieval Active
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Intelligently Connecting Citizens to <span className="text-[#FF9933]">Guaranteed Benefits</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md">
            Semantic matching, instant eligibility verification, and voice assistance across official portals.
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SCENE 5: YojanaSetu Grand Logo Reveal (4.3-5.4s)
      ══════════════════════════════════════════════════════ */}
      {phase >= 5 && (
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700 max-w-md px-4">
          {/* Emblem */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] via-[#0F172A] to-[#FF9933] p-[2px] shadow-2xl shadow-orange-500/40">
              <div className="w-full h-full bg-[#070B19] rounded-[14px] flex items-center justify-center">
                <span className="font-black text-4xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                  य
                </span>
              </div>
            </div>
            <div className="absolute inset-0 bg-amber-500/25 rounded-2xl blur-xl -z-10 animate-pulse" />
          </div>

          {/* Wordmark */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight flex items-center gap-2">
            Yojana<span className="text-[#FF9933]">Setu</span>
          </h1>

          {/* Tagline */}
          <p className="text-slate-300 text-xs sm:text-sm font-medium tracking-wide mt-2">
            AI-powered access to Government Schemes
          </p>

          {/* Clean Indian Tricolor Dots */}
          <div className="flex items-center gap-2 mt-5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933]" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#138808]" />
          </div>
        </div>
      )}
    </div>
  );
}
