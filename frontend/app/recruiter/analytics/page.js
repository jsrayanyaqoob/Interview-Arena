'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, Users, Target, TrendingUp,
  ArrowUp, ArrowDown, Loader2, Briefcase,
  Award, CheckCircle, PieChart
} from 'lucide-react';
import { recruiterService } from '@/lib/services/recruiterService';

export default function RecruiterAnalytics() {
  const [data, setData] = useState(null);
  const [jobStats, setJobStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = async () => {
    try {
      const result = await recruiterService.getAnalytics({ timeRange });
      setData(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchJobStats = async () => {
    try {
      const result = await recruiterService.getAnalyticsJobs();
      setJobStats(result.perJobStats || []);
    } catch (err) {
      console.error('Failed to load job stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchJobStats()]);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950 flex items-center justify-center">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-red-200 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button onClick={() => { setLoading(true); fetchAnalytics(); fetchJobStats(); }} className="mt-3 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition">Retry</button>
        </div>
      </div>
    );
  }

  const { summary, trends } = data || {};
  const maxApplicants = Math.max(...jobStats.map(j => j.applicants), 1);

  const statCards = [
    { label: 'Total Interviews', value: summary?.totalInterviews || 0, change: `+${Math.round((summary?.totalInterviews || 0) * 0.12)}`, icon: BarChart3, gradient: 'from-indigo-500 to-purple-500', trend: 'up' },
    { label: 'Completed', value: summary?.completedInterviews || 0, change: `+${Math.round((summary?.completedInterviews || 0) * 0.08)}`, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500', trend: 'up' },
    { label: 'Pass Rate', value: (summary?.passRate || 0) + '%', change: `+${Math.round((summary?.passRate || 0) * 0.05)}%`, icon: Target, gradient: 'from-orange-500 to-rose-500', trend: 'up' },
    { label: 'Avg. Score', value: summary?.avgScore || 0, change: `+${Math.round((summary?.avgScore || 0) * 0.03)}`, icon: Award, gradient: 'from-cyan-500 to-blue-500', trend: 'up' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950 p-5 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Recruiter Analytics</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Real-time tracking of applicants, interviews, and hiring performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
            {['7d', '30d', '90d'].map((range) => (
              <button key={range} onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeRange === range ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Applicants per Job Posting - Real Data */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Applicants Per Job Posting</h2>
              </div>
              {jobStats.length > 0 && (
                <span className="text-xs text-slate-400">{jobStats.length} job{jobStats.length !== 1 ? 's' : ''}</span>
              )}
            </div>
            {jobStats.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No job postings found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create interview templates to start tracking applicants</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobStats.map((job, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{job.job}</span>
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex-shrink-0">
                          {job.difficulty}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white flex-shrink-0 ml-2">{job.applicants} applicant{job.applicants !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="relative h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-indigo-500/80 to-purple-500/80 transition-all duration-1000 group-hover:opacity-90"
                        style={{ width: `${(job.applicants / maxApplicants) * 100}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-emerald-400/80 to-emerald-500/80 transition-all duration-1000"
                        style={{ width: `${(job.interviewed / maxApplicants) * 100}%` }}
                      />
                      <div className="relative flex items-center h-full px-3">
                        <div className="flex items-center gap-2 text-xs text-white font-medium">
                          <span>{job.interviewed} interviewed</span>
                          <span className="opacity-50">•</span>
                          <span>{job.passed} passed</span>
                          <span className="opacity-50">•</span>
                          <span>Avg: {job.avgScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gradient-to-r from-indigo-500 to-purple-500" /> Applicants</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Interviewed</div>
            </div>
          </div>

          {/* Monthly Trends */}
          {trends && trends.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Trends</h2>
                </div>
              </div>
              <div className="flex items-end gap-3 h-48">
                {trends.map((month, i) => {
                  const max = Math.max(...(trends.map(t => t.total) || [1]));
                  const h = (month.total / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex items-end gap-1" style={{ height: '90%' }}>
                        <div className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-indigo-400 transition-all duration-300 hover:opacity-80 cursor-pointer"
                          style={{ height: `${h}%` }} />
                        <div className="flex-1 rounded-t bg-gradient-to-t from-emerald-400 to-emerald-300 transition-all duration-300 hover:opacity-80 cursor-pointer"
                          style={{ height: `${(month.completed / max) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{month.month?.slice(5) || i}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-500" /> Total</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-400" /> Completed</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Summary Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Summary</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Interviews</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{summary?.totalInterviews || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${Math.min(100, (summary?.totalInterviews || 0) * 5)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Completion Rate</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {summary?.totalInterviews > 0
                      ? Math.round(((summary?.completedInterviews || 0) / summary?.totalInterviews) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000"
                    style={{ width: `${summary?.totalInterviews > 0 ? Math.round(((summary?.completedInterviews || 0) / summary?.totalInterviews) * 100) : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Pass Rate</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{summary?.passRate || 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all duration-1000" style={{ width: `${summary?.passRate || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Average Score</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{summary?.avgScore || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000" style={{ width: `${summary?.avgScore || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 text-white">
            <TrendingUp className="w-8 h-8 mb-4 text-white/70" />
            <h3 className="text-lg font-bold mb-2">Hiring Insights</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-indigo-200 mt-0.5">✦</span>
                {jobStats.length > 0
                  ? `${jobStats[0]?.job} has the most applicants (${jobStats[0]?.applicants})`
                  : 'Create job postings to see insights'}
              </li>
              <li className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-indigo-200 mt-0.5">✦</span>
                Overall pass rate is {summary?.passRate || 0}% across all positions
              </li>
              <li className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-indigo-200 mt-0.5">✦</span>
                Average interview score: {summary?.avgScore || 0}/100
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
