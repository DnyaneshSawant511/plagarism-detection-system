import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function CompareDetail() {
  const { idA, idB } = useParams();

  const [subA, setSubA] = useState(null);
  const [subB, setSubB] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resA = await api.get(`/submissions/detail/${idA}`);
        const resB = await api.get(`/submissions/detail/${idB}`);
        setSubA(resA.data);
        setSubB(resB.data);

        const compareRes = await axios.post(
          "http://localhost:5001/compare",
          {
            code1: resA.data.code,
            code2: resB.data.code,
          }
        );

        setMetrics(compareRes.data);
      } catch (err) {
        console.error("Error loading comparison", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [idA, idB]);

  if (loading || !subA || !subB || !metrics)
    return <div className="p-5">Loading...</div>;

  const finalScoreColor =
    metrics.final_score >= 85 ? "text-red-600" : "text-gray-800";

  const classification =
    metrics.ml_prediction === 1
      ? { text: "Plagiarised", color: "text-red-600" }
      : { text: "Not Plagiarised", color: "text-green-600" };

  return (
    <div className="min-h-screen bg-white mb-14">

      <Navbar />

      {/* Title */}
      <h1 className="text-3xl font-semibold text-center font-serif text-gray-900 mb-4 mt-4">
        Comparison Report
      </h1>

      <div className="max-w-8xl mx-4 space-y-6">

        {/* Code Comparison Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Code Box A */}
          <div className="border border-gray-300 rounded-sm">
            <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-800 text-md">
              {subA.userName || "Submission A"}
            </div>
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed">
              {subA.code}
            </pre>
          </div>

          {/* Code Box B */}
          <div className="border border-gray-300 rounded-sm">
            <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-800 text-md">
              {subB.userName || "Submission B"}
            </div>
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed">
              {subB.code}
            </pre>
          </div>

        </div>

        {/* Metrics Table */}
        <div className="max-w-4xl mx-auto border border-gray-300 rounded-md p-4 bg-white">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 text-center">
            Similarity Metrics
          </h2>

          <table className="w-full text-base border-collapse">
            <tbody className="font-sans">

              {[
                ["Abstract Syntax Tree", metrics.metrics.AST],
                ["Cosine CountVectorizer", metrics.metrics.Cosine],
                ["Cosine TF-IDF", metrics.metrics.TFIDF],
                ["Levenshtein Distance", metrics.metrics.Levenshtein],
                ["Jaccard", metrics.metrics.Jaccard],
              ].map(([label, value]) => (
                <tr key={label} className="border-t">
                  <td className="py-3 px-3 font-bold text-gray-700 w-1/2 tracking-wider">
                    {label}
                  </td>
                  <td className="py-3 px-3 text-gray-800 font-medium">
                    {value}%
                  </td>
                </tr>
              ))}

              {/* Classification Row */}
              <tr className="border-t">
                <td className="py-3 px-3 font-bold text-gray-700 w-1/2 tracking-wider">
                  Classification Model Result
                </td>
                <td className={`py-3 px-3 font-semibold ${classification.color}`}>
                  {classification.text}
                </td>
              </tr>

              {/* Final Score Row */}
              <tr className="border-t">
                <td className="py-3 px-3 font-bold text-gray-700 w-1/2 tracking-wider">
                  Final Score
                </td>
                <td className={`py-3 px-3 font-semibold ${finalScoreColor}`}>
                  {metrics.final_score}%
                </td>
              </tr>

            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
