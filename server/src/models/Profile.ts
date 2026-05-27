import { Schema, model } from "mongoose";

const profileSchema = new Schema(
  {
    schoolName: { type: String, default: "Delhi Public School" },
    address: { type: String, default: "Sector-4, Bokaro" },
    city: { type: String, default: "Bokaro Steel City" },
    board: { type: String, default: "" },
    teacherName: { type: String, default: "John Doe" },
    teacherRole: { type: String, default: "Teacher" },
    logo: { data: Buffer, mimeType: String },
  },
  { timestamps: true }
);

export const Profile = model("Profile", profileSchema);
