# 🎨 Console Toolkit

**@heinrichb/console-toolkit** — zero-dependency TypeScript library for beautiful console output. True-color gradients, background colors, column layouts, tables, progress bars, spinners, and ASCII art — all fully typed, all composable.

---

## 🚀 Features

- **🌈 True-Color Styling:** Standard ANSI colors, hex RGB codes, background colors, and text modifiers (bold, dim, italic, etc.).
- **✨ Gradients:** Horizontal (per-character) and vertical (per-line) gradients with multi-stop support. Includes preset palettes.
- **📊 Tables:** Styled tables with automatic column sizing, four border styles, and per-section styling.
- **📈 Live Updates:** Built-in live mode for smooth animations — spinners, progress bars, dashboards.
- **📐 Column Layouts:** Multi-column grid system with automatic padding, fixed widths, and custom separators.
- **🧩 Components:** Progress bars (17 options) and spinners (5 presets) ready to use.
- **🐉 ASCII Presets:** Dragon art with customizable multi-stop gradient colors.
- **🔧 Utilities:** `renderToString` for capturing output and `stripAnsi` for plain text extraction.
- **TypeScript First:** Fully typed, zero dependencies, works with Bun and Node.js 18+.

---

## 📦 Installation

```bash
bun add @heinrichb/console-toolkit
# or
npm install @heinrichb/console-toolkit
```

---

## 🎮 Try the Demo

See every feature in action:

```bash
git clone https://github.com/heinrichb/console-toolkit.git
cd console-toolkit && bun install
bun run demo
```

---

## ⚡ Quick Start

Build output with three functions: `segment` (text + style), `line` (row of segments), `block` (group of lines).

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

## 🎨 Styling

Every style accepts `color`, `bgColor`, and `modifiers`. Colors can be standard names or hex strings. Gradients are just arrays of colors.

### Colors and Modifiers

```typescript
import { Printer, segment, line, block } from "@heinrichb/console-toolkit";

const printer = new Printer();

printer.print(
	block([
		line([segment("Bold red text", { color: "red", modifiers: ["bold"] })]),
		line([segment("Hex color", { color: "#FF6B35" })]),
		line([segment("White on blue", { color: "white", bgColor: "#3B82F6" })]),
		line([segment("Bold on purple", { color: "white", bgColor: "#7C3AED", modifiers: ["bold"] })])
	])
);
```

