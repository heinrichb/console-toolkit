# 🧩 UI Components

This directory contains high-level UI components built on top of the core engine. These components are designed to be interactive and easy to integrate into your CLI applications.

---

## 📊 Progress Bars

The `createProgressBar` function generates a `PrintLine` that represents a progress bar. You can print this line repeatedly using a `Printer` in `live` mode to animate the progress.

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
| `progress`         | `number`                       | **Required**   | The progress value between `0.0` and `1.0`.                  |
| `width`            | `number`                       | `20`           | The width of the bar (excluding brackets/percentage).        |
| `style`            | `PrintStyle`                   | `undefined`    | Base style applied to the entire component.                  |
| `bracketStyle`     | `PrintStyle`                   | `style`        | Style for both brackets (start and end characters).          |
| `startStyle`       | `PrintStyle`                   | `bracketStyle` | Style for the start bracket. Overrides `bracketStyle`.       |
| `endStyle`         | `PrintStyle`                   | `bracketStyle` | Style for the end bracket. Overrides `bracketStyle`.         |
| `barStyle`         | `PrintStyle`                   | `style`        | Style for both the filled and empty parts.                   |
| `fillStyle`        | `PrintStyle`                   | `barStyle`     | Style for the filled portion (e.g., `{ color: "green" }`).   |
| `completeStyle`    | `PrintStyle`                   | `fillStyle`    | Style for the filled portion when progress reaches 100%.     |
| `emptyStyle`       | `PrintStyle`                   | `barStyle`     | Style for the empty portion (e.g., `{ color: "gray" }`).     |
| `percentageStyle`  | `PrintStyle`                   | `style`        | Style for the percentage text.                               |
| `startChar`        | `string`                       | `[`            | Character for the opening bracket.                           |
| `endChar`          | `string`                       | `]`            | Character for the closing bracket.                           |
| `fillChar`         | `string`                       | `█`            | Character for the filled portion.                            |
| `completeChar`     | `string`                       | `fillChar`     | Character for the filled portion when progress reaches 100%. |
| `emptyChar`        | `string`                       | `░`            | Character for the empty portion.                             |
| `showPercentage`   | `boolean`                      | `true`         | Whether to display the percentage text.                      |
| `formatPercentage` | `(progress: number) => string` | built-in       | Custom formatter for the percentage text.                    |

### Gradient Example

You can even apply gradients to your progress bars!

```typescript
const bar = createProgressBar({
	progress: 0.5,
	fillStyle: { color: ["#3B82F6", "#EC4899"] } // Horizontal gradient
});
```

### Completion State

Use `completeStyle` and `completeChar` for a distinct visual state when the bar reaches 100%:

```typescript
const bar = createProgressBar({
	progress: 1.0,
	completeChar: "✔",
	completeStyle: { color: "green" }
});
// Renders: [✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔] 100%
```

---

## 🌀 Spinners

Spinners are essential for indicating activity during long-running processes. Our `Spinner` class is stateful, meaning it calculates the correct frame based on the elapsed time since it was created.

### Basic Usage

```typescript
import { Spinner, SPINNERS, Printer, line, segment, block } from "@heinrichb/console-toolkit";

const spinner = new Spinner({
	frames: SPINNERS.dots,
	interval: 80 // Time between frames in ms
});

const printer = new Printer({ live: true });

// Animation Loop
while (running) {
	const frame = spinner.getFrame();
	printer.print(block([line([segment(frame, { color: "cyan" })])]));
	await new Promise((r) => setTimeout(r, 80));
}
```

### Built-in Presets (`SPINNERS`)

We include several popular spinner styles out of the box:

- `SPINNERS.dots`: ⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏
- `SPINNERS.lines`: - \ | /
- `SPINNERS.arrows`: ← ↖ ↑ ↗ → ↘ ↓ ↙
- `SPINNERS.circle`: ◐ ◓ ◑ ◒
- `SPINNERS.square`: ▖ ▘ ▝ ▗

### Custom Spinners

You can easily create your own spinner by providing an array of strings as frames.

```typescript
const mySpinner = new Spinner({
	frames: ["( ●    )", "(  ●   )", "(   ●  )", "(    ● )", "(     ●)"],
	interval: 100
});
```
