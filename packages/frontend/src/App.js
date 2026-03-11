import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import AddTaskForm from './components/AddTaskForm';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import EditTaskDialog from './components/EditTaskDialog';
import TaskList from './components/TaskList';
import useTasks from './hooks/useTasks';

function App() {
  const { tasks, loading, error, addTask, updateTask, toggleComplete, deleteTask } = useTasks();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAdd = async (name, due_date) => {
    try {
      await addTask(name, due_date);
      showSnackbar('Task added');
    } catch (err) {
      showSnackbar(err.message, 'error');
      throw err;
    }
  };

  const handleSaveEdit = async (id, fields) => {
    try {
      await updateTask(id, fields);
      showSnackbar('Task updated');
    } catch (err) {
      showSnackbar(err.message, 'error');
      throw err;
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await toggleComplete(id);
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(deleteTarget.id);
      showSnackbar('Task deleted');
    } catch (err) {
      showSnackbar(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box
        component="header"
        sx={{ bgcolor: 'primary.main', color: 'white', py: 3, mb: 4, boxShadow: 2 }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h1" fontWeight={700}>
            To Do App
          </Typography>
          <Typography variant="subtitle1">Keep track of your tasks</Typography>
        </Container>
      </Box>

      <Container maxWidth="md" component="main">
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Add New Task
          </Typography>
          <AddTaskForm onAdd={handleAdd} />
        </Paper>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Tasks
          </Typography>

          {loading && (
            <Typography color="text.secondary">Loading tasks…</Typography>
          )}

          {!loading && error && (
            <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
          )}

          {!loading && !error && (
            <TaskList
              tasks={tasks}
              onEdit={(task) => setEditTarget(task)}
              onDelete={(task) => setDeleteTarget(task)}
              onToggleComplete={handleToggleComplete}
            />
          )}
        </Paper>
      </Container>

      <EditTaskDialog
        open={Boolean(editTarget)}
        task={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdit}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        task={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        aria-live="polite"
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;