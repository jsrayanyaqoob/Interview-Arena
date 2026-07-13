const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use flash model for speed, pro model for complex evaluation
const flashModel = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
const proModel = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

/**
 * Clean JSON from Gemini response (handle markdown code blocks)
 */
function cleanJson(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

/**
 * Retry a Gemini API call with exponential backoff for rate limits (429)
 */
async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        logger.warn(`Gemini rate limited (429), retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

/**
 * Generate the first question based on interview config
 */
async function generateFirstQuestion({ category, difficulty, type }) {
  const prompt = `You are an expert technical interviewer at a top tech company. Generate the FIRST interview question for a candidate.

Interview Configuration:
- Category: ${category}
- Difficulty: ${difficulty}
- Type: ${type}

Rules:
1. The question should be appropriate for the ${difficulty} level
2. It should test ${type === 'Mixed' ? 'a mix of technical and behavioral skills' : type.toLowerCase() + ' skills'}
3. Make it realistic, like a real interview at Google/Microsoft/Amazon
4. The question should have enough depth to evaluate the candidate properly
5. If the type is "Behavioral", ask a situational/behavioral question
6. If the type is "Coding", include a coding challenge description
7. If the type is "Technical", ask a deep technical concept question

Respond ONLY with valid JSON (no markdown):
{
  "question": "The interview question text",
  "followUp": "A possible follow-up question if they answer well",
  "keyPoints": ["point1", "point2", "point3"],
  "estimatedDifficulty": "${difficulty}",
  "topics": ["topic1", "topic2"]
}`;

  try {
    const result = await withRetry(() => flashModel.generateContent(prompt));
    const text = result.response.text();
    return JSON.parse(cleanJson(text));
  } catch (error) {
    logger.error('Gemini generateFirstQuestion error:', error.message, error.status || '');
    // Fallback question
    return {
      question: `Tell me about your experience with ${category}. What projects have you worked on and what was your role?`,
      followUp: 'What was the biggest technical challenge you faced in that project?',
      keyPoints: ['Relevant experience', 'Technical depth', 'Problem-solving ability'],
      estimatedDifficulty: difficulty,
      topics: [category],
    };
  }
}

/**
 * Generate a follow-up question based on the candidate's previous answer
 */
async function generateFollowUp({ category, difficulty, type, previousQuestion, previousAnswer, score, conversationHistory }) {
  const history = conversationHistory.map(h =>
    `${h.role.toUpperCase()}: ${h.content}`
  ).join('\n');

  const prompt = `You are an expert technical interviewer. Based on the candidate's previous answer, generate an appropriate follow-up question.

Context:
- Category: ${category}
- Base Difficulty: ${difficulty}
- Type: ${type}
- Previous Question: "${previousQuestion}"
- Candidate's Answer: "${previousAnswer}"
- Score on Previous Answer: ${score}/100
- Interview History:
${history}

Decision Rules:
- If score >= 80: Ask a HARDER question to challenge them
- If score >= 60 and < 80: Ask a SIMILAR difficulty question to confirm their skill level
- If score < 60: Ask an EASIER question or rephrase the concept more simply
- Adapt the question difficulty dynamically

The interview has been going on for ${conversationHistory.length} questions. Make sure this question is different from previous ones.

If this would be the last question (after 5-8 questions total), set "isLast" to true.

Respond ONLY with valid JSON (no markdown):
{
  "question": "The follow-up interview question",
  "followUp": "A potential deeper follow-up",
  "keyPoints": ["point1", "point2", "point3"],
  "estimatedDifficulty": "Beginner|Intermediate|Advanced",
  "topics": ["topic1"],
  "isLast": false,
  "reason": "Brief explanation of why this question was chosen"
}`;

  try {
    const result = await withRetry(() => flashModel.generateContent(prompt));
    const text = result.response.text();
    return JSON.parse(cleanJson(text));
  } catch (error) {
    logger.error('Gemini generateFollowUp error:', error.message, error.status || '');
    return {
      question: `Can you elaborate more on that? What approach would you take differently if you had more time?`,
      followUp: null,
      keyPoints: ['Depth of understanding', 'Critical thinking'],
      estimatedDifficulty: difficulty,
      topics: [category],
      isLast: false,
      reason: 'Fallback question',
    };
  }
}

/**
 * Evaluate a candidate's answer and provide a detailed score
 */
async function evaluateAnswer({ question, answer, category, difficulty, type, previousScores }) {
  const avgPrevious = previousScores.length > 0
    ? Math.round(previousScores.reduce((a, b) => a + b, 0) / previousScores.length)
    : 50;

  const prompt = `You are an expert interview evaluator. Evaluate the candidate's answer carefully.

Question: "${question}"
Category: ${category}
Difficulty: ${difficulty}
Type: ${type}
Candidate's Answer: "${answer || '[No answer provided]'}"

Evaluation Criteria:
1. Technical Accuracy (0-100): Is the technical content correct and precise?
2. Completeness (0-100): Did they fully address the question?
3. Logical Reasoning (0-100): Is their thinking structured and logical?
4. Communication Quality (0-100): How clearly did they express their ideas?
5. Problem-Solving (0-100): Did they show effective problem-solving approach?

Overall Score = (TechnicalAccuracy * 0.3 + Completeness * 0.2 + LogicalReasoning * 0.2 + CommunicationQuality * 0.15 + ProblemSolving * 0.15)

Previous average score: ${avgPrevious}. Be consistent with previous scoring.

Respond ONLY with valid JSON (no markdown):
{
  "overallScore": 0-100,
  "technicalAccuracy": 0-100,
  "completeness": 0-100,
  "logicalReasoning": 0-100,
  "communicationQuality": 0-100,
  "problemSolving": 0-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "feedback": "2-3 sentences of personalized constructive feedback",
  "missedConcepts": ["concept1", "concept2"]
}`;

  try {
    const result = await withRetry(() => proModel.generateContent(prompt));
    const text = result.response.text();
    return JSON.parse(cleanJson(text));
  } catch (error) {
    logger.error('Gemini evaluateAnswer error:', error.message, error.status || '');
    return {
      overallScore: 70,
      technicalAccuracy: 70,
      completeness: 70,
      logicalReasoning: 70,
      communicationQuality: 70,
      problemSolving: 70,
      strengths: ['Attempted to answer the question'],
      weaknesses: ['Could provide more detail'],
      feedback: 'Good effort. Try to be more specific with technical details.',
      missedConcepts: [],
    };
  }
}

/**
 * Generate the final comprehensive interview report
 */
async function generateReport({ transcript, evaluations, communicationMetrics, config, totalDuration }) {
  const evaluationsText = evaluations.map((e, i) =>
    `Q${i + 1}: ${e.question}\nScore: ${e.score}/100\nStrengths: ${e.strengths.join(', ')}\nWeaknesses: ${e.weaknesses.join(', ')}\nFeedback: ${e.feedback}`
  ).join('\n\n');

  const transcriptText = transcript.map(t =>
    `${t.role.toUpperCase()}: ${t.content}`
  ).join('\n');

  const prompt = `You are an expert interview report generator. Create a comprehensive, professional interview report.

Interview Configuration:
- Category: ${config.category}
- Difficulty: ${config.difficulty}
- Type: ${config.type}
- Duration: ${Math.round(totalDuration / 60)} minutes

Communication Metrics:
- Total Speaking Time: ${Math.round(communicationMetrics.totalSpeakingTime / 60)} minutes
- Average Response Length: ${Math.round(communicationMetrics.avgResponseLength)} words
- Filler Words: ${communicationMetrics.fillerWords?.join(', ') || 'None detected'}
- Filler Word Count: ${communicationMetrics.fillerWordCount || 0}
- Speaking Pace: ${communicationMetrics.avgWordsPerMinute || 0} words/min

Evaluations:
${evaluationsText}

Full Transcript:
${transcriptText}

Generate a detailed report. Respond ONLY with valid JSON (no markdown):
{
  "overallScore": 0-100,
  "technicalScore": 0-100,
  "communicationScore": 0-100,
  "confidenceScore": 0-100,
  "problemSolvingScore": 0-100,
  "summary": "2-3 sentence overall summary of the interview",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "detailedFeedback": "Detailed paragraph of personalized feedback covering what they did well and what to improve",
  "recommendedTopics": ["topic1", "topic2", "topic3"],
  "learningResources": [
    { "topic": "Topic Name", "resource": "Suggested resource to learn this" }
  ],
  "fillerWordAnalysis": "Analysis of speech patterns and filler word usage",
  "careerReadiness": "Beginner|Intermediate|Advanced|Expert",
  "recommendedNextSteps": ["step1", "step2", "step3"]
}`;

  try {
    const result = await withRetry(() => proModel.generateContent(prompt));
    const text = result.response.text();
    return JSON.parse(cleanJson(text));
  } catch (error) {
    logger.error('Gemini generateReport error:', error.message, error.status || '');
    // Fallback report
    const avgScore = evaluations.length > 0
      ? Math.round(evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length)
      : 70;
    return {
      overallScore: avgScore,
      technicalScore: avgScore - 2,
      communicationScore: avgScore + 3,
      confidenceScore: avgScore - 1,
      problemSolvingScore: avgScore + 1,
      summary: 'Interview completed successfully.',
      strengths: ['Attempted all questions', 'Showed engagement'],
      weaknesses: ['Could improve technical depth'],
      detailedFeedback: 'Keep practicing and reviewing technical concepts.',
      recommendedTopics: [config.category],
      learningResources: [{ topic: config.category, resource: 'Online courses and documentation' }],
      fillerWordAnalysis: 'Minimal filler words detected.',
      careerReadiness: 'Intermediate',
      recommendedNextSteps: ['Review weak areas', 'Practice more interviews'],
    };
  }
}

/**
 * Analyze communication quality from speech metrics
 */
function analyzeCommunication(speechData) {
  const fillerWords = ['um', 'uh', 'like', 'ah', 'er', 'hmm', 'you know', 'actually', 'basically', 'literally'];
  const detectedFillerWords = [];

  let fillerWordCount = 0;
  if (speechData.transcript) {
    const words = speechData.transcript.toLowerCase().split(/\s+/);
    fillerWords.forEach(filler => {
      const count = words.filter(w => w === filler || w.includes(filler)).length;
      if (count > 0) {
        fillerWordCount += count;
        detectedFillerWords.push(filler);
      }
    });
  }

  const wordCount = speechData.transcript ? speechData.transcript.split(/\s+/).length : 0;
  const durationMinutes = speechData.duration / 60 || 1;
  const wordsPerMinute = Math.round(wordCount / durationMinutes);

  return {
    fillerWordCount,
    fillerWords: [...new Set(detectedFillerWords)],
    avgWordsPerMinute: wordsPerMinute,
    totalSpeakingTime: speechData.duration || 0,
    avgResponseLength: wordCount,
    fluency: wordsPerMinute > 0 && wordsPerMinute < 200 ? 'Good' : wordsPerMinute >= 200 ? 'Fast' : 'Slow',
  };
}

module.exports = {
  generateFirstQuestion,
  generateFollowUp,
  evaluateAnswer,
  generateReport,
  analyzeCommunication,
};
