export type TaskType = 'prep' | 'dev' | 'launch' | 'growth' | 'milestone';
export type TaskStatus = 'pending' | 'in-progress' | 'done';
export type EpicType = 'content' | 'tech' | 'integration' | 'distribution' | 'optimization' | 'monetization';

export interface Task {
  id: string;
  epic_id: string;
  name: string;
  description: string;
  owner: string;
  start_month: number;
  duration: number;
  type: TaskType;
  status: TaskStatus;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Epic {
  id: string;
  project_id: string;
  name: string;
  description: string;
  type: EpicType;
  start_month: number;
  duration: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  tasks?: Task[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  epics?: Epic[];
}

export type ViewMode = 'all' | 'epics';
