# 🧩 UI Components

This directory contains high-level UI components built on the core engine. Each component returns `PrintLine` or `PrintLine[]` — composable with `block()` and `Printer`.

---

## 📊 Progress Bars

The `createProgressBar` function generates a single `PrintLine` representing a progress bar. Use it with a live-mode `Printer` for animations.

### Basic Usage

```typescript
import { createProgressBar, Printer, block } from "@heinrichb/console-toolkit";

const printer = new Printer({ live: true });

// Update progress over time
let progress = 0;
const interval = setInterval(() => {
	progress += 0.1;
	const bar = createProgressBar({ progress });
	printer.print(block([bar]));

	if (progress >= 1) clearInterval(interval);
}, 100);
```

### Configuration Options (`ProgressBarOptions`)

| Option             | Type                           | Default        | Description                                                  |
| :----------------- | :----------------------------- | :------------- | :----------------------------------------------------------- |
| `progress`         | `number`                       | **Required**   | Progress value between `0.0` and `1.0`.                      |
| `width`            | `number`                       | `20`           | Width of the bar (excluding brackets and percentage).        |
| `style`            | `PrintStyle`                   | `undefined`    | Base style applied to the entire component.                  |
| `bracketStyle`     | `PrintStyle`                   | `style`        | Style for both brackets (start and end characters).          |
| `startStyle`       | `PrintStyle`                   | `bracketStyle` | Style for the start bracket. Overrides `bracketStyle`.       |
| `endStyle`         | `PrintStyle`                   | `bracketStyle` | Style for the end bracket. Overrides `bracketStyle`.         |
| `barStyle`         | `PrintStyle`                   | `style`        | Style for both the filled and empty parts.                   |
| `fillStyle`        | `PrintStyle`                   | `barStyle`     | Style for the filled portion.                                |
| `completeStyle`    | `PrintStyle`                   | `fillStyle`    | Style for the filled portion when progress reaches 100%.     |
| `completeChar`     | `string`                       | `fillChar`     | Character for the filled portion when progress reaches 100%. |
| `emptyStyle`       | `PrintStyle`                   | `barStyle`     | Style for the empty portion.                                 |
| `percentageStyle`  | `PrintStyle`                   | `style`        | Style for the percentage text.                               |
| `startChar`        | `string`                       | `[`            | Character for the opening bracket.                           |
| `endChar`          | `string`                       | `]`            | Character for the closing bracket.                           |
| `fillChar`         | `string`                       | `█`            | Character for the filled portion.                            |
| `emptyChar`        | `string`                       | `░`            | Character for the empty portion.                             |
| `showPercentage`   | `boolean`                      | `true`         | Whether to display the percentage text.                      |
| `formatPercentage` | `(progress: number) => string` | built-in       | Custom formatter for the percentage text.                    |

### Style Cascade

The style resolution follows a cascade:

- `style` is the base default for everything
- `bracketStyle` overrides `style` for brackets; `startStyle`/`endStyle` override `bracketStyle`
- `barStyle` overrides `style` for the bar; `fillStyle`/`emptyStyle` override `barStyle`
- `completeStyle` overrides `fillStyle` when progress >= 1.0
- `percentageStyle` overrides `style` for the percentage text

### Gradient Example

Apply gradients to any style property:

```typescript
import { createProgressBar } from "@heinrichb/console-toolkit";

const bar = createProgressBar({
	progress: 0.65,
	width: 40,
	fillStyle: { color: ["#3B82F6", "#EC4899"] }, // Horizontal gradient fill
	emptyStyle: { color: "#4B5563" }
});
```

### Completion State

Use `completeStyle` and `completeChar` for a distinct visual state at 100%:

```typescript
import { createProgressBar } from "@heinrichb/console-toolkit";

const bar = createProgressBar({
	progress: 1.0,
	completeChar: "✔",
	completeStyle: { color: "green" }
});
// Renders: [✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔] 100%
```

---

## 🌀 Spinners

The `Spinner` class calculates the current frame based on elapsed time since creation. Designed for use in a render loop with a live-mode `Printer`.

### Basic Usage

```typescript
import { Spinner, SPINNERS, Printer, line, segment, block } from "@heinrichb/console-toolkit";

const spinner = new Spinner({
	frames: SPINNERS.dots,
	interval: 80 // Time between frames in ms (default: 80)
});

const printer = new Printer({ live: true });

// Animation loop
const start = Date.now();
while (Date.now() - start < 3000) {
	const frame = spinner.getFrame();
	printer.print(block([line([segment(frame, { color: "cyan" }), segment(" Loading...")])]));
	await new Promise((r) => setTimeout(r, 80));
}
```

### Built-in Presets (`SPINNERS`)

