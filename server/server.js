import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load .env from server dir and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Gemini client if key is present
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey.trim());
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(getGeminiClient());
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    mode: hasKey ? 'live-gemini' : 'mock-fallback',
    message: hasKey
      ? 'Gemini API connected and ready.'
      : 'Running in educational demo fallback mode. Add GEMINI_API_KEY in .env for live AI.',
  });
});

/**
 * Clean and parse JSON response from Gemini
 */
function cleanAndParseJSON(rawText) {
  let text = rawText.trim();
  // Remove markdown code fences if present (```json ... ``` or ``` ...)
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  // Find first { or [ and last } or ]
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }
  
  const lastBrace = text.lastIndexOf('}');
  const lastBracket = text.lastIndexOf(']');
  let endIdx = text.length;
  if (lastBrace !== -1 && lastBrace > lastBracket) {
    endIdx = lastBrace + 1;
  } else if (lastBracket !== -1) {
    endIdx = lastBracket + 1;
  }

  const cleaned = text.slice(startIdx, endIdx);
  return JSON.parse(cleaned);
}

/**
 * Validate question structure
 */
function validateQuestions(questions, requestedCount) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Response is not an array of questions');
  }

  const validated = questions.map((q, idx) => {
    if (!q.question || typeof q.question !== 'string') {
      throw new Error(`Question ${idx + 1} is missing question text`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${idx + 1} does not have exactly 4 options`);
    }
    const correctIdx = Number(q.correctIndex);
    if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 3) {
      throw new Error(`Question ${idx + 1} has invalid correctIndex`);
    }
    
    // Normalize wrong explanations array
    let wrongExplanations = q.wrongExplanations;
    if (!Array.isArray(wrongExplanations) || wrongExplanations.length !== 4) {
      wrongExplanations = q.options.map((opt, i) => {
        if (i === correctIdx) return '';
        return (q.wrongExplanations && q.wrongExplanations[i]) || `Option ${String.fromCharCode(65 + i)} is incorrect for this concept.`;
      });
    }

    return {
      id: q.id || idx + 1,
      question: q.question.trim(),
      options: q.options.map((opt) => String(opt).trim()),
      correctIndex: correctIdx,
      shortExplanation: String(q.shortExplanation || 'Correct! Well done.').trim(),
      wrongExplanations: wrongExplanations.map((w) => String(w || '').trim()),
    };
  });

  return validated;
}

/**
 * Fallback questions generator when GEMINI_API_KEY is not configured
 */
function generateFallbackQuiz(topic, count, difficulty, profile) {
  const levelInfo = profile?.level || 'General';
  const roleInfo =
    profile?.level === 'School'
      ? `Grade ${profile.schoolClass || '10'} - ${profile.subject || 'General'}`
      : profile?.level === 'College'
      ? `${profile.collegeCourse || 'Undergrad'} (${profile.collegeYear || 'Year 1'})`
      : profile?.level === 'Professional'
      ? `${profile.profession || 'Professional'}`
      : 'General Learner';

  const sampleBank = [
    {
      q: `What is a fundamental core concept of ${topic} at the ${levelInfo} level (${roleInfo})?`,
      opts: [
        `It provides a foundational framework to solve problems systematically`,
        `It is entirely random with no predictable models or rules`,
        `It was deprecated and has no modern utility in practice`,
        `It only applies to theoretical research without practical application`,
      ],
      correct: 0,
      expl: `Understanding core foundational principles allows learners to generalize problem-solving across scenarios.`,
      wrong: [
        ``,
        `Incorrect because it follows structured mathematical or conceptual principles.`,
        `Incorrect because it remains widely utilized across contemporary industry and academia.`,
        `Incorrect because practical application is central to mastering this topic.`,
      ],
    },
    {
      q: `When applying ${topic} in a real-world scenario, which consideration is paramount?`,
      opts: [
        `Ignoring edge cases to save computational or mental effort`,
        `Verifying initial assumptions and validating test outcomes`,
        `Using the oldest available method without checking newer standards`,
        `Assuming that test environments behave identically to unpredictable production`,
      ],
      correct: 1,
      expl: `Validating assumptions against verifiable data ensures safety, correctness, and reliability.`,
      wrong: [
        `Ignoring edge cases frequently causes catastrophic failure under unexpected loads.`,
        ``,
        `Standards improve efficiency and security over time, so checking newer best practices is vital.`,
        `Real-world scenarios always introduce latent variables absent from sterile test environments.`,
      ],
    },
    {
      q: `Which of the following best contrasts with the typical workflow in ${topic}?`,
      opts: [
        `Continuous feedback loops and iterative refinement`,
        `One-time execution with no verification or feedback loop`,
        `Modular decomposition of complex tasks`,
        `Benchmarking performance against empirical baselines`,
      ],
      correct: 1,
      expl: `Modern paradigms strongly favor iterative refinement rather than dangerous 'fire-and-forget' approaches.`,
      wrong: [
        `Iterative refinement is indeed the standard best practice.`,
        ``,
        `Modular decomposition is a cornerstone of scalable architecture.`,
        `Benchmarking is essential to measure real improvement.`,
      ],
    },
    {
      q: `In the context of ${topic} (${difficulty} difficulty), what is the risk of over-optimization?`,
      opts: [
        `Premature complexity, reduced maintainability, and wasted development cycles`,
        `Exponential speedups that break user expectations`,
        `Higher clarity for subsequent learners and maintainers`,
        `Guaranteed elimination of all potential edge cases`,
      ],
      correct: 0,
      expl: `Premature optimization often makes systems brittle and difficult to understand before bottlenecks are proven.`,
      wrong: [
        ``,
        `Over-optimization rarely produces exponential gains without significant architectural debt.`,
        `Over-optimized code is notoriously harder to read and maintain.`,
        `Optimization does not eliminate edge cases; in fact, micro-optimizations often introduce subtle bugs.`,
      ],
    },
    {
      q: `What key metric or indicator demonstrates mastery of ${topic}?`,
      opts: [
        `Rote memorization of syntax or definitions without application ability`,
        `The ability to diagnose edge cases, articulate trade-offs, and explain concepts simply`,
        `Refusing to adopt peer feedback or newer standards`,
        `Always using the most complex terminology possible`,
      ],
      correct: 1,
      expl: `Mastery is demonstrated by deep conceptual comprehension, explaining nuances clearly, and evaluating trade-offs.`,
      wrong: [
        `Rote memorization falters when encountering novel real-world problems.`,
        ``,
        `Being receptive to peer feedback is essential for sustained professional growth.`,
        `Clear, accessible explanations are the true sign of mastery (the Feynman technique).`,
      ],
    },
  ];

  // Repeat and customize to reach requested count
  const list = [];
  for (let i = 0; i < count; i++) {
    const template = sampleBank[i % sampleBank.length];
    list.push({
      id: i + 1,
      question: `Q${i + 1}: ${template.q}`,
      options: template.opts,
      correctIndex: template.correct,
      shortExplanation: template.expl,
      wrongExplanations: template.wrong,
    });
  }
  return list;
}

/**
 * Quiz generation endpoint
 */
app.post('/api/quiz/generate', async (req, res) => {
  const { topic, questionCount = 5, difficulty = 'Medium', userProfile = {} } = req.body;

  if (!topic || topic.trim() === '') {
    return res.status(400).json({ error: 'Please specify a quiz topic.' });
  }

  const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 1), 30);
  const gemini = getGeminiClient();

  if (!gemini) {
    console.log(`[Quiz] No GEMINI_API_KEY found, using intelligent educational fallback for topic: "${topic}"`);
    const fallbackQuestions = generateFallbackQuiz(topic, count, difficulty, userProfile);
    return res.json({
      success: true,
      questions: fallbackQuestions,
      isFallback: true,
      notice: 'Generated using built-in educational engine. Add your GEMINI_API_KEY to .env for live Gemini 2.5 generations!',
    });
  }

  // Construct prompt tailored to user level
  const userLevel = userProfile.level || 'General';
  let levelDetail = '';
  if (userLevel === 'School') {
    levelDetail = `Target audience: School student in Class/Grade ${userProfile.schoolClass || '10'}, Subject: ${userProfile.subject || topic}. Keep explanations intuitive, friendly, age-appropriate, and aligned with standard curriculum concepts.`;
  } else if (userLevel === 'College') {
    levelDetail = `Target audience: College/University student studying ${userProfile.collegeCourse || 'Undergraduate coursework'} (Year ${userProfile.collegeYear || '2'}). Ensure academic depth, theoretical rigor, analytical problem-solving, and accurate technical vocabulary.`;
  } else if (userLevel === 'Professional') {
    levelDetail = `Target audience: Working Professional (${userProfile.profession || 'Specialist'}). Focus on industry best practices, real-world case scenarios, practical troubleshooting, and professional trade-offs.`;
  }

  const prompt = `You are Study Buddy, an expert AI tutor.
Generate exactly ${count} multiple-choice questions (MCQs) on the topic: "${topic}".
Difficulty: ${difficulty}.
${levelDetail}

STRICT REQUIREMENTS:
1. Return ONLY a valid JSON object matching the schema below. No markdown outside the JSON, no backticks, no comments.
2. Each question MUST have exactly 4 options.
3. "correctIndex" MUST be an integer from 0 to 3 representing the index of the correct answer.
4. "shortExplanation" must be a concise, 1-2 sentence explanation of why the correct answer is right.
5. "wrongExplanations" MUST be an array of exactly 4 strings. For the correct index, put an empty string "". For each of the three wrong options, clearly explain WHY that specific choice is incorrect, misleading, or a common misconception.

JSON Schema:
{
  "questions": [
    {
      "id": 1,
      "question": "Clear question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "shortExplanation": "Option B is correct because...",
      "wrongExplanations": [
        "Option A is incorrect because...",
        "",
        "Option C is a common pitfall because...",
        "Option D is wrong because..."
      ]
    }
  ]
}`;

  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const model = gemini.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  // Attempt generation with one retry on failure
  let attempt = 0;
  let lastError = null;

  while (attempt < 2) {
    attempt++;
    try {
      console.log(`[Quiz] Generating quiz with Gemini (attempt ${attempt}/${2}) for topic: "${topic}"...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const parsed = cleanAndParseJSON(text);
      const rawQuestions = Array.isArray(parsed) ? parsed : parsed.questions || parsed.data;
      const validated = validateQuestions(rawQuestions, count);

      return res.json({
        success: true,
        questions: validated.slice(0, count),
        isFallback: false,
      });
    } catch (err) {
      console.error(`[Quiz] Attempt ${attempt} failed:`, err.message);
      lastError = err;
    }
  }

  // If Gemini failed twice, gracefully fallback so user experience is not broken
  console.warn(`[Quiz] Gemini calls failed, serving educational fallback for topic: "${topic}"`);
  const fallback = generateFallbackQuiz(topic, count, difficulty, userProfile);
  return res.json({
    success: true,
    questions: fallback,
    isFallback: true,
    notice: `Gemini service temporarily unavailable (${lastError?.message || 'timeout'}). Loaded educational fallback so your quiz is ready!`,
  });
});

