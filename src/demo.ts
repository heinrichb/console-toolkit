import { printDualColumn, getDragonLines, Printer, interpolateColor, StyledLine, createProgressBar } from "./index";
import pkg from "../package.json";

/**
 * Run this demo to visually verify terminal output:
 * bun run src/demo.ts
 */

export async function runDemo() {
	console.clear();

	// 1. Test Static Dual Column Print
	console.log("--- Static Dual Column Demo ---");
	const purple = "#A78BFA";
	const blue = "#60A5FA";
	const green = "#34D399";
	const yellow = "#FBBF24";

	const leftContent: StyledLine[] = [
		{ segments: [{ text: "Package:", style: purple }] },
		{ segments: [{ text: "Version:", style: purple }] },
		{ segments: [{ text: "Status:", style: purple }] }
	];

	const rightContent: StyledLine[] = [
		{ segments: [{ text: pkg.name, style: blue }] },
		{ segments: [{ text: pkg.version, style: green }] },
		{ segments: [{ text: "Testing live output...", style: yellow }] }
	];

	printDualColumn(leftContent, rightContent, { separator: "  =>  " });
	console.log("\n");

	// 2. Test the Dragon Gradient Preset
	console.log("--- Dragon Gradient Preset ---");
	const dragon = getDragonLines("#EF4444", "#FDE047");
	const printer = new Printer();
	printer.print(dragon);
	console.log("\n");

	// 3. Test Progress Bar
	console.log("--- Interactive Progress Bar Demo ---");
	const interactivePrinter = new Printer({ interactive: true });
	const gray = "#4B5563";

	for (let i = 0; i <= 100; i += 2) {
		const progressColor = interpolateColor("#3B82F6", "#10B981", i / 100);

		const progressLine = createProgressBar({
			progress: i / 100,
			width: 30,
			startChar: "[",
			endChar: "]",
			startStyle: progressColor,
			endStyle: progressColor,
			fillStyle: progressColor,
			emptyStyle: gray,
			percentageStyle: progressColor
		});

		interactivePrinter.print([progressLine]);
		await new Promise((resolve) => setTimeout(resolve, 20));
	}
	console.log("\n");

	// 4. Style Codes Demo
	console.log("--- Style Codes Demo ---");

	const styles = [
		{ name: "Default", style: "default" },
		{ name: "Bold", style: "bold" },
		{ name: "Dim", style: "dim" },
		{ name: "Italic", style: "italic" },
		{ name: "Underline", style: "underline" },
		{ name: "Strikethrough", style: "strikethrough" },
		{ name: "Inverse", style: "inverse" },
		{ name: "Hidden", style: "hidden" },
		{ name: "Black", style: "black" },
		{ name: "Red", style: "red" },
		{ name: "Green", style: "green" },
		{ name: "Yellow", style: "yellow" },
		{ name: "Blue", style: "blue" },
		{ name: "Magenta", style: "magenta" },
		{ name: "Cyan", style: "cyan" },
		{ name: "White", style: "white" },
		{ name: "Gray", style: "gray" }
	];

	const styleLines: StyledLine[] = styles.map((s) => ({
		segments: [
			{ text: s.name.padEnd(15), style: "default" },
			{ text: "Sample Text", style: s.style }
		]
	}));

	const stylePrinter = new Printer();
	stylePrinter.print(styleLines);

	console.log("\n✨ Demo Complete!");
}
