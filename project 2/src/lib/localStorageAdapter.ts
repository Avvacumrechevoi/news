import type { Epic, Task, Project } from '../types/gantt';

const STORAGE_KEYS = {
  projects: 'gantt_projects',
  epics: 'gantt_epics',
  tasks: 'gantt_tasks',
  initialized: 'gantt_initialized'
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Query builder that mimics Supabase API
class QueryBuilder<T> {
  private data: T[];
  private filters: Array<(item: T) => boolean> = [];
  private orderConfig: { field: keyof T; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private singleResult: boolean = false;
  private maybeSingleResult: boolean = false;

  constructor(_tableName: string, data: T[]) {
    this.data = [...data];
  }

  select(_fields?: string): this {
    // Fields parameter ignored - we always select all fields
    void _fields;
    return this;
  }

  eq<K extends keyof T>(field: K, value: T[K]): this {
    this.filters.push((item) => item[field] === value);
    return this;
  }

  in<K extends keyof T>(field: K, values: T[K][]): this {
    this.filters.push((item) => values.includes(item[field]));
    return this;
  }

  order<K extends keyof T>(field: K, options?: { ascending?: boolean }): this {
    this.orderConfig = { field, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  single(): Promise<{ data: T | null; error: Error | null }> {
    this.singleResult = true;
    return this.execute() as Promise<{ data: T | null; error: Error | null }>;
  }

  maybeSingle(): Promise<{ data: T | null; error: Error | null }> {
    this.maybeSingleResult = true;
    return this.execute() as Promise<{ data: T | null; error: Error | null }>;
  }

  private async execute(): Promise<{ data: T[] | T | null; error: Error | null }> {
    let result = this.data;

    // Apply filters
    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    // Apply ordering
    if (this.orderConfig) {
      const { field, ascending } = this.orderConfig;
      result.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    // Return single or array
    if (this.singleResult) {
      return { data: result[0] || null, error: null };
    }
    if (this.maybeSingleResult) {
      return { data: result[0] || null, error: null };
    }

    return { data: result, error: null };
  }

  then<TResult1 = { data: T[]; error: Error | null }>(
    onfulfilled?: ((value: { data: T[] | T | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null
  ): Promise<TResult1> {
    return this.execute().then(onfulfilled as ((value: { data: T[] | T | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | undefined);
  }
}

// Insert builder
class InsertBuilder<T extends { id?: string }> {
  private storageKey: string;
  private items: Partial<T>[];
  private returnData: boolean = false;

  constructor(_tableName: string, storageKey: string, items: Partial<T> | Partial<T>[]) {
    this.storageKey = storageKey;
    this.items = Array.isArray(items) ? items : [items];
  }

  select(): this {
    this.returnData = true;
    return this;
  }

  single(): Promise<{ data: T | null; error: Error | null }> {
    return this.execute().then(result => ({
      data: result.data ? (result.data as T[])[0] : null,
      error: result.error
    }));
  }

  maybeSingle(): Promise<{ data: T | null; error: Error | null }> {
    return this.single();
  }

  private async execute(): Promise<{ data: T[] | null; error: Error | null }> {
    try {
      const existing = getFromStorage<T>(this.storageKey);
      const now = new Date().toISOString();
      
      const newItems = this.items.map(item => ({
        ...item,
        id: item.id || generateId(),
        created_at: now,
        updated_at: now
      })) as unknown as T[];

      saveToStorage(this.storageKey, [...existing, ...newItems]);

      if (this.returnData) {
        return { data: newItems, error: null };
      }
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }

  then<TResult1 = { data: T[] | null; error: Error | null }>(
    onfulfilled?: ((value: { data: T[] | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null
  ): Promise<TResult1> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.execute().then(onfulfilled as any);
  }
}

// Update builder
class UpdateBuilder<T extends { id?: string }> {
  private storageKey: string;
  private updates: Partial<T>;
  private filters: Array<(item: T) => boolean> = [];

  constructor(_tableName: string, storageKey: string, updates: Partial<T>) {
    this.storageKey = storageKey;
    this.updates = updates;
  }

  eq<K extends keyof T>(field: K, value: T[K]): this {
    this.filters.push((item) => item[field] === value);
    return this;
  }

  private async execute(): Promise<{ data: null; error: Error | null }> {
    try {
      const items = getFromStorage<T>(this.storageKey);
      const updatedItems = items.map(item => {
        const matches = this.filters.every(filter => filter(item));
        if (matches) {
          return { ...item, ...this.updates, updated_at: new Date().toISOString() };
        }
        return item;
      });
      saveToStorage(this.storageKey, updatedItems);
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }

  then<TResult1 = { data: null; error: Error | null }>(
    onfulfilled?: ((value: { data: null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null
  ): Promise<TResult1> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.execute().then(onfulfilled as any);
  }
}

// Delete builder
class DeleteBuilder<T> {
  private storageKey: string;
  private filters: Array<(item: T) => boolean> = [];

  constructor(_tableName: string, storageKey: string) {
    this.storageKey = storageKey;
  }

  eq<K extends keyof T>(field: K, value: T[K]): this {
    this.filters.push((item) => item[field] === value);
    return this;
  }

  private async execute(): Promise<{ data: null; error: Error | null }> {
    try {
      const items = getFromStorage<T>(this.storageKey);
      const filteredItems = items.filter(item => 
        !this.filters.every(filter => filter(item))
      );
      saveToStorage(this.storageKey, filteredItems);
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }

  then<TResult1 = { data: null; error: Error | null }>(
    onfulfilled?: ((value: { data: null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null
  ): Promise<TResult1> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.execute().then(onfulfilled as any);
  }
}

// Table accessor
function createTable<T extends { id?: string }>(tableName: string, storageKey: string) {
  return {
    select(fields?: string) {
      return new QueryBuilder<T>(tableName, getFromStorage<T>(storageKey)).select(fields);
    },
    insert(items: Partial<T> | Partial<T>[]) {
      return new InsertBuilder<T>(tableName, storageKey, items);
    },
    update(updates: Partial<T>) {
      return new UpdateBuilder<T>(tableName, storageKey, updates);
    },
    delete() {
      return new DeleteBuilder<T>(tableName, storageKey);
    }
  };
}

// Type for the table function
type TableFunction = {
  (table: 'projects'): ReturnType<typeof createTable<Project>>;
  (table: 'epics'): ReturnType<typeof createTable<Epic>>;
  (table: 'tasks'): ReturnType<typeof createTable<Task>>;
};

// Create the from function with proper overloads
const fromFunction: TableFunction = ((table: string) => {
  switch (table) {
    case 'projects':
      return createTable<Project>('projects', STORAGE_KEYS.projects);
    case 'epics':
      return createTable<Epic>('epics', STORAGE_KEYS.epics);
    case 'tasks':
      return createTable<Task>('tasks', STORAGE_KEYS.tasks);
    default:
      throw new Error(`Unknown table: ${table}`);
  }
}) as TableFunction;

// Supabase-compatible client
export const localStorageClient = {
  from: fromFunction
};

export function isStorageInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.initialized) === 'true';
}

export function markStorageInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

export function clearStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
