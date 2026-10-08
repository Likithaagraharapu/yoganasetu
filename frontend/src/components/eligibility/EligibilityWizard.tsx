'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Building, 
  IndianRupee,
  FileCheck,
  ShieldCheck,
  Briefcase,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { EligibilityProfile, EligibilityResultItem } from '@/lib/types';
import { checkEligibility } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import TiltCard from '@/components/ui/TiltCard';

const INDIAN_STATES = [
  'All States / Pan-India',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi (NCT)',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const OCCUPATIONS = [
  { id: 'Farmer', label: 'Farmer / Cultivator', icon: '🌾' },
  { id: 'Student', label: 'Student / Scholar', icon: '🎓' },
  { id: 'Self-Employed', label: 'Business Owner / MSME', icon: '💼' },
  { id: 'Artisan', label: 'Traditional Artisan / Craftsperson', icon: '🔨' },
  { id: 'Daily Wage Earner', label: 'Daily Wage / Informal Worker', icon: '🏗️' },
  { id: 'Street Vendor', label: 'Street Vendor / Hawker', icon: '🛒' },
  { id: 'Unemployed', label: 'Unemployed / Job Seeker', icon: '📋' },
  { id: 'Homemaker', label: 'Homemaker / Caregiver', icon: '🏡' },
  { id: 'Retired', label: 'Senior Citizen / Retired', icon: '👓' },
];

const INCOME_OPTIONS = [
  { value: 120000, label: 'Up to ₹1.2 Lakh (BPL / Antyodaya)' },
  { value: 250000, label: '₹1.2 Lakh to ₹2.5 Lakh (Low Income / EWS)' },
  { value: 600000, label: '₹2.5 Lakh to ₹6 Lakh (Lower Middle Income)' },
  { value: 900000, label: '₹6 Lakh to ₹9 Lakh (Middle Income Group)' },
  { value: 1500000, label: 'Above ₹9 Lakh' },
];

