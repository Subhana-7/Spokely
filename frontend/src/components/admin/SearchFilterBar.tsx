import { Search } from "lucide-react";

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  filterOptions?: string[];
  onSearch?: (value: string) => void;
  onFilter?: (value: string) => void;
  onStatusFilter?: (value: string) => void;
}

const SearchFilterBar = ({
  searchPlaceholder = "Search by name or email",
  filterOptions = ["All Roles", "Top Rated", "Most Students"],
  onSearch,
  onFilter,
  onStatusFilter,
}: SearchFilterBarProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
          {/* Primary Filter (Level/Role) */}
          <select
            onChange={(e) => onFilter?.(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[140px]"
          >
            {filterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            onChange={(e) => onStatusFilter?.(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[120px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* More Options Button */}
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
          >
            More Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
