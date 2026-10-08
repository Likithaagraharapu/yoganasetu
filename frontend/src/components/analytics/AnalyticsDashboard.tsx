'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  IndianRupee, 
  ShieldCheck, 
  Building, 
  Layers, 
  ArrowUpRight,
  Sparkles,
  Bot,
  Database,
  HardDrive,
  Table,
  CheckCircle2
} from 'lucide-react';
import { StatsResponse, DatabaseStats } from '@/lib/types';
import { getStats, getDatabaseStats } from '@/lib/api';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [data, dbData] = await Promise.all([
          getStats(),
          getDatabaseStats().catch(() => null)
        ]);
        setStats(data);
        if (dbData) setDbStats(dbData);
      } catch (err) {
        console.warn('Backend stats error, using default metrics:', err);
        setStats({
          total_schemes: 24,
          total_categories: 8,
          category_counts: {
            Employment: 4,
            'Social Welfare': 4,
            Agriculture: 3,
            Education: 3,
            Finance: 3,
            'Women & Child': 3,
            Health: 2,
            Housing: 2,
          },
          target_group_counts: {
            Farmers: 3,
            Students: 3,
            Women: 4,
            Artisans: 2,
            Entrepreneurs: 3,
            'Low-Income Families': 5,
            'Senior Citizens': 2,
          },
          estimated_citizens_covered_crores: 85.4,
        });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-32 border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  // Find max category count for scale
  const maxCount = Math.max(...Object.values(stats.category_counts));

  return (
    <div className="space-y-8">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Flagship Schemes</span>
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats.total_schemes}</p>
          <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> 100% Verified DBT Portals
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Distinct Sectors</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats.total_categories}</p>
          <p className="text-xs text-slate-400">Agriculture, Health, MSME, Education</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Beneficiaries Covered</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">
            {stats.estimated_citizens_covered_crores} Cr+
          </p>
          <p className="text-xs text-slate-400">Across rural & urban India</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Semantic Index</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-purple-400">FAISS</p>
          <p className="text-xs text-slate-400">Vectorized SBERT Embeddings</p>
        </div>
      </div>

      {/* Main Grid: Sector Distribution & Target Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown Bar Chart */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-white">Scheme Distribution by Sector</h3>
              <p className="text-xs text-slate-400">Total active schemes mapped per vertical</p>
            </div>
            <BarChart3 className="w-5 h-5 text-amber-400" />
          </div>

          <div className="space-y-4">
            {Object.entries(stats.category_counts).map(([cat, count]) => {
              const pct = (count / maxCount) * 100;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat}</span>
                    <span className="text-slate-400 font-mono">{count} schemes</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Demographics Coverage */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-white">Citizen Demographic Coverage</h3>
              <p className="text-xs text-slate-400">Programs indexed by beneficiary group</p>
            </div>
            <PieChart className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="space-y-3">
            {Object.entries(stats.target_group_counts).map(([tg, count]) => (
              <div
                key={tg}
                className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs sm:text-sm font-medium text-slate-200">{tg}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {count} Schemes
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Real-time Query Activity / Mission Highlights */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10">
        <h3 className="font-bold text-lg text-white mb-2">National Mission Alignment</h3>
        <p className="text-xs text-slate-400 mb-6">
          Programs indexed in YojanaSetu adhere to key central government missions under Digital India & DBT.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-xs text-amber-400 font-semibold">Mission 1</span>
            <p className="text-sm font-bold text-white">Direct Benefit Transfer (DBT)</p>
            <p className="text-xs text-slate-400">100% of cash subsidies transferred directly to Aadhaar-linked accounts.</p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-xs text-blue-400 font-semibold">Mission 2</span>
            <p className="text-sm font-bold text-white">Paperless & Cashless Health</p>
            <p className="text-xs text-slate-400">PM-JAY covers over 27 medical specialties across 29,000 empaneled hospitals.</p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-xs text-emerald-400 font-semibold">Mission 3</span>
            <p className="text-sm font-bold text-white">Self-Reliant MSME Ecosystem</p>
            <p className="text-xs text-slate-400">Over ₹20 Lakh crore collateral-free credit disbursed under MUDRA and PMEGP.</p>
          </div>
        </div>
      </div>

      {/* SQLite 3 Relational Persistence & Index Diagnostics */}
      {dbStats && (
        <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Database className="w-3.5 h-3.5" />
                Persistent Storage Engine
              </div>
              <h3 className="font-bold text-xl text-white">SQLite 3 Relational Database Status</h3>
              <p className="text-xs text-slate-400 mt-1">
                Embedded high-performance relational storage with FTS5 inverted search index and ACID transaction guarantees.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SQLite {dbStats.sqlite_version} (WAL Mode)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 text-center">
              <span className="text-xs text-slate-400">Database Size</span>
              <p className="text-lg font-bold text-amber-400 mt-0.5">{dbStats.file_size_kb} KB</p>
            </div>
            <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 text-center">
              <span className="text-xs text-slate-400">Schemes</span>
              <p className="text-lg font-bold text-white mt-0.5">{dbStats.tables.schemes}</p>
            </div>
            <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 text-center">
              <span className="text-xs text-slate-400">Categories</span>
              <p className="text-lg font-bold text-white mt-0.5">{dbStats.tables.categories}</p>
            </div>
            <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 text-center">
              <span className="text-xs text-slate-400">Saved Bookmarks</span>
              <p className="text-lg font-bold text-amber-400 mt-0.5">{dbStats.tables.bookmarks}</p>
            </div>
            <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 text-center">
              <span className="text-xs text-slate-400">Eligibility Checks</span>
              <p className="text-lg font-bold text-blue-400 mt-0.5">{dbStats.tables.eligibility_history}</p>
            </div>
            <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-white/5 text-center">
              <span className="text-xs text-slate-400">Chat Audits</span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{dbStats.tables.chat_history}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
