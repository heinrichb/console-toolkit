import {
	printColumns,
	getDragon,
	Printer,
	interpolateGradient,
	createProgressBar,
	createTable,
	Spinner,
	SPINNERS,
	GRADIENTS,
	stripAnsi,
	line,
	segment,
	block
} from "./index";
import { PrintLine, PrintStyle } from "./core/types";
import pkg from "../package.json";

/**
 * Run this demo to visually verify terminal output:
 * bun run demo
 *
 * Each section below is a self-contained example you can copy-paste
 * into your own project as a starting point.
 */
export async function runDemo() {
	console.clear();
	const printer = new Printer();

	// ─── 1. Colors & Modifiers ──────────────────────────────────────────────────
	// Every style combination available — pick your favorites.

	console.log("--- Colors & Modifiers ---\n");

	const styles: { name: string; style?: PrintStyle }[] = [
		{ name: "Bold", style: { modifiers: ["bold"] } },
		{ name: "Dim", style: { modifiers: ["dim"] } },
		{ name: "Italic", style: { modifiers: ["italic"] } },
		{ name: "Underline", style: { modifiers: ["underline"] } },
		{ name: "Strikethrough", style: { modifiers: ["strikethrough"] } },
		{ name: "Inverse", style: { modifiers: ["inverse"] } },
		{ name: "Red", style: { color: "red" } },
		{ name: "Green", style: { color: "green" } },
		{ name: "Blue", style: { color: "blue" } },
		{ name: "Cyan", style: { color: "cyan" } },
		{ name: "Magenta", style: { color: "magenta" } },
		{ name: "Hex #FF6B35", style: { color: "#FF6B35" } },
		{ name: "Bold + Red", style: { modifiers: ["bold"], color: "red" } },
		{ name: "BG Color", style: { color: "white", bgColor: "#3B82F6" } },
		{ name: "BG + Bold", style: { color: "white", bgColor: "#7C3AED", modifiers: ["bold"] } }
	];

	const styleLines: PrintLine[] = styles.map((s) => line([segment(s.name.padEnd(18)), segment("Sample Text", s.style)]));
	printer.print(block(styleLines));
	console.log("");

	// ─── 2. Gradients ───────────────────────────────────────────────────────────
	// Horizontal gradients apply per-character across a line or segment.
	// Vertical gradients cascade down through a block's lines.

	console.log("--- Gradients ---\n");

	// Horizontal — line-level gradient spans all segments
	printer.print(
		block([
			line([segment("  Horizontal: Rainbow across the entire line  ")], { color: GRADIENTS.rainbow }),
			line([segment("  Horizontal: "), segment("only this segment is gradient", { color: GRADIENTS.sunset })]),
			line()
		])
	);

	// Vertical — block-level gradient colors each line differently
	const verticalLines: PrintLine[] = Array.from({ length: 6 }, (_, i) =>
		line([segment(`  Vertical gradient — line ${i + 1}  `)])
	);
	printer.print(block(verticalLines, { color: GRADIENTS.fire }));

	// Background gradient
	printer.print(block([line(), line([segment("  Background gradient  ", { color: "white", bgColor: GRADIENTS.ocean })])]));
	console.log("\n");

	// ─── 3. Multi-Column Layouts ────────────────────────────────────────────────
	// Columns auto-pad to the widest content. Great for key-value displays.

	console.log("--- Multi-Column Layouts ---\n");

	const labelStyle: PrintStyle = { color: "#A78BFA" };
	const valueStyles: PrintStyle[] = [{ color: "#60A5FA" }, { color: "#34D399" }, { color: "#FBBF24" }];

	const labels: PrintLine[] = [
		line([segment("Package:", labelStyle)]),
		line([segment("Version:", labelStyle)]),
		line([segment("Status:", labelStyle)])
	];
	const values: PrintLine[] = [
		line([segment(pkg.name, valueStyles[0])]),
		line([segment(pkg.version, valueStyles[1])]),
		line([segment("All systems operational", valueStyles[2])])
	];

	printColumns([labels, values], { separator: "  =>  ", printer });
	console.log("\n");

	// ─── 4. Tables ──────────────────────────────────────────────────────────────
	// Styled tables with automatic column sizing and multiple border styles.

	console.log("--- Tables ---\n");

	const tableLines = createTable({
		headers: ["Feature", "Status", "Since"],
		rows: [
			["Colors & Hex", "Stable", "v1.0"],
			["Gradients", "Stable", "v1.0"],
			["Background Colors", "New", "v1.1"],
			["Tables", "New", "v1.1"],
			["Gradient Presets", "New", "v1.1"]
		],
		headerStyle: { color: "cyan", modifiers: ["bold"] },
		style: { color: "white" },
		borderStyle: { color: "#6B7280" },
		border: "rounded"
	});
	printer.print(block(tableLines));
	console.log("");

	// ─── 5. Progress Bars ───────────────────────────────────────────────────────
	// Animated progress bar with color that shifts as it fills.

	console.log("--- Progress Bar ---\n");

	const livePrinter = new Printer({ live: true });

	for (let i = 0; i <= 100; i += 2) {
		const factor = i / 100;
		const colorHex = interpolateGradient(["#3B82F6", "#06B6D4", "#10B981"], factor);
		const colorStyle: PrintStyle = { color: colorHex };

		const bar = createProgressBar({
			progress: factor,
			width: 40,
			startChar: "▕",
			endChar: "▏",
			fillStyle: { color: ["#3B82F6", "#EC4899"] },
			emptyStyle: { color: "#4B5563" },
			startStyle: colorStyle,
			endStyle: colorStyle,
			percentageStyle: { modifiers: ["bold"], color: colorHex }
		});

		livePrinter.print(block([bar]));
		await new Promise((resolve) => setTimeout(resolve, 25));
	}
	console.log("\n");

	// ─── 6. Spinners ────────────────────────────────────────────────────────────
	// Five built-in spinner presets. Cycle through them all.

	console.log("--- Spinners ---\n");

	const spinnerTypes = Object.keys(SPINNERS) as (keyof typeof SPINNERS)[];
	const spinners = spinnerTypes.map((type) => ({
		type,
		instance: new Spinner({ frames: SPINNERS[type], interval: 80 })
	}));

	const spinnerPrinter = new Printer({ live: true });
	const spinnerStart = Date.now();

	while (Date.now() - spinnerStart < 2000) {
		const spinnerLines: PrintLine[] = spinners.map((s) =>
			line([
				segment(`${s.type.charAt(0).toUpperCase() + s.type.slice(1)}:`.padEnd(10), { color: "#9CA3AF" }),
				segment(s.instance.getFrame(), { color: "cyan" })
			])
		);

		spinnerPrinter.print(block(spinnerLines));
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	console.log("\n");

	// ─── 7. ASCII Art Presets ───────────────────────────────────────────────────
	// Pre-built ASCII art with customizable color gradients.

	console.log("--- ASCII Presets ---\n");

	const fireDragon = getDragon(GRADIENTS.fire);
	const iceDragon = getDragon(GRADIENTS.ocean);
	printColumns([fireDragon, iceDragon], { separator: "   ", printer });
	console.log("");

	// ─── 8. Render to String ────────────────────────────────────────────────────
	// Capture styled output as a string — useful for logging, testing, or composing.

	console.log("--- Render to String ---\n");

	const capture = new Printer();
	const rendered = capture.renderToString(
		block([line([segment("Hello, styled world!", { color: "green", modifiers: ["bold"] })])])
	);
	const plain = stripAnsi(rendered);

	printer.print(
		block([
			line([segment("Rendered length: ", { color: "#9CA3AF" }), segment(`${rendered.length} chars`, { color: "yellow" })]),
			line([segment("Plain text:     ", { color: "#9CA3AF" }), segment(`"${plain.trim()}"`, { color: "green" })])
		])
	);

	console.log("\n✨ Demo complete! See src/demo.ts for the source code.\n");
}
