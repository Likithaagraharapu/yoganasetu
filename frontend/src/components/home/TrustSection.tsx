'use client';

import React from 'react';
import { ShieldCheck, Lock, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';

export default function TrustSection() {
  const trustPoints = [
    {
      title: '100% Grounded in Official Portals',
      description: 'Every scheme rule, monetary benefit, and eligibility clause is linked directly to official Central and State government websites (.gov.in / .nic.in).',
      icon: ExternalLink,
      badge: 'Zero Hallucination',
    },
    {
      title: 'Citizen Privacy By Design',
      description: 'We do not collect sensitive Aadhaar numbers or personal bank credentials. Eligibility checks run securely in real-time.',
      icon: Lock,
      badge: 'Privacy Protected',
    },
    {
      title: 'No Middlemen or Brokerage Fees',
      description: 'YojanaSetu is a free public discovery bridge. We empower citizens to apply directly through official portals and Common Service Centers (CSC).',
      icon: ShieldCheck,
      badge: 'Direct Empowerment',
    },
    {
      title: 'Comprehensive Document Checklists',
      description: 'Never get rejected due to missing certificates. YojanaSetu provides clear lists of required IDs, income proofs, and land records beforehand.',
      icon: FileText,
      badge: 'First-Time Approval',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Integrity & Transparency
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Citizens & Educators Trust <span className="gradient-text-saffron">YojanaSetu</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Built as a transparent AI platform designed to make government welfare accessible, understandable, and verifiable.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="glass-card card-sheen rounded-2xl p-7 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      {point.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {point.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    {point.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Architecture</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transparency Box */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong className="text-white">Note for Demonstration:</strong> YojanaSetu is an educational & research AI platform inspired by Government of India digital public infrastructure. All scheme data corresponds to authentic published guidelines from Central Ministries.
          </p>
        </div>

      </div>
    </section>
  );
}
