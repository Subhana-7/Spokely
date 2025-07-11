import { Search } from 'lucide-react';

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  filterOptions?: string[];
  onSearch?: (value: string) => void;
  onFilter?: (value: string) => void;
}

const SearchFilterBar = ({ 
  searchPlaceholder = "Search by name or email",
  filterOptions = ["All Roles", "Top Rated", "Most Students"],
  onSearch,
  onFilter
}: SearchFilterBarProps) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          onChange={(e) => onFilter?.(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        >
          {filterOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Blocked</option>
        </select>

        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          More
        </button>
      </div>
    </div>
  );
};

export default SearchFilterBar;
