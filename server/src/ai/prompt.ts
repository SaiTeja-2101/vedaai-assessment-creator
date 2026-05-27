type Config = { type: string; count: number; marksEach: number };

type PromptInput = {
  questionConfig: Config[];
  additionalInstructions?: string;
  sourceText?: string;
  dueDate?: string;
};

export function buildPrompt(input: PromptInput) {
  const breakdown = input.questionConfig
    .map((c) => `- ${c.count} × "${c.type}" worth ${c.marksEach} marks each`)
    .join("\n");

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
      "questions": [ { "text": string, "difficulty": "easy"|"moderate"|"challenging", "marks": number } ] }
  ],
  "answerKey": [ { "n": number, "answer": string } ]
}`,
    "Rules: group question types into sections (A, B, ...). Every question needs a difficulty and marks.",
    "Number answerKey entries continuously (1..N) across all sections, matching question order.",
    "totalMarks must equal the sum of every question's marks.",
  ].join("\n");

  const user = [
    "Create a question paper with this composition:",
    breakdown,
    input.additionalInstructions ? `\nTeacher's notes: ${input.additionalInstructions}` : "",
    input.sourceText ? `\nReference material:\n${input.sourceText.slice(0, 4000)}` : "",
    "\nInfer a sensible subject, class and duration if not stated.",
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}
