const { expect } = require('@playwright/test');

class TodoPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.taskNameInput = page.getByRole('textbox', { name: /task name/i });
    this.dueDateInput = page.getByRole('textbox', { name: /due date/i });
    this.addButton = page.getByRole('button', { name: /add task/i });
    this.taskList = page.getByRole('list', { name: /task list/i });
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async addTask(name, dueDate = null) {
    await this.taskNameInput.fill(name);
    if (dueDate) {
      await this.dueDateInput.fill(dueDate);
      // dismiss the date picker
      await this.taskNameInput.click();
    }
    await this.addButton.click();
    // wait for the new task to appear
    await expect(this.page.getByText(name, { exact: true })).toBeVisible();
  }

  getTaskItem(name) {
    return this.page.getByRole('listitem').filter({ hasText: name });
  }

  async deleteTask(name) {
    const item = this.getTaskItem(name);
    await item.getByRole('button', { name: new RegExp(`delete task: ${name}`, 'i') }).click();
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('button', { name: /delete/i }).click();
    await expect(this.page.getByText(name, { exact: true })).not.toBeVisible();
  }

  async editTask(name, newName, newDueDate = null) {
    const item = this.getTaskItem(name);
    await item.getByRole('button', { name: new RegExp(`edit task: ${name}`, 'i') }).click();
    const dialog = this.page.getByRole('dialog');
    const nameField = dialog.getByRole('textbox', { name: /task name/i });
    await nameField.clear();
    await nameField.fill(newName);
    if (newDueDate) {
      const dateField = dialog.getByRole('textbox', { name: /due date/i });
      await dateField.clear();
      await dateField.fill(newDueDate);
      await nameField.click();
    }
    await dialog.getByRole('button', { name: /save/i }).click();
    await expect(this.page.getByText(newName, { exact: true })).toBeVisible();
  }

  async toggleComplete(name) {
    const item = this.getTaskItem(name);
    await item.getByRole('checkbox').click();
  }

  async isChecked(name) {
    const item = this.getTaskItem(name);
    return item.getByRole('checkbox').isChecked();
  }
}

module.exports = { TodoPage };
