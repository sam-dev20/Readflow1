import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { FALLBACK_PASSAGES } from './src/data/fallbackPassages';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  let fallbackCounter = 0;

  app.post('/api/generate-passage', async (req, res) => {
    try {
      const difficulty = req.body.difficulty || 'medium';
      const requestedTopic = (req.body.topic || '').trim();

      if (ai) {
        const prompt = `You are an academic reading comprehension exam creator for standardized exams like IELTS Academic and TOEFL. Generate an authentic, fact-grounded academic reading comprehension passage with rigorous comprehension questions.
Difficulty: ${difficulty}
${requestedTopic ? `Topic: ${requestedTopic}` : 'Topic: Choose a scholarly topic in Archaeology, Marine Geology, Cognitive Science, Linguistics, Astrophysics, Urban Ecology, or Engineering History.'}

Requirements:
- 5 to 7 clearly delineated paragraphs labeled A, B, C, D, E, F (and G if suitable), totaling 650 to 800 words.
- Scholarly, authoritative vocabulary and measured tone.
- 6 True / False / Not Given (TFNG) questions testing precise comprehension:
  * id: 1 to 6
  * statement: clear statement testing assertions in the text
  * correctAnswer: 'TRUE' | 'FALSE' | 'NOT GIVEN' (include at least 1 of each, balanced)
  * paragraphRef: paragraph letter where proof is found
  * explanation: clear explanation of why this answer is correct
  * sourceQuote: sentence or direct quote from the paragraph
- 5 Fill in the Blanks questions:
  * id: 1 to 5
  * prefix: sentence prefix
  * suffix: sentence suffix
  * acceptableAnswers: array of acceptable string variations in lowercase
  * displayAnswer: the canonical answer word or 2-word phrase taken directly from the text
  * paragraphRef: paragraph letter
  * explanation: concise context explanation
  * sourceQuote: excerpt from the paragraph
- blanksInstruction: "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer."

Return ONLY valid JSON matching this structure:
{
  "id": "generated-${Date.now()}",
  "title": "Passage Title",
  "subtitle": "Subtitle describing the research context",
  "difficulty": "${difficulty}",
  "category": "Discipline Category",
  "wordCount": 720,
  "estimatedReadTime": "4 min",
  "blanksInstruction": "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
  "paragraphs": [
    { "id": "A", "text": "Paragraph A text..." },
    { "id": "B", "text": "Paragraph B text..." }
  ],
  "tfngQuestions": [
    {
      "id": 1,
      "statement": "Statement...",
      "correctAnswer": "TRUE",
      "paragraphRef": "A",
      "explanation": "Explanation...",
      "sourceQuote": "Source quote..."
    }
  ],
  "fillBlankQuestions": [
    {
      "id": 1,
      "prefix": "Prefix...",
      "suffix": "Suffix...",
      "acceptableAnswers": ["answer"],
      "displayAnswer": "answer",
      "paragraphRef": "A",
      "explanation": "Explanation...",
      "sourceQuote": "Source quote..."
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        try {
          const passage = JSON.parse(rawText);
          if (passage.title && Array.isArray(passage.paragraphs) && passage.paragraphs.length > 0) {
            passage.id = `gen-${Date.now()}`;
            passage.isGenerated = true;
            return res.json({ success: true, passage, source: 'gemini' });
          }
        } catch (jsonErr) {
          console.error('Failed to parse Gemini JSON output:', jsonErr);
        }
      }

      // Fallback selection if no API key or generation failed
      const eligible = FALLBACK_PASSAGES.filter((p) => p.difficulty === difficulty);
      const chosen =
        eligible.length > 0
          ? eligible[fallbackCounter % eligible.length]
          : FALLBACK_PASSAGES[fallbackCounter % FALLBACK_PASSAGES.length];
      fallbackCounter++;

      const cloned = JSON.parse(JSON.stringify(chosen));
      cloned.id = `gen-${Date.now()}`;
      cloned.isGenerated = true;
      return res.json({ success: true, passage: cloned, source: 'fallback' });
    } catch (err) {
      console.error('Passage generation handler error:', err);
      const chosen = FALLBACK_PASSAGES[fallbackCounter % FALLBACK_PASSAGES.length];
      fallbackCounter++;
      const cloned = JSON.parse(JSON.stringify(chosen));
      cloned.id = `gen-${Date.now()}`;
      cloned.isGenerated = true;
      return res.json({ success: true, passage: cloned, source: 'fallback' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
