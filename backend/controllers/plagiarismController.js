import Submission from "../models/Submission.js";
import axios from "axios";

// DSU helper class
class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}

export const generatePlagiarismGraph = async (req, res) => {
  try {
    const { testId } = req.params;
    const submissions = await Submission.find({ testId });

    if (submissions.length < 2) {
      return res.status(200).json({
        message: "Not enough submissions to build a graph.",
        nodes: submissions.map((s) => ({ id: s._id, label: s.userName })),
        edges: [],
        clusters: [],
      });
    }

    const dsu = new DSU(submissions.length);
    const edges = [];
    const threshold = 85; // similarity percentage threshold

    // Map for easy lookup
    const idToIndex = {};
    submissions.forEach((s, idx) => (idToIndex[s._id] = idx));

    // Compare every pair, skipping same DSU sets
    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {
        // Skip if already in same cluster
        if (dsu.find(i) === dsu.find(j)) continue;

        const resSim = await axios.post("http://localhost:5001/compare", {
          code1: submissions[i].code,
          code2: submissions[j].code,
        });

        const similarity = resSim.data.final_score;
        if (similarity >= threshold) {
          // Union the sets
          dsu.union(i, j);
          edges.push({
            from: submissions[i]._id,
            to: submissions[j]._id,
            similarity,
          });
        }
      }
    }

    // Build clusters from DSU
    const clustersMap = {};
    for (let i = 0; i < submissions.length; i++) {
      const root = dsu.find(i);
      if (!clustersMap[root]) clustersMap[root] = [];
      clustersMap[root].push({
        id: submissions[i]._id,
        name: submissions[i].userName,
      });
    }

    const clusters = Object.values(clustersMap);

    const nodes = submissions.map((s) => ({
      id: s._id,
      label: s.userName,
    }));

    res.json({
      message: "Plagiarism graph generated successfully",
      nodes,
      edges,
      clusters,
    });
  } catch (err) {
    console.error("Error generating plagiarism graph:", err);
    res.status(500).json({
      message: "Error generating plagiarism graph",
      error: err.message,
    });
  }
};
