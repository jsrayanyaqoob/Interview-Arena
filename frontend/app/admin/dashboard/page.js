'use client';

import { useState, useEffect } from 'react';
import {
  Users, Briefcase, BarChart3, Activity, DollarSign,
  TrendingUp, Shield, Settings,
  Download, Bell, Sparkles,
  AlertTriangle, ArrowUp, ArrowDown, Star, Loader2
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await adminService.getDashboard();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="lg:pl-[260px] min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );
  if (error) return <div className="lg:pl-[260px] min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>;

  const { stats, recentActivities, systemHealth, topCompanies, monthlyTrends } = data;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '0', change: '+156', icon: Users, gradient: 'from-indigo-500 to-purple-500' },
    { label: 'Active Interviews', value: stats?.totalInterviews || '0', change: '+45', icon: Activity, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Companies', value: stats?.totalCompanies || '0', change: '+12', icon: Briefcase, gradient: 'from-orange-500 to-rose-500' },
    { label: 'Est. Revenue (MRR)', value: `$${stats?.estimatedMRR?.toLocaleString() || '0'}`, change: '+12.5%', icon: DollarSign, gradient: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="lg:pl-[260px] min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Enterprise Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">System overview and platform management</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all relative">
              <Bell className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" /> Report
            </button>
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
                  <span className="flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                    <ArrowUp className="w-3 h-3" />{stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* System Health */}
          <div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">System Health</h2>
                </div>
              </div>
              <div className="space-y-3">
                {systemHealth?.map((sys, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${sys.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{sys.name}</p>
                        <p className="text-xs text-slate-500">Uptime: {sys.uptime}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${sys.status === 'operational' ? 'text-emerald-500' : 'text-amber-500'}`}>{sys.latency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6 p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivities?.slice(0, 5).map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 bg-indigo-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-medium text-slate-900 dark:text-white">{act.user}</span> {act.action}
                      </p>
                      <p className="text-xs text-slate-400">{new Date(act.time).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts & Companies */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Trends */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Monthly Trends</h2>
              <div className="flex items-end gap-3 h-48">
                {monthlyTrends?.map((m, i) => {
                  const max = Math.max(...(monthlyTrends.map(t => t.users) || [1]));
                  const h = (m.users / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex items-end gap-1" style={{ height: '90%' }}>
                        <div className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-indigo-400" style={{ height: `${h}%` }} />
                        <div className="flex-1 rounded-t bg-gradient-to-t from-emerald-400 to-emerald-300" style={{ height: `${(m.interviews / max) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{m.month?.slice(5) || i}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-500" /> Users</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-400" /> Interviews</div>
              </div>
            </div>

            {/* Top Companies & Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Companies</h2>
                <div className="space-y-3">
                  {topCompanies?.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover-card">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.interviews} interviews • {c.hires} hires</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">{c.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-600 text-white">
                <Sparkles className="w-8 h-8 mb-4 text-white/70" />
                <h3 className="text-lg font-bold mb-2">Platform AI Insights</h3>
                <p className="text-sm text-white/80 mb-4">
                  Completion rate: {stats?.completionRate || 0}% • Active users: {stats?.activeUsers || 0}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/90"><TrendingUp className="w-4 h-4" />{stats?.completionRate || 0}% completion rate</div>
                  <div className="flex items-center gap-2 text-sm text-white/90"><Users className="w-4 h-4" />{stats?.activeUsers || 0} active users</div>
                  <div className="flex items-center gap-2 text-sm text-white/90"><Star className="w-4 h-4" />{stats?.totalUsers || 0} total users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
