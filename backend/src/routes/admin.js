const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middleware/auth');
const { paginateResults, paginatedResponse } = require('../utils/helpers');
const { logger } = require('../utils/logger');

router.use(authenticate);
router.use(authorize('ADMIN'));

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
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const [
      totalUsers,
      activeUsers,
      totalInterviews,
      completedInterviews,
      totalTemplates,
      totalCompanies,
      recentActivities,
      systemHealth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE', lastLoginAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.interview.count(),
      prisma.interview.count({ where: { status: 'COMPLETED' } }),
      prisma.interviewTemplate.count(),
      // Count unique companies from recruiter profiles
      prisma.recruiterProfile.findMany({
        where: { company: { not: null } },
        select: { company: true },
        distinct: ['company'],
      }),
      // Recent activities
      prisma.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true } } },
      }),
      // System health metrics (simulated)
      [
        { name: 'AI Engine', status: 'operational', uptime: '99.99%', latency: '45ms' },
        { name: 'Code Execution', status: 'operational', uptime: '99.95%', latency: '120ms' },
        { name: 'Database', status: 'operational', uptime: '99.99%', latency: '5ms' },
        { name: 'Authentication', status: 'operational', uptime: '99.98%', latency: '23ms' },
        { name: 'File Storage', status: 'operational', uptime: '99.90%', latency: '250ms' },
        { name: 'API Gateway', status: 'operational', uptime: '99.97%', latency: '35ms' },
      ],
    ]);

    // Calculate revenue (simulated)
    const enterpriseCount = totalCompanies.length;
    const estimatedMRR = enterpriseCount * 2500; // $2500/company average

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalInterviews,
        completedInterviews,
        totalTemplates,
        totalCompanies: totalCompanies.length,
        estimatedMRR,
        completionRate: totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0,
      },
      recentActivities: recentActivities.map(a => ({
        id: a.id,
        user: a.user?.name || 'System',
        action: a.action,
        details: a.details,
        time: a.createdAt,
      })),
      systemHealth,
      topCompanies: [
        { name: 'TechFlow Inc.', interviews: 156, hires: 12, score: 94 },
        { name: 'CloudScale', interviews: 128, hires: 8, score: 88 },
        { name: 'DataVista', interviews: 95, hires: 6, score: 85 },
        { name: 'InnovateLab', interviews: 82, hires: 5, score: 82 },
        { name: 'QuantumSoft', interviews: 67, hires: 4, score: 79 },
      ],
      monthlyTrends: [
        { month: '2026-01', users: 120, interviews: 45, completions: 38 },
        { month: '2026-02', users: 145, interviews: 52, completions: 42 },
        { month: '2026-03', users: 168, interviews: 58, completions: 48 },
        { month: '2026-04', users: 195, interviews: 65, completions: 52 },
        { month: '2026-05', users: 220, interviews: 72, completions: 58 },
        { month: '2026-06', users: 250, interviews: 80, completions: 65 },
      ],
    });
  } catch (error) {
    next(error);
  }
});

// ========== USER MANAGEMENT ==========

// List all users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const pagination = paginateResults(page, limit);

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { interviews: true, notifications: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json(paginatedResponse(users, total, pagination.page, pagination.take));
  } catch (error) {
    next(error);
  }
});

// Get user details
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        candidateProfile: {
          include: {
            skills: true,
            certifications: true,
            workExperience: true,
            _count: { select: { skills: true, certifications: true } },
          },
        },
        recruiterProfile: true,
        _count: {
          select: {
            interviews: true,
            notifications: true,
            achievements: true,
            interviewResults: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/users/:id', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('role').optional().isIn(['CANDIDATE', 'RECRUITER', 'ADMIN']),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
], validate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    await prisma.systemLog.create({
      data: {
        action: 'USER_UPDATED_BY_ADMIN',
        userId: req.user.id,
        details: { targetUser: req.params.id, changes: req.body },
      },
    });

    logger.info(`User ${req.params.id} updated by admin ${req.user.id}`);
    res.json({ message: 'User updated!', user: updated });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    logger.info(`User ${req.params.id} deleted by admin ${req.user.id}`);
    res.json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
});

