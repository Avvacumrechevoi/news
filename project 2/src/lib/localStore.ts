import type { Epic, Project, Task } from '../types/gantt';

export type LocalStore = {
  project: Project;
  epics: Epic[];
  tasks: Task[];
};

const STORAGE_KEY = 'gantt-local-store-v1';

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const now = () => new Date().toISOString();

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

let memoryStore: LocalStore | null = null;

const loadStore = (): LocalStore | null => {
  if (!canUseStorage()) {
    return memoryStore;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return memoryStore;
  }
  try {
    return JSON.parse(raw) as LocalStore;
  } catch (error) {
    console.warn('Failed to parse local store, recreating.', error);
    return null;
  }
};

const saveStore = (store: LocalStore) => {
  memoryStore = store;
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const seedProject: Pick<Project, 'name' | 'description'> = {
  name: 'Запуск новостного сценария VK Видео',
  description: 'Q1: Запуск в клипах • Q2: Интеграция с Дзен • Q3: Витрина и оптимизация • Q4: Монетизация'
};

const seedEpics: Array<Omit<Epic, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'tasks'>> = [
  {
    name: 'Подготовка контента и редакции',
    description: 'Формирование контентной базы, работа с паблишерами',
    type: 'content',
    start_month: 0,
    duration: 2.5,
    order_index: 0
  },
  {
    name: 'Техническая реализация MVP',
    description: 'Разработка базового функционала, интеграция с системами',
    type: 'tech',
    start_month: 0.5,
    duration: 2.5,
    order_index: 1
  },
  {
    name: 'Интеграция с Дзен',
    description: 'Склейка контента, синхронизация главных тем',
    type: 'integration',
    start_month: 0.7,
    duration: 2.3,
    order_index: 2
  },
  {
    name: 'Дистрибуция и реком',
    description: 'Механики продвижения, настройка рекомендаций',
    type: 'distribution',
    start_month: 1,
    duration: 2,
    order_index: 3
  },
  {
    name: 'Запуск в клипах (конец Q1)',
    description: 'Первая версия новостей в ленте клипов',
    type: 'distribution',
    start_month: 2.5,
    duration: 0.5,
    order_index: 4
  },
  {
    name: 'GR и политика',
    description: 'Определение водораздела контента',
    type: 'content',
    start_month: 1,
    duration: 1.5,
    order_index: 5
  },
  {
    name: 'Витрина новостей (Q2-Q3)',
    description: 'Полноценный раздел с витриной',
    type: 'tech',
    start_month: 3,
    duration: 6,
    order_index: 6
  },
  {
    name: 'Оптимизация и рост (Q3)',
    description: 'Метрики, A/B тесты, масштабирование',
    type: 'optimization',
    start_month: 6,
    duration: 3,
    order_index: 7
  },
  {
    name: 'Монетизация (Q3-Q4)',
    description: 'Запуск монетизации, новые форматы',
    type: 'monetization',
    start_month: 7,
    duration: 5,
    order_index: 8
  }
];

type SeedTask = {
  epicIndex: number;
  name: string;
  description: string;
  owner: string;
  start_month: number;
  duration: number;
  type: Task['type'];
  status: Task['status'];
  order_index: number;
};

const seedTasks: SeedTask[] = [
  { epicIndex: 0, name: 'Составить список паблишеров', description: 'Согласовать список редакционных паблишеров, получить апрув', owner: 'Светлана', start_month: 0, duration: 0.7, type: 'prep', status: 'done', order_index: 0 },
  { epicIndex: 0, name: 'Таблица объёмов контента', description: 'Собрать данные по ежедневному контенту и темам (01.12-07.12)', owner: 'Дима Ефимченко', start_month: 0, duration: 1, type: 'prep', status: 'done', order_index: 1 },
  { epicIndex: 0, name: 'Презентация для Николая Дуксина', description: 'Подготовить презентацию по объёмам новостного контента', owner: 'Команда', start_month: 1, duration: 0.3, type: 'prep', status: 'in-progress', order_index: 2 },
  { epicIndex: 0, name: 'Гайд для авторов', description: 'Подготовить гайд, перенести на поддомен VK Видео', owner: 'Дима К.', start_month: 0.5, duration: 1, type: 'prep', status: 'in-progress', order_index: 3 },
  { epicIndex: 0, name: 'Вебинар для паблишеров', description: 'Организовать деловой завтрак, презентовать возможности', owner: 'Полина', start_month: 1, duration: 0.5, type: 'prep', status: 'pending', order_index: 4 },
  { epicIndex: 0, name: 'Базовые метрики паблишеров', description: 'Снять метрики до запуска новостей в клипах', owner: 'Аналитика', start_month: 1.5, duration: 1, type: 'prep', status: 'pending', order_index: 5 },

  { epicIndex: 1, name: 'Защита на гейтах', description: 'Согласовать переход в разработку с Вадимом', owner: 'Илья', start_month: 0.5, duration: 0.5, type: 'dev', status: 'in-progress', order_index: 0 },
  { epicIndex: 1, name: 'Отключить фильтр клипов', description: 'Убрать фильтр по клипам для новостного контента', owner: 'Разработка', start_month: 1, duration: 0.5, type: 'dev', status: 'pending', order_index: 1 },
  { epicIndex: 1, name: 'Обход контентного конвейера', description: 'Минимизировать время до публикации новостей', owner: 'Вера Советкина', start_month: 1, duration: 1, type: 'dev', status: 'in-progress', order_index: 2 },
  { epicIndex: 1, name: 'Ограничение жизни клипа 48ч', description: 'Реализовать автоудаление старых новостных клипов', owner: 'Разработка', start_month: 1.5, duration: 0.5, type: 'dev', status: 'pending', order_index: 3 },
  { epicIndex: 1, name: 'Механика трендов', description: 'Изучить сборку трендов в монотему, расписать флоу', owner: 'Дима К.', start_month: 1.5, duration: 1, type: 'dev', status: 'pending', order_index: 4 },
  { epicIndex: 1, name: 'UX-тестирование прототипа', description: 'Повторное тестирование интерфейса', owner: 'Дима К.', start_month: 2, duration: 0.5, type: 'dev', status: 'pending', order_index: 5 },

  { epicIndex: 2, name: 'Встреча с Сашей Дзен', description: 'Обсудить аналитику, механизмы учёта в Mediascope', owner: 'Команда', start_month: 0.7, duration: 0.1, type: 'prep', status: 'done', order_index: 0 },
  { epicIndex: 2, name: 'УТП и механизм интеграции', description: 'Определить эмбед vs интеграция, обмен трафиком', owner: 'Саша Дзен', start_month: 0.8, duration: 1, type: 'prep', status: 'in-progress', order_index: 1 },
  { epicIndex: 2, name: 'Синк с Анастасией', description: 'Склейка контента в инфоповоды, отбор главных событий', owner: 'Анастасия (21.01)', start_month: 0.7, duration: 0.5, type: 'prep', status: 'in-progress', order_index: 2 },
  { epicIndex: 2, name: 'Склейка по монотемам (Q1-Q2)', description: 'Полуавтоматическая склейка для датасетов', owner: 'Дзен + VK', start_month: 1.5, duration: 1.5, type: 'dev', status: 'pending', order_index: 3 },

  { epicIndex: 3, name: 'Контентный план для рекома', description: 'Определить достаточность объёма контента', owner: 'Команда рекома', start_month: 1, duration: 0.5, type: 'prep', status: 'in-progress', order_index: 0 },
  { epicIndex: 3, name: 'Механики продвижения', description: 'Квоты, тренды, бусты для главных событий', owner: 'Дима Бондарев', start_month: 1.5, duration: 1, type: 'dev', status: 'pending', order_index: 1 },
  { epicIndex: 3, name: 'Свежесть контента в рекоме', description: 'Настроить показ новостей до 48 часов', owner: 'Реком', start_month: 1.5, duration: 1, type: 'dev', status: 'pending', order_index: 2 },
  { epicIndex: 3, name: 'Индексация монотем в поиске', description: 'Научить поиск работать с новой сущностью', owner: 'Поиск', start_month: 2, duration: 1, type: 'dev', status: 'pending', order_index: 3 },
  { epicIndex: 3, name: 'Целеполагание TVT', description: 'Верифицировать цифры по TVT из презентации', owner: 'Аналитика', start_month: 2, duration: 0.5, type: 'prep', status: 'pending', order_index: 4 },

  { epicIndex: 4, name: 'ЗАПУСК НОВОСТЕЙ В КЛИПАХ', description: 'Открытие новостного контента в ленте Клипов', owner: 'Степан (23.01)', start_month: 2.5, duration: 0.5, type: 'milestone', status: 'pending', order_index: 0 },

  { epicIndex: 5, name: 'Встреча с Димой Уваровым', description: 'Определить водораздел Новости vs Политика', owner: 'GR команда', start_month: 1, duration: 0.5, type: 'prep', status: 'pending', order_index: 0 },
  { epicIndex: 5, name: 'Согласование со Степаном', description: 'Включение политики и новостей в клипы, стратборд', owner: 'Степан', start_month: 1.5, duration: 1, type: 'prep', status: 'pending', order_index: 1 },

  { epicIndex: 6, name: 'Доработка MVP', description: 'Завершение базового функционала', owner: 'Разработка', start_month: 3, duration: 2, type: 'dev', status: 'pending', order_index: 0 },
  { epicIndex: 6, name: 'Механика перехода с чипса', description: 'Поднятие этажа при переходе из монотемы', owner: 'UX', start_month: 4, duration: 1, type: 'dev', status: 'pending', order_index: 1 },
  { epicIndex: 6, name: 'Синхрон главных тем с Дзен', description: 'Автоматическая склейка топовых тем', owner: 'Дзен + VK', start_month: 4, duration: 2, type: 'dev', status: 'pending', order_index: 2 },
  { epicIndex: 6, name: 'Видеоформаты в Дзен', description: 'Текстовые форматы + AI-компиляции', owner: 'Дзен', start_month: 5, duration: 4, type: 'dev', status: 'pending', order_index: 3 },
  { epicIndex: 6, name: 'ЗАПУСК ВИТРИНЫ', description: 'Полноценный раздел Новостей', owner: 'Команда', start_month: 6, duration: 0.5, type: 'milestone', status: 'pending', order_index: 4 },

  { epicIndex: 7, name: 'Анализ метрик', description: 'Удержание, TVT, ER, CTR', owner: 'Аналитика', start_month: 6, duration: 3, type: 'growth', status: 'pending', order_index: 0 },
  { epicIndex: 7, name: 'A/B тестирование', description: 'Тесты форматов подачи', owner: 'Продукт', start_month: 7, duration: 2, type: 'growth', status: 'pending', order_index: 1 },
  { epicIndex: 7, name: 'Привлечение паблишеров', description: 'Расширение контентной базы', owner: 'Бизнес', start_month: 6.5, duration: 2.5, type: 'growth', status: 'pending', order_index: 2 },
  { epicIndex: 7, name: 'Оптимизация CTR', description: 'Закрывашки при досмотре клипа', owner: 'UX', start_month: 7, duration: 1.5, type: 'growth', status: 'pending', order_index: 3 },

  { epicIndex: 8, name: 'AI-компиляции видео Дзен', description: 'Автоматическая сборка из контента Дзен', owner: 'AI/Дзен', start_month: 7, duration: 2, type: 'dev', status: 'pending', order_index: 0 },
  { epicIndex: 8, name: 'Монетизация клипов', description: 'Запуск рекламы в новостных клипах', owner: 'Бизнес', start_month: 9, duration: 2, type: 'growth', status: 'pending', order_index: 1 },
  { epicIndex: 8, name: 'Персонализация', description: 'Умная лента на основе интересов', owner: 'ML', start_month: 10, duration: 2, type: 'dev', status: 'pending', order_index: 2 }
];

type SeedOverrides = {
  projectId?: string;
  projectName?: string;
  projectDescription?: string;
};

const createSeedStore = (overrides: SeedOverrides = {}): LocalStore => {
  const timestamp = now();
  const projectId = overrides.projectId ?? createId();
  const projectName = overrides.projectName ?? seedProject.name;
  const projectDescription = overrides.projectDescription ?? seedProject.description;

  const project: Project = {
    id: projectId,
    name: projectName,
    description: projectDescription,
    created_at: timestamp,
    updated_at: timestamp
  };

  const epics: Epic[] = seedEpics.map((epic) => ({
    id: createId(),
    project_id: projectId,
    created_at: timestamp,
    updated_at: timestamp,
    ...epic
  }));

  const tasks: Task[] = seedTasks.map((task) => ({
    id: createId(),
    epic_id: epics[task.epicIndex].id,
    name: task.name,
    description: task.description,
    owner: task.owner,
    start_month: task.start_month,
    duration: task.duration,
    type: task.type,
    status: task.status,
    order_index: task.order_index,
    created_at: timestamp,
    updated_at: timestamp
  }));

  return { project, epics, tasks };
};

const ensureStore = (): LocalStore => {
  const existing = loadStore();
  if (existing) {
    return existing;
  }
  const seeded = createSeedStore();
  saveStore(seeded);
  return seeded;
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const getProjectId = () => ensureStore().project.id;

export const getProject = (): Project => clone(ensureStore().project);

export const getStoreSnapshot = (): LocalStore => clone(ensureStore());

export const replaceStore = (store: LocalStore) => {
  saveStore(store);
};

export const resetStore = (projectId?: string): LocalStore => {
  const seeded = createSeedStore({ projectId });
  saveStore(seeded);
  return clone(seeded);
};

export const listEpics = (projectId: string): Epic[] => {
  const store = ensureStore();
  return store.epics
    .filter((epic) => epic.project_id === projectId)
    .sort((a, b) => a.order_index - b.order_index)
    .map((epic) => ({ ...epic }));
};

export const listTasks = (epicIds: string[]): Task[] => {
  const store = ensureStore();
  const epicSet = new Set(epicIds);
  return store.tasks
    .filter((task) => epicSet.has(task.epic_id))
    .sort((a, b) => a.order_index - b.order_index)
    .map((task) => ({ ...task }));
};

export const updateTask = (taskId: string, updates: Partial<Task>): Task | null => {
  const store = ensureStore();
  const index = store.tasks.findIndex((task) => task.id === taskId);
  if (index === -1) {
    return null;
  }
  const updated: Task = {
    ...store.tasks[index],
    ...updates,
    updated_at: now()
  };
  store.tasks[index] = updated;
  saveStore(store);
  return clone(updated);
};

export const createTask = (
  task: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Task => {
  const store = ensureStore();
  const timestamp = now();
  const newTask: Task = {
    ...task,
    id: createId(),
    created_at: timestamp,
    updated_at: timestamp
  };
  store.tasks.push(newTask);
  saveStore(store);
  return clone(newTask);
};

export const removeTask = (taskId: string): boolean => {
  const store = ensureStore();
  const nextTasks = store.tasks.filter((task) => task.id !== taskId);
  if (nextTasks.length === store.tasks.length) {
    return false;
  }
  store.tasks = nextTasks;
  saveStore(store);
  return true;
};

export const updateEpic = (epicId: string, updates: Partial<Epic>): Epic | null => {
  const store = ensureStore();
  const index = store.epics.findIndex((epic) => epic.id === epicId);
  if (index === -1) {
    return null;
  }
  const updated: Epic = {
    ...store.epics[index],
    ...updates,
    updated_at: now()
  };
  store.epics[index] = updated;
  saveStore(store);
  return clone(updated);
};

export const createEpic = (
  epic: Omit<Epic, 'id' | 'created_at' | 'updated_at'>
): Epic => {
  const store = ensureStore();
  const timestamp = now();
  const newEpic: Epic = {
    ...epic,
    id: createId(),
    created_at: timestamp,
    updated_at: timestamp
  };
  store.epics.push(newEpic);
  saveStore(store);
  return clone(newEpic);
};

export const removeEpic = (epicId: string): boolean => {
  const store = ensureStore();
  const nextEpics = store.epics.filter((epic) => epic.id !== epicId);
  if (nextEpics.length === store.epics.length) {
    return false;
  }
  store.epics = nextEpics;
  store.tasks = store.tasks.filter((task) => task.epic_id !== epicId);
  saveStore(store);
  return true;
};

export const moveEpic = (epicId: string, direction: 'up' | 'down'): boolean => {
  const store = ensureStore();
  const ordered = [...store.epics].sort((a, b) => a.order_index - b.order_index);
  const index = ordered.findIndex((epic) => epic.id === epicId);
  if (index === -1) {
    return false;
  }
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= ordered.length) {
    return false;
  }

  const current = ordered[index];
  const target = ordered[targetIndex];
  const currentOrder = current.order_index;
  const targetOrder = target.order_index;

  store.epics = store.epics.map((epic) => {
    if (epic.id === current.id) {
      return { ...epic, order_index: targetOrder, updated_at: now() };
    }
    if (epic.id === target.id) {
      return { ...epic, order_index: currentOrder, updated_at: now() };
    }
    return epic;
  });

  saveStore(store);
  return true;
};

export const moveTask = (taskId: string, direction: 'up' | 'down'): boolean => {
  const store = ensureStore();
  const current = store.tasks.find((task) => task.id === taskId);
  if (!current) {
    return false;
  }

  const siblings = store.tasks
    .filter((task) => task.epic_id === current.epic_id)
    .sort((a, b) => a.order_index - b.order_index);
  const index = siblings.findIndex((task) => task.id === taskId);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= siblings.length) {
    return false;
  }

  const target = siblings[targetIndex];
  const currentOrder = current.order_index;
  const targetOrder = target.order_index;

  store.tasks = store.tasks.map((task) => {
    if (task.id === current.id) {
      return { ...task, order_index: targetOrder, updated_at: now() };
    }
    if (task.id === target.id) {
      return { ...task, order_index: currentOrder, updated_at: now() };
    }
    return task;
  });

  saveStore(store);
  return true;
};
