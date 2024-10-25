// src/ui/components/Button.jsx
import PropTypes from "prop-types";
import { cn } from "../../lib/util";

const Button = ({ variant = "default", className, children, ...props }) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "primary" &&
          "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400",
        variant === "secondary" &&
          "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400",
        variant === "default" &&
          "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "default"]),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Button;
