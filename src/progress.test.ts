import { expect, test, describe } from "bun:test";
import { createProgressBar } from "./progress";
import { StyledLine } from "./index";

// Helper to extract text from a line
function getText(line: StyledLine): string {
	return line.segments.map((s) => s.text).join("");
}

describe("createProgressBar", () => {
	test("generates a default progress bar at 0%", () => {
		const line = createProgressBar({ progress: 0 });
		const text = getText(line);
		// Default width 20?
		// [ + 20 chars + ] + space + 0%
		// Let's assume default width is 20.
		expect(text).toContain("[");
		expect(text).toContain("]");
		expect(text).toContain("0%");
		// Check that it has empty chars
		expect(text).toContain("░");
	});

	test("generates a default progress bar at 50%", () => {
		const line = createProgressBar({ progress: 0.5 });
		const text = getText(line);
		expect(text).toContain("50%");
		// Should have some filled and some empty
		expect(text).toContain("█");
		expect(text).toContain("░");
	});

	test("generates a default progress bar at 100%", () => {
		const line = createProgressBar({ progress: 1.0 });
		const text = getText(line);
		expect(text).toContain("100%");
		expect(text).not.toContain("░");
	});

	test("allows custom width", () => {
		const width = 10;
		const line = createProgressBar({ progress: 0.5, width });
		// 5 filled, 5 empty
		const segments = line.segments;
		const filled = segments.find((s) => s.text.includes("█"));
		const empty = segments.find((s) => s.text.includes("░"));
		expect(filled?.text.length).toBe(5);
		expect(empty?.text.length).toBe(5);
	});

	test("applies styles correctly", () => {
		const line = createProgressBar({
			progress: 0.5,
			style: "blue",
			bracketStyle: "red",
			barStyle: "green",
			percentageStyle: "yellow"
		});

		// Segments: start, filled, empty, end, space?, percentage
		const start = line.segments.find((s) => s.text === "[");
		const filled = line.segments.find((s) => s.text.includes("█"));
		const end = line.segments.find((s) => s.text === "]");
		const percentage = line.segments.find((s) => s.text.includes("%"));

		expect(start?.style).toBe("red");
		expect(filled?.style).toBe("green");
		expect(end?.style).toBe("red");
		expect(percentage?.style).toBe("yellow");
	});

	test("cascades styles (general style -> specific)", () => {
		const line = createProgressBar({
			progress: 0.5,
			style: "blue"
			// No specific styles
		});

		// All should be blue
		line.segments.forEach((s) => {
			if (s.text.trim().length > 0) {
				expect(s.style).toBe("blue");
			}
		});
	});

	test("allows custom characters", () => {
		const line = createProgressBar({
			progress: 0.5,
			startChar: "<",
			endChar: ">",
			fillChar: "=",
			emptyChar: "-"
		});
		const text = getText(line);
		expect(text).toContain("<");
		expect(text).toContain(">");
		expect(text).toContain("=");
		expect(text).toContain("-");
	});

	test("hides percentage", () => {
		const line = createProgressBar({
			progress: 0.5,
			showPercentage: false
		});
		const text = getText(line);
		expect(text).not.toContain("%");
	});

	test("formats percentage custom", () => {
		const line = createProgressBar({
			progress: 0.5,
			formatPercentage: (p) => `${p * 10}/10`
		});
		const text = getText(line);
		expect(text).toContain("5/10");
	});

	test("clamping progress", () => {
		const lineLow = createProgressBar({ progress: -0.1 });
		expect(getText(lineLow)).toContain("0%");

		const lineHigh = createProgressBar({ progress: 1.1 });
		expect(getText(lineHigh)).toContain("100%");
	});
});
