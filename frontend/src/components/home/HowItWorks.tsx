'use client';

import React from 'react';
import { UserCheck, Cpu, FileCheck, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    step: '01',
    title: 'Share Profile or Ask AI',
    description: 'Use our voice-enabled AI chat or step-by-step Eligibility Wizard with your occupation, age, state, and income.',
    icon: UserCheck,
    accent: 'from-amber-500 to-orange-500',
  },
  {
    step: '02',
    title: 'FAISS Semantic Matching',
    description: 'Our vector pipeline cross-references your profile against authentic Government of India scheme criteria.',
    icon: Cpu,
    accent: 'from-blue-500 to-indigo-600',
  },
  {
    step: '03',
    title: 'Eligibility & Document Checklist',
    description: 'Get an instant match score, exact financial benefit breakdown, and a checklist of mandatory documents.',
    icon: FileCheck,
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    step: '04',
    title: 'Apply on Official Portals',
    description: 'Follow step-by-step application guidance and jump directly to official verified government portals.',
    icon: ExternalLink,
    accent: 'from-purple-500 to-pink-600',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-white/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Streamlined Citizen Journey
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How <span className="gradient-text-saffron">YojanaSetu</span> Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Bridging the gap between complex government circulars and everyday Indian citizens through transparent AI.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/3 left-12 right-12 h-0.5 bg-gradient-to-r from-amber-500/30 via-blue-500/30 to-emerald-500/30 -z-10" />

          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="glass-card rounded-2xl p-6 relative flex flex-col justify-between border border-white/5 hover:border-white/20 transition-all group"
              >
                <div>
                  {/* Step Number Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-600 group-hover:text-amber-400 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">
                  <span>Step {idx + 1} of 4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-14 text-center">
          <Link
            href="/eligibility"
            className="btn-3d-primary !py-3.5 !px-8 !text-base font-bold shadow-2xl"
          >
            <span>Start Your Eligibility Check Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
