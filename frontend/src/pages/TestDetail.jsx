import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import ForceGraph2D from "react-force-graph-2d";

export default function TestDetail() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [test, setTest] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const graphRef = useRef();

  // Distinct cluster colors
  const clusterColors = [
    "#3182ce", "#38a169", "#dd6b20", "#805ad5",
    "#e53e3e", "#d69e2e", "#319795", "#718096"
  ];

  const getSubmissionIdByName = (name) => {
    const sub = submissions.find((s) => s.userName === name);
    return sub ? sub._id : null;
  };

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await api.get(`/tests/${id}`);
        setTest(res.data);
      } catch (err) {
        console.error("Error fetching test", err);
      }
    };
    const fetchSubs = async () => {
      try {
        const res = await api.get(`/submissions/${id}`);
        setSubmissions(res.data);
      } catch (err) {
        console.error("Error fetching submissions", err);
      }
    };
    fetchTest();
    fetchSubs();
  }, [id]);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/plagiarism/${id}/graph`);

      // Assign cluster IDs and colors to nodes
      const clusterMap = {};
      res.data.clusters.forEach((cluster, idx) => {
        cluster.forEach((n) => {
          clusterMap[n.id] = idx;
        });
      });

      const coloredNodes = res.data.nodes.map((n) => ({
        ...n,
        clusterId: clusterMap[n.id],
        color: clusterColors[clusterMap[n.id] % clusterColors.length],
      }));

      setGraphData({
        nodes: coloredNodes,
        links: res.data.edges.map((e) => ({
          source: e.from,
          target: e.to,
          similarity: e.similarity,
          fromName: e.fromName,
          toName: e.toName,
        })),
      });

      setClusters(res.data.clusters);
    } catch (err) {
      console.error("Error generating report:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionByName = (name) =>
    submissions.find((s) => s.userName === name);

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        {test && (
          <div className="mb-6 bg-white shadow rounded p-4">
            <h2 className="text-2xl font-bold">{test.title}</h2>
            <p className="text-gray-600">{test.description}</p>
            <p>{test.problemStatement}</p>
            <div className="mt-2 p-2 bg-yellow-100 rounded border text-sm">
              <strong>Test Code:</strong> {test.testCode}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Test Submissions</h2>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className={`${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            } text-white px-4 py-2 rounded shadow transition`}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>

        <div className="space-y-3 mb-10">
          {submissions.map((sub) => (
            <Link
              key={sub._id}
              to={`/submissions/${sub._id}`}
              className="block p-4 bg-white shadow rounded hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{sub.userName}</h3>
              <p className="text-sm text-gray-500">
                Submitted at {new Date(sub.submittedAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>

        {/* --- GRAPH SECTION --- */}
        {graphData && (
          <div className="bg-white shadow-lg rounded p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-center">
              Plagiarism Graph Visualization
            </h2>

            <div
              className="mx-auto border rounded-lg"
              style={{
                width: "100%",
                height: "600px",
                overflow: "hidden",
                backgroundColor: "#fafafa",
              }}
            >
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.label || node.name;
                  const fontSize = 16 / globalScale;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false); // reduced size
                  ctx.fillStyle = node.color || "#3182ce";
                  ctx.fill();
                  ctx.lineWidth = 1.5;
                  ctx.strokeStyle = "#ffffff";
                  ctx.stroke();
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillStyle = "#111";
                  ctx.fillText(label, node.x, node.y - 14);
                }}
                linkColor={() => "#888"}
                linkWidth={() => 4}
                enableNodeDrag={false}
                cooldownTicks={30}
                onEngineStop={() => {
                  if (graphRef.current) {
                    graphRef.current.zoomToFit(400, 50);
                  }
                }}
                warmupTicks={30}
              />
            </div>

            {/* --- CLUSTERS SECTION --- */}
            <div className="mt-10">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Cluster Overview
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {clusters.map((cluster, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition p-4"
                  >
                    <div className="flex items-center mb-3">
                      <span
                        className="inline-block w-4 h-4 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            clusterColors[idx % clusterColors.length],
                        }}
                      ></span>
                      <h4 className="font-semibold text-lg text-gray-800">
                        Cluster {idx + 1}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cluster.map((c, i) => {
                        const sub = getSubmissionByName(c.name);
                        return sub ? (
                          <Link
                            key={i}
                            to={`/submissions/${sub._id}`}
                            className="px-3 py-1 bg-white border rounded-full text-sm shadow-sm hover:bg-blue-50 transition"
                          >
                            {c.name}
                          </Link>
                        ) : (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                          >
                            {c.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- EDGES TABLE --- */}
            <div className="mt-10">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Similarity Report (Pairwise)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border">#</th>
                      <th className="px-4 py-2 border text-left">User A</th>
                      <th className="px-4 py-2 border text-left">User B</th>
                      <th className="px-4 py-2 border text-center">Similarity %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {graphData.links.map((link, idx) => {
                      const fromId = getSubmissionIdByName(link.fromName);
                      const toId = getSubmissionIdByName(link.toName);

                      return (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-2 border text-center font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2 border">
                            {fromId ? (
                              <Link
                                to={`/submissions/${fromId}`}
                                className="font-semibold"
                              >
                                {link.fromName}
                              </Link>
                            ) : (
                              link.fromName
                            )}
                          </td>
                          <td className="px-4 py-2 border">
                            {toId ? (
                              <Link
                                to={`/submissions/${toId}`}
                                className="font-semibold"
                              >
                                {link.toName}
                              </Link>
                            ) : (
                              link.toName
                            )}
                          </td>
                          <td
                            className={`px-4 py-2 border text-center font-semibold `}
                          >
                            <p className="text-red-600">
                              {link.similarity.toFixed(2)}%
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}