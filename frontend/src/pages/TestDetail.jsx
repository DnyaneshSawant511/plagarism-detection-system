import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function TestDetail() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [test, setTest] = useState(null);

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

  return (
    <div>
      <Navbar />
      <div className="p-6">

        {test && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{test.title}</h2>
            <p className="text-gray-600">{test.description}</p>
            <div className="mt-2 p-2 bg-yellow-100 rounded border">
              <strong>Test Code:</strong> {test.testCode}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Test Submissions</h2>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Generate Report
          </button>
        </div>
        
        <div className="space-y-3">
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
      </div>
    </div>
  );
}