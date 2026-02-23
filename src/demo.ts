import { printDualColumn, getDragonLines, Printer, interpolateColor, StyledLine, RESET } from "./index";

/**
 * Run this demo to visually verify terminal output:
 * bun run src/demo.ts
 */

export async function runDemo() {
	console.clear();

	// 1. Test Static Dual Column Print
	console.log("--- Static Dual Column Demo ---");
	const purple = "\x1b[38;2;167;139;250m\x1b[1m";
	const blue = "\x1b[38;2;96;165;250m";
	const green = "\x1b[38;2;52;211;153m";
	const yellow = "\x1b[38;2;251;191;36m";

	const leftContent: StyledLine[] = [
		{ segments: [{ text: "Package:", style: purple }] },
		{ segments: [{ text: "Version:", style: purple }] },
		{ segments: [{ text: "Status:", style: purple }] }
	];

	const rightContent: StyledLine[] = [
		{ segments: [{ text: "@heinrichb/console-toolkit", style: blue }] },
		{ segments: [{ text: "1.0.0", style: green }] },
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
	const gray = "\x1b[38;2;75;85;99m";

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
					{ text: `] ${i}%`, style: progressColor + "\x1b[1m" }
				]
			}
		];

		interactivePrinter.print(progressLine);
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	console.log("\n✨ Demo Complete!");
}
