import { Schema, model } from "mongoose";

const TestSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    problemStatement: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    testCode: { type: String, required: true, unique: true },
    durationMinutes: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export default model("Test", TestSchema);