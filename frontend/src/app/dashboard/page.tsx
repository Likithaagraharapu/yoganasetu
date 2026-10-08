'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Bookmark,
  Sparkles,
  Search,
  LogOut,
  Calendar,
  MapPin,
  ArrowRight,
  ExternalLink,
  Trash2,
  Loader2,
  Lock,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getBookmarks, removeBookmark } from '@/lib/api';
import { BookmarkItem } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserBookmarks();
    }
  }, [isAuthenticated, user?.id]);

  const fetchUserBookmarks = async () => {
    if (!user?.id) return;
    setLoadingBookmarks(true);
    try {
      const data = await getBookmarks(user.id);
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const handleRemoveBookmark = async (schemeId: string) => {
    if (!user?.id) return;
    setRemovingId(schemeId);
    try {
      await removeBookmark(schemeId, user.id);
      setBookmarks((prev) => prev.filter((b) => b.scheme.id !== schemeId));
    } catch (err) {
      console.error('Failed to remove bookmark', err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading your citizen profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-20">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please sign in to access your citizen dashboard, view saved schemes, and manage personalized eligibility data.
            </p>
            <div className="pt-2">
              <Link
                href="/login?redirect=/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs transition-all shadow-lg shadow-orange-950/40"
              >
                <span>Sign In to Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const createdDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between selection:bg-amber-500/30">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Profile Banner */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-xl shadow-orange-950/50">
                {user.full_name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Citizen
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400 capitalize">{user.role || 'citizen'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.full_name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                  <span>{user.email}</span>
                  {user.state && (
                    <span className="inline-flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {user.state}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Joined {createdDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/schemes"
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors inline-flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>Search Schemes</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-semibold border border-red-500/20 transition-colors inline-flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Saved Schemes</p>
              <p className="text-2xl font-bold text-white mt-1">{bookmarks.length}</p>
              <p className="text-[11px] text-amber-400 mt-1">Stored in SQLite 3</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bookmark className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Eligibility Engine</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">Ready</p>
              <Link href="/eligibility" className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors mt-1 inline-flex items-center gap-1">
                <span>Check status</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">AI Assistant</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">10+ Langs</p>
              <Link href="/assistant" className="text-[11px] text-slate-400 hover:text-purple-300 transition-colors mt-1 inline-flex items-center gap-1">
                <span>Voice chat</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">National Coverage</p>
              <p className="text-2xl font-bold text-white mt-1">40+ Schemes</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Central & State</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Saved Schemes Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Your Saved Schemes</h2>
              <p className="text-xs text-slate-400">
                Direct access to bookmarked government schemes and application deadlines.
              </p>
            </div>
            <Link
              href="/schemes"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingBookmarks ? (
            <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading saved bookmarks from SQLite...</p>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="glass-panel rounded-3xl p-10 border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No saved schemes yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven&apos;t bookmarked any schemes. Browse the catalog to save eligible benefits for easy tracking.
              </p>
              <div className="pt-2">
                <Link
                  href="/schemes"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs shadow-md"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Browse Schemes Catalog</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.map((bm) => {
                const s = bm.scheme;
                if (!s) return null;
                return (
                  <div
                    key={s.id}
                    className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                          {s.category || 'General'}
                        </span>
                        <button
                          onClick={() => handleRemoveBookmark(s.id)}
                          disabled={removingId === s.id}
                          aria-label="Remove bookmark"
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          title="Remove from saved"
                        >
                          {removingId === s.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                        {s.name}
                      </h4>

                      {s.target_group && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{s.target_group}</p>
                      )}

                      {bm.notes && (
                        <div className="mt-3 p-2 rounded-lg bg-slate-900/60 border border-white/5 text-[11px] text-slate-300">
                          <span className="text-slate-500 font-semibold block text-[10px]">NOTES:</span>
                          {bm.notes}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">
                        Saved {bm.bookmarked_at ? new Date(bm.bookmarked_at).toLocaleDateString() : 'Recently'}
                      </span>
                      <Link
                        href={`/schemes?id=${encodeURIComponent(s.id)}`}
                        className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 text-xs"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Actions Grid */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white">Recommended Actions for You</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/eligibility"
              className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Eligibility Evaluation
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Answer 6 quick questions to discover all schemes tailored to your occupation and income.
                </p>
              </div>
              <div className="mt-4 pt-2 text-xs font-semibold text-emerald-400 inline-flex items-center gap-1">
                <span>Start Evaluation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/assistant"
              className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  AI Voice Assistant
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Chat or speak in Hindi, Tamil, Telugu, Kannada, or Bengali for instant scheme guidance.
                </p>
              </div>
              <div className="mt-4 pt-2 text-xs font-semibold text-purple-400 inline-flex items-center gap-1">
                <span>Launch Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/schemes"
              className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Full Schemes Directory
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Filter by sector: Agriculture, Women, Health, Education, Housing, and Social Security.
                </p>
              </div>
              <div className="mt-4 pt-2 text-xs font-semibold text-amber-400 inline-flex items-center gap-1">
                <span>Browse Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
