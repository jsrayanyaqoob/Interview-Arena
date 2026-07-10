const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash a password using bcrypt
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (payload, expiresIn) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Sanitize user object (remove sensitive fields)
 */
const sanitizeUser = (user) => {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};

/**
 * Generate a random password
 */
const generateRandomPassword = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Calculate profile completion percentage
 */
const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  const fields = [
    'phone', 'location', 'title', 'bio',
    'resumeUrl', 'portfolioUrl', 'githubUrl', 'linkedinUrl',
  ];
  const filled = fields.filter(f => profile[f]).length;
  const skillsScore = (profile.skills?.length || 0) > 0 ? 10 : 0;
  const certScore = (profile.certifications?.length || 0) > 0 ? 10 : 0;
  const expScore = (profile.workExperience?.length || 0) > 0 ? 10 : 0;
  return Math.min(100, Math.round((filled / fields.length) * 70 + skillsScore + certScore + expScore));
};

/**
 * Paginate results
 */
const paginateResults = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return {
    skip: (p - 1) * l,
    take: l,
    page: p,
    limit: l,
  };
};

/**
 * Build paginated response
 */
const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  },
});

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  sanitizeUser,
  generateRandomPassword,
  calculateProfileCompletion,
  paginateResults,
  paginatedResponse,
};
