'use client';

import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Code2, Link, Globe, Upload, Save, Camera, Plus,
  X, Edit3, Sparkles, Award, FileText, Loader2, CheckCircle
} from 'lucide-react';
import { candidateService } from '@/lib/services/candidateService';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await candidateService.getProfile();
        setProfile(data.profile);
        setFormData({
          phone: data.profile.phone || '',
          location: data.profile.location || '',
          title: data.profile.title || '',
          bio: data.profile.bio || '',
          portfolioUrl: data.profile.portfolioUrl || '',
          githubUrl: data.profile.githubUrl || '',
          linkedinUrl: data.profile.linkedinUrl || '',
          company: data.profile.company || '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess('');
    try {
      const result = await candidateService.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setProfile(prev => ({ ...prev, ...result.profile }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  const skills = profile?.skills || [];
  const certifications = profile?.certifications || [];
  const experience = profile?.workExperience || [];
  const completion = profile?.profileCompletion || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Profile Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and preferences</p>
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 transition-all duration-300 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {/* Messages */}
        {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 mb-6"><CheckCircle className="w-5 h-5 text-emerald-500" /><p className="text-sm text-emerald-700">{success}</p></div>}
        {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 mb-6"><X className="w-5 h-5 text-red-500" /><p className="text-sm text-red-700">{error}</p></div>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 transition-colors">
                  <Camera className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</h2>
              <p className="text-sm text-slate-500">{formData.title || user?.role}</p>
              <div className="mt-2">
                <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5" /> {formData.location || 'Location not set'}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Profile Completion</span>
                  <span className="text-xs font-semibold text-indigo-600">{completion}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${completion}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200">
                <div><div className="text-lg font-bold text-slate-900">{profile?._count?.skills || skills.length}</div><div className="text-xs text-slate-500">Skills</div></div>
                <div><div className="text-lg font-bold text-slate-900">{certifications.length}</div><div className="text-xs text-slate-500">Certs</div></div>
                <div><div className="text-lg font-bold text-slate-900">{experience.length}</div><div className="text-xs text-slate-500">Exp.</div></div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-900">Resume</h3>
              </div>
              {profile?.resumeUrl ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-700">Resume uploaded</span>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-300 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">Upload Resume</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOCX (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Personal Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: User, label: 'Full Name', value: user?.name || '', key: 'name' },
                  { icon: Mail, label: 'Email', value: user?.email || '', key: 'email' },
                  { icon: Phone, label: 'Phone', value: formData.phone, key: 'phone' },
                  { icon: MapPin, label: 'Location', value: formData.location, key: 'location' },
                  { icon: Briefcase, label: 'Title', value: formData.title, key: 'title' },
                  { icon: Globe, label: 'Portfolio', value: formData.portfolioUrl, key: 'portfolioUrl' },
                  { icon: Code2, label: 'GitHub', value: formData.githubUrl, key: 'githubUrl' },
                  { icon: Link, label: 'LinkedIn', value: formData.linkedinUrl, key: 'linkedinUrl' },
                ].map((field, i) => {
                  const Icon = field.icon;
                  const isEditable = ['phone', 'location', 'title', 'portfolioUrl', 'githubUrl', 'linkedinUrl'].includes(field.key);
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-500">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{field.label}</p>
                        {editing && isEditable ? (
                          <input type="text" value={formData[field.key] || ''}
                            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                            className="mt-1 w-full px-2 py-1 rounded-md bg-white border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        ) : (
                          <p className="mt-1 text-sm font-medium text-slate-900 truncate">{field.value || 'Not set'}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {editing && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Bio</label>
                  <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}
              {!editing && profile?.bio && <p className="mt-4 text-sm text-slate-600 leading-relaxed">{profile.bio}</p>}
            </div>

            {/* Skills */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-slate-900">Skills</h3>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 hover-card">
                    <div><p className="text-sm font-medium text-slate-900">{skill.name}</p><p className="text-xs text-slate-500">{skill.level} • {skill.endorsements} endorsements</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-900">Work Experience</h3>
              </div>
              <div className="space-y-4">
                {experience.map((exp, i) => (
                  <div key={i} className="relative pl-6 pb-4 border-l-2 border-slate-200 last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-indigo-500" />
                    <h4 className="font-semibold text-slate-900">{exp.role}</h4>
                    <p className="text-sm text-slate-500">{exp.company} • {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}</p>
                    {exp.description && <p className="text-sm text-slate-600 mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
