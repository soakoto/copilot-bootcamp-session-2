import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import App from '../App';
import theme from '../theme';

const TASKS = [
  { id: 1, name: 'Buy groceries', due_date: null, completed: 0, created_at: '2026-03-01T00:00:00.000Z' },
  { id: 2, name: 'Write report', due_date: '2026-04-01', completed: 0, created_at: '2026-03-02T00:00:00.000Z' },
];

let taskStore = [];

const server = setupServer(
  rest.get('/api/items', (_req, res, ctx) => res(ctx.status(200), ctx.json(taskStore))),

  rest.post('/api/items', async (req, res, ctx) => {
    const { name, due_date } = await req.json();
    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Item name is required' }));
    }
    const newTask = { id: Date.now(), name: name.trim(), due_date: due_date || null, completed: 0, created_at: new Date().toISOString() };
    taskStore.push(newTask);
    return res(ctx.status(201), ctx.json(newTask));
  }),

  rest.put('/api/items/:id', async (req, res, ctx) => {
    const id = parseInt(req.params.id);
    const fields = await req.json();
    const idx = taskStore.findIndex((t) => t.id === id);
    if (idx === -1) return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
    taskStore[idx] = { ...taskStore[idx], ...fields };
    return res(ctx.status(200), ctx.json(taskStore[idx]));
  }),

  rest.patch('/api/items/:id/complete', (req, res, ctx) => {
    const id = parseInt(req.params.id);
    const idx = taskStore.findIndex((t) => t.id === id);
    if (idx === -1) return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
    taskStore[idx] = { ...taskStore[idx], completed: taskStore[idx].completed === 1 ? 0 : 1 };
    return res(ctx.status(200), ctx.json(taskStore[idx]));
  }),

  rest.delete('/api/items/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id);
    const idx = taskStore.findIndex((t) => t.id === id);
    if (idx === -1) return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
    taskStore.splice(idx, 1);
    return res(ctx.status(200), ctx.json({ message: 'Item deleted successfully', id }));
  })
);

const renderApp = () => {
  render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <App />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

beforeAll(() => server.listen());
beforeEach(() => { taskStore = [...TASKS.map((t) => ({ ...t }))]; });
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App', () => {
  test('renders the page header', async () => {
    renderApp();
    expect(await screen.findByRole('heading', { name: /to do app/i })).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    renderApp();
    expect(await screen.findByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Write report')).toBeInTheDocument();
  });

  test('shows empty state when no tasks exist', async () => {
    taskStore = [];
    renderApp();
    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });

  test('shows an error alert when the API fails', async () => {
    server.use(rest.get('/api/items', (_req, res, ctx) => res(ctx.status(500))));
    renderApp();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  test('adds a new task via the form', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Buy groceries');

    await user.type(screen.getByRole('textbox', { name: /task name/i }), 'New task');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(screen.getByText('New task')).toBeInTheDocument();
    });
  });

  test('shows inline error when submitting an empty task name', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Buy groceries');

    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(await screen.findByText(/task name is required/i)).toBeInTheDocument();
  });

  test('marks a task as complete by clicking its checkbox', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Buy groceries');

    const checkbox = screen.getByRole('checkbox', { name: /mark "Buy groceries"/i });
    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  test('deletes a task after confirming in the dialog', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Buy groceries');

    await user.click(screen.getByRole('button', { name: /delete task: Buy groceries/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });
  });
});