'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlayCircle, Clock, CheckCircle, TrendingUp,
  Calendar, ChevronRight, Brain,
  Award, BarChart3, ArrowUp, ArrowDown,
  FileText, Users, Loader2
} from 'lucide-react';
import { candidateService } from '@/lib/services/candidateService';
import { useAuth } from '@/context/AuthContext';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await candidateService.getDashboard();
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
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:pl-[260px] min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load dashboard</p>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const { profile, stats, upcomingInterviews, recentResults, aiRecommendations, practiceCategories, notifications, achievements } = data;

  const statCards = [
    { label: 'Interviews Completed', value: stats?.completedInterviews || 0, change: '+3', positive: true, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Average Score', value: `${stats?.avgScore || 0}%`, change: '+5%', positive: true, icon: TrendingUp, gradient: 'from-indigo-500 to-purple-500' },
    { label: 'Skills Assessed', value: stats?.totalSkills || 0, change: '+2', positive: true, icon: Brain, gradient: 'from-orange-500 to-rose-500' },
    { label: 'Ranking', value: `#${stats?.totalInterviews || 0}`, change: 'Top 20%', positive: true, icon: Award, gradient: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="lg:pl-[260px] min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Profile {profile?.profileCompletion || 0}% complete • {notifications?.length || 0} notifications
              </p>
            </div>
            <Link
              href="/candidate/interview"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300"
            >
              <PlayCircle className="w-4 h-4" />
              Start New Interview
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover-card">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                    stat.positive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {stat.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
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
          {/* Upcoming & Recent */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Interviews */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Interviews</h2>
                </div>
              </div>

              {upcomingInterviews?.length > 0 ? (
                <div className="space-y-4">
                  {upcomingInterviews.map((interview, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/30 hover-card">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                          {interview.template?.name || 'Interview'} • {interview.recruiter?.name || 'Recruiter'}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString() : 'TBD'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {interview.template?.difficulty || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/candidate/interview"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 transition-colors"
                      >
                        Join
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming interviews</p>
                  <Link href="/candidate/interview" className="text-indigo-500 text-sm font-medium mt-1 inline-block hover:underline">
                    Start one now →
                  </Link>
                </div>
              )}
            </div>

            {/* AI Recommendations */}
            {aiRecommendations?.length > 0 && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 text-white">
                <Brain className="w-6 h-6 mb-3 text-indigo-200" />
                <h3 className="text-lg font-bold mb-2">AI Recommendations</h3>
                <div className="space-y-2">
                  {aiRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-indigo-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                      <span>Learn <strong>{rec.skill}</strong> — {rec.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Results */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Results</h2>
                </div>
              </div>

              {recentResults?.length > 0 ? (
                <div className="space-y-3">
                  {recentResults.slice(0, 4).map((result, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/30">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {result.interview?.recruiter?.name || result.interview?.template?.name || 'Interview'}
                        </p>
                        <p className="text-xs text-slate-500">{result.interview?.template?.name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${
                          result.overallScore >= 80 ? 'text-emerald-500' : result.overallScore >= 60 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {result.overallScore}%
                        </span>
                        <p className="text-xs text-slate-400">{new Date(result.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No results yet. Complete an interview to see your results.</p>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Practice Categories */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Practice Categories</h2>
              <div className="space-y-3">
                {practiceCategories?.map((cat, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-300">{cat.name}</span>
                      <span className="text-xs text-slate-400">{cat.completedCount}/{cat.questionCount}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" style={{ width: `${(cat.completedCount / cat.questionCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            {achievements?.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Achievements</h2>
                <div className="space-y-2">
                  {achievements.slice(0, 3).map((ach, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <Award className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{ach.name}</p>
                        <p className="text-xs text-slate-500">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {notifications?.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Notifications</h2>
                <div className="space-y-2">
                  {notifications.slice(0, 3).map((n, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-slate-500">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
