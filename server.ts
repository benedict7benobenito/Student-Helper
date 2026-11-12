import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI client with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Academic Chatbot Endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], courseContext = '' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      // Graceful fallback when API key is not yet configured in Secrets
      return res.json({
        reply: `[UoE AI Academic Assistant]\nThank you for reaching out regarding "${message}". At the University of Eldoret, students are encouraged to review lecture slides, consult past CAT marking schemes in the Revision Vault, and check with their Class Rep for lecture venue and status confirmations. Feel free to ask about specific units like COM 220, COM 221, or STA 210!`
      });
    }

    const systemInstruction = `You are the University of Eldoret (UoE) AI Academic Companion and Revision Tutor.
You assist UoE students with:
1. Explaining complex lecture concepts (Computer Science, Agriculture, Mathematics, Sciences, Business, Education).
2. Guiding students on exam answering formats in Kenyan universities (marking scheme breakdown, structure, definitions, examples).
3. Helping students with time management, course schedules, and library revision strategies.
${courseContext ? `Current student context: ${courseContext}` : ''}
Tone: Encouraging, scholarly, structured with clear headings, bullet points, and code/math formatting where appropriate. Keep answers concise, actionable, and student-focused.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || 'I could not generate an answer at this time. Please try again.';
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return res.status(500).json({
      error: 'Failed to communicate with AI model',
      details: error?.message || String(error)
    });
  }
});

// 2. Automated Exam Prediction & Semester Revision Synthesizer
app.post('/api/gemini/predict-exam', async (req: Request, res: Response) => {
  try {
    const { unitCode, unitTitle, lecturer, examType = 'main_exam', notesContent = '', syllabus = '' } = req.body;

    if (!unitCode) {
      return res.status(400).json({ error: 'unitCode is required' });
    }

    if (!ai) {
      // Comprehensive high-quality fallback generator for demo testing
      const isMain = examType === 'main_exam';
      return res.json({
        summary: `### ${unitCode}: Comprehensive Semester Course Summary\n\n1. **Core Foundations**:\n   - Foundational definitions, theoretical principles, and historical context.\n   - Key architecture and functional blocks.\n\n2. **Critical Algorithms & Problem Solving**:\n   - Systematic workflow, complexity analysis, and mathematical proofs.\n   - Standard industry and academic implementations.\n\n3. **Practical Application & Case Studies**:\n   - Relational modeling, structural constraints, and optimization techniques.\n   - Real-world case study analysis aligned with Kenyan industry standards.`,
        predictedPaper: `UNIVERSITY OF ELDORET\nSCHOOL OF SCIENCE & TECHNOLOGY\nDEPARTMENT OF MATHEMATICS & COMPUTER SCIENCE\n${isMain ? 'UNIVERSITY EXAMINATION 2026/2027 (MAIN EXAM)' : 'CONTINUOUS ASSESSMENT TEST (CAT 2)'}\n\nUNIT CODE: ${unitCode}\nUNIT TITLE: ${unitTitle || 'Course Studies'}\nTIME ALLOWED: ${isMain ? '3 HOURS' : '1.5 HOURS'}\nTOTAL MARKS: ${isMain ? '70 MARKS' : '30 MARKS'}\n\nINSTRUCTIONS: Answer Question ONE (Compulsory) and any other TWO questions.\n\nQUESTION ONE (COMPULSORY - ${isMain ? '30 MARKS' : '15 MARKS'})\na) Define key terms and outline two primary objectives. (4 Marks)\nb) Differentiate between structural models and operational constraints with diagrams. (6 Marks)\nc) Solve the standard optimization equation for given parameters. (8 Marks)\nd) Explain three common pitfalls encountered in system implementation. (6 Marks)\ne) Outline the role of indexing in query performance. (6 Marks)\n\nQUESTION TWO (${isMain ? '20 MARKS' : '15 MARKS'})\na) Analyze the problem specification and design an architectural solution. (10 Marks)\nb) Write pseudocode or equations representing the optimal state transition. (10 Marks)`,
        answeringGuide: `### Examiner's Marking Scheme & Answering Strategy\n\n1. **Question 1 Structure**:\n   - Define terms explicitly before expanding.\n   - Always draw neat, labeled diagrams for structural questions.\n   - Highlight final numerical answers with units.\n\n2. **Time Allocation**:\n   - Spend 50 minutes on Question 1 (Compulsory).\n   - Spend 35 minutes each on chosen optional questions.\n   - Reserve 10 minutes at the end for reviewing calculations.`,
        whatsAppBroadcast: `🏛️ *UNIVERSITY OF ELDORET - AI EXAM PREDICTION ALERT*\n━━━━━━━━━━━━━━━━━━━━━\n📚 *Unit:* ${unitCode} - ${unitTitle}\n🎯 *Exam Type:* ${isMain ? 'Semester Main Exam' : 'Continuous Assessment Test (CAT)'}\n👨‍🏫 *Lecturer:* ${lecturer || 'Course Instructor'}\n\n🔥 *Key Focus Areas to Revise Tonight:*\n• Master Chapter 3 & 4 core definitions & derivations\n• Solve the predicted Question 1 compulsory problem\n• Review marking scheme tips in your Student Portal\n━━━━━━━━━━━━━━━━━━━━━\n📥 *Full Predicted Paper & Solutions Available:* Open your UoE Revision Vault now!`
      });
    }

    const isMain = examType === 'main_exam';
    const prompt = `You are a Senior University Examiner and Academic Specialist at the University of Eldoret (Kenya).
Your task is to analyze the course:
Unit Code: ${unitCode}
Unit Title: ${unitTitle || ''}
Lecturer: ${lecturer || 'Department Staff'}
Exam Format: ${isMain ? 'Main University Semester Examination (70 Total Marks, 3 Hours)' : 'Continuous Assessment Test (CAT - 30 Total Marks, 1.5 Hours)'}
${notesContent ? `Available Lecture Notes & Revision Material:\n${notesContent.slice(0, 3000)}` : ''}

Generate a comprehensive academic package in JSON with 4 distinct fields:
1. "summary": A structured, bulleted synthesis of everything covered in this course across the semester, highlighting key theorems, definitions, and equations.
2. "predictedPaper": A realistic, rigorously formatted University of Eldoret examination paper with:
   - Header: UNIVERSITY OF ELDORET, School, Department, Academic Year 2026/2027, Unit Code & Title, Time Allowed, Instructions.
   - Question 1 (Compulsory, with sub-parts a, b, c, d totaling ${isMain ? '30 marks' : '15 marks'}).
   - Question 2, 3, 4 (Comprehensive problem-solving and analytical questions with marks per subpart).
3. "answeringGuide": A step-by-step marking scheme guiding the student on how to structure high-scoring answers, what key phrases examiners look for, and common pitfalls to avoid.
4. "whatsAppBroadcast": A concise, engaging WhatsApp announcement (using bold *...*, bullets, emojis) alerting the student and cohort about the exam, highlighting the 3 most critical predicted topics to revise tonight.

Return only valid JSON with keys: "summary", "predictedPaper", "answeringGuide", "whatsAppBroadcast".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = {
        summary: text,
        predictedPaper: 'Predicted exam paper generated.',
        answeringGuide: 'Follow standard university answering structure.',
        whatsAppBroadcast: `📢 Exam revision alert for ${unitCode} is ready!`
      };
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/gemini/predict-exam:', error);
    return res.status(500).json({
      error: 'Failed to predict exam paper',
      details: error?.message || String(error)
    });
  }
});

// Serve frontend in dev via Vite middlewares, or static build in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`University of Eldoret Hub Server running on port ${port}`);
  });
}

startServer();
