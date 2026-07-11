'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Copy, Trash2, Save, Clock, Loader2,
  FileText, Sparkles, Star, X, CheckCircle
} from 'lucide-react';
import { recruiterService } from '@/lib/services/recruiterService';

export default function TemplateBuilder() {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'Engineering',
    difficulty: 'Medium',
    duration: 60,
  });
  const [creating, setCreating] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      setError(null);
      const data = await recruiterService.getTemplates({ limit: 50 });
      setTemplates(data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplate = useCallback(async (id) => {
    try {
      setError(null);
      const data = await recruiterService.getTemplate(id);
      setSelectedTemplate(data.template);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load template details');
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (selectedId) {
      fetchTemplate(selectedId);
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedId, fetchTemplate]);

  const handleCreate = async () => {
    if (!newTemplate.name.trim()) {
      setError('Template name is required');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const result = await recruiterService.createTemplate(newTemplate);
      setSuccess(`Template "${result.template.name}" created!`);
      setShowCreateModal(false);
      setNewTemplate({ name: '', category: 'Engineering', difficulty: 'Medium', duration: 60 });
      await fetchTemplates();
      setSelectedId(result.template.id);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create template');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      setError(null);
      await recruiterService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedId === id) setSelectedId(null);
      setSuccess('Template deleted!');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete template');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      setError(null);
      await recruiterService.duplicateTemplate(id);
      setSuccess('Template duplicated!');
      await fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to duplicate template');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const renderDifficulty = (difficulty) => {
    const colors = {
      Easy: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      Hard: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      Expert: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    };
    return colors[difficulty] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950 p-5 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Interview Templates</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Create and manage interview templates
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 flex gap-3 items-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="mb-6 flex gap-3 items-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30">
          <X className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              All Templates ({templates.length})
            </h2>
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No templates yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition"
                >
                  Create your first template
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedId(template.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedId === template.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/50'
                        : 'bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{template.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                        template.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        {template.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{template.category || 'General'}</span>
                      <span>{template.duration} min</span>
                      <span>{template._count?.questions || 0} questions</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(template.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">({template._count?.interviews || 0} uses)</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTemplate.name}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {selectedTemplate.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" /> {selectedTemplate.questions?.length || 0} questions
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${renderDifficulty(selectedTemplate.difficulty)}`}>
                        {selectedTemplate.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicate(selectedTemplate.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedTemplate.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category & Status badges */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                    {selectedTemplate.category || 'General'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                    {selectedTemplate._count?.interviews || 0} interviews conducted
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white px-1">
                  Questions ({selectedTemplate.questions?.length || 0})
                </h3>
                {selectedTemplate.questions?.length > 0 ? (
                  selectedTemplate.questions.map((q, i) => (
                    <div key={q.id} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 text-sm font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm capitalize">
                            {q.type?.replace('_', ' ') || 'Question'}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${renderDifficulty(q.difficulty)}`}>
                              {q.difficulty}
                            </span>
                            {q.timeLimit && <span>{q.timeLimit} min</span>}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{q.question}</p>
                      {q.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {q.skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                    <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No questions yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Questions will appear here once added</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center p-12 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Select a Template</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose a template from the list or create a new one to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Template</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Data Science">Data Science</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={newTemplate.difficulty}
                    onChange={(e) => setNewTemplate(p => ({ ...p, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={newTemplate.duration}
                    onChange={(e) => setNewTemplate(p => ({ ...p, duration: parseInt(e.target.value) || 60 }))}
                    min={15}
                    max={180}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={creating || !newTemplate.name.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 mt-2"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {creating ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
