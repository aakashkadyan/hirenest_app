// components/AutoSuggestInput.js
import React, { useState, useEffect } from 'react';

const AutoSuggestInput = ({ placeholder, fetchUrl, onSelect, value = '' }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update local state when value prop changes (for clearing filters)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim() === '') {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${fetchUrl}&q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        const data = await res.json();
        console.log('Suggestions data:', data); // Debug log
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, fetchUrl]);

  const handleSelect = (value) => {
    setQuery(value);
    setShowSuggestions(false);
    if (onSelect) onSelect(value);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (onSelect) onSelect('');
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    
    // If user clears the input manually, call onSelect with empty string
    if (inputValue === '' && onSelect) {
      onSelect('');
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative w-48">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() !== '' && setShowSuggestions(true)}
          onBlur={handleBlur}
          className="border border-gray-300 rounded-md p-2 w-full pr-8"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            ×
          </button>
        )}
      </div>
      
      {showSuggestions && (loading || suggestions.length > 0) && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {loading ? (
            <li className="px-3 py-2 text-gray-500">Loading...</li>
          ) : suggestions.length > 0 ? (
            suggestions.map((item, index) => {
              // Handle different data structures from backend
              const label = item.name || item.title || item.location || (typeof item === 'string' ? item : JSON.stringify(item));
              return (
                <li
                  key={index}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleSelect(label)}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                >
                  {label}
                </li>
              );
            })
          ) : (
            <li className="px-3 py-2 text-gray-500">No suggestions found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default AutoSuggestInput;