| Preset            | Frames              |
| :---------------- | :------------------ |
| `SPINNERS.dots`   | ⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏ |
| `SPINNERS.lines`  | - \ \| /            |
| `SPINNERS.arrows` | ← ↖ ↑ ↗ → ↘ ↓ ↙     |
| `SPINNERS.circle` | ◐ ◓ ◑ ◒             |
| `SPINNERS.square` | ▖ ▘ ▝ ▗             |

### Custom Spinners

Provide any array of strings as frames:

```typescript
import { Spinner } from "@heinrichb/console-toolkit";

const mySpinner = new Spinner({
	frames: ["( ●    )", "(  ●   )", "(   ●  )", "(    ● )", "(     ●)"],
	interval: 100
});
```

### Spinner API

| Property / Method | Type               | Description                                      |
| :---------------- | :----------------- | :----------------------------------------------- |
| `constructor`     | `(SpinnerOptions)` | Creates a spinner with frames and interval.      |
| `getFrame()`      | `string`           | Returns the current frame based on elapsed time. |

---

## 📊 Tables

The `createTable` function generates `PrintLine[]` representing a styled table with borders and auto-sized columns.

### Basic Usage

```typescript
import { createTable, Printer, block } from "@heinrichb/console-toolkit";

const printer = new Printer();

const tableLines = createTable({
	headers: ["Name", "Role", "Status"],
	rows: [
		["Alice", "Engineer", "Active"],
		["Bob", "Designer", "Away"],
		["Carol", "Manager", "Active"]
	],
	headerStyle: { color: "cyan", modifiers: ["bold"] },
	style: { color: "white" },
	borderStyle: { color: "#6B7280" },
	border: "rounded"
});

printer.print(block(tableLines));
```

Output:

```
╭───────┬──────────┬────────╮
│ Name  │ Role     │ Status │
├───────┼──────────┼────────┤
│ Alice │ Engineer │ Active │
│ Bob   │ Designer │ Away   │
│ Carol │ Manager  │ Active │
╰───────┴──────────┴────────╯
```

### Configuration Options (`TableOptions`)

| Option         | Type          | Default      | Description                                                                                   |
| :------------- | :------------ | :----------- | :-------------------------------------------------------------------------------------------- |
| `rows`         | `string[][]`  | **Required** | Row data. Each row is an array of cell strings.                                               |
| `headers`      | `string[]`    | `undefined`  | Column headers. If omitted, no header row is rendered.                                        |
| `style`        | `PrintStyle`  | `undefined`  | Base style for all table cell content.                                                        |
| `headerStyle`  | `PrintStyle`  | `undefined`  | Style override for header cells.                                                              |
| `borderStyle`  | `PrintStyle`  | `undefined`  | Style for border characters.                                                                  |
| `border`       | `BorderStyle` | `"single"`   | Border drawing style: `"single"`, `"double"`, `"rounded"`, or `"none"`.                       |
| `columnWidths` | `number[]`    | auto         | Fixed column widths (content area, excluding padding). Auto-computed from content if omitted. |
| `cellPadding`  | `number`      | `1`          | Padding inside each cell (spaces on each side).                                               |

### Border Styles

**`"single"`** (default):

```
┌───────┬───────┐
│ Cell  │ Cell  │
├───────┼───────┤
│ Cell  │ Cell  │
└───────┴───────┘
```

**`"double"`**:

```
╔═══════╦═══════╗
║ Cell  ║ Cell  ║
╠═══════╬═══════╣
║ Cell  ║ Cell  ║
╚═══════╩═══════╝
```

**`"rounded"`**:

```
╭───────┬───────╮
│ Cell  │ Cell  │
├───────┼───────┤
│ Cell  │ Cell  │
╰───────┴───────╯
```

**`"none"`** — no borders, cells separated by padding only.

### Table Without Headers

Omit `headers` for a data-only table:

```typescript
import { createTable, Printer, block } from "@heinrichb/console-toolkit";

const printer = new Printer();

const tableLines = createTable({
	rows: [
		["Alice", "Engineer"],
		["Bob", "Designer"]
	],
	style: { color: "white" },
	border: "single"
});

printer.print(block(tableLines));
```

### Styled Table Example

```typescript
import { createTable, Printer, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

const tableLines = createTable({
	headers: ["Feature", "Status"],
	rows: [
		["Colors", "Stable"],
		["Gradients", "Stable"],
		["Tables", "New"]
	],
	headerStyle: { color: "cyan", modifiers: ["bold"] },
	style: { color: "white" },
	borderStyle: { color: "#6B7280" },
	border: "rounded",
	cellPadding: 2
});

printer.print(block(tableLines));
```
