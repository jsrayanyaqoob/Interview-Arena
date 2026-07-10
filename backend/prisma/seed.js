const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@interviewarena.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@interviewarena.com',
      passwordHash: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
      emailVerified: true,
      lastLoginAt: new Date(),
    },
  });

  // Create recruiter
  const recruiterPassword = await bcrypt.hash('Recruiter@123456', 12);
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@techflow.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'recruiter@techflow.com',
      passwordHash: recruiterPassword,
      name: 'Sarah Chen',
      role: 'RECRUITER',
      emailVerified: true,
      lastLoginAt: new Date(),
      recruiterProfile: {
        create: {
          company: 'TechFlow Inc.',
          position: 'Senior Technical Recruiter',
          phone: '+1 (555) 234-5678',
          bio: 'Experienced technical recruiter specializing in engineering hiring.',
        },
      },
    },
  });

  // Create candidate
  const candidatePassword = await bcrypt.hash('Candidate@123456', 12);
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@email.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'candidate@email.com',
      passwordHash: candidatePassword,
      name: 'Alex Johnson',
      role: 'CANDIDATE',
      emailVerified: true,
      lastLoginAt: new Date(),
      candidateProfile: {
        create: {
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          title: 'Senior Software Engineer',
          bio: 'Full-stack developer with 6+ years of experience building scalable web applications.',
          profileCompletion: 75,
          portfolioUrl: 'https://alexjohnson.dev',
          githubUrl: 'https://github.com/alexjohnson',
          linkedinUrl: 'https://linkedin.com/in/alexjohnson',
          skills: {
            create: [
              { name: 'JavaScript', level: 'Expert', endorsements: 24 },
              { name: 'React', level: 'Expert', endorsements: 20 },
              { name: 'Node.js', level: 'Advanced', endorsements: 18 },
              { name: 'TypeScript', level: 'Advanced', endorsements: 15 },
              { name: 'Python', level: 'Intermediate', endorsements: 10 },
            ],
          },
          certifications: {
            create: [
              { name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', issueDate: new Date('2023-06-15') },
              { name: 'Google Cloud Professional', issuer: 'Google Cloud', issueDate: new Date('2024-01-20') },
            ],
          },
          workExperience: {
            create: [
              {
                company: 'TechFlow Inc.', role: 'Senior Frontend Engineer',
                startDate: new Date('2024-01-01'), current: true,
                description: 'Leading frontend architecture for the main product. Built component library and improved performance by 40%.',
              },
              {
                company: 'WebStack Solutions', role: 'Full Stack Developer',
                startDate: new Date('2022-03-01'), endDate: new Date('2023-12-31'),
                description: 'Developed and maintained multiple client applications. Implemented CI/CD pipelines.',
              },
            ],
          },
        },
      },
    },
  });

  // Create interview templates
  const template1 = await prisma.interviewTemplate.create({
    data: {
      recruiterId: recruiter.id,
      name: 'Full Stack Developer',
      category: 'Engineering',
      difficulty: 'Hard',
      duration: 60,
      status: 'active',
      usageCount: 45,
      rating: 4.8,
      questions: {
        create: [
          { question: 'Implement a function to find the longest palindrome substring', type: 'coding', difficulty: 'Hard', timeLimit: 25, orderIndex: 0, skills: ['Algorithms', 'JavaScript'] },
          { question: 'Design a URL shortening service like TinyURL', type: 'system_design', difficulty: 'Hard', timeLimit: 20, orderIndex: 1, skills: ['System Design', 'Scalability'] },
          { question: 'Describe a challenging project you worked on and how you overcame obstacles', type: 'behavioral', difficulty: 'Medium', timeLimit: 10, orderIndex: 2, skills: ['Communication', 'Problem Solving'] },
        ],
      },
    },
    include: { questions: true },
  });

  const template2 = await prisma.interviewTemplate.create({
    data: {
      recruiterId: recruiter.id,
      name: 'Frontend Engineer',
      category: 'Engineering',
      difficulty: 'Medium',
      duration: 45,
      status: 'active',
      usageCount: 38,
      rating: 4.6,
      questions: {
        create: [
          { question: 'Build a simple React component that fetches and displays data', type: 'coding', difficulty: 'Medium', timeLimit: 20, orderIndex: 0, skills: ['React', 'JavaScript'] },
          { question: 'Explain CSS specificity and how it affects styling', type: 'custom', difficulty: 'Easy', timeLimit: 5, orderIndex: 1, skills: ['CSS'] },
          { question: 'How would you optimize a slow React application?', type: 'behavioral', difficulty: 'Medium', timeLimit: 10, orderIndex: 2, skills: ['Performance', 'React'] },
        ],
      },
    },
    include: { questions: true },
  });

  // Create interviews
  const interview1 = await prisma.interview.create({
    data: {
      candidateId: candidate.id,
      recruiterId: recruiter.id,
      templateId: template1.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-07-10T10:00:00Z'),
      startedAt: new Date('2026-07-10T10:00:00Z'),
      completedAt: new Date('2026-07-10T11:00:00Z'),
      duration: 3600,
      result: {
        create: {
          overallScore: 92,
          technicalScore: 90,
          communicationScore: 88,
          confidenceScore: 85,
          aiFeedback: 'Excellent performance! Alex demonstrated strong problem-solving skills and clear communication. The solution to the palindrome problem was optimal. System design showed good understanding of distributed systems.',
          strengths: ['Algorithm optimization', 'Clear communication', 'System design thinking'],
          weaknesses: ['Could improve on explaining trade-offs', 'Consider edge cases more thoroughly'],
          recommendations: ['Practice distributed system design patterns', 'Review advanced data structures'],
        },
      },
      answers: {
        create: [
          { question: 'Longest Palindromic Substring', answer: 'Used expand around center approach with O(n²) time complexity. Discussed Manacher\'s algorithm for O(n) optimization.', code: 'function longestPalindrome(s) {\n  if (s.length < 2) return s;\n  let start = 0, maxLength = 1;\n  function expandAroundCenter(left, right) {\n    while (left >= 0 && right < s.length && s[left] === s[right]) {\n      if (right - left + 1 > maxLength) {\n        start = left;\n        maxLength = right - left + 1;\n      }\n      left--;\n      right++;\n    }\n  }\n  for (let i = 0; i < s.length; i++) {\n    expandAroundCenter(i, i);\n    expandAroundCenter(i, i + 1);\n  }\n  return s.substring(start, start + maxLength);\n}', score: 95, timeSpent: 1200, orderIndex: 0 },
          { question: 'Design URL Shortener', answer: 'Designed a system using hash-based key generation, database storage, and redirect logic. Discussed scaling with caching and load balancing.', score: 88, timeSpent: 900, orderIndex: 1 },
        ],
      },
    },
  });

  const interview2 = await prisma.interview.create({
    data: {
      candidateId: candidate.id,
      recruiterId: recruiter.id,
      templateId: template2.id,
      status: 'SCHEDULED',
      scheduledAt: new Date('2026-07-18T14:00:00Z'),
    },
  });

  // Create notifications
  await prisma.notification.createMany({
    data: [
      { userId: candidate.id, type: 'result_ready', title: 'Interview Result Available', message: 'Your TechFlow Inc. interview results are now available!', link: '/candidate/performance' },
      { userId: candidate.id, type: 'interview_scheduled', title: 'Upcoming Interview', message: 'Your CloudScale interview is scheduled for July 18th at 2:00 PM.', link: '/candidate/dashboard' },
      { userId: candidate.id, type: 'achievement', title: 'Achievement Unlocked!', message: 'You completed 5 interviews!', link: '/candidate/profile' },
      { userId: recruiter.id, type: 'system', title: 'New Candidate Matched', message: '3 new candidates match your Full Stack Developer position.', link: '/recruiter/dashboard' },
    ],
  });

  // Create achievements
  await prisma.achievement.createMany({
    data: [
      { userId: candidate.id, name: 'First Interview', description: 'Completed your first AI interview', icon: 'star' },
      { userId: candidate.id, name: 'Speed Demon', description: 'Completed an interview in under 30 minutes', icon: 'zap' },
      { userId: candidate.id, name: 'Perfect Score', description: 'Scored 90% or above on an interview', icon: 'trophy' },
    ],
  });

  // Create system logs
  await prisma.systemLog.createMany({
    data: [
      { action: 'USER_REGISTERED', details: { email: 'candidate@email.com', role: 'CANDIDATE' } },
      { action: 'INTERVIEW_COMPLETED', details: { interviewId: interview1.id, score: 92 } },
    ],
  });

  console.log('Seed data created successfully!');
  console.log('---');
  console.log('Admin: admin@interviewarena.com / Admin@123456');
  console.log('Recruiter: recruiter@techflow.com / Recruiter@123456');
  console.log('Candidate: candidate@email.com / Candidate@123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
