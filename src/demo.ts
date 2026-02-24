import { printColumns, getDragon, Printer, interpolateColor, createProgressBar, Spinner, SPINNERS } from "./index";
import { PrintLine, PrintStyle, HexColor } from "./core/types";
import pkg from "../package.json";

/**
 * Run this demo to visually verify terminal output:
 * bun run src/demo.ts
 */

function getProgressBarColor(factor: number): HexColor {
	// Multi-stop gradient: Blue -> Cyan -> Green
	if (factor < 0.5) {
		return interpolateColor("#3B82F6", "#06B6D4", factor * 2);
	} else {
		return interpolateColor("#06B6D4", "#10B981", (factor - 0.5) * 2);
	}
}

export async function runDemo() {
	console.clear();
	const staticPrinter = new Printer();

	// 1. Static Dual Column Print
	console.log("--- Static Dual Column Demo ---");
	const purple: PrintStyle = { color: "#A78BFA" };
	const blue: PrintStyle = { color: "#60A5FA" };
	const green: PrintStyle = { color: "#34D399" };
	const yellow: PrintStyle = { color: "#FBBF24" };

	const leftContent: PrintLine[] = [
		{ segments: [{ text: "Package:", style: purple }] },
		{ segments: [{ text: "Version:", style: purple }] },
		{ segments: [{ text: "Status:", style: purple }] }
	];

	const rightContent: PrintLine[] = [
		{ segments: [{ text: pkg.name, style: blue }] },
		{ segments: [{ text: pkg.version, style: green }] },
		{ segments: [{ text: "Testing live output...", style: yellow }] }
	];

	printColumns([leftContent, rightContent], { separator: "  =>  " });
	console.log("\n");

	// 2. Block Vertical Gradient Demo
	console.log("--- Block Vertical Gradient Demo ---");
	const gradientBlockLines: PrintLine[] = Array.from({ length: 10 }, (_, i) => ({
		segments: [{ text: `Line ${i + 1} - Inherits Gradient` }]
	}));

	staticPrinter.print({
		style: { color: ["#EF4444", "#3B82F6"] },
		lines: gradientBlockLines
	});
	console.log("\n");

	// 3. Dragon Gradient Preset
	console.log("--- Dragon Gradient Preset ---");
	const dragon = getDragon("#EF4444", "#FDE047");
	const iceDragon = getDragon("#3B82F6", "#06B6D4");
	printColumns([dragon, iceDragon], { separator: "   ", printer: staticPrinter });
	console.log("\n");

	// 4. Interactive Progress Bar Demo
	console.log("--- Live Progress Bar Demo ---");
	const livePrinter = new Printer({ live: true });
	const gray: PrintStyle = { color: "#4B5563" };

	for (let i = 0; i <= 100; i += 2) {
		const factor = i / 100;
		const progressColorHex = interpolateColor("#3B82F6", "#10B981", factor);
		const progressColor: PrintStyle = { color: progressColorHex };

		// Standard Bar
		const progressLine = createProgressBar({
			progress: factor,
			width: 30,
			startChar: "[",
			endChar: "]",
			startStyle: progressColor,
			endStyle: progressColor,
			fillStyle: progressColor,
			emptyStyle: gray,
			percentageStyle: progressColor
		});

		// Gradient Bar
		const gradientHex = getProgressBarColor(factor);
		const gradientStyle: PrintStyle = { color: gradientHex };

		const complexGradientBar = createProgressBar({
			progress: factor,
			width: 40,
			startChar: "▕",
			endChar: "▏",
			fillChar: "█",
			emptyChar: "░",
			startStyle: gradientStyle,
			endStyle: gradientStyle,
			fillStyle: { color: ["#3B82F6", "#EC4899"] },
			emptyStyle: { color: "gray" },
			percentageStyle: { modifiers: ["bold"], color: gradientHex }
		});

		livePrinter.print({
			lines: [
				progressLine,
				{ segments: [] },
				{ segments: [{ text: "Horizontal Gradient on Bar Segment:", style: { modifiers: ["bold"] } }] },
				complexGradientBar
			]
		});
		await new Promise((resolve) => setTimeout(resolve, 30));
	}
	console.log("\n");

	// 5. Spinners Demo
	console.log("--- Spinners Demo ---");

	const spinnerTypes = Object.keys(SPINNERS) as (keyof typeof SPINNERS)[];
	const spinners = spinnerTypes.map((type) => ({
		type,
		instance: new Spinner({ frames: SPINNERS[type], interval: 80 })
	}));

	const spinnerPrinter = new Printer({ live: true });
	const spinnerStart = Date.now();

	while (Date.now() - spinnerStart < 3000) {
		const lines: PrintLine[] = spinners.map((s) => ({
			segments: [
				{ text: `${s.type.charAt(0).toUpperCase() + s.type.slice(1)}:`.padEnd(10), style: { modifiers: ["dim"] } },
				{ text: s.instance.getFrame(), style: { color: "cyan" } }
			]
		}));

		spinnerPrinter.print({ lines });
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	console.log("\n");

	// 6. Style Codes Demo
	console.log("--- Style Codes Demo ---");

	const styles: { name: string; style?: PrintStyle }[] = [
		{ name: "Default" },
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
		{ name: "Gray", style: { color: "gray" } }
	];

	const styleLines: PrintLine[] = styles.map((s) => ({
		segments: [{ text: s.name.padEnd(20) }, { text: "Sample Text", style: s.style }]
	}));

	staticPrinter.print({ lines: styleLines });
	console.log("\n✨ Demo Complete!");
}
