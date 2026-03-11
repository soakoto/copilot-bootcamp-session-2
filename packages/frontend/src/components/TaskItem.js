import React from 'react';
import dayjs from 'dayjs';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Stack from '@mui/material/Stack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const getDueDateChip = (due_date) => {
  if (!due_date) return null;

  const today = dayjs().startOf('day');
  const due = dayjs(due_date);
  const daysUntil = due.diff(today, 'day');

  let color;
  let label = due.format('MMM D, YYYY');

  if (daysUntil < 0) {
    color = 'error';
    label = `Overdue · ${label}`;
  } else if (daysUntil <= 3) {
    color = 'warning';
    label = `Due soon · ${label}`;
  } else {
    color = 'success';
  }

  return <Chip label={label} color={color} size="small" aria-label={`Due date: ${label}`} />;
};

const TaskItem = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const { id, name, due_date, completed } = task;

  return (
    <ListItem
      disablePadding
      sx={{ py: 0.5 }}
      secondaryAction={
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            color="primary"
            aria-label={`Edit task: ${name}`}
            onClick={() => onEdit(task)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            aria-label={`Delete task: ${name}`}
            onClick={() => onDelete(task)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      }
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Checkbox
          checked={completed === 1}
          onChange={() => onToggleComplete(id)}
          inputProps={{ 'aria-label': `Mark "${name}" as ${completed ? 'incomplete' : 'complete'}` }}
        />
      </ListItemIcon>
      <ListItemText
        primary={name}
        secondary={getDueDateChip(due_date)}
        primaryTypographyProps={{
          sx: {
            textDecoration: completed === 1 ? 'line-through' : 'none',
            color: completed === 1 ? 'text.secondary' : 'text.primary',
          },
        }}
        secondaryTypographyProps={{ component: 'span' }}
      />
    </ListItem>
  );
};

export default TaskItem;
