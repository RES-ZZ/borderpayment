// src/ui/components/Home.jsx
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import SignOutButton from "./SignOutButton";

const Home = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
      {user ? (
        <>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome, {user.email}!
          </h1>
          <SignOutButton />
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to Our App!
          </h1>
          <p className="text-lg text-gray-600">
            Please register or log in to access all features.
          </p>
        </>
      )}
    </div>
  );
};

export default Home;
