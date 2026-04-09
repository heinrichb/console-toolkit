# ⚙️ Core Engine & Styling

This directory contains the foundational logic for the `@heinrichb/console-toolkit`. It handles the low-level rendering, ANSI escape sequence generation, and the layout system.

---

## 🖨️ The Printer Class

The `Printer` class is the heart of the library. It manages the output stream (stdout) and handles the "live" update mechanism used for animations like spinners and progress bars.

### Basic Usage

```typescript
import { Printer, segment, line, block } from "@heinrichb/console-toolkit";

const printer = new Printer();
printer.print(block([line([segment("Hello from Core!")])]));
```

### Live Mode

When initialized with `{ live: true }`, the printer keeps track of how many lines it has written. On subsequent calls to `print()`, it will move the cursor up and clear those lines before writing the new content. This creates a smooth animation effect.

```typescript
const livePrinter = new Printer({ live: true });

// Frame 1
livePrinter.print(block([line([segment("Loading...")])]));

// Frame 2 (Overwrites Frame 1)
livePrinter.print(block([line([segment("Done!")])]));
```

---

## 🏗️ Data Structures

To give you granular control over styling, we use a hierarchical data structure:

1.  **PrintBlock**: Top-level container. Can have a global style (e.g., a vertical gradient for the whole block).
    - Contains an array of **PrintLine**s.
2.  **PrintLine**: Represents a single line of text. Can have a line-specific style.
    - Contains an array of **PrintSegment**s.
3.  **PrintSegment**: The atomic unit of text. Has its own text content and style.

```typescript
import { Printer, segment, line, block } from "@heinrichb/console-toolkit";

const printer = new Printer();
printer.print(
	block(
		[
			line(
				[
					segment("Bold Blue Text"),
					segment(" Red Text", { color: "red" }) // Overrides parent color
				],
				{ modifiers: ["bold"] } // Applies to this line
			)
		],
		{ color: "blue" } // Applies to everything in the block
	)
);
```

---

## 🎨 Styling System

Our styling system (`PrintStyle`) is robust and flexible.

### Colors

- **Standard Colors:** `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`.
- **Hex Colors:** Full RGB support (e.g., `#FF5733`).

### Gradients

- **Vertical Gradients:** Apply an array of colors to a `PrintBlock`. The printer interpolates the color for each line based on its vertical position.
- **Horizontal Gradients:** Apply an array of colors to a `PrintLine` or `PrintSegment`. The printer interpolates the color for each character.

```typescript
import { segment, line } from "@heinrichb/console-toolkit";

// Horizontal Gradient (Text flows from Red to Blue)
const gradientLine = line([segment("Gradient Text")], { color: ["#EF4444", "#3B82F6"] });
```

### `interpolateGradient`

For custom gradient logic, use `interpolateGradient` to compute a color at any point in a multi-stop gradient:

```typescript
import { interpolateGradient } from "@heinrichb/console-toolkit";

// Get the color at 75% through a red -> yellow -> green gradient
const color = interpolateGradient(["#EF4444", "#F59E0B", "#10B981"], 0.75);
```

### Modifiers

Available text modifiers:

- `bold`
- `dim`
- `italic`
- `underline`
- `inverse`
- `hidden`
- `strikethrough`

---

## 📐 Layout Utilities

We provide helpers to manage complex multi-column layouts.

### `printColumns`

Takes an array of columns (where each column is an array of `PrintLine`s) and prints them side-by-side.

```typescript
import { printColumns, line, segment } from "@heinrichb/console-toolkit";

const col1 = [line([segment("Row 1")])];
const col2 = [line([segment("Row 1")])];

printColumns([col1, col2], {
	separator: " | ", // String to place between columns
	widths: [10, 20] // Optional fixed widths
});
```

### `mergeColumns`

If you need the `PrintLine` objects instead of printing directly, use `mergeColumns`. This is useful if you want to nest columns inside other structures.

```typescript
import { mergeColumns, line, segment } from "@heinrichb/console-toolkit";

const col1 = [line([segment("Row 1")])];
const col2 = [line([segment("Row 1")])];

const mergedLines = mergeColumns([col1, col2]);
// mergedLines is now a single array of PrintLines ready for the Printer
```
