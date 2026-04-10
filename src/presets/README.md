# 🐉 Presets & Assets

Pre-built assets you can drop directly into your application — ASCII art with customizable gradients and ready-made color palettes.

---

## 🎨 ASCII Art

### The Dragon (`getDragon`)

A majestic dragon rendered as `PrintLine[]` with a vertical color gradient.

**Signature:**

```typescript
function getDragon(colors?: Color[]): PrintLine[];
```

- When called with no arguments, defaults to red-to-amber `["#EF4444", "#F59E0B"]`.
- Pass any `Color[]` array for custom multi-stop gradients.

### Examples

```typescript
import { getDragon, Printer, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

// Default red-to-amber dragon
printer.print(block(getDragon()));

// Two-color ice dragon
printer.print(block(getDragon(["#3B82F6", "#06B6D4"])));

// Multi-stop fire dragon using a gradient preset
printer.print(block(getDragon(GRADIENTS.fire)));

// Custom 3-stop gradient
printer.print(block(getDragon(["#FF0000", "#00FF00", "#0000FF"])));
```

### Side-by-Side Dragons

Combine with `printColumns` for dramatic layouts:

```typescript
import { getDragon, printColumns, Printer, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

printColumns([getDragon(GRADIENTS.fire), getDragon(GRADIENTS.ocean)], {
	separator: "   ",
	printer
});
```

---

## 🌈 Gradient Presets (`GRADIENTS`)

Pre-defined color arrays for common use cases. Use with any `color` or `bgColor` property that accepts `Color[]`.

```typescript
import { GRADIENTS } from "@heinrichb/console-toolkit";
```

| Preset       | Colors                                                           | Description                             |
| :----------- | :--------------------------------------------------------------- | :-------------------------------------- |
| `rainbow`    | `#EF4444`, `#F59E0B`, `#10B981`, `#06B6D4`, `#3B82F6`, `#8B5CF6` | Full spectrum: red through violet       |
| `ocean`      | `#1E3A5F`, `#0E7490`, `#06B6D4`, `#67E8F9`                       | Deep navy to light cyan                 |
| `fire`       | `#7F1D1D`, `#EF4444`, `#F59E0B`, `#FDE047`                       | Dark red to bright yellow               |
| `sunset`     | `#7C3AED`, `#EC4899`, `#F97316`, `#FBBF24`                       | Violet through pink and orange to amber |
| `forest`     | `#064E3B`, `#10B981`, `#84CC16`, `#BEF264`                       | Dark emerald to light lime              |
| `monochrome` | `#000000`, `#6B7280`, `#FFFFFF`                                  | Black through gray to white             |

### Using Gradient Presets

**Horizontal gradient on a line:**

```typescript
import { Printer, segment, line, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();
printer.print(block([line([segment("Rainbow text across the line")], { color: GRADIENTS.rainbow })]));
```

**Vertical gradient on a block:**

```typescript
import { Printer, segment, line, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();

const lines = Array.from({ length: 8 }, (_, i) => line([segment(`  Fire gradient line ${i + 1}  `)]));
printer.print(block(lines, { color: GRADIENTS.fire }));
```

**Background gradient:**

```typescript
import { Printer, segment, line, block, GRADIENTS } from "@heinrichb/console-toolkit";

const printer = new Printer();
printer.print(block([line([segment("  Ocean background  ", { color: "white", bgColor: GRADIENTS.ocean })])]));
```

**With `interpolateGradient` for custom logic:**

```typescript
import { interpolateGradient, GRADIENTS } from "@heinrichb/console-toolkit";

// Get the color at 25% through the sunset gradient
const color = interpolateGradient(GRADIENTS.sunset, 0.25);
```
