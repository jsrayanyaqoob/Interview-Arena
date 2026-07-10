const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadResume, uploadAvatar, handleUploadError } = require('../middleware/upload');
const { calculateProfileCompletion, paginateResults, paginatedResponse } = require('../utils/helpers');
const { logger } = require('../utils/logger');

// All routes require authentication
router.use(authenticate);
router.use(authorize('CANDIDATE', 'ADMIN'));

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
      profile,
      interviews,
      upcomingInterviews,
      recentResults,
      notifications,
      achievements,
    ] = await Promise.all([
      prisma.candidateProfile.findUnique({
        where: { userId },
        include: {
          skills: true,
          certifications: true,
          workExperience: { orderBy: { startDate: 'desc' } },
          _count: { select: { skills: true } },
        },
      }),
      prisma.interview.findMany({
        where: { candidateId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          result: true,
          template: { select: { name: true } },
          recruiter: { select: { name: true } },
        },
      }),
      prisma.interview.findMany({
        where: { candidateId: userId, status: 'SCHEDULED' },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        include: {
          template: { select: { name: true, difficulty: true } },
          recruiter: { select: { name: true } },
        },
      }),
      prisma.interviewResult.findMany({
        where: { interview: { candidateId: userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          interview: {
            select: {
              id: true,
              template: { select: { name: true } },
              recruiter: { select: { name: true } },
            },
          },
        },
      }),
      prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.achievement.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' },
      }),
    ]);

    // Calculate stats
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');
    const avgScore = completedInterviews.length > 0
      ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.result?.overallScore || 0), 0) / completedInterviews.length)
      : 0;

    // AI Recommendations
    const aiRecommendations = [];
    if (profile?.skills) {
      const skillNames = profile.skills.map(s => s.name.toLowerCase());
      if (!skillNames.includes('typescript')) aiRecommendations.push({ skill: 'TypeScript', reason: 'High demand in current market', priority: 'High' });
      if (!skillNames.includes('docker')) aiRecommendations.push({ skill: 'Docker/Kubernetes', reason: 'Essential for cloud roles', priority: 'Medium' });
      if (!skillNames.includes('graphql')) aiRecommendations.push({ skill: 'GraphQL', reason: 'Growing adoption in tech companies', priority: 'Medium' });
    }

    // Practice categories
    const practiceCategories = [
      { name: 'Algorithms', icon: 'code', questionCount: 45, completedCount: 12 },
      { name: 'Data Structures', icon: 'database', questionCount: 38, completedCount: 8 },
      { name: 'System Design', icon: 'server', questionCount: 20, completedCount: 5 },
      { name: 'Frontend', icon: 'layout', questionCount: 30, completedCount: 10 },
      { name: 'Behavioral', icon: 'users', questionCount: 25, completedCount: 15 },
    ];

    res.json({
      profile: {
        ...profile,
        profileCompletion: calculateProfileCompletion(profile),
      },
      stats: {
        totalInterviews,
        completedInterviews: completedInterviews.length,
        avgScore,
        totalSkills: profile?._count?.skills || 0,
        unreadNotifications: notifications.length,
        achievementsCount: achievements.length,
      },
      upcomingInterviews,
      recentResults,
      aiRecommendations,
      practiceCategories,
      notifications,
      achievements,
      quickActions: [
        { label: 'Start New Interview', icon: 'play', link: '/candidate/interview', color: 'indigo' },
        { label: 'Edit Profile', icon: 'edit', link: '/candidate/profile', color: 'emerald' },
        { label: 'View Performance', icon: 'chart', link: '/candidate/performance', color: 'amber' },
        { label: 'Browse Templates', icon: 'template', link: '/candidate/templates', color: 'purple' },
      ],
    });
  } catch (error) {
    next(error);
  }
});

// ========== PROFILE ==========

// Get profile
router.get('/profile', async (req, res, next) => {
  try {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        skills: { orderBy: { endorsements: 'desc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        workExperience: { orderBy: { startDate: 'desc' } },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please complete registration.' });
    }

    res.json({
      profile: {
        ...profile,
        profileCompletion: calculateProfileCompletion(profile),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', [
  body('phone').optional().trim(),
  body('location').optional().trim(),
  body('title').optional().trim(),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be under 1000 characters'),
  body('portfolioUrl').optional().trim().isURL().withMessage('Invalid URL'),
  body('githubUrl').optional().trim(),
  body('linkedinUrl').optional().trim(),
  body('twitterUrl').optional().trim(),
  body('company').optional().trim(),
], validate, async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) delete updateData[key];
    });

    let profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: { userId: req.user.id, ...updateData },
      });
    } else {
      profile = await prisma.candidateProfile.update({
        where: { userId: req.user.id },
        data: updateData,
      });
    }

    // Recalculate completion
    const fullProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
      include: { skills: true, certifications: true, workExperience: true },
    });

    const completion = calculateProfileCompletion(fullProfile);
    await prisma.candidateProfile.update({
      where: { userId: req.user.id },
      data: { profileCompletion: completion },
    });

    logger.info(`Profile updated for user ${req.user.id}`);

    res.json({
      message: 'Profile updated successfully!',
      profile: { ...profile, profileCompletion: completion },
    });
  } catch (error) {
    next(error);
  }
});

// Upload resume
router.post('/profile/resume', (req, res, next) => {
  uploadResume(req, res, async (err) => {
    if (err) return handleUploadError(err, req, res, next);
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      const resumeUrl = `/uploads/resumes/${req.file.filename}`;

      // Parse resume score (simulated)
      const resumeScore = Math.floor(Math.random() * 30) + 65; // 65-95

      await prisma.candidateProfile.update({
        where: { userId: req.user.id },
        data: { resumeUrl, resumeScore },
      });

      res.json({
        message: 'Resume uploaded successfully!',
        resumeUrl,
        resumeScore,
      });
    } catch (error) {
      next(error);
    }
  });
});

