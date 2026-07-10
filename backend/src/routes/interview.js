const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();
const { authenticate } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const { recordAnalyticsEvent, storeInterviewSession } = require('../utils/dynamodb');

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

// ========== GET TEMPLATES FOR CANDIDATE ==========
router.get('/templates', async (req, res, next) => {
  try {
    const templates = await prisma.interviewTemplate.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        category: true,
        difficulty: true,
        duration: true,
        rating: true,
        usageCount: true,
        _count: { select: { questions: true } },
      },
      orderBy: { usageCount: 'desc' },
      take: 20,
    });

    res.json({ templates });
  } catch (error) {
    next(error);
  }
});

// ========== START INTERVIEW ==========
router.post('/start', [
  body('templateId').optional().isUUID().withMessage('Valid template ID is required'),
], validate, async (req, res, next) => {
  try {
    const { templateId } = req.body;

    let template = null;
    if (templateId) {
      template = await prisma.interviewTemplate.findUnique({
        where: { id: templateId },
        include: {
          questions: { orderBy: { orderIndex: 'asc' } },
        },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found.' });
      }
    }

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        id: uuidv4(),
        candidateId: req.user.id,
        templateId: template?.id,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        duration: template?.duration ? template.duration * 60 : 3600,
      },
    });

    logger.info(`Interview started: ${interview.id} by user ${req.user.id}`);

    res.status(201).json({
      interview: {
        id: interview.id,
        status: interview.status,
        startedAt: interview.startedAt,
        duration: interview.duration,
        template: template ? {
          name: template.name,
          difficulty: template.difficulty,
          totalDuration: template.duration,
          questions: template.questions.map((q, i) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit,
            orderIndex: q.orderIndex || i,
            skills: q.skills,
          })),
        } : null,
      },
      totalQuestions: template?.questions?.length || 0,
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET INTERVIEW DETAILS ==========
router.get('/:id', async (req, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { candidateId: req.user.id },
          { recruiterId: req.user.id },
          { recruiter: { role: 'ADMIN' } },
        ],
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            difficulty: true,
            duration: true,
            questions: { orderBy: { orderIndex: 'asc' }, select: { id: true, question: true, type: true, difficulty: true, timeLimit: true, orderIndex: true } },
          },
        },
        answers: { orderBy: { orderIndex: 'asc' } },
        result: true,
        candidate: { select: { id: true, name: true, email: true, avatarUrl: true } },
        recruiter: { select: { id: true, name: true } },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    res.json({ interview });
  } catch (error) {
    next(error);
  }
});

// ========== SUBMIT ANSWER ==========
router.post('/:id/answers', [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').optional(),
  body('code').optional(),
  body('timeSpent').optional().isInt({ min: 0 }),
], validate, async (req, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, candidateId: req.user.id, status: 'IN_PROGRESS' },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found or not in progress.' });
    }

    const maxOrder = await prisma.interviewAnswer.findFirst({
      where: { interviewId: req.params.id },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const answer = await prisma.interviewAnswer.create({
      data: {
        interviewId: req.params.id,
        question: req.body.question,
        answer: req.body.answer,
        code: req.body.code,
        timeSpent: req.body.timeSpent,
        orderIndex: (maxOrder?.orderIndex ?? -1) + 1,
      },
    });

    res.status(201).json({ message: 'Answer submitted!', answer });
  } catch (error) {
    next(error);
  }
});

