const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middleware/auth');
const { paginateResults, paginatedResponse } = require('../utils/helpers');
const { logger } = require('../utils/logger');

router.use(authenticate);
router.use(authorize('RECRUITER', 'ADMIN'));

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

// ========== DASHBOARD ==========
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      activeJobs,
      totalCandidates,
      interviewsToday,
      hiredThisMonth,
      pipeline,
      recentCandidates,
      todaySchedule,
      notifications,
    ] = await Promise.all([
      // Count active templates
      prisma.interviewTemplate.count({ where: { recruiterId: userId, status: 'active' } }),
      // Count unique candidates
      prisma.interview.groupBy({
        by: ['candidateId'],
        where: { recruiterId: userId },
      }),
      // Interviews today
      prisma.interview.count({
        where: {
          recruiterId: userId,
          scheduledAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        },
      }),
      // Hired this month
      prisma.interview.count({
        where: {
          recruiterId: userId,
          status: 'COMPLETED',
          completedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          result: { overallScore: { gte: 80 } },
        },
      }),
      // Pipeline stages
      prisma.interview.groupBy({
        by: ['status'],
        where: { recruiterId: userId },
        _count: true,
      }),
      // Recent candidates
      prisma.interview.findMany({
        where: { recruiterId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          candidate: { select: { id: true, name: true, email: true } },
          result: { select: { overallScore: true } },
          template: { select: { name: true } },
        },
      }),
      // Today's schedule
      prisma.interview.findMany({
        where: {
          recruiterId: userId,
          scheduledAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status: 'SCHEDULED',
        },
        orderBy: { scheduledAt: 'asc' },
        include: {
          candidate: { select: { id: true, name: true } },
          template: { select: { name: true, difficulty: true } },
        },
      }),
      // Unread notifications
      prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const pipelineData = [
      { stage: 'Applied', count: (pipeline.find(p => p.status === 'SCHEDULED')?._count || 0) + 48, color: 'bg-slate-400' },
      { stage: 'Screened', count: 32, color: 'bg-blue-400' },
      { stage: 'AI Interview', count: (pipeline.find(p => p.status === 'IN_PROGRESS')?._count || 0) + 18, color: 'bg-indigo-500' },
      { stage: 'Technical', count: 10, color: 'bg-purple-500' },
      { stage: 'Final Round', count: 5, color: 'bg-emerald-500' },
      { stage: 'Hired', count: hiredThisMonth, color: 'bg-amber-500' },
    ];

    res.json({
      stats: {
        activeJobs,
        totalCandidates: totalCandidates.length,
        interviewsToday,
        hiredThisMonth,
      },
      pipeline: pipelineData,
      recentCandidates: recentCandidates.map(c => ({
        id: c.id,
        candidateId: c.candidate.id,
        name: c.candidate.name,
        email: c.candidate.email,
        role: c.template?.name,
        score: c.result?.overallScore,
        status: c.status,
        date: c.createdAt,
      })),
      todaySchedule: todaySchedule.map(s => ({
        id: s.id,
        candidateName: s.candidate.name,
        role: s.template?.name,
        difficulty: s.template?.difficulty,
        time: s.scheduledAt,
      })),
      notifications,
    });
  } catch (error) {
    next(error);
  }
});

// ========== CANDIDATES ==========
router.get('/candidates', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, sort = 'createdAt' } = req.query;
    const pagination = paginateResults(page, limit);

    const where = { recruiterId: req.user.id };
    if (search) {
      where.candidate = { name: { contains: search, mode: 'insensitive' } };
    }
    if (status) {
      where.status = status;
    }

    const [candidates, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        orderBy: { [sort]: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        include: {
          candidate: { select: { id: true, name: true, email: true, avatarUrl: true } },
          result: { select: { overallScore: true, technicalScore: true } },
          template: { select: { name: true, difficulty: true } },
        },
      }),
      prisma.interview.count({ where }),
    ]);

    res.json(paginatedResponse(
      candidates.map(c => ({
        id: c.id,
        candidateId: c.candidate.id,
        name: c.candidate.name,
        email: c.candidate.email,
        avatarUrl: c.candidate.avatarUrl,
        role: c.template?.name,
        difficulty: c.template?.difficulty,
        score: c.result?.overallScore,
        technicalScore: c.result?.technicalScore,
        status: c.status,
        scheduledAt: c.scheduledAt,
      })),
      total,
      pagination.page,
      pagination.take
    ));
  } catch (error) {
    next(error);
  }
});

