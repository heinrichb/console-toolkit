# 🐉 Presets & Assets

Sometimes you just need something cool without writing it from scratch. This directory contains pre-built assets and complex layouts that you can drop directly into your application.

---

## 🎨 ASCII Art

### The Dragon (`getDragon`)

A majestic dragon, perfect for banners or error screens. You can customize the color gradient that runs vertically across the art.

```typescript
import { getDragon, Printer, block } from "@heinrichb/console-toolkit";

const printer = new Printer();

// Default Dragon (Red -> Yellow)
const dragon = getDragon();
printer.print(block(dragon));

// Custom Colors (Blue -> Cyan)
const iceDragon = getDragon("#3B82F6", "#06B6D4");
printer.print(block(iceDragon));
```

---

_More presets coming soon! Check back for updates._
