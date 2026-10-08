'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import PopularCategories from '@/components/home/PopularCategories';
import FeaturedSchemes from '@/components/home/FeaturedSchemes';
import HowItWorks from '@/components/home/HowItWorks';
import StatsSection from '@/components/home/StatsSection';
import TrustSection from '@/components/home/TrustSection';
import { Scheme } from '@/lib/types';
import { getSchemes } from '@/lib/api';

export default function HomePage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await getSchemes({ limit: 12 });
        setSchemes(data);
      } catch (err) {
        console.warn('Backend unavailable, loading local fallback:', err);
        try {
          const res = await fetch('/data/schemes.json');
          const localData = await res.json();
          setSchemes(localData);
        } catch {
          // ignore
        }
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Section with 3D Setu Visual & Search */}
        <HeroSection />

        {/* 2. Popular Categories Grid */}
        <PopularCategories />

        {/* 3. Featured Flagship Schemes */}
        <FeaturedSchemes schemes={schemes} />

        {/* 4. How YojanaSetu Works */}
        <HowItWorks />

        {/* 5. Key Statistics Ribbon */}
        <StatsSection />

        {/* 6. Transparency & Why Trust Section */}
        <TrustSection />
      </main>

      <Footer />
    </div>
  );
}
