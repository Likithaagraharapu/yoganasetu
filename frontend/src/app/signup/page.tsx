'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ShieldCheck, Check, AlertCircle, Loader2, LayoutDashboard } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (!agreed) {
      setError('Please agree to the Citizen Terms & Privacy Guidelines.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Registration failed. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between selection:bg-amber-500/30">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Empowering Every Citizen
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Create Your <span className="gradient-text-saffron">Account</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join YojanaSetu to bookmark government schemes and get personalized eligibility alerts.
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            {submitted ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Account Created Successfully!</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Welcome aboard, <strong className="text-white">{fullName}</strong>! Your account has been registered in SQLite with encrypted credentials.
                </p>
                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md hover:from-amber-400 hover:to-orange-400 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to My Citizen Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/eligibility"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white font-semibold text-xs border border-white/10"
                  >
                    <span>Check Scheme Eligibility</span>
                  </Link>
                  <Link
                    href="/schemes"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 font-medium text-xs border border-white/5"
                  >
                    Browse Flagship Schemes
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ananya Sharma"
                      className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ananya@example.com"
                      className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password (min 8 characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full glass-input rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Terms agreement */}
                <div className="flex items-start pt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                  />
                  <label htmlFor="terms" className="ml-2 block text-xs text-slate-300 leading-tight">
                    I agree to the YojanaSetu Citizen Terms of Use and Privacy Guidelines.
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#EA580C] hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-950/40 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold">
                Sign in
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