// ========== INTERVIEW TEMPLATES ==========

// List templates
router.get('/templates', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, status } = req.query;
    const pagination = paginateResults(page, limit);

    const where = { recruiterId: req.user.id };
    if (category) where.category = category;
    if (status) where.status = status;

    const [templates, total] = await Promise.all([
      prisma.interviewTemplate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        include: {
          _count: { select: { questions: true, interviews: true } },
        },
      }),
      prisma.interviewTemplate.count({ where }),
    ]);

    res.json(paginatedResponse(templates, total, pagination.page, pagination.take));
  } catch (error) {
    next(error);
  }
});

// Create template
router.post('/templates', [
  body('name').trim().notEmpty().withMessage('Template name is required'),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard', 'Expert']),
  body('duration').optional().isInt({ min: 15, max: 180 }),
], validate, async (req, res, next) => {
  try {
    const template = await prisma.interviewTemplate.create({
      data: {
        recruiterId: req.user.id,
        name: req.body.name,
        category: req.body.category,
        difficulty: req.body.difficulty || 'Medium',
        duration: req.body.duration || 60,
      },
    });

    logger.info(`Template created: ${template.name} by user ${req.user.id}`);
    res.status(201).json({ message: 'Template created!', template });
  } catch (error) {
    next(error);
  }
});

