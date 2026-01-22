interface StatsBarProps {
  completedTasks: number;
  inProgressTasks: number;
  totalTasks: number;
  completionPercentage: number;
  selectedQuarter: number | null;
  selectedMonths: Set<number>;
  onQuarterSelect: (quarter: number) => void;
  onMonthToggle: (month: number) => void;
}

export function StatsBar({
  completedTasks,
  inProgressTasks,
  totalTasks,
  completionPercentage,
  selectedQuarter,
  selectedMonths,
  onQuarterSelect,
  onMonthToggle
}: StatsBarProps) {
  const pendingTasks = totalTasks - completedTasks - inProgressTasks;

  const MONTHS_SHORT = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];

  return (
    <div className="px-4 md:px-12 py-4 md:py-6 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-gray-200">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
        <div className="bg-white rounded-lg p-3 md:p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="text-xs md:text-sm font-medium text-gray-600">Всего задач</div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalTasks}</div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="text-xs md:text-sm font-medium text-gray-600">Завершено</div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-green-600">{completedTasks}</div>
          <div className="text-xs text-gray-500 mt-1 hidden md:block">{Math.round((completedTasks / totalTasks) * 100)}% от общего</div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="text-xs md:text-sm font-medium text-gray-600">В работе</div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600">{inProgressTasks}</div>
          <div className="text-xs text-gray-500 mt-1 hidden md:block">{Math.round((inProgressTasks / totalTasks) * 100)}% от общего</div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="text-xs md:text-sm font-medium text-gray-600">Ожидает</div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-600">{pendingTasks}</div>
          <div className="text-xs text-gray-500 mt-1 hidden md:block">{Math.round((pendingTasks / totalTasks) * 100)}% от общего</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 md:p-5 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
          <div>
            <div className="text-xs md:text-sm font-medium text-gray-600 mb-1">
              {selectedQuarter ? `Прогресс Q${selectedQuarter}` : 'Общий прогресс проекта'}
            </div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">{completionPercentage}%</div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-xs text-gray-500 mb-2">Кварталы 2026</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(quarter => (
                <button
                  key={quarter}
                  onClick={() => onQuarterSelect(quarter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:scale-105 ${
                    selectedQuarter === quarter
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Q{quarter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Фильтр по месяцам:</div>
          <div className="flex flex-wrap gap-1.5">
            {MONTHS_SHORT.map((month, index) => (
              <button
                key={index}
                onClick={() => onMonthToggle(index)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                  selectedMonths.has(index)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Январь</span>
            <span>Декабрь</span>
          </div>
        </div>
      </div>
    </div>
  );
}
