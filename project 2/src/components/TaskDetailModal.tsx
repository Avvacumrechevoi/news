import { X, Calendar, Clock, User, Tag, CheckCircle2, RefreshCcw } from 'lucide-react';
import type { Task } from '../types/gantt';
import { TYPE_LABELS, STATUS_LABELS, TASK_TYPE_COLORS } from '../lib/constants';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onEdit }: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const startDate = new Date(2026, task.start_month);
  const endDate = new Date(2026, task.start_month + task.duration);
  const updatedAt = task.updated_at || task.created_at;
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4" onClick={onClose}>
      <div className="bg-white rounded-xl md:rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-4 md:px-8 py-4 md:py-6 flex items-start justify-between rounded-t-xl md:rounded-t-2xl">
          <div className="flex-1 pr-2 md:pr-4">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{task.name}</h2>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              <span className={`px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold rounded-full text-white ${TASK_TYPE_COLORS[task.type]}`}>
                {TYPE_LABELS[task.type]}
              </span>
              <span className={`px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold rounded-full ${
                task.status === 'done' ? 'bg-green-100 text-green-700' :
                task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {STATUS_LABELS[task.status]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 md:p-2 hover:bg-blue-800 rounded-lg transition text-white flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Период</div>
                <div className="text-sm font-medium text-gray-900">
                  {startDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                  {' - '}
                  {endDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Длительность</div>
                <div className="text-sm font-medium text-gray-900">
                  {task.duration} {task.duration === 1 ? 'месяц' : task.duration < 5 ? 'месяца' : 'месяцев'}
                </div>
              </div>
            </div>

            {task.owner && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ответственный</div>
                  <div className="text-sm font-medium text-gray-900">{task.owner}</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Тип задачи</div>
                <div className="text-sm font-medium text-gray-900">{TYPE_LABELS[task.type]}</div>
              </div>
            </div>

            {updatedLabel && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <RefreshCcw className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Обновлено</div>
                  <div className="text-sm font-medium text-gray-900">{updatedLabel}</div>
                </div>
              </div>
            )}
          </div>

          {task.description && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900">Описание</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
          )}

          {task.status === 'done' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <div className="text-sm font-semibold text-green-900">Задача выполнена</div>
                  <div className="text-xs text-green-700">Эта задача была успешно завершена</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
            >
              Закрыть
            </button>
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-sm"
            >
              Редактировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