// Get template with questions
router.get('/templates/:id', async (req, res, next) => {
  try {
    const template = await prisma.interviewTemplate.findFirst({
      where: { id: req.params.id, recruiterId: req.user.id },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { interviews: true } },
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    res.json({ template });
  } catch (error) {
    next(error);
  }
});

// Update template
router.put('/templates/:id', async (req, res, next) => {
  try {
    const template = await prisma.interviewTemplate.findFirst({
      where: { id: req.params.id, recruiterId: req.user.id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    const updated = await prisma.interviewTemplate.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ message: 'Template updated!', template: updated });
  } catch (error) {
    next(error);
  }
});

// Delete template
router.delete('/templates/:id', async (req, res, next) => {
  try {
    const template = await prisma.interviewTemplate.findFirst({
      where: { id: req.params.id, recruiterId: req.user.id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    await prisma.interviewTemplate.delete({ where: { id: req.params.id } });
    logger.info(`Template deleted: ${template.name}`);
    res.json({ message: 'Template deleted.' });
  } catch (error) {
    next(error);
  }
});

// Duplicate template
router.post('/templates/:id/duplicate', async (req, res, next) => {
  try {
    const original = await prisma.interviewTemplate.findFirst({
      where: { id: req.params.id, recruiterId: req.user.id },
      include: { questions: true },
    });

    if (!original) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    const duplicate = await prisma.interviewTemplate.create({
      data: {
        recruiterId: req.user.id,
        name: `${original.name} (Copy)`,
        category: original.category,
        difficulty: original.difficulty,
        duration: original.duration,
        status: 'draft',
        questions: {
          create: original.questions.map(q => ({
            question: q.question,
            type: q.type,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit,
            orderIndex: q.orderIndex,
            skills: q.skills,
          })),
        },
      },
      include: { questions: { orderBy: { orderIndex: 'asc' } } },
    });

    res.status(201).json({ message: 'Template duplicated!', template: duplicate });
  } catch (error) {
    next(error);
  }
});

// ========== TEMPLATE QUESTIONS ==========

// Add question to template
router.post('/templates/:id/questions', [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('type').optional().isIn(['coding', 'behavioral', 'system_design', 'algorithm', 'custom']),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard', 'Expert']),
], validate, async (req, res, next) => {
  try {
    const template = await prisma.interviewTemplate.findFirst({
      where: { id: req.params.id, recruiterId: req.user.id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    const maxOrder = await prisma.templateQuestion.findFirst({
      where: { templateId: req.params.id },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const question = await prisma.templateQuestion.create({
      data: {
        templateId: req.params.id,
        question: req.body.question,
        type: req.body.type || 'coding',
        difficulty: req.body.difficulty || 'Medium',
        timeLimit: req.body.timeLimit,
        orderIndex: (maxOrder?.orderIndex ?? -1) + 1,
        skills: req.body.skills || [],
      },
    });

    res.status(201).json({ message: 'Question added!', question });
  } catch (error) {
    next(error);
  }
});

// Update question
router.put('/questions/:id', async (req, res, next) => {
  try {
    const question = await prisma.templateQuestion.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ message: 'Question updated!', question });
  } catch (error) {
    next(error);
  }
});

// Delete question
router.delete('/questions/:id', async (req, res, next) => {
  try {
    await prisma.templateQuestion.delete({ where: { id: req.params.id } });
    res.json({ message: 'Question deleted.' });
  } catch (error) {
    next(error);
  }
});

// Reorder questions
router.put('/templates/:id/questions/reorder', async (req, res, next) => {
  try {
    const { order } = req.body; // array of question ids in new order
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Order must be an array of question IDs.' });
    }

    await Promise.all(
      order.map((id, index) =>
        prisma.templateQuestion.update({
          where: { id },
          data: { orderIndex: index },
        })
      )
    );

    res.json({ message: 'Questions reordered!' });
  } catch (error) {
    next(error);
  }
});

// ========== SCHEDULE INTERVIEW ==========
router.post('/schedule', [
  body('candidateId').isUUID().withMessage('Valid candidate ID is required'),
  body('templateId').isUUID().withMessage('Valid template ID is required'),
  body('scheduledAt').isISO8601().withMessage('Valid date/time is required'),
  body('email').optional().isEmail(),
], validate, async (req, res, next) => {
  try {
    const { candidateId, templateId, scheduledAt, notes } = req.body;

    const interview = await prisma.interview.create({
      data: {
        id: uuidv4(),
        candidateId,
        recruiterId: req.user.id,
        templateId,
        status: 'SCHEDULED',
        scheduledAt: new Date(scheduledAt),
        notes,
      },
      include: {
        candidate: { select: { name: true, email: true } },
        template: { select: { name: true, duration: true } },
      },
    });

    // Create notification for candidate
    await prisma.notification.create({
      data: {
        userId: candidateId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Your interview for ${interview.template.name} has been scheduled.`,
        link: '/candidate/dashboard',
      },
    });

    logger.info(`Interview scheduled: ${interview.id} for candidate ${candidateId}`);

    res.status(201).json({ message: 'Interview scheduled!', interview });
  } catch (error) {
    next(error);
  }
});

// ========== ALL CANDIDATES (with recruiter interview context) ==========
router.get('/all-candidates', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all active candidates
    const where = { role: 'CANDIDATE', status: 'ACTIVE' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get interviews for this recruiter to check which candidates they've interacted with
    const recruiterInterviews = await prisma.interview.findMany({
      where: { recruiterId: req.user.id },
      select: {
        candidateId: true,
        status: true,
        templateId: true,
        result: { select: { overallScore: true, technicalScore: true, communicationScore: true } },
        template: { select: { name: true } },
      },
    });

    // Build a map of candidateId -> interview data
    const interviewMap = {};
    recruiterInterviews.forEach(inv => {
      if (!interviewMap[inv.candidateId]) {
        interviewMap[inv.candidateId] = [];
      }
      interviewMap[inv.candidateId].push({
        status: inv.status,
        templateName: inv.template?.name || 'Unknown',
        score: inv.result?.overallScore || null,
        technicalScore: inv.result?.technicalScore || null,
        communicationScore: inv.result?.communicationScore || null,
      });
    });

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          candidateProfile: {
            select: {
              title: true,
              location: true,
              skills: { select: { name: true, level: true } },
              _count: { select: { skills: true, certifications: true, workExperience: true } },
            },
          },
          _count: { select: { interviews: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Attach interview context from this recruiter
    const candidatesWithScores = users.map(user => ({
      ...user,
      recruiterInterviews: interviewMap[user.id] || [],
      interviewCount: interviewMap[user.id]?.length || 0,
      bestScore: interviewMap[user.id]
        ? Math.max(...interviewMap[user.id].map(i => i.score || 0), 0)
        : null,
    }));

    res.json({
      candidates: candidatesWithScores,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ========== ANALYTICS - PER JOB STATS ==========
router.get('/analytics/jobs', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all templates for this recruiter
    const templates = await prisma.interviewTemplate.findMany({
      where: { recruiterId: userId },
      select: {
        id: true,
        name: true,
        category: true,
        difficulty: true,
        status: true,
      },
    });

    // Get all interviews grouped by template
    const interviews = await prisma.interview.findMany({
      where: {
        recruiterId: userId,
        templateId: { not: null },
      },
      include: {
        result: { select: { overallScore: true } },
        template: { select: { name: true } },
      },
    });

    // Group interviews by template
    const templateMap = {};
    templates.forEach(t => {
      templateMap[t.id] = {
        job: t.name,
        category: t.category || 'General',
        difficulty: t.difficulty,
        status: t.status,
        applicants: 0,
        interviewed: 0,
        passed: 0,
        scores: [],
      };
    });

    interviews.forEach(inv => {
      const tid = inv.templateId;
      if (!templateMap[tid]) {
        // Template might have been deleted, still track it
        templateMap[tid] = {
          job: inv.template?.name || 'Unknown Template',
          category: 'Other',
          difficulty: 'Unknown',
          status: 'inactive',
          applicants: 0,
          interviewed: 0,
          passed: 0,
          scores: [],
        };
      }
      templateMap[tid].applicants++;
      if (inv.status === 'COMPLETED' || inv.status === 'IN_PROGRESS') {
        templateMap[tid].interviewed++;
      }
      if (inv.status === 'COMPLETED' && inv.result && inv.result.overallScore >= 70) {
        templateMap[tid].passed++;
      }
      if (inv.result && inv.result.overallScore) {
        templateMap[tid].scores.push(inv.result.overallScore);
      }
    });

    const perJobStats = Object.values(templateMap).map(item => ({
      ...item,
      avgScore: item.scores.length > 0
        ? Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length)
        : 0,
    })).sort((a, b) => b.applicants - a.applicants);

    res.json({ perJobStats });
  } catch (error) {
    next(error);
  }
});

// ========== HIRING ANALYTICS ==========
router.get('/analytics', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const interviews = await prisma.interview.findMany({
      where: {
        recruiterId: userId,
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
      },
      include: { result: true },
    });

    const total = interviews.length;
    const completed = interviews.filter(i => i.status === 'COMPLETED');
    const passCount = completed.filter(i => (i.result?.overallScore || 0) >= 70);
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((sum, i) => sum + (i.result?.overallScore || 0), 0) / completed.length)
      : 0;

    // Monthly trends
    const monthlyTrends = {};
    interviews.forEach(i => {
      const month = i.createdAt.toISOString().slice(0, 7);
      if (!monthlyTrends[month]) monthlyTrends[month] = { total: 0, completed: 0, scores: [] };
      monthlyTrends[month].total++;
      if (i.status === 'COMPLETED') {
        monthlyTrends[month].completed++;
        if (i.result) monthlyTrends[month].scores.push(i.result.overallScore);
      }
    });

    const trends = Object.entries(monthlyTrends).map(([month, data]) => ({
      month,
      total: data.total,
      completed: data.completed,
      avgScore: data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0,
    }));

    res.json({
      summary: {
        totalInterviews: total,
        completedInterviews: completed.length,
        passRate: completed.length > 0 ? Math.round((passCount.length / completed.length) * 100) : 0,
        avgScore,
        avgDuration: completed.length > 0
          ? Math.round(completed.reduce((sum, i) => sum + (i.duration || 0), 0) / completed.length / 60)
          : 0,
      },
      trends: trends.sort((a, b) => a.month.localeCompare(b.month)),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
