import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import TestDetail from "./pages/TestDetail";
import SubmissionDetail from "./pages/SubmissionDetail";
import PrivateRoute from "./components/PrivateRoute";
import CreateTest from "./pages/CreateTest";
import TestSimilarity from "./pages/TestSimilarity";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/tests/:id"
          element={
            <PrivateRoute>
              <TestDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/submissions/:id"
          element={
            <PrivateRoute>
              <SubmissionDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-test"
          element={
            <PrivateRoute>
              <CreateTest />
            </PrivateRoute>
          }
        />
        <Route
          path="/test-similarity"
          element={
            <PrivateRoute>
              <TestSimilarity />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;