// Upload avatar
router.post('/profile/avatar', (req, res, next) => {
  uploadAvatar(req, res, async (err) => {
    if (err) return handleUploadError(err, req, res, next);
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      await prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl },
      });

      res.json({ message: 'Avatar uploaded successfully!', avatarUrl });
    } catch (error) {
      next(error);
    }
  });
});

// Skills management
router.post('/profile/skills', [
  body('name').trim().notEmpty().withMessage('Skill name is required'),
  body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
], validate, async (req, res, next) => {
  try {
    const { name, level } = req.body;
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });

    const skill = await prisma.skill.create({
      data: { profileId: profile.id, name, level: level || 'Intermediate' },
    });

    res.status(201).json({ message: 'Skill added!', skill });
  } catch (error) {
    next(error);
  }
});

router.delete('/profile/skills/:id', async (req, res, next) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.json({ message: 'Skill removed.' });
  } catch (error) {
    next(error);
  }
});

// Certifications
router.post('/profile/certifications', [
  body('name').trim().notEmpty().withMessage('Certification name is required'),
  body('issuer').trim().notEmpty().withMessage('Issuer is required'),
], validate, async (req, res, next) => {
  try {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    const certification = await prisma.certification.create({
      data: {
        profileId: profile.id,
        ...req.body,
        issueDate: req.body.issueDate ? new Date(req.body.issueDate) : undefined,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
      },
    });
    res.status(201).json({ message: 'Certification added!', certification });
  } catch (error) {
    next(error);
  }
});

// Work Experience
router.post('/profile/experience', [
  body('company').trim().notEmpty(),
  body('role').trim().notEmpty(),
  body('startDate').isISO8601(),
], validate, async (req, res, next) => {
  try {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    const experience = await prisma.workExperience.create({
      data: {
        profileId: profile.id,
        company: req.body.company,
        role: req.body.role,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        current: req.body.current || false,
        description: req.body.description,
      },
    });
    res.status(201).json({ message: 'Experience added!', experience });
  } catch (error) {
    next(error);
  }
});

// ========== PERFORMANCE ==========
router.get('/performance', async (req, res, next) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: { candidateId: req.user.id, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      include: {
        result: true,
        template: { select: { name: true, category: true } },
        recruiter: { select: { name: true } },
      },
    });

    // Calculate category scores
    const categoryScores = {};
    interviews.forEach(i => {
      const cat = i.template?.category || 'General';
      if (!categoryScores[cat]) {
        categoryScores[cat] = { total: 0, count: 0 };
      }
      if (i.result) {
        categoryScores[cat].total += i.result.overallScore;
        categoryScores[cat].count++;
      }
    });

    const skillsBreakdown = Object.entries(categoryScores).map(([name, data]) => ({
      name,
      score: Math.round(data.total / data.count),
      totalInterviews: data.count,
    }));

    // Overall stats
    const results = interviews.filter(i => i.result);
    const overallScore = results.length > 0
      ? Math.round(results.reduce((sum, i) => sum + i.result.overallScore, 0) / results.length)
      : 0;
    const technicalScore = results.length > 0
      ? Math.round(results.reduce((sum, i) => sum + i.result.technicalScore, 0) / results.length)
      : 0;
    const communicationScore = results.length > 0
      ? Math.round(results.reduce((sum, i) => sum + i.result.communicationScore, 0) / results.length)
      : 0;
    const confidenceScore = results.length > 0
      ? Math.round(results.reduce((sum, i) => sum + i.result.confidenceScore, 0) / results.length)
      : 0;

    // Skill gaps based on weaknesses
    const skillGaps = [];
    const weaknessCount = {};
    results.forEach(r => {
      r.result.weaknesses?.forEach(w => {
        weaknessCount[w] = (weaknessCount[w] || 0) + 1;
      });
    });
    Object.entries(weaknessCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([skill, count]) => {
        skillGaps.push({
          skill,
          demand: count > 2 ? 'High' : 'Medium',
          currentLevel: Math.max(30, 100 - count * 15),
          priority: count > 2 ? 'high' : 'medium',
        });
      });

    res.json({
      overallScore,
      technicalScore,
      communicationScore,
      confidenceScore,
      totalInterviews: interviews.length,
      skillsBreakdown,
      skillGaps,
      recentInterviews: interviews.slice(0, 10).map(i => ({
        id: i.id,
        company: i.recruiter?.name || 'Unknown Company',
        template: i.template?.name,
        score: i.result?.overallScore,
        duration: i.duration,
        date: i.completedAt,
        strengths: i.result?.strengths || [],
        improvements: i.result?.weaknesses || [],
      })),
      percentileRankings: {
        overall: Math.min(99, 70 + Math.floor(Math.random() * 25)),
        technical: Math.min(99, 65 + Math.floor(Math.random() * 30)),
        communication: Math.min(99, 75 + Math.floor(Math.random() * 20)),
        problemSolving: Math.min(99, 80 + Math.floor(Math.random() * 15)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ========== NOTIFICATIONS ==========
router.get('/notifications', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pagination = paginateResults(page, limit);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
    ]);

    res.json(paginatedResponse(notifications, total, pagination.page, pagination.take));
  } catch (error) {
    next(error);
  }
});

router.put('/notifications/:id/read', async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
});

router.put('/notifications/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
