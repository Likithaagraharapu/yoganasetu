'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useReducedMotion } from '@/lib/useReducedMotion';

interface NavItem3DProps {
  href: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  isActive: boolean;
  onClick?: () => void;
}

export default function NavItem3D({
  href,
  name,
  icon: Icon,
  badge,
  isActive,
  onClick,
}: NavItem3DProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const reducedMotion = useReducedMotion();
  const itemRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion || !itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    // Subtle natural tilt clamped to max 3.5 degrees
    const maxTilt = 3.5;
    setTilt({
      x: Number((-y * maxTilt * 2).toFixed(2)),
      y: Number((x * maxTilt * 2).toFixed(2)),
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  // Determine 3D transform style
  let transform = 'translateZ(0px)';
  if (!reducedMotion) {
    if (isPressed) {
      transform = `perspective(800px) rotateX(${tilt.x * 0.5}deg) rotateY(${tilt.y * 0.5}deg) translateZ(1px) translateY(1.5px) scale(0.98)`;
    } else if (isHovered) {
      transform = `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(6px) translateY(-1.5px)`;
    } else if (isActive) {
      transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(3px)';
    }
  }

  return (
    <Link
      ref={itemRef}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        willChange: 'transform, box-shadow',
      }}
      className={`relative group px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium select-none transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B19] ${
        isActive
          ? 'text-white'
          : 'text-slate-300 hover:text-white'
      }`}
    >
      {/* 3D Physical Plate Layer */}
      <span
        className={`absolute inset-0 rounded-full transition-all duration-300 pointer-events-none ${
          isActive
            ? 'bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-[#0F172A] border border-amber-500/40 shadow-[0_8px_20px_-2px_rgba(0,0,0,0.6),0_0_18px_rgba(255,153,51,0.22),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.5)]'
            : isHovered
            ? 'bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-white/25 shadow-[0_10px_22px_-3px_rgba(0,0,0,0.55),0_0_14px_rgba(255,153,51,0.12),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4)]'
            : 'bg-transparent border border-transparent shadow-none'
        }`}
      />

      {/* Traveling specular highlight sheen on hover */}
      <span
        className={`absolute inset-0 rounded-full overflow-hidden pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
          style={{ transform: 'skewX(-20deg)' }}
        />
      </span>

      {/* Content wrapper with depth preservation */}
      <span
        className="relative z-10 flex items-center gap-2"
        style={{
          transform: isHovered && !reducedMotion ? 'translateZ(6px)' : 'translateZ(0px)',
          transition: 'transform 0.25s ease-out',
        }}
      >
        {/* Icon with subtle forward pop */}
        {Icon && (
          <span
            className="flex items-center justify-center transition-transform duration-200"
            style={{
              transform: isHovered && !reducedMotion ? 'translateZ(8px) scale(1.08)' : 'translateZ(0px)',
            }}
          >
            <Icon
              className={`w-3.5 h-3.5 lg:w-4 lg:h-4 transition-colors duration-200 ${
                isActive
                  ? 'text-[#FF9933] drop-shadow-[0_0_8px_rgba(255,153,51,0.5)]'
                  : isHovered
                  ? 'text-amber-400'
                  : 'text-slate-400 group-hover:text-slate-200'
              }`}
            />
          </span>
        )}

        {/* Text Label */}
        <span
          className={`tracking-tight transition-colors duration-200 ${
            isActive ? 'font-semibold text-white' : 'font-medium'
          }`}
          style={{
            textShadow: isActive ? '0 1px 3px rgba(0,0,0,0.5)' : undefined,
          }}
        >
          {name}
        </span>

        {/* Badge (e.g. AI) */}
        {badge && (
          <span
            className="relative px-1.5 py-0.5 text-[9px] lg:text-[10px] font-bold text-white rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_2px_6px_rgba(234,88,12,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] border border-amber-300/30 transition-transform duration-200"
            style={{
              transform: isHovered && !reducedMotion ? 'translateZ(10px) scale(1.06)' : 'translateZ(0px)',
            }}
          >
            {badge}
          </span>
        )}
      </span>

      {/* Active breathing light indicator at bottom */}
      {isActive && (
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-amber-400 via-[#FF9933] to-orange-500 shadow-[0_0_8px_rgba(255,153,51,0.8)] pointer-events-none"
          style={{
            transform: 'translateX(-50%) translateZ(4px)',
          }}
        />
      )}
    </Link>
  );
}
