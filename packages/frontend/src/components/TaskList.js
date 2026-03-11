import React from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete }) => {
  if (tasks.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No tasks yet. Add one above!
      </Typography>
    );
  }

  return (
    <List aria-label="Task list" disablePadding>
      {tasks.map((task, index) => (
        <React.Fragment key={task.id}>
          <TaskItem
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
          />
          {index < tasks.length - 1 && <Divider component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default TaskList;
