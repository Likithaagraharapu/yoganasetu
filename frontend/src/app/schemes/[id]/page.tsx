'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Users, 
  Building2, 
  Calendar, 
  IndianRupee, 
  Share2, 
  Bookmark,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import SchemeCard from '@/components/schemes/SchemeCard';
import { Scheme } from '@/lib/types';
import { getSchemeById, getSchemes } from '@/lib/api';

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schemeId = params?.id as string;

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [relatedSchemes, setRelatedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadScheme() {
      if (!schemeId) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getSchemeById(schemeId);
        setScheme(data);

        // Fetch related schemes from the same category
        if (data?.category) {
          const all = await getSchemes({ category: data.category, limit: 4 });
          setRelatedSchemes(all.filter((s) => s.id !== data.id).slice(0, 3));
        }
      } catch (err: any) {
        console.warn('Failed to fetch from API, attempting local fallback:', err);
        try {
          const res = await fetch('/data/schemes.json');
          const allSchemes: Scheme[] = await res.json();
          const found = allSchemes.find((s) => s.id === schemeId);
          if (found) {
            setScheme(found);
            setRelatedSchemes(
              allSchemes
                .filter((s) => s.category === found.category && s.id !== found.id)
                .slice(0, 3)
            );
          } else {
            setError('Scheme not found in database.');
          }
        } catch {
          setError('Unable to load scheme details.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadScheme();
  }, [schemeId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 pt-36 pb-20 max-w-5xl mx-auto px-4 w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 bg-slate-800 rounded-lg" />
            <div className="h-10 w-3/4 bg-slate-800 rounded-xl" />
            <div className="h-40 w-full bg-slate-800/60 rounded-3xl" />
            <div className="h-64 w-full bg-slate-800/40 rounded-3xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 pt-36 pb-20 max-w-lg mx-auto px-4 text-center">
          <div className="glass-panel p-10 rounded-3xl border border-rose-500/20 space-y-4">
            <h2 className="text-xl font-bold text-white">Scheme Not Found</h2>
            <p className="text-sm text-slate-400">
              {error || 'The requested government scheme could not be located.'}
            </p>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-xs shadow-md mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Scheme Directory
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link
              href="/schemes"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Schemes
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs border border-white/10 transition-colors"
                title="Copy scheme link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Scheme Header Card */}
          <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden mb-10">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none" />

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge category={scheme.category} size="md">
                {scheme.category}
              </Badge>
              <span className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Central/State Scheme
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-snug">
              {scheme.name}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl mb-8">
              {scheme.description}
            </p>

            {/* Quick Action Ribbon */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/10">
              <a
                href={scheme.official_source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#EA580C] hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-950/40 transition-all hover:scale-[1.02]"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <Link
                href={`/assistant?scheme=${encodeURIComponent(scheme.id)}`}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 hover:border-amber-500/30 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ask AI About This Scheme</span>
              </Link>

              <Link
                href="/eligibility"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 hover:text-white font-semibold text-sm border border-blue-500/30 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Check My Eligibility</span>
              </Link>
            </div>
          </div>

          {/* Scheme Information Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Left 2 Columns: Main Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Benefits Section */}
              <div className="glass-card rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Benefits & Financial Assistance</h2>
                    <p className="text-xs text-slate-400">Direct Benefit Transfer & Non-Financial Subsidies</p>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5 text-emerald-200/90 text-sm leading-relaxed">
                  {scheme.benefits}
                </div>
              </div>

              {/* Eligibility Criteria Breakdown */}
              <div className="glass-card rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Eligibility Criteria</h2>
                    <p className="text-xs text-slate-400">Detailed conditions for qualifying</p>
                  </div>
                </div>

                {/* Structured Eligibility Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs text-slate-400">Age Requirements:</span>
                    <p className="text-sm font-semibold text-white">
                      {scheme.eligibility.min_age !== null ? `${scheme.eligibility.min_age} years` : 'No min age'} -{' '}
                      {scheme.eligibility.max_age !== null ? `${scheme.eligibility.max_age} years` : 'No max limit'}
                    </p>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs text-slate-400">Gender Eligibility:</span>
                    <p className="text-sm font-semibold text-white">{scheme.eligibility.gender}</p>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs text-slate-400">Income Ceiling:</span>
                    <p className="text-sm font-semibold text-white">
                      {scheme.eligibility.income_limit
                        ? `Up to ₹${scheme.eligibility.income_limit.toLocaleString('en-IN')} / year`
                        : 'No direct income ceiling'}
                    </p>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs text-slate-400">Target Occupations:</span>
                    <p className="text-sm font-semibold text-white">
                      {scheme.eligibility.occupations.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-4">
                  <h4 className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-400" /> Specific Clauses & Exclusions:
                  </h4>
                  <p>{scheme.eligibility.details}</p>
                </div>
              </div>

              {/* Application Process */}
              <div className="glass-card rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">How to Apply</h2>
                    <p className="text-xs text-slate-400">Step-by-step registration instructions</p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-5 rounded-2xl border border-white/5">
                  {scheme.application_process}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Applications are processed directly through Government Common Service Centers (CSC) or designated official websites.</span>
                </div>
              </div>

            </div>

            {/* Right Column: Required Documents & Official Source */}
            <div className="space-y-8">
              
              {/* Required Documents Card */}
              <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Required Documents</h3>
                </div>

                <ul className="space-y-3">
                  {scheme.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-5 border-t border-white/5 text-xs text-slate-400 leading-relaxed">
                  Make sure certificates and Aadhaar are linked with your active bank account for seamless Direct Benefit Transfer (DBT).
                </div>
              </div>

              {/* Official Source Card */}
              <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white">Official Government Portal</h3>
                <p className="text-xs text-slate-400">
                  Access official gazettes, circulars, application guidelines, and grievance contacts:
                </p>
                <a
                  href={scheme.official_source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 text-xs font-semibold border border-white/10 transition-colors"
                >
                  <span className="truncate max-w-[200px]">{scheme.official_source}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>

              {/* AI Scheme Advisor Callout */}
              <div className="glass-panel rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-blue-900/20 to-transparent space-y-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Have Questions?
                </div>
                <h4 className="text-sm font-bold text-white">Ask YojanaSetu AI about this scheme</h4>
                <p className="text-xs text-slate-300">
                  Ask specific questions like "Am I eligible if I make ₹2.5L?", or "What are the rules for tenant farmers?"
                </p>
                <Link
                  href={`/assistant?scheme=${encodeURIComponent(scheme.id)}`}
                  className="block text-center w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-md"
                >
                  Start Conversation
                </Link>
              </div>

            </div>

          </div>

          {/* Related Schemes Section */}
          {relatedSchemes.length > 0 && (
            <div className="pt-10 border-t border-white/10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white">Related {scheme.category} Schemes</h2>
                  <p className="text-xs text-slate-400 mt-1">Other programs you might be eligible for</p>
                </div>
                <Link
                  href={`/schemes?category=${encodeURIComponent(scheme.category)}`}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>View More</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedSchemes.map((rel) => (
                  <SchemeCard key={rel.id} scheme={rel} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
