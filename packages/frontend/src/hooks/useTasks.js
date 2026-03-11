import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api/items';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (name, due_date) => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, due_date: due_date || null }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to add task');
    }
    const newTask = await response.json();
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id, fields) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update task');
    }
    const updated = await response.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const toggleComplete = async (id) => {
    const response = await fetch(`${API_BASE}/${id}/complete`, { method: 'PATCH' });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to toggle completion');
    }
    const updated = await response.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTask = async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete task');
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, loading, error, addTask, updateTask, toggleComplete, deleteTask, fetchTasks };
};

export default useTasks;