/**
 * Ask Buddy streaming chat endpoint (Server-Sent Events)
 */
app.post('/api/chat/stream', async (req, res) => {
  const { messages = [], userProfile = {} } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'No messages provided.' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const gemini = getGeminiClient();

  // If no Gemini key, provide a high-quality streaming mock response
  if (!gemini) {
    const lastUserMsg = messages[messages.length - 1]?.content || 'Hello';
    const role = userProfile.level === 'School'
      ? `Grade ${userProfile.schoolClass || '10'} student`
      : userProfile.level === 'College'
      ? `College student in ${userProfile.collegeCourse || 'studies'}`
      : userProfile.level === 'Professional'
      ? `${userProfile.profession || 'Professional'}`
      : 'Learner';

    const mockReply = `Hello! I'm **Study Buddy**, your personal AI study partner! 🎓✨

Here is a helpful explanation tailored for a **${role}** regarding:
> *"${lastUserMsg.slice(0, 120)}"*

### 💡 Key Takeaway
Whenever exploring this topic, remember the three core pillars:
1. **Understand the Foundation:** Break down complex jargon into basic, intuitive concepts.
2. **Apply with Examples:** Test the idea against a real scenario or practice exercise.
3. **Reflect & Iterate:** Identify edge cases and clarify doubts right away.

*(Note: Study Buddy is currently running in local demonstration mode. Add your \`GEMINI_API_KEY\` to your \`.env\` file to unlock full live Gemini 2.5 streaming AI answers!)*

Feel free to ask a follow-up or test me with a specific quiz! 🚀`;

    // Stream out words with small delay to emulate realistic typing
    const words = mockReply.split(' ');
    for (let i = 0; i < words.length; i++) {
      sendEvent({ chunk: (i === 0 ? '' : ' ') + words[i] });
      await new Promise((r) => setTimeout(r, 25));
    }
    sendEvent({ done: true });
    return res.end();
  }

  try {
    // Construct system instructions tailored to user level
    let personaPrompt = `You are Study Buddy, a warm, brilliant, and patient AI study tutor and mentor.
The user is at level: ${userProfile.level || 'General'}.
`;
    if (userProfile.level === 'School') {
      personaPrompt += `User is a School student (Class ${userProfile.schoolClass || '10'}, Subject: ${userProfile.subject || 'General'}).
- Explain concepts with vivid, relatable real-world analogies (e.g., sports, video games, daily life).
- Keep explanations crystal clear and step-by-step.
- Avoid unnecessarily dense academic jargon.
- Encourage curiosity with friendly emojis.
`;
    } else if (userProfile.level === 'College') {
      personaPrompt += `User is a College student (${userProfile.collegeCourse || 'Course'}, Year ${userProfile.collegeYear || '1'}).
- Provide deep, rigorous conceptual explanations, proofs, formulas, and code snippets where appropriate.
- Cite key principles, edge cases, and design patterns.
- Foster analytical critical thinking.
`;
    } else if (userProfile.level === 'Professional') {
      personaPrompt += `User is a Working Professional (${userProfile.profession || 'Professional'}).
- Provide industry-standard, battle-tested solutions and executive-level clarity.
- Focus on practical implementations, maintainability, architectural trade-offs, and efficiency.
`;
    }

    personaPrompt += `
SAFETY AND POLICY RULES:
- If the user asks for dangerous, illegal, sexually explicit, hateful, or harmful content, politely and gently refuse and redirect them back to constructive learning topics.
- Use rich GitHub-flavored Markdown: headings (###), bold text, bullet points, numbered lists, blockquotes, code blocks with language tags, and tables when helpful.
`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = gemini.getGenerativeModel({
      model: modelName,
      systemInstruction: personaPrompt,
    });

    // Convert messages history to Gemini format
    // Map roles: 'user' -> 'user', 'assistant' -> 'model'
    const contents = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const result = await model.generateContentStream({
      contents,
    });

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        sendEvent({ chunk: chunkText });
      }
    }

    sendEvent({ done: true });
    res.end();
  } catch (err) {
    console.error('[Chat] Stream error:', err);
    sendEvent({
      error: `Sorry, Study Buddy encountered an issue: ${err.message || 'Unknown error'}. Please try asking again!`,
      done: true,
    });
    res.end();
  }
});

// Start express server
app.listen(PORT, () => {
  console.log(`Study Buddy backend listening on http://localhost:${PORT}`);
});
