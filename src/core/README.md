# ⚙️ Core Engine & Styling

This directory contains the foundational logic for `@heinrichb/console-toolkit` — the rendering engine, ANSI escape sequence generation, style cascade, gradient system, and layout utilities.

---

## 🖨️ The Printer Class

The `Printer` class renders `PrintBlock` data to the terminal. It supports static output, live-updating animations, and string capture.

### Basic Usage

```typescript
import { Printer, segment, line, block } from "@heinrichb/console-toolkit";

const printer = new Printer();
printer.print(block([line([segment("Hello from Core!")])]));
```

### Live Mode

When initialized with `{ live: true }`, the printer tracks how many lines it wrote. On subsequent `print()` calls, it moves the cursor up and clears those lines before writing new content — creating smooth animations.

```typescript
import { Printer, segment, line, block } from "@heinrichb/console-toolkit";

const livePrinter = new Printer({ live: true });

// Frame 1
livePrinter.print(block([line([segment("Loading...")])]));

// Frame 2 (overwrites Frame 1)
livePrinter.print(block([line([segment("Done!")])]));
```

### Render to String

Capture output as an ANSI string without writing to stdout. Useful for testing, logging, or composing output before display.

```typescript
import { Printer, segment, line, block, stripAnsi } from "@heinrichb/console-toolkit";

const printer = new Printer();

const rendered = printer.renderToString(block([line([segment("Styled text", { color: "green", modifiers: ["bold"] })])]));

// rendered contains the full ANSI-escaped string
const plain = stripAnsi(rendered);
// plain contains "Styled text\n"
```

Key behavior:

- `renderToString` does **not** write to stdout
- `renderToString` does **not** include live-mode clear sequences
- `renderToString` does **not** update `linesRendered` (no side effects on live mode state)
- `renderToString` accepts an optional `PrintBlock` parameter, same as `print()`

### Printer API

| Method                              | Returns  | Description                                               |
| :---------------------------------- | :------- | :-------------------------------------------------------- |
| `print(data?: PrintBlock)`          | `void`   | Renders to stdout. Clears previous output in live mode.   |
| `renderToString(data?: PrintBlock)` | `string` | Renders to a string without stdout or state side effects. |
| `clear()`                           | `void`   | Clears previously rendered lines (live mode only).        |

### Printer Options

| Option | Type         | Default     | Description                                                     |
| :----- | :----------- | :---------- | :-------------------------------------------------------------- |
| `live` | `boolean`    | `false`     | Enable live mode — subsequent prints overwrite previous output. |
| `data` | `PrintBlock` | `undefined` | Initial data to load into the printer.                          |

---

## 🏗️ Data Structures

Output is built from a three-level hierarchy using builder functions:

1. **`PrintBlock`** — Top-level container. Holds an array of `PrintLine`s and an optional block-level style (vertical gradients apply here).
2. **`PrintLine`** — A single row. Holds an array of `PrintSegment`s and an optional line-level style (horizontal gradients apply here).
3. **`PrintSegment`** — The atomic unit. Holds text content and an optional style.

### Builder Functions

| Function                                              | Returns        | Description                    |
| :---------------------------------------------------- | :------------- | :----------------------------- |
| `segment(text: string, style?: PrintStyle)`           | `PrintSegment` | Creates a styled text segment. |
| `line(segments?: PrintSegment[], style?: PrintStyle)` | `PrintLine`    | Creates a line from segments.  |
| `block(lines?: PrintLine[], style?: PrintStyle)`      | `PrintBlock`   | Creates a block from lines.    |

### Style Cascade Example

Styles cascade from block to line to segment. Child styles override parent styles for `color` and `bgColor`; modifiers are merged (unioned).

```typescript
import { Printer, segment, line, block } from "@heinrichb/console-toolkit";

const printer = new Printer();
printer.print(
	block(
		[
			line(
				[
					segment("Inherits blue + bold"),
					segment(" Now red", { color: "red" }) // Overrides color, keeps bold
				],
				{ modifiers: ["bold"] } // Line-level: adds bold
			)
		],
		{ color: "blue" } // Block-level: sets blue for everything
	)
);
```

---

## 🎨 Styling System

The `PrintStyle` interface controls all visual properties:

