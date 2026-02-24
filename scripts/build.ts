import { rm } from "node:fs/promises";
import { Printer, createProgressBar, getDragon, mergeColumns, Spinner, SPINNERS, printColumns } from "../src/index";
import { PrintLine, PrintStyle } from "../src/core/types";

// Setup Printer
const printer = new Printer({ live: true });
const spinner = new Spinner({ frames: SPINNERS.dots, interval: 80 });

const stepStyle: PrintStyle = { color: "#3B82F6", modifiers: ["bold"] }; // Blue
const successStyle: PrintStyle = { color: "#10B981", modifiers: ["bold"] }; // Green
const errorStyle: PrintStyle = { color: "#EF4444", modifiers: ["bold"] }; // Red
const dimStyle: PrintStyle = { color: "#9CA3AF", modifiers: ["dim"] }; // Gray
const borderStyle: PrintStyle = { color: "#6366F1" }; // Indigo
const titleStyle: PrintStyle = { color: ["#3B82F6", "#8B5CF6"], modifiers: ["bold", "underline"] };

const steps = [
	{ name: "Cleaning dist...", action: cleanDist },
	{ name: "Building readable ESM...", action: buildReadable },
	{ name: "Building minified ESM...", action: buildMinified },
	{ name: "Generating types...", action: generateTypes }
];

const dragon = getDragon();

async function main() {
	printer.clear();
	const startTime = performance.now();

	for (let i = 0; i < steps.length; i++) {
		const step = steps[i];
		const progressStart = i / steps.length;
		const progressEnd = (i + 1) / steps.length;

		// Start step execution
		const stepPromise = step.action();

		// Animate spinner while waiting
		let isStepComplete = false;
		const animationLoop = (async () => {
			while (!isStepComplete) {
				updateDisplay(step.name, progressStart, "running");
				await new Promise((resolve) => setTimeout(resolve, 80));
			}
		})();

		try {
			await stepPromise;
			isStepComplete = true;
			await animationLoop; // Ensure loop finishes

			// Show success state briefly
			updateDisplay(step.name, progressEnd, "success");
			await new Promise((r) => setTimeout(r, 100));
		} catch (error) {
			isStepComplete = true;
			updateDisplay(step.name, progressStart, "error");
			console.error("\n");
			console.error(error);
			process.exit(1);
		}
	}

	const endTime = performance.now();
	const duration = ((endTime - startTime) / 1000).toFixed(2);

	const successLine: PrintLine = {
		segments: [
			{ text: "\n✨ Build completed successfully in ", style: successStyle },
			{ text: `${duration}s`, style: { color: "#FBBF24", modifiers: ["bold"] } },
			{ text: "!", style: successStyle }
		]
	};

	const leftCol = getLeftColumn(null, 1, "success");
	leftCol.push(successLine);

	printColumns([leftCol, dragon], { separator: "         ", printer });
}

function getLeftColumn(currentStepName: string | null, progress: number, status: "running" | "success" | "error") {
	const titleLine: PrintLine = {
		segments: [
			{ text: "📦 ", style: { modifiers: ["bold"] } },
			{ text: "Console Toolkit Build Process", style: titleStyle }
		]
	};

	const separator: PrintLine = {
		segments: [{ text: "─".repeat(50), style: borderStyle }]
	};

	const lines: PrintLine[] = [titleLine, separator, { segments: [] }];

	const completedSteps = currentStepName
		? steps.filter((_, idx) => idx < steps.findIndex((s) => s.name === currentStepName))
		: steps;

	completedSteps.forEach((s) => {
		lines.push({
			segments: [
				{ text: "✔ ", style: successStyle },
				{ text: s.name, style: dimStyle }
			]
		});
	});

	const progressBarWidth = 30;
	if (currentStepName && status !== "success") {
		const progressBar = createProgressBar({
			progress,
			width: progressBarWidth,
			startChar: "▕",
			endChar: "▏",
			fillChar: "█",
			emptyChar: "░",
			startStyle: borderStyle,
			endStyle: borderStyle,
			fillStyle: { color: ["#3B82F6", "#8B5CF6"] },
			emptyStyle: dimStyle,
			percentageStyle: { color: "#60A5FA" }
		});

		const statusIcon = status === "running" ? spinner.getFrame() : "✖";
		const statusColor = status === "running" ? stepStyle : errorStyle;

		lines.push({
			segments: [
				{ text: `${statusIcon} `, style: statusColor },
				{ text: currentStepName.padEnd(25), style: { modifiers: ["bold"] } },
				...progressBar.segments
			]
		});
	} else if (currentStepName && status === "success") {
		lines.push({
			segments: [
				{ text: "✔ ", style: successStyle },
				{ text: currentStepName, style: dimStyle }
			]
		});
	}

	return lines;
}

function updateDisplay(currentStepName: string, progress: number, status: "running" | "success" | "error") {
	const leftCol = getLeftColumn(currentStepName, progress, status);

	const merged = mergeColumns([leftCol, dragon], "    ", undefined);

	printer.print({
		lines: merged
	});
}

async function cleanDist() {
	await rm("dist", { recursive: true, force: true });
}

async function buildReadable() {
	const result = await Bun.build({
		entrypoints: ["src/index.ts"],
		outdir: "dist",
		target: "node",
		format: "esm",
		minify: false,
		sourcemap: "none"
	});

	if (!result.success) {
		throw new Error(`Build failed: ${result.logs.join("\n")}`);
	}
}

async function buildMinified() {
	const minResult = await Bun.build({
		entrypoints: ["src/index.ts"],
		outdir: "dist",
		target: "node",
		format: "esm",
		minify: true,
		naming: "[dir]/[name].min.js",
		sourcemap: "none"
	});

	if (!minResult.success) {
		throw new Error(`Minified build failed: ${minResult.logs.join("\n")}`);
	}
}

async function generateTypes() {
	const tsc = Bun.spawn(["bun", "x", "tsc", "-p", "tsconfig.build.json", "--emitDeclarationOnly", "--outDir", "dist"], {
		stdout: "pipe",
		stderr: "pipe"
	});

	const exitCode = await tsc.exited;

	if (exitCode !== 0) {
		const stderr = await new Response(tsc.stderr).text();
		throw new Error(`Type generation failed:\n${stderr}`);
	}
}

await main();
