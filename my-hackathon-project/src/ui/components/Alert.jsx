// src/ui/components/Alert.jsx
import PropTypes from "prop-types";
import { cn } from "../../lib/util";

const Alert = ({ type = "info", message }) => {
  const typeStyles = {
    success: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <div className={cn("p-4 mb-4 rounded-md", typeStyles[type])}>{message}</div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  message: PropTypes.string.isRequired,
};

export default Alert;
