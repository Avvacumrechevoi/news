import { useEffect, useState } from 'react';
import { GanttChart } from './components/GanttChart';
import { seedDatabase } from './lib/seedData';

function App() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const id = await seedDatabase();
        setProjectId(id);
      } catch (err) {
        console.error('Failed to initialize data:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Инициализация проекта...</p>
        </div>
      </div>
    );
  }

  if (error || !projectId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-6xl text-red-500 text-center mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">Ошибка инициализации</h2>
          <p className="text-gray-600 text-center mb-6">{error || 'Не удалось инициализировать проект'}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return <GanttChart projectId={projectId} />;
}

export default App;
