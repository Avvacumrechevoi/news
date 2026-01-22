import { useState, useEffect, useCallback } from 'react';
import {
  createEpic,
  createTask,
  listEpics,
  listTasks,
  removeEpic,
  removeTask,
  updateEpic,
  updateTask
} from '../lib/localStore';
import type { Epic, Task, TaskStatus } from '../types/gantt';

export function useGanttData(projectId: string) {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const epicsData = listEpics(projectId);
      const tasksData = listTasks(epicsData.map((epic) => epic.id));

      const epicsWithTasks = epicsData.map((epic) => ({
        ...epic,
        tasks: tasksData.filter((task) => task.epic_id === epic.id)
      }));

      setEpics(epicsWithTasks);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateTaskStatus = async (epicId: string, taskId: string) => {
    const epic = epics.find(e => e.id === epicId);
    const task = epic?.tasks?.find(t => t.id === taskId);
    if (!task) return;

    const statuses: TaskStatus[] = ['pending', 'in-progress', 'done'];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      const updated = updateTask(taskId, { status: nextStatus });
      if (!updated) {
        return;
      }

      setEpics((prev) =>
        prev.map((epicItem) => {
          if (epicItem.id === epicId) {
            return {
              ...epicItem,
              tasks: epicItem.tasks?.map((t) =>
                t.id === taskId ? { ...t, status: nextStatus } : t
              )
            };
          }
          return epicItem;
        })
      );
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const saveTask = async (epicId: string, task: Partial<Task>) => {
    const epic = epics.find((item) => item.id === epicId);
    if (!epic) {
      return;
    }

    if (task.id) {
      try {
        const { id, ...updates } = task;
        const updated = updateTask(id, { ...updates, epic_id: epicId });
        if (!updated) {
          return;
        }

        setEpics((prev) =>
          prev.map((epicItem) => {
            if (epicItem.id === epicId) {
              return {
                ...epicItem,
                tasks: epicItem.tasks?.map((t) => (t.id === id ? updated : t))
              };
            }
            return epicItem;
          })
        );
      } catch (err) {
        console.error('Error updating task:', err);
      }
    } else {
      const maxOrder = Math.max(0, ...(epic.tasks?.map((t) => t.order_index) || []));
      const name = task.name?.trim();
      if (!name) {
        return;
      }

      try {
        const created = createTask({
          epic_id: epicId,
          name,
          description: task.description ?? '',
          owner: task.owner ?? '',
          start_month: task.start_month ?? epic.start_month ?? 0,
          duration: task.duration ?? 1,
          type: task.type ?? 'prep',
          status: task.status ?? 'pending',
          order_index: maxOrder + 1
        });

        setEpics((prev) =>
          prev.map((epicItem) => {
            if (epicItem.id === epicId) {
              return {
                ...epicItem,
                tasks: [...(epicItem.tasks || []), created]
              };
            }
            return epicItem;
          })
        );
      } catch (err) {
        console.error('Error creating task:', err);
      }
    }
  };

  const deleteTask = async (epicId: string, taskId: string) => {
    try {
      const removed = removeTask(taskId);
      if (!removed) {
        return;
      }
      setEpics((prev) =>
        prev.map((epicItem) => {
          if (epicItem.id === epicId) {
            return {
              ...epicItem,
              tasks: epicItem.tasks?.filter((t) => t.id !== taskId)
            };
          }
          return epicItem;
        })
      );
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const saveEpic = async (epic: Partial<Epic>) => {
    if (epic.id) {
      try {
        const { id, ...updates } = epic;
        const updated = updateEpic(id, updates);
        if (!updated) {
          return;
        }
        setEpics((prev) =>
          prev.map((epicItem) =>
            epicItem.id === id
              ? { ...epicItem, ...updated, tasks: epicItem.tasks }
              : epicItem
          )
        );
      } catch (err) {
        console.error('Error updating epic:', err);
      }
    } else {
      const maxOrder = Math.max(0, ...(epics.map((item) => item.order_index) || []));
      const name = epic.name?.trim();
      if (!name) {
        return;
      }

      try {
        const created = createEpic({
          project_id: projectId,
          name,
          description: epic.description ?? '',
          type: epic.type ?? 'content',
          start_month: epic.start_month ?? 0,
          duration: epic.duration ?? 3,
          order_index: maxOrder + 1
        });

        setEpics((prev) => [...prev, { ...created, tasks: [] }]);
      } catch (err) {
        console.error('Error creating epic:', err);
      }
    }
  };

  const deleteEpic = async (epicId: string) => {
    try {
      const removed = removeEpic(epicId);
      if (!removed) {
        return;
      }
      setEpics((prev) => prev.filter((epicItem) => epicItem.id !== epicId));
    } catch (err) {
      console.error('Error deleting epic:', err);
    }
  };

  return {
    epics,
    loading,
    error,
    updateTaskStatus,
    saveTask,
    deleteTask,
    saveEpic,
    deleteEpic,
    reload: loadData
  };
}
