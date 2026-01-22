import { Epic } from '../types/gantt';
import { EPIC_TYPE_COLORS } from '../lib/constants';
import { TaskRow } from './TaskRow';

interface EpicRowProps {
  epic: Epic;
  isExpanded: boolean;
  viewMode: 'all' | 'epics';
  isCompact: boolean;
  leftColumnClass: string;
  actionColumnClass: string;
  currentMonthPosition: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddTask: () => void;
  onEditEpic: () => void;
  onDeleteEpic: () => void;
  onTaskStatusToggle: (taskId: string) => void;
  onTaskEdit: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskView: (taskId: string) => void;
  onTaskMove: (taskId: string, direction: 'up' | 'down') => void;
  taskOrder: string[];
}

export function EpicRow({
  epic,
  isExpanded,
  viewMode,
  isCompact,
  leftColumnClass,
  actionColumnClass,
  currentMonthPosition,
  canMoveUp,
  canMoveDown,
  onToggle,
  onMoveUp,
  onMoveDown,
  onAddTask,
  onEditEpic,
  onDeleteEpic,
  onTaskStatusToggle,
  onTaskEdit,
  onTaskDelete,
  onTaskView,
  onTaskMove,
  taskOrder
}: EpicRowProps) {
  const tasks = epic.tasks || [];
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const rowPadding = isCompact ? 'py-2 md:py-2' : 'py-3 md:py-4';
  const timelineHeight = isCompact ? 'h-6 md:h-8' : 'h-8 md:h-12';
  const barHeight = isCompact ? 'h-4 md:h-6' : 'h-6 md:h-8';
  const orderedTaskIds = taskOrder.length > 0 ? taskOrder : tasks.map((task) => task.id);

  return (
    <div className="border-b border-gray-200">
      <div
        className="flex items-stretch cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all border-b-2 border-gray-200 group"
        onClick={onToggle}
      >
        <div className={`sticky left-0 z-10 ${leftColumnClass} bg-gray-50 border-r border-gray-200`}>
          <div className={`flex items-center ${rowPadding} px-2 sm:px-4 md:px-6`}>
            <div className={`w-4 h-4 md:w-5 md:h-5 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </div>

            <div className="flex-1 min-w-0 pr-2 md:pr-5">
              <div className="font-bold text-xs sm:text-sm md:text-base text-gray-800 mb-0.5 md:mb-1 line-clamp-1">{epic.name}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 leading-relaxed mb-0.5 md:mb-1 line-clamp-1 hidden sm:block">{epic.description}</div>
              <div className="flex items-center gap-2 md:gap-3 text-[10px] sm:text-xs text-gray-500">
                <span>{tasks.length} задач</span>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-12 md:w-16 h-1 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="font-semibold">{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex-1 relative ${rowPadding} flex items-center`}>
          <div className={`relative w-full ${timelineHeight}`}>
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-300/80 pointer-events-none z-10"
              style={{ left: `${currentMonthPosition}%` }}
            />
            <div
              className={`absolute ${barHeight} rounded-lg shadow-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-xl ${EPIC_TYPE_COLORS[epic.type]}`}
              style={{
                left: `${(epic.start_month / 12) * 100}%`,
                width: `${(epic.duration / 12) * 100}%`
              }}
            />
          </div>
        </div>

        <div className={`${actionColumnClass} shrink-0 flex items-center justify-end gap-1 md:gap-1.5 ${rowPadding} pr-2 sm:pr-4 md:pr-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              onAddTask();
            }}
            className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-white border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all hover:scale-110 font-bold text-xs md:text-sm"
            title="Добавить задачу"
          >
            +
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditEpic();
            }}
            className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-white border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all hover:scale-110 text-xs md:text-sm"
            title="Редактировать эпик"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteEpic();
            }}
            className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-white border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all hover:scale-110 text-xs md:text-sm"
            title="Удалить эпик"
          >
            ✕
          </button>
        </div>
      </div>

      {isExpanded && viewMode === 'all' && tasks.length > 0 && (
        <div>
          {tasks.map(task => {
            const taskIndex = orderedTaskIds.indexOf(task.id);
            const canMoveUpTask = taskIndex > 0;
            const canMoveDownTask = taskIndex !== -1 && taskIndex < orderedTaskIds.length - 1;

            return (
              <TaskRow
                key={task.id}
                task={task}
                isCompact={isCompact}
                leftColumnClass={leftColumnClass}
                actionColumnClass={actionColumnClass}
                currentMonthPosition={currentMonthPosition}
                canMoveUp={canMoveUpTask}
                canMoveDown={canMoveDownTask}
                onMoveUp={() => onTaskMove(task.id, 'up')}
                onMoveDown={() => onTaskMove(task.id, 'down')}
                onStatusToggle={() => onTaskStatusToggle(task.id)}
                onEdit={() => onTaskEdit(task.id)}
                onDelete={() => onTaskDelete(task.id)}
                onView={() => onTaskView(task.id)}
              />
            );
          })}
        </div>
      )}

      {isExpanded && viewMode === 'all' && tasks.length === 0 && (
        <div className="flex items-stretch border-b border-gray-100 bg-gray-50">
          <div className={`sticky left-0 z-10 ${leftColumnClass} bg-gray-50 border-r border-gray-100`}>
            <div className={`flex items-center ${rowPadding} px-2 sm:px-4 md:px-6`}>
              <div className="pl-6 sm:pl-8 md:pl-10 text-xs sm:text-sm text-gray-500">
                Нет задач в этом эпике.
                <button
                  onClick={onAddTask}
                  className="ml-2 text-purple-600 hover:text-purple-700 font-semibold underline"
                >
                  Добавить задачу
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <div className={`${actionColumnClass} shrink-0`} />
        </div>
      )}
    </div>
  );
}