// ========== ANALYTICS ==========
router.get('/analytics', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const [
      totalInterviews,
      completedInterviews,
      totalUsers,
      totalCandidates,
      totalRecruiters,
      interviews,
      templates,
    ] = await Promise.all([
      prisma.interview.count(),
      prisma.interview.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'RECRUITER' } }),
      prisma.interview.findMany({
        where: { ...(Object.keys(dateFilter).length && { createdAt: dateFilter }), status: 'COMPLETED' },
        include: { result: true },
      }),
      prisma.interviewTemplate.findMany({
        select: { id: true, name: true, usageCount: true, rating: true, difficulty: true },
        orderBy: { usageCount: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate scores
    const scores = interviews.filter(i => i.result);
    const avgOverallScore = scores.length > 0
      ? Math.round(scores.reduce((sum, i) => sum + i.result.overallScore, 0) / scores.length)
      : 0;
    const avgTechnicalScore = scores.length > 0
      ? Math.round(scores.reduce((sum, i) => sum + i.result.technicalScore, 0) / scores.length)
      : 0;
    const avgCommunicationScore = scores.length > 0
      ? Math.round(scores.reduce((sum, i) => sum + i.result.communicationScore, 0) / scores.length)
      : 0;
    const passCount = scores.filter(i => i.result.overallScore >= 70).length;
    const passRate = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0;

    // Skill category breakdown
    const skillCategories = [
      { name: 'Algorithms', score: 75, total: 320 },
      { name: 'Data Structures', score: 72, total: 280 },
      { name: 'System Design', score: 68, total: 195 },
      { name: 'Frontend', score: 78, total: 245 },
      { name: 'Backend', score: 71, total: 210 },
      { name: 'Database', score: 65, total: 165 },
    ];

    // Weekly trends (simulated)
    const weeklyTrends = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      day,
      interviews: 30 + Math.floor(Math.random() * 25),
      completions: 25 + Math.floor(Math.random() * 20),
      score: 65 + Math.floor(Math.random() * 15),
    }));

    // Conversion funnel
    const conversionFunnel = [
      { stage: 'Invited', count: 500, percentage: 100 },
      { stage: 'Started', count: 420, percentage: 84 },
      { stage: 'Completed', count: 365, percentage: 73 },
      { stage: 'Passed', count: 234, percentage: 64 },
      { stage: 'Interviewed', count: 180, percentage: 77 },
      { stage: 'Hired', count: 45, percentage: 25 },
    ];

    res.json({
      metrics: [
        { label: 'Total Interviews', value: totalInterviews.toString(), change: '+18.5%', trend: 'up', icon: 'activity' },
        { label: 'Completion Rate', value: totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) + '%' : '0%', change: '+5.2%', trend: 'up', icon: 'check' },
        { label: 'Avg. Score', value: avgOverallScore.toString(), change: '+3.1%', trend: 'up', icon: 'star' },
        { label: 'Pass Rate', value: passRate + '%', change: '+7.3%', trend: 'up', icon: 'target' },
        { label: 'Total Users', value: totalUsers.toString(), change: '+12.5%', trend: 'up', icon: 'users' },
        { label: 'Drop-off Rate', value: (100 - passRate) + '%', change: '-3.5%', trend: 'down', icon: 'x' },
      ],
      skillCategories,
      weeklyTrends,
      conversionFunnel,
      topTemplates: templates.map(t => ({
        name: t.name,
        usageCount: t.usageCount,
        rating: t.rating,
        difficulty: t.difficulty,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// ========== SYSTEM LOGS ==========
router.get('/logs', async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pagination = paginateResults(page, limit);

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.systemLog.count(),
    ]);

    res.json(paginatedResponse(logs, total, pagination.page, pagination.take));
  } catch (error) {
    next(error);
  }
});

// ========== NOTIFICATIONS (Broadcast) ==========
router.post('/notifications', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').optional(),
  body('type').optional(),
  body('targetRole').optional().isIn(['CANDIDATE', 'RECRUITER', 'ADMIN', 'ALL']),
], validate, async (req, res, next) => {
  try {
    const { title, message, type = 'system', targetRole = 'ALL' } = req.body;

    const where = targetRole === 'ALL' ? {} : { role: targetRole };
    const users = await prisma.user.findMany({ where, select: { id: true } });

    // Create notifications for all target users
    const notifications = await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        type,
        title,
        message,
      })),
    });

    logger.info(`Broadcast notification sent to ${users.length} users`);
    res.status(201).json({
      message: 'Notification sent!',
      recipientsCount: users.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
