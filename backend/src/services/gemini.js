const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use flash model for speed, pro model for complex evaluation
const flashModel = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
const proModel = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

// ─── Dynamic Fallback Question Pool ──────────────────────────────

const QUESTION_BANK = {
  'Frontend': {
    Beginner: [
      {
        question: "What is the difference between `display: none` and `visibility: hidden` in CSS? Can you give me a practical scenario where you'd use each one?",
        followUp: "How does `opacity: 0` compare to those two?",
        keyPoints: ['Understanding of CSS layout', 'Knowledge of accessibility implications', 'Practical application awareness'],
        topics: ['CSS', 'Layout', 'Accessibility'],
      },
      {
        question: "Explain what the DOM (Document Object Model) is and how JavaScript interacts with it. Give me a simple example of manipulating the DOM.",
        followUp: "What's the difference between `innerHTML` and `textContent`?",
        keyPoints: ['DOM understanding', 'JavaScript basics', 'Practical manipulation knowledge'],
        topics: ['JavaScript', 'DOM', 'Web APIs'],
      },
      {
        question: "What's the box model in CSS? Walk me through how margin, border, padding, and content area work together.",
        followUp: "How does `box-sizing: border-box` change things?",
        keyPoints: ['CSS fundamentals', 'Layout understanding', 'Box model mastery'],
        topics: ['CSS', 'Box Model', 'Layout'],
      },
    ],
    Intermediate: [
      {
        question: "Explain how React's virtual DOM works and why it improves performance. What would happen if we directly manipulated the real DOM on every state change?",
        followUp: "How does React's reconciliation algorithm decide which parts of the virtual DOM to update?",
        keyPoints: ['Virtual DOM understanding', 'Performance awareness', 'React internals knowledge'],
        topics: ['React', 'Virtual DOM', 'Performance'],
      },
      {
        question: "Describe a situation where you had to optimize a slow frontend application. What tools did you use to identify bottlenecks and what specific changes did you make?",
        followUp: "How would you measure Core Web Vitals in production?",
        keyPoints: ['Performance optimization', 'Debugging skills', 'Real-world experience'],
        topics: ['Performance', 'Optimization', 'Frontend Architecture'],
      },
      {
        question: "Compare and contrast controlled vs uncontrolled components in React. When would you choose one over the other?",
        followUp: "How do you handle form validation in a controlled component pattern?",
        keyPoints: ['React patterns', 'Form handling', 'Architecture decisions'],
        topics: ['React', 'Forms', 'State Management'],
      },
    ],
    Advanced: [
      {
        question: "Design a state management solution from scratch for a large-scale React application with features like optimistic updates, offline support, and cross-tab synchronization. Walk me through your architecture.",
        followUp: "How would you handle race conditions with optimistic updates?",
        keyPoints: ['System design', 'State management expertise', 'Edge case handling'],
        topics: ['State Management', 'Architecture', 'System Design'],
      },
      {
        question: "Explain how you would implement a custom renderer for React. What are the key interfaces you need to implement and how does the reconciler interact with your renderer?",
        followUp: "How does React's scheduler prioritize work in concurrent mode?",
        keyPoints: ['React internals', 'Custom renderer knowledge', 'Reconciler understanding'],
        topics: ['React', 'Custom Renderer', 'Internals'],
      },
    ],
  },
  'Backend': {
    Beginner: [
      {
        question: "Explain the difference between REST and GraphQL APIs. What are the main advantages of each approach?",
        followUp: "In what scenarios would you absolutely NOT want to use GraphQL?",
        keyPoints: ['API architecture understanding', 'Protocol knowledge', 'Decision-making skills'],
        topics: ['REST', 'GraphQL', 'API Design'],
      },
      {
        question: "What is middleware in Express.js? Give me an example of middleware you've used and explain what it does.",
        followUp: "What's the difference between application-level and router-level middleware?",
        keyPoints: ['Express.js knowledge', 'Middleware understanding', 'Practical experience'],
        topics: ['Express.js', 'Middleware', 'Node.js'],
      },
    ],
    Intermediate: [
      {
        question: "How would you design a rate-limiting system for a high-traffic API? Consider distributed systems where users might hit different servers.",
        followUp: "How would you implement a sliding window algorithm vs a token bucket?",
        keyPoints: ['Rate limiting concepts', 'Distributed systems', 'Algorithm choice'],
        topics: ['Rate Limiting', 'Distributed Systems', 'API Design'],
      },
      {
        question: "Explain database indexing. How do B-tree indexes work and when would you use a composite index?",
        followUp: "What's the downside of having too many indexes on a table?",
        keyPoints: ['Database internals', 'Performance optimization', 'Indexing strategy'],
        topics: ['Databases', 'Indexing', 'Performance'],
      },
    ],
    Advanced: [
      {
        question: "Design a real-time collaborative editing system like Google Docs. How would you handle conflict resolution, cursor synchronization, and offline editing?",
        followUp: "Compare Operational Transformation vs CRDT for this use case - which would you choose and why?",
        keyPoints: ['System design', 'Conflict resolution', 'Real-time systems'],
        topics: ['System Design', 'Real-time', 'CRDT', 'OT'],
      },
    ],
  },
  'React': {
    Beginner: [
      {
        question: "What is a React component and what are the different ways to create one? Show me a simple functional component and explain what's happening.",
        followUp: "What's the difference between props and state?",
        keyPoints: ['React fundamentals', 'Component architecture', 'Props vs state'],
        topics: ['React', 'Components', 'JSX'],
      },
    ],
    Intermediate: [
      {
        question: "Explain the useEffect hook in React. What happens if you don't provide a dependency array? What happens if you provide an empty one?",
        followUp: "How would you handle a cleanup function in useEffect and why is it important?",
        keyPoints: ['Hooks mastery', 'Side effects', 'Lifecycle understanding'],
        topics: ['React', 'useEffect', 'Hooks'],
      },
      {
        question: "How would you optimize a React component that re-renders too often? Walk me through your debugging process and what tools you'd use.",
        followUp: "What's the difference between React.memo and useMemo?",
        keyPoints: ['Performance optimization', 'Rendering behavior', 'Debugging skills'],
        topics: ['React', 'Performance', 'Optimization'],
      },
    ],
    Advanced: [
      {
        question: "Explain React's concurrent features. How does useTransition work and when would you use it over debouncing?",
        followUp: "How does React Suspense integrate with data fetching libraries?",
        keyPoints: ['Concurrent React', 'useTransition', 'Suspense'],
        topics: ['React', 'Concurrent Mode', 'Suspense'],
      },
    ],
  },
  'JavaScript': {
    Beginner: [
      {
        question: "Explain the difference between `var`, `let`, and `const` in JavaScript. Give me a real example where using `var` could cause a bug.",
        followUp: "What is temporal dead zone?",
        keyPoints: ['Variable scoping', 'Hoisting understanding', 'ES6+ knowledge'],
        topics: ['JavaScript', 'Variables', 'Scoping'],
      },
      {
        question: "What is a closure in JavaScript? Can you give me a practical example of where you'd use one?",
        followUp: "How do closures interact with garbage collection?",
        keyPoints: ['Closures', 'Scope chain', 'Practical usage'],
        topics: ['JavaScript', 'Closures', 'Fundamentals'],
      },
    ],
    Intermediate: [
      {
        question: "Explain how the JavaScript event loop works. What's the difference between the call stack, microtask queue, and macrotask queue?",
        followUp: "Where do Promises and async/await fit into the event loop?",
        keyPoints: ['Event loop mastery', 'Async JavaScript', 'Concurrency model'],
        topics: ['JavaScript', 'Event Loop', 'Async'],
      },
      {
        question: "What are JavaScript Promises and how do they differ from callbacks? How would you handle multiple parallel API calls?",
        followUp: "What's the difference between Promise.all, Promise.allSettled, and Promise.race?",
        keyPoints: ['Promises', 'Async patterns', 'Error handling'],
        topics: ['JavaScript', 'Promises', 'Async/Await'],
      },
    ],
    Advanced: [
      {
        question: "Explain JavaScript's prototype chain in detail. How does prototypal inheritance differ from classical inheritance?",
        followUp: "How does the `new` keyword actually work under the hood?",
        keyPoints: ['Prototypes', 'Inheritance', 'OOP in JS'],
        topics: ['JavaScript', 'Prototypes', 'OOP'],
      },
    ],
  },
  'Node.js': {
    Beginner: [
      {
        question: "What is Node.js and why would you use it over traditional server-side technologies? What kind of applications is it best suited for?",
        followUp: "What's the event-driven, non-blocking I/O model?",
        keyPoints: ['Node.js fundamentals', 'Use case awareness', 'Architecture understanding'],
        topics: ['Node.js', 'Server-side', 'JavaScript'],
      },
    ],
    Intermediate: [
      {
        question: "Explain the Stream API in Node.js. How would you process a large file (like a 5GB CSV) without running out of memory?",
        followUp: "What's the difference between readable, writable, transform, and duplex streams?",
        keyPoints: ['Streams', 'Memory management', 'Data processing'],
        topics: ['Node.js', 'Streams', 'File Processing'],
      },
    ],
    Advanced: [
      {
        question: "How does Node.js handle child processes? Design a system where a long-running computation runs in a child process and communicates results back to the parent.",
        followUp: "Compare worker_threads vs child_process - when would you use each?",
        keyPoints: ['Child processes', 'Concurrency', 'System design'],
        topics: ['Node.js', 'Child Processes', 'Worker Threads'],
      },
    ],
  },
  'DSA': {
    Beginner: [
      {
        question: "Explain the difference between an array and a linked list. When would you use one over the other?",
        followUp: "What's the time complexity of inserting an element at the beginning of each?",
        keyPoints: ['Data structure fundamentals', 'Complexity analysis', 'Trade-off understanding'],
        topics: ['Arrays', 'Linked Lists', 'Data Structures'],
      },
      {
        question: "What is a hash table and how does it work? How do you handle collisions?",
        followUp: "What's the time complexity of search, insert, and delete in a hash table?",
        keyPoints: ['Hash tables', 'Collision handling', 'Complexity analysis'],
        topics: ['Hash Tables', 'Data Structures', 'Algorithms'],
      },
    ],
    Intermediate: [
      {
        question: "Explain the two-pointer technique. Given a sorted array, how would you find a pair of numbers that sum to a target value?",
        followUp: "How would you modify this for an unsorted array?",
        keyPoints: ['Two-pointer technique', 'Array manipulation', 'Optimization thinking'],
        topics: ['Algorithms', 'Two Pointers', 'Arrays'],
      },
      {
        question: "Explain depth-first search vs breadth-first search on a binary tree. When would you choose one over the other?",
        followUp: "How would you detect if a binary tree is balanced?",
        keyPoints: ['Tree traversal', 'DFS/BFS understanding', 'Algorithm choice'],
        topics: ['Trees', 'DFS', 'BFS', 'Algorithms'],
      },
    ],
    Advanced: [
      {
        question: "Design an algorithm to find the shortest path in a weighted graph with negative edges. What algorithm would you use and why?",
        followUp: "How would you detect negative weight cycles?",
        keyPoints: ['Graph algorithms', 'Shortest path', 'Edge case handling'],
        topics: ['Graphs', 'Bellman-Ford', 'Shortest Path'],
      },
      {
        question: "Explain dynamic programming. Solve the 'Longest Common Subsequence' problem and explain your approach.",
        followUp: "How would you optimize the space complexity of your solution?",
        keyPoints: ['Dynamic programming', 'Optimization', 'Problem-solving'],
        topics: ['DP', 'Algorithms', 'Optimization'],
      },
    ],
  },
  'System Design': {
    Beginner: [
      {
        question: "Design a URL shortening service like TinyURL. Walk me through your database schema and API design.",
        followUp: "How would you handle 10 million writes per day?",
        keyPoints: ['System design basics', 'Database design', 'API design'],
        topics: ['System Design', 'Databases', 'APIs'],
      },
    ],
    Intermediate: [
      {
        question: "Design a chat application like WhatsApp or Slack. How would you handle real-time messaging, message persistence, and offline delivery?",
        followUp: "How would you scale this to support 100 million users?",
        keyPoints: ['Real-time systems', 'Scalability', 'Data modeling'],
        topics: ['System Design', 'Real-time', 'Scalability'],
      },
      {
        question: "Design an e-commerce inventory system that prevents overselling during flash sales when millions of users are trying to buy simultaneously.",
        followUp: "How would you handle payment reconciliation in this system?",
        keyPoints: ['Concurrency control', 'Inventory management', 'High traffic handling'],
        topics: ['System Design', 'Concurrency', 'E-commerce'],
      },
    ],
    Advanced: [
      {
        question: "Design a globally distributed CDN and caching system. How would you handle cache invalidation, data consistency, and failover across regions?",
        followUp: "Compare eventual consistency vs strong consistency in this context.",
        keyPoints: ['CDN design', 'Distributed caching', 'Consistency models'],
        topics: ['System Design', 'CDN', 'Caching', 'Distribution'],
      },
      {
        question: "Design a distributed rate limiter that works across multiple data centers. How would you ensure accuracy while minimizing latency?",
        followUp: "Compare centralized vs distributed approaches for this problem.",
        keyPoints: ['Distributed systems', 'Rate limiting', 'Consistency vs availability'],
        topics: ['System Design', 'Rate Limiting', 'Distributed Systems'],
      },
    ],
  },
  'Behavioral': {
    Beginner: [
      {
        question: "Tell me about a time you had to learn a new technology quickly for a project. How did you approach it and what was the outcome?",
        followUp: "What's your general strategy for picking up new technologies?",
        keyPoints: ['Learning ability', 'Adaptability', 'Proactive approach'],
        topics: ['Learning', 'Adaptability'],
      },
    ],
    Intermediate: [
      {
        question: "Describe a situation where you disagreed with a teammate or manager about a technical decision. How did you handle it?",
        followUp: "Looking back, would you have handled it differently?",
        keyPoints: ['Conflict resolution', 'Communication', 'Professional maturity'],
        topics: ['Conflict Resolution', 'Communication', 'Teamwork'],
      },
      {
        question: "Tell me about a project that failed or didn't meet expectations. What went wrong and what did you learn from it?",
        followUp: "What systems or processes would you put in place to prevent similar failures?",
        keyPoints: ['Failure analysis', 'Accountability', 'Process improvement'],
        topics: ['Failure', 'Learning', 'Process'],
      },
    ],
    Advanced: [
      {
        question: "Tell me about a time you had to lead a significant technical initiative across multiple teams. How did you align everyone and ensure successful delivery?",
        followUp: "How did you handle teams that had conflicting priorities?",
        keyPoints: ['Leadership', 'Cross-team collaboration', 'Project management'],
        topics: ['Leadership', 'Cross-team', 'Delivery'],
      },
    ],
  },
  'HR': {
    Beginner: [
      {
        question: "Tell me about yourself and why you're interested in this role. What makes you a good fit?",
        followUp: "What do you know about our company and our product?",
        keyPoints: ['Self-awareness', 'Interest alignment', 'Company research'],
        topics: ['Self Introduction', 'Career Goals'],
      },
    ],
    Intermediate: [
      {
        question: "Where do you see yourself in 5 years? How does this role align with your long-term career goals?",
        followUp: "What skills are you currently working on developing?",
        keyPoints: ['Career planning', 'Ambition', 'Self-development'],
        topics: ['Career Growth', 'Goals', 'Development'],
      },
    ],
  },
  'General': {
    Beginner: [
      {
        question: "Tell me about your background and what got you interested in technology. What's a project you're proud of?",
        followUp: "What technologies are you most excited to learn?",
        keyPoints: ['Background', 'Passion', 'Project experience'],
        topics: ['Background', 'Experience'],
      },
    ],
    Intermediate: [
      {
        question: "Describe your approach to debugging a complex issue in a production system. Walk me through your process step by step.",
        followUp: "What tools do you use for debugging and monitoring?",
        keyPoints: ['Debugging methodology', 'Systematic thinking', 'Tool knowledge'],
        topics: ['Debugging', 'Problem-solving', 'Production'],
      },
    ],
    Advanced: [
      {
        question: "Tell me about a time you had to make a trade-off between speed and quality. How did you make the decision and what was the outcome?",
        followUp: "How do you know when to prioritize speed vs quality in a project?",
        keyPoints: ['Decision-making', 'Trade-off analysis', 'Judgment'],
        topics: ['Decision-making', 'Trade-offs', 'Leadership'],
      },
    ],
  },
};

