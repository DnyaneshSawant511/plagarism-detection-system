import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function CreateTest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [testCode, setTestCode] = useState(null);
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        "/tests",
        { title, description, problemStatement: problem },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestCode(res.data.testCode);
      alert("Test created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create test");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4">Create Test</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            placeholder="Problem Statement"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
          >
            Create Test
          </button>
        </form>

        {testCode && (
          <div className="mt-4 p-3 bg-gray-100 border rounded">
            <strong>Test Code:</strong> {testCode}
          </div>
        )}
      </div>
    </div>
  );
}
