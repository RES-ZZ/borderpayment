// src/ui/components/Input.jsx
import PropTypes from "prop-types";
import { cn } from "../../lib/util";

const Input = ({ label, className, ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
        {...props}
      />
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  // Add other prop validations as needed
};

export default Input;
