import {
	printDualColumn,
	getDragonLines,
	Printer,
	interpolateColor,
	StyledLine,
	createProgressBar,
	Spinner,
	SPINNERS,
	HexColor
} from "./index";
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
	staticPrinter.print(dragon);
	console.log("\n");

	// 3. Test Progress Bar
	console.log("--- Interactive Progress Bar Demo ---");
	const interactiveProgressPrinter = new Printer({ interactive: true });
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

		const factor = i / 100;
		const gradientColor = getProgressBarColor(factor);

		const gradientBar = createProgressBar({
			progress: factor,
			width: 40,
			startChar: "▕",
			endChar: "▏",
			fillChar: "█",
			emptyChar: "░",
			startStyle: gradientColor,
			endStyle: gradientColor,
			fillStyle: gradientColor,
			emptyStyle: "gray",
			percentageStyle: ["bold", gradientColor]
		});

		const sharpBar = createProgressBar({
			progress: factor,
			width: 40,
			startChar: "[",
			endChar: "]",
			fillChar: "#",
			emptyChar: "-",
			style: "white",
			fillStyle: "green",
			emptyStyle: "dim"
		});

		const noStyleBar = createProgressBar({
			progress: factor,
			width: 40,
			startChar: "<",
			endChar: ">",
			fillChar: "=",
			emptyChar: " "
		});

		interactiveProgressPrinter.print([
			progressLine,
			{ segments: [] },
			{ segments: [{ text: "Gradient: ", style: "bold" }] },
			gradientBar,
			{ segments: [] },
			{ segments: [{ text: "Sharp:    ", style: "bold" }] },
			sharpBar,
			{ segments: [] },
			{ segments: [{ text: "Minimal:  ", style: "bold" }] },
			noStyleBar
		]);
		await new Promise((resolve) => setTimeout(resolve, 30));
	}
	console.log("\n");

	// 4. Spinners Demo
	console.log("--- Spinners Demo ---");
	const spinnerDots = new Spinner({ frames: SPINNERS.dots, interval: 80 });
	const spinnerLines = new Spinner({ frames: SPINNERS.lines, interval: 100 });
	const spinnerArrows = new Spinner({ frames: SPINNERS.arrows, interval: 120 });
	const spinnerCircle = new Spinner({ frames: SPINNERS.circle, interval: 150 });
	const spinnerSquare = new Spinner({ frames: SPINNERS.square, interval: 200 });

	const interactiveSpinnerPrinter = new Printer({ interactive: true });
	const startTime = Date.now();

	while (Date.now() - startTime < 3000) {
		const lines: StyledLine[] = [
			{
				segments: [
					{ text: "Dots:   ", style: "dim" },
					{ text: spinnerDots.getFrame(), style: "cyan" }
				]
			},
			{
				segments: [
					{ text: "Lines:  ", style: "dim" },
					{ text: spinnerLines.getFrame(), style: "yellow" }
				]
			},
			{
				segments: [
					{ text: "Arrows: ", style: "dim" },
					{ text: spinnerArrows.getFrame(), style: "green" }
				]
			},
			{
				segments: [
					{ text: "Circle: ", style: "dim" },
					{ text: spinnerCircle.getFrame(), style: "magenta" }
				]
			},
			{
				segments: [
					{ text: "Square: ", style: "dim" },
					{ text: spinnerSquare.getFrame(), style: "blue" }
				]
			}
		];
		interactiveSpinnerPrinter.print(lines);
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	console.log("\n");

	// 5. Style Codes Demo
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

	staticPrinter.print(styleLines);
	console.log("\n✨ Demo Complete!");
}
