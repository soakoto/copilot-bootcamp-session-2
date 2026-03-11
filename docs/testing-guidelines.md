# Testing Guidelines

## Overview

This document defines the testing standards and conventions for the To Do App. All new features must include appropriate tests following these guidelines.

---

## 1. Unit Tests

Unit tests verify individual functions and React components in isolation.

- **Framework**: Jest
- **File naming convention**: `*.test.js` or `*.test.ts`
- **Backend location**: `packages/backend/__tests__/`
- **Frontend location**: `packages/frontend/src/__tests__/`
- Name test files to match the file they test (e.g., `app.test.js` for `app.js`)

---

## 2. Integration Tests

Integration tests verify backend API endpoints using real HTTP requests.

- **Framework**: Jest + Supertest
- **File naming convention**: `*.test.js` or `*.test.ts`
- **Location**: `packages/backend/__tests__/integration/`
- Name integration test files based on what they test (e.g., `todos-api.test.js` for TODO API endpoints)

---

## 3. End-to-End (E2E) Tests

E2E tests verify complete UI workflows through browser automation.

- **Framework**: Playwright (required — do not use any other E2E framework)
- **File naming convention**: `*.spec.js` or `*.spec.ts`
- **Location**: `tests/e2e/`
- Name E2E test files based on the user journey they test (e.g., `todo-workflow.spec.js`)
- Use **one browser only** for all Playwright tests
- All E2E tests must use the **Page Object Model (POM)** pattern for maintainability
- Limit to **5–8 tests** covering critical user journeys — focus on happy paths and key edge cases, not exhaustive coverage

---

## 4. Port Configuration

Always use environment variables with sensible defaults for port configuration so CI/CD workflows can dynamically detect ports.

- **Backend**: `const PORT = process.env.PORT || 3030;`
- **Frontend**: React's default port is `3000`, but can be overridden with the `PORT` environment variable

---

## 5. Test Isolation and Independence

- Every test must be fully isolated and independent — tests must not rely on the state or output of other tests.
- Each test must set up its own required data and clean up after itself.
- Setup and teardown hooks (`beforeEach`, `afterEach`, `beforeAll`, `afterAll`) are required wherever shared state exists.
- Tests must pass consistently across multiple runs on a clean environment.

---

## 6. General Principles

- All new features must include appropriate unit, integration, or E2E tests depending on the scope of the change.
- Tests should be maintainable and follow best practices — avoid brittle selectors, magic numbers, and tight coupling to implementation details.
- Prefer testing behavior over implementation (i.e., test what the code does, not how it does it).
- Keep tests readable: use descriptive test names that explain the expected behavior (e.g., `"should display an error when task name is empty"`).
