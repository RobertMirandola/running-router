import * as React from "react"
import { SearchIcon } from "lucide-react"

interface Suggestion {
  place_id: string;
  description: string;
}

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSelectSuggestion?: (suggestion: string) => void;
  suggestions?: Suggestion[];
  showSuggestions?: boolean;
}

const SearchBar = ({ 
  placeholder = "", 
  value = "", 
  onChange,
  onSelectSuggestion,
  suggestions = [],
  showSuggestions = false
}: SearchBarProps) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
  };

  return (
    <div className='min-w-[300px] relative'>
      <div className="relative flex bg-white border border-gray-200 rounded shadow-sm">
        <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input 
          type="search" 
          placeholder={placeholder}
          value={value}
          className='w-full py-2 pl-10 pr-3 h-[41px] text-gray-700 placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 rounded' 
          onChange={handleInputChange}
        />
        <style>{`
          input[type="search"]::-webkit-search-cancel-button {
            cursor: pointer;
          }
        `}</style>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full bg-white border border-gray-200 rounded shadow-lg z-10 max-h-[300px] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="cursor-pointer px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion.description)}
            >
              {suggestion.description}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar;