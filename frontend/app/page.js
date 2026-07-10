'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Sparkles, ArrowRight, CheckCircle, Play, Star, Users,
  BarChart3, Shield, Zap, Brain, Clock, Globe, ChevronRight,
  Quote, TrendingUp, Bot, FileCheck, Target, Award
} from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Interviews',
      description: 'Smart interviews that adapt to each candidate\'s skill level in real-time, asking relevant follow-up questions.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Shield,
      title: 'Anti-Cheating System',
      description: 'Advanced proctoring with eye tracking, voice analysis, and behavior pattern detection to ensure integrity.',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Comprehensive analytics dashboard with skill gap analysis, performance trends, and hiring insights.',
      gradient: 'from-orange-500 to-rose-500'
    },
    {
      icon: Clock,
      title: 'Save 80% Time',
      description: 'Automate screening, scheduling, and initial technical assessments. Focus on the best candidates only.',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Globe,
      title: 'Remote-Ready',
      description: 'Conduct interviews globally with multi-language support, time zone handling, and async options.',
      gradient: 'from-violet-500 to-fuchsia-500'
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Get detailed feedback reports immediately after interviews with code quality and communication scores.',
      gradient: 'from-amber-500 to-yellow-500'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Interviews Conducted', icon: Play },
    { value: '500+', label: 'Companies Trust Us', icon: Users },
    { value: '92%', label: 'Accuracy Rate', icon: Target },
    { value: '4.8/5', label: 'User Rating', icon: Award },
  ];

  const testimonials = [
    {
      quote: "Interview Arena reduced our technical screening time by 75% while improving candidate quality. The AI interviews are remarkably accurate.",
      author: "Sarah Chen",
      role: "CTO, TechFlow Inc.",
      rating: 5
    },
    {
      quote: "The anti-cheating system gives us complete confidence in remote hiring. We've scaled our engineering team by 40 people using this platform.",
      author: "Marcus Rodriguez",
      role: "VP Engineering, CloudScale",
      rating: 5
    },
    {
      quote: "Our candidates love the experience. The real-time coding environment and instant feedback make it feel like a real interview.",
      author: "Emily Park",
      role: "Head of Talent, InnovateLab",
      rating: 5
    }
  ];

  const faqs = [
    {
      q: "How does the AI interview process work?",
      a: "Our AI conducts adaptive technical interviews that adjust difficulty based on candidate responses. It evaluates code quality, problem-solving approach, and communication skills in real-time."
    },
    {
      q: "Is the platform secure and cheat-proof?",
      a: "Yes! We employ multi-layered anti-cheating measures including browser lockdown, AI-powered behavior analysis, voice pattern recognition, and live proctoring capabilities."
    },
    {
      q: "Can I customize interview templates?",
      a: "Absolutely. You can create custom interview templates with your own questions, coding challenges, and evaluation criteria. Our template builder makes it easy."
    },
    {
      q: "What programming languages are supported?",
      a: "We support 20+ programming languages including Python, JavaScript, TypeScript, Java, Go, Rust, C++, and more. Our code execution environment is fully sandboxed."
    },
    {
      q: "How do you ensure fair evaluation?",
      a: "Our AI is trained on diverse datasets and uses standardized rubrics. We anonymize candidate data during evaluation to prevent bias and ensure fair assessment."
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-24">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/5 blur-[120px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg5OSwgMTAyLCAyNDEsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Announcement badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/50 text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                <span>New: AI Interview 2.0 with real-time code analysis</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                <span className="text-slate-900 dark:text-white">Hire the Best Talent with</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  AI-Powered Interviews
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Revolutionize your technical hiring with adaptive AI interviews that assess 
                skills, detect cheating, and provide actionable insights — all in one platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="/sign-in?register=true"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-base border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
                  <Play className="w-5 h-5 text-indigo-500" />
                  Watch Demo
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 mt-10 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-slate-500">
                    +5
                  </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">2,000+</span> companies already using
                </div>
              </div>
            </div>

            {/* Right Hero Visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                {/* Main card */}
                <div className="relative w-[480px] rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Interview Session</p>
                        <p className="text-xs text-slate-500">In Progress • 23:45 remaining</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                      Live
                    </span>
                  </div>

                  {/* Code window */}
                  <div className="rounded-xl bg-slate-900 dark:bg-black overflow-hidden mb-4 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 dark:bg-slate-900">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="ml-2 text-xs text-slate-400">twoSum.js</span>
                    </div>
                    <div className="p-4 font-mono text-sm leading-relaxed">
                      <div className="text-slate-500">1 <span className="text-purple-400">function</span> <span className="text-yellow-300">twoSum</span>(nums, target) {'{'}</div>
                      <div className="text-slate-500">2 &nbsp; <span className="text-blue-300">const</span> map = <span className="text-purple-400">new</span> <span className="text-yellow-300">Map</span>();</div>
                      <div className="text-slate-500">3 &nbsp; <span className="text-blue-300">for</span> (<span className="text-blue-300">let</span> i = <span className="text-orange-300">0</span>; i &lt; nums.length; i++) {'{'}</div>
                      <div className="text-slate-500">4 &nbsp; &nbsp; <span className="text-blue-300">const</span> complement = target - nums[i];</div>
                      <div className="text-slate-500">5 &nbsp; &nbsp; <span className="text-blue-300">if</span> (map.has(complement)) {'{'}</div>
                      <div className="text-emerald-400 bg-emerald-400/10">6 &nbsp; &nbsp; &nbsp; <span className="text-blue-300">return</span> [map.get(complement), i];</div>
                      <div className="text-slate-500">7 &nbsp; &nbsp; {'}'}</div>
                      <div className="text-slate-500">8 &nbsp; &nbsp; map.set(nums[i], i);</div>
                      <div className="text-slate-500">9 &nbsp; {'}'}</div>
                      <div className="text-slate-500">10 {'}'}</div>
                    </div>
                  </div>

                  {/* AI analysis */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                    <Brain className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-indigo-700 dark:text-indigo-300">AI Analysis</p>
                      <p className="text-indigo-600/70 dark:text-indigo-400/70">Good O(n) solution! Consider explaining the hash map approach.</p>
                    </div>
                  </div>
                </div>

                {/* Floating card 1 */}
                <div className="absolute -top-6 -right-6 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg p-4 animate-slide-left" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Integrity Score</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-500">96%</div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: '96%' }} />
                  </div>
                </div>

                {/* Floating card 2 */}
                <div className="absolute -bottom-4 -left-8 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg p-4 animate-slide-right" style={{ animationDelay: '0.8s' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Skill Match</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-500">88%</div>
                  <p className="text-xs text-slate-500 mt-0.5">Top 10% of candidates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/50 text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-4">
              <Zap className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Everything you need for{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                smarter hiring
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              From adaptive assessments to real-time analytics, our platform provides all the tools 
              to make data-driven hiring decisions.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover-card"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="solutions" className="relative py-20 lg:py-28 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/50 text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-4">
              <Target className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Three simple steps to better hires
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Create Interview',
                description: 'Set up customized interview templates or choose from our library of AI-optimized assessments.',
                icon: FileCheck
              },
              {
                step: '02',
                title: 'AI Conducts Interview',
                description: 'Our AI engages candidates with adaptive questions, coding challenges, and real-time evaluation.',
                icon: Bot
              },
              {
                step: '03',
                title: 'Review & Hire',
                description: 'Get comprehensive reports with scores, code analysis, and actionable hiring recommendations.',
                icon: BarChart3
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="text-center group">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-2xl font-bold mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                    {i < 2 && (
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2 hidden lg:block text-slate-300 dark:text-slate-600">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                industry leaders
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover-card"
              >
                <Quote className="w-8 h-8 text-indigo-300 dark:text-indigo-600 mb-4" />
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-sm">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{testimonial.author}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 lg:py-28 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Everything you need to know about Interview Arena AI
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-slate-900 dark:text-white text-sm">{faq.q}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      activeFaq === i ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    activeFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-6 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-[60px]" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-[60px]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            </div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to transform your hiring?
              </h2>
              <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of companies using Interview Arena AI to find and hire the best technical talent.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-in?register=true"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-all shadow-xl"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all"
                >
                  Schedule a Demo
                </Link>
              </div>
              <p className="text-indigo-200 text-sm mt-4">
                No credit card required • Free forever plan available
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
