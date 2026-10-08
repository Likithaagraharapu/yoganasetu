'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  CheckCircle2, 
  BarChart3, 
  Menu, 
  X, 
  ArrowRight,
  Bot,
  Play,
  User as UserIcon,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import LanguageSelector from '@/components/layout/LanguageSelector';
import NavItem3D from '@/components/layout/NavItem3D';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoTilt, setLogoTilt] = useState({ x: 0, y: 0 });
  const [logoHover, setLogoHover] = useState(false);
  const [ctaPressed, setCtaPressed] = useState(false);
  const [introPressed, setIntroPressed] = useState(false);
  const reducedMotion = useReducedMotion();
  const logoRef = useRef<HTMLAnchorElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.schemes'), href: '/schemes', icon: Compass },
    { name: t('nav.eligibility'), href: '/eligibility', icon: CheckCircle2 },
    { name: t('nav.assistant'), href: '/assistant', icon: Bot, badge: 'AI' },
    { name: t('nav.analytics'), href: '/analytics', icon: BarChart3 },
  ];

  const handleLogoMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion || !logoRef.current) return;
    const rect = logoRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setLogoTilt({
      x: Number((-y * 6).toFixed(2)),
      y: Number((x * 6).toFixed(2)),
    });
  };

  const handleLogoMouseLeave = () => {
    setLogoHover(false);
    setLogoTilt({ x: 0, y: 0 });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070B19]/90 backdrop-blur-2xl border-b border-white/12 shadow-[0_16px_36px_-4px_rgba(0,0,0,0.65),0_1px_0_rgba(255,255,255,0.08)] py-2.5'
          : 'bg-transparent py-4'
      }`}
      style={{
        boxShadow: scrolled
          ? '0 16px 36px -4px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
          : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* 3D Brand Logo */}
          <Link
            ref={logoRef}
            href="/"
            onMouseMove={handleLogoMouseMove}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={handleLogoMouseLeave}
            style={{
              transform: !reducedMotion && logoHover
                ? `perspective(800px) rotateX(${logoTilt.x}deg) rotateY(${logoTilt.y}deg) translateZ(4px) translateY(-1px)`
                : 'perspective(800px) translateZ(0px)',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B19] rounded-2xl p-1"
          >
            {/* 3D Brand Emblem Tile */}
            <div
              className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E3A8A] via-[#0F172A] to-[#FF9933] p-[1.5px] transition-all duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] group-hover:shadow-[0_12px_24px_rgba(255,153,51,0.25),0_0_16px_rgba(30,58,138,0.4)]"
              style={{
                transform: !reducedMotion && logoHover ? 'translateZ(6px) scale(1.04)' : 'translateZ(0px)',
                transition: 'transform 0.25s ease-out',
              }}
            >
              <div className="w-full h-full bg-[#070B19] rounded-[10px] flex items-center justify-center relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-transparent to-blue-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent select-none">
                  य
                </span>
              </div>
            </div>

            {/* Brand Text */}
            <div
              className="flex flex-col"
              style={{
                transform: !reducedMotion && logoHover ? 'translateZ(4px)' : 'translateZ(0px)',
                transition: 'transform 0.25s ease-out',
              }}
            >
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5 leading-tight">
                Yojana<span className="text-[#FF9933] drop-shadow-[0_0_10px_rgba(255,153,51,0.4)]">Setu</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold -mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                Citizen AI Portal
              </span>
            </div>
          </Link>

          {/* Desktop 3D Navigation Cradle (Physical Dock) */}
          <nav
            className="hidden md:flex items-center gap-1 bg-slate-900/75 p-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.45),0_6px_18px_rgba(0,0,0,0.35)]"
            style={{
              perspective: 1000,
              transformStyle: 'preserve-3d',
            }}
          >
            {navLinks.map((link) => (
              <NavItem3D
                key={link.href}
                href={link.href}
                name={link.name}
                icon={link.icon}
                badge={link.badge}
                isActive={pathname === link.href}
              />
            ))}
          </nav>

          {/* Desktop Right Controls: Intro, Language Selector, Sign In, Primary 3D CTA */}
          <div
            className="hidden md:flex items-center gap-3"
            style={{ perspective: 900, transformStyle: 'preserve-3d' }}
          >
            {/* 3D Intro Replay Button */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('ys-replay-intro'));
                }
              }}
              onMouseDown={() => setIntroPressed(true)}
              onMouseUp={() => setIntroPressed(false)}
              onMouseLeave={() => setIntroPressed(false)}
              style={{
                transform: !reducedMotion && introPressed
                  ? 'translateZ(1px) translateY(1px) scale(0.97)'
                  : undefined,
                transformStyle: 'preserve-3d',
              }}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-300 bg-slate-900/70 hover:bg-slate-800/90 border border-white/10 hover:border-amber-500/30 shadow-[0_3px_8px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.4)] hover:shadow-[0_6px_14px_rgba(0,0,0,0.45),0_0_10px_rgba(255,153,51,0.15)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title="Play 5-Second Citizen Intro"
            >
              <Play className="w-3 h-3 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline tracking-tight">Intro</span>
            </button>

            {/* 3D Language Selector Component */}
            <LanguageSelector />

            {/* Authenticated Citizen State vs Guest Auth Links */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 shadow-sm text-xs font-semibold text-white transition-all duration-200"
                  title="Open Citizen Dashboard"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FF9933] to-[#EA580C] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.full_name}</span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                {/* 3D Sign In Link */}
                <Link
                  href="/login"
                  className="text-xs lg:text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {t('nav.signIn')}
                </Link>

                {/* Primary High-Impact 3D CTA Button ("Get Started") */}
                <Link
                  href="/signup"
                  onMouseDown={() => setCtaPressed(true)}
                  onMouseUp={() => setCtaPressed(false)}
                  onMouseLeave={() => setCtaPressed(false)}
                  style={{
                    transform: !reducedMotion && ctaPressed
                      ? 'translateY(3px) scale(0.98)'
                      : undefined,
                  }}
                  className="relative group inline-flex items-center justify-center gap-2 px-4 py-2 text-xs lg:text-sm font-bold text-white rounded-xl select-none cursor-pointer overflow-hidden transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B19]"
                >
                  {/* 3D Saffron Slab Background with Extrusion */}
                  <span
                    className={`absolute inset-0 rounded-xl transition-all duration-150 bg-gradient-to-b from-[#FFA238] via-[#F59E0B] to-[#EA580C] ${
                      ctaPressed
                        ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.4),0_1px_0_#9A3412,0_2px_6px_rgba(154,52,18,0.4)]'
                        : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(0,0,0,0.3),0_4px_0_#9A3412,0_8px_18px_rgba(154,52,18,0.45)] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-2px_0_rgba(0,0,0,0.3),0_5px_0_#9A3412,0_12px_24px_rgba(154,52,18,0.6)] group-hover:-translate-y-0.5'
                    }`}
                  />

                  {/* Specular Traveling Light Sheen */}
                  <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                      style={{ transform: 'skewX(-20deg)' }}
                    />
                  </span>

                  {/* Text & Icon Layer with Depth */}
                  <span className="relative z-10 flex items-center gap-1.5 tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                    <span>{t('nav.getStarted')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200 stroke-[2.5]" />
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Intro, Language & 3D Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('ys-replay-intro'));
                }
              }}
              className="p-2 rounded-xl text-xs text-amber-400 bg-slate-900/80 border border-white/10 shadow-[0_2px_6px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-95 transition-all"
              title="Play Citizen Intro"
              aria-label="Play Citizen Intro"
            >
              <Play className="w-3.5 h-3.5 fill-amber-400" />
            </button>

            <LanguageSelector />

            {/* 3D Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-900/80 border border-white/12 text-slate-200 hover:text-white shadow-[0_3px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.4)] active:scale-95 active:translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 3D Mobile Floating Menu Sheet */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden mt-3 p-3 rounded-2xl border border-white/15 bg-[#0a1126]/95 backdrop-blur-2xl shadow-[0_24px_48px_-8px_rgba(0,0,0,0.85),0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] flex flex-col gap-2 z-50 ${
              reducedMotion
                ? 'animate-in fade-in duration-100'
                : 'animate-in fade-in zoom-in-95 slide-in-from-top-3 duration-250'
            }`}
          >
            {/* Nav links as physical tactile cards */}
            <div className="space-y-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] active:translate-y-0.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-slate-900/80 text-amber-300 border border-amber-500/40 shadow-[0_4px_14px_rgba(255,153,51,0.18),inset_0_1px_0_rgba(255,255,255,0.15)]'
                        : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-white/8 shadow-[0_2px_6px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && (
                        <div
                          className={`p-1.5 rounded-lg ${
                            isActive
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                      <span className="tracking-tight">{link.name}</span>
                    </div>

                    {link.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full shadow-[0_2px_6px_rgba(234,88,12,0.4)]">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Actions */}
            <div className="pt-2 mt-1 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Dashboard ({user.full_name})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:text-rose-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-white/10 bg-slate-900/60 text-slate-200 hover:text-white font-semibold text-sm shadow-[0_2px_6px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-[0.98] transition-all"
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-3d-primary w-full text-center py-2.5 rounded-xl text-sm font-bold justify-center"
                  >
                    <span>{t('nav.getStarted')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
