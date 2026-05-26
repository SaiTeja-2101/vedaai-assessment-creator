export type Difficulty = "easy" | "moderate" | "challenging";

export type PaperQuestion = {
  text: string;
  difficulty: Difficulty;
  marks: number;
};

export type PaperSection = {
  name: string; // e.g. "Section A"
  title: string; // e.g. "Short Answer Questions"
  instruction: string; // e.g. "Attempt all questions. Each question carries 2 marks"
  questions: PaperQuestion[];
};

export type AnswerKeyEntry = {
  /** 1-based question number this answer corresponds to. */
  n: number;
  answer: string; // may contain newlines (equations)
};

export type QuestionPaper = {
  schoolName: string;
  subject: string;
  className: string;
  durationMins: number;
  totalMarks: number;
  generalInstructions: string;
  sections: PaperSection[];
  answerKey: AnswerKeyEntry[];
};

/**
 * Mock structured paper (the Figma's Electricity example). This stands in for
 * the AI-generated, Zod-validated paper until the backend exists — note it is
 * structured data, NOT a raw text blob, so the UI renders typed components.
 */
const ELECTRICITY_PAPER: QuestionPaper = {
  schoolName: "Delhi Public School, Sector-4, Bokaro",
  subject: "English",
  className: "5th",
  durationMins: 45,
  totalMarks: 20,
  generalInstructions: "All questions are compulsory unless stated otherwise.",
  sections: [
    {
      name: "Section A",
      title: "Short Answer Questions",
      instruction: "Attempt all questions. Each question carries 2 marks",
      questions: [
        { difficulty: "easy", marks: 2, text: "Define electroplating. Explain its purpose." },
        { difficulty: "moderate", marks: 2, text: "What is the role of a conductor in the process of electrolysis?" },
        { difficulty: "easy", marks: 2, text: "Why does a solution of copper sulfate conduct electricity?" },
        { difficulty: "moderate", marks: 2, text: "Describe one example of the chemical effect of electric current in daily life." },
        { difficulty: "moderate", marks: 2, text: "Explain why electric current is said to have chemical effects." },
        { difficulty: "challenging", marks: 2, text: "How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved." },
        { difficulty: "challenging", marks: 2, text: "What happens at the cathode and anode during the electrolysis of water? Name the gases evolved." },
        { difficulty: "easy", marks: 2, text: "Mention the type of current used in electroplating and justify why it is used." },
        { difficulty: "moderate", marks: 2, text: "What is the importance of electric current in the field of metallurgy?" },
        { difficulty: "challenging", marks: 2, text: "Explain with a chemical equation how copper is deposited during the electroplating of an object." },
      ],
    },
  ],
  answerKey: [
    { n: 1, answer: "Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness." },
    { n: 2, answer: "A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at the electrodes." },
    { n: 3, answer: "Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity." },
    { n: 4, answer: "An example is the electroplating of silver on jewelry to prevent tarnishing." },
    { n: 5, answer: "Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it shows chemical effects." },
    { n: 6, answer: "Sodium hydroxide is formed at the cathode during brine electrolysis as water gains electrons:\n2H₂O + 2e⁻ → H₂ + 2OH⁻\nNa⁺ + OH⁻ → NaOH (in solution)" },
    { n: 7, answer: "At the cathode: water is reduced to hydrogen gas and hydroxide ions.\nAt the anode: water is oxidized to oxygen gas and hydrogen ions." },
    { n: 8, answer: "Direct current (DC) is used because it produces a consistent flow of electrons necessary for controlled deposition of metals." },
    { n: 9, answer: "Electric current helps extract metals from their ores and purify metals by electrolysis in metallurgy." },
    { n: 10, answer: "During copper electroplating, copper ions in solution gain electrons at the cathode and deposit as copper metal:\nCu²⁺ + 2e⁻ → Cu (solid)" },
  ],
};

/** Looks up a generated paper. Backend phase swaps this for an API fetch. */
export function getMockPaper(_id: string): QuestionPaper {
  return ELECTRICITY_PAPER;
}

/** Greeting shown in the AI banner above the paper. */
export const PAPER_INTRO =
  "Certainly! Here is the customized Question Paper for your CBSE Grade 8 Science class on the NCERT chapters:";
