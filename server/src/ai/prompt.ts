type Config = { type: string; count: number; marksEach: number };

type PromptInput = {
  title?: string;
  className?: string;
  schoolHeader?: string;
  board?: string;
  questionConfig: Config[];
  additionalInstructions?: string;
  hasFile?: boolean;
};

export function buildPrompt(input: PromptInput) {
  const breakdown = input.questionConfig
    .map((c) => `- ${c.count} × "${c.type}" worth ${c.marksEach} marks each`)
    .join("\n");

  const topic = input.title?.trim();
  const className = input.className?.trim();
  const schoolHeader = input.schoolHeader?.trim();
  const board = input.board?.trim();

  const system = [
    "You are an expert school teacher who writes clean, exam-ready question papers.",
    "Return ONLY a JSON object (no prose, no markdown) matching this exact shape:",
    `{
  "schoolName": string,
  "subject": string,
  "className": string,
  "durationMins": number,
  "totalMarks": number,
  "generalInstructions": string,
  "sections": [
    { "name": "Section A", "title": string, "instruction": string,
      "questions": [ { "text": string, "difficulty": "easy"|"moderate"|"challenging", "marks": number, "options"?: string[] } ] }
  ],
  "answerKey": [ { "n": number, "answer": string } ]
}`,
    "Rules: group question types into sections (A, B, ...). Every question needs a difficulty and marks.",
    "Number answerKey entries continuously (1..N) across all sections, matching question order.",
    "totalMarks must equal the sum of every question's marks.",
    "Format each question by its type:",
    '- "Multiple Choice Questions": "text" holds only the question stem; "options" MUST be an array of EXACTLY 4 distinct, plausible answer strings (no "A)"/"B)" prefixes). The answerKey states the correct option text.',
    '- "True / False": "text" is a statement; set "options" to ["True","False"]; answerKey is "True" or "False" with a short reason.',
    '- "Short Answer"/"Long Answer"/"Short Questions"/"Long Questions": "text" is a direct question; omit "options".',
    '- "Numerical Problems": "text" is a problem to solve; omit "options"; answerKey shows the worked solution.',
    '- "Diagram/Graph-Based Questions": "text" fully describes the figure/scenario in words; omit "options".',
    "Write every string as plain text. Do NOT use markdown or emphasis characters — no asterisks (* or **), no underscores. Write words like \"not\" normally, never as *not*.",
    "Write each question as a self-contained exam question. Never refer to \"the notes\", \"the provided notes\", \"the document\", \"the given material\" or similar — the student only sees the paper.",
  ].join("\n");

  const user = [
    topic ? `This question paper is on the topic: "${topic}". Every question MUST be about this topic — do not drift to any other subject.` : "",
    input.hasFile
      ? "Use the attached document as the source of the concepts to test, but do not mention or cite it anywhere in the paper."
      : "",
    "\nCompose the paper with this structure:",
    breakdown,
    input.additionalInstructions ? `\nTeacher's notes: ${input.additionalInstructions}` : "",
    schoolHeader
      ? `\nSet "schoolName" to exactly "${schoolHeader}".`
      : "",
    board ? `This is a ${board} board assessment — match its style and rigour.` : "",
    className
      ? `\nSet "className" to exactly "${className}".`
      : `\nChoose an appropriate class/grade for "className".`,
    topic
      ? `Set "subject" to the concise academic subject this assessment belongs to (e.g. "Mathematics", "Computer Science"), derived from the topic — not the literal title, and never include words like "Quiz" or "Test".`
      : `Infer a sensible subject and duration.`,
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}
