'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Mail, Lock, Eye, EyeOff, Code2, Globe,
  ArrowRight, User, Building2, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─── Reusable input with inline icon ───────────────────────────
function InputGroup({ icon: Icon, type = 'text', value, onChange, placeholder, label, required, minLength, error: hasError, children }) {
  const rightPadding = children ? 'pr-10' : 'pr-4';

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
          {label}
        </label>
      )}
      <div className="group relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none z-10">
          <Icon className={`w-4 h-4 transition-colors duration-200 ${
            hasError ? 'text-red-400' : 'text-slate-400 group-focus-within:text-indigo-500'
          }`} />
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          className={`w-full pl-10 ${rightPadding} py-3 bg-white dark:bg-slate-800/70 border-2 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 ${
            hasError
              ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }`}
        />
        {children && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 z-10">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Password eye toggle button ────────────────────────────────
function ToggleButton({ showing, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
      tabIndex={-1}
    >
      {showing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

// ─── Page ──────────────────────────────────────────────────────
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
        await register(registerData);
        setSuccessMessage('Account created successfully! Redirecting...');
        setFormData({ email: '', password: '', confirmPassword: '', name: '', company: '' });
        setTimeout(() => {
          router.push(role === 'CANDIDATE' ? '/candidate/dashboard' : '/recruiter/dashboard');
        }, 1000);
      } else {
        await login(formData.email, formData.password, formData.rememberMe);
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
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

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const passwordsMismatch = formData.confirmPassword.length >= 3 && formData.password !== formData.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/3 blur-[150px]" />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-lg mx-auto px-4 py-8 animate-fade-in">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/5 dark:shadow-indigo-500/10 border border-slate-200/60 dark:border-slate-700/60 p-8">
          {/* Logo */}
          <div className="text-center mb-7">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Interview Arena
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {isRegister
                ? 'Start your journey with AI-powered interviews'
                : 'Sign in to continue to your dashboard'}
            </p>
          </div>

          {/* Role selector — register only */}
          {isRegister && (
            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
              {[
                { id: 'CANDIDATE', label: 'Candidate', icon: User },
                { id: 'RECRUITER', label: 'Recruiter', icon: Building2 },
              ].map((r) => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800/50'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-500' : ''}`} />
                    {r.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Success banner */}
          {successMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 mb-5 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 mb-5 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — register only */}
            {isRegister && (
              <InputGroup
                icon={User}
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            )}

            {/* Company — recruiter registration only */}
            {isRegister && role === 'RECRUITER' && (
              <InputGroup
                icon={Building2}
                label="Company Name"
                placeholder="Acme Corp"
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
              />
            )}

            {/* Email */}
            <InputGroup
              icon={Mail}
              type="email"
              label="Email Address"
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />

            {/* Password */}
            <InputGroup
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
              minLength={8}
            >
              <ToggleButton showing={showPassword} onToggle={() => setShowPassword(!showPassword)} />
            </InputGroup>

            {/* Confirm Password — register only */}
            {isRegister && (
              <div>
                <InputGroup
                  icon={Lock}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  required
                  minLength={8}
                  error={passwordsMismatch}
                >
                  <ToggleButton showing={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                </InputGroup>
                {passwordsMismatch && (
                  <p className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
              </div>
            )}

            {/* Forgot password — login only */}
            {!isRegister && (
              <div className="flex items-center justify-end -mt-1">
                <button type="button" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
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
            <div className="relative flex justify-center text-xs font-medium">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-sm font-semibold active:scale-[0.98]"
            >
              <Code2 className="w-5 h-5" />
              GitHub
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-sm font-semibold active:scale-[0.98]"
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
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
