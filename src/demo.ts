import { printDualColumn, getDragonLines, Printer, interpolateColor, StyledLine, RESET, hexToAnsi } from "./index";
import pkg from "../package.json";

/**
 * Run this demo to visually verify terminal output:
 * bun run src/demo.ts
 */

export async function runDemo() {
	console.clear();

	// 1. Test Static Dual Column Print
	console.log("--- Static Dual Column Demo ---");
	const purple = hexToAnsi("#A78BFA");
	const blue = hexToAnsi("#60A5FA");
	const green = hexToAnsi("#34D399");
	const yellow = hexToAnsi("#FBBF24");

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

	// 3. Test Interactive Re-rendering
	console.log("--- Interactive Re-rendering Demo ---");
	const interactivePrinter = new Printer({ interactive: true });
	const gray = hexToAnsi("#4B5563");

	for (let i = 0; i <= 100; i += 5) {
		const progressColor = interpolateColor("#3B82F6", "#10B981", i / 100);
		const barWidth = 20;
		const filled = Math.round((i / 100) * barWidth);

		const progressLine: StyledLine[] = [
			{
				segments: [
					{ text: "Download Progress: ", style: RESET },
					{ text: "[", style: gray },
					{ text: "█".repeat(filled), style: progressColor },
					{ text: "░".repeat(barWidth - filled), style: gray },
					{ text: `] ${i}%`, style: progressColor }
				]
			}
		];

		interactivePrinter.print(progressLine);
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	console.log("\n✨ Demo Complete!");
}
