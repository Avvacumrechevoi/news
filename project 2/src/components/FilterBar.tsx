import { TaskType, TaskStatus } from '../types/gantt';
import { TYPE_LABELS, STATUS_LABELS } from '../lib/constants';
import { Filter, User } from 'lucide-react';

interface FilterBarProps {
  selectedTypes: Set<TaskType>;
  selectedStatuses: Set<TaskStatus>;
  selectedOwners: Set<string>;
  availableOwners: string[];
  onTypeToggle: (type: TaskType) => void;
  onStatusToggle: (status: TaskStatus) => void;
  onOwnerToggle: (owner: string) => void;
  onClearFilters: () => void;
  hasActiveFilters?: boolean;
}

export function FilterBar({
  selectedTypes,
  selectedStatuses,
  selectedOwners,
  availableOwners,
  onTypeToggle,
  onStatusToggle,
  onOwnerToggle,
  onClearFilters,
  hasActiveFilters
}: FilterBarProps) {
  const hasFilters = typeof hasActiveFilters === 'boolean'
    ? hasActiveFilters
    : selectedTypes.size > 0 || selectedStatuses.size > 0 || selectedOwners.size > 0;

  return (
    <div className="px-3 md:px-12 py-3 md:py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
        <Filter className="w-3 h-3 md:w-4 md:h-4" />
        <span>Фильтры:</span>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto px-3 md:px-4 py-1 text-[10px] md:text-xs font-medium text-blue-600 hover:text-blue-800 underline"
          >
            Сбросить все
          </button>
        )}
      </div>

      <div className="space-y-2 md:space-y-3">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-[10px] md:text-xs text-gray-500 font-medium uppercase min-w-[50px] md:min-w-[60px] pt-1">Тип:</span>
          <div className="flex gap-1.5 md:gap-2 flex-wrap flex-1">
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <button
                key={type}
                onClick={() => onTypeToggle(type as TaskType)}
                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-lg transition ${
                  selectedTypes.has(type as TaskType)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-[10px] md:text-xs text-gray-500 font-medium uppercase min-w-[50px] md:min-w-[60px] pt-1">Статус:</span>
          <div className="flex gap-1.5 md:gap-2 flex-wrap flex-1">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => onStatusToggle(status as TaskStatus)}
                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-lg transition ${
                  selectedStatuses.has(status as TaskStatus)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {availableOwners.length > 0 && (
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-[10px] md:text-xs text-gray-500 font-medium uppercase min-w-[50px] md:min-w-[60px] flex items-center gap-1 pt-1">
              <User className="w-2.5 h-2.5 md:w-3 md:h-3" />
              <span className="hidden sm:inline">Исполнитель:</span>
              <span className="sm:hidden">Испол:</span>
            </span>
            <div className="flex gap-1.5 md:gap-2 flex-wrap flex-1">
              {availableOwners.map((owner) => (
                <button
                  key={owner}
                  onClick={() => onOwnerToggle(owner)}
                  className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-lg transition ${
                    selectedOwners.has(owner)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {owner}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