// Used to rotate through questions so they don't repeat
let questionUsageCount = {};

/**
 * Get a dynamic fallback question from the bank based on category/difficulty
 */
function getFallbackQuestion(category, difficulty, type) {
  const cat = QUESTION_BANK[category] ? category : 'General';
  const diff = QUESTION_BANK[cat][difficulty] ? difficulty : 'Intermediate';
  const pool = QUESTION_BANK[cat][diff] || QUESTION_BANK['General']['Intermediate'];
  
  // Track usage to rotate questions
  const key = `${cat}-${diff}`;
  if (!questionUsageCount[key]) questionUsageCount[key] = 0;
  const idx = questionUsageCount[key] % pool.length;
  questionUsageCount[key]++;
  
  const q = { ...pool[idx] };
  q.estimatedDifficulty = difficulty;
  
  // If type is Coding, add a coding twist
  if (type === 'Coding') {
    q.question = `[CODING CHALLENGE] ${q.question}\n\nPlease write code to demonstrate your solution.`;
    q.followUp = q.followUp ? `[CODE FOLLOW-UP] ${q.followUp}` : null;
  }
  
  return q;
}

/**
 * Get a dynamic fallback follow-up question
 */
function getFallbackFollowUp(category, difficulty, type, previousAnswer, score, questionCount) {
  const questions = [
    {
      question: "That's interesting. Can you dive deeper into the technical implementation details?",
      followUp: null,
      keyPoints: ['Technical depth', 'Implementation knowledge'],
      estimatedDifficulty: difficulty,
      topics: [category],
      isLast: false,
      reason: 'Seeking deeper technical understanding',
    },
    {
      question: `Great answer! Let's try a different angle. How would you handle this if you had to scale it to handle 10x more traffic?`,
      followUp: null,
      keyPoints: ['Scalability thinking', 'System design'],
      estimatedDifficulty: 'Advanced',
      topics: [category],
      isLast: false,
      reason: 'Testing scalability mindset',
    },
    {
      question: "What alternatives did you consider? Walk me through your decision-making process for choosing this approach over others.",
      followUp: null,
      keyPoints: ['Decision-making', 'Trade-off analysis'],
      estimatedDifficulty: difficulty,
      topics: [category],
      isLast: false,
      reason: 'Evaluating decision-making process',
    },
    {
      question: `Let me ask you something more challenging: How would you design this system differently if you had to build it from scratch today, considering everything you've learned?`,
      followUp: null,
      keyPoints: ['System design', 'Learning from experience'],
      estimatedDifficulty: 'Advanced',
      topics: [category],
      isLast: false,
      reason: 'Testing growth and system design skills',
    },
    {
      question: "Can you give me a concrete example of how you've applied this concept in a real project? What specific problems did you face?",
      followUp: null,
      keyPoints: ['Real-world experience', 'Problem-solving'],
      estimatedDifficulty: difficulty,
      topics: [category],
      isLast: false,
      reason: 'Seeking practical experience validation',
    },
  ];
  
  // If score is low, ask an easier question
  if (score < 50) {
    const rephraseVariants = [
      {
        question: "Let me rephrase that more simply. Can you explain the basic concept first, and then we can build on it?",
        followUp: null,
        keyPoints: ['Fundamental understanding', 'Communication'],
        estimatedDifficulty: 'Beginner',
        topics: [category],
        isLast: false,
        reason: 'Simplifying to assess fundamentals',
      },
      {
        question: "No worries, let's take a step back. What do you already know about this topic? Start from the basics.",
        followUp: null,
        keyPoints: ['Fundamental knowledge', 'Communication clarity'],
        estimatedDifficulty: 'Beginner',
        topics: [category],
        isLast: false,
        reason: 'Adjusting difficulty level',
      },
      {
        question: "Let's try a different approach. Can you tell me what you understand about the problem and we'll work through it together?",
        followUp: null,
        keyPoints: ['Problem-solving approach', 'Collaborative thinking'],
        estimatedDifficulty: 'Beginner',
        topics: [category],
        isLast: false,
        reason: 'Guiding the candidate',
      },
    ];
    const variantIdx = Math.floor(Math.random() * rephraseVariants.length);
    return rephraseVariants[variantIdx];
  }
  
  // Last question check (after 5 questions, wrap up soon)
  if (questionCount >= 5) {
    const lastQ = getFallbackQuestion(category, difficulty, type);
    lastQ.isLast = true;
    lastQ.reason = 'Wrapping up the interview';
    return lastQ;
  }
  
  const idx = questionUsageCount['followup'] ? questionUsageCount['followup'] % questions.length : 0;
  questionUsageCount['followup'] = (questionUsageCount['followup'] || 0) + 1;
  return questions[idx];
}

