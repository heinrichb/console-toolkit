# 🎨 Console Toolkit

**@heinrichb/console-toolkit** is a powerful, lightweight TypeScript library for creating beautiful, interactive, and structured command-line interfaces. From simple colored text to complex multi-column layouts and live-updating progress bars, this toolkit has everything you need to elevate your CLI experience.

---

## 🚀 Features

- **🌈 Rich Styling:** Support for standard ANSI colors, true-color Hex codes, and text modifiers (bold, dim, italic, etc.).
- **✨ Gradients:** Easy-to-use linear gradients — horizontal (per-character) and vertical (per-line).
- **live-updating:** Built-in support for live-updating displays (perfect for spinners and progress bars).
- **📐 Flexible Layouts:** Powerful grid system for multi-column layouts with automatic padding and alignment.
- **🧩 Components:** Pre-built, customizable components like **Progress Bars** and **Spinners**.
- **🐉 Presets:** Fun ASCII art presets (like dragons!) to spice up your output.
- **TypeScript First:** Fully typed for a great developer experience.

---

## 📦 Installation

This library is designed for use with **Bun** or **Node.js**.

```bash
bun add @heinrichb/console-toolkit
# or
npm install @heinrichb/console-toolkit
```

---

## ⚡ Quick Start

Get up and running in seconds using the builder functions:

```typescript
import { Printer, segment, line, block } from "@heinrichb/console-toolkit";

const printer = new Printer();

printer.print(
	block([
		line([
			segment("Hello, ", { color: "blue", modifiers: ["bold"] }),
			segment("World!", { color: "#10B981", modifiers: ["italic"] })
		])
	])
);
```

---

## 🎮 Try the Demo

See all features in action:

```bash
bun run demo
```

---

## 🎨 Styling

We support a flexible styling system that works with both standard terminal colors and full RGB Hex codes.

### Basic Colors & Modifiers

```typescript
import { PrintStyle } from "@heinrichb/console-toolkit";

const myStyle: PrintStyle = {
	color: "red", // Standard color
	modifiers: ["bold", "underline"]
};
```

### Hex Colors & Gradients

You can use any hex color string. For gradients, simply provide an array of colors!

```typescript
const gradientStyle: PrintStyle = {
	// Creates a gradient from Red to Blue
	color: ["#EF4444", "#3B82F6"]
};
```

### Gradient Interpolation

Use `interpolateGradient` for custom multi-stop color calculations:

```typescript
import { interpolateGradient } from "@heinrichb/console-toolkit";

// Get the color at 50% through a 3-stop gradient
const color = interpolateGradient(["#EF4444", "#F59E0B", "#10B981"], 0.5);
// Returns "#F59E0B" (the middle color)
```

---

## 📐 Layouts

Creating multi-column layouts is a breeze using builder functions.

```typescript
import { printColumns, line, segment } from "@heinrichb/console-toolkit";

printColumns(
	[
		[
			line([segment("Item 1")]),
			line([segment("Item 2")])
		],
		[
			line([segment("Description 1", { color: "gray" })]),
			line([segment("Description 2", { color: "gray" })])
		]
	],
	{ separator: " | " }
);
```

---

## 🧩 Components

### Progress Bars

Create customizable progress bars with ease.

```typescript
import { createProgressBar, Printer, block } from "@heinrichb/console-toolkit";

const printer = new Printer({ live: true });
const bar = createProgressBar({
	progress: 0.75,
	width: 30,
	fillStyle: { color: "green" },
	emptyStyle: { color: "gray" }
});

printer.print(block([bar]));
```

### Spinners

Add activity indicators to your long-running tasks.

```typescript
import { Spinner, SPINNERS, Printer, line, segment, block } from "@heinrichb/console-toolkit";

const spinner = new Spinner({ frames: SPINNERS.dots });
const printer = new Printer({ live: true });

// In your loop:
printer.print(
	block([
		line([segment(spinner.getFrame(), { color: "cyan" })])
	])
);
```

---

## 📚 Detailed Documentation

For more in-depth information on specific parts of the library, check out the detailed guides below:

- **[Core Engine & Styling](https://github.com/heinrichb/console-toolkit/blob/main/src/core/README.md):** Deep dive into `Printer`, `PrintBlock`, `PrintStyle`, and advanced layout techniques.
- **[Components](https://github.com/heinrichb/console-toolkit/blob/main/src/components/README.md):** Full API reference for `ProgressBar`, `Spinner`, and how to build your own components.
- **[Presets](https://github.com/heinrichb/console-toolkit/blob/main/src/presets/README.md):** Explore available ASCII art and other presets.

---

## 📄 License

MIT © Brennen Heinrich
