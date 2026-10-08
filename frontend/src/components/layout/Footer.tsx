import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  Heart, 
  CheckCircle2, 
  Bot, 
  Compass, 
  BarChart3 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050814] text-slate-400 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-blue-900/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1E3A8A] via-[#0F172A] to-[#FF9933] p-[1.5px]">
                <div className="w-full h-full bg-[#070B19] rounded-[10px] flex items-center justify-center">
                  <span className="font-black text-lg bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    य
                  </span>
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Yojana<span className="text-[#FF9933]">Setu</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An AI-first Indian Government Schemes discovery and eligibility assistance platform. 
              Empowering farmers, students, women entrepreneurs, and citizens with grounded AI assistance and instant eligibility checks.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400/90 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Grounded in Official Central & State Government Portals</span>
            </div>
          </div>

          {/* Scheme Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Key Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/schemes?category=Agriculture" className="hover:text-amber-400 transition-colors">
                  Agriculture & Farming
                </Link>
              </li>
              <li>
                <Link href="/schemes?category=Health" className="hover:text-amber-400 transition-colors">
                  Healthcare & Medical
                </Link>
              </li>
              <li>
                <Link href="/schemes?category=Education" className="hover:text-amber-400 transition-colors">
                  Scholarships & Education
                </Link>
              </li>
              <li>
                <Link href="/schemes?category=Housing" className="hover:text-amber-400 transition-colors">
                  Housing & Urban Renewal
                </Link>
              </li>
              <li>
                <Link href="/schemes?category=Finance" className="hover:text-amber-400 transition-colors">
                  Loans & MSME Credit
                </Link>
              </li>
              <li>
                <Link href="/schemes?category=Women%20%26%20Child" className="hover:text-amber-400 transition-colors">
                  Women & Child Welfare
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Tools */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">AI Platform Tools</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/assistant" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-amber-400" />
                  AI Scheme Assistant
                </Link>
              </li>
              <li>
                <Link href="/eligibility" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Eligibility Wizard
                </Link>
              </li>
              <li>
                <Link href="/schemes" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  Scheme Directory
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                  Scheme Statistics
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Portals & Transparency */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Official Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a 
                  href="https://pmkisan.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  PM-KISAN Portal <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a 
                  href="https://pmjay.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  Ayushman Bharat <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a 
                  href="https://scholarships.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  National Scholarships <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a 
                  href="https://pmvishwakarma.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  PM Vishwakarma <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} YojanaSetu. Developed with pride for Indian Citizen Empowerment.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built with AI & <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Bharat
            </span>
            <span>•</span>
            <Link href="/schemes" className="hover:text-slate-300">
              Disclaimer & Transparency
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
