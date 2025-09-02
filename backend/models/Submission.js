import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    userName: { type: String, required: true },
    code: { type: String, required: true },
    pasteCount: { type: Number, default: 0 },
    multiFaceCount: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Submission", SubmissionSchema);