import { supabase, isDemoMode } from './supabase';
import { isStorageInitialized, markStorageInitialized } from './localStorageAdapter';

export async function seedDatabase() {
  // For demo mode, check localStorage initialization
  if (isDemoMode && isStorageInitialized()) {
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (existingProject) {
      return existingProject.id;
    }
  }

  // For Supabase mode, check if project exists
  if (!isDemoMode) {
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existingProject) {
      return existingProject.id;
    }
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: 'Запуск новостного сценария VK Видео',
      description: 'Q1: Запуск в клипах • Q2: Интеграция с Дзен • Q3: Витрина и оптимизация • Q4: Монетизация'
    })
    .select()
    .single();

  if (projectError || !project) {
    console.error('Error creating project:', projectError);
    throw new Error('Failed to create project');
  }

  const epicsData = [
    {
      project_id: project.id,
      name: 'Подготовка контента и редакции',
      description: 'Формирование контентной базы, работа с паблишерами',
      type: 'content',
      start_month: 0,
      duration: 2.5,
      order_index: 0
    },
    {
      project_id: project.id,
      name: 'Техническая реализация MVP',
      description: 'Разработка базового функционала, интеграция с системами',
      type: 'tech',
      start_month: 0.5,
      duration: 2.5,
      order_index: 1
    },
    {
      project_id: project.id,
      name: 'Интеграция с Дзен',
      description: 'Склейка контента, синхронизация главных тем',
      type: 'integration',
      start_month: 0.7,
      duration: 2.3,
      order_index: 2
    },
    {
      project_id: project.id,
      name: 'Дистрибуция и реком',
      description: 'Механики продвижения, настройка рекомендаций',
      type: 'distribution',
      start_month: 1,
      duration: 2,
      order_index: 3
    },
    {
      project_id: project.id,
      name: 'Запуск в клипах (конец Q1)',
      description: 'Первая версия новостей в ленте клипов',
      type: 'distribution',
      start_month: 2.5,
      duration: 0.5,
      order_index: 4
    },
    {
      project_id: project.id,
      name: 'GR и политика',
      description: 'Определение водораздела контента',
      type: 'content',
      start_month: 1,
      duration: 1.5,
      order_index: 5
    },
    {
      project_id: project.id,
      name: 'Витрина новостей (Q2-Q3)',
      description: 'Полноценный раздел с витриной',
      type: 'tech',
      start_month: 3,
      duration: 6,
      order_index: 6
    },
    {
      project_id: project.id,
      name: 'Оптимизация и рост (Q3)',
      description: 'Метрики, A/B тесты, масштабирование',
      type: 'optimization',
      start_month: 6,
      duration: 3,
      order_index: 7
    },
    {
      project_id: project.id,
      name: 'Монетизация (Q3-Q4)',
      description: 'Запуск монетизации, новые форматы',
      type: 'monetization',
      start_month: 7,
      duration: 5,
      order_index: 8
    }
  ];

  const { data: epics, error: epicsError } = await supabase
    .from('epics')
    .insert(epicsData)
    .select();

  if (epicsError || !epics) {
    console.error('Error creating epics:', epicsError);
    throw new Error('Failed to create epics');
  }

  const tasksData = [
    { epic_id: epics[0].id, name: 'Составить список паблишеров', description: 'Согласовать список редакционных паблишеров, получить апрув', owner: 'Светлана', start_month: 0, duration: 0.7, type: 'prep', status: 'done', order_index: 0 },
    { epic_id: epics[0].id, name: 'Таблица объёмов контента', description: 'Собрать данные по ежедневному контенту и темам (01.12-07.12)', owner: 'Дима Ефимченко', start_month: 0, duration: 1, type: 'prep', status: 'done', order_index: 1 },
    { epic_id: epics[0].id, name: 'Презентация для Николая Дуксина', description: 'Подготовить презентацию по объёмам новостного контента', owner: 'Команда', start_month: 1, duration: 0.3, type: 'prep', status: 'in-progress', order_index: 2 },
    { epic_id: epics[0].id, name: 'Гайд для авторов', description: 'Подготовить гайд, перенести на поддомен VK Видео', owner: 'Дима К.', start_month: 0.5, duration: 1, type: 'prep', status: 'in-progress', order_index: 3 },
    { epic_id: epics[0].id, name: 'Вебинар для паблишеров', description: 'Организовать деловой завтрак, презентовать возможности', owner: 'Полина', start_month: 1, duration: 0.5, type: 'prep', status: 'pending', order_index: 4 },
    { epic_id: epics[0].id, name: 'Базовые метрики паблишеров', description: 'Снять метрики до запуска новостей в клипах', owner: 'Аналитика', start_month: 1.5, duration: 1, type: 'prep', status: 'pending', order_index: 5 },

    { epic_id: epics[1].id, name: 'Защита на гейтах', description: 'Согласовать переход в разработку с Вадимом', owner: 'Илья', start_month: 0.5, duration: 0.5, type: 'dev', status: 'in-progress', order_index: 0 },
    { epic_id: epics[1].id, name: 'Отключить фильтр клипов', description: 'Убрать фильтр по клипам для новостного контента', owner: 'Разработка', start_month: 1, duration: 0.5, type: 'dev', status: 'pending', order_index: 1 },
    { epic_id: epics[1].id, name: 'Обход контентного конвейера', description: 'Минимизировать время до публикации новостей', owner: 'Вера Советкина', start_month: 1, duration: 1, type: 'dev', status: 'in-progress', order_index: 2 },
    { epic_id: epics[1].id, name: 'Ограничение жизни клипа 48ч', description: 'Реализовать автоудаление старых новостных клипов', owner: 'Разработка', start_month: 1.5, duration: 0.5, type: 'dev', status: 'pending', order_index: 3 },
    { epic_id: epics[1].id, name: 'Механика трендов', description: 'Изучить сборку трендов в монотему, расписать флоу', owner: 'Дима К.', start_month: 1.5, duration: 1, type: 'dev', status: 'pending', order_index: 4 },
    { epic_id: epics[1].id, name: 'UX-тестирование прототипа', description: 'Повторное тестирование интерфейса', owner: 'Дима К.', start_month: 2, duration: 0.5, type: 'dev', status: 'pending', order_index: 5 },

    { epic_id: epics[2].id, name: 'Встреча с Сашей Дзен', description: 'Обсудить аналитику, механизмы учёта в Mediascope', owner: 'Команда', start_month: 0.7, duration: 0.1, type: 'prep', status: 'done', order_index: 0 },
    { epic_id: epics[2].id, name: 'УТП и механизм интеграции', description: 'Определить эмбед vs интеграция, обмен трафиком', owner: 'Саша Дзен', start_month: 0.8, duration: 1, type: 'prep', status: 'in-progress', order_index: 1 },
    { epic_id: epics[2].id, name: 'Синк с Анастасией', description: 'Склейка контента в инфоповоды, отбор главных событий', owner: 'Анастасия (21.01)', start_month: 0.7, duration: 0.5, type: 'prep', status: 'in-progress', order_index: 2 },
    { epic_id: epics[2].id, name: 'Склейка по монотемам (Q1-Q2)', description: 'Полуавтоматическая склейка для датасетов', owner: 'Дзен + VK', start_month: 1.5, duration: 1.5, type: 'dev', status: 'pending', order_index: 3 },

    { epic_id: epics[3].id, name: 'Контентный план для рекома', description: 'Определить достаточность объёма контента', owner: 'Команда рекома', start_month: 1, duration: 0.5, type: 'prep', status: 'in-progress', order_index: 0 },
    { epic_id: epics[3].id, name: 'Механики продвижения', description: 'Квоты, тренды, бусты для главных событий', owner: 'Дима Бондарев', start_month: 1.5, duration: 1, type: 'dev', status: 'pending', order_index: 1 },
    { epic_id: epics[3].id, name: 'Свежесть контента в рекоме', description: 'Настроить показ новостей до 48 часов', owner: 'Реком', start_month: 1.5, duration: 1, type: 'dev', status: 'pending', order_index: 2 },
    { epic_id: epics[3].id, name: 'Индексация монотем в поиске', description: 'Научить поиск работать с новой сущностью', owner: 'Поиск', start_month: 2, duration: 1, type: 'dev', status: 'pending', order_index: 3 },
    { epic_id: epics[3].id, name: 'Целеполагание TVT', description: 'Верифицировать цифры по TVT из презентации', owner: 'Аналитика', start_month: 2, duration: 0.5, type: 'prep', status: 'pending', order_index: 4 },

    { epic_id: epics[4].id, name: 'ЗАПУСК НОВОСТЕЙ В КЛИПАХ', description: 'Открытие новостного контента в ленте Клипов', owner: 'Степан (23.01)', start_month: 2.5, duration: 0.5, type: 'milestone', status: 'pending', order_index: 0 },

    { epic_id: epics[5].id, name: 'Встреча с Димой Уваровым', description: 'Определить водораздел Новости vs Политика', owner: 'GR команда', start_month: 1, duration: 0.5, type: 'prep', status: 'pending', order_index: 0 },
    { epic_id: epics[5].id, name: 'Согласование со Степаном', description: 'Включение политики и новостей в клипы, стратборд', owner: 'Степан', start_month: 1.5, duration: 1, type: 'prep', status: 'pending', order_index: 1 },

    { epic_id: epics[6].id, name: 'Доработка MVP', description: 'Завершение базового функционала', owner: 'Разработка', start_month: 3, duration: 2, type: 'dev', status: 'pending', order_index: 0 },
    { epic_id: epics[6].id, name: 'Механика перехода с чипса', description: 'Поднятие этажа при переходе из монотемы', owner: 'UX', start_month: 4, duration: 1, type: 'dev', status: 'pending', order_index: 1 },
    { epic_id: epics[6].id, name: 'Синхрон главных тем с Дзен', description: 'Автоматическая склейка топовых тем', owner: 'Дзен + VK', start_month: 4, duration: 2, type: 'dev', status: 'pending', order_index: 2 },
    { epic_id: epics[6].id, name: 'Видеоформаты в Дзен', description: 'Текстовые форматы + AI-компиляции', owner: 'Дзен', start_month: 5, duration: 4, type: 'dev', status: 'pending', order_index: 3 },
    { epic_id: epics[6].id, name: 'ЗАПУСК ВИТРИНЫ', description: 'Полноценный раздел Новостей', owner: 'Команда', start_month: 6, duration: 0.5, type: 'milestone', status: 'pending', order_index: 4 },

    { epic_id: epics[7].id, name: 'Анализ метрик', description: 'Удержание, TVT, ER, CTR', owner: 'Аналитика', start_month: 6, duration: 3, type: 'growth', status: 'pending', order_index: 0 },
    { epic_id: epics[7].id, name: 'A/B тестирование', description: 'Тесты форматов подачи', owner: 'Продукт', start_month: 7, duration: 2, type: 'growth', status: 'pending', order_index: 1 },
    { epic_id: epics[7].id, name: 'Привлечение паблишеров', description: 'Расширение контентной базы', owner: 'Бизнес', start_month: 6.5, duration: 2.5, type: 'growth', status: 'pending', order_index: 2 },
    { epic_id: epics[7].id, name: 'Оптимизация CTR', description: 'Закрывашки при досмотре клипа', owner: 'UX', start_month: 7, duration: 1.5, type: 'growth', status: 'pending', order_index: 3 },

    { epic_id: epics[8].id, name: 'AI-компиляции видео Дзен', description: 'Автоматическая сборка из контента Дзен', owner: 'AI/Дзен', start_month: 7, duration: 2, type: 'dev', status: 'pending', order_index: 0 },
    { epic_id: epics[8].id, name: 'Монетизация клипов', description: 'Запуск рекламы в новостных клипах', owner: 'Бизнес', start_month: 9, duration: 2, type: 'growth', status: 'pending', order_index: 1 },
    { epic_id: epics[8].id, name: 'Персонализация', description: 'Умная лента на основе интересов', owner: 'ML', start_month: 10, duration: 2, type: 'dev', status: 'pending', order_index: 2 }
  ];

  const { error: tasksError } = await supabase
    .from('tasks')
    .insert(tasksData);

  if (tasksError) {
    console.error('Error creating tasks:', tasksError);
    throw new Error('Failed to create tasks');
  }

  // Mark localStorage as initialized for demo mode
  if (isDemoMode) {
    markStorageInitialized();
  }

  return project.id;
}
