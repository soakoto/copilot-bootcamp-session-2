# Coding Guidelines

## Overview

This document describes the coding style and quality principles for the To Do App. These guidelines apply to all JavaScript and React code across both the `frontend` and `backend` packages. Consistent application of these standards ensures the codebase remains readable, maintainable, and easy to extend.

---

## 1. General Formatting

Consistent formatting reduces cognitive overhead when reading and reviewing code. The project follows standard JavaScript community conventions:

- **Indentation**: Use 2 spaces. Do not use tabs.
- **Line length**: Keep lines to a maximum of 100 characters where practical.
- **Semicolons**: Always terminate statements with a semicolon.
- **Quotes**: Use single quotes for strings in backend (Node.js) code. Use double quotes or JSX conventions for React component props.
- **Trailing commas**: Include trailing commas in multi-line arrays, objects, function parameters, and destructuring patterns. This produces cleaner diffs.
- **Braces**: Always use braces for control flow blocks (`if`, `for`, `while`, etc.), even for single-line bodies. This prevents subtle bugs when adding lines later.
- **Blank lines**: Use a single blank line to separate logical sections within a function. Use two blank lines to separate top-level declarations.
- **End of file**: All files must end with a single newline character.

---

## 2. Import Organization

Imports should be grouped and ordered consistently to make dependencies easy to scan at a glance. Within each file, organize imports in the following order, separated by a blank line between each group:

1. **Node.js built-in modules** (e.g., `path`, `fs`)
2. **Third-party packages** (e.g., `express`, `react`, `axios`)
3. **Internal modules** — absolute or aliased imports within the project
4. **Relative imports** — local files within the same package (e.g., `./App.css`, `../utils/helpers`)

Within each group, sort imports alphabetically where it does not harm readability. Named imports within a single `import` statement should also be sorted alphabetically.

**Example (frontend):**
```js
import React, { useState, useEffect } from 'react';

import axios from 'axios';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import TaskList from './components/TaskList';
import './App.css';
```

---

## 3. Linter Usage

The project uses **ESLint** to enforce code quality and catch common mistakes before they reach review.

- The frontend uses the `react-app` and `react-app/jest` ESLint configurations provided by Create React App.
- The backend should follow `eslint:recommended` rules.
- All linter warnings and errors must be resolved before committing code. Do not disable lint rules with `eslint-disable` comments unless there is a documented, unavoidable reason.
- Run the linter locally before pushing:
  ```bash
  npx eslint packages/frontend/src
  npx eslint packages/backend/src
  ```
- Linting is expected to pass cleanly in CI. A lint failure should block a pull request from merging.

---

## 4. The DRY Principle (Don't Repeat Yourself)

Duplication is the root of many maintenance problems. Before writing new code, check whether the logic already exists elsewhere in the codebase.

- **Extract shared logic** into utility functions or custom React hooks when the same logic appears in two or more places.
- **Reuse MUI components** rather than rebuilding them with inline styles or raw HTML.
- **Avoid duplicating API call logic** — centralise HTTP requests in a dedicated service module or custom hook (e.g., `useTasks`) rather than scattering `fetch`/`axios` calls across components.
- **Configuration values** (API base URLs, port numbers, magic strings) must be defined once — in environment variables or a constants file — and referenced everywhere else.

---

## 5. Naming Conventions

Clear, descriptive names reduce the need for comments and make code self-documenting.

- **Variables and functions**: Use `camelCase` (e.g., `taskList`, `handleSubmit`).
- **React components**: Use `PascalCase` (e.g., `TaskItem`, `AddTaskForm`).
- **Constants**: Use `UPPER_SNAKE_CASE` for true constants that never change (e.g., `MAX_TASK_LENGTH`).
- **Files**: Match the file name to the primary export. Component files use `PascalCase` (e.g., `TaskList.js`). Utility and service files use `camelCase` (e.g., `taskService.js`).
- **Boolean variables**: Prefix with `is`, `has`, or `can` to make the intent clear (e.g., `isLoading`, `hasError`, `canDelete`).
- **Event handlers**: Prefix with `handle` for component-level handlers (e.g., `handleDelete`, `handleFormSubmit`).

---

## 6. Functions and Components

- **Keep functions small and focused.** Each function should do one thing. If a function is doing several distinct things, break it into smaller, well-named helpers.
- **Avoid deeply nested logic.** Prefer early returns and guard clauses over deeply nested `if`/`else` chains.
- **React components** should be functional (not class-based). Use hooks for state and side effects.
- **Prop types or TypeScript** should be used to document the expected shape of component props.
- **Side effects** in React must be confined to `useEffect`. Do not perform data fetching or subscriptions at the top level of a component.

---

## 7. Error Handling

- All `async`/`await` code must be wrapped in `try/catch` blocks with meaningful error messages.
- Backend API routes must return appropriate HTTP status codes (e.g., `400` for bad input, `404` for not found, `500` for server errors).
- Frontend components must handle loading and error states gracefully — never leave the UI in a broken or blank state when a request fails.
- Never swallow errors silently. At minimum, log them with `console.error`.

---

## 8. Comments and Documentation

Good code should be largely self-documenting through clear naming and structure. Comments are for explaining *why*, not *what*.

- Do not comment code that is about to be deleted — delete it.
- Avoid restating what the code obviously does (e.g., `// increment counter` above `count++`).
- Use comments to explain non-obvious decisions, algorithmic choices, or known limitations.
- Public utility functions should include a brief JSDoc comment describing their purpose, parameters, and return value.
