'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // If already authenticated and done loading, redirect to dashboard or requested page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, authLoading, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push(redirectPath);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please verify your credentials.');
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Citizen Account Access
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome to <span className="gradient-text-saffron">YojanaSetu</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign in to save eligible schemes, track application timelines, and get personalized updates.
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-200">Sign In Failed</p>
                  <p className="mt-0.5 text-red-300/90">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
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
                    placeholder="citizen@example.com"
                    disabled={isSubmitting}
                    className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(!forgotPasswordOpen)}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
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
                    disabled={isSubmitting}
                    className="w-full glass-input rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-amber-500/50"
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

              {/* Forgot Password Accordion Banner */}
              {forgotPasswordOpen && (
                <div className="p-3 bg-slate-900/90 rounded-xl border border-white/10 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-amber-300">Password Recovery</p>
                  <p>Enter your email above to receive a secure password reset link.</p>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Password reset instructions simulated for ${email || 'your registered email'}.`);
                      setForgotPasswordOpen(false);
                    }}
                    className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                  >
                    Send Reset Link
                  </button>
                </div>
              )}

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-300">
                  Keep me signed in on this device
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#EA580C] hover:from-amber-500 hover:to-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-orange-950/40 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Social Login Placeholders */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0b132b] px-3 text-slate-400">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => alert('MeriPehchaan National Single Sign-On (NSSO) is planned for Phase 2.')}
                  className="py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition-colors"
                >
                  <span>MeriPehchaan</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('DigiLocker direct identity link is planned for Phase 2.')}
                  className="py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition-colors"
                >
                  <span>DigiLocker</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link href="/signup" className="text-amber-400 hover:text-amber-300 font-semibold">
                Sign up free
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
