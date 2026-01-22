/*
  # Схема базы данных для диаграммы Ганта

  1. Новые таблицы
    - `projects`
      - `id` (uuid, primary key) - идентификатор проекта
      - `name` (text) - название проекта
      - `description` (text) - описание проекта
      - `created_at` (timestamptz) - дата создания
      - `updated_at` (timestamptz) - дата обновления
    
    - `epics`
      - `id` (uuid, primary key) - идентификатор эпика
      - `project_id` (uuid, foreign key) - ссылка на проект
      - `name` (text) - название эпика
      - `description` (text) - описание эпика
      - `type` (text) - тип эпика (content, tech, integration, distribution, optimization, monetization)
      - `start_month` (numeric) - месяц начала (0-12)
      - `duration` (numeric) - длительность в месяцах
      - `order_index` (integer) - порядок отображения
      - `created_at` (timestamptz) - дата создания
      - `updated_at` (timestamptz) - дата обновления
    
    - `tasks`
      - `id` (uuid, primary key) - идентификатор задачи
      - `epic_id` (uuid, foreign key) - ссылка на эпик
      - `name` (text) - название задачи
      - `description` (text) - описание задачи
      - `owner` (text) - ответственный
      - `start_month` (numeric) - месяц начала (0-12)
      - `duration` (numeric) - длительность в месяцах
      - `type` (text) - тип задачи (prep, dev, launch, growth, milestone)
      - `status` (text) - статус (pending, in-progress, done)
      - `order_index` (integer) - порядок отображения
      - `created_at` (timestamptz) - дата создания
      - `updated_at` (timestamptz) - дата обновления

  2. Безопасность
    - Включить RLS для всех таблиц
    - Добавить политики для публичного доступа (для демо-версии)
*/

-- Создание таблицы проектов
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы эпиков
CREATE TABLE IF NOT EXISTS epics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL DEFAULT 'content',
  start_month numeric NOT NULL DEFAULT 0,
  duration numeric NOT NULL DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы задач
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id uuid REFERENCES epics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  owner text DEFAULT '',
  start_month numeric NOT NULL DEFAULT 0,
  duration numeric NOT NULL DEFAULT 1,
  type text NOT NULL DEFAULT 'prep',
  status text NOT NULL DEFAULT 'pending',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS epics_project_id_idx ON epics(project_id);
CREATE INDEX IF NOT EXISTS tasks_epic_id_idx ON tasks(epic_id);

-- Включение Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Политики для публичного доступа (для демо-версии)
CREATE POLICY "Публичный доступ к проектам"
  ON projects FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Публичное создание проектов"
  ON projects FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Публичное обновление проектов"
  ON projects FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Публичное удаление проектов"
  ON projects FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Публичный доступ к эпикам"
  ON epics FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Публичное создание эпиков"
  ON epics FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Публичное обновление эпиков"
  ON epics FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Публичное удаление эпиков"
  ON epics FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Публичный доступ к задачам"
  ON tasks FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Публичное создание задач"
  ON tasks FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Публичное обновление задач"
  ON tasks FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Публичное удаление задач"
  ON tasks FOR DELETE
  TO anon
  USING (true);