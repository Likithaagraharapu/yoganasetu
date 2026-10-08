'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Compass, 
  Sparkles, 
  SearchX, 
  HelpCircle, 
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SchemeFilterBar from '@/components/schemes/SchemeFilterBar';
import SchemeCard from '@/components/schemes/SchemeCard';
import { Scheme } from '@/lib/types';
import { getSchemes, getCategories, getBookmarks } from '@/lib/api';
import { Bookmark, BookmarkCheck } from 'lucide-react';

function SchemeDirectoryContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('query') || '';

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTargetGroup, setSelectedTargetGroup] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');

  const [visibleCount, setVisibleCount] = useState(12);

  // Sync state if URL search parameters change
  useEffect(() => {
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category') || 'All');
    }
    if (searchParams.get('query')) {
      setSearchQuery(searchParams.get('query') || '');
    }
  }, [searchParams]);

  // Fetch schemes, categories, and SQLite bookmarks
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schemesData, categoriesData, bookmarksData] = await Promise.all([
        getSchemes({ limit: 100 }),
        getCategories().catch(() => []),
        getBookmarks().catch(() => []),
      ]);
      setSchemes(schemesData);
      setCategories(categoriesData);
      setBookmarkedIds(new Set(bookmarksData.map((b) => b.scheme.id)));
    } catch (err: any) {
      console.warn('Backend fetch failed, falling back to local dataset if available:', err);
      // Fallback: try fetching directly from public/data or relative path
      try {
        const localRes = await fetch('/data/schemes.json');
        if (localRes.ok) {
          const localData = await localRes.json();
          setSchemes(localData);
          const cats = Array.from(new Set(localData.map((s: any) => s.category))) as string[];
          setCategories(cats);
        } else {
          setError('Unable to load schemes. Please ensure the backend is running.');
        }
      } catch (localErr) {
        setError('Connection to scheme database failed. Retrying...');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort schemes
  const filteredSchemes = useMemo(() => {
    let result = [...schemes];

    // Filter by SQLite bookmarks if active
    if (showOnlyBookmarked) {
      result = result.filter((s) => bookmarkedIds.has(s.id));
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(
        (s) => s.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by target group
    if (selectedTargetGroup && selectedTargetGroup !== 'All') {
      const tgLower = selectedTargetGroup.toLowerCase();
      result = result.filter((s) =>
        s.target_group.toLowerCase().includes(tgLower)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(q);
        const descMatch = s.description.toLowerCase().includes(q);
        const benefitMatch = s.benefits.toLowerCase().includes(q);
        const catMatch = s.category.toLowerCase().includes(q);
        const tgMatch = s.target_group.toLowerCase().includes(q);
        return nameMatch || descMatch || benefitMatch || catMatch || tgMatch;
      });
    }

    // Sort
    if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
      result.sort((a, b) => a.category.localeCompare(b.category));
    }

    return result;
  }, [schemes, selectedCategory, selectedTargetGroup, searchQuery, sortBy, showOnlyBookmarked, bookmarkedIds]);

  const paginatedSchemes = filteredSchemes.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSchemes.length;

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Compass className="w-3.5 h-3.5" />
                Central & State Scheme Directory
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Explore All <span className="gradient-text-saffron">Government Schemes</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
                Filter by sector, demographic group, or search specifically for grants, subsidies, and scholarships.
              </p>
            </div>

            {/* Quick SQLite Bookmarks Filter Pill */}
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  showOnlyBookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${showOnlyBookmarked ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                <span>Saved Schemes ({bookmarkedIds.size})</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <SchemeFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedTargetGroup={selectedTargetGroup}
            onTargetGroupChange={setSelectedTargetGroup}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categories={categories}
            totalResults={filteredSchemes.length}
          />

          {/* Loading Skeleton State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 h-64 border border-white/5 space-y-4">
                  <div className="h-5 w-24 bg-slate-800 rounded-full" />
                  <div className="h-6 w-3/4 bg-slate-800 rounded-lg" />
                  <div className="h-14 w-full bg-slate-800/60 rounded-lg" />
                  <div className="h-10 w-full bg-slate-800/40 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="glass-panel rounded-3xl p-10 text-center border border-rose-500/30 max-w-md mx-auto my-12">
              <p className="text-rose-400 text-sm font-medium mb-4">{error}</p>
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Loading
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredSchemes.length === 0 && (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 max-w-lg mx-auto my-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No Schemes Found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                No government schemes matched your exact filters. Try broadening your keywords or clearing selected categories.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedTargetGroup('All');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-white/10"
                >
                  Clear All Filters
                </button>
                <Link
                  href="/assistant"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask AI Assistant
                </Link>
              </div>
            </div>
          )}

          {/* Scheme Cards Grid */}
          {!loading && !error && filteredSchemes.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    initialBookmarked={bookmarkedIds.has(scheme.id)}
                    onBookmarkChange={(id, isSaved) => {
                      setBookmarkedIds((prev) => {
                        const next = new Set(prev);
                        if (isSaved) next.add(id);
                        else next.delete(id);
                        return next;
                      });
                    }}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-sm border border-white/10 hover:border-amber-500/30 transition-all shadow-lg"
                  >
                    <span>Load More Schemes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SchemesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070B19] flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      }
    >
      <SchemeDirectoryContent />
    </Suspense>
  );
}
