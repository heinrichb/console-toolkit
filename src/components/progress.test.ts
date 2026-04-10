import { expect, test, describe } from "bun:test";
import { createProgressBar } from "./progress";
import { PrintStyle } from "../core/types";

describe("createProgressBar", () => {
	test("generates a default progress bar at 0%", () => {
		const result = createProgressBar({ progress: 0 });

		// Default format: [░░░░░░░░░░░░░░░░░░░░] 0%
		expect(result.segments.length).toBeGreaterThan(0);
		const fullText = result.segments.map((s) => s.text).join("");
		expect(fullText).toContain("[");
		expect(fullText).toContain("]");
		expect(fullText).toContain("0%");
		// Should not contain empty char
		expect(fullText).toContain("░");
	});

	test("generates a default progress bar at 50%", () => {
		const result = createProgressBar({ progress: 0.5, width: 10 });

		// But wait, width default 20. 100% means 20 filled. 0 empty.
		// 50% of 10 is 5.
		// [█████░░░░░] 50%
		const fullText = result.segments.map((s) => s.text).join("");
		expect(fullText).toContain("█████");
		expect(fullText).toContain("░░░░░");
	});

	test("generates a default progress bar at 100%", () => {
		const result = createProgressBar({ progress: 1 });
		const fullText = result.segments.map((s) => s.text).join("");
		expect(fullText).not.toContain("░"); // No empty chars
		expect(fullText).toContain("100%");
	});

	test("allows custom width", () => {
		const result = createProgressBar({ progress: 0.5, width: 4 });
		// 50% of 4 = 2 filled, 2 empty
		const fullText = result.segments.map((s) => s.text).join("");
		expect(fullText).toContain("██░░");
	});

	test("applies styles correctly", () => {
		const style: PrintStyle = { color: "red" };
		const result = createProgressBar({ progress: 0.5, style });

		// All segments should inherit style unless overridden?
		// createProgressBar implementation: bracketStyle ?? style
		result.segments.forEach((seg) => {
			expect(seg.style).toEqual(style);
		});
	});

	test("cascades styles (general style -> specific)", () => {
		const baseStyle: PrintStyle = { color: "blue" };
		const fillStyle: PrintStyle = { color: "green" };
		const result = createProgressBar({ progress: 0.5, style: baseStyle, fillStyle });

		// Find filled segment (usually index 1 if bracket exists)
		const filledSeg = result.segments.find((s) => s.text.includes("█"));
		expect(filledSeg?.style).toEqual(fillStyle);

		const bracketSeg = result.segments.find((s) => s.text.includes("["));
		expect(bracketSeg?.style).toEqual(baseStyle);
	});

	test("allows custom characters", () => {
		const result = createProgressBar({
			progress: 0.5,
			startChar: "<",
			endChar: ">",
			fillChar: "=",
			emptyChar: "-"
		});
		const fullText = result.segments.map((s) => s.text).join("");
		expect(fullText).toContain("<");
		expect(fullText).toContain("=");
		expect(fullText).toContain("-");
		expect(fullText).toContain(">");
	});

	test("hides percentage", () => {
		const result = createProgressBar({ progress: 0.5, showPercentage: false });
		const fullText = result.segments.map((s) => s.text).join("");
		expect(fullText).not.toContain("%");
	});

	test("formats percentage custom", () => {
		const result = createProgressBar({
			progress: 0.5,
			formatPercentage: (p) => ` ${(p * 100).toFixed(1)} pct`
		});
		const fullText = result.segments.map((s) => s.text).join("");
		expect(fullText).toContain(" 50.0 pct");
	});

	test("clamping progress", () => {
		const resultLow = createProgressBar({ progress: -1 });
		expect(resultLow.segments.map((s) => s.text).join("")).toContain("0%");

		const resultHigh = createProgressBar({ progress: 2 });
		expect(resultHigh.segments.map((s) => s.text).join("")).toContain("100%");
	});

	test("applies completeStyle and completeChar when progress >= 1", () => {
		const completeStyle: PrintStyle = { color: "green" };
		const completeChar = "✔";

		// Not complete
		const resultIncomplete = createProgressBar({ progress: 0.5, completeStyle, completeChar });
		const fullTextIncomplete = resultIncomplete.segments.map((s) => s.text).join("");
		expect(fullTextIncomplete).not.toContain("✔");

		const filledSegIncomplete = resultIncomplete.segments.find((s) => s.text.includes("█"));
		expect(filledSegIncomplete?.style).not.toEqual(completeStyle);

		// Complete
		const resultComplete = createProgressBar({ progress: 1, completeStyle, completeChar });
		const fullTextComplete = resultComplete.segments.map((s) => s.text).join("");
		expect(fullTextComplete).toContain("✔");

		const filledSegComplete = resultComplete.segments.find((s) => s.text.includes("✔"));
		expect(filledSegComplete?.style).toEqual(completeStyle);
	});
});
