import { useState, useEffect } from 'react';
import type { Epic, EpicType } from '../types/gantt';
import { EPIC_TYPE_LABELS } from '../lib/constants';

interface EpicModalProps {
  epic: Partial<Epic> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (epic: Partial<Epic>) => void;
}

export function EpicModal({ epic, isOpen, onClose, onSave }: EpicModalProps) {
  const [formData, setFormData] = useState<Partial<Epic>>({
    name: '',
    description: '',
    type: 'content',
    start_month: 0,
    duration: 3,
    ...epic
  });

  useEffect(() => {
    if (epic) {
      setFormData({ ...epic });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'content',
        start_month: 0,
        duration: 3
      });
    }
  }, [epic, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name?.trim()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
          {epic?.id ? 'Редактировать эпик' : 'Новый эпик'}
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
              placeholder="Введите название эпика"
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
              placeholder="Введите описание эпика"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Тип <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={formData.type || 'content'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EpicType })}
            >
              {Object.entries(EPIC_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Начало (месяц 0-12)
              </label>
              <input
                type="number"
                min="0"
                max="12"
                step="0.1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.start_month || 0}
                onChange={(e) => setFormData({ ...formData, start_month: parseFloat(e.target.value) })}
              />
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.duration || 1}
                onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
              />
            </div>
          </div>

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
