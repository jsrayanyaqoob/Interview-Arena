const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();
const { authenticate } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const {
  generateFirstQuestion,
  generateFollowUp,
  evaluateAnswer,
  generateReport,
  analyzeCommunication,
} = require('../services/gemini');

router.use(authenticate);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ========== START AI INTERVIEW ==========
router.post('/start', [
  body('category').optional().isString(),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('type').optional().isIn(['Technical', 'Behavioral', 'Coding', 'Mixed']),
  body('duration').optional().isInt({ min: 15, max: 60 }),
], validate, async (req, res, next) => {
  try {
    const { category = 'General', difficulty = 'Intermediate', type = 'Mixed', duration = 30 } = req.body;

    // Generate the first question using Gemini
    const firstQuestion = await generateFirstQuestion({ category, difficulty, type });

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        id: uuidv4(),
        candidateId: req.user.id,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        duration: duration * 60,
        notes: JSON.stringify({ category, difficulty, type, questionCount: 0 }),
      },
    });

    logger.info(`AI Interview started: ${interview.id} by user ${req.user.id} (${category}, ${difficulty})`);

    res.status(201).json({
      interview: {
        id: interview.id,
        status: interview.status,
        startedAt: interview.startedAt,
        duration: interview.duration,
        config: { category, difficulty, type, duration },
      },
      currentQuestion: firstQuestion,
      questionIndex: 0,
    });
  } catch (error) {
    next(error);
  }
});

// ========== SUBMIT ANSWER & GET NEXT QUESTION ==========
router.post('/:id/answer', [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').optional(),
  body('transcript').optional(),
  body('speechMetrics').optional(),
  body('questionIndex').optional().isInt({ min: 0 }),
  body('totalDuration').optional().isInt({ min: 0 }),
], validate, async (req, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, candidateId: req.user.id, status: 'IN_PROGRESS' },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found or not in progress.' });
    }

    const { question, answer, transcript, speechMetrics, questionIndex, totalDuration } = req.body;
    const config = JSON.parse(interview.notes || '{}');

    // Store the answer
    const maxOrder = await prisma.interviewAnswer.findFirst({
      where: { interviewId: req.params.id },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    await prisma.interviewAnswer.create({
      data: {
        interviewId: req.params.id,
        question,
        answer: answer || transcript || '',
        code: null,
        timeSpent: totalDuration || 0,
        orderIndex: (maxOrder?.orderIndex ?? -1) + 1,
      },
    });

    // Get previous scores for context
    const previousAnswers = await prisma.interviewAnswer.findMany({
      where: { interviewId: req.params.id },
      orderBy: { orderIndex: 'asc' },
    });

    const prevEvaluations = JSON.parse(interview.notes || '{}').evaluations || [];
    const previousScores = prevEvaluations.map(e => e.score);

    // Evaluate answer using Gemini
    const evaluation = await evaluateAnswer({
      question,
      answer: answer || transcript || '[No answer provided]',
      category: config.category || 'General',
      difficulty: config.difficulty || 'Intermediate',
      type: config.type || 'Mixed',
      previousScores,
    });

    // Analyze communication
    const communicationMetrics = speechMetrics
      ? analyzeCommunication(speechMetrics)
      : { fillerWordCount: 0, fillerWords: [], avgWordsPerMinute: 0, totalSpeakingTime: 0, avgResponseLength: 0, fluency: 'Unknown' };

    // Build conversation history
    const conversationHistory = previousAnswers.map(a => ({
      role: 'assistant',
      content: a.question,
    }));
    conversationHistory.push({ role: 'user', content: answer || transcript || '' });

    // Save evaluation
    const updatedEvaluations = [
      ...prevEvaluations,
      {
        question,
        answer: answer || transcript || '',
        score: evaluation.overallScore,
        technicalAccuracy: evaluation.technicalAccuracy,
        completeness: evaluation.completeness,
        logicalReasoning: evaluation.logicalReasoning,
        communicationQuality: evaluation.communicationQuality,
        problemSolving: evaluation.problemSolving,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        feedback: evaluation.feedback,
        missedConcepts: evaluation.missedConcepts || [],
        communicationMetrics,
      },
    ];

    // Calculate if interview should end (5-8 questions or time based)
    const questionCount = questionIndex + 1;
    const maxQuestions = config.type === 'Behavioral' ? 6 : 8;
    const minQuestions = 5;
    const shouldEnd = questionCount >= maxQuestions || (questionCount >= minQuestions && evaluation.overallScore < 40);

    // Update notes with evaluations
    await prisma.interview.update({
      where: { id: req.params.id },
      data: {
        notes: JSON.stringify({
          ...config,
          questionCount,
          evaluations: updatedEvaluations,
        }),
      },
    });

    if (shouldEnd) {
      // Auto-complete
      const duration = Math.floor((Date.now() - new Date(interview.startedAt).getTime()) / 1000);
      await prisma.interview.update({
        where: { id: req.params.id },
        data: { status: 'COMPLETED', completedAt: new Date(), duration },
      });

      // Generate final report
      const transcriptHistory = [
        ...conversationHistory,
        { role: 'system', content: 'Interview completed' },
      ];

      const report = await generateReport({
        transcript: transcriptHistory,
        evaluations: updatedEvaluations,
        communicationMetrics: {
          totalSpeakingTime: speechMetrics?.duration || 0,
          avgResponseLength: speechMetrics?.transcript ? speechMetrics.transcript.split(/\s+/).length : 0,
          fillerWords: communicationMetrics.fillerWords,
          fillerWordCount: communicationMetrics.fillerWordCount,
          avgWordsPerMinute: communicationMetrics.avgWordsPerMinute,
        },
        config,
        totalDuration: duration,
      });

      // Save final result
      await prisma.interviewResult.create({
        data: {
          interviewId: req.params.id,
          userId: req.user.id,
          overallScore: report.overallScore,
          technicalScore: report.technicalScore,
          communicationScore: report.communicationScore,
          confidenceScore: report.confidenceScore,
          aiFeedback: report.detailedFeedback || report.summary,
          strengths: report.strengths || [],
          weaknesses: report.weaknesses || [],
          recommendations: report.recommendedNextSteps || [],
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: 'result_ready',
          title: 'Interview Results Ready!',
          message: `Your AI interview scored ${report.overallScore}%. View detailed feedback.`,
          link: `/candidate/interview/history`,
        },
      });

      logger.info(`Interview completed: ${req.params.id} with score ${report.overallScore}`);

      return res.json({
        completed: true,
        evaluation,
        report,
        totalQuestions: questionCount,
        duration,
      });
    }

    // Generate next question
    const nextQuestion = await generateFollowUp({
      category: config.category || 'General',
      difficulty: config.difficulty || 'Intermediate',
      type: config.type || 'Mixed',
      previousQuestion: question,
      previousAnswer: answer || transcript || '',
      score: evaluation.overallScore,
      conversationHistory,
    });

    res.json({
      completed: false,
      evaluation,
      nextQuestion,
      nextQuestionIndex: questionIndex + 1,
    });
  } catch (error) {
    next(error);
  }
});

