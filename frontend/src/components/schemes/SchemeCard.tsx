'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, CheckCircle2, Sparkles, Building2, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { Scheme } from '@/lib/types';
import TiltCard from '@/components/ui/TiltCard';
import Badge from '@/components/ui/Badge';
import { truncate } from '@/lib/utils';
import { addBookmark, removeBookmark } from '@/lib/api';

interface SchemeCardProps {
  scheme: Scheme;
  matchScore?: number;
  initialBookmarked?: boolean;
  onBookmarkChange?: (schemeId: string, isSaved: boolean) => void;
}

export default function SchemeCard({ scheme, matchScore, initialBookmarked = false, onBookmarkChange }: SchemeCardProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [saving, setSaving] = useState(false);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;

    setSaving(true);
    const nextState = !bookmarked;
    setBookmarked(nextState);

    try {
      if (nextState) {
        await addBookmark(scheme.id);
      } else {
        await removeBookmark(scheme.id);
      }
      onBookmarkChange?.(scheme.id, nextState);
    } catch (err) {
      console.warn('Failed to update bookmark in SQLite:', err);
      // Revert optimistic update on error
      setBookmarked(!nextState);
    } finally {
      setSaving(false);
    }
  };

  return (
    <TiltCard maxTilt={5} perspective={800} className="h-full">
      <div className="glass-card card-sheen rounded-2xl p-6 h-full flex flex-col justify-between relative group overflow-hidden">
        {/* Subtle corner highlight */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div>
          {/* Header with Category, Match Score, and SQLite Bookmark Toggle */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge category={scheme.category} size="sm">
              {scheme.category}
            </Badge>

            <div className="flex items-center gap-1.5">
              {matchScore !== undefined && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <Sparkles className="w-3 h-3" />
                  {matchScore}% Match
                </span>
              )}

              <button
                type="button"
                onClick={handleToggleBookmark}
                title={bookmarked ? "Remove from SQLite Bookmarks" : "Save to SQLite Bookmarks"}
                className={`p-1.5 rounded-lg border transition-all ${
                  bookmarked
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/20'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {bookmarked ? (
                  <BookmarkCheck className="w-4 h-4 fill-amber-400" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Scheme Title */}
          <h3 className="font-bold text-lg text-white group-hover:text-amber-300 transition-colors line-clamp-2 mb-2 leading-snug">
            {scheme.name}
          </h3>

          {/* Short description */}
          <p className="text-slate-400 text-sm line-clamp-3 mb-4 leading-relaxed">
            {scheme.description}
          </p>

          {/* Target Group */}
          <div className="flex items-start gap-2 text-xs text-slate-300 mb-3 bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
            <Users className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              <strong className="text-slate-200">Target Group:</strong> {scheme.target_group}
            </span>
          </div>

          {/* Key Benefit Highlight */}
          <div className="flex items-start gap-2 text-xs text-amber-300/90 mb-4 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/15">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              <strong className="text-amber-200">Key Benefit:</strong> {scheme.benefits}
            </span>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
          <Link
            href={`/assistant?scheme=${encodeURIComponent(scheme.id)}`}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Ask AI
          </Link>

          <Link
            href={`/schemes/${encodeURIComponent(scheme.id)}`}
            className="btn-3d-primary !py-1.5 !px-3.5 !text-xs !rounded-xl group-hover:scale-105"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}
