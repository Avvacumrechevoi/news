import { Task } from '../types/gantt';
import { TYPE_LABELS, STATUS_LABELS, TASK_TYPE_COLORS, MONTHS } from '../lib/constants';

interface TaskRowProps {
  task: Task;
  isCompact: boolean;
  leftColumnClass: string;
  actionColumnClass: string;
  currentMonthPosition: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onStatusToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
}

export function TaskRow({
  task,
  isCompact,
  leftColumnClass,
  actionColumnClass,
  currentMonthPosition,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onStatusToggle,
  onEdit,
  onDelete,
  onView
}: TaskRowProps) {
  const isCompleted = task.status === 'done';
  const durationDays = Math.round(task.duration * 30);
  const rowPadding = isCompact ? 'py-2 md:py-2' : 'py-3 md:py-4';
  const timelineHeight = isCompact ? 'h-6 md:h-7' : 'h-7 md:h-9';
  const barHeight = isCompact ? 'h-4 md:h-5' : 'h-5 md:h-6';
  const milestoneHeight = isCompact ? 'h-5 md:h-6' : 'h-6 md:h-7';

  const statusStyles = {
    done: 'bg-emerald-100 text-emerald-700',
    'in-progress': 'bg-amber-100 text-amber-800',
    pending: 'bg-gray-200 text-gray-600'
  };

  const typeBadgeStyles = {
    prep: 'bg-sky-100 text-sky-700',
    dev: 'bg-violet-100 text-violet-700',
    launch: 'bg-pink-100 text-pink-700',
    growth: 'bg-emerald-100 text-emerald-700',
    milestone: 'bg-amber-100 text-amber-700'
  };

  const statusIcon = {
    done: '✓',
    'in-progress': '⊙',
    pending: '○'
  };

  return (
    <div className={`flex items-stretch border-b border-gray-100 transition-all group hover:bg-gray-50 ${isCompleted ? 'opacity-70' : ''}`}>
      <div className={`sticky left-0 z-10 ${leftColumnClass} bg-white border-r border-gray-100`}>
        <div className={`flex items-center ${rowPadding} px-2 sm:px-4 md:px-6`}>
          <div className="flex-1 min-w-0 pl-6 sm:pl-8 md:pl-10 pr-2 md:pr-5 cursor-pointer" onClick={onView}>
            <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1 flex-wrap">
              <span className={`font-semibold text-xs sm:text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'} line-clamp-1`}>
                {task.name}
              </span>
              <span className={`px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wide rounded ${typeBadgeStyles[task.type]}`}>
                {TYPE_LABELS[task.type]}
              </span>
              <span className={`px-1.5 md:px-2.5 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded-full ${statusStyles[task.status]}`}>
                {STATUS_LABELS[task.status]}
              </span>
            </div>

            {task.description && (
              <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 md:mb-1 leading-relaxed line-clamp-1 hidden sm:block">{task.description}</p>
            )}

            {task.owner && (
              <div className="flex items-center gap-0.5 md:gap-1 text-[10px] sm:text-xs text-blue-600 font-medium">
                <span className="text-xs">👤</span>
                <span>{task.owner}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`flex-1 relative ${rowPadding} flex items-center`}>
        <div className={`relative w-full ${timelineHeight}`}>
          <div className="absolute inset-0 flex">
            {MONTHS.map((_, idx) => (
              <div key={idx} className="flex-1 border-r border-gray-100" />
            ))}
          </div>

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-300/80 pointer-events-none z-10"
            style={{ left: `${currentMonthPosition}%` }}
          />

          <div
            className={`absolute ${task.type === 'milestone' ? milestoneHeight : barHeight} rounded-md shadow-md cursor-move transition-all hover:translate-y-[-2px] hover:shadow-lg border-2 border-white/50 ${
              isCompleted ? 'bg-gray-400 opacity-50' : TASK_TYPE_COLORS[task.type]
            } ${task.type === 'milestone' ? 'border-[3px]' : ''}`}
            style={{
              left: `${(task.start_month / 12) * 100}%`,
              width: `${(task.duration / 12) * 100}%`
            }}
          >
            <span className="absolute left-full ml-2 text-[10px] text-gray-600 font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
              {durationDays} дней
            </span>
          </div>
        </div>
      </div>

      <div className={`${actionColumnClass} shrink-0 flex items-center justify-end gap-1 md:gap-1.5 ${rowPadding} pr-2 sm:pr-4 md:pr-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity`}>
        <button
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className={`w-6 h-6 md:w-7 md:h-7 rounded-md border flex items-center justify-center transition-all text-xs md:text-sm ${
            canMoveUp
              ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-110'
              : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
          title="Переместить вверх"
        >
          ▲
        </button>
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className={`w-6 h-6 md:w-7 md:h-7 rounded-md border flex items-center justify-center transition-all text-xs md:text-sm ${
            canMoveDown
              ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-110'
              : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
          title="Переместить вниз"
        >
          ▼
        </button>
        <button
          onClick={onStatusToggle}
          className={`w-6 h-6 md:w-7 md:h-7 rounded-md flex items-center justify-center transition-all hover:scale-110 text-xs md:text-sm ${
            isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Изменить статус"
        >
          {statusIcon[task.status]}
        </button>
        <button
          onClick={onEdit}
          className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-110 text-xs md:text-sm"
          title="Редактировать"
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all hover:scale-110 text-xs md:text-sm"
          title="Удалить"
        >
          ×
        </button>
      </div>
    </div>
  );
}
