'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Mic, MicOff, Camera, CameraOff, Monitor, MessageSquare,
  Code, Send, Play, Clock, AlertTriangle, Brain, CheckCircle,
  X, Maximize2, Minimize2, Sparkles, Lightbulb, Loader2
} from 'lucide-react';
import { interviewService } from '@/lib/services/interviewService';

export default function InterviewEnvironment() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('code');
  const [chatMessage, setChatMessage] = useState('');
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isActive, setIsActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [result, setResult] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Welcome to your AI interview! Select a template to begin, or start a free-form interview. I'll guide you through each question." },
  ]);

  // Timer
  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => { setTimeLeft(prev => prev - 1); }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startInterview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await interviewService.startInterview(null);
      setInterview(data.interview);
      setTimeLeft(data.interview.duration || 3600);
      setIsActive(true);
      setMessages(prev => [...prev, { role: 'ai', content: `Great! You have ${Math.floor((data.interview.duration || 3600) / 60)} minutes for this interview. Let's start with question 1.` }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = async () => {
    if (!currentAnswer.trim() && !currentCode.trim()) return;

    setLoading(true);
    try {
      const answerData = {
        question: interview?.template?.questions?.[currentQuestionIndex]?.question || `Question ${currentQuestionIndex + 1}`,
        answer: currentAnswer,
        code: currentCode,
        timeSpent: (interview?.duration || 3600) - timeLeft,
      };
      await interviewService.submitAnswer(interview.id, answerData);
      setAnswers(prev => [...prev, answerData]);
      setCurrentAnswer('');
      setCurrentCode('');

      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < (interview?.template?.questions?.length || 0)) {
        setCurrentQuestionIndex(nextIndex);
        setMessages(prev => [...prev, { role: 'ai', content: `Good answer! Now let's move to question ${nextIndex + 1}.` }]);
      } else {
        // Complete the interview
        const resultData = await interviewService.completeInterview(interview.id);
        setResult(resultData.result);
        setIsActive(false);
        setMessages(prev => [...prev, { role: 'ai', content: `Interview completed! Your score: ${resultData.result.overallScore}%` }]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    setLoading(true);
    try {
      const resultData = await interviewService.completeInterview(interview.id);
      setResult(resultData.result);
      setIsActive(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = interview ? ((currentQuestionIndex / (interview?.template?.questions?.length || 1)) * 100) : 0;

  if (!interview) {
    return (
      <div className="lg:pl-[260px] min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          {loading ? (
            <div><Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto mb-4" /><p className="text-slate-400">Starting interview...</p></div>
          ) : (
            <>
              <Brain className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-3">Ready for Your AI Interview?</h2>
              <p className="text-slate-400 mb-6">You'll answer coding questions and receive real-time AI feedback. Make sure your mic and camera are ready.</p>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <button onClick={startInterview} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-lg hover:from-indigo-600 hover:to-purple-600 shadow-xl shadow-indigo-500/20 transition-all">
                <Play className="w-5 h-5" /> Start Interview
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-[260px] min-h-screen bg-slate-900">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 lg:left-[260px] z-30 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${isActive ? 'from-emerald-400 to-emerald-500' : 'from-slate-500 to-slate-600'} flex items-center justify-center`}>
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
              </div>
              <span className="text-sm font-semibold text-white">{isActive ? 'Live Interview' : result ? 'Completed' : 'Ready'}</span>
            </div>
            {interview?.template?.name && <span className="text-slate-500">|</span>}
            <span className="text-sm text-slate-400">{interview?.template?.name || 'Free-form Interview'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className={`text-sm font-mono font-bold ${timeLeft < 300 && isActive ? 'text-red-400 animate-pulse' : 'text-white'}`}>{formatTime(timeLeft)}</span>
            </div>
            <button onClick={() => setFullscreen(!fullscreen)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-slate-800">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row h-screen pt-14">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0">
          <div className="flex items-center gap-1 px-4 py-2 bg-slate-800 border-b border-slate-700">
            <button onClick={() => setActiveTab('code')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'code' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <Code className="w-3.5 h-3.5" /> Code
            </button>
            <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'chat' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <MessageSquare className="w-3.5 h-3.5" /> AI Chat
            </button>
          </div>

          <div className="flex-1 bg-slate-900 overflow-hidden">
            {activeTab === 'code' ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 font-mono text-sm leading-relaxed overflow-y-auto">
                  {interview?.template?.questions?.[currentQuestionIndex] && (
                    <div className="mb-4 p-3 rounded-lg bg-slate-800 border border-slate-700">
                      <p className="text-indigo-400 text-xs font-semibold mb-1">Question {currentQuestionIndex + 1}:</p>
                      <p className="text-white">{interview.template.questions[currentQuestionIndex].question}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                        {interview.template.questions[currentQuestionIndex].difficulty} • {interview.template.questions[currentQuestionIndex].timeLimit || 'No limit'} min
                      </span>
                    </div>
                  )}
                  <div className="text-slate-500 text-xs mb-2">// Write your solution here:</div>
                  <textarea
                    value={currentCode}
                    onChange={e => setCurrentCode(e.target.value)}
                    className="w-full h-64 bg-transparent text-slate-200 font-mono text-sm border-none outline-none resize-none"
                    placeholder="// Type your code here..."
                    disabled={!!result}
                  />
                </div>
                {!result && (
                  <div className="flex items-center justify-between p-3 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <button onClick={submitAnswer} disabled={loading || !currentCode} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 transition-all disabled:opacity-50">
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Submit Answer
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={endInterview} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-all">
                        <X className="w-3.5 h-3.5" /> End Interview
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'ai' && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4 text-white" /></div>}
                      <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>{msg.content}</div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitAnswer()}
                      placeholder="Ask the AI a question..." className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                    <button className="p-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col bg-slate-900/50">
          {result ? (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-white font-semibold mb-4">Interview Results</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="text-xs text-slate-400">Overall Score</p>
                  <p className="text-3xl font-bold text-emerald-400">{result.overallScore}%</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700"><p className="text-xs text-slate-400">Technical</p><p className="text-lg font-bold text-white">{result.technicalScore}%</p></div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700"><p className="text-xs text-slate-400">Comm.</p><p className="text-lg font-bold text-white">{result.communicationScore}%</p></div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700"><p className="text-xs text-slate-400">Confidence</p><p className="text-lg font-bold text-white">{result.confidenceScore}%</p></div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700"><p className="text-xs text-slate-400">Duration</p><p className="text-lg font-bold text-white">{Math.floor(result.duration / 60)} min</p></div>
                </div>
                {result.strengths?.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400 font-semibold mb-2">Strengths</p>
                    {result.strengths.map((s, i) => <p key={i} className="text-xs text-slate-300">✓ {s}</p>)}
                  </div>
                )}
                {result.weaknesses?.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400 font-semibold mb-2">Areas to Improve</p>
                    {result.weaknesses.map((w, i) => <p key={i} className="text-xs text-slate-300">→ {w}</p>)}
                  </div>
                )}
                {result.aiFeedback && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs text-indigo-400 font-semibold mb-2">AI Feedback</p>
                    <p className="text-xs text-slate-300">{result.aiFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Proctoring */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Proctoring</span>
                  <span className="ml-auto text-xs text-emerald-400">All Clear</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Eye Contact</span><CheckCircle className="w-3 h-3 text-emerald-400" /></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Background Noise</span><CheckCircle className="w-3 h-3 text-emerald-400" /></div>
                </div>
              </div>
              {/* Controls */}
              <div className="flex items-center justify-center gap-3 p-2">
                <button onClick={() => setMicOn(!micOn)} className={`p-3 rounded-xl transition-all ${micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-400'}`}>
                  {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button onClick={() => setCamOn(!camOn)} className={`p-3 rounded-xl transition-all ${camOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-400'}`}>
                  {camOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                </button>
                <button className={`p-3 rounded-xl transition-all bg-slate-800 text-white hover:bg-slate-700`}>
                  <Monitor className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