// ========== COMPLETE INTERVIEW ==========
router.post('/:id/complete', async (req, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, candidateId: req.user.id, status: 'IN_PROGRESS' },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found or not in progress.' });
    }

    const duration = Math.floor((Date.now() - new Date(interview.startedAt).getTime()) / 1000);
    const config = JSON.parse(interview.notes || '{}');
    const evaluations = config.evaluations || [];
    const answers = await prisma.interviewAnswer.findMany({
      where: { interviewId: req.params.id },
      orderBy: { orderIndex: 'asc' },
    });

    const transcriptHistory = answers.map(a => ({
      role: 'user',
      content: a.answer || '',
    }));

    // Generate final report
    const report = await generateReport({
      transcript: transcriptHistory,
      evaluations,
      communicationMetrics: {
        totalSpeakingTime: 0,
        avgResponseLength: 0,
        fillerWords: [],
        fillerWordCount: 0,
        avgWordsPerMinute: 0,
      },
      config,
      totalDuration: duration,
    });

    await prisma.interview.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED', completedAt: new Date(), duration },
    });

    await prisma.interviewResult.create({
      data: {
        interviewId: req.params.id,
        userId: req.user.id,
        overallScore: report.overallScore,
        technicalScore: report.technicalScore,
        communicationScore: report.communicationScore,
        confidenceScore: report.confidenceScore,
        aiFeedback: report.detailedFeedback || report.summary,
        strengths: report.strengths || [],
        weaknesses: report.weaknesses || [],
        recommendations: report.recommendedNextSteps || [],
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'result_ready',
        title: 'Interview Results Ready!',
        message: `Your AI interview scored ${report.overallScore}%.`,
        link: `/candidate/interview/history`,
      },
    });

    logger.info(`Interview completed: ${req.params.id} with score ${report.overallScore}`);

    res.json({ message: 'Interview completed!', report, duration });
  } catch (error) {
    next(error);
  }
});

// ========== GET INTERVIEW DETAILS (with full result) ==========
router.get('/:id', async (req, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { candidateId: req.user.id },
          { recruiterId: req.user.id },
        ],
      },
      include: {
        answers: { orderBy: { orderIndex: 'asc' } },
        result: true,
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const config = JSON.parse(interview.notes || '{}');

    res.json({
      interview: {
        id: interview.id,
        status: interview.status,
        startedAt: interview.startedAt,
        completedAt: interview.completedAt,
        duration: interview.duration,
        config: {
          category: config.category,
          difficulty: config.difficulty,
          type: config.type,
        },
        answers: interview.answers,
        result: interview.result,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET INTERVIEW HISTORY ==========
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    const where = req.user.role === 'CANDIDATE'
      ? { candidateId: userId }
      : { recruiterId: userId };

    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          result: {
            select: { overallScore: true, technicalScore: true, communicationScore: true, confidenceScore: true, createdAt: true },
          },
          _count: { select: { answers: true } },
        },
      }),
      prisma.interview.count({ where }),
    ]);

    const mapped = interviews.map(i => {
      const config = JSON.parse(i.notes || '{}');
      return {
        id: i.id,
        status: i.status,
        category: config.category,
        difficulty: config.difficulty,
        type: config.type,
        questionCount: config.questionCount || i._count.answers,
        startedAt: i.startedAt,
        completedAt: i.completedAt,
        duration: i.duration,
        result: i.result,
      };
    });

    res.json({
      data: mapped,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
