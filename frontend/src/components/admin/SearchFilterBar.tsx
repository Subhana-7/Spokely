import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  filterOptions?: string[];
  statusOptions?: { label: string; value: string }[];
  onSearch?: (value: string) => void;
  onFilter?: (value: string) => void;
  onStatusFilter?: (value: string) => void;

  hideFilter?: boolean;
  hideStatusFilter?: boolean;
  hideMoreFilters?: boolean;
}

const SearchFilterBar = ({
  searchPlaceholder = "Search by name or email",
  filterOptions = [],
  statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Blocked", value: "blocked" },
  ],
  onSearch,
  onFilter,
  onStatusFilter,
  hideFilter = false,
  hideStatusFilter = false,
  hideMoreFilters = false,
}: SearchFilterBarProps) => {
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    onSearch?.(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* SEARCH BAR */}
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg bg-white text-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
          {/* FILTER DROPDOWN */}
          {!hideFilter && (
            <select
              onChange={(e) => onFilter?.(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {/* STATUS DROPDOWN */}
          {!hideStatusFilter && (
            <select
              onChange={(e) => onStatusFilter?.(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {!hideMoreFilters && (
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              More Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
