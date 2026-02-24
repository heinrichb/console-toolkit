# Agent Instructions and Coding Standards

This file contains the core principles, workflows, and standards for working on the **@heinrichb/console-toolkit** project. Adhere to these instructions to ensure consistency, quality, and maintainability.

## 1. Core Principles
* **Deep Planning Mode:** Before writing code, deeply analyze the request. Ask clarifying questions until you have absolute certainty. Use `set_plan` to outline your approach and include a "Pre-commit" step.
* **Verify Everything:** Never assume a change worked. Use `ls`, `read_file`, or run tests to verify every file creation, modification, or deletion.
* **Edit Source, Not Artifacts:** Always trace code back to its source (e.g., `src/`) and edit there. Do not modify build artifacts (e.g., `dist/`).
* **Explain the 'Why':** When documenting code, focus on the *reasoning* behind decisions, trade-offs, and future goals, not just what the code does.

## 2. Development Standards

### Code Quality
* **Type Safety:** Do not use `any`. Use proper TypeScript interfaces and types.
* **Linting & Formatting:** Do not disable linter rules without a very strong, documented reason. Use `bun run lint` and `bun run format:check` to check for issues.
* **Runtime Independence:** This library is intended for Node.js and Bun environments. Ensure standard console tools (`process.stdout.write`, `console.log`) are utilized safely and efficiently.

### Documentation
* **JSDoc:** Use comprehensive JSDoc style comments for all exported functions, classes, and types. As a utility library, developer-facing documentation is critical.
* **Human-Readable:** Write internal comments for future developers. Be helpful, clear, and concise.

### Project Specifics
* **Tech Debt:** Track major upgrades, missing coverage, or long-term refactors in `TODO.md`.
* **Demo Script:** The `src/demo.ts` script must demonstrate *all* capabilities of the library and be kept up-to-date with every feature addition or change.

## 3. Testing & Verification

### Test Driven Development (TDD)
* **Mandate:** TDD is encouraged for all new utilities, layouts, and logic blocks.
* **Workflow (Red-Green-Refactor):**
    1.  **Red:** Create the test file first. Write a failing test that describes the expected behavior.
    2.  **Green:** Write the minimum amount of code required to make the test pass.
    3.  **Refactor:** Clean up the code while ensuring tests still pass.

### Test Requirements
* **100% Coverage:** This project strictly enforces a 100% test coverage threshold. Every exported function, branch, and error state must be tested.
* **Isolation & Spies:** When testing console output, intercept `process.stdout.write` and `console.log` using `spyOn` from `bun:test` to prevent terminal noise during testing and verify correct rendering.

### Tools & Configuration
* **Runner:** Use Bun's native test runner (`bun test`).
* **Coverage:** Run `bun run test:coverage` to verify threshold compliance against the configuration in `package.json`.

### Pre-Commit Checklist
Before submitting *any* changes:
1.  **Code Review:** Verify comments meet standards (useful, human-readable, 'why' focused, proper JSDoc). Remove temporary debug comments.
2.  **Update TODOs:**
    * **Tidy Up:** Remove completed tasks from `TODO.md`.
    * **Future Work:** Add any new ideas, tech debt, or improvements identified during the task to `TODO.md`.
3.  **Verification:** Run the full quality gate:
    ```bash
    bun run format:write
    bun run lint
    bun run build
    bun run test:coverage
    ```
    **Do not submit code unless 100% coverage is maintained and all checks pass.**

## 4. Task Management Standards (TODO.md)

This section defines how to structure `TODO.md` to ensure efficient hand-offs between agent sessions.

### Structure
* **Self-Contained Stories:** Each item should be a "story" small enough to be completed in one session but detailed enough to be a prompt.
* **Prompt-Ready:** Write descriptions that can be copy-pasted as the *first prompt* for a new agent session.
* **Format:**
    ```markdown
    ## [Feature Name]
    ### Story: [Actionable Title]
    **Description:**
    [Detailed prompt explaining what needs to be done, context, and expected outcome.]

    **Tasks:**
    - [ ] Task 1
    - [ ] Task 2

    **Difficulty:** Low/Medium/High
    ```

## 5. Documentation Maintenance
* **Dynamic Document:** This file (`AGENTS.md`) is the source of truth for our standards. Keep it minimal but impactful.
* **Updates:** If you receive a new instruction or clarify an ambiguity that would help a future agent, update this file immediately.
* **DRY:** Do not repeat information found here in your chat context if it's already documented. Do not clutter this file with redundant info.
