'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

interface SchemeToken {
  id: string;
  name: string;
  icon: string;
  color: string;
  glow: string;
  angle: number; // 0-360 degrees around center
  distance: number; // Radius in pixels from center
  zDepth: number; // 3D depth in px
  preview: string;
  href: string;
}

// ─── 6 Carefully Spaced 3D Scheme Tokens (Zero Overlap) ────────────────────────
const SCHEME_TOKENS: SchemeToken[] = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: '🌾',
    color: '#22C55E',
    glow: 'rgba(34, 197, 94, 0.4)',
    angle: 330,
    distance: 180,
    zDepth: 25,
    preview: 'PM-KISAN • ₹6,000/yr',
    href: '/schemes?category=Agriculture',
  },
  {
    id: 'education',
    name: 'Education',
    icon: '🎓',
    color: '#60A5FA',
    glow: 'rgba(96, 165, 250, 0.4)',
    angle: 30,
    distance: 185,
    zDepth: -15,
    preview: 'National Scholarships & Fees',
    href: '/schemes?category=Education',
  },
  {
    id: 'health',
    name: 'Health',
    icon: '🏥',
    color: '#F472B6',
    glow: 'rgba(244, 114, 182, 0.4)',
    angle: 90,
    distance: 175,
    zDepth: 20,
    preview: 'Ayushman • ₹5 Lakh Cover',
    href: '/schemes?category=Health',
  },
  {
    id: 'housing',
    name: 'Housing',
    icon: '🏠',
    color: '#FB923C',
    glow: 'rgba(251, 146, 60, 0.4)',
    angle: 150,
    distance: 180,
    zDepth: -20,
    preview: 'PMAY Pucca House Subsidy',
    href: '/schemes?category=Housing',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    color: '#FACC15',
    glow: 'rgba(250, 204, 21, 0.4)',
    angle: 210,
    distance: 185,
    zDepth: 15,
    preview: 'MUDRA • Up to ₹20L Credit',
    href: '/schemes?category=Finance',
  },
  {
    id: 'women',
    name: 'Women & Child',
    icon: '👩‍👧',
    color: '#C084FC',
    glow: 'rgba(192, 132, 252, 0.4)',
    angle: 270,
    distance: 175,
    zDepth: -10,
    preview: 'Sukanya Samriddhi & PMMVY',
    href: '/schemes?category=Women%20%26%20Child',
  },
];

