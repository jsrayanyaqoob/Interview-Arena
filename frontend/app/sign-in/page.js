'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Mail, Lock, Eye, EyeOff, Code2, Globe,
  ArrowRight, User, Building2, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { login, register, error, setError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('CANDIDATE');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    // Validate passwords match for registration
    if (isRegister && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        const registerData = { email: formData.email, password: formData.password, name: formData.name, role };
        if (role === 'RECRUITER' && formData.company) {
          registerData.company = formData.company;
        }
        const data = await register(registerData);
        setSuccessMessage('Account created successfully! Redirecting...');
        setFormData({ email: '', password: '', confirmPassword: '', name: '', company: '' });
        setTimeout(() => {
          router.push(role === 'CANDIDATE' ? '/candidate/dashboard' : '/recruiter/dashboard');
        }, 1000);
      } else {
        await login(formData.email, formData.password, formData.rememberMe);
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          // Redirect based on role (checked after login)
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role === 'CANDIDATE') router.push('/candidate/dashboard');
            else if (user.role === 'RECRUITER') router.push('/recruiter/dashboard');
            else router.push('/admin/dashboard');
          } else {
            router.push('/candidate/dashboard');
          }
        }, 1000);
      }
    } catch (err) {
      // Error is already set by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md mx-auto px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Interview Arena
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isRegister
              ? 'Start your journey with AI-powered interviews'
              : 'Sign in to continue to your dashboard'}
          </p>
        </div>

        {/* Role Selection — only for register, only Candidate + Recruiter */}
        {isRegister && (
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            {[
              { id: 'CANDIDATE', label: 'Candidate', icon: User, desc: 'Find jobs & practice' },
              { id: 'RECRUITER', label: 'Recruiter', icon: Building2, desc: 'Hire top talent' },
            ].map((r) => {
              const Icon = r.icon;
              const isActive = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800/50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-500' : ''}`} />
                  <span>{r.label}</span>
                  <span className={`text-[10px] ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>{r.desc}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 mb-5 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 mb-5 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name — registration only */}
          {isRegister && (
            <div>
              <label className="input-label">Full Name</label>
              <div className="input-icon-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
          )}

          {/* Company — recruiter registration only */}
          {isRegister && role === 'RECRUITER' && (
            <div>
              <label className="input-label">Company Name</label>
              <div className="input-icon-wrapper">
                <Building2 className="input-icon" />
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="input-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="input-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-toggle-btn"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password — registration only */}
          {isRegister && (
            <div>
              <label className="input-label">Confirm Password</label>
              <div className="input-icon-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`input-field ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'error' : ''}`}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="input-toggle-btn"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Live mismatch indicator — only after 3+ chars to avoid flash */}
              {formData.confirmPassword.length >= 3 && formData.password !== formData.confirmPassword && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          {/* Forgot password — login only */}
          {!isRegister && (
            <div className="flex items-center justify-end">
              <button type="button" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isRegister ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white dark:bg-slate-900 text-slate-400">or continue with</span>
          </div>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-sm font-medium active:scale-[0.98]"
          >
            <Code2 className="w-5 h-5" />
            GitHub
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-sm font-medium active:scale-[0.98]"
          >
            <Globe className="w-5 h-5" />
            Google
          </button>
        </div>

        {/* Toggle mode */}
        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  );
}
