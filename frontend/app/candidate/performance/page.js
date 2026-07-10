'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, Brain, Star, Target,
  Clock, Award, ArrowUp, BarChart3, PieChart,
  LineChart, Download, Share2, Loader2
} from 'lucide-react';
import { candidateService } from '@/lib/services/candidateService';

export default function PerformanceInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await candidateService.getPerformance();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="lg:pl-[260px] min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-500">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:pl-[260px] min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const {
    overallScore, technicalScore, communicationScore, confidenceScore,
    skillsBreakdown, skillGaps, recentInterviews, percentileRankings
  } = data;

  return (
    <div className="lg:pl-[260px] min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Performance Insights</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed analysis of your interview performance</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 text-white mb-6 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-[60px]" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-[60px]" />
          </div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-medium text-indigo-200 uppercase tracking-wider">Overall Performance Score</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-bold">{overallScore || 0}</span>
                  <span className="text-2xl text-indigo-200">/100</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-emerald-300">
                  <ArrowUp className="w-4 h-4" />
                  <span>Based on {recentInterviews?.length || 0} completed interviews</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center"><div className="text-2xl font-bold">{percentileRankings?.overall || 0}%</div><div className="text-xs text-indigo-200">Overall</div></div>
                <div className="text-center"><div className="text-2xl font-bold">{percentileRankings?.technical || 0}%</div><div className="text-xs text-indigo-200">Technical</div></div>
                <div className="text-center"><div className="text-2xl font-bold">{percentileRankings?.communication || 0}%</div><div className="text-xs text-indigo-200">Comm.</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Gaps */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Skills Breakdown</h2>
                </div>
                <span className="text-xs text-slate-400">{skillsBreakdown?.length || 0} categories</span>
              </div>
              <div className="space-y-5">
                {skillsBreakdown?.map((cat, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{cat.score}%</span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${cat.score}%` }} />
                    </div>
                  </div>
                )) || <p className="text-sm text-slate-400">No skills data available yet.</p>}
              </div>
            </div>
          </div>

          <div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Skill Gaps</h2>
              </div>
              {skillGaps?.length > 0 ? (
                <div className="space-y-4">
                  {skillGaps.map((gap, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{gap.skill}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${gap.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                          {gap.demand}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${gap.currentLevel}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{gap.currentLevel}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No skill gaps identified yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Interview Analysis</h2>
            </div>
          </div>
          {recentInterviews?.length > 0 ? (
            <div className="space-y-4">
              {recentInterviews.map((interview, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/30 hover-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{interview.company}</h3>
                        <span className={`text-sm font-bold ${interview.score >= 80 ? 'text-emerald-600' : interview.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                          {interview.score}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{interview.template} • {Math.floor(interview.duration / 60)} min • {new Date(interview.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Strengths</p>
                      <div className="flex flex-wrap gap-1.5">
                        {interview.strengths?.map((s, j) => (
                          <span key={j} className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 text-xs font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">To Improve</p>
                      <div className="flex flex-wrap gap-1.5">
                        {interview.improvements?.map((imp, j) => (
                          <span key={j} className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 text-xs font-medium">{imp}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No interviews completed yet. Start your first interview to see analysis.</p>
          )}
        </div>
      </div>
    </div>
  );
}