export default function Hero3DVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check reduced motion
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Track mouse coordinates over container
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseRef.current = {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas drawing loop: elegant connection lines + slow light pulses
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // Smooth mouse damping
    if (!reducedMotion) {
      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.05;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.05;
    }

    const mx = smoothMouseRef.current.x - 0.5;
    const my = smoothMouseRef.current.y - 0.5;
    const cx = W / 2 + mx * 16;
    const cy = H / 2 + my * 12;

    const t = performance.now() / 1000;

    // Draw connection lines from Core to each Token
    SCHEME_TOKENS.forEach((token, i) => {
      const rad = (token.angle * Math.PI) / 180;
      // Responsive distance based on container width
      const scaleFactor = Math.min(W, H) / 480;
      const dist = token.distance * Math.max(0.75, Math.min(1.05, scaleFactor));

      const floatY = reducedMotion ? 0 : Math.sin(t * 1.2 + i) * 6;
      const tx = cx + Math.cos(rad) * dist + (mx * token.zDepth * 0.3);
      const ty = cy + Math.sin(rad) * dist * 0.82 + (my * token.zDepth * 0.3) + floatY;

      const isHovered = hoveredToken === token.id;

      // Subtle curved connection path
      const cpX = (cx + tx) / 2;
      const cpY = (cy + ty) / 2 + 10;

      const grad = ctx.createLinearGradient(cx, cy, tx, ty);
      const alpha = isHovered ? 0.75 : 0.22;
      grad.addColorStop(0, `rgba(255, 153, 51, ${alpha})`);
      grad.addColorStop(1, `${token.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cpX, cpY, tx, ty);
      ctx.strokeStyle = grad;
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Traveling photon pulse along line
      const pulseT = ((t * 0.35 + i * 0.16) % 1);
      const u = pulseT;
      const px = (1 - u) * (1 - u) * cx + 2 * (1 - u) * u * cpX + u * u * tx;
      const py = (1 - u) * (1 - u) * cy + 2 * (1 - u) * u * cpY + u * u * ty;

      ctx.beginPath();
      ctx.arc(px, py, isHovered ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(u * Math.PI) * 0.85})`;
      ctx.fill();
    });

    ctx.restore();
    rafRef.current = requestAnimationFrame(drawCanvas);
  }, [reducedMotion, hoveredToken]);

  useEffect(() => {
    if (!mounted) return;
    rafRef.current = requestAnimationFrame(drawCanvas);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mounted, drawCanvas]);

  const mx = smoothMouseRef.current.x - 0.5;
  const my = smoothMouseRef.current.y - 0.5;
  const tiltX = reducedMotion ? 0 : my * -8;
  const tiltY = reducedMotion ? 0 : mx * 10;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[450px] sm:h-[500px] lg:h-[540px] select-none overflow-hidden"
      style={{ perspective: '1000px' }}
      aria-label="YojanaSetu 3D Scheme Constellation"
    >
      {/* ── Background Canvas Layer for lines ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* ── Ambient Radial Glow ── */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,153,51,0.08) 0%, rgba(30,58,138,0.10) 45%, transparent 75%)',
        }}
      />

      {/* ── 3D Transformed Interactive Container ── */}
      <div
        className="relative w-full h-full transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ══════════════════════════════════════════════════════
            CENTRAL AI CORE (YojanaSetu Orb)
        ══════════════════════════════════════════════════════ */}
        {mounted && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
            style={{
              transform: 'translate(-50%, -50%) translateZ(25px)',
            }}
          >
            {/* Outer Slow Gyro Ring */}
            <div
              className="absolute rounded-full border border-amber-400/25"
              style={{
                width: 120,
                height: 120,
                borderStyle: 'dashed',
                borderWidth: '1.5px',
                animation: reducedMotion ? 'none' : 'core-ring-spin 28s linear infinite',
              }}
            />

            {/* Glowing Metallic AI Orb */}
            <div
              className="relative rounded-full flex items-center justify-center shadow-2xl transition-transform"
              style={{
                width: 72,
                height: 72,
                background:
                  'radial-gradient(circle at 35% 35%, #FFF1D2 0%, #FF9933 45%, #C2410C 85%, #0B132B 100%)',
                boxShadow:
                  '0 0 0 2px rgba(255,153,51,0.3), 0 0 32px 10px rgba(255,153,51,0.35), 0 0 60px 20px rgba(234,88,12,0.18)',
                animation: reducedMotion ? 'none' : 'core-breathe 4s ease-in-out infinite',
              }}
            >
              {/* Devanagari 'य' Core Symbol */}
              <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text text-transparent drop-shadow-md">
                य
              </span>

              {/* Specular Glint */}
              <div
                className="absolute top-2 left-3 w-4 h-2 rounded-full bg-white/60 blur-[1px] rotate-[-25deg]"
                aria-hidden="true"
              />
            </div>

            {/* Core Label */}
            <div className="mt-3 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-amber-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                YojanaSetu AI
              </span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            6 COMPACT 3D GLASS SCHEME TOKENS (No Overlap)
        ══════════════════════════════════════════════════════ */}
        {mounted &&
          SCHEME_TOKENS.map((token, i) => {
            const rad = (token.angle * Math.PI) / 180;
            const isHovered = hoveredToken === token.id;

            // Compute polar layout as percentage from center
            // Radius ~38% of container
            const pctRadius = 38;
            const leftPct = 50 + Math.cos(rad) * pctRadius;
            const topPct = 50 + Math.sin(rad) * (pctRadius * 0.82);

            return (
              <div
                key={token.id}
                className="absolute z-30 transition-all duration-300 ease-out"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: `translate(-50%, -50%) translateZ(${token.zDepth}px) scale(${isHovered ? 1.12 : 1})`,
                  animation: reducedMotion
                    ? 'none'
                    : `token-float 4.5s ease-in-out ${i * 0.6}s infinite`,
                }}
                onMouseEnter={() => setHoveredToken(token.id)}
                onMouseLeave={() => setHoveredToken(null)}
              >
                <Link
                  href={token.href}
                  className="block relative group focus:outline-none"
                  aria-label={`${token.name} Schemes`}
                >
                  {/* Compact 3D Glass Token Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-xl"
                    style={{
                      background: isHovered
                        ? `linear-gradient(135deg, rgba(20, 30, 60, 0.95) 0%, rgba(10, 15, 35, 0.98) 100%)`
                        : `linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(8, 12, 26, 0.92) 100%)`,
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: `1.5px solid ${isHovered ? token.color : 'rgba(255, 255, 255, 0.12)'}`,
                      boxShadow: isHovered
                        ? `0 0 0 1px ${token.color}40, 0 12px 28px ${token.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                        : `0 6px 18px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
                    }}
                  >
                    <span className="text-xl leading-none transition-transform group-hover:scale-110">
                      {token.icon}
                    </span>
                    <span
                      className="text-[9px] font-bold tracking-tight text-slate-300 group-hover:text-white transition-colors mt-1 truncate max-w-[50px]"
                    >
                      {token.name}
                    </span>
                  </div>

                  {/* Clean Tooltip on Hover (Positioned to Avoid Overlap) */}
                  {isHovered && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-white/15 text-center shadow-2xl backdrop-blur-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                      style={{ borderColor: token.color }}
                    >
                      <p className="text-[11px] font-bold text-white">{token.name}</p>
                      <p className="text-[10px] text-emerald-400 font-semibold">{token.preview}</p>
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes core-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes core-breathe {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 2px rgba(255,153,51,0.3), 0 0 32px 10px rgba(255,153,51,0.35), 0 0 60px 20px rgba(234,88,12,0.18);
          }
          50% {
            transform: scale(1.04);
            box-shadow: 0 0 0 3px rgba(255,153,51,0.45), 0 0 45px 15px rgba(255,153,51,0.48), 0 0 80px 26px rgba(234,88,12,0.25);
          }
        }
        @keyframes token-float {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-6px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
