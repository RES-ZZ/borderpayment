// src/ui/components/ProtectedRoute.jsx
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }
  ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
