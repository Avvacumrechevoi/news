import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Epic } from '../types/gantt';
import { exportToCSV, exportToJSON } from '../lib/exportUtils';

interface DataPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  epics: Epic[];
  onImport: (payload: unknown) => Promise<void>;
  onReset: () => Promise<void>;
}

export function DataPanel({
  isOpen,
  onClose,
  projectName,
  epics,
  onImport,
  onReset
}: DataPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      await onImport(parsed);
      onClose();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось импортировать файл';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setBusy(true);
    try {
      await onReset();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сбросить данные';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 w-full max-w-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-gray-800">Данные проекта</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Данные хранятся локально в браузере. Экспортируйте их для резервной копии.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Экспорт</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => exportToJSON(epics, projectName)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => exportToCSV(epics)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-white hover:bg-slate-900 transition"
              >
                CSV
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Импорт</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileSelect}
              className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              disabled={busy}
            />
            {error && (
              <div className="text-xs text-red-600 mt-2">{error}</div>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-gray-200 pt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-gray-500">
            Импорт полностью заменяет текущие данные.
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition"
            disabled={busy}
          >
            Сбросить данные
          </button>
        </div>
      </div>
    </div>
  );
}
