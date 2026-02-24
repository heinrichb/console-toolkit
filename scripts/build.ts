import { rm } from "node:fs/promises";
import { Printer, createProgressBar } from "../src/index";
import { PrintStyle } from "../src/core/types";

// Setup Printer
const printer = new Printer({ live: true });

const stepStyle: PrintStyle = { color: "#3B82F6", modifiers: ["bold"] }; // Blue
const successStyle: PrintStyle = { color: "#10B981", modifiers: ["bold"] }; // Green
const errorStyle: PrintStyle = { color: "#EF4444", modifiers: ["bold"] }; // Red
const dimStyle: PrintStyle = { color: "#9CA3AF", modifiers: ["dim"] }; // Gray
const borderStyle: PrintStyle = { color: "#6366F1" }; // Indigo

const steps = [
	{ name: "Cleaning dist...", action: cleanDist },
	{ name: "Building readable ESM...", action: buildReadable },
	{ name: "Building minified ESM...", action: buildMinified },
	{ name: "Generating types...", action: generateTypes }
];

async function main() {
	console.clear();

	// Title
	const titleLine = {
		segments: [
			{ text: "📦 ", style: { modifiers: ["bold"] } },
			{ text: "Console Toolkit Build Process", style: { color: ["#3B82F6", "#8B5CF6"], modifiers: ["bold", "underline"] } }
		]
	};

	const separator = {
		segments: [{ text: "─".repeat(50), style: borderStyle }]
	};

	printer.print({ lines: [titleLine, separator, { segments: [] }] });

	const startTime = performance.now();

	for (let i = 0; i < steps.length; i++) {
		const step = steps[i];
		const progress = (i) / steps.length;

		// Update Progress
		updateDisplay(step.name, progress, "running");

		try {
			await step.action();
			updateDisplay(step.name, (i + 1) / steps.length, "success");
			// Small delay for visual effect
			await new Promise(r => setTimeout(r, 100));
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
	const successLine = {
		segments: [
			{ text: "\n✨ Build completed successfully in ", style: successStyle },
			{ text: `${duration}s`, style: { color: "#FBBF24", modifiers: ["bold"] } },
			{ text: "!", style: successStyle }
		]
	};

	printer.print({
		lines: [
			titleLine,
			separator,
			{ segments: [] },
			...steps.map(s => ({
				segments: [
					{ text: "✔ ", style: successStyle },
					{ text: s.name, style: dimStyle }
				]
			})),
			successLine
		]
	});
	console.log(""); // New line at end
}

function updateDisplay(currentStepName: string, progress: number, status: "running" | "success" | "error") {
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

	const statusIcon = status === "running" ? "⏳" : status === "success" ? "✔" : "✖";
	const statusColor = status === "running" ? stepStyle : status === "success" ? successStyle : errorStyle;

	const statusLine = {
		segments: [
			{ text: `${statusIcon} `, style: statusColor },
			{ text: currentStepName.padEnd(25), style: status === "running" ? { modifiers: ["bold"] } : dimStyle },
			...progressBar.segments
		]
	};

	// We reprint the completed steps above the current one
	const completedLines = steps
		.filter((_, idx) => idx < steps.findIndex(s => s.name === currentStepName))
		.map(s => ({
			segments: [
				{ text: "✔ ", style: successStyle },
				{ text: s.name, style: dimStyle }
			]
		}));

	const titleLine = {
		segments: [
			{ text: "📦 ", style: { modifiers: ["bold"] } },
			{ text: "Console Toolkit Build Process", style: { color: ["#3B82F6", "#8B5CF6"], modifiers: ["bold", "underline"] } }
		]
	};

	const separator = {
		segments: [{ text: "─".repeat(50), style: borderStyle }]
	};

	printer.print({
		lines: [
			titleLine,
			separator,
			{ segments: [] },
			...completedLines,
			statusLine
		]
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
		sourcemap: "none",
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
		sourcemap: "none",
	});

	if (!minResult.success) {
		throw new Error(`Minified build failed: ${minResult.logs.join("\n")}`);
	}
}

async function generateTypes() {
	const tsc = Bun.spawn(["bun", "x", "tsc", "-p", "tsconfig.build.json", "--emitDeclarationOnly", "--outDir", "dist"], {
		stdout: "pipe",
		stderr: "pipe",
	});

	const exitCode = await tsc.exited;

	if (exitCode !== 0) {
		const stderr = await new Response(tsc.stderr).text();
		throw new Error(`Type generation failed:\n${stderr}`);
	}
}

await main();
