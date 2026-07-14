'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { userDirectoryService } from '@/lib/services/userDirectoryService';
import {
  Building2, Search, Trash2, Edit3, X, Check, Loader2,
  Users, Mail, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  AlertCircle, ExternalLink, XCircle,
  TrendingUp, UserPlus, Activity, SlidersHorizontal,
  Briefcase
} from 'lucide-react';

// ─── Stat Chip ──────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, gradient }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm hover:shadow-md transition-all duration-200">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-0.5">{value}</p>
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

// ─── Skeleton loader ────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-20" />
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function RecruitersPage() {
  const { user: currentUser } = useAuth();
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', company: '', position: '' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const isAdmin = currentUser?.role === 'ADMIN';

  const fetchRecruiters = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userDirectoryService.getUsersByRole('RECRUITER', { search, page: pageNum, limit: 12 });
      setRecruiters(data.users || []);
      setPage(pageNum);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load recruiters');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { fetchRecruiters(1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecruiters(1);
  };

  const clearSearch = () => {
    setSearch('');
    fetchRecruiters(1);
  };

  // ── Derived stats ──
  const newThisMonth = useMemo(() =>
    recruiters.filter(r => {
      const d = new Date(r.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    [recruiters]
  );

  const companiesCount = useMemo(() => {
    const companies = new Set(recruiters.map(r => r.recruiterProfile?.company).filter(Boolean));
    return companies.size;
  }, [recruiters]);

  // ── Edit handlers ──
  const startEdit = (r) => {
    setEditingId(r.id);
    setEditForm({
      name: r.name || '',
      company: r.recruiterProfile?.company || '',
      position: r.recruiterProfile?.position || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', company: '', position: '' });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    setError(null);
    try {
      await userDirectoryService.updateUser(id, {
        name: editForm.name,
        recruiterProfile: { company: editForm.company, position: editForm.position },
      });
      setSuccessMsg('Recruiter updated!');
      setEditingId(null);
      fetchRecruiters(page);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await userDirectoryService.deleteUser(id);
      setSuccessMsg('Recruiter deleted!');
      setDeleteConfirm(null);
      fetchRecruiters(page);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    } finally { setSaving(false); }
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      {/* Subtle background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-500/5 dark:bg-purple-500/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/5 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
              <Link href="/" className="hover:text-purple-500 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-purple-600 dark:text-purple-400 font-medium">Recruiters</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              Recruiters Directory
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 animate-fade-in"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-in">
          <StatChip icon={Users} label="Total" value={totalCount} gradient="from-purple-500 to-indigo-600" />
          <StatChip icon={UserPlus} label="New this month" value={newThisMonth} gradient="from-blue-500 to-cyan-500" />
          <StatChip icon={Briefcase} label="Companies" value={companiesCount} gradient="from-violet-500 to-purple-500" />
          <StatChip icon={Activity} label="Pages" value={totalPages} gradient="from-amber-500 to-orange-500" />
        </div>

        {/* Alert messages */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 mb-5 animate-fade-in">
            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">{successMsg}</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 mb-5 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        )}

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6 animate-fade-in">
          <div className="relative max-w-lg group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search recruiters by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white/80 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:border-slate-300 dark:hover:border-slate-600"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 stagger-children">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : recruiters.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Building2 className="w-10 h-10 text-purple-400 dark:text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {search ? 'No results found' : 'No recruiters yet'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {search
                ? 'Try a different search term or check the spelling.'
                : 'Recruiters will appear here once they register and set up their company profiles.'}
            </p>
            {search && (
              <button
                onClick={clearSearch}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/20"
              >
                <X className="w-4 h-4" />
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{recruiters.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCount}</span> recruiters
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Sorted by newest
              </div>
            </div>

            {/* Cards */}
            <div className="grid gap-4 stagger-children">
              {recruiters.map((r) => {
                const isEditing = editingId === r.id;
                const isDeleting = deleteConfirm === r.id;
                const profile = r.recruiterProfile || {};

                return (
                  <div
                    key={r.id}
                    className={`group relative overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 transition-all duration-300 ${
                      isEditing
                        ? 'ring-2 ring-purple-500/30 border-purple-300 dark:border-purple-700 shadow-lg shadow-purple-500/5'
                        : isDeleting
                        ? 'ring-2 ring-red-500/30 border-red-300 dark:border-red-700'
                        : 'border-slate-200/60 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-700/60 hover:shadow-lg hover:shadow-purple-500/5'
                    }`}
                  >
                    {/* Top accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                      isEditing
                        ? 'from-purple-400 to-indigo-500'
                        : isDeleting
                        ? 'from-red-400 to-rose-500'
                        : 'from-purple-400/0 via-purple-400/0 to-purple-400/0 group-hover:from-purple-400 group-hover:via-indigo-400 group-hover:to-purple-400'
                      } transition-all duration-500`}
                    />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          {/* Avatar */}
                          <Link
                            href={`/users/${r.id}`}
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300"
                          >
                            {r.name?.charAt(0) || 'R'}
                          </Link>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            {isEditing ? (
                              <div className="space-y-2 animate-fade-in">
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                  placeholder="Full name"
                                  autoFocus
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={editForm.company}
                                    onChange={(e) => setEditForm(f => ({ ...f, company: e.target.value }))}
                                    className="px-3 py-2 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    placeholder="Company"
                                  />
                                  <input
                                    type="text"
                                    value={editForm.position}
                                    onChange={(e) => setEditForm(f => ({ ...f, position: e.target.value }))}
                                    className="px-3 py-2 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    placeholder="Position"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <Link
                                  href={`/users/${r.id}`}
                                  className="group/link inline-flex items-center gap-1.5"
                                >
                                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover/link:text-purple-600 dark:group-hover/link:text-purple-400 transition-colors">
                                    {r.name}
                                  </h3>
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover/link:text-purple-400 transition-all opacity-0 group-hover/link:opacity-100 -ml-1 group-hover/link:ml-0" />
                                </Link>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                                  <span className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[200px]">{r.email}</span>
                                  </span>
                                  {profile.company && (
                                    <span className="flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5" />
                                      <span className="truncate max-w-[180px]">
                                        {profile.company}
                                        {profile.position && <span className="text-slate-400"> — {profile.position}</span>}
                                      </span>
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* View profile button - always visible */}
                          <Link
                            href={`/users/${r.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all opacity-0 group-hover:opacity-100 -mr-1"
                            title="View Profile"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {isDeleting ? (
                            <div className="flex items-center gap-1 animate-fade-in">
                              <button
                                onClick={() => handleDelete(r.id)}
                                disabled={saving}
                                className="px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all text-xs font-bold disabled:opacity-50 shadow-sm"
                              >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-700 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : isEditing ? (
                            <div className="flex items-center gap-1 animate-fade-in">
                              <button
                                onClick={() => saveEdit(r.id)}
                                disabled={saving}
                                className="px-3 py-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all text-xs font-bold disabled:opacity-50 shadow-sm"
                              >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-700 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            isAdmin && (
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => startEdit(r)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(r.id)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && recruiters.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/60 animate-fade-in">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page <span className="font-semibold text-slate-700 dark:text-slate-300">{page}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
              <span className="ml-1.5 text-xs text-slate-400">({totalCount} total)</span>
            </p>

            <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-1 shadow-sm">
              <button
                onClick={() => fetchRecruiters(1)}
                disabled={page === 1}
                className="p-2 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="First"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchRecruiters(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-0.5 mx-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchRecruiters(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 ${
                        page === pageNum
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => fetchRecruiters(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchRecruiters(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Last"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