/**
 * Score an answer using heuristics when Gemini is unavailable
 */
function heuristicScore({ question, answer, category, difficulty }) {
  if (!answer || !answer.trim()) {
    return {
      overallScore: 0,
      technicalAccuracy: 0,
      completeness: 0,
      logicalReasoning: 0,
      communicationQuality: 0,
      problemSolving: 0,
      strengths: ['Attempted to engage'],
      weaknesses: ['No answer provided', 'Need to respond to questions'],
      feedback: 'You didn\'t provide an answer. Try to respond to each question, even if you\'re unsure.',
      missedConcepts: [],
    };
  }

  const words = answer.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Score based on answer length (more words = more effort = higher score)
  let lengthScore = Math.min(100, Math.round((wordCount / 50) * 100));
  if (wordCount >= 100) lengthScore = 90;
  else if (wordCount >= 70) lengthScore = 80;
  else if (wordCount >= 50) lengthScore = 70;
  else if (wordCount >= 30) lengthScore = 55;
  else if (wordCount >= 15) lengthScore = 40;
  else lengthScore = Math.max(10, wordCount * 3);
  
  // Score based on sentence structure (more sentences = more structured)
  let structureScore = Math.min(100, Math.round((sentences.length / 5) * 100));
  if (sentences.length >= 5) structureScore = 85;
  else if (sentences.length >= 3) structureScore = 65;
  else if (sentences.length >= 1) structureScore = 40;
  else structureScore = 10;
  
  // Technical keywords bonus
  const techKeywords = [
    'function', 'component', 'api', 'database', 'server', 'client', 'async',
    'promise', 'callback', 'event', 'loop', 'state', 'props', 'hook', 'effect',
    'variable', 'array', 'object', 'class', 'interface', 'type', 'error',
    'performance', 'optimize', 'scale', 'cache', 'memory', 'request', 'response',
    'algorithm', 'complexity', 'data', 'structure', 'stack', 'queue', 'tree',
    'graph', 'hash', 'index', 'query', 'sql', 'nosql', 'rest', 'graphql',
    'middleware', 'route', 'controller', 'service', 'model', 'view', 'template',
    'test', 'debug', 'deploy', 'build', 'compile', 'render', 'paint', 'layout',
    'security', 'auth', 'token', 'jwt', 'session', 'cookie', 'https', 'ssl',
  ];
  
  const lowerAnswer = answer.toLowerCase();
  const matchedKeywords = techKeywords.filter(kw => lowerAnswer.includes(kw));
  const keywordScore = Math.min(100, Math.round((matchedKeywords.length / 5) * 100));
  
  // Filler words penalty
  const fillerWords = ['um', 'uh', 'like', 'ah', 'er', 'hmm', 'you know', 'basically', 'literally', 'actually'];
  let fillerCount = 0;
  fillerWords.forEach(fw => {
    const regex = new RegExp(`\\b${fw}\\b`, 'gi');
    const matches = lowerAnswer.match(regex);
    if (matches) fillerCount += matches.length;
  });
  const fillerPenalty = Math.min(30, fillerCount * 5);
  
  // Communication quality
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : wordCount;
  let commScore = 70;
  if (avgSentenceLength > 5 && avgSentenceLength < 30) commScore = 80;
  else if (avgSentenceLength > 30) commScore = 50; // Run-on sentences
  else if (avgSentenceLength < 3) commScore = 30; // Too short
  
  // Problem-solving score based on structure words
  const structureWords = ['first', 'second', 'then', 'next', 'finally', 'because', 'therefore', 'however', 'approach', 'solution', 'implement', 'design', 'plan', 'steps'];
  const matchedStructure = structureWords.filter(sw => lowerAnswer.includes(sw));
  let problemSolvingScore = Math.min(100, 40 + matchedStructure.length * 10);
  
  // Combine scores
  const overallScore = Math.max(5, Math.min(98, Math.round(
    lengthScore * 0.20 +
    structureScore * 0.15 +
    keywordScore * 0.20 +
    commScore * 0.15 +
    problemSolvingScore * 0.15 +
    (80 - fillerPenalty) * 0.15
  )));
  
  // Generate dynamic feedback
  let strengths = [];
  let weaknesses = [];
  let feedback = '';
  
  if (wordCount >= 50) {
    strengths.push('Provided a detailed response');
  } else if (wordCount >= 20) {
    strengths.push('Provided a moderate-length response');
  } else {
    weaknesses.push('Answer was too brief — try to elaborate more');
  }
  
  if (matchedKeywords.length >= 5) {
    strengths.push('Good use of technical terminology');
  } else if (matchedKeywords.length >= 3) {
    strengths.push('Some relevant technical terms used');
  } else {
    weaknesses.push('Could include more technical vocabulary');
  }
  
  if (sentences.length >= 3) {
    strengths.push('Well-structured answer with clear organization');
  } else {
    weaknesses.push('Answer could be more structured');
  }
  
  if (fillerCount > 3) {
    weaknesses.push(`Used filler words ${fillerCount} times — try to reduce 'um', 'uh', 'like'`);
  }
  
  if (matchedStructure.length >= 2) {
    strengths.push('Demonstrated logical reasoning and structured thinking');
  }
  
  if (strengths.length === 0) strengths.push('Attempted to answer the question');
  if (weaknesses.length === 0) weaknesses.push('Could provide more specific technical details');
  
  // Personalized feedback
  if (overallScore >= 80) {
    feedback = 'Excellent answer! You demonstrated strong technical knowledge and structured your response well. Keep up the great work.';
  } else if (overallScore >= 60) {
    feedback = 'Good answer. You covered the main points. Try to add more specific technical details and examples to strengthen your response further.';
  } else if (overallScore >= 40) {
    feedback = 'Decent attempt, but your answer could be more comprehensive. Focus on providing specific examples and technical depth in your responses.';
  } else {
    feedback = 'Your answer was quite brief. Try to expand on your thoughts, include technical details, and structure your response more clearly.';
  }
  
  return {
    overallScore,
    technicalAccuracy: Math.min(100, lengthScore + keywordScore > 100 ? 100 : Math.round((lengthScore + keywordScore) / 2)),
    completeness: Math.min(100, structureScore + 10),
    logicalReasoning: Math.min(100, problemSolvingScore + 5),
    communicationQuality: Math.max(10, Math.min(100, commScore - fillerPenalty)),
    problemSolving: Math.min(100, problemSolvingScore),
    strengths,
    weaknesses,
    feedback,
    missedConcepts: [],
  };
}

