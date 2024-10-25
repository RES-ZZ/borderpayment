// src/ui/components/Dashboard.jsx
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-200">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg text-gray-700">
        Hello, {user.email}. Welcome to your dashboard!
      </p>
    </div>
  );
};

export default Dashboard;
