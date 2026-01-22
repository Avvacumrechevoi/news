import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Epic, Task, TaskStatus } from '../types/gantt';

export function useGanttData(projectId: string) {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: epicsData, error: epicsError } = await supabase
        .from('epics')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (epicsError) throw epicsError;

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('epic_id', epicsData?.map(e => e.id) || [])
        .order('order_index', { ascending: true });

      if (tasksError) throw tasksError;

      const epicsWithTasks = epicsData?.map(epic => ({
        ...epic,
        tasks: tasksData?.filter(task => task.epic_id === epic.id) || []
      })) || [];

      setEpics(epicsWithTasks);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateTaskStatus = async (epicId: string, taskId: string) => {
    const epic = epics.find(e => e.id === epicId);
    const task = epic?.tasks?.find(t => t.id === taskId);
    if (!task) return;

    const statuses: TaskStatus[] = ['pending', 'in-progress', 'done'];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    const { error } = await supabase
      .from('tasks')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
      return;
    }

    setEpics(epics.map(e => {
      if (e.id === epicId) {
        return {
          ...e,
          tasks: e.tasks?.map(t => t.id === taskId ? { ...t, status: nextStatus } : t)
        };
      }
      return e;
    }));
  };

  const saveTask = async (epicId: string, task: Partial<Task>) => {
    if (task.id) {
      const { error } = await supabase
        .from('tasks')
        .update({ ...task, updated_at: new Date().toISOString() })
        .eq('id', task.id);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      setEpics(epics.map(e => {
        if (e.id === epicId) {
          return {
            ...e,
            tasks: e.tasks?.map(t => t.id === task.id ? { ...t, ...task } : t)
          };
        }
        return e;
      }));
    } else {
      const epic = epics.find(e => e.id === epicId);
      const maxOrder = Math.max(0, ...(epic?.tasks?.map(t => t.order_index) || []));

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          epic_id: epicId,
          order_index: maxOrder + 1
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating task:', error);
        return;
      }

      if (data) {
        setEpics(epics.map(e => {
          if (e.id === epicId) {
            return {
              ...e,
              tasks: [...(e.tasks || []), data]
            };
          }
          return e;
        }));
      }
    }
  };

  const deleteTask = async (epicId: string, taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    setEpics(epics.map(e => {
      if (e.id === epicId) {
        return {
          ...e,
          tasks: e.tasks?.filter(t => t.id !== taskId)
        };
      }
      return e;
    }));
  };

  const saveEpic = async (epic: Partial<Epic>) => {
    if (epic.id) {
      const { error } = await supabase
        .from('epics')
        .update({ ...epic, updated_at: new Date().toISOString() })
        .eq('id', epic.id);

      if (error) {
        console.error('Error updating epic:', error);
        return;
      }

      setEpics(epics.map(e => e.id === epic.id ? { ...e, ...epic } : e));
    } else {
      const maxOrder = Math.max(0, ...(epics.map(e => e.order_index) || []));

      const { data, error } = await supabase
        .from('epics')
        .insert({
          ...epic,
          project_id: projectId,
          order_index: maxOrder + 1
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating epic:', error);
        return;
      }

      if (data) {
        setEpics([...epics, { ...data, tasks: [] }]);
      }
    }
  };

  const deleteEpic = async (epicId: string) => {
    await supabase
      .from('tasks')
      .delete()
      .eq('epic_id', epicId);

    const { error } = await supabase
      .from('epics')
      .delete()
      .eq('id', epicId);

    if (error) {
      console.error('Error deleting epic:', error);
      return;
    }

    setEpics(epics.filter(e => e.id !== epicId));
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