/**
 * Generate a fallback report without Gemini
 */
function generateFallbackReport({ evaluations, config, totalDuration }) {
  const scores = evaluations.map(e => e.score).filter(s => s != null);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 70;
  
  const allStrengths = evaluations.flatMap(e => e.strengths || []);
  const allWeaknesses = evaluations.flatMap(e => e.weaknesses || []);
  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
  const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);
  
  const careerReadiness = avgScore >= 85 ? 'Expert' : avgScore >= 70 ? 'Advanced' : avgScore >= 50 ? 'Intermediate' : 'Beginner';
  
  return {
    overallScore: avgScore,
    technicalScore: Math.max(0, avgScore - Math.round(Math.random() * 8) + 4),
    communicationScore: Math.max(0, avgScore - Math.round(Math.random() * 8) + 4),
    confidenceScore: Math.max(0, avgScore - Math.round(Math.random() * 10) + 5),
    problemSolvingScore: Math.max(0, avgScore - Math.round(Math.random() * 8) + 4),
    summary: `You completed a ${config.difficulty} level interview in ${config.category} (${config.type}). Your overall performance was ${avgScore >= 70 ? 'strong' : avgScore >= 50 ? 'decent' : 'needs improvement'}, scoring ${avgScore}% across ${evaluations.length} questions.`,
    strengths: uniqueStrengths.length > 0 ? uniqueStrengths : ['Engaged with all questions', 'Showed willingness to learn'],
    weaknesses: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ['Could improve technical depth', 'Try providing more specific examples'],
    detailedFeedback: `Based on your ${config.type} interview in ${config.category}, here's your personalized feedback:\n\n` +
      `You answered ${evaluations.length} questions with an average score of ${avgScore}%. ` +
      (avgScore >= 70
        ? 'You demonstrated solid knowledge and structured your responses well. To reach the next level, focus on diving deeper into advanced concepts and providing more concrete technical examples.'
        : avgScore >= 50
        ? 'You have a good foundation but could benefit from deeper technical preparation. Focus on understanding core concepts more thoroughly and practicing structured responses.'
        : 'This is a good starting point. Focus on building your fundamental knowledge in this area and practice explaining technical concepts clearly.'),
    recommendedTopics: [config.category, ...(config.difficulty === 'Beginner' ? ['Core fundamentals', 'Practice projects'] : config.difficulty === 'Intermediate' ? ['Advanced concepts', 'System design', 'Best practices'] : ['Architecture patterns', 'Performance optimization', 'Distributed systems'])],
    learningResources: [
      { topic: config.category, resource: `Official documentation and tutorials for ${config.category}` },
      { topic: 'Interview Preparation', resource: 'Practice with mock interviews and coding challenges' },
      { topic: 'Technical Communication', resource: 'Work on explaining concepts clearly and structuring answers' },
    ],
    fillerWordAnalysis: 'Focus on reducing filler words like "um" and "like" for more confident communication. Try pausing briefly to collect your thoughts instead.',
    careerReadiness,
    recommendedNextSteps: [
      avgScore < 60 ? 'Review fundamental concepts in ' + config.category : 'Deep dive into advanced topics in ' + config.category,
      'Practice explaining technical concepts without relying on filler words',
      'Take another mock interview to track your progress',
      'Review the areas where you scored lower and focus your studies there',
    ],
  };
}

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
    // Dynamic fallback from question bank
    logger.warn('Using fallback question bank (Gemini unavailable or invalid API key)');
    return getFallbackQuestion(category, difficulty, type);
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
    logger.warn('Using fallback follow-up questions (Gemini unavailable)');
    return getFallbackFollowUp(category, difficulty, type, previousAnswer, score, conversationHistory.length);
  }
}

/**
 * Evaluate a candidate's answer and provide a detailed score
 */
async function evaluateAnswer({ question, answer, category, difficulty, type, previousScores }) {
  const prevScores = Array.isArray(previousScores) ? previousScores : [];
  const avgPrevious = prevScores.length > 0
    ? Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length)
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
    logger.warn('Using heuristic scoring (Gemini unavailable)');
    // Dynamic heuristic-based scoring instead of always 70
    return heuristicScore({ question, answer, category, difficulty });
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
    logger.warn('Using fallback report (Gemini unavailable)');
    return generateFallbackReport({ evaluations, config, totalDuration });
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
