'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { interviewService } from '@/lib/services/interviewService';
import {
  Clock, Brain, BarChart3, ChevronRight, Loader2,
  TrendingUp, Target, Award, Sparkles, FileText,
  Calendar, ArrowUp, ArrowDown, Play,
} from 'lucide-react';

function ScoreBadge({ score }) {
  const styles = score >= 80
    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    : score >= 60
    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
    : 'bg-red-500/10 border-red-500/20 text-red-400';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${styles}`}>
      {score}%
    </span>
  );
}

export default function InterviewHistoryPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    bestScore: 0,
    totalTime: 0,
  });

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await interviewService.getHistory({ limit: 50 });
        const items = data.data || [];
        setInterviews(items);

        const completed = items.filter(i => i.status === 'COMPLETED' && i.result);
        const scores = completed.map(i => i.result.overallScore);
        const totalTime = completed.reduce((sum, i) => sum + (i.duration || 0), 0);

        setStats({
          total: items.length,
          avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          bestScore: scores.length ? Math.max(...scores) : 0,
          totalTime: Math.round(totalTime / 60),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Link href="/candidate/dashboard" className="hover:text-indigo-500">Dashboard</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-600 font-medium">Interview History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-indigo-500" />
              Interview History
            </h1>
          </div>
          <Link
            href="/candidate/interview"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
          >
            <Play className="w-4 h-4" />
            New Interview
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in">
          {[
            { icon: FileText, label: 'Total Interviews', value: stats.total, gradient: 'from-indigo-500 to-purple-500' },
            { icon: Target, label: 'Average Score', value: `${stats.avgScore}%`, gradient: 'from-emerald-500 to-teal-500' },
            { icon: Award, label: 'Best Score', value: `${stats.bestScore}%`, gradient: 'from-amber-500 to-orange-500' },
            { icon: Clock, label: 'Total Time', value: `${stats.totalTime}m`, gradient: 'from-cyan-500 to-blue-500' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2 shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* List */}
        {interviews.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No interviews yet</h3>
            <p className="text-sm text-slate-500 mb-4">Complete your first AI interview to see your history.</p>
            <Link
              href="/candidate/interview"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-all"
            >
              <Play className="w-4 h-4" />
              Start Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {interviews.map((interview) => (
              <Link
                key={interview.id}
                href={`/candidate/interview/${interview.id}`}
                className="block group"
              >
                <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 sm:p-5 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          interview.status === 'COMPLETED'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30'
                        }`}>
                          {interview.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                        </span>
                        <span className="text-xs text-slate-400">{interview.category || 'General'}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">{interview.difficulty}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">{interview.type}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {interview.questionCount || 0} questions answered
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {interview.startedAt
                            ? new Date(interview.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </span>
                        {interview.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.round(interview.duration / 60)} min
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {interview.result ? (
                        <ScoreBadge score={interview.result.overallScore} />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Pending</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
