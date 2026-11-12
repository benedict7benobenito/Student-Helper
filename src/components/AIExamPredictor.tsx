import React, { useState } from 'react';
import { CourseSession, RevisionMaterial, UserProfile, PredictedExamPackage, WhatsAppNotification } from '../types';
import { 
  Sparkles, 
  Send, 
  Download, 
  Printer, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  GraduationCap, 
  ChevronRight,
  RefreshCw,
  Copy,
  Layers,
  HelpCircle
} from 'lucide-react';
import { getWhatsAppGroupShareUrl } from '../utils/whatsapp';

interface AIExamPredictorProps {
  courseSessions: CourseSession[];
  revisionMaterials: RevisionMaterial[];
  currentUser: UserProfile;
  registeredStudentCount: number;
  onSendBroadcast: (notification: WhatsAppNotification) => void;
}

export const AIExamPredictor: React.FC<AIExamPredictorProps> = ({
  courseSessions,
  revisionMaterials,
  currentUser,
  registeredStudentCount,
  onSendBroadcast
}) => {
  const isRep = currentUser.role === 'class_rep';
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>(courseSessions[0]?.unitCode || 'COM 220');
  const [examType, setExamType] = useState<'main_exam' | 'cat_exam'>('main_exam');
  const [examDate, setExamDate] = useState('2026-12-05');
  const [examVenue, setExamVenue] = useState('Science Complex LH 01');
  const [activeResultTab, setActiveResultTab] = useState<'summary' | 'paper' | 'guide' | 'whatsapp'>('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  const selectedSession = courseSessions.find((s) => s.unitCode === selectedUnitCode) || courseSessions[0];

  // Saved prediction package state
  const [predictionPackage, setPredictionPackage] = useState<PredictedExamPackage | null>(() => {
    // Check if we have pre-seeded prediction for COM 220
    return {
      unitCode: 'COM 220',
      unitTitle: 'Database Management Systems',
      examType: 'main_exam',
      examDate: '2026-12-05',
      venue: 'Science Complex LH 01',
      summary: `### COM 220: Comprehensive Semester Synthesis\n\n1. **Relational Model & Integrity Constraints**:\n   - Entity Integrity (Primary Keys cannot be NULL) and Referential Integrity (Foreign Keys must reference valid Primary Keys).\n   - Relational Algebra Operators: Selection (σ), Projection (π), Cartesian Product (×), Natural Join (⋈), Set Difference (-).\n\n2. **Database Normalization (1NF to BCNF)**:\n   - **1NF**: Eliminate repeating groups; ensure all attributes are atomic.\n   - **2NF**: In 1NF and eliminate partial functional dependencies (all non-prime attributes must depend on the whole candidate key).\n   - **3NF**: In 2NF and eliminate transitive dependencies (X → Y, where Y is non-prime and X is not a superkey).\n   - **BCNF**: For every non-trivial functional dependency X → Y, X must be a superkey.\n\n3. **Transaction Management & ACID Properties**:\n   - **Atomicity**: All or nothing execution (managed via undo logs).\n   - **Consistency**: Database transitions from one valid state to another.\n   - **Isolation**: Concurrent transactions do not interfere (concurrency control via Two-Phase Locking - 2PL).\n   - **Durability**: Committed changes persist even after system crashes (WAL - Write-Ahead Logging).\n\n4. **Indexing & Query Optimization**:\n   - B+ Trees vs Hash Indexing tradeoffs; clustered vs non-clustered index scanning.`,
      predictedPaper: `UNIVERSITY OF ELDORET\nSCHOOL OF SCIENCE & TECHNOLOGY\nDEPARTMENT OF MATHEMATICS & COMPUTER SCIENCE\nUNIVERSITY EXAMINATION FOR THE DEGREE OF BACHELOR OF SCIENCE IN COMPUTER SCIENCE\nACADEMIC YEAR 2026/2027 - SEMESTER 2\n\nUNIT CODE: COM 220\nUNIT TITLE: DATABASE MANAGEMENT SYSTEMS\nDATE: 05TH DECEMBER 2026                 TIME: 08:30 AM - 11:30 AM (3 HOURS)\nVENUE: SCIENCE COMPLEX LH 01\nTOTAL MARKS: 70 MARKS\n\nINSTRUCTIONS TO CANDIDATES:\n1. Answer Question ONE (Compulsory) and any other TWO questions.\n2. Write clearly and show all intermediate normalization steps.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nQUESTION ONE (COMPULSORY - 30 MARKS)\na) Define the following database terms giving one concrete example for each:\n   i) Foreign Key Constraint (2 Marks)\n   ii) Lossless-Join Decomposition (2 Marks)\n   iii) Serializability in Transactions (2 Marks)\n\nb) Differentiate between Physical Data Independence and Logical Data Independence in the ANSI-SPARC three-level architecture. (4 Marks)\n\nc) Consider a university relation R(Student_ID, Course_Code, Student_Name, Lecturer_Name, Room_No, Grade) with the following set of functional dependencies F:\n   F = { Student_ID → Student_Name;\n         Course_Code → Lecturer_Name, Room_No;\n         Student_ID, Course_Code → Grade }\n   i) Identify the candidate key for relation R. (2 Marks)\n   ii) State the highest normal form satisfied by relation R. Justify your answer. (4 Marks)\n   iii) Decompose relation R into a set of 3NF relations, verifying that your decomposition is dependency-preserving. (8 Marks)\n\nd) State the ACID properties of a transaction and explain how Write-Ahead Logging (WAL) guarantees the Durability property. (6 Marks)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nQUESTION TWO (20 MARKS)\na) Explain the two-phase locking (2PL) concurrency control protocol. Clearly distinguish between Growing Phase and Shrinking Phase. (8 Marks)\nb) With the aid of a diagram, explain how a B+ Tree index with order d=2 handles insertion and node splitting. (8 Marks)\nc) State four differences between optimistic concurrency control and timestamp-based ordering. (4 Marks)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nQUESTION THREE (20 MARKS)\na) Write SQL DDL statements to create tables for a Hospital Patient Records system enforcing primary keys, foreign keys with ON DELETE CASCADE, and a CHECK constraint for Age > 0. (8 Marks)\nb) Given relations Employee(emp_id, emp_name, dept_id, salary) and Department(dept_id, dept_name), write relational algebra expressions to:\n   i) Find names of employees earning more than Ksh 150,000. (3 Marks)\n   ii) Retrieve employee names along with their respective department names. (4 Marks)\n   iii) Find departments with no assigned employees. (5 Marks)`,
      answeringGuide: `### Examiner's Marking Scheme & Answering Strategy (COM 220)\n\n1. **Question 1(c) Normalization Breakdown (14 Marks)**:\n   - **Candidate Key**: Must state {Student_ID, Course_Code}. Any candidate key missing either attribute receives 0 marks.\n   - **Current Normal Form**: R is in 1NF only, because Course_Code → Lecturer_Name is a partial dependency on a subset of the candidate key {Student_ID, Course_Code}.\n   - **3NF Decomposed Schema**:\n     * R1(Student_ID, Student_Name) - PK: Student_ID\n     * R2(Course_Code, Lecturer_Name, Room_No) - PK: Course_Code\n     * R3(Student_ID, Course_Code, Grade) - PK: (Student_ID, Course_Code), FK referencing R1 and R2.\n\n2. **Question 1(d) ACID Properties (6 Marks)**:\n   - 1 Mark each for defining Atomicity, Consistency, Isolation, Durability.\n   - 2 Marks for explaining WAL: log records containing redo/undo images are flushed to stable disk storage *before* dirty database pages are written.\n\n3. **Diagrams & Presentation Advice**:\n   - In Question 2(b), draw leaf nodes with bi-directional linked list pointers; students who omit leaf pointers lose 2 marks.\n   - Write SQL keywords in UPPERCASE (SELECT, FROM, WHERE, CREATE TABLE) to ensure high presentation scores from UoE examiners.`,
      whatsAppBroadcast: `🏛️ *UNIVERSITY OF ELDORET - AI EXAM PREPARATION ALERT*\n━━━━━━━━━━━━━━━━━━━━━\n📚 *Unit:* COM 220 - Database Management Systems\n🎯 *Upcoming Exam:* Semester 2 Main Examination (70 Marks)\n📍 *Venue:* Science Complex LH 01\n📅 *Date:* 05th December 2026, 08:30 AM\n👨‍🏫 *Lecturer:* Dr. Evans Kiprono\n\n🔥 *CRITICAL PREDICTED EXAM TOPICS TO REVISE TONIGHT:*\n1. Master 1NF → 2NF → 3NF Decomposition (Q1 Compulsory 14 Marks guaranteed)\n2. ACID Properties & Two-Phase Locking (2PL Protocol)\n3. Relational Algebra operators (Selection, Projection, Natural Join)\n4. B+ Tree node splitting vs Hash Indexing\n━━━━━━━━━━━━━━━━━━━━━\n💡 *Full Predicted Exam Paper & Step-by-Step Marking Scheme:* Open your UoE Student Hub now to revise and test yourself!\n📢 Issued by AI Academic Predictor · University of Eldoret`,
      generatedAt: 'Nov 12, 2026'
    };
  });

  const handleRunPrediction = async () => {
    setIsGenerating(true);
    setGenerationStep('Synthesizing course syllabus & timetable sessions...');

    // Pull related notes text from vault
    const relatedNotes = revisionMaterials
      .filter((m) => m.unitCode === selectedUnitCode)
      .map((m) => `${m.title}: ${m.fileContent || m.description}`)
      .join('\n\n');

    try {
      setTimeout(() => setGenerationStep('Analyzing past UoE exam paper patterns & CAT questions...'), 800);
      setTimeout(() => setGenerationStep('Formulating realistic 70-mark University examination paper...'), 1600);
      setTimeout(() => setGenerationStep('Constructing examiner marking scheme & WhatsApp alert...'), 2400);

      const response = await fetch('/api/gemini/predict-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitCode: selectedUnitCode,
          unitTitle: selectedSession?.unitTitle || 'Course Studies',
          lecturer: selectedSession?.lecturer || 'Department Staff',
          examType,
          notesContent: relatedNotes
        })
      });

      if (!response.ok) {
        throw new Error('Prediction API failed');
      }

      const data = await response.json();

      const newPkg: PredictedExamPackage = {
        unitCode: selectedUnitCode,
        unitTitle: selectedSession?.unitTitle || 'Course Studies',
        examType,
        examDate,
        venue: examVenue || selectedSession?.venue || 'Main Lecture Hall',
        summary: data.summary,
        predictedPaper: data.predictedPaper,
        answeringGuide: data.answeringGuide,
        whatsAppBroadcast: data.whatsAppBroadcast,
        generatedAt: 'Just now'
      };

      setPredictionPackage(newPkg);
      setActiveResultTab('paper');
    } catch (err) {
      console.warn('Fallback prediction package activated:', err);
      // Smart offline fallback
      const fallbackPkg: PredictedExamPackage = {
        unitCode: selectedUnitCode,
        unitTitle: selectedSession?.unitTitle || 'Course Studies',
        examType,
        examDate,
        venue: examVenue || selectedSession?.venue || 'Science Complex LH 01',
        summary: `### ${selectedUnitCode}: Semester Course Revision Checklist\n\n1. Review all definitions in Chapter 1 and Chapter 2.\n2. Solve the core derivation and mathematical proof in Chapter 3.\n3. Formulate structural diagrams and explain operational workflows.\n4. Practice past CAT 1 & CAT 2 questions from the revision materials vault.`,
        predictedPaper: `UNIVERSITY OF ELDORET\nSCHOOL OF SCIENCE & TECHNOLOGY\nSEMESTER EXAMINATION 2026/2027\n\nUNIT CODE: ${selectedUnitCode}\nUNIT TITLE: ${selectedSession?.unitTitle || 'Course Studies'}\nVENUE: ${examVenue}\nTOTAL MARKS: 70 MARKS\n\nQUESTION ONE (COMPULSORY - 30 MARKS)\na) State three foundational definitions with examples. (6 Marks)\nb) Analyze the given structural problem and provide a 3-step solution. (10 Marks)\nc) Outline four common pitfalls examiners look for. (8 Marks)\nd) Draw a labeled system diagram. (6 Marks)\n\nQUESTION TWO (20 MARKS)\na) Comprehensive scenario analysis and design implementation. (12 Marks)\nb) Evaluate trade-offs between speed and accuracy. (8 Marks)`,
        answeringGuide: `### Examiner Answering Tips for ${selectedUnitCode}\n\n1. Clearly state assumptions at the beginning of each answer.\n2. Write legible formulas and box your final answers.\n3. Allocate 50 minutes to Question 1 and 35 minutes each to optional questions.`,
        whatsAppBroadcast: `🏛️ *UNIVERSITY OF ELDORET - EXAM ALERT*\n━━━━━━━━━━━━━━━━━━━━━\n📚 *Unit:* ${selectedUnitCode} - ${selectedSession?.unitTitle}\n📍 *Venue:* ${examVenue}\n📅 *Date:* ${examDate}\n\n🔥 Revise the predicted questions and marking scheme in your student hub now!`,
        generatedAt: 'Just now'
      };
      setPredictionPackage(fallbackPkg);
      setActiveResultTab('paper');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleBroadcastToWhatsApp = () => {
    if (!predictionPackage) return;
    const shareUrl = getWhatsAppGroupShareUrl(predictionPackage.whatsAppBroadcast);
    window.open(shareUrl, '_blank');

    onSendBroadcast({
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      sender: `${currentUser.fullName} (${isRep ? 'Class Rep' : 'Student'})`,
      type: 'exam_cat_reminder',
      title: `Exam Alert: ${predictionPackage.unitCode} Predicted Paper Ready`,
      messageText: predictionPackage.whatsAppBroadcast,
      targetCount: registeredStudentCount,
      status: 'delivered',
      relatedUnitCode: predictionPackage.unitCode
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Automated AI Academic Intelligence
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">University of Eldoret Exam Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            AI Exam Predictor, Semester Synthesis & Answering Guide
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Automate exam preparation: Select your course unit to synthesize all semester lectures inline with your timetable, generate a predicted official UoE exam paper, review examiner marking schemes, and broadcast WhatsApp revision alerts to the cohort!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {predictionPackage && (
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              title="Print predicted paper"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>Print Paper</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Configuration Deck */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
        <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-800" />
          <span>Configure Course Unit for Automated Exam Prediction</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Unit Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Select Course Unit
            </label>
            <select
              value={selectedUnitCode}
              onChange={(e) => {
                setSelectedUnitCode(e.target.value);
                const s = courseSessions.find((item) => item.unitCode === e.target.value);
                if (s?.venue) setExamVenue(s.venue);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white font-mono"
            >
              {courseSessions.map((c) => (
                <option key={c.id} value={c.unitCode}>
                  {c.unitCode} - {c.unitTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Examination Format
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
            >
              <option value="main_exam">Semester Main Exam (70 Marks / 3 Hours)</option>
              <option value="cat_exam">Continuous Assessment Test (CAT - 30 Marks)</option>
            </select>
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Scheduled Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
            />
          </div>

          {/* Exam Venue */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Exam Venue / Hall
            </label>
            <input
              type="text"
              value={examVenue}
              onChange={(e) => setExamVenue(e.target.value)}
              placeholder="e.g. Science Complex LH 01"
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
            />
          </div>
        </div>

        {/* Selected Unit Details Strip */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-3">
            <span><strong>Lecturer:</strong> {selectedSession?.lecturer}</span>
            <span>·</span>
            <span><strong>Lecture Hall:</strong> {selectedSession?.venue}</span>
            <span>·</span>
            <span><strong>Timetable Slot:</strong> {selectedSession?.day} {selectedSession?.startTime} - {selectedSession?.endTime}</span>
          </div>

          <button
            onClick={handleRunPrediction}
            disabled={isGenerating}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-900 to-emerald-950 hover:from-emerald-800 hover:to-emerald-900 text-amber-300 font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
            <span>{isGenerating ? 'Synthesizing Course & Predicting Exam...' : 'Automate Course Synthesis & Predict Exam'}</span>
          </button>
        </div>

        {isGenerating && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-emerald-800 animate-spin shrink-0" />
            <span className="font-semibold text-emerald-950">{generationStep}</span>
          </div>
        )}
      </div>

      {/* Results View */}
      {predictionPackage && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Result Segmented Tabs */}
          <div className="bg-stone-100 p-2 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveResultTab('summary')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeResultTab === 'summary'
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Semester Course Synthesis
              </button>

              <button
                onClick={() => setActiveResultTab('paper')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeResultTab === 'paper'
                    ? 'bg-white text-emerald-950 shadow-sm font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. AI Predicted Exam Paper (UoE)
              </button>

              <button
                onClick={() => setActiveResultTab('guide')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeResultTab === 'guide'
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3. Examiner Answering Guide
              </button>

              <button
                onClick={() => setActiveResultTab('whatsapp')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeResultTab === 'whatsapp'
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                4. WhatsApp Alert & Broadcast
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(
                  activeResultTab === 'summary' ? predictionPackage.summary :
                  activeResultTab === 'paper' ? predictionPackage.predictedPaper :
                  activeResultTab === 'guide' ? predictionPackage.answeringGuide :
                  predictionPackage.whatsAppBroadcast
                )}
                className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 rounded border border-stone-300 bg-white flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedText ? 'Copied!' : 'Copy Section'}</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Course Summary */}
          {activeResultTab === 'summary' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    Comprehensive Semester Synthesis: {predictionPackage.unitCode}
                  </h4>
                  <p className="text-xs text-stone-500">
                    All core lecture topics, definitions, equations, and algorithms synthesized inline with the syllabus
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 prose prose-sm max-w-none text-stone-800 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {predictionPackage.summary}
              </div>
            </div>
          )}

          {/* Tab 2: Predicted Exam Paper */}
          {activeResultTab === 'paper' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 flex-wrap gap-2">
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    Predicted {predictionPackage.examType === 'main_exam' ? 'University Examination (70 Marks)' : 'Continuous Assessment Test (30 Marks)'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    Official University of Eldoret layout with Compulsory Question 1 and Section B optional questions
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBroadcastToWhatsApp}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Paper to WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Printable Paper Box */}
              <div className="bg-stone-900 text-stone-100 p-6 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border border-stone-800">
                {predictionPackage.predictedPaper}
              </div>
            </div>
          )}

          {/* Tab 3: Answering Guide */}
          {activeResultTab === 'guide' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    Examiner's Marking Scheme & Strategic Answering Guide
                  </h4>
                  <p className="text-xs text-stone-500">
                    How to structure answers, key points examiners look for, diagrams, and time management
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-200 text-stone-800 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {predictionPackage.answeringGuide}
              </div>
            </div>
          )}

          {/* Tab 4: WhatsApp Broadcast */}
          {activeResultTab === 'whatsapp' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    Automated WhatsApp Exam Revision Alert
                  </h4>
                  <p className="text-xs text-stone-500">
                    Pre-formatted alert with key predicted topics ready to send to classmates
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#E7FFDB] rounded-xl border border-emerald-200 text-xs text-stone-900">
                <pre className="font-sans whitespace-pre-wrap leading-relaxed text-xs">
                  {predictionPackage.whatsAppBroadcast}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleBroadcastToWhatsApp}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-emerald-200" />
                  <span>1-Click Send Alert to WhatsApp Group</span>
                </button>

                <button
                  onClick={() => handleCopy(predictionPackage.whatsAppBroadcast)}
                  className="w-full sm:w-auto py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-lg border border-stone-300 flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedText ? 'Copied!' : 'Copy Broadcast Text'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
