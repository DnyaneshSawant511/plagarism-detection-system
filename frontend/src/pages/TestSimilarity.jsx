import { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";

export default function TestSimilarity() {
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("http://localhost:5001/compare", {
        code1,
        code2,
      });
      setResult(res.data.final_score);
    } catch (err) {
      console.error("Error comparing codes", err);
      setResult("Error: Could not compare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Test Similarity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <textarea
            className="w-full h-[500px] p-4 border rounded-md shadow focus:outline-none focus:ring bg-white"
            placeholder="Paste first code here..."
            value={code1}
            onChange={(e) => setCode1(e.target.value)}
          />
          <textarea
            className="w-full h-[500px] p-4 border rounded-md shadow focus:outline-none focus:ring bg-white"
            placeholder="Paste second code here..."
            value={code2}
            onChange={(e) => setCode2(e.target.value)}
          />
        </div>
        <div className="mt-6 flex gap-10 items-center">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Comparing..." : "Find Similarity"}
          </button>

          {result !== null && (
            <div className="mt-6 text-lg font-semibold">
              Similarity Score:{" "}
              <span className="text-green-600">
                {typeof result === "number" ? result.toFixed(2) + "%" : result}
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}