// src/ui/components/NavBar.jsx
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { Link } from "react-router-dom";
import SignOutButton from "./SignOutButton"; // Import the SignOutButton component

const NavBar = () => {
  const [user, loading] = useAuthState(auth);

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div>
        <Link to="/" className="text-white text-lg">
          Home
        </Link>
        {user && (
          <Link to="/payments" className="ml-4 text-white text-lg">
            Payments
          </Link>
        )}
      </div>
      <div>
        {loading ? (
          <div className="text-gray-300">Loading...</div>
        ) : user ? (
          <>
            <span className="text-white mr-4">Welcome, {user.email}!</span>
            <SignOutButton />
          </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
