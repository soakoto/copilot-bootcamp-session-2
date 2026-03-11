const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Todo workflow', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('displays the app header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /to do app/i })).toBeVisible();
  });

  test('adds a task without a due date', async ({ page }) => {
    const taskName = `Simple task ${Date.now()}`;
    await todoPage.addTask(taskName);
    await expect(todoPage.getTaskItem(taskName)).toBeVisible();
  });

  test('adds a task with a due date', async ({ page }) => {
    const taskName = `Dated task ${Date.now()}`;
    await todoPage.addTask(taskName, '04/30/2027');
    await expect(todoPage.getTaskItem(taskName)).toBeVisible();
    // Due date chip should appear somewhere in the task row
    await expect(todoPage.getTaskItem(taskName).getByText(/2027/)).toBeVisible();
  });

  test('shows a validation error when the task name is blank', async ({ page }) => {
    await todoPage.addButton.click();
    await expect(page.getByText(/task name is required/i)).toBeVisible();
  });

  test('edits an existing task name', async ({ page }) => {
    const original = `Edit me ${Date.now()}`;
    const updated = `Edited ${Date.now()}`;
    await todoPage.addTask(original);
    await todoPage.editTask(original, updated);
    await expect(page.getByText(updated, { exact: true })).toBeVisible();
    await expect(page.getByText(original, { exact: true })).not.toBeVisible();
  });

  test('marks a task as complete and back to incomplete', async ({ page }) => {
    const taskName = `Toggle me ${Date.now()}`;
    await todoPage.addTask(taskName);

    // Mark complete
    await todoPage.toggleComplete(taskName);
    await expect(todoPage.getTaskItem(taskName).getByRole('checkbox')).toBeChecked();

    // Toggle back
    await todoPage.toggleComplete(taskName);
    await expect(todoPage.getTaskItem(taskName).getByRole('checkbox')).not.toBeChecked();
  });

  test('deletes a task after confirming the dialog', async ({ page }) => {
    const taskName = `Delete me ${Date.now()}`;
    await todoPage.addTask(taskName);
    await todoPage.deleteTask(taskName);
    await expect(page.getByText(taskName, { exact: true })).not.toBeVisible();
  });

  test('completed tasks appear below incomplete tasks', async ({ page }) => {
    const incompleteTask = `Incomplete ${Date.now()}`;
    const completeTask = `Complete ${Date.now()}`;

    await todoPage.addTask(incompleteTask);
    await todoPage.addTask(completeTask);
    await todoPage.toggleComplete(completeTask);

    // Poll until the sort order reflects the toggle
    await expect(async () => {
      const items = await page.getByRole('listitem').allTextContents();
      const incIdx = items.findIndex((t) => t.includes(incompleteTask));
      const compIdx = items.findIndex((t) => t.includes(completeTask));
      expect(incIdx).toBeLessThan(compIdx);
    }).toPass({ timeout: 5000 });
  });
});
