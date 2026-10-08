'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bot, Sparkles, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatInterface from '@/components/chat/ChatInterface';

function AssistantContent() {
  const searchParams = useSearchParams();
  const schemeId = searchParams.get('scheme');

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Bot className="w-3.5 h-3.5" />
              Interactive Citizen Scheme Advisor
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ask <span className="gradient-text-saffron">YojanaSetu AI</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Speak or type your personal situation to get grounded eligibility answers, required document lists, and official application links.
            </p>
          </div>

          {/* Chat Component */}
          <ChatInterface initialSchemeId={schemeId} />

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070B19] flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      }
    >
      <AssistantContent />
    </Suspense>
  );
}
