'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Bot, 
  TrendingUp,
  Landmark,
  Coins
} from 'lucide-react';
import Hero3DVisual from './Hero3DVisual';
import VoiceInputButton from '@/components/chat/VoiceInputButton';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/schemes?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setSearchQuery(text);
    router.push(`/schemes?query=${encodeURIComponent(text)}`);
  };

  const quickPills = [
    { label: 'Farmer Support', query: 'farmer' },
    { label: 'Higher Education Scholarships', query: 'scholarship' },
    { label: 'MUDRA Business Loans', query: 'mudra' },
    { label: 'Ayushman Hospital Card', query: 'ayushman' },
    { label: 'PMAY Pucca House', query: 'housing' },
    { label: 'Women Empowerment', query: 'women' },
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      {/* Background ambient light gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-tr from-blue-900/20 via-indigo-900/10 to-amber-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Vision & Search */}
          <div className="lg:col-span-7 space-y-8">
            {/* Pill Badge & Replay Intro Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-emerald-500/10 border border-amber-500/30 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-semibold tracking-wide text-amber-300">
                  {t('hero.badge')}
                </span>
                <span className="text-[10px] text-slate-400 border-l border-white/10 pl-2">
                  Central & State DBT Portals
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('ys-replay-intro'));
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 text-xs font-medium backdrop-blur-md transition-all cursor-pointer shadow-sm group"
                title="Play 5-Second Cinematic Experience"
              >
                <span className="text-amber-400 group-hover:scale-110 transition-transform">▶</span>
                <span>Watch Intro</span>
              </button>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              {t('hero.headline1')}{' '}
              <span className="gradient-text-saffron block mt-1">{t('hero.headline2')}</span>
            </h1>

            {/* Supporting Subtext */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              {t('hero.subtext')}
            </p>

            {/* Hero Search Box */}
            <div className="glass-panel p-2 rounded-2xl border border-white/15 shadow-2xl relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="pl-3 text-slate-400 flex items-center">
                  <Search className="w-5 h-5 text-amber-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('hero.searchPlaceholder')}
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none py-2.5 px-2"
                />

                {/* Voice Input Button */}
                <VoiceInputButton onTranscript={handleVoiceTranscript} />

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="btn-3d-primary !py-2.5 !px-5 text-sm flex-shrink-0"
                >
                  <span>{t('hero.search')}</span>
                  <ArrowRight className="w-4 h-4 hidden sm:inline" />
                </button>
              </form>
            </div>

            {/* Quick Pill Filter Buttons */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> {t('hero.popular')}
              </span>
              <div className="flex flex-wrap gap-2">
                {quickPills.map((pill) => (
                  <button
                    key={pill.label}
                    type="button"
                    onClick={() => router.push(`/schemes?query=${encodeURIComponent(pill.query)}`)}
                    className="text-xs text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/eligibility"
                className="btn-3d-blue text-sm group"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>{t('hero.ctaEligibility')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/assistant"
                className="btn-3d-secondary text-sm group"
              >
                <Bot className="w-4 h-4 text-amber-400 group-hover:rotate-6 transition-transform" />
                <span>{t('hero.ctaAssistant')}</span>
              </Link>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">24+</p>
                <p className="text-xs text-slate-400">Flagship Schemes</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight">₹5 Lakh+</p>
                <p className="text-xs text-slate-400">Max Family Cover</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight">100%</p>
                <p className="text-xs text-slate-400">Grounded Citations</p>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Hologram Setu Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <Hero3DVisual />
          </div>

        </div>
      </div>
    </section>
  );
}
