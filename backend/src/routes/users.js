const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ========== PUBLIC USER DIRECTORY ==========
// No auth required — returns basic public profile info

router.get('/', async (req, res, next) => {
  try {
    const { role = 'CANDIDATE', page = 1, limit = 50, search } = req.query;

    if (!['CANDIDATE', 'RECRUITER'].includes(role)) {
      return res.status(400).json({ error: 'Role must be CANDIDATE or RECRUITER' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { role, status: 'ACTIVE' };
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
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          candidateProfile: role === 'CANDIDATE' ? {
            select: {
              title: true,
              skills: { select: { name: true, level: true } },
              _count: { select: { skills: true, certifications: true } },
            },
          } : undefined,
          recruiterProfile: role === 'RECRUITER' ? {
            select: { company: true, position: true },
          } : undefined,
          _count: { select: { interviews: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
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

// ========== PUBLIC USER DETAIL ==========
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        candidateProfile: {
          select: {
            title: true,
            bio: true,
            skills: { select: { name: true, level: true } },
            certifications: { select: { name: true, issuer: true, issueDate: true } },
            workExperience: { select: { company: true, role: true, startDate: true, endDate: true, description: true } },
            _count: { select: { skills: true, certifications: true, workExperience: true } },
          },
        },
        recruiterProfile: {
          select: {
            company: true,
            position: true,
            bio: true,
            _count: { select: { interviews: true } },
          },
        },
        _count: {
          select: {
            interviews: true,
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

module.exports = router;
