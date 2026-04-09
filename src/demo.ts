import {
	printColumns,
	getDragon,
	Printer,
	interpolateGradient,
	createProgressBar,
	Spinner,
	SPINNERS,
	line,
	segment,
	block
} from "./index";
import { PrintLine, PrintStyle } from "./core/types";
import pkg from "../package.json";

/**
 * Run this demo to visually verify terminal output:
 * bun run demo
 */
export async function runDemo() {
	console.clear();
	const staticPrinter = new Printer();

	// ─── Section 1: Basic Styling ───────────────────────────────────────────────

	console.log("--- Basic Styling ---");

	const styles: { name: string; style?: PrintStyle }[] = [
		{ name: "No Style (Default)" },
		{ name: "Bold + Red", style: { modifiers: ["bold"], color: "red" } },
		{ name: "Bold", style: { modifiers: ["bold"] } },
		{ name: "Dim", style: { modifiers: ["dim"] } },
		{ name: "Italic", style: { modifiers: ["italic"] } },
		{ name: "Underline", style: { modifiers: ["underline"] } },
		{ name: "Strikethrough", style: { modifiers: ["strikethrough"] } },
		{ name: "Inverse", style: { modifiers: ["inverse"] } },
		{ name: "Hidden", style: { modifiers: ["hidden"] } },
		{ name: "Red", style: { color: "red" } },
		{ name: "Green", style: { color: "green" } },
		{ name: "Yellow", style: { color: "yellow" } },
		{ name: "Blue", style: { color: "blue" } },
		{ name: "Magenta", style: { color: "magenta" } },
		{ name: "Cyan", style: { color: "cyan" } },
		{ name: "White", style: { color: "white" } },
		{ name: "Gray", style: { color: "gray" } },
		{ name: "Hex #FF6B35", style: { color: "#FF6B35" } }
	];

	const styleLines: PrintLine[] = styles.map((s) => line([segment(s.name.padEnd(22)), segment("Sample Text", s.style)]));
	staticPrinter.print(block(styleLines));
	console.log("\n");

	// ─── Section 2: Builder Functions ───────────────────────────────────────────

	console.log("--- Builder Functions ---");

	const mySegment = segment("Hello, ", { color: "cyan", modifiers: ["bold"] });
	const myLine = line([mySegment, segment("World!", { color: "#10B981" })]);
	const myBlock = block([myLine, line([segment("Built with segment(), line(), block()")])]);
	staticPrinter.print(myBlock);
	console.log("\n");

	// ─── Section 3: Horizontal Gradients ────────────────────────────────────────

	console.log("--- Horizontal Gradients ---");

	// Line-level gradient (applies across all segments in the line)
	staticPrinter.print(
		block([
			line([segment("Line-level gradient spans all segments in a line")], {
				color: ["#EF4444", "#3B82F6", "#10B981"]
			}),
			line([segment("Segment gradient: "), segment("only this part is gradient", { color: ["#EC4899", "#8B5CF6"] })])
		])
	);
	console.log("\n");

	// ─── Section 4: Vertical Gradients ──────────────────────────────────────────

	console.log("--- Vertical Gradients ---");

	const gradientBlockLines: PrintLine[] = Array.from({ length: 8 }, (_, i) =>
		line([segment(`  Line ${(i + 1).toString().padStart(2)} - Block vertical gradient  `)])
	);
	staticPrinter.print(block(gradientBlockLines, { color: ["#EF4444", "#F59E0B", "#10B981"] }));
	console.log("\n");

	// ─── Section 5: Multi-Column Layouts ────────────────────────────────────────

	console.log("--- Multi-Column Layouts ---");

	const purple: PrintStyle = { color: "#A78BFA" };
	const blue: PrintStyle = { color: "#60A5FA" };
	const green: PrintStyle = { color: "#34D399" };
	const yellow: PrintStyle = { color: "#FBBF24" };

	const leftContent: PrintLine[] = [
		line([segment("Package:", purple)]),
		line([segment("Version:", purple)]),
		line([segment("Status:", purple)])
	];

	const rightContent: PrintLine[] = [
		line([segment(pkg.name, blue)]),
		line([segment(pkg.version, green)]),
		line([segment("All systems operational", yellow)])
	];

	printColumns([leftContent, rightContent], { separator: "  =>  ", printer: staticPrinter });
	console.log("\n");

	// ─── Section 6: Progress Bars ───────────────────────────────────────────────

	console.log("--- Live Progress Bar Demo ---");

	const livePrinter = new Printer({ live: true });
	const gray: PrintStyle = { color: "#4B5563" };

	for (let i = 0; i <= 100; i += 2) {
		const factor = i / 100;

		// Use interpolateGradient for multi-stop color progression
		const gradientHex = interpolateGradient(["#3B82F6", "#06B6D4", "#10B981"], factor);
		const gradientStyle: PrintStyle = { color: gradientHex };

		// Standard bar with solid color progression
		const progressLine = createProgressBar({
			progress: factor,
			width: 30,
			completeStyle: { color: "green" },
			startStyle: gradientStyle,
			endStyle: gradientStyle,
			fillStyle: gradientStyle,
			emptyStyle: gray,
			percentageStyle: gradientStyle
		});

		// Gradient bar with horizontal gradient fill
		const gradientBar = createProgressBar({
			progress: factor,
			width: 40,
			startChar: "▕",
			endChar: "▏",
			fillChar: "█",
			emptyChar: "░",
			completeChar: "✔",
			completeStyle: { color: "#10B981" },
			startStyle: gradientStyle,
			endStyle: gradientStyle,
			fillStyle: { color: ["#3B82F6", "#EC4899"] },
			emptyStyle: { color: "gray" },
			percentageStyle: { modifiers: ["bold"], color: gradientHex }
		});

		livePrinter.print(
			block([progressLine, line(), line([segment("Horizontal Gradient Bar:", { modifiers: ["bold"] })]), gradientBar])
		);
		await new Promise((resolve) => setTimeout(resolve, 30));
	}
	console.log("\n");

	// ─── Section 7: Spinners ────────────────────────────────────────────────────

	console.log("--- Spinners Demo ---");

	const spinnerTypes = Object.keys(SPINNERS) as (keyof typeof SPINNERS)[];
	const spinners = spinnerTypes.map((type) => ({
		type,
		instance: new Spinner({ frames: SPINNERS[type], interval: 80 })
	}));

	const spinnerPrinter = new Printer({ live: true });
	const spinnerStart = Date.now();

	while (Date.now() - spinnerStart < 3000) {
		const lines: PrintLine[] = spinners.map((s) =>
			line([
				segment(`${s.type.charAt(0).toUpperCase() + s.type.slice(1)}:`.padEnd(10), { modifiers: ["dim"] }),
				segment(s.instance.getFrame(), { color: "cyan" })
			])
		);

		spinnerPrinter.print(block(lines));
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	console.log("\n");

	// ─── Section 8: ASCII Presets ───────────────────────────────────────────────

	console.log("--- ASCII Presets ---");

	const dragon = getDragon("#EF4444", "#FDE047");
	const iceDragon = getDragon("#3B82F6", "#06B6D4");
	printColumns([dragon, iceDragon], { printer: staticPrinter });

	console.log("\n✨ Demo Complete!");
}
