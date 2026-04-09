## Background Color Support
### Story: Add `bgColor` to PrintStyle
**Description:**
Add a `bgColor` property to `PrintStyle` that works identically to `color` but applies ANSI background color codes (48;2;R;G;B). Support solid colors, hex colors, and gradient arrays. Update `resolveStyle` to emit both foreground and background ANSI sequences. Ensure gradient backgrounds work for both horizontal and vertical directions.

**Tasks:**
- [ ] Add `bgColor` to `PrintStyle` interface in `types.ts`
- [ ] Update `resolveStyle` in `style.ts` to handle background colors
- [ ] Add background gradient support in `printer.ts` render path
- [ ] Add tests for all background color scenarios
- [ ] Update demo with background color examples
- [ ] Update documentation

**Difficulty:** Medium

---

## Render to String
### Story: Add `Printer.renderToString()` method
**Description:**
Add a method to `Printer` that returns the rendered output as a string instead of writing to stdout. This enables testing rendered output directly, capturing output for logging, and composing output before displaying. The method should share the same rendering logic as `print()` without the stdout write.

**Tasks:**
- [ ] Add `renderToString(data?: PrintBlock): string` to `Printer`
- [ ] Extract shared rendering logic from `print()`
- [ ] Add tests verifying string output matches stdout output
- [ ] Update documentation

**Difficulty:** Low

---

## Named Gradient Presets
### Story: Create reusable gradient color arrays
**Description:**
Export a `GRADIENTS` object with commonly used color arrays (rainbow, ocean, fire, sunset, etc.) that users can plug into any `color` array property. Similar to how `SPINNERS` provides preset frame arrays.

**Tasks:**
- [ ] Create `src/presets/gradients.ts` with preset arrays
- [ ] Export from `index.ts`
- [ ] Add tests for preset definitions
- [ ] Add demo section showing gradient presets
- [ ] Update documentation

**Difficulty:** Low

---

## Table Component
### Story: Build a table renderer with borders and auto-sizing
**Description:**
Create a `createTable` function that takes headers and rows, automatically computes column widths, and renders with configurable borders (box-drawing characters). Should support style cascading for headers, rows, and cells. Build on top of `mergeColumns` and `padLine` utilities.

**Tasks:**
- [ ] Design `TableOptions` interface (headers, rows, border style, column widths)
- [ ] Implement `createTable` returning `PrintLine[]`
- [ ] Add box-drawing border characters (single, double, rounded)
- [ ] Add tests for various table configurations
- [ ] Add demo section
- [ ] Add documentation

**Difficulty:** High

---

## ANSI Strip Utility
### Story: Add utility to strip ANSI codes from rendered output
**Description:**
Add a `stripAnsi(text: string): string` utility that removes all ANSI escape sequences from a string. Useful for calculating true display widths, logging plain text, and testing rendered output content.

**Tasks:**
- [ ] Implement `stripAnsi` in `utils.ts`
- [ ] Export from `index.ts`
- [ ] Add tests with various ANSI sequences
- [ ] Update documentation

**Difficulty:** Low

---

## Node.js Compatibility Testing
### Story: Verify and document Node.js runtime compatibility
**Description:**
The library is developed with Bun but should work in Node.js 18+. Set up a Node.js test runner in CI to verify compatibility. Document any Bun-specific behavior and ensure the published package works with both runtimes.

**Tasks:**
- [ ] Add Node.js test job to CI pipeline
- [ ] Identify and fix any Bun-specific code paths
- [ ] Document runtime compatibility in README
- [ ] Test with Node.js 18, 20, and 22

**Difficulty:** Medium

---

## Multi-Stop Dragon Gradient
### Story: Extend `getDragon` to accept Color arrays
**Description:**
Currently `getDragon` accepts two colors (start/end). Extend it to accept a `Color[]` array for multi-stop vertical gradients, leveraging `interpolateGradient`. Maintain backwards compatibility with the two-argument form.

**Tasks:**
- [ ] Update `getDragon` signature to accept `Color | Color[]` for gradient
- [ ] Use `interpolateGradient` for multi-stop support
- [ ] Add tests for multi-stop dragon gradients
- [ ] Update demo and documentation

**Difficulty:** Low
