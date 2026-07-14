'use client';

import { useState, useEffect } from 'react';
import {
  Users, Search, MapPin, Briefcase,
  Loader2, GraduationCap, Award,
  CheckCircle, Clock
} from 'lucide-react';
import { recruiterService } from '@/lib/services/recruiterService';

export default function RecruiterCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterByInterview, setFilterByInterview] = useState('all');

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const result = await recruiterService.getAllCandidates({ limit: 100 });
      setCandidates(result.candidates || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.candidateProfile?.title?.toLowerCase().includes(q) ||
      c.candidateProfile?.skills?.some(s => s.name.toLowerCase().includes(q))
    );
  }).filter(c => {
    if (filterByInterview === 'interviewed') return c.interviewCount > 0;
    if (filterByInterview === 'not-interviewed') return c.interviewCount === 0;
    if (filterByInterview === 'high-score') return c.bestScore && c.bestScore >= 70;
    return true;
  });

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
          <button onClick={fetchCandidates} className="mt-3 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950 p-5 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Candidate Directory</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Browse all registered candidates with interview history
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, skill, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Stats & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-500">
          <Users className="w-4 h-4 text-indigo-500" />
          <span><strong className="text-slate-900 dark:text-white">{filteredCandidates.length}</strong> candidate{filteredCandidates.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
          {[
            { id: 'all', label: 'All' },
            { id: 'interviewed', label: 'Interviewed' },
            { id: 'not-interviewed', label: 'Not Interviewed' },
            { id: 'high-score', label: 'High Score (70%+)' },
          ].map((f) => (
            <button key={f.id} onClick={() => setFilterByInterview(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterByInterview === f.id
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        {search && (
          <button onClick={() => setSearch('')} className="text-indigo-500 hover:text-indigo-600 font-medium text-xs">
            Clear filter
          </button>
        )}
      </div>

      {/* Candidate Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No candidates found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCandidates.map((candidate) => {
            const profile = candidate.candidateProfile;
            const skills = profile?.skills || [];
            const initials = candidate.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
            const hasInterview = candidate.interviewCount > 0;
            const isHighScore = candidate.bestScore && candidate.bestScore >= 70;

            return (
              <div
                key={candidate.id}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700/50 transition-all duration-300"
              >
                {/* Avatar & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {candidate.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{candidate.email}</p>
                    {profile?.title && (
                      <p className="text-xs text-indigo-500 font-medium mt-0.5 truncate">{profile.title}</p>
                    )}
                  </div>
                </div>

                {/* Interview Status & Score */}
                <div className="flex items-center gap-2 mb-3">
                  {hasInterview ? (
                    <>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Interviewed
                      </span>
                      {isHighScore && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                          <Award className="w-3 h-3" />
                          {candidate.bestScore}%
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      Not Interviewed
                    </span>
                  )}
                </div>

                {/* Location */}
                {profile?.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {skills.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {skills.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs font-medium">
                        +{skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>{skills.length} skill{skills.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    <span>{candidate.interviewCount || 0} interview{(candidate.interviewCount || 0) !== 1 ? 's' : ''}</span>
                  </div>
                  {candidate.bestScore && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Award className="w-3 h-3" />
                      <span>Best: {candidate.bestScore}%</span>
                    </div>
                  )}
                </div>

                {/* Interview Details (if any) */}
                {candidate.recruiterInterviews?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 space-y-1.5">
                    {candidate.recruiterInterviews.slice(0, 2).map((inv, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 truncate">{inv.templateName}</span>
                        <div className="flex items-center gap-1.5">
                          {inv.score && (
                            <span className={`font-medium ${inv.score >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {inv.score}%
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            inv.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                            inv.status === 'SCHEDULED' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {inv.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {candidate.recruiterInterviews.length > 2 && (
                      <p className="text-xs text-slate-400 text-center">
                        +{candidate.recruiterInterviews.length - 2} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