// ========== COMPLETE INTERVIEW ==========
router.post('/:id/complete', async (req, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, candidateId: req.user.id, status: 'IN_PROGRESS' },
      include: {
        answers: true,
        template: { include: { questions: true } },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found or not in progress.' });
    }

    // Calculate actual duration
    const duration = Math.floor((Date.now() - new Date(interview.startedAt).getTime()) / 1000);

    // Simulate AI scoring
    const technicalScore = Math.min(100, 65 + Math.floor(Math.random() * 30));
    const communicationScore = Math.min(100, 70 + Math.floor(Math.random() * 25));
    const confidenceScore = Math.min(100, 60 + Math.floor(Math.random() * 35));
    const overallScore = Math.round((technicalScore + communicationScore + confidenceScore) / 3);

    // Generate AI feedback
    const strengths = [
      'Clear problem-solving approach',
      'Good code organization',
      'Effective communication of ideas',
      'Strong algorithmic thinking',
      'Considers edge cases',
      'Efficient solution design',
      'Good use of data structures',
    ];

    const weaknesses = [
      'Could improve on explaining trade-offs',
      'Consider time complexity more carefully',
      'Add more comments to code',
      'Practice system design patterns',
      'Review advanced algorithms',
    ];

    const selectedStrengths = strengths.sort(() => 0.5 - Math.random()).slice(0, 3);
    const selectedWeaknesses = weaknesses.sort(() => 0.5 - Math.random()).slice(0, 2);

    const aiFeedback = `Great effort! You demonstrated ${selectedStrengths[0].toLowerCase()} and ${selectedStrengths[1].toLowerCase()}. To improve further, focus on ${selectedWeaknesses[0].toLowerCase()}.`;

    // Create result
    const result = await prisma.interviewResult.create({
      data: {
        interviewId: req.params.id,
        overallScore,
        technicalScore,
        communicationScore,
        confidenceScore,
        aiFeedback,
        strengths: selectedStrengths,
        weaknesses: selectedWeaknesses,
        recommendations: [
          'Practice more coding challenges on platforms like LeetCode',
          'Review system design patterns and distributed systems',
          'Work on communication of complex technical concepts',
          'Study time complexity analysis for algorithms',
        ],
      },
    });

    // Update interview
    await prisma.interview.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        duration,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'result_ready',
        title: 'Interview Results Ready!',
        message: `Your AI interview has been scored. Overall score: ${overallScore}%`,
        link: `/candidate/performance`,
      },
    });

    // Update template usage count
    if (interview.templateId) {
      await prisma.interviewTemplate.update({
        where: { id: interview.templateId },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Store in DynamoDB for analytics (non-blocking)
    recordAnalyticsEvent('interview_completed', {
      interviewId: req.params.id,
      candidateId: req.user.id,
      templateId: interview.templateId,
      overallScore,
      technicalScore,
      communicationScore,
      confidenceScore,
    }).catch(err => logger.warn('Failed to record analytics event:', err.message));

    storeInterviewSession(req.params.id, {
      candidateId: req.user.id,
      templateId: interview.templateId,
      scores: { overallScore, technicalScore, communicationScore, confidenceScore },
      duration,
      completedAt: new Date().toISOString(),
    }).catch(err => logger.warn('Failed to store interview session:', err.message));

    logger.info(`Interview completed: ${req.params.id} with score ${overallScore}`);

    res.json({
      message: 'Interview completed!',
      result: {
        overallScore,
        technicalScore,
        communicationScore,
        confidenceScore,
        aiFeedback,
        strengths: selectedStrengths,
        weaknesses: selectedWeaknesses,
        duration,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ========== PAUSE / RESUME INTERVIEW ==========
router.post('/:id/pause', async (req, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, candidateId: req.user.id, status: 'IN_PROGRESS' },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    await prisma.interview.update({
      where: { id: req.params.id },
      data: {
        status: 'PAUSED',
        pauseCount: { increment: 1 },
      },
    });

    res.json({ message: 'Interview paused.' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/resume', async (req, res, next) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, candidateId: req.user.id, status: 'PAUSED' },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found or not paused.' });
    }

    await prisma.interview.update({
      where: { id: req.params.id },
      data: { status: 'IN_PROGRESS' },
    });

    res.json({ message: 'Interview resumed.' });
  } catch (error) {
    next(error);
  }
});

// ========== GET INTERVIEW HISTORY ==========
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    const where = req.user.role === 'CANDIDATE'
      ? { candidateId: userId }
      : { recruiterId: userId };

    if (status) where.status = status;

    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          template: { select: { name: true, difficulty: true } },
          result: { select: { overallScore: true, technicalScore: true, communicationScore: true } },
          candidate: req.user.role !== 'CANDIDATE' ? { select: { id: true, name: true, email: true } } : undefined,
          recruiter: req.user.role === 'CANDIDATE' ? { select: { name: true } } : undefined,
        },
      }),
      prisma.interview.count({ where }),
    ]);

    res.json({
      data: interviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
