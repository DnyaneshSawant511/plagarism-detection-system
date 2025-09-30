import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between">
      <h1 className="text-xl font-semibold text-gray-700">Plagiarism Portal</h1>
      <div className="flex space-x-4">
        <Link to="/create-test" className="hover:underline">
          Create Test
        </Link>
        <Link to="/home" className="text-gray-600 hover:text-black">Home</Link>
        <Link to="/test-similarity" className="hover:underline">
          Test Similarity
        </Link>
        <button onClick={logout} className="text-red-600 hover:text-red-800">Logout</button>
      </div>
    </nav>
  );
}