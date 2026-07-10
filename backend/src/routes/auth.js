const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  sanitizeUser,
} = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Validation middleware
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

// ========== REGISTER ==========
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').isIn(['CANDIDATE', 'RECRUITER']).withMessage('Role must be CANDIDATE or RECRUITER'),
], validate, async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Auto-assign ADMIN for the owner email
    const finalRole = email === 'rayanyaqoob83@gmail.com' ? 'ADMIN' : role;

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        passwordHash,
        name,
        role: finalRole,
        emailVerified: false,
        candidateProfile: finalRole === 'CANDIDATE' ? { create: {} } : undefined,
        recruiterProfile: finalRole === 'RECRUITER' ? { create: { company: req.body.company || '', position: '' } } : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Log action
    await prisma.systemLog.create({
      data: {
        action: 'USER_REGISTERED',
        userId: user.id,
        details: { email, role },
      },
    });

    logger.info(`New user registered: ${email} as ${role}`);

    res.status(201).json({
      message: 'Account created successfully!',
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// ========== LOGIN ==========
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], validate, async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        candidateProfile: { select: { profileCompletion: true } },
        recruiterProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
    }

    // Verify password
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        rememberMe: !!rememberMe,
      },
    });

    // Log login
    await prisma.systemLog.create({
      data: {
        action: 'USER_LOGIN',
        userId: user.id,
        details: { email, ip: req.ip },
      },
    });

    // Generate tokens
    const expiresIn = rememberMe ? '30d' : '7d';
    const token = generateToken({ id: user.id, email: user.email, role: user.role }, expiresIn);
    const refreshToken = generateRefreshToken({ id: user.id });

    const userData = sanitizeUser(user);

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful!',
      user: userData,
      profileCompletion: user.candidateProfile?.profileCompletion || 0,
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// ========== REFRESH TOKEN ==========
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
], validate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const newToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
});

// ========== GET PROFILE (after login) ==========
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        candidateProfile: {
          include: {
            skills: true,
            certifications: true,
            workExperience: { orderBy: { startDate: 'desc' } },
          },
        },
        recruiterProfile: true,
        _count: {
          select: {
            notifications: { where: { read: false } },
            achievements: true,
            interviews: { where: { candidateId: req.user.id } },
          },
        },
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// ========== FORGOT PASSWORD ==========
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
], validate, async (req, res, next) => {
  try {
    const { email } = req.body;

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // In production, send email with reset link
      const resetToken = generateToken({ id: user.id, purpose: 'password_reset' }, '1h');
      logger.info(`Password reset requested for ${email}. Token: ${resetToken}`);
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
});

// ========== RESET PASSWORD ==========
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
], validate, async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const decoded = require('../utils/helpers').verifyToken(token);

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid reset token.' });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash },
    });

    await prisma.systemLog.create({
      data: {
        action: 'PASSWORD_RESET',
        userId: decoded.id,
        details: {},
      },
    });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid or expired reset token.' });
  }
});

// ========== CHANGE PASSWORD (authenticated) ==========
router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
], validate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { passwordHash: true },
    });

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    await prisma.systemLog.create({
      data: {
        action: 'PASSWORD_CHANGED',
        userId: req.user.id,
        details: {},
      },
    });

    logger.info(`Password changed for user ${req.user.id}`);
    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
