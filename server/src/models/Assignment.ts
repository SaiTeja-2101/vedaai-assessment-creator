import { Schema, model, Types } from "mongoose";

const configSchema = new Schema(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true },
    marksEach: { type: Number, required: true },
  },
  { _id: false }
);

const assignmentSchema = new Schema(
  {
    title: { type: String, default: "Untitled Assignment" },
    className: String,
    sourceText: String,
    sourceFile: {
      data: Buffer,
      mimeType: String,
      name: String,
    },
    dueDate: { type: Date, required: true },
    questionConfig: { type: [configSchema], default: [] },
    additionalInstructions: String,
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },
    error: String,
    paperId: { type: Types.ObjectId, ref: "QuestionPaper" },
  },
  { timestamps: true }
);

export const Assignment = model("Assignment", assignmentSchema);
