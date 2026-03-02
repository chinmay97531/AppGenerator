import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  userId?: string;
  messages: string;
  data: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    userId: { type: String, default: null },
    messages: { type: String, default: "[]" },
    data: { type: String, default: "{}" },
  },
  { timestamps: true }
);

export const Project =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
