import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Home() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get("/tests");
        setTests(res.data);
      } catch (err) {
        console.error("Error fetching tests", err);
      }
    };
    fetchTests();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your Tests</h2>
        <div className="grid gap-4">
          {tests.map((test) => (
            <Link
              key={test._id}
              to={`/tests/${test._id}`}
              className="p-4 bg-white shadow rounded hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{test.title}</h3>
              <p className="text-sm text-gray-500">
                Created: {new Date(test.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
