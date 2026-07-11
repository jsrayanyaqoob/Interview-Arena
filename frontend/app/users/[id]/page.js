'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { userDirectoryService } from '@/lib/services/userDirectoryService';
import {
  ArrowLeft, Mail, Calendar, Award, Code2, Briefcase,
  Building2, GraduationCap, Star, Clock, Target, Shield,
  ChevronRight, Loader2, AlertCircle, ExternalLink,
  TrendingUp, BookOpen, FileText, Sparkles,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover-card">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function SkillBadge({ name, level }) {
  const levelColors = {
    BEGINNER: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
    INTERMEDIATE: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30',
    ADVANCED: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30',
    EXPERT: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${levelColors[level] || levelColors.INTERMEDIATE}`}>
      <Award className="w-3 h-3" />
      {name}
    </span>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await userDirectoryService.getUserById(params.id);
        setUser(data.user);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">User not found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error || 'This user does not exist or has been removed.'}</p>
          <Link href="/users/candidates" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const isCandidate = user.role === 'CANDIDATE';
  const profile = isCandidate ? user.candidateProfile : user.recruiterProfile;
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-indigo-500 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={isCandidate ? '/users/candidates' : '/users/recruiters'}
            className="hover:text-indigo-500 transition-colors"
          >
            {isCandidate ? 'Candidates' : 'Recruiters'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-indigo-600 dark:text-indigo-400 font-medium truncate">{user.name}</span>
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
              isCandidate ? 'from-emerald-400 to-teal-500' : 'from-purple-400 to-indigo-500'
            } flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 shadow-lg`}>
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    isCandidate
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
                      : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30'
                  }`}>
                    {isCandidate ? <GraduationCap className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                    {user.role}
                  </span>
                </div>
              </div>

              {isCandidate && profile?.title && (
                <p className="mt-3 text-base text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  {profile.title}
                </p>
              )}
              {!isCandidate && profile?.position && (
                <p className="mt-3 text-base text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  {profile.position} at {profile.company}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {user._count?.interviews || 0} interview{(user._count?.interviews || 0) !== 1 ? 's' : ''}
                </span>
                {user._count?.achievements > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    {user._count.achievements} achievement{(user._count.achievements) !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={FileText}
            label="Interviews"
            value={user._count?.interviews || 0}
            gradient="from-indigo-500 to-purple-500"
          />
          <StatCard
            icon={Award}
            label="Achievements"
            value={user._count?.achievements || 0}
            gradient="from-amber-500 to-orange-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Results"
            value={user._count?.interviewResults || 0}
            gradient="from-emerald-500 to-teal-500"
          />
          <StatCard
            icon={Calendar}
            label="Member Since"
            value={new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            gradient="from-cyan-500 to-blue-500"
          />
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              About
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Candidate: Skills + Certifications */}
        {isCandidate && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Skills */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-500" />
                Skills
                {profile?._count?.skills > 0 && (
                  <span className="text-xs font-medium text-slate-400 ml-1">({profile._count.skills})</span>
                )}
              </h2>
              {profile?.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <SkillBadge key={i} name={skill.name} level={skill.level} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">No skills listed yet.</p>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Certifications
                {profile?._count?.certifications > 0 && (
                  <span className="text-xs font-medium text-slate-400 ml-1">({profile._count.certifications})</span>
                )}
              </h2>
              {profile?.certifications?.length > 0 ? (
                <div className="space-y-3">
                  {profile.certifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{cert.name}</p>
                        <p className="text-xs text-slate-500">
                          {cert.issuer}{cert.date ? ` · ${new Date(cert.date).getFullYear()}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">No certifications yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Candidate: Work Experience */}
        {isCandidate && profile?.workExperience?.length > 0 && (
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              Work Experience
              <span className="text-xs font-medium text-slate-400 ml-1">({profile.workExperience.length})</span>
            </h2>
            <div className="space-y-4">
              {profile.workExperience.map((exp, i) => (
                <div key={i} className="relative pl-6 pb-4 border-l-2 border-slate-200 dark:border-slate-700 last:pb-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-800" />
                  <div className="ml-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{exp.position}</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">{exp.company}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {' — '}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recruiter: Company Info */}
        {!isCandidate && (
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              Company Profile
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Company</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile?.company || 'Not specified'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Position</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile?.position || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center pb-8">
          <Link
            href={isCandidate ? '/users/candidates' : '/users/recruiters'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {isCandidate ? 'Candidates' : 'Recruiters'}
          </Link>
        </div>
      </div>
    </div>
  );
}
