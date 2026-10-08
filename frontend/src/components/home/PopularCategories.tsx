'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Tractor, 
  HeartPulse, 
  GraduationCap, 
  Baby, 
  Home, 
  Briefcase, 
  ShieldCheck, 
  Coins,
  ArrowRight
} from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';

const categories = [
  {
    name: 'Agriculture',
    slug: 'Agriculture',
    icon: Tractor,
    count: '3 Schemes',
    description: 'Income assistance, KCC credit limits, solar pump subsidies, and crop support.',
    color: 'from-emerald-500/20 to-emerald-950/30 text-emerald-400 border-emerald-500/30',
  },
  {
    name: 'Health',
    slug: 'Health',
    icon: HeartPulse,
    count: '2 Schemes',
    description: 'Cashless hospitalisation up to ₹5 Lakh, senior citizen coverage, and nutrition.',
    color: 'from-rose-500/20 to-rose-950/30 text-rose-400 border-rose-500/30',
  },
  {
    name: 'Education',
    slug: 'Education',
    icon: GraduationCap,
    count: '3 Schemes',
    description: 'Post-matric scholarships, fee waivers, PM SHRI smart schooling, and grants.',
    color: 'from-indigo-500/20 to-indigo-950/30 text-indigo-400 border-indigo-500/30',
  },
  {
    name: 'Women & Child',
    slug: 'Women%20%26%20Child',
    icon: Baby,
    count: '3 Schemes',
    description: 'Sukanya Samriddhi savings, maternity DBT benefits, and Ujjwala gas connections.',
    color: 'from-pink-500/20 to-pink-950/30 text-pink-400 border-pink-500/30',
  },
  {
    name: 'Housing',
    slug: 'Housing',
    icon: Home,
    count: '2 Schemes',
    description: 'Pucca houses, interest subsidies under PMAY Urban 2.0 and PMAY Gramin.',
    color: 'from-amber-500/20 to-amber-950/30 text-amber-400 border-amber-500/30',
  },
  {
    name: 'Employment',
    slug: 'Employment',
    icon: Briefcase,
    count: '4 Schemes',
    description: 'PM Vishwakarma toolkits, PM SVANidhi loans, and apprenticeship stipends.',
    color: 'from-purple-500/20 to-purple-950/30 text-purple-400 border-purple-500/30',
  },
  {
    name: 'Finance',
    slug: 'Finance',
    icon: Coins,
    count: '3 Schemes',
    description: 'Collateral-free MUDRA loans up to ₹20L, Stand-Up India, and seed funding.',
    color: 'from-cyan-500/20 to-cyan-950/30 text-cyan-400 border-cyan-500/30',
  },
  {
    name: 'Social Welfare',
    slug: 'Social%20Welfare',
    icon: ShieldCheck,
    count: '4 Schemes',
    description: 'Guaranteed Atal Pension, PMSBY accidental cover, and DAY-NRLM SHG credit.',
    color: 'from-teal-500/20 to-teal-950/30 text-teal-400 border-teal-500/30',
  },
];

export default function PopularCategories() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Comprehensive Sector Coverage
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore by <span className="gradient-text-saffron">Category</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Discover flagship central government missions and welfare programs tailored for every sector of Indian society.
            </p>
          </div>

          <Link
            href="/schemes"
            className="btn-3d-secondary !py-2.5 !px-4 !text-xs self-start md:self-auto group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-amber-400" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <TiltCard key={cat.name} maxTilt={6} perspective={900}>
                <Link
                  href={`/schemes?category=${cat.slug}`}
                  className="block glass-card card-sheen rounded-2xl p-6 h-full border border-white/5 hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center border shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/5">
                      {cat.count}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-white group-hover:text-amber-300 transition-colors mb-2">
                    {cat.name}
                  </h3>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-xs font-semibold text-slate-400 group-hover:text-amber-400 transition-colors">
                    <span>Browse schemes</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
