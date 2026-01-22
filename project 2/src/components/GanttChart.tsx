import { useState, useMemo } from 'react';
import { useGanttData } from '../hooks/useGanttData';
import { EpicRow } from './EpicRow';
import { StatsBar } from './StatsBar';
import { TaskModal } from './TaskModal';
import { EpicModal } from './EpicModal';
import { TaskDetailModal } from './TaskDetailModal';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { MONTHS, TYPE_LABELS, TASK_TYPE_COLORS } from '../lib/constants';
import type { ViewMode, Task, Epic, TaskType, TaskStatus } from '../types/gantt';

interface GanttChartProps {
  projectId: string;
}

export function GanttChart({ projectId }: GanttChartProps) {
  const { epics, loading, error, updateTaskStatus, saveTask, deleteTask, saveEpic, deleteEpic, reload } = useGanttData(projectId);
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set(epics.map(e => e.id)));
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ epic: Epic; task: Partial<Task> | null } | null>(null);
  const [epicModalOpen, setEpicModalOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Partial<Epic> | null>(null);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<TaskType>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<TaskStatus>>(new Set());
  const [selectedOwners, setSelectedOwners] = useState<Set<string>>(new Set());
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());

  const availableOwners = useMemo(() => {
    const owners = new Set<string>();
    epics.forEach(epic => {
      epic.tasks?.forEach(task => {
        if (task.owner) owners.add(task.owner);
      });
    });
    return Array.from(owners).sort();
  }, [epics]);

  const getTaskMonths = (task: Task) => {
    const months = new Set<number>();
    const startMonth = Math.floor(task.start_month);
    const endMonth = Math.ceil(task.start_month + task.duration) - 1;

    for (let month = startMonth; month <= endMonth; month++) {
      months.add(month % 12);
    }

    return Array.from(months);
  };

  const filteredEpics = useMemo(() => {
    return epics.map(epic => {
      const filteredTasks = (epic.tasks || []).filter(task => {
        const description = task.description || '';
        const owner = task.owner || '';
        const matchesSearch = searchQuery === '' ||
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          owner.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = selectedTypes.size === 0 || selectedTypes.has(task.type);
        const matchesStatus = selectedStatuses.size === 0 || selectedStatuses.has(task.status);
        const matchesOwner = selectedOwners.size === 0 || selectedOwners.has(owner);

        const taskMonths = getTaskMonths(task);
        const matchesQuarter = selectedQuarter === null || taskMonths.some(month => {
          const quarter = Math.floor(month / 3) + 1;
          return quarter === selectedQuarter;
        });

        const matchesMonth = selectedMonths.size === 0 || taskMonths.some(month => selectedMonths.has(month));

        return matchesSearch && matchesType && matchesStatus && matchesOwner && matchesQuarter && matchesMonth;
      });

      return {
        ...epic,
        tasks: filteredTasks
      };
    }).filter(epic => epic.tasks.length > 0 || (searchQuery === '' && selectedTypes.size === 0 && selectedStatuses.size === 0 && selectedOwners.size === 0 && selectedQuarter === null && selectedMonths.size === 0));
  }, [epics, searchQuery, selectedTypes, selectedStatuses, selectedOwners, selectedQuarter, selectedMonths]);

  const totalFilteredTasks = filteredEpics.reduce((sum, epic) => sum + (epic.tasks?.length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-semibold">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={reload}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const toggleEpic = (epicId: string) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId);
    } else {
      newExpanded.add(epicId);
    }
    setExpandedEpics(newExpanded);
  };

  const handleAddTask = (epic: Epic) => {
    setEditingTask({ epic, task: null });
    setModalOpen(true);
  };

  const handleEditTask = (epic: Epic, taskId: string) => {
    const task = epic.tasks?.find(t => t.id === taskId);
    if (task) {
      setEditingTask({ epic, task });
      setModalOpen(true);
    }
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    if (editingTask) {
      await saveTask(editingTask.epic.id, task);
      setModalOpen(false);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async (epicId: string, taskId: string) => {
    if (confirm('Удалить задачу?')) {
      await deleteTask(epicId, taskId);
    }
  };

  const handleEditEpic = (epic: Epic) => {
    setEditingEpic(epic);
    setEpicModalOpen(true);
  };

  const handleSaveEpic = async (epic: Partial<Epic>) => {
    await saveEpic(epic);
    setEpicModalOpen(false);
    setEditingEpic(null);
  };

  const handleViewTask = (epic: Epic, taskId: string) => {
    const task = epic.tasks?.find(t => t.id === taskId);
    if (task) {
      setViewingTask(task);
      setTaskDetailModalOpen(true);
    }
  };

  const totalTasks = filteredEpics.reduce((sum, epic) => sum + (epic.tasks?.length || 0), 0);
  const completedTasks = filteredEpics.reduce((sum, epic) =>
    sum + (epic.tasks?.filter(t => t.status === 'done').length || 0), 0);
  const inProgressTasks = filteredEpics.reduce((sum, epic) =>
    sum + (epic.tasks?.filter(t => t.status === 'in-progress').length || 0), 0);
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const toggleTypeFilter = (type: TaskType) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  const toggleStatusFilter = (status: TaskStatus) => {
    const newStatuses = new Set(selectedStatuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }
    setSelectedStatuses(newStatuses);
  };

  const toggleOwnerFilter = (owner: string) => {
    const newOwners = new Set(selectedOwners);
    if (newOwners.has(owner)) {
      newOwners.delete(owner);
    } else {
      newOwners.add(owner);
    }
    setSelectedOwners(newOwners);
  };

  const toggleMonthFilter = (month: number) => {
    const newMonths = new Set(selectedMonths);
    if (newMonths.has(month)) {
      newMonths.delete(month);
    } else {
      newMonths.add(month);
    }
    setSelectedMonths(newMonths);
    setSelectedQuarter(null);
  };

  const handleQuarterSelect = (quarter: number) => {
    if (selectedQuarter === quarter) {
      setSelectedQuarter(null);
    } else {
      setSelectedQuarter(quarter);
      setSelectedMonths(new Set());
    }
  };

  const clearFilters = () => {
    setSelectedTypes(new Set());
    setSelectedStatuses(new Set());
    setSelectedOwners(new Set());
    setSelectedQuarter(null);
    setSelectedMonths(new Set());
    setSearchQuery('');
  };

  const handleAddEpic = () => {
    setEditingEpic(null);
    setEpicModalOpen(true);
  };

  const handleDeleteEpic = async (epicId: string) => {
    const epic = epics.find(e => e.id === epicId);
    const taskCount = epic?.tasks?.length || 0;
    const message = taskCount > 0
      ? `Удалить эпик "${epic?.name}" и все ${taskCount} задач(и) в нем?`
      : `Удалить эпик "${epic?.name}"?`;

    if (confirm(message)) {
      await deleteEpic(epicId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-2 md:py-8 px-0 md:px-5">
      <div className="max-w-[1600px] mx-auto bg-white md:rounded md:shadow border-t md:border border-gray-300 overflow-hidden">
        <div className="px-3 md:px-12 py-3 md:py-8 bg-gradient-to-r from-blue-600 to-blue-700 border-b-4 border-blue-800">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 md:w-7 md:h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.073 2.903a9.978 9.978 0 00-6.146 0L.58 7.206v9.588l8.347 4.303a9.978 9.978 0 006.146 0l8.347-4.303V7.206L15.073 2.903zM12 14.25a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-3xl font-bold tracking-tight text-white truncate">
                Запуск новостного сценария VK Видео
              </h1>
              <p className="text-xs md:text-sm text-blue-100 font-medium mt-0.5 md:mt-1">
                Дорожная карта проекта 2026
              </p>
            </div>
          </div>
        </div>

        <StatsBar
          completedTasks={completedTasks}
          inProgressTasks={inProgressTasks}
          totalTasks={totalTasks}
          completionPercentage={completionPercentage}
          selectedQuarter={selectedQuarter}
          selectedMonths={selectedMonths}
          onQuarterSelect={handleQuarterSelect}
          onMonthToggle={toggleMonthFilter}
        />

        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-12 py-3 md:py-5 bg-gray-50 border-b border-gray-200 flex-wrap">
          <button
            onClick={handleAddEpic}
            className="px-3 md:px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center gap-1.5 text-xs md:text-sm shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            <span className="hidden sm:inline">Новый эпик</span>
            <span className="sm:hidden">Эпик</span>
          </button>

          <button
            onClick={reload}
            className="px-3 md:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-1.5 text-xs md:text-sm shadow-sm"
          >
            <span>↻</span>
          </button>

          <button
            onClick={() => setExpandedEpics(new Set(epics.map(e => e.id)))}
            className="px-3 md:px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-all text-xs md:text-sm"
          >
            <span className="hidden sm:inline">⬇ Развернуть всё</span>
            <span className="sm:hidden">▼</span>
          </button>

          <button
            onClick={() => setExpandedEpics(new Set())}
            className="px-3 md:px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-all text-xs md:text-sm"
          >
            <span className="hidden sm:inline">⬆ Свернуть всё</span>
            <span className="sm:hidden">▲</span>
          </button>

          <div className="flex-1 min-w-[200px]">
            <SearchBar onSearch={setSearchQuery} totalResults={totalFilteredTasks} />
          </div>

          <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Всё
            </button>
            <button
              onClick={() => setViewMode('epics')}
              className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium transition-all border-l border-gray-300 ${
                viewMode === 'epics'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Только эпики</span>
              <span className="sm:hidden">Эпики</span>
            </button>
          </div>
        </div>

        <FilterBar
          selectedTypes={selectedTypes}
          selectedStatuses={selectedStatuses}
          selectedOwners={selectedOwners}
          availableOwners={availableOwners}
          onTypeToggle={toggleTypeFilter}
          onStatusToggle={toggleStatusFilter}
          onOwnerToggle={toggleOwnerFilter}
          onClearFilters={clearFilters}
        />

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <div className="min-w-[800px] md:min-w-[1200px]">
            <div className="flex pl-[280px] sm:pl-[380px] md:pl-[528px] bg-gradient-to-r from-blue-600 to-blue-700 sticky top-0 z-20 border-b-2 border-blue-800 shadow-md">
              {MONTHS.map((month, idx) => (
                <div
                  key={idx}
                  className="flex-1 text-center py-2 md:py-3 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider border-r border-blue-500"
                >
                  {month}
                </div>
              ))}
            </div>

            {filteredEpics.length === 0 && (searchQuery || selectedTypes.size > 0 || selectedStatuses.size > 0) && (
              <div className="py-16 text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">Ничего не найдено</p>
                <p className="text-sm">Попробуйте изменить параметры поиска или фильтры</p>
              </div>
            )}

            {filteredEpics.map((epic) => (
              <EpicRow
                key={epic.id}
                epic={epic}
                isExpanded={expandedEpics.has(epic.id)}
                viewMode={viewMode}
                onToggle={() => toggleEpic(epic.id)}
                onAddTask={() => handleAddTask(epic)}
                onEditEpic={() => handleEditEpic(epic)}
                onDeleteEpic={() => handleDeleteEpic(epic.id)}
                onTaskStatusToggle={(taskId) => updateTaskStatus(epic.id, taskId)}
                onTaskEdit={(taskId) => handleEditTask(epic, taskId)}
                onTaskDelete={(taskId) => handleDeleteTask(epic.id, taskId)}
                onTaskView={(taskId) => handleViewTask(epic, taskId)}
              />
            ))}
          </div>
        </div>

        <div className="px-4 md:px-12 py-4 md:py-5 bg-gradient-to-r from-blue-50 to-slate-50 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Легенда типов задач</div>
          <div className="flex gap-3 md:gap-6 flex-wrap">
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg shadow-sm ${TASK_TYPE_COLORS[type as keyof typeof TASK_TYPE_COLORS]}`} />
                <span className="text-sm text-gray-700 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && editingTask && (
        <TaskModal
          task={editingTask.task}
          epic={editingTask.epic}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}

      {epicModalOpen && (
        <EpicModal
          epic={editingEpic}
          isOpen={epicModalOpen}
          onClose={() => {
            setEpicModalOpen(false);
            setEditingEpic(null);
          }}
          onSave={handleSaveEpic}
        />
      )}

      {taskDetailModalOpen && viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          isOpen={taskDetailModalOpen}
          onClose={() => {
            setTaskDetailModalOpen(false);
            setViewingTask(null);
          }}
          onEdit={() => {
            const epic = epics.find(e => e.tasks?.some(t => t.id === viewingTask.id));
            if (epic) {
              handleEditTask(epic, viewingTask.id);
            }
          }}
        />
      )}
    </div>
  );
}
