import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onSearch: (query: string) => void;
  totalResults: number;
}

export function SearchBar({ query, onSearch, totalResults }: SearchBarProps) {
  const handleSearch = (value: string) => {
    onSearch(value);
  };

  const clearSearch = () => {
    onSearch('');
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Поиск задач..."
          className="pl-10 pr-10 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {query && (
        <div className="absolute top-full mt-1 text-xs text-gray-600 whitespace-nowrap">
          Найдено: {totalResults}
        </div>
      )}
    </div>
  );
}
