import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const AddTaskForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Task name is required');
      return;
    }
    setNameError('');
    setSubmitting(true);
    try {
      await onAdd(name.trim(), dueDate ? dueDate.format('YYYY-MM-DD') : null);
      setName('');
      setDueDate(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} aria-label="Add new task form">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
        <TextField
          label="Task name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          error={Boolean(nameError)}
          helperText={nameError}
          size="medium"
          inputProps={{ 'aria-label': 'Task name' }}
          sx={{ flexGrow: 1 }}
        />
        <DatePicker
          label="Due date (optional)"
          value={dueDate}
          onChange={(val) => setDueDate(val)}
          minDate={dayjs()}
          slotProps={{
            textField: {
              size: 'medium',
              inputProps: { 'aria-label': 'Due date' },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="medium"
          disabled={submitting}
          sx={{ height: 56, whiteSpace: 'nowrap' }}
        >
          Add Task
        </Button>
      </Stack>
    </Box>
  );
};

export default AddTaskForm;
