'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EligibilityWizard from '@/components/eligibility/EligibilityWizard';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function EligibilityPage() {
  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Smart Eligibility Calculator
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Scheme <span className="gradient-text-saffron">Eligibility Wizard</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Answer a few simple questions about your profile to discover all central and state welfare benefits you are eligible to claim.
            </p>
          </div>

          {/* Multi-step Wizard */}
          <EligibilityWizard />

        </div>
      </main>

      <Footer />
    </div>
  );
}
