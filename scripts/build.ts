import { rm } from "node:fs/promises";
import { Printer, createProgressBar, getDragon, mergeColumns } from "../src/index";
import { PrintLine, PrintStyle } from "../src/core/types";

// Setup Printer
const printer = new Printer({ live: true });

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

const dragonLines = getDragon("#EF4444", "#FDE047");

async function main() {
	console.clear();
	const startTime = performance.now();

	for (let i = 0; i < steps.length; i++) {
		const step = steps[i];
		const progress = i / steps.length;

		// Update Progress
		updateDisplay(step.name, progress, "running");

		try {
			await step.action();
			updateDisplay(step.name, (i + 1) / steps.length, "success");
			// Small delay for visual effect
			await new Promise((r) => setTimeout(r, 100));
		} catch (error) {
			updateDisplay(step.name, progress, "error");
			console.error("\n");
			console.error(error);
			process.exit(1);
		}
	}

	const endTime = performance.now();
	const duration = ((endTime - startTime) / 1000).toFixed(2);

	// Final Success Message
	const successLine: PrintLine = {
		segments: [
			{ text: "\n✨ Build completed successfully in ", style: successStyle },
			{ text: `${duration}s`, style: { color: "#FBBF24", modifiers: ["bold"] } },
			{ text: "!", style: successStyle }
		]
	};

	// Final display with success message (appended to the left column)
	const leftCol = getLeftColumn(null, 1, "success");
	leftCol.push(successLine);

	const merged = mergeColumns([leftCol, dragonLines], "    ", undefined);

	printer.print({
		lines: merged
	});
	console.log(""); // New line at end
}

function getLeftColumn(currentStepName: string | null, progress: number, status: "running" | "success" | "error"): PrintLine[] {
	const titleLine: PrintLine = {
		segments: [
			{ text: "📦 ", style: { modifiers: ["bold"] } },
			{ text: "Console Toolkit Build Process", style: titleStyle }
		]
	};

	const separator = {
		segments: [{ text: "─".repeat(50), style: borderStyle }]
	};

	const lines: PrintLine[] = [titleLine, separator, { segments: [] }];

	// Completed steps
	const completedSteps = currentStepName
		? steps.filter((_, idx) => idx < steps.findIndex((s) => s.name === currentStepName))
		: steps; // If currentStepName is null (finished), all are completed

	completedSteps.forEach((s) => {
		lines.push({
			segments: [
				{ text: "✔ ", style: successStyle },
				{ text: s.name, style: dimStyle }
			]
		});
	});

	// Current step (if any)
	if (currentStepName && status !== "success") {
		const progressBar = createProgressBar({
			progress,
			width: 30,
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

		const statusIcon = status === "running" ? "⏳" : "✖";
		const statusColor = status === "running" ? stepStyle : errorStyle;

		lines.push({
			segments: [
				{ text: `${statusIcon} `, style: statusColor },
				{ text: currentStepName.padEnd(25), style: { modifiers: ["bold"] } },
				...progressBar.segments
			]
		});
	} else if (currentStepName && status === "success") {
		// Just marked as success, waiting for next loop to move it to completed
		// But in our loop logic, we call updateDisplay("step", 1, "success") after finishing.
		// So we should display it as completed here or just let the "completedSteps" logic handle it?
		// Actually, if we pass "success", we usually want to show it as done.
		// However, our loop logic is: update(running) -> await -> update(success) -> next loop.

		// To keep it simple, if status is success, we treat it as completed in the UI.
		// The `completedSteps` filter above excludes the current one. So we add it here manually if needed.

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

	// Merge left column with dragon
	// We might need to pad the left column if it's shorter than the dragon to keep the dragon stable
	const merged = mergeColumns([leftCol, dragonLines], "    ", undefined);

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