export default function EligibilityWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EligibilityResultItem[] | null>(null);

  const [formData, setFormData] = useState<EligibilityProfile>({
    name: '',
    age: 26,
    gender: 'Male',
    state: 'All States / Pan-India',
    occupation: 'Student',
    annual_income: 200000,
    social_category: 'General',
    education: 'Graduate / Degree',
    owns_agricultural_land: false,
    owns_pucca_house: false,
    is_bpl_ration_card: false,
    is_differently_abled: false,
  });

  const updateField = (key: keyof EligibilityProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await checkEligibility(formData);
      setResults(response.results);
      setCurrentStep(5);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF9933', '#10B981', '#3B82F6', '#F59E0B'],
        });
      } catch {
        // ignore confetti errors
      }
    } catch (err) {
      console.warn('Backend eligibility evaluation failed, running client evaluation:', err);
      // Client-side fallback evaluation
      try {
        const res = await fetch('/data/schemes.json');
        const allSchemes = await res.json();
        const evaluated: EligibilityResultItem[] = allSchemes.map((s: any) => {
          let score = 75;
          const reasons = [];

          if (s.eligibility.min_age && (formData.age || 0) < s.eligibility.min_age) {
            score -= 30;
          } else {
            score += 10;
            reasons.push(`Satisfies age requirement (${formData.age} yrs).`);
          }

          if (formData.occupation && s.eligibility.occupations.includes(formData.occupation)) {
            score += 20;
            reasons.push(`Direct match for occupation: ${formData.occupation}.`);
          }

          if (s.eligibility.income_limit && (formData.annual_income || 0) <= s.eligibility.income_limit) {
            score += 15;
            reasons.push(`Annual income satisfies scheme limit.`);
          }

          score = Math.min(100, Math.max(25, score));
          const status = score >= 75 ? 'Eligible' : score >= 50 ? 'Likely Eligible' : 'Review Required';

          return {
            scheme: s,
            score,
            status,
            reasons: reasons.length > 0 ? reasons : ['General citizen eligibility guidelines apply.'],
          };
        });

        evaluated.sort((a, b) => b.score - a.score);
        setResults(evaluated);
        setCurrentStep(5);
      } catch {
        alert('Could not complete eligibility check. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setResults(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar Header */}
      {currentStep < 5 && (
        <div className="mb-10 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Step {currentStep} of 4: {
              currentStep === 1 ? 'Personal Profile' :
              currentStep === 2 ? 'Occupation & Income' :
              currentStep === 3 ? 'Category & Education' : 'Special Circumstances'
            }</span>
            <span className="text-amber-400 font-bold">{currentStep * 25}% Complete</span>
          </div>

          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${currentStep * 25}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Container Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative">
        
        {/* STEP 1: Basic Profile */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Let&apos;s start with your basic profile</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Government schemes have demographic criteria such as age brackets, gender, and state of residence.
              </p>
            </div>

            <div className="space-y-4">
              {/* Optional Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500"
                />
              </div>

              {/* Age Slider / Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Your Age: <strong className="text-amber-400 text-sm">{formData.age} years</strong>
                  </label>
                  <span className="text-[11px] text-slate-400">18 - 85 years</span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={85}
                  value={formData.age || 26}
                  onChange={(e) => updateField('age', parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Gender Radio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateField('gender', g)}
                      className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center ${
                        formData.gender === g
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                          : 'bg-slate-900/60 text-slate-300 border-white/5 hover:bg-slate-800'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  State of Residence
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-white bg-slate-900 cursor-pointer"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} className="bg-slate-900 text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Occupation & Income */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">What is your primary occupation?</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Schemes like PM-KISAN, PM Vishwakarma, and MUDRA are tailored specifically to vocational categories.
              </p>
            </div>

            {/* Occupations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {OCCUPATIONS.map((occ) => (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => updateField('occupation', occ.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                    formData.occupation === occ.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md'
                      : 'bg-slate-900/60 text-slate-300 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{occ.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{occ.label}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Annual Household Income */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Annual Household Income Range
              </label>
              <div className="space-y-2">
                {INCOME_OPTIONS.map((inc) => (
                  <button
                    key={inc.value}
                    type="button"
                    onClick={() => updateField('annual_income', inc.value)}
                    className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                      formData.annual_income === inc.value
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    <span>{inc.label}</span>
                    {formData.annual_income === inc.value && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Category & Education */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Social Category & Education Level</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Certain central schemes provide specific fee waivers, higher subsidies, or exclusive quotas.
              </p>
            </div>

            {/* Social Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Social / Reservation Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateField('social_category', cat)}
                    className={`p-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      formData.social_category === cat
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-900/60 text-slate-300 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Education Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Highest Education Qualification
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Below 10th Standard',
                  '10th Pass (Matriculation)',
                  '12th Pass (Intermediate)',
                  'ITI / Technical Diploma',
                  'Graduate / Degree',
                  'Post-Graduate / Doctorate',
                ].map((edu) => (
                  <button
                    key={edu}
                    type="button"
                    onClick={() => updateField('education', edu)}
                    className={`p-3 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                      formData.education === edu
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
                        : 'bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    <span>{edu}</span>
                    {formData.education === edu && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Special Circumstances */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Specific Assets & Circumstances</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Answer these 4 quick questions to lock in 100% accurate eligibility criteria.
              </p>
            </div>

            <div className="space-y-3">
              {/* Landholding */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Do you or your family own cultivable agricultural land?</p>
                  <p className="text-xs text-slate-400">Required for PM-KISAN & KCC credit limits</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('owns_agricultural_land', !formData.owns_agricultural_land)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    formData.owns_agricultural_land
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}
                >
                  {formData.owns_agricultural_land ? 'Yes' : 'No'}
                </button>
              </div>

              {/* Pucca House */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Do you already own a pucca (concrete) house anywhere in India?</p>
                  <p className="text-xs text-slate-400">PMAY grants assistance if you do not own a pucca house</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('owns_pucca_house', !formData.owns_pucca_house)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    formData.owns_pucca_house
                      ? 'bg-amber-500 text-white border-amber-400'
                      : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}
                >
                  {formData.owns_pucca_house ? 'Yes' : 'No'}
                </button>
              </div>

              {/* BPL Ration Card */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Do you hold a BPL, Antyodaya (AAY), or Priority Ration Card?</p>
                  <p className="text-xs text-slate-400">Enables high-priority coverage for Ayushman Bharat & Ujjwala</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('is_bpl_ration_card', !formData.is_bpl_ration_card)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    formData.is_bpl_ration_card
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}
                >
                  {formData.is_bpl_ration_card ? 'Yes' : 'No'}
                </button>
              </div>

              {/* Differently Abled */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Is the applicant differently-abled (Divyangjan)?</p>
                  <p className="text-xs text-slate-400">Qualifies for specialized pensions and accessibility subsidies</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('is_differently_abled', !formData.is_differently_abled)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    formData.is_differently_abled
                      ? 'bg-blue-500 text-white border-blue-400'
                      : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}
                >
                  {formData.is_differently_abled ? 'Yes' : 'No'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: RESULTS SCREEN */}
        {currentStep === 5 && results && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Results Header */}
            <div className="text-center space-y-2 pb-6 border-b border-white/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Eligibility Assessment Complete
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                Recommended Schemes For You
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Based on your profile ({formData.age} yrs, {formData.occupation}, {formData.state}), we found{' '}
                <strong className="text-emerald-400 font-bold">{results.filter((r) => r.score >= 60).length}</strong> matching schemes.
              </p>
            </div>

            {/* Results Cards List */}
            <div className="space-y-4">
              {results.slice(0, 8).map((item) => (
                <div
                  key={item.scheme.id}
                  className="glass-card rounded-2xl p-6 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge category={item.scheme.category} size="sm">
                        {item.scheme.category}
                      </Badge>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          item.score >= 75
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.score >= 50
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-white/10'
                        }`}
                      >
                        {item.score}% Match • {item.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white hover:text-amber-300 transition-colors">
                      {item.scheme.name}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {item.scheme.description}
                    </p>

                    {/* Eligibility Reasons */}
                    <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
                      {item.reasons.map((r, rIdx) => (
                        <span key={rIdx} className="bg-slate-900/80 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>{r}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/schemes/${item.scheme.id}`}
                      className="w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs shadow-md whitespace-nowrap"
                    >
                      View Full Details
                    </Link>
                    <a
                      href={item.scheme.official_source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-white/10 flex items-center justify-center gap-1"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Reset Button */}
            <div className="pt-6 border-t border-white/10 flex justify-center">
              <button
                onClick={resetWizard}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Modify Profile & Retake Wizard</span>
              </button>
            </div>
          </div>
        )}

        {/* Wizard Controls (Step 1 to 4) */}
        {currentStep < 5 && (
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#EA580C] hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-950/40 transition-all hover:scale-[1.02]"
            >
              <span>{currentStep === 4 ? (loading ? 'Analyzing Schemes...' : 'Find My Schemes') : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
