// src/ui/components/SignOutButton.jsx
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

const SignOutButton = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("You have signed out successfully!");
    } catch (error) {
      console.error("Sign out error:", error);
      alert("There was an issue signing out. Please try again.");
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
