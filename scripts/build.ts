import { rm } from "node:fs/promises";

console.log("Building...");

// 1. Clean dist
console.log("Cleaning dist...");
await rm("dist", { recursive: true, force: true });

// 2. Build Readable ESM
console.log("Building readable ESM...");
const result = await Bun.build({
	entrypoints: ["src/index.ts"],
	outdir: "dist",
	target: "node",
	format: "esm",
	minify: false,
	sourcemap: "none",
	// naming: "[dir]/[name].js" // default
});

if (!result.success) {
	console.error("Build failed:", result.logs);
	process.exit(1);
}

// 3. Build Minified ESM
console.log("Building minified ESM...");
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
	console.error("Minified build failed:", minResult.logs);
	process.exit(1);
}

// 4. Generate Types
console.log("Generating types...");
const tsc = Bun.spawn(["bun", "x", "tsc", "-p", "tsconfig.build.json", "--emitDeclarationOnly", "--outDir", "dist"], {
	stdout: "inherit",
	stderr: "inherit",
});

const exitCode = await tsc.exited;

if (exitCode !== 0) {
	console.error(`Type generation failed with exit code ${exitCode}`);
	process.exit(exitCode);
}

console.log("Build complete!");
