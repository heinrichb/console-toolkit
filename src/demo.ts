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
 *
 * Static output comes first so you see everything immediately.
 * Animated demos (progress bar + spinners) run at the end — Ctrl+C anytime.
 */
export async function runDemo() {
	console.clear();
	const printer = new Printer();
	const dim: PrintStyle = { color: "#9CA3AF" };

	// ─── 1. Colors & Modifiers ──────────────────────────────────────────────────

	console.log("--- Colors & Modifiers ---\n");

	const styles: { name: string; style?: PrintStyle }[] = [
		// Modifiers
		{ name: "Bold", style: { modifiers: ["bold"] } },
		{ name: "Dim", style: { modifiers: ["dim"] } },
		{ name: "Italic", style: { modifiers: ["italic"] } },
		{ name: "Underline", style: { modifiers: ["underline"] } },
		{ name: "Strikethrough", style: { modifiers: ["strikethrough"] } },
		{ name: "Inverse", style: { modifiers: ["inverse"] } },
		// Colors in rainbow order
		{ name: "Red", style: { color: "red" } },
		{ name: "Yellow", style: { color: "yellow" } },
		{ name: "Green", style: { color: "green" } },
		{ name: "Cyan", style: { color: "cyan" } },
		{ name: "Blue", style: { color: "blue" } },
		{ name: "Magenta", style: { color: "magenta" } },
		// Hex — pick something visibly unique
		{ name: "Hex #FFD700", style: { color: "#FFD700" } },
		// Combinations
		{ name: "Bold + Underline", style: { modifiers: ["bold", "underline"], color: "cyan" } },
		{ name: "BG Color", style: { color: "white", bgColor: "#3B82F6" } },
		{ name: "BG + Bold", style: { color: "white", bgColor: "#7C3AED", modifiers: ["bold"] } }
	];

	const styleLines: PrintLine[] = styles.map((s) => line([segment(s.name.padEnd(18)), segment("Sample Text", s.style)]));
	printer.print(block(styleLines));
	console.log("");

	// ─── 2. Gradients ───────────────────────────────────────────────────────────

	console.log("--- Gradients ---\n");

	printer.print(
		block([
			line([segment("  Horizontal rainbow across the line  ")], { color: GRADIENTS.rainbow }),
			line([segment("  Partial: "), segment("only this segment", { color: GRADIENTS.sunset })]),
			line([segment("  "), segment(" Background gradient ", { color: "white", bgColor: ["#7C3AED", "#3B82F6", "#06B6D4"] })])
		])
	);
	console.log("");

	const verticalLines: PrintLine[] = Array.from({ length: 5 }, (_, i) =>
		line([segment(`  Vertical gradient — line ${i + 1}  `)])
	);
	printer.print(block(verticalLines, { color: GRADIENTS.fire }));
	console.log("");

	// ─── 3. Multi-Column Layouts ────────────────────────────────────────────────

	console.log("--- Multi-Column Layouts ---\n");

	const labelStyle: PrintStyle = { color: "#A78BFA" };
	const labels: PrintLine[] = [
		line([segment("Package:", labelStyle)]),
		line([segment("Version:", labelStyle)]),
		line([segment("Status:", labelStyle)])
	];
	const values: PrintLine[] = [
		line([segment(pkg.name, { color: "#60A5FA" })]),
		line([segment(pkg.version, { color: "#34D399" })]),
		line([segment("All systems operational", { color: "#FBBF24" })])
	];
	printColumns([labels, values], { separator: "  =>  ", printer });
	console.log("");

	// ─── 4. Tables ──────────────────────────────────────────────────────────────

	console.log("--- Tables ---\n");

	// Feature table with colorful styling
	printer.print(
		block(
			createTable({
				headers: ["Feature", "Status", "Since"],
				rows: [
					["Colors & Hex", "Stable", "v1.0"],
					["Gradients", "Stable", "v1.0"],
					["Background Colors", "New", "v1.1"],
					["Tables", "New", "v1.1"]
				],
				headerStyle: { color: "#FBBF24", modifiers: ["bold"] },
				style: { color: "#A78BFA" },
				borderStyle: { color: "#7C3AED" },
				border: "rounded"
			})
		)
	);
	console.log("");

	// Show all 4 border styles side-by-side
	const borderStyles = ["single", "double", "rounded", "none"] as const;
	const borderColumns = borderStyles.map((bs) =>
		createTable({
			headers: [bs],
			rows: [["Row 1"], ["Row 2"]],
			headerStyle: { color: "#06B6D4", modifiers: ["bold"] },
			style: { color: "#9CA3AF" },
			borderStyle: { color: "#6B7280" },
			border: bs
		})
	);
	printColumns(borderColumns, { separator: "  ", printer });
	console.log("");

	// ─── 5. Gradient Presets ────────────────────────────────────────────────────
	// Ready-made color arrays — plug into any color or bgColor property.

	console.log("--- Gradient Presets ---\n");

	const presetNames = Object.keys(GRADIENTS) as (keyof typeof GRADIENTS)[];
	const presetLines: PrintLine[] = presetNames.map((name) =>
		line([segment(`  ${name.padEnd(12)}`, dim), segment("████████████████████████████████", { color: GRADIENTS[name] })])
	);
	printer.print(block(presetLines));
	console.log("");

	// ─── 5. ASCII Presets ───────────────────────────────────────────────────────

	console.log("--- ASCII Presets ---\n");

	const defaultDragon = getDragon();
	const rainbowDragon = getDragon(GRADIENTS.rainbow);
	printColumns([defaultDragon, rainbowDragon], { separator: "   ", printer });
	console.log("");

	// ─── 6. Render to String ────────────────────────────────────────────────────

	console.log("--- Render to String ---\n");

	const capture = new Printer();
	const rendered = capture.renderToString(block([line([segment("Hello!", { color: "green", modifiers: ["bold"] })])]));
	const plain = stripAnsi(rendered).trim();

	printer.print(
		block([
			line([segment("Raw string:  ", dim), segment(`${rendered.length} chars (includes ANSI codes)`, { color: "yellow" })]),
			line([segment("Plain text:  ", dim), segment(`${plain.length} chars`, { color: "green" }), segment(` → "${plain}"`, dim)])
		])
	);
	console.log("");

	// ─── 7. Live Demo ───────────────────────────────────────────────────────────
	// Animated progress bar + spinners running simultaneously.
	// Everything above was static — Ctrl+C anytime from here.

	console.log("--- Live Demo ---\n");

	const livePrinter = new Printer({ live: true });
	const bracketStyle: PrintStyle = { color: "#6B7280" };

	const demoSpinners = (Object.keys(SPINNERS) as (keyof typeof SPINNERS)[]).map((type) => ({
		name: type.charAt(0).toUpperCase() + type.slice(1),
		instance: new Spinner({ frames: SPINNERS[type], interval: 80 })
	}));

	const start = Date.now();
	const duration = 3000;

	while (Date.now() - start < duration) {
		const elapsed = Date.now() - start;
		const factor = Math.min(elapsed / duration, 1);
		const colorHex = interpolateGradient(["#3B82F6", "#06B6D4", "#10B981"], factor);

		const bar = createProgressBar({
			progress: factor,
			width: 40,
			startChar: "▕",
			endChar: "▏",
			fillStyle: { color: ["#3B82F6", "#EC4899"] },
			emptyStyle: { color: "#4B5563" },
			startStyle: bracketStyle,
			endStyle: bracketStyle,
			percentageStyle: { modifiers: ["bold"], color: colorHex }
		});

		const spinnerLine = line(
			demoSpinners.flatMap((s) => [
				segment(`${s.name}: `, dim),
				segment(s.instance.getFrame(), { color: "cyan" }),
				segment("   ")
			])
		);

		livePrinter.print(block([bar, spinnerLine]));
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	console.log("\n\nDemo complete! See src/demo.ts for the source code.\n");
}
