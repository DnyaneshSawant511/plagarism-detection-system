import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function SubmissionDetail() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await api.get(`/submissions/detail/${id}`);
        setSubmission(res.data);
      } catch (err) {
        console.error("Error fetching submission", err);
      }
    };
    fetchSubmission();
  }, [id]);

  if (!submission) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
        <h2 className="text-2xl font-bold mb-4">
          Submission by {submission.userName}
        </h2>
        <p><strong>Paste Count:</strong> {submission.pasteCount}</p>
        <p><strong>Multi Face Count:</strong> {submission.multiFaceCount}</p>
        <p><strong>Submitted At:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Code:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {submission.code}
          </pre>
        </div>
      </div>
    </div>
  );
}