```typescript
interface PrintStyle {
	color?: Color | Color[]; // Foreground: solid color or gradient array
	bgColor?: Color | Color[]; // Background: solid color or gradient array
	modifiers?: StyleModifier[]; // Text modifiers
}
```

### Colors

A `Color` is either a standard name or a hex string:

**Standard colors:** `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, `grey`

**Hex colors:** Any `#RRGGBB` string (e.g., `"#EF4444"`, `"#3B82F6"`)

### Background Colors

The `bgColor` property works identically to `color` — it accepts standard names, hex strings, and gradient arrays. ANSI background codes (`48;2;R;G;B`) are emitted alongside foreground codes.

```typescript
import { Printer, segment, line, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

printer.print(
	block([
		line([segment("White on blue", { color: "white", bgColor: "#3B82F6" })]),
		line([segment("Background gradient", { color: "white", bgColor: GRADIENTS.ocean })])
	])
);
```

### Modifiers

| Modifier        | ANSI Code | Effect                     |
| :-------------- | :-------- | :------------------------- |
| `bold`          | `1`       | Bold / increased intensity |
| `dim`           | `2`       | Decreased intensity        |
| `italic`        | `3`       | Italic text                |
| `underline`     | `4`       | Underlined text            |
| `inverse`       | `7`       | Swap foreground/background |
| `hidden`        | `8`       | Hidden text                |
| `strikethrough` | `9`       | Strikethrough text         |

---

## ✨ Gradients

Gradients are arrays of `Color` values. They work in two directions depending on where you apply them.

### Horizontal Gradients

Apply a color array to a `PrintLine` or `PrintSegment`. The renderer interpolates per-character across the text.

```typescript
import { Printer, segment, line, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

// Line-level: gradient spans ALL segments in the line
printer.print(block([line([segment("Entire line is gradient")], { color: GRADIENTS.rainbow })]));

// Segment-level: gradient only on that segment
printer.print(block([line([segment("Normal "), segment("gradient part", { color: GRADIENTS.sunset })])]));
```

### Vertical Gradients

Apply a color array to a `PrintBlock`. The renderer interpolates per-line from top to bottom.

```typescript
import { Printer, segment, line, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

const lines = Array.from({ length: 6 }, (_, i) => line([segment(`  Line ${i + 1}  `)]));
printer.print(block(lines, { color: GRADIENTS.fire }));
```

Both `color` and `bgColor` support vertical gradients on blocks.

### `interpolateGradient`

Compute a hex color at any point (0-1) in a multi-stop gradient:

```typescript
import { interpolateGradient } from "@heinrichb/console-toolkit";

const color = interpolateGradient(["#EF4444", "#F59E0B", "#10B981"], 0.75);
// Returns a HexColor at 75% through the gradient
```

---

## 📐 Layout Utilities

### `printColumns`

Prints multiple columns of `PrintLine[]` side-by-side. Columns are padded to their widest content.

```typescript
import { printColumns, line, segment } from "@heinrichb/console-toolkit";

const labels = [line([segment("Name:")]), line([segment("Version:")])];
const values = [line([segment("toolkit")]), line([segment("1.0.10")])];

printColumns([labels, values], {
	separator: "  =>  ", // String between columns (default: 5 spaces)
	widths: [10, 20], // Optional fixed column widths
	defaultStyle: { color: "gray" } // Style for separator and padding
});
```

### `mergeColumns`

Returns `PrintLine[]` instead of printing — useful for composing into other blocks:

```typescript
import { mergeColumns, line, segment } from "@heinrichb/console-toolkit";

const merged = mergeColumns(
	[[line([segment("Left")])], [line([segment("Right")])]],
	" | ", // separator
	undefined, // defaultStyle
	[15, 20] // widths
);
// Returns PrintLine[] ready for block() and Printer
```

### Other Utilities

| Function                                                      | Returns     | Description                                         |
| :------------------------------------------------------------ | :---------- | :-------------------------------------------------- |
| `getLineLength(line: PrintLine)`                              | `number`    | Plain text length of a line (ignoring ANSI codes).  |
| `computeMaxWidth(lines: PrintLine[])`                         | `number`    | Maximum line length in an array.                    |
| `padLine(line: PrintLine, width: number, style?: PrintStyle)` | `PrintLine` | Pads a line to a target width with trailing spaces. |
| `stripAnsi(text: string)`                                     | `string`    | Strips all ANSI escape sequences from a string.     |
