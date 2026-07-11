'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase, Users, BarChart3, Clock, Plus, Search,
  Filter, Star, Calendar,
  MoreVertical, Download, Sparkles, ArrowUp,
  Building2, Loader2
} from 'lucide-react';
import { recruiterService } from '@/lib/services/recruiterService';
import { useAuth } from '@/context/AuthContext';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await recruiterService.getDashboard();
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <p className="text-red-500">Failed to load: {error}</p>
    </div>
  );

  const { stats, pipeline, recentCandidates, todaySchedule, notifications } = data;

  const statCards = [
    { label: 'Active Jobs', value: stats?.activeJobs || 0, change: '+3', icon: Briefcase, gradient: 'from-indigo-500 to-purple-500' },
    { label: 'Total Candidates', value: stats?.totalCandidates || 0, change: '+28', icon: Users, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Interviews Today', value: stats?.interviewsToday || 0, change: '+2', icon: Clock, gradient: 'from-orange-500 to-rose-500' },
    { label: 'Hired This Month', value: stats?.hiredThisMonth || 0, change: '+5', icon: Star, gradient: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Recruiter Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome, {user?.name || 'Recruiter'}! Manage your hiring pipeline.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/recruiter/templates" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 transition-all duration-300">
              <Plus className="w-4 h-4" /> New Job Posting
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover-card">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                    <ArrowUp className="w-3 h-3" />{stat.change}
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
            {/* Pipeline */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Hiring Pipeline</h2>
                </div>
              </div>
              <div className="flex items-end gap-2 h-40 mb-4">
                {pipeline?.map((stage, i) => {
                  const maxCount = Math.max(...(pipeline.map(s => s.count) || [1]));
                  const height = (stage.count / maxCount) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">{stage.count}</span>
                      <div className={`w-full rounded-t-lg ${stage.color} transition-all duration-500 hover:opacity-80 cursor-pointer`} style={{ height: `${Math.max(height, 8)}%`, minHeight: '16px' }} />
                      <span className="text-xs text-slate-500 text-center">{stage.stage}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Candidates */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Candidates</h2>
                </div>
              </div>
              {recentCandidates?.length > 0 ? (
                <div className="space-y-3">
                  {recentCandidates.map((candidate, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/30 hover-card">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {candidate.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{candidate.name}</h3>
                          {candidate.score && <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">{candidate.score}%</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{candidate.role}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        candidate.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                        candidate.status === 'SCHEDULED' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}>{candidate.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-slate-400 py-4">No candidates yet. Schedule an interview to get started.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Today&apos;s Schedule</h2>
              </div>
              {todaySchedule?.length > 0 ? (
                <div className="space-y-4">
                  {todaySchedule.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/30">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {item.candidateName?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.candidateName}</p>
                        <p className="text-xs text-slate-500">{item.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span className="text-xs text-slate-400">{item.time ? new Date(item.time).toLocaleTimeString() : 'TBD'}</span>
                          <span className="text-xs text-indigo-400">{item.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-slate-400 py-4">No interviews scheduled for today.</p>
              )}
            </div>

            {/* AI Insights */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 text-white">
              <Sparkles className="w-8 h-8 mb-4 text-indigo-200" />
              <h3 className="text-lg font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Our AI has identified candidates matching your job requirements.
              </p>
              <button className="w-full px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-sm transition-all backdrop-blur-sm">
                View Recommendations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
