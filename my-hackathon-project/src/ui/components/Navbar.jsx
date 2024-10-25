import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white p-0 shadow-md">
      {" "}
      {/* Increased padding from p-6 to p-8 */}
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-blue-600 font-semibold text-lg pl-2 hover:text-blue-800 mt-12"
        >
          Home
        </Link>
        <div className="flex space-x-4 mt-10">
          {" "}
          {/* Increased margin-top from mt-2 to mt-4 */}
          <Link
            to="/register"
            className="text-blue-600 px-4 py-2 mb-2 mt-12 mr border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition duration-300"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="text-blue-600 px-4 py-3 mt-12 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
