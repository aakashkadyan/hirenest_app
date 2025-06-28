// ReadMore.jsx
import { useState } from "react";

const ReadMore = ({ text, maxChars = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = () => setIsExpanded(!isExpanded);

  if (!text) return null;

  return (
    <p className="text-gray-600 text-sm mb-2"> Job Desc - 
      {isExpanded ? text : `${text.slice(0, maxChars)}${text.length > maxChars ? "..." : ""}`}
      {text.length > maxChars && (
        <button
          onClick={toggle}
          className="text-blue-500 ml-2 font-medium focus:outline-none"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      )}
    </p>
  );
};

export default ReadMore;
