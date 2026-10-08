'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const currentLang = languages.find((l) => l.code === language) ?? languages[0];

  let btnTransform = 'translateZ(0px)';
  if (!reducedMotion) {
    if (isPressed) {
      btnTransform = 'translateZ(1px) translateY(1px) scale(0.97)';
    } else if (isHovered || open) {
      btnTransform = 'translateZ(4px) translateY(-1px)';
    }
  }

  return (
    <div ref={ref} className="relative select-none" style={{ perspective: 800 }}>
      {/* 3D Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        style={{
          transform: btnTransform,
          transformStyle: 'preserve-3d',
          willChange: 'transform, box-shadow',
        }}
        className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          open
            ? 'bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-500/40 shadow-[0_8px_18px_rgba(0,0,0,0.55),0_0_12px_rgba(255,153,51,0.2),inset_0_1px_0_rgba(255,255,255,0.22)] text-white'
            : isHovered
            ? 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-white/25 shadow-[0_8px_16px_rgba(0,0,0,0.5),0_0_10px_rgba(255,153,51,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] text-white'
            : 'bg-slate-900/70 border border-white/10 shadow-[0_3px_8px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.4)]'
        }`}
        aria-label={`Language: ${currentLang.name}. Click to change.`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            open ? 'text-amber-400 rotate-12 scale-110' : isHovered ? 'text-amber-400' : 'text-amber-400/80'
          }`}
        />
        <span className="hidden sm:inline tracking-tight font-medium">{currentLang.nativeName}</span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180 text-amber-400' : 'group-hover:text-slate-200'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating 3D Dropdown */}
      {open && (
        <div
          className={`absolute right-0 top-full mt-2.5 w-52 rounded-2xl border border-white/15 bg-[#0a1024]/95 backdrop-blur-2xl shadow-[0_24px_50px_-10px_rgba(0,0,0,0.85),0_6px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden z-50 ${
            reducedMotion
              ? 'animate-in fade-in duration-100'
              : 'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200'
          }`}
          style={{
            transformOrigin: 'top right',
            transform: 'perspective(1000px) rotateX(0deg)',
            transformStyle: 'preserve-3d',
          }}
          role="listbox"
          aria-label="Select language"
        >
          {/* Subtle top edge glow bar */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          <div className="p-1.5 space-y-1">
            {languages.map((lang) => {
              const isActive = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs lg:text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-amber-300 border border-amber-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/8 hover:translate-x-0.5 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold">{lang.nativeName}</span>
                    <span className="text-[11px] text-slate-400">({lang.name})</span>
                  </span>
                  {isActive ? (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Translation helper notice footer */}
          <div className="px-3.5 py-2 bg-slate-950/80 border-t border-white/5">
            <p className="text-[10px] text-slate-400 leading-tight">
              Instant AI localization • UI adapts automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
