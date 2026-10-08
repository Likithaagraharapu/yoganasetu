'use client';

import React from 'react';
import { ShieldCheck, IndianRupee, Users, CheckCircle, Sparkles, Building } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    {
      label: 'Flagship Schemes Indexed',
      value: '24+',
      subtext: 'Central & State DBT Programs',
      icon: Building,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Max Healthcare Guarantee',
      value: '₹5 Lakh',
      subtext: 'Free secondary & tertiary care',
      icon: IndianRupee,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Beneficiary Outreach',
      value: '85.4 Cr',
      subtext: 'Citizens eligible across India',
      icon: Users,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Grounded Accuracy',
      value: '100%',
      subtext: 'Direct links to official portals',
      icon: ShieldCheck,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
          {/* Subtle glow circle */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/10 blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col space-y-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${s.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {s.value}
                    </h3>
                    <p className="text-sm font-semibold text-slate-200 mt-1">
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {s.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
