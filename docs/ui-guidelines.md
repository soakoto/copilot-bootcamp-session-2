# UI Guidelines

## Overview

This document defines the core UI guidelines for the To Do App. All frontend development must follow these standards to ensure a consistent, accessible, and visually coherent user experience.

---

## 1. Component Library: Material UI (MUI)

All UI components must be built using [Material UI (MUI)](https://mui.com/) — React components that implement Google's Material Design specification.

### Requirements

- Use MUI components as the foundation for all UI elements (buttons, inputs, dialogs, lists, icons, etc.).
- Do not introduce additional third-party component libraries alongside MUI.
- Custom styling must be applied via MUI's `sx` prop or the `styled()` utility — avoid inline `style` attributes.
- Use MUI's `ThemeProvider` and a custom theme to enforce consistent colors, typography, and spacing across the app.

### Key Components to Use

| UI Element         | MUI Component                         |
|--------------------|----------------------------------------|
| Task list          | `List`, `ListItem`, `ListItemText`    |
| Add/Edit task form | `TextField`, `Button`, `DatePicker`   |
| Task completion    | `Checkbox`                            |
| Delete action      | `IconButton` with `DeleteIcon`        |
| Dialogs/confirms   | `Dialog`, `DialogTitle`, `DialogActions` |
| Page layout        | `Container`, `Box`, `Stack`           |
| Notifications      | `Snackbar`, `Alert`                   |

---

## 2. Color Palette

The app uses a clean, neutral palette with a single primary accent color to draw attention to key actions.

### Primary Palette

| Role              | Color Name       | Hex       |
|-------------------|------------------|-----------|
| Primary           | Indigo           | `#3F51B5` |
| Primary Dark      | Indigo Dark      | `#303F9F` |
| Primary Light     | Indigo Light     | `#C5CAE9` |
| Secondary         | Amber            | `#FFC107` |
| Background        | Off-White        | `#F5F5F5` |
| Surface (cards)   | White            | `#FFFFFF` |
| Error             | Red              | `#D32F2F` |
| Text Primary      | Near-Black       | `#212121` |
| Text Secondary    | Medium Gray      | `#757575` |
| Divider           | Light Gray       | `#BDBDBD` |

### Status Colors

| Status      | Color     | Hex       |
|-------------|-----------|-----------|
| Complete    | Green     | `#388E3C` |
| Overdue     | Red       | `#D32F2F` |
| Due Soon    | Amber     | `#F57C00` |
| No due date | Gray      | `#9E9E9E` |

---

## 3. Button Styles

All buttons must use MUI's `Button` or `IconButton` components with the following conventions.

### Primary Action Button (e.g., "Add Task", "Save")

- Variant: `contained`
- Color: `primary`
- Use for the single most important action on a page or form.

```jsx
<Button variant="contained" color="primary">Add Task</Button>
```

### Secondary Action Button (e.g., "Cancel", "Clear")

- Variant: `outlined`
- Color: `primary`
- Use for secondary or reversible actions.

```jsx
<Button variant="outlined" color="primary">Cancel</Button>
```

### Destructive Action Button (e.g., "Delete")

- Use an `IconButton` with MUI's `DeleteIcon`.
- Color: `error`
- Always pair with a confirmation dialog before executing destructive actions.

```jsx
<IconButton color="error" aria-label="delete task">
  <DeleteIcon />
</IconButton>
```

### Button Sizing

- Use `size="medium"` (default) for standard actions.
- Use `size="small"` inside list items or compact areas.

---

## 4. Accessibility Requirements

The app must meet **WCAG 2.1 Level AA** accessibility standards.

### Color Contrast

- All text must have a contrast ratio of at least **4.5:1** against its background.
- Large text (18pt / 14pt bold) must have a contrast ratio of at least **3:1**.
- Do not rely on color alone to convey meaning (e.g., always pair color with an icon or label for status indicators).

### Keyboard Navigation

- All interactive elements (buttons, inputs, checkboxes) must be fully operable via keyboard.
- Focus order must follow a logical, top-to-bottom, left-to-right sequence.
- Use MUI's built-in focus management; do not suppress the default focus outline.

### ARIA and Semantic HTML

- All `IconButton` elements must include a descriptive `aria-label` (e.g., `aria-label="delete task"`).
- Form inputs must be associated with a visible `<label>` or an `aria-label`.
- Use semantic HTML elements where possible (`<main>`, `<header>`, `<nav>`, `<ul>`, `<li>`).
- Dynamic content changes (e.g., adding or deleting a task) must announce updates to screen readers using `aria-live` regions or MUI's `Snackbar`.

### Forms

- Display inline validation error messages using MUI's `helperText` and `error` props on `TextField`.
- Error messages must be programmatically associated with their input field.

### Images and Icons

- Decorative icons must have `aria-hidden="true"`.
- Meaningful icons must have an accessible label via `aria-label` or a visually hidden text alternative.
