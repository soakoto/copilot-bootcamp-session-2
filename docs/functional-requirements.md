# Functional Requirements

## Overview

This document outlines the core functional requirements for the To Do App.

---

## FR-1: Add a Task

**As a user, I want to add a new task so that I can keep track of things I need to do.**

- The user can enter a task name in a text input field.
- The user submits the task via a button or by pressing Enter.
- The task is saved and immediately displayed in the task list.
- Empty or whitespace-only task names must be rejected.

---

## FR-2: Add a Due Date to a Task

**As a user, I want to assign a due date to a task so that I know when it needs to be completed.**

- The user can set an optional due date when creating or editing a task.
- The due date is displayed alongside the task name in the task list.
- Tasks without a due date are still valid and can be created freely.
- The due date must be a valid calendar date.

---

## FR-3: Edit a Task

**As a user, I want to edit an existing task so that I can correct mistakes or update its details.**

- The user can edit the task name of any existing task.
- The user can update the due date of an existing task.
- Changes are saved and immediately reflected in the task list.
- Saving an empty task name must be rejected.

---

## FR-4: Delete a Task

**As a user, I want to delete a task so that I can remove items I no longer need to track.**

- The user can delete any task from the task list.
- The task is immediately removed from the list upon deletion.
- A confirmation prompt may be shown to prevent accidental deletion.

---

## FR-5: Mark a Task as Complete

**As a user, I want to mark a task as complete so that I can track my progress.**

- The user can toggle the completion status of a task.
- Completed tasks are visually distinguished from incomplete tasks (e.g., strikethrough, different color).
- The completion status is persisted and survives page refresh.

---

## FR-6: Sort Tasks

**As a user, I want tasks to be displayed in a meaningful order so that I can prioritize my work.**

- Tasks are sorted by default in ascending order of due date (tasks with the earliest due date appear first).
- Tasks without a due date appear at the bottom of the list.
- As a secondary sort, tasks with the same due date are ordered by creation date (oldest first).
- Completed tasks are sorted to the bottom of the list, below all incomplete tasks.

---

## FR-7: View All Tasks

**As a user, I want to see all my tasks in a list so that I have a clear overview of what needs to be done.**

- All tasks are displayed in a list on the main page.
- Each task entry shows the task name, due date (if set), and completion status.
- The task list updates in real time without requiring a full page reload.

---

## FR-8: Persist Tasks

**As a user, I want my tasks to be saved so that they are not lost when I close or refresh the application.**

- All tasks are stored in the backend database.
- Tasks are fetched from the backend on page load.
- Any create, update, or delete operation is immediately persisted to the database.
