'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Copy, Trash2, Eye, Save, Clock,
  Code, MessageSquare, Brain, Star, GripVertical,
  FileText, Sparkles, ChevronRight, Loader2
} from 'lucide-react';
import { recruiterService } from '@/lib/services/recruiterService';

export default function TemplateBuilder() {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchTemplate(selectedId);
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedId]);

  const fetchTemplates = async () => {
    try {
      const data = await recruiterService.getTemplates({ limit: 50 });
      setTemplates(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplate = async (id) => {
    try {
      const data = await recruiterService.getTemplate(id);
      setSelectedTemplate(data.template);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTemplate = async (id) => {
    try {
      await recruiterService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const duplicateTemplate = async (id) => {
    try {
      await recruiterService.duplicateTemplate(id);
      fetchTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="lg:pl-[260px] min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  const renderDifficulty = (difficulty) => {
    const colors = { Easy: 'bg-emerald-100 text-emerald-600', Medium: 'bg-amber-100 text-amber-600', Hard: 'bg-red-100 text-red-600', Expert: 'bg-purple-100 text-purple-600' };
    return colors[difficulty] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="lg:pl-[260px] min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Interview Templates</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage interview templates</p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 transition-all duration-300">
            <Plus className="w-4 h-4" /> New Template
          </button>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">All Templates</h2>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button key={template.id} onClick={() => setSelectedId(template.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${selectedId === template.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'}`}>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-semibold text-slate-900">{template.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${template.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{template.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{template.category || 'General'}</span>
                      <span>{template.duration} min</span>
                      <span>{template._count?.questions || 0} questions</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < Math.floor(template.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}
                      </div>
                      <span className="text-xs text-slate-400">({template._count?.interviews || 0} uses)</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedTemplate.name}</h2>
                      <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedTemplate.duration} min</span>
                        <span className="flex items-center gap-1"><Code className="w-4 h-4" /> {selectedTemplate.questions?.length || 0} questions</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${renderDifficulty(selectedTemplate.difficulty)}`}>{selectedTemplate.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => duplicateTemplate(selectedTemplate.id)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => deleteTemplate(selectedTemplate.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                {selectedTemplate.questions?.map((q, i) => (
                  <div key={q.id} className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      {q.type === 'coding' ? <Code className="w-5 h-5 text-indigo-500" /> : q.type === 'behavioral' ? <MessageSquare className="w-5 h-5 text-indigo-500" /> : <Brain className="w-5 h-5 text-indigo-500" />}
                      <h3 className="font-semibold text-slate-900">{q.type?.replace('_', ' ') || 'Question'} #{i + 1}</h3>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <GripVertical className="w-4 h-4 text-slate-300 cursor-move" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{q.question}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${renderDifficulty(q.difficulty)}`}>{q.difficulty}</span>
                          <span>{q.timeLimit || '-'} min</span>
                          {q.skills?.length > 0 && <span>{q.skills.join(', ')}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )) || <div className="text-center py-8 text-slate-400"><FileText className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No questions yet. Add questions to this template.</p></div>}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 rounded-2xl bg-white border border-slate-200">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Template</h3>
                  <p className="text-sm text-slate-500">Choose a template from the list or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
