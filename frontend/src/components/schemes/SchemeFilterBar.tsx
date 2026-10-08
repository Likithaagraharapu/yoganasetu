'use client';

import React from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import VoiceInputButton from '@/components/chat/VoiceInputButton';

interface SchemeFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedTargetGroup: string;
  onTargetGroupChange: (tg: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categories: string[];
  totalResults: number;
}

export default function SchemeFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTargetGroup,
  onTargetGroupChange,
  sortBy,
  onSortChange,
  categories,
  totalResults,
}: SchemeFilterBarProps) {
  const targetGroups = [
    'All',
    'Farmers',
    'Students',
    'Women',
    'Artisans',
    'Entrepreneurs',
    'Unorganized Sector',
    'Senior Citizens',
  ];

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedTargetGroup !== 'All';

  const resetFilters = () => {
    onSearchChange('');
    onCategoryChange('All');
    onTargetGroupChange('All');
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 mb-8 space-y-6">
      {/* Top Search Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-amber-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by scheme name, keywords, benefits (e.g. 'subsidy', 'health cover', 'loan')..."
            className="w-full glass-input rounded-2xl py-3 pl-11 pr-14 text-sm text-white placeholder-slate-400"
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <VoiceInputButton onTranscript={(txt) => onSearchChange(txt)} />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2.5 rounded-2xl border border-white/10 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="relevance" className="bg-slate-900 text-white">Relevance</option>
              <option value="name_asc" className="bg-slate-900 text-white">Name (A-Z)</option>
              <option value="category" className="bg-slate-900 text-white">Category</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2.5 rounded-xl border border-rose-500/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter by Category:
          </span>
          <span>Showing <strong className="text-white">{totalResults}</strong> schemes</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onCategoryChange('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-950/40'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/5'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-950/40'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Target Group Pills Row */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <span className="text-xs font-semibold text-slate-400">Target Group:</span>
        <div className="flex flex-wrap gap-2">
          {targetGroups.map((tg) => (
            <button
              key={tg}
              onClick={() => onTargetGroupChange(tg)}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                selectedTargetGroup === tg
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-semibold'
                  : 'bg-slate-900/40 hover:bg-slate-800 text-slate-400 border border-white/5'
              }`}
            >
              {tg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
