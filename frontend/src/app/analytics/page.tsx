'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <BarChart3 className="w-3.5 h-3.5" />
              National Welfare Insights & RAG Metrics
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Scheme Statistics & <span className="gradient-text-saffron">Analytics</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              Transparent data on scheme distribution across Indian economic sectors, demographic targets, and financial allocations.
            </p>
          </div>

          <AnalyticsDashboard />

        </div>
      </main>

      <Footer />
    </div>
  );
}
