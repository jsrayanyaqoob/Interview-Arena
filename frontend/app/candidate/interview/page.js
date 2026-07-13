'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

import { interviewService } from '@/lib/services/interviewService';
import {
  Brain, Mic, MicOff, Camera, CameraOff, Monitor,
  Clock, ChevronRight, Play, Loader2, CheckCircle,
  AlertCircle, BarChart3, Award, Target, TrendingUp,
  MessageSquare, Volume2, VolumeX, Lightbulb, BookOpen,
  ArrowRight, FileText, Star, Pencil, Eraser,
} from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────
const CATEGORIES = [
  'Frontend', 'Backend', 'Full Stack', 'React', 'Next.js',
  'JavaScript', 'Node.js', 'Express.js', 'PostgreSQL', 'AWS',
  'HR', 'Behavioral', 'DSA', 'System Design', 'General',
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const DURATIONS = [15, 30, 60];
const TYPES = ['Technical', 'Behavioral', 'Coding', 'Mixed'];

// ─── Phase 0: Interview Setup ──────────────────────────────
function SetupScreen({ onStart }) {
  const [config, setConfig] = useState({
    category: 'React',
    difficulty: 'Intermediate',
    duration: 30,
    type: 'Mixed',
  });
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    await onStart(config);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-xl shadow-indigo-500/20">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Interview Setup</h1>
          <p className="text-slate-400">Configure your interview and let AI guide you</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setConfig(f => ({ ...f, category: cat }))}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    config.category === cat
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff}
                  onClick={() => setConfig(f => ({ ...f, difficulty: diff }))}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    config.difficulty === diff
                      ? diff === 'Beginner'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
                        : diff === 'Intermediate'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-red-500/20 border-red-500/50 text-red-400 shadow-lg shadow-red-500/10'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setConfig(f => ({ ...f, duration: d }))}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                      config.duration === d
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setConfig(f => ({ ...f, type: t }))}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                      config.type === t
                        ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={starting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {starting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Preparing Interview...</>
            ) : (
              <><Play className="w-5 h-5" /> Start AI Interview</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 1: Permission Screen + Countdown ────────────────
function PermissionScreen({ config, onReady }) {
  const [step, setStep] = useState('request');
  const [micGranted, setMicGranted] = useState(false);
  const [camGranted, setCamGranted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const requestPermissions = async () => {
    setStep('requesting');

    // Check for non-secure context (HTTP instead of HTTPS) — this is the most common
    // reason getUserMedia fails in production. Browsers block camera/mic access
    // on non-secure origins for security reasons.
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setError(
        'Camera and microphone require a secure HTTPS connection. You are currently accessing this site over HTTP. Please use the HTTPS version of this site, or contact the administrator to enable HTTPS.'
      );
      setStep('error');
      return;
    }

    // Check if the MediaDevices API is available at all (may be undefined
    // in non-secure contexts or unsupported browsers)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        'Your browser does not support camera/microphone access, or the page is not loaded over a secure connection (HTTPS). Please use a modern browser and ensure you visit this site via HTTPS.'
      );
      setStep('error');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setMicGranted(true);
      setCamGranted(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStep('countdown');
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          onReady(mediaStream);
        }
      }, 1000);
    } catch (err) {
      const name = err?.name || '';
      const message = err?.message || '';

      if (name === 'NotAllowedError') {
        setError('Permission denied. Please allow camera and microphone access in your browser settings and try again.');
      } else if (name === 'NotFoundError') {
        setError('No camera or microphone found. Please connect a camera and microphone to your device.');
      } else if (name === 'SecurityError') {
        setError(
          'Security error accessing media devices. This usually happens when the page is not served over HTTPS. Please contact the administrator to enable HTTPS.'
        );
      } else if (name === 'NotReadableError') {
        setError('Camera or microphone is already in use by another application. Please close other apps that may be using them.');
      } else if (name === 'AbortError') {
        setError('Something went wrong while accessing your media devices. Please try again.');
      } else if (name === 'TypeError') {
        setError(
          'Your browser does not support camera/microphone access, or the page is not loaded over a secure connection (HTTPS). Please use a modern browser with HTTPS.'
        );
      } else {
        // Generic fallback — include the actual error name for debugging
        setError(`Failed to access media devices. (${name}: ${message.substring(0, 100)})`);
      }
      setStep('error');
    }
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg animate-fade-in text-center">
        {step === 'request' || step === 'requesting' ? (
          <>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-6">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Monitor className="w-7 h-7 text-white" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Mic className="w-7 h-7 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">Permissions Required</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                To conduct the AI interview, we need access to your microphone and camera.
                This allows the AI to hear your responses and analyze communication patterns.
                Your privacy is important — video is not recorded and only analyzed in real-time.
              </p>
              <div className="space-y-2 text-left">
                {[
                  { icon: Mic, label: 'Microphone', desc: 'Convert your speech to text', granted: micGranted },
                  { icon: Camera, label: 'Camera', desc: 'Display your video feed & analyze confidence', granted: camGranted },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <item.icon className="w-5 h-5 text-indigo-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    {step === 'requesting' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={requestPermissions}
                disabled={step === 'requesting'}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60"
              >
                {step === 'requesting' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Requesting Access...
                  </span>
                ) : (
                  'Grant Access & Start'
                )}
              </button>
            </div>
          </>
        ) : step === 'countdown' ? (
          <div className="animate-fade-in">
            <div className="relative w-64 h-48 mx-auto mb-6 rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-2xl">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-white font-medium">Live</span>
              </div>
            </div>
            <div className="text-8xl font-bold text-white mb-4 animate-fade-in">{countdown}</div>
            <p className="text-slate-400">Get ready! The interview starts in {countdown}...</p>
            <p className="text-sm text-slate-500 mt-2">
              {config.type} • {config.category} • {config.difficulty}
            </p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Permission Error</h2>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={requestPermissions}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/20"
              >
                Try Again
              </button>
              <button
                onClick={() => onReady(null)}
                className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 border border-white/10 transition-all text-sm"
              >
                Continue without camera & mic (type answers)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Phase 2: Live Interview Room ──────────────────────────
function InterviewRoom({ config, stream, onComplete }) {
  const interviewIdRef = useRef(null);
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [messages, setMessages] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [result, setResult] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const transcriptRef = useRef('');
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const speechDataRef = useRef({ duration: 0, transcript: '' });
  const totalDurationRef = useRef(0);
  const shouldListenRef = useRef(false);

  // Initialize camera
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, question, result]);

  // Start interview via API on mount
  useEffect(() => {
    startInterviewViaAPI();
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (synthRef.current) synthRef.current.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startInterviewViaAPI = async () => {
    try {
      const data = await interviewService.startInterview(config);
      interviewIdRef.current = data.interview.id;
      setQuestion(data.currentQuestion);
      setQuestionIndex(data.questionIndex);
      setTimeLeft(data.interview.duration);
      startTimeRef.current = Date.now();
      setInitializing(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        totalDurationRef.current = elapsed;
        setTotalDuration(elapsed);
      }, 1000);

      // Speak the first question after a short delay
      setTimeout(() => speakText(data.currentQuestion.question), 500);
      // Start listening shortly after
      setTimeout(() => startListening(), 2500);
    } catch (err) {
      console.error('Failed to start interview:', err);
      setInitError(err.response?.data?.error || err.message || 'Failed to connect to AI. Please try again.');
      setInitializing(false);
    }
  };

  // ── Text-to-Speech ──
  const speakText = useCallback((text) => {
    if (!window.speechSynthesis) return;
    synthRef.current = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    // Try to use a good voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, []);

  // ── Speech-to-Text ──
  const startListening = useCallback(() => {
    // Abort any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        const newText = transcriptRef.current + finalTranscript;
        transcriptRef.current = newText;
        setTranscript(newText.trim());
        speechDataRef.current.transcript = newText;
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Browser fires both onerror('no-speech') AND onend — 
        // onend handles the restart, so nothing to do here.
      } else if (event.error === 'aborted') {
        // Normal abort from stopListening() or abort() — ignore
      } else {
        // Other errors (audio-capture, network, not-allowed, etc.)
        // — restart after a delay if still supposed to listen
        if (shouldListenRef.current) {
          setTimeout(() => {
            try { recognition.start(); } catch (_) {}
          }, 500);
        }
      }
    };

    // CRITICAL FIX: Browser closes the speech recognition session after periods
    // of silence (even with continuous:true). The onend handler automatically
    // restarts it so the mic stays live throughout the interview.
    // The `recognitionRef.current === recognition` guard prevents stale
    // recognition instances (from a previous `startListening` call) from
    // restarting after a new one has already been created.
    recognition.onend = () => {
      if (shouldListenRef.current && recognitionRef.current === recognition) {
        setTimeout(() => {
          try { recognition.start(); } catch (_) {}
        }, 100);
      }
    };

    shouldListenRef.current = true;
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      shouldListenRef.current = false;
      console.warn('Failed to start recognition:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }
  }, []);

  // Toggle microphone
  const toggleMic = () => {
    if (microphoneEnabled) {
      stopListening();
    } else {
      startListening();
    }
    setMicrophoneEnabled(!microphoneEnabled);
  };

  // Toggle camera
  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setCameraEnabled(!cameraEnabled);
    }
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!transcript.trim() && !interimTranscript.trim()) return;

    stopListening();
    setEvaluating(true);

    const finalAnswer = transcript.trim() || interimTranscript.trim();
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    speechDataRef.current.duration = duration;

    try {
      const data = await interviewService.submitAnswer(interviewIdRef.current, {
        question: question.question,
        answer: finalAnswer,
        transcript: finalAnswer,
        speechMetrics: speechDataRef.current,
        questionIndex,
        totalDuration: duration,
      });

      setMessages(prev => [...prev, { role: 'user', content: finalAnswer }]);
      setTranscript('');
      setInterimTranscript('');
      transcriptRef.current = '';
      speechDataRef.current = { duration: 0, transcript: '' };

      if (data.completed) {
        clearInterval(timerRef.current);
        setResult(data.report);
        onComplete(data.report, duration);
        return;
      }

      // Show evaluation feedback briefly
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Score: ${data.evaluation.overallScore}/100 — ${data.evaluation.feedback}`,
      }]);

      // Load next question
      setQuestion(data.nextQuestion);
      setQuestionIndex(data.nextQuestionIndex);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.nextQuestion.question,
      }]);

      // Speak the next question
      setTimeout(() => {
        speakText(data.nextQuestion.question);
        startListening();
      }, 1500);

    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  // Manual text input handler
  const handleTextChange = (e) => {
    const val = e.target.value;
    setTranscript(val);
    transcriptRef.current = val;
    speechDataRef.current.transcript = val;
  };

  const handleTimeUp = useCallback(() => {
    const currentTranscript = transcriptRef.current.trim();
    if (currentTranscript) {
      handleSubmitAnswer();
    } else {
      // Auto-complete
      interviewService.completeInterview(interviewIdRef.current).then(data => {
        clearInterval(timerRef.current);
        setResult(data.report);
        onComplete(data.report, totalDuration);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!question) {
    if (initError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-md w-full text-center animate-fade-in">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">{initError}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 transition-all"
              >
                <Loader2 className="w-4 h-4" /> Retry
              </button>
              <Link
                href="/candidate/interview/history"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 border border-white/10 transition-all"
              >
                View History
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-400">Initializing AI Interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-sm font-semibold text-white">AI Interview</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-sm text-slate-400">{config.type} • {config.category}</span>
        </div>
        <div className="flex items-center gap-3">
          {isSpeaking && (
            <span className="flex items-center gap-1.5 text-xs text-indigo-400">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Speaking...
            </span>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Question + Transcript */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Question */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Question {questionIndex + 1}
              </span>
              <span className="text-xs text-slate-500 ml-auto">
                {question.estimatedDifficulty} • {question.topics?.join(', ')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              {question.question}
            </h2>
            {question.keyPoints && (
              <div className="mt-3 flex flex-wrap gap-2">
                {question.keyPoints.map((point, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                    {point}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Interview Progress</span>
              <span>{Math.min(100, Math.round((questionIndex / 8) * 100))}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-700"
                style={{ width: `${Math.min(100, Math.round((questionIndex / 8) * 100))}%` }}
              />
            </div>
          </div>

          {/* Conversation History */}
          {messages.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 mb-4 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversation</span>
              </div>
              <div className="space-y-2">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    <div className={`max-w-[90%] rounded-lg px-3 py-2 text-xs ${
                      msg.role === 'user'
                        ? 'bg-indigo-500/15 border border-indigo-500/20 text-indigo-200'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-400'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your Answer - Editable Input */}
          <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Answer</span>
              </div>
              <div className="flex items-center gap-2">
                {isListening && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Listening...
                  </span>
                )}
                {transcript && (
                  <button
                    onClick={() => {
                      setTranscript('');
                      setInterimTranscript('');
                      transcriptRef.current = '';
                      speechDataRef.current = { duration: 0, transcript: '' };
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all"
                    title="Clear answer"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Editable textarea for answer (transcript without interim text) */}
            <textarea
              value={transcript}
              onChange={handleTextChange}
              placeholder={isListening ? 'Speak now or type your answer...' : 'Type your answer here...'}
              className="flex-1 w-full min-h-[100px] bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none leading-relaxed"
              rows={3}
            />

            {/* Interim speech hint (shown separately below textarea) */}
            {interimTranscript && (
              <div className="mt-2 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mt-1.5 flex-shrink-0" />
                <p className="text-sm text-emerald-400/70 italic leading-relaxed">
                  {interimTranscript}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-4">
            <button
              onClick={handleSubmitAnswer}
              disabled={!transcript.trim() || evaluating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {evaluating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> AI is Evaluating...</>
              ) : (
                <><ArrowRight className="w-4 h-4" /> Submit Answer</>
              )}
            </button>
          </div>
        </div>

        {/* Right: Camera + Controls */}
        <div className="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 space-y-4">
          {/* Camera Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-video border border-slate-700">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!cameraEnabled && (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <CameraOff className="w-8 h-8 text-slate-600" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-xs text-white font-medium">You</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-xl transition-all ${
                microphoneEnabled
                  ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
              title={microphoneEnabled ? 'Mute' : 'Unmute'}
            >
              {microphoneEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleCamera}
              className={`p-3.5 rounded-xl transition-all ${
                cameraEnabled
                  ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
              title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </button>
            {isSpeaking && (
              <button
                onClick={() => synthRef.current?.cancel()}
                className="p-3.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
                title="Stop speaking"
              >
                <VolumeX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Tips</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Speak clearly and at a moderate pace</li>
              <li>• Structure your answers logically</li>
              <li>• Provide specific examples</li>
              <li>• Take your time — think before speaking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 3: Results ──────────────────────────────────────
function ResultsScreen({ report, config, duration, onBack }) {
  const scoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const scoreBg = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4 shadow-xl shadow-emerald-500/20">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Interview Complete!</h1>
          <p className="text-slate-400">
            {config.type} • {config.category} • {config.difficulty} • {Math.round(duration / 60)} minutes
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-6 text-center">
          <div className={`text-6xl font-bold ${scoreColor(report.overallScore)} mb-2`}>
            <span className={scoreColor(report.overallScore)}>{report.overallScore}%</span>
          </div>
          <p className="text-slate-400 text-sm">Overall Interview Score</p>

          {/* Score Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Technical', score: report.technicalScore },
              { label: 'Communication', score: report.communicationScore },
              { label: 'Confidence', score: report.confidenceScore },
              { label: 'Problem Solving', score: report.problemSolvingScore },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.5" fill="none"
                      stroke={item.score >= 80 ? '#34d399' : item.score >= 60 ? '#fbbf24' : '#f87171'}
                      strokeWidth="3"
                      strokeDasharray={`${item.score * 0.97} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                    {item.score}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Summary
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">{report.summary || report.detailedFeedback}</p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {report.strengths?.length > 0 && (
            <div className="bg-emerald-500/5 backdrop-blur-sm rounded-xl border border-emerald-500/10 p-5">
              <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.weaknesses?.length > 0 && (
            <div className="bg-amber-500/5 backdrop-blur-sm rounded-xl border border-amber-500/10 p-5">
              <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Detailed Feedback */}
        {report.detailedFeedback && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Feedback
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">{report.detailedFeedback}</p>
          </div>
        )}

        {/* Recommended Topics */}
        {report.recommendedTopics?.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Recommended Learning Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {report.recommendedTopics.map((topic, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-300 font-medium">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Learning Resources */}
        {report.learningResources?.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Learning Resources
            </h2>
            <div className="space-y-3">
              {report.learningResources.map((resource, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">{resource.topic}</p>
                    <p className="text-xs text-slate-400">{resource.resource}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {report.recommendedNextSteps?.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Recommended Next Steps
            </h2>
            <div className="space-y-2">
              {report.recommendedNextSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filler Word Analysis */}
        {report.fillerWordAnalysis && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Speech Analysis
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">{report.fillerWordAnalysis}</p>
          </div>
        )}

        {/* Career Readiness */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Career Readiness Level</p>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${
            report.careerReadiness === 'Expert'
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
              : report.careerReadiness === 'Advanced'
              ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
              : report.careerReadiness === 'Intermediate'
              ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
              : 'bg-slate-500/20 border-slate-500/30 text-slate-400'
          }`}>
            <Award className="w-4 h-4" />
            {report.careerReadiness}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-8">
          <Link
            href="/candidate/interview"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Play className="w-4 h-4" />
            Take Another Interview
          </Link>
          <Link
            href="/candidate/interview/history"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 border border-white/10 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            View Interview History
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────
export default function InterviewPage() {
  const [phase, setPhase] = useState('setup'); // setup | permissions | interview | results
  const [config, setConfig] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [report, setReport] = useState(null);
  const [finalDuration, setFinalDuration] = useState(0);

  const handleConfigSubmit = async (cfg) => {
    setConfig(cfg);
    setPhase('permissions');
  };

  const handlePermissionsReady = (stream) => {
    setMediaStream(stream);
    setPhase('interview');
  };

  const handleInterviewComplete = (reportData, duration) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
    }
    setReport(reportData);
    setFinalDuration(duration);
    setPhase('results');
  };

  switch (phase) {
    case 'setup':
      return <SetupScreen onStart={handleConfigSubmit} />;
    case 'permissions':
      return <PermissionScreen config={config} onReady={handlePermissionsReady} />;
    case 'interview':
      return (
        <InterviewRoom
          config={config}
          stream={mediaStream}
          onComplete={handleInterviewComplete}
        />
      );
    case 'results':
      return <ResultsScreen report={report} config={config} duration={finalDuration} />;
    default:
      return <SetupScreen onStart={handleConfigSubmit} />;
  }
}
