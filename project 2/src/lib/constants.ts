export const MONTHS = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];

export const TYPE_LABELS = {
  prep: 'Подготовка',
  dev: 'Разработка',
  launch: 'Запуск',
  growth: 'Рост',
  milestone: 'Релиз'
} as const;

export const STATUS_LABELS = {
  done: 'Выполнено',
  'in-progress': 'В работе',
  pending: 'Ожидает'
} as const;

export const EPIC_TYPE_LABELS = {
  content: 'Контент',
  tech: 'Технологии',
  integration: 'Интеграция',
  distribution: 'Дистрибуция',
  optimization: 'Оптимизация',
  monetization: 'Монетизация'
} as const;

export const EPIC_TYPE_COLORS = {
  content: 'bg-blue-400',
  tech: 'bg-slate-500',
  integration: 'bg-blue-500',
  distribution: 'bg-slate-600',
  optimization: 'bg-blue-400',
  monetization: 'bg-slate-500'
} as const;

export const TASK_TYPE_COLORS = {
  prep: 'bg-blue-400',
  dev: 'bg-slate-500',
  launch: 'bg-blue-600',
  growth: 'bg-slate-400',
  milestone: 'bg-blue-700'
} as const;
