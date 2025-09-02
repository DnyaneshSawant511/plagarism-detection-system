import Test from "../models/Test.js";
import { nanoid } from "nanoid"; // unique short ids

export async function createTest(req, res) {
  try {
    const { title, description, durationMinutes, problemStatement } = req.body;

    const testCode = nanoid(6).toUpperCase();

    const test = new Test({
      title,
      description,
      problemStatement,
      createdBy: req.admin.id,
      testCode,
      durationMinutes
    });

    await test.save();
    res.status(201).json({ message: "Test created", testId: test._id, testCode });
  } catch (err) {
    console.error("Create Test Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getTests(req, res) {
  try {
    const tests = await Test.find({ createdBy: req.admin.id }).sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) {
    console.error("Get Tests Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getTestById(req, res) {
  try {
    const test = await Test.findOne({ _id: req.params.id, createdBy: req.admin.id });
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json(test);
  } catch (err) {
    console.error("Get Test Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getTestByCode(req, res) {
  try {
    const test = await Test.findOne({ testCode: req.params.code });
    if (!test) return res.status(404).json({ message: "Test not found" });

    res.json({
      title: test.title,
      description: test.description,
      problemStatement: test.problemStatement,
      durationMinutes: test.durationMinutes,
      testCode: test.testCode
    });
  } catch (err) {
    console.error("Get Test by Code Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}