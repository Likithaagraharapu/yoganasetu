'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';
import { Scheme } from '@/lib/types';
import SchemeCard from '@/components/schemes/SchemeCard';

interface FeaturedSchemesProps {
  schemes: Scheme[];
}

export default function FeaturedSchemes({ schemes }: FeaturedSchemesProps) {
  // Show top 6 flagship schemes
  const displaySchemes = schemes.slice(0, 6);

  return (
    <section className="py-20 relative bg-gradient-to-b from-transparent via-slate-950/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Highest Beneficiary Impact
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured <span className="gradient-text-saffron">National Schemes</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Central Sector and Centrally Sponsored programs offering significant financial subsidies, healthcare guarantees, and low-interest credit.
            </p>
          </div>

          <Link
            href="/schemes"
            className="btn-3d-secondary !py-2.5 !px-5 text-sm self-start md:self-auto group"
          >
            <span>Explore All 24+ Schemes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySchemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>

        {/* AI Discovery Callout Banner */}
        <div className="mt-12 glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-amber-950/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#FF9933] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Not sure which scheme you qualify for?</h4>
              <p className="text-sm text-slate-400 mt-0.5">
                Our AI Assistant matches your age, income, and state to find 100% eligible programs in seconds.
              </p>
            </div>
          </div>

          <Link
            href="/assistant"
            className="btn-3d-primary !py-3 !px-6 text-sm flex-shrink-0"
          >
            <span>Chat With Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
