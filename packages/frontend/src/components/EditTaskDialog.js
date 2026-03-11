import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const EditTaskDialog = ({ open, task, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDueDate(task.due_date ? dayjs(task.due_date) : null);
      setNameError('');
    }
  }, [task]);

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Task name is required');
      return;
    }
    setNameError('');
    setSaving(true);
    try {
      await onSave(task.id, {
        name: name.trim(),
        due_date: dueDate ? dueDate.format('YYYY-MM-DD') : null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="edit-task-title">
      <DialogTitle id="edit-task-title">Edit Task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Task name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            error={Boolean(nameError)}
            helperText={nameError}
            fullWidth
            autoFocus
            inputProps={{ 'aria-label': 'Task name' }}
          />
          <DatePicker
            label="Due date (optional)"
            value={dueDate}
            onChange={(val) => setDueDate(val)}
            slotProps={{
              textField: {
                fullWidth: true,
                inputProps: { 'aria-label': 'Due date' },
              },
              field: { clearable: true },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskDialog;
