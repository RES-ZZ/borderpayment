// src/ui/components/Alert.jsx

import PropTypes from "prop-types";

const Alert = ({ type, message }) => {
  Alert.propTypes = {
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  };

  const baseStyle = "p-4 mb-4 text-sm rounded-lg";
  const typeStyle =
    type === "error"
      ? "text-red-700 bg-red-100"
      : type === "success"
      ? "text-green-700 bg-green-100"
      : "text-gray-700 bg-gray-100";

  return (
    <div className={`${baseStyle} ${typeStyle}`} role="alert">
      {message}
    </div>
  );
};

export default Alert;
