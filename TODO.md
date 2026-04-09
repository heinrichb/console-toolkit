## Near-Term Features

### Node.js Compatibility Testing

Add Node.js test job to CI. Verify `process.stdout.write`, `Date.now()`, and ANSI output work identically across runtimes. Test with Node.js 18, 20, and 22. Medium effort.

### Box Drawing Component

`createBox(content: PrintLine[], options)` that wraps arbitrary content in a bordered box with configurable border styles (reuse existing table border character sets). Simpler than tables — single content area instead of a grid. Low effort.

### Row-Level Table Styles

Add `rowStyles?: PrintStyle[]` to `TableOptions` for per-row style overrides. Primary use case: alternating row colors. Low effort.

### Text Wrapping

Add `wrap?: number` option to `printColumns` that wraps long segments at word boundaries to fit column widths. Medium effort — requires splitting segments while preserving styles.

---

## API Improvements

### Fluent/Chainable Builder API

`segment("text").bold().color("red").bgColor("blue")` as an alternative to the object literal style. Returns the same `PrintSegment` — purely syntactic sugar. Medium effort.

### Clickable Hyperlinks

OSC 8 escape sequences (`\x1b]8;;URL\x1b\\text\x1b]8;;\x1b\\`). Add `link?: string` to `PrintStyle`. Low effort for basic support.

### API Surface Cleanup

Consider internalizing exports that are only used internally: `getGradientColorFromRgb`, `getGradientBgColorFromRgb`, `ESC`. Not harmful, but they clutter the public API.

---

## Multi-Language Monorepo Expansion

The core ideas — ANSI color math, gradient interpolation, style cascading, column layout — are language-agnostic. The long-term goal is a monorepo publishing packages for multiple languages (TypeScript/npm, Python/PyPI, Rust/crates.io, Go/go.mod) with a shared source of truth for data and test fixtures.

### Architecture

```
console-toolkit/
├── spec/                          # Shared source of truth
│   ├── colors.json                # Standard color palette (name -> hex)
│   ├── modifiers.json             # ANSI modifier codes (name -> code)
│   ├── spinners.json              # Spinner frame presets
│   ├── gradients.json             # Gradient color presets
│   ├── borders.json               # Box-drawing character sets
│   ├── ascii-art/                 # ASCII art data files
│   │   └── dragon.txt
│   ├── test-fixtures/             # Input/expected-output pairs
│   │   ├── color-conversion.json  # hexToRgb, rgbToHex vectors
│   │   ├── gradient.json          # Multi-stop interpolation vectors
│   │   ├── style-merging.json     # mergeStyles test cases
│   │   └── rendering.json         # Full render tree -> ANSI string
│   └── algorithms.md              # Pseudocode for gradient math, etc.
├── packages/
│   ├── typescript/                # Current codebase (npm)
│   ├── python/                    # PyPI package
│   ├── rust/                      # crates.io package
│   └── go/                        # go module
└── tools/
    ├── validate-fixtures.ts       # Test all langs against shared fixtures
    └── gen-spec-data.ts           # Extract spec/ from TypeScript source
```

### Shared as Data (JSON in `spec/`)

Color palettes, modifier codes, spinner frames, gradient presets, border characters, ASCII art. Test fixture vectors — every language's test suite loads these and verifies identical output.

### Shared as Algorithm Specs (pseudocode in `spec/algorithms.md`)

Hex/RGB conversion, linear RGB interpolation, multi-stop gradient segment math, style merging rules (child overrides parent color, modifiers union), rendering algorithm (block -> line -> segment loop with per-character gradients).

### Reimplemented per Language (~200-400 lines each)

I/O layer, type system, timer API for spinners.

### Migration Plan

1. Move TypeScript into `packages/typescript/`, update npm publish path
2. Extract `spec/` from current TypeScript source
3. Update TypeScript tests to load from shared fixtures
4. Implement Python package, test against same fixtures
5. Implement Rust package
6. Implement Go package
7. Add cross-language CI that validates all packages against shared fixtures
