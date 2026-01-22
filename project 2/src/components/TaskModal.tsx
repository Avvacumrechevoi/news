import { useState, useEffect } from 'react';
import type { Task, Epic, TaskType, TaskStatus } from '../types/gantt';
import { MONTHS, TYPE_LABELS } from '../lib/constants';

interface TaskModalProps {
  task: Partial<Task> | null;
  epic: Epic;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

const getMonthParts = (value: number) => {
  const normalized = clampNumber(value, 0, 11.9);
  const monthIndex = Math.floor(normalized);
  const offset = roundToTenth(normalized - monthIndex);
  return { monthIndex, offset };
};

export function TaskModal({ task, epic, isOpen, onClose, onSave }: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    name: '',
    description: '',
    owner: '',
    start_month: epic.start_month,
    duration: 1,
    type: 'prep',
    status: 'pending',
    ...task
  });
  const [monthOffsetInput, setMonthOffsetInput] = useState('0');
  const [durationInput, setDurationInput] = useState('1');

  useEffect(() => {
    const startMonthValue = task?.start_month ?? epic.start_month ?? 0;
    const durationValue = task?.duration ?? 1;
    const { offset } = getMonthParts(startMonthValue);

    if (task) {
      setFormData({ ...task, start_month: startMonthValue, duration: durationValue });
    } else {
      setFormData({
        name: '',
        description: '',
        owner: '',
        start_month: startMonthValue,
        duration: durationValue,
        type: 'prep',
        status: 'pending'
      });
    }
    setMonthOffsetInput(offset.toString());
    setDurationInput(durationValue.toString());
  }, [task, epic]);

  if (!isOpen) return null;

  const startMonthValue = typeof formData.start_month === 'number'
    ? formData.start_month
    : epic.start_month ?? 0;
  const durationValue = typeof formData.duration === 'number'
    ? formData.duration
    : 1;
  const { monthIndex } = getMonthParts(startMonthValue);
  const exceedsYear = startMonthValue + durationValue > 12;
  const invalidDuration = durationValue <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name?.trim()) {
      const safeStartMonth = typeof formData.start_month === 'number'
        ? formData.start_month
        : epic.start_month ?? 0;
      const safeDuration = typeof formData.duration === 'number'
        ? formData.duration
        : 1;
      onSave({ ...formData, start_month: safeStartMonth, duration: safeDuration });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
          {task?.id ? 'Редактировать задачу' : 'Новая задача'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название задачи"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Добавьте описание задачи"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ответственный
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={formData.owner || ''}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="Имя ответственного"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Тип задачи
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                value={formData.type || 'prep'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Статус
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                value={formData.status || 'pending'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              >
                <option value="pending">Ожидает</option>
                <option value="in-progress">В работе</option>
                <option value="done">Выполнено</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Месяц начала
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  value={monthIndex}
                  onChange={(e) => {
                    const nextMonth = parseInt(e.target.value, 10);
                    const offsetValue = parseFloat(monthOffsetInput);
                    const offset = Number.isFinite(offsetValue) ? clampNumber(offsetValue, 0, 0.9) : 0;
                    setFormData((prev) => ({
                      ...prev,
                      start_month: nextMonth + offset
                    }));
                  }}
                >
                  {MONTHS.map((month, idx) => (
                    <option key={month} value={idx}>
                      {month}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  max="0.9"
                  step="0.1"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={monthOffsetInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMonthOffsetInput(value);
                    const parsed = parseFloat(value);
                    if (!Number.isNaN(parsed)) {
                      const offset = clampNumber(parsed, 0, 0.9);
                      setFormData((prev) => ({
                        ...prev,
                        start_month: monthIndex + offset
                      }));
                    }
                  }}
                  onBlur={() => {
                    if (monthOffsetInput.trim() === '') {
                      setMonthOffsetInput('0');
                      setFormData((prev) => ({
                        ...prev,
                        start_month: monthIndex
                      }));
                    }
                  }}
                  placeholder="0.0"
                />
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Смещение внутри месяца: 0 = начало, 0.5 = середина
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Длительность (месяцы)
              </label>
              <input
                type="number"
                min="0.1"
                max="12"
                step="0.1"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  exceedsYear || invalidDuration ? 'border-amber-400' : 'border-gray-300'
                }`}
                value={durationInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setDurationInput(value);
                  const parsed = parseFloat(value);
                  if (!Number.isNaN(parsed)) {
                    setFormData((prev) => ({ ...prev, duration: parsed }));
                  }
                }}
                onBlur={() => {
                  if (durationInput.trim() === '') {
                    setDurationInput('1');
                    setFormData((prev) => ({ ...prev, duration: 1 }));
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {[0.5, 1, 2, 3, 6, 12].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setDurationInput(value.toString());
                      setFormData((prev) => ({ ...prev, duration: value }));
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(exceedsYear || invalidDuration) && (
            <div className="text-xs text-amber-600">
              {invalidDuration && 'Длительность должна быть больше 0. '}
              {exceedsYear && 'Диапазон выходит за пределы года.'}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-sm"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
