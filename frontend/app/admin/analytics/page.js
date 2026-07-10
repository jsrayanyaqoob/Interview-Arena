'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, Users, Clock, Star, Download, ArrowUp,
  ArrowDown, PieChart, LineChart, Activity,
  Target, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { adminService } from '@/lib/services/adminService';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await adminService.getAnalytics();
        setData(result);
      } catch (err) {
        console.error('Failed to load analytics:', err);
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

  const {
    metrics, skillCategories, weeklyTrends, conversionFunnel, topTemplates
  } = data || {};

  return (
    <div className="lg:pl-[260px] min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Comprehensive platform analytics and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 p-1">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button key={range} onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeRange === range ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {range}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 stagger-children">
          {metrics?.slice(0, 6).map((metric, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 hover-card">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{metric.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{metric.label}</p>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium mt-1.5 ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                {metric.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {metric.change}
              </span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Trends */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Trends</h2>
                </div>
              </div>
              <div className="flex items-end gap-3 h-48">
                {weeklyTrends?.map((day, i) => {
                  const max = Math.max(...(weeklyTrends.map(d => d.interviews) || [1]));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex items-end gap-1" style={{ height: '90%' }}>
                        <div className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-indigo-400 transition-all duration-300 hover:opacity-80 cursor-pointer"
                          style={{ height: `${(day.interviews / max) * 100}%` }} />
                        <div className="flex-1 rounded-t bg-gradient-to-t from-emerald-400 to-emerald-300 transition-all duration-300 hover:opacity-80 cursor-pointer"
                          style={{ height: `${(day.completions / max) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{day.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-500" /> Interviews</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-400" /> Completions</div>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Conversion Funnel</h2>
              </div>
              <div className="space-y-2">
                {conversionFunnel?.map((stage, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-20 text-xs font-medium text-slate-600 text-right">{stage.stage}</span>
                    <div className="flex-1 relative h-8">
                      <div className="h-full rounded-lg bg-gradient-to-r from-indigo-500/80 to-purple-500/80 transition-all duration-500 flex items-center px-3" style={{ width: `${stage.percentage}%` }}>
                        <span className="text-xs font-medium text-white">{stage.count}</span>
                      </div>
                    </div>
                    <span className="w-10 text-xs font-medium text-slate-500">{stage.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Skill Categories */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Skills Breakdown</h2>
              </div>
              <div className="space-y-4">
                {skillCategories?.map((cat, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      <span className="text-sm font-bold text-slate-900">{cat.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${cat.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 text-white">
              <LineChart className="w-8 h-8 mb-4 text-white/70" />
              <h3 className="text-lg font-bold mb-2">AI-Generated Insights</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-white/80"><span className="text-indigo-200 mt-0.5">✦</span> Candidate quality scores trending up 12% this quarter</li>
                <li className="flex items-start gap-2 text-sm text-white/80"><span className="text-indigo-200 mt-0.5">✦</span> System Design interviews have highest pass rate</li>
                <li className="flex items-start gap-2 text-sm text-white/80"><span className="text-indigo-200 mt-0.5">✦</span> JavaScript remains the most tested skill</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
