import Submission from "../models/Submission.js";
import Test from "../models/Test.js";

export const createSubmission = async (req, res) => {
  try {
    const { testCode, userName, code, pasteCount, multiFaceCount } = req.body;

    const test = await Test.findOne({ testCode });
    if (!test) {
      return res.status(404).json({ message: "Invalid test code" });
    }

    const submission = new Submission({
      testId: test._id,
      userName,
      code,
      pasteCount,
      multiFaceCount,
    });

    await submission.save();
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: "Error creating submission", error: err.message });
  }
};

export const getSubmissionsByTest = async (req, res) => {
  try {
    const submissions = await Submission.find({ testId: req.params.testId });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching submissions", error: err.message });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate("testId");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: "Error fetching submission", error: err.message });
  }
};