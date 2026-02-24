# 🎨 Console Toolkit

**@heinrichb/console-toolkit** is a powerful, lightweight TypeScript library for creating beautiful, interactive, and structured command-line interfaces. From simple colored text to complex multi-column layouts and live-updating progress bars, this toolkit has everything you need to elevate your CLI experience.

---

## 🚀 Features

- **🌈 Rich Styling:** Support for standard ANSI colors, true-color Hex codes, and text modifiers (bold, dim, italic, etc.).
- **✨ Gradients:** Easy-to-use linear gradients for text and backgrounds.
- **live-updating:** Built-in support for live-updating displays (perfect for spinners and progress bars).
- **📐 Flexible Layouts:** powerful grid system for multi-column layouts with automatic padding and alignment.
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

Get up and running in seconds:

```typescript
import { Printer } from "@heinrichb/console-toolkit";

const printer = new Printer();

printer.print({
	lines: [
		{
			segments: [
				{ text: "Hello, ", style: { color: "blue", modifiers: ["bold"] } },
				{ text: "World!", style: { color: "#10B981", modifiers: ["italic"] } } // Hex color support!
			]
		}
	]
});
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

---

## 📐 Layouts

Creating multi-column layouts is a breeze.

```typescript
import { printColumns } from "@heinrichb/console-toolkit";

printColumns(
	[
		[
			// Column 1
			{ segments: [{ text: "Item 1" }] },
			{ segments: [{ text: "Item 2" }] }
		],
		[
			// Column 2
			{ segments: [{ text: "Description 1", style: { color: "gray" } }] },
			{ segments: [{ text: "Description 2", style: { color: "gray" } }] }
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
import { createProgressBar, Printer } from "@heinrichb/console-toolkit";

const printer = new Printer({ live: true });
const bar = createProgressBar({
	progress: 0.75,
	width: 30,
	fillStyle: { color: "green" },
	emptyStyle: { color: "gray" }
});

printer.print({ lines: [bar] });
```

### Spinners

Add activity indicators to your long-running tasks.

```typescript
import { Spinner, SPINNERS, Printer } from "@heinrichb/console-toolkit";

const spinner = new Spinner({ frames: SPINNERS.dots });
const printer = new Printer({ live: true });

// In your loop:
printer.print({
	lines: [
		{
			segments: [{ text: spinner.getFrame(), style: { color: "cyan" } }]
		}
	]
});
```

---

## 📚 Detailed Documentation

For more in-depth information on specific parts of the library, check out the detailed guides below:

- **[Core Engine & Styling](src/core/README.md):** Deep dive into `Printer`, `PrintBlock`, `PrintStyle`, and advanced layout techniques.
- **[Components](src/components/README.md):** Full API reference for `ProgressBar`, `Spinner`, and how to build your own components.
- **[Presets](src/presets/README.md):** Explore available ASCII art and other presets.

---

## 📄 License

MIT © Brennen Heinrich