**Standard colors:** `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, `grey`

**Modifiers:** `bold`, `dim`, `italic`, `underline`, `inverse`, `hidden`, `strikethrough`

### Background Colors

Background colors support everything foreground colors do — solid colors, hex codes, and gradient arrays:

```typescript
import { Printer, segment, line, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

printer.print(block([line([segment("  Ocean background gradient  ", { color: "white", bgColor: GRADIENTS.ocean })])]));
```

---

## ✨ Gradients

### Horizontal Gradients

Apply a color array to a line or segment for per-character interpolation:

```typescript
import { Printer, segment, line, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

// Line-level gradient spans all segments
printer.print(block([line([segment("Rainbow across the entire line")], { color: GRADIENTS.rainbow })]));

// Segment-level gradient affects only that segment
printer.print(block([line([segment("Normal text "), segment("gradient here", { color: GRADIENTS.sunset })])]));
```

### Vertical Gradients

Apply a color array to a block for per-line interpolation:

```typescript
import { Printer, segment, line, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

const lines = Array.from({ length: 6 }, (_, i) => line([segment(`  Line ${i + 1}  `)]));
printer.print(block(lines, { color: GRADIENTS.fire }));
```

### Gradient Presets (`GRADIENTS`)

Ready-made color arrays you can plug into any `color` or `bgColor` property:

| Preset       | Colors                                  |
| :----------- | :-------------------------------------- |
| `rainbow`    | Red, amber, emerald, cyan, blue, violet |
| `ocean`      | Deep navy, teal, cyan, light cyan       |
| `fire`       | Dark red, red, amber, yellow            |
| `sunset`     | Violet, pink, orange, amber             |
| `forest`     | Dark emerald, emerald, lime, light lime |
| `monochrome` | Black, gray, white                      |

### Custom Gradient Interpolation

Use `interpolateGradient` to compute a color at any point in a gradient:

```typescript
import { interpolateGradient } from "@heinrichb/console-toolkit";

const color = interpolateGradient(["#EF4444", "#F59E0B", "#10B981"], 0.5);
// Returns the hex color at 50% through the gradient
```

---

## 📐 Layouts

### `printColumns`

Print multiple columns side-by-side with automatic padding:

```typescript
import { printColumns, line, segment } from "@heinrichb/console-toolkit";

const labels = [
	line([segment("Name:", { color: "#A78BFA" })]),
	line([segment("Version:", { color: "#A78BFA" })]),
	line([segment("Status:", { color: "#A78BFA" })])
];
const values = [
	line([segment("console-toolkit", { color: "#60A5FA" })]),
	line([segment("1.0.10", { color: "#34D399" })]),
	line([segment("Operational", { color: "#FBBF24" })])
];

printColumns([labels, values], {
	separator: "  =>  ",
	widths: [10, 20]
});
```

### `mergeColumns`

Returns `PrintLine[]` instead of printing — useful for composing into larger layouts:

```typescript
import { mergeColumns, Printer, block, line, segment } from "@heinrichb/console-toolkit";

const merged = mergeColumns([[line([segment("Left")])], [line([segment("Right")])]], " | ");

new Printer().print(block(merged));
```

---

## 🧩 Components

### Progress Bars

Fully customizable progress bars with 17 configuration options:

```typescript
import { createProgressBar, Printer, block } from "@heinrichb/console-toolkit";

const printer = new Printer({ live: true });

for (let i = 0; i <= 100; i += 2) {
	const bar = createProgressBar({
		progress: i / 100,
		width: 40,
		fillStyle: { color: ["#3B82F6", "#EC4899"] },
		emptyStyle: { color: "#4B5563" }
	});
	printer.print(block([bar]));
	await new Promise((r) => setTimeout(r, 25));
}
```

### Spinners

Time-based spinners with 5 built-in presets:

```typescript
import { Spinner, SPINNERS, Printer, line, segment, block } from "@heinrichb/console-toolkit";

const spinner = new Spinner({ frames: SPINNERS.dots });
const printer = new Printer({ live: true });

// In your render loop:
printer.print(block([line([segment(spinner.getFrame(), { color: "cyan" }), segment(" Loading...")])]));
```

### Tables

Styled tables with automatic column sizing and four border styles (`single`, `double`, `rounded`, `none`):

```typescript
import { createTable, Printer, block } from "@heinrichb/console-toolkit";

const printer = new Printer();

const tableLines = createTable({
	headers: ["Feature", "Status", "Since"],
	rows: [
		["Colors & Hex", "Stable", "v1.0"],
		["Gradients", "Stable", "v1.0"],
		["Background Colors", "New", "v1.1"],
		["Tables", "New", "v1.1"]
	],
	headerStyle: { color: "cyan", modifiers: ["bold"] },
	style: { color: "white" },
	borderStyle: { color: "#6B7280" },
	border: "rounded"
});

printer.print(block(tableLines));
```

---

## 🐉 Presets

### Dragon ASCII Art

Vertical gradient dragon art — pass a `Color[]` array for the gradient stops:

```typescript
import { getDragon, Printer, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

printer.print(block(getDragon())); // Default: red -> amber
printer.print(block(getDragon(["#3B82F6", "#06B6D4"]))); // Two-color
printer.print(block(getDragon(GRADIENTS.fire))); // Multi-stop preset
```

---

## 🔧 Utilities

### `renderToString`

Capture styled output as a string instead of writing to stdout:

```typescript
import { Printer, segment, line, block } from "@heinrichb/console-toolkit";

const printer = new Printer();
const output = printer.renderToString(block([line([segment("Hello!", { color: "green", modifiers: ["bold"] })])]));
// output contains the full ANSI-styled string
```

### `stripAnsi`

Remove all ANSI escape sequences from a string:

```typescript
import { stripAnsi } from "@heinrichb/console-toolkit";

const plain = stripAnsi("\x1b[38;2;255;0;0mRed text\x1b[0m");
// Returns "Red text"
```

---

## 📚 Detailed Documentation

- **[Core Engine & Styling](https://github.com/heinrichb/console-toolkit/blob/main/src/core/README.md):** Printer class, data structures, styling system, gradients, layout utilities.
- **[Components](https://github.com/heinrichb/console-toolkit/blob/main/src/components/README.md):** Full API reference for progress bars, spinners, and tables.
- **[Presets](https://github.com/heinrichb/console-toolkit/blob/main/src/presets/README.md):** Dragon art, gradient presets, and usage examples.

---

## 📄 License

MIT © Brennen Heinrich
