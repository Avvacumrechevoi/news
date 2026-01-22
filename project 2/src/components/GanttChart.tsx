import { useEffect, useMemo, useState } from 'react';
import { useGanttData } from '../hooks/useGanttData';
import { EpicRow } from './EpicRow';
import { StatsBar } from './StatsBar';
import { TaskModal } from './TaskModal';
import { EpicModal } from './EpicModal';
import { TaskDetailModal } from './TaskDetailModal';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { DataPanel } from './DataPanel';
import { MONTHS, TYPE_LABELS, TASK_TYPE_COLORS } from '../lib/constants';
import { getProject, replaceStore, resetStore } from '../lib/localStore';
import type { ViewMode, Task, Epic, TaskType, TaskStatus } from '../types/gantt';

interface GanttChartProps {
  projectId: string;
}

const UI_STATE_KEY = 'gantt-ui-state-v1';

const getTaskMonths = (task: Task) => {
  const months = new Set<number>();
  const startMonth = Math.floor(task.start_month);
  const endMonth = Math.ceil(task.start_month + task.duration) - 1;

  for (let month = startMonth; month <= endMonth; month++) {
    months.add(((month % 12) + 12) % 12);
  }

  return Array.from(months);
};

export function GanttChart({ projectId }: GanttChartProps) {
  const { epics, loading, error, updateTaskStatus, saveTask, deleteTask, saveEpic, deleteEpic, moveEpic, moveTask, reload } = useGanttData(projectId);
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());
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
  const [compactMode, setCompactMode] = useState(false);
  const [calmMode, setCalmMode] = useState(false);
  const [dataPanelOpen, setDataPanelOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [uiReady, setUiReady] = useState(false);
  const [hasStoredExpanded, setHasStoredExpanded] = useState(false);

  const availableOwners = useMemo(() => {
    const owners = new Set<string>();
    epics.forEach(epic => {
      epic.tasks?.forEach(task => {
        if (task.owner) owners.add(task.owner);
      });
    });
    return Array.from(owners).sort();
  }, [epics]);

  useEffect(() => {
    const project = getProject();
    setProjectName(project.name);
  }, [epics]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setUiReady(true);
      return;
    }

    const rawState = window.localStorage.getItem(UI_STATE_KEY);
    if (rawState) {
      try {
        const parsed = JSON.parse(rawState) as {
          viewMode?: ViewMode;
          searchQuery?: string;
          selectedTypes?: TaskType[];
          selectedStatuses?: TaskStatus[];
          selectedOwners?: string[];
          selectedQuarter?: number | null;
          selectedMonths?: number[];
          expandedEpics?: string[];
          compactMode?: boolean;
          calmMode?: boolean;
        };

        if (parsed.viewMode) {
          setViewMode(parsed.viewMode);
        }
        if (typeof parsed.searchQuery === 'string') {
          setSearchQuery(parsed.searchQuery);
        }
        if (Array.isArray(parsed.selectedTypes)) {
          setSelectedTypes(new Set(parsed.selectedTypes));
        }
        if (Array.isArray(parsed.selectedStatuses)) {
          setSelectedStatuses(new Set(parsed.selectedStatuses));
        }
        if (Array.isArray(parsed.selectedOwners)) {
          setSelectedOwners(new Set(parsed.selectedOwners));
        }
        if (typeof parsed.selectedQuarter === 'number' || parsed.selectedQuarter === null) {
          setSelectedQuarter(parsed.selectedQuarter ?? null);
        }
        if (Array.isArray(parsed.selectedMonths)) {
          setSelectedMonths(new Set(parsed.selectedMonths));
        }
        if (Array.isArray(parsed.expandedEpics)) {
          setExpandedEpics(new Set(parsed.expandedEpics));
          setHasStoredExpanded(true);
        }
        if (typeof parsed.compactMode === 'boolean') {
          setCompactMode(parsed.compactMode);
        }
        if (typeof parsed.calmMode === 'boolean') {
          setCalmMode(parsed.calmMode);
        }
      } catch (err) {
        console.warn('Failed to load UI state', err);
      }
    }
    setUiReady(true);
  }, []);

  useEffect(() => {
    if (!uiReady || typeof window === 'undefined') {
      return;
    }
    const stateToPersist = {
      viewMode,
      searchQuery,
      selectedTypes: Array.from(selectedTypes),
      selectedStatuses: Array.from(selectedStatuses),
      selectedOwners: Array.from(selectedOwners),
      selectedQuarter,
      selectedMonths: Array.from(selectedMonths),
      expandedEpics: Array.from(expandedEpics),
      compactMode,
      calmMode
    };
    window.localStorage.setItem(UI_STATE_KEY, JSON.stringify(stateToPersist));
  }, [
    viewMode,
    searchQuery,
    selectedTypes,
    selectedStatuses,
    selectedOwners,
    selectedQuarter,
    selectedMonths,
    expandedEpics,
    compactMode,
    calmMode,
    uiReady
  ]);

  useEffect(() => {
    if (!uiReady || hasStoredExpanded) {
      return;
    }
    if (epics.length > 0 && expandedEpics.size === 0) {
      setExpandedEpics(new Set(epics.map((epic) => epic.id)));
    }
  }, [epics, expandedEpics.size, hasStoredExpanded, uiReady]);

  useEffect(() => {
    if (!hasStoredExpanded || epics.length === 0) {
      return;
    }
    setExpandedEpics((prev) => {
      const validIds = new Set(epics.map((epic) => epic.id));
      const next = new Set(Array.from(prev).filter((id) => validIds.has(id)));
      return next;
    });
  }, [epics, hasStoredExpanded]);

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
  const hasActiveFilters = searchQuery !== ''
    || selectedTypes.size > 0
    || selectedStatuses.size > 0
    || selectedOwners.size > 0
    || selectedQuarter !== null
    || selectedMonths.size > 0;

  const currentMonthPosition = useMemo(() => {
    const now = new Date();
    const monthIndex = now.getMonth();
    const daysInMonth = new Date(now.getFullYear(), monthIndex + 1, 0).getDate();
    const offset = daysInMonth > 0 ? (now.getDate() - 1) / daysInMonth : 0;
    return ((monthIndex + offset) / 12) * 100;
  }, []);

  const epicOrder = useMemo(() => epics.map((epic) => epic.id), [epics]);

  const allTasks = useMemo(() => epics.flatMap((epic) => epic.tasks || []), [epics]);

  const quarterStats = useMemo(() => {
    return [1, 2, 3, 4].map((quarter) => {
      const quarterStart = (quarter - 1) * 3;
      const quarterEnd = quarterStart + 2;
      const tasksInQuarter = allTasks.filter((task) =>
        getTaskMonths(task).some((month) => month >= quarterStart && month <= quarterEnd)
      );
      const completedInQuarter = tasksInQuarter.filter((task) => task.status === 'done').length;
      const percentage = tasksInQuarter.length > 0
        ? Math.round((completedInQuarter / tasksInQuarter.length) * 100)
        : 0;
      return {
        quarter,
        total: tasksInQuarter.length,
        completed: completedInQuarter,
        percentage
      };
    });
  }, [allTasks]);

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
  const milestoneTasks = filteredEpics.reduce((sum, epic) =>
    sum + (epic.tasks?.filter(t => t.type === 'milestone').length || 0), 0);
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

  const handleMoveEpic = async (epicId: string, direction: 'up' | 'down') => {
    await moveEpic(epicId, direction);
  };

  const handleMoveTask = async (taskId: string, direction: 'up' | 'down') => {
    await moveTask(taskId, direction);
  };

  const applyPreset = (preset: 'all' | 'in-progress' | 'milestones' | 'q1' | 'q2' | 'q3' | 'q4') => {
    setSelectedTypes(new Set());
    setSelectedStatuses(new Set());
    setSelectedOwners(new Set());
    setSelectedQuarter(null);
    setSelectedMonths(new Set());
    setSearchQuery('');

    if (preset === 'in-progress') {
      setSelectedStatuses(new Set(['in-progress']));
    }
    if (preset === 'milestones') {
      setSelectedTypes(new Set(['milestone']));
    }
    if (preset.startsWith('q')) {
      const quarter = parseInt(preset.replace('q', ''), 10);
      if (!Number.isNaN(quarter)) {
        setSelectedQuarter(quarter);
      }
    }
  };

  const activePreset = useMemo(() => {
    const filtersEmpty = selectedTypes.size === 0
      && selectedStatuses.size === 0
      && selectedOwners.size === 0
      && selectedQuarter === null
      && selectedMonths.size === 0
      && searchQuery === '';

    if (filtersEmpty) {
      return 'all';
    }
    if (selectedStatuses.size === 1 && selectedStatuses.has('in-progress') && selectedTypes.size === 0
      && selectedOwners.size === 0 && selectedQuarter === null && selectedMonths.size === 0 && searchQuery === '') {
      return 'in-progress';
    }
    if (selectedTypes.size === 1 && selectedTypes.has('milestone') && selectedStatuses.size === 0
      && selectedOwners.size === 0 && selectedQuarter === null && selectedMonths.size === 0 && searchQuery === '') {
      return 'milestones';
    }
    if (selectedQuarter !== null && selectedMonths.size === 0 && selectedTypes.size === 0
      && selectedStatuses.size === 0 && selectedOwners.size === 0 && searchQuery === '') {
      return `q${selectedQuarter}`;
    }
    return null;
  }, [searchQuery, selectedOwners, selectedQuarter, selectedMonths, selectedStatuses, selectedTypes]);

  const handleImportData = async (payload: unknown) => {
    const generateId = () => {
      if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
      }
      return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    };
    const timestamp = new Date().toISOString();
    const validEpicTypes = new Set(['content', 'tech', 'integration', 'distribution', 'optimization', 'monetization']);
    const validTaskTypes = new Set(['prep', 'dev', 'launch', 'growth', 'milestone']);
    const validStatuses = new Set(['pending', 'in-progress', 'done']);

    if (!payload || typeof payload !== 'object') {
      throw new Error('Файл не содержит данных проекта.');
    }

    const data = payload as {
      project?: string | { name?: string; description?: string };
      epics?: Epic[];
    };

    const importedEpics = Array.isArray(data.epics) ? data.epics : null;
    if (!importedEpics) {
      throw new Error('В файле нет списка эпиков.');
    }

    const projectTitle = typeof data.project === 'string'
      ? data.project
      : typeof data.project?.name === 'string'
        ? data.project.name
        : 'Импортированный проект';
    const projectDescription = typeof data.project === 'object' && typeof data.project?.description === 'string'
      ? data.project.description
      : '';

    const nextProject = {
      id: projectId,
      name: projectTitle,
      description: projectDescription,
      created_at: timestamp,
      updated_at: timestamp
    };

    const epics: Epic[] = [];
    const tasks: Task[] = [];

    importedEpics.forEach((rawEpic, epicIndex) => {
      const epicId = typeof rawEpic.id === 'string' ? rawEpic.id : generateId();
      const epicType = validEpicTypes.has(rawEpic.type) ? rawEpic.type : 'content';
      const epicStart = Number.isFinite(rawEpic.start_month) ? rawEpic.start_month : 0;
      const epicDuration = Number.isFinite(rawEpic.duration) ? rawEpic.duration : 1;
      const epicOrder = Number.isFinite(rawEpic.order_index) ? rawEpic.order_index : epicIndex;

      epics.push({
        id: epicId,
        project_id: projectId,
        name: rawEpic.name || `Эпик ${epicIndex + 1}`,
        description: rawEpic.description || '',
        type: epicType,
        start_month: epicStart,
        duration: epicDuration,
        order_index: epicOrder,
        created_at: rawEpic.created_at || timestamp,
        updated_at: rawEpic.updated_at || timestamp,
        tasks: []
      });

      const epicTasks = Array.isArray(rawEpic.tasks) ? rawEpic.tasks : [];
      epicTasks.forEach((rawTask, taskIndex) => {
        const taskType = validTaskTypes.has(rawTask.type) ? rawTask.type : 'prep';
        const taskStatus = validStatuses.has(rawTask.status) ? rawTask.status : 'pending';
        const taskStart = Number.isFinite(rawTask.start_month) ? rawTask.start_month : epicStart;
        const taskDuration = Number.isFinite(rawTask.duration) ? rawTask.duration : 1;
        const taskOrder = Number.isFinite(rawTask.order_index) ? rawTask.order_index : taskIndex;

        tasks.push({
          id: typeof rawTask.id === 'string' ? rawTask.id : generateId(),
          epic_id: epicId,
          name: rawTask.name || `Задача ${taskIndex + 1}`,
          description: rawTask.description || '',
          owner: rawTask.owner || '',
          start_month: taskStart,
          duration: taskDuration,
          type: taskType,
          status: taskStatus,
          order_index: taskOrder,
          created_at: rawTask.created_at || timestamp,
          updated_at: rawTask.updated_at || timestamp
        });
      });
    });

    replaceStore({ project: nextProject, epics, tasks });
    setProjectName(projectTitle);
    await reload();
  };

  const handleResetData = async () => {
    if (!confirm('Сбросить данные проекта к стартовым?')) {
      return;
    }
    resetStore(projectId);
    setProjectName(getProject().name);
    await reload();
    clearFilters();
    setDataPanelOpen(false);
  };

  const leftColumnClass = 'w-[260px] sm:w-[360px] md:w-[500px]';
  const actionColumnClass = 'w-36 sm:w-40 md:w-48';
  const headerClass = calmMode
    ? 'bg-white border-b border-gray-200'
    : 'bg-gradient-to-r from-blue-600 to-blue-700 border-b-4 border-blue-800';
  const headerTitleClass = calmMode ? 'text-gray-900' : 'text-white';
  const headerSubtitleClass = calmMode ? 'text-gray-500' : 'text-blue-100';
  const quickPresets = [
    { id: 'all', label: 'Все' },
    { id: 'in-progress', label: 'В работе' },
    { id: 'milestones', label: 'Вехи' },
    { id: 'q1', label: 'Q1' },
    { id: 'q2', label: 'Q2' },
    { id: 'q3', label: 'Q3' },
    { id: 'q4', label: 'Q4' }
  ] as const;

  return (
    <div className={`min-h-screen bg-gray-50 py-2 md:py-8 px-0 md:px-5 ${compactMode ? 'gantt-compact' : ''} ${calmMode ? 'gantt-calm' : ''}`}>
      <div className="max-w-[1600px] mx-auto bg-white md:rounded md:shadow border-t md:border border-gray-300 overflow-hidden">
        <div className={`px-3 md:px-12 py-3 md:py-8 ${headerClass}`}>
          <div className="flex items-center gap-2 md:gap-4">
            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${calmMode ? 'bg-blue-50' : 'bg-white'}`}>
              <svg className={`w-5 h-5 md:w-7 md:h-7 ${calmMode ? 'text-blue-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.073 2.903a9.978 9.978 0 00-6.146 0L.58 7.206v9.588l8.347 4.303a9.978 9.978 0 006.146 0l8.347-4.303V7.206L15.073 2.903zM12 14.25a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className={`text-base md:text-3xl font-bold tracking-tight truncate ${headerTitleClass}`}>
                {projectName || 'Запуск новостного сценария VK Видео'}
              </h1>
              <p className={`text-xs md:text-sm font-medium mt-0.5 md:mt-1 ${headerSubtitleClass}`}>
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
          milestoneTasks={milestoneTasks}
          quarterStats={quarterStats}
          selectedQuarter={selectedQuarter}
          selectedMonths={selectedMonths}
          onQuarterSelect={handleQuarterSelect}
          onMonthToggle={toggleMonthFilter}
          calmMode={calmMode}
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
            <SearchBar query={searchQuery} onSearch={setSearchQuery} totalResults={totalFilteredTasks} />
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
          hasActiveFilters={hasActiveFilters}
        />

        <div className="px-3 md:px-12 py-2 md:py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase">Быстрые виды:</span>
              {quickPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded-md border transition ${
                    activePreset === preset.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCompactMode((prev) => !prev)}
                className={`px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded-md border transition ${
                  compactMode
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                }`}
                aria-pressed={compactMode}
              >
                Компактно
              </button>
              <button
                onClick={() => setCalmMode((prev) => !prev)}
                className={`px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded-md border transition ${
                  calmMode
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                }`}
                aria-pressed={calmMode}
              >
                Спокойная тема
              </button>
              <button
                onClick={() => setDataPanelOpen(true)}
                className="px-3 py-1 text-[10px] md:text-xs font-semibold rounded-md border border-blue-600 text-blue-700 hover:bg-blue-50 transition"
              >
                Данные
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <div className="min-w-[800px] md:min-w-[1200px]">
            <div className={`flex sticky top-0 z-20 border-b-2 shadow-md ${calmMode ? 'bg-gray-100 border-gray-200' : 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-800'}`}>
              <div className={`sticky left-0 z-30 ${leftColumnClass} border-r ${calmMode ? 'bg-gray-100 border-gray-200' : 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-800'}`}>
                <div className={`px-2 sm:px-4 md:px-6 py-2 md:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${calmMode ? 'text-gray-600' : 'text-white/90'}`}>
                  Эпики и задачи
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="flex">
                  {MONTHS.map((month, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 text-center py-2 md:py-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider border-r ${
                        calmMode ? 'text-gray-600 border-gray-200' : 'text-white border-blue-500'
                      }`}
                    >
                      {month}
                    </div>
                  ))}
                </div>
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-300/80 pointer-events-none"
                  style={{ left: `${currentMonthPosition}%` }}
                >
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-red-500 uppercase">
                    Сегодня
                  </span>
                </div>
              </div>
              <div className={`${actionColumnClass} shrink-0`} />
            </div>

            {filteredEpics.length === 0 && (searchQuery || selectedTypes.size > 0 || selectedStatuses.size > 0) && (
              <div className="py-16 text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">Ничего не найдено</p>
                <p className="text-sm">Попробуйте изменить параметры поиска или фильтры</p>
              </div>
            )}

            {filteredEpics.map((epic) => {
              const epicIndex = epicOrder.indexOf(epic.id);
              const fullEpic = epics.find((item) => item.id === epic.id);
              const taskOrder = fullEpic?.tasks?.map((task) => task.id) || [];

              return (
                <EpicRow
                  key={epic.id}
                  epic={epic}
                  isExpanded={expandedEpics.has(epic.id)}
                  viewMode={viewMode}
                  isCompact={compactMode}
                  leftColumnClass={leftColumnClass}
                  actionColumnClass={actionColumnClass}
                  currentMonthPosition={currentMonthPosition}
                  canMoveUp={epicIndex > 0}
                  canMoveDown={epicIndex !== -1 && epicIndex < epicOrder.length - 1}
                  onToggle={() => toggleEpic(epic.id)}
                  onMoveUp={() => handleMoveEpic(epic.id, 'up')}
                  onMoveDown={() => handleMoveEpic(epic.id, 'down')}
                  onAddTask={() => handleAddTask(epic)}
                  onEditEpic={() => handleEditEpic(epic)}
                  onDeleteEpic={() => handleDeleteEpic(epic.id)}
                  onTaskStatusToggle={(taskId) => updateTaskStatus(epic.id, taskId)}
                  onTaskEdit={(taskId) => handleEditTask(epic, taskId)}
                  onTaskDelete={(taskId) => handleDeleteTask(epic.id, taskId)}
                  onTaskView={(taskId) => handleViewTask(epic, taskId)}
                  onTaskMove={handleMoveTask}
                  taskOrder={taskOrder}
                />
              );
            })}
          </div>
        </div>

        <div className={`px-4 md:px-12 py-4 md:py-5 border-t border-gray-200 ${calmMode ? 'bg-gray-50' : 'bg-gradient-to-r from-blue-50 to-slate-50'}`}>
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

      {dataPanelOpen && (
        <DataPanel
          isOpen={dataPanelOpen}
          onClose={() => setDataPanelOpen(false)}
          projectName={projectName || 'Проект'}
          epics={epics}
          onImport={handleImportData}
          onReset={handleResetData}
        />
      )}

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
