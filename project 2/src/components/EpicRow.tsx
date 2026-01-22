import { Epic } from '../types/gantt';
import { EPIC_TYPE_COLORS } from '../lib/constants';
import { TaskRow } from './TaskRow';

interface EpicRowProps {
  epic: Epic;
  isExpanded: boolean;
  viewMode: 'all' | 'epics';
  onToggle: () => void;
  onAddTask: () => void;
  onEditEpic: () => void;
  onDeleteEpic: () => void;
  onTaskStatusToggle: (taskId: string) => void;
  onTaskEdit: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskView: (taskId: string) => void;
}

export function EpicRow({
  epic,
  isExpanded,
  viewMode,
  onToggle,
  onAddTask,
  onEditEpic,
  onDeleteEpic,
  onTaskStatusToggle,
  onTaskEdit,
  onTaskDelete,
  onTaskView
}: EpicRowProps) {
  const tasks = epic.tasks || [];
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="border-b border-gray-200">
      <div
        className="flex items-center px-2 sm:px-4 md:px-6 py-3 md:py-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all border-b-2 border-gray-200 group"
        onClick={onToggle}
      >
        <div className={`w-4 h-4 md:w-5 md:h-5 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
          ▶
        </div>

        <div className="w-[248px] sm:w-[348px] md:w-[480px] pr-2 md:pr-5">
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

        <div className="flex-1 relative h-8 md:h-12 flex items-center">
          <div
            className={`absolute h-6 md:h-8 rounded-lg shadow-lg cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-xl ${EPIC_TYPE_COLORS[epic.type]}`}
            style={{
              left: `${(epic.start_month / 12) * 100}%`,
              width: `${(epic.duration / 12) * 100}%`
            }}
          />
        </div>

        <div className="w-20 sm:w-24 md:w-32 flex gap-1 md:gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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
          {tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onStatusToggle={() => onTaskStatusToggle(task.id)}
              onEdit={() => onTaskEdit(task.id)}
              onDelete={() => onTaskDelete(task.id)}
              onView={() => onTaskView(task.id)}
            />
          ))}
        </div>
      )}

      {isExpanded && viewMode === 'all' && tasks.length === 0 && (
        <div className="px-6 py-8 pl-16 text-center text-gray-500 text-sm bg-gray-50">
          Нет задач в этом эпике.
          <button
            onClick={onAddTask}
            className="ml-2 text-purple-600 hover:text-purple-700 font-semibold underline"
          >
            Добавить задачу
          </button>
        </div>
      )}
    </div>
  );
}
