import { Schema, model, Types } from "mongoose";

const questionSchema = new Schema(
  {
    text: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "moderate", "challenging"], required: true },
    marks: { type: Number, required: true },
    options: { type: [String], default: undefined },
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, default: "" },
    questions: { type: [questionSchema], default: [] },
  },
  { _id: false }
);

const answerSchema = new Schema(
  { n: Number, answer: String },
  { _id: false }
);

const paperSchema = new Schema(
  {
    assignmentId: { type: Types.ObjectId, ref: "Assignment", required: true, index: true },
    schoolName: String,
    subject: String,
    className: String,
    durationMins: Number,
    totalMarks: Number,
    generalInstructions: String,
    sections: { type: [sectionSchema], default: [] },
    answerKey: { type: [answerSchema], default: [] },
    pdf: Buffer,
  },
  { timestamps: { createdAt: "generatedAt", updatedAt: false } }
);

export const QuestionPaper = model("QuestionPaper", paperSchema);
