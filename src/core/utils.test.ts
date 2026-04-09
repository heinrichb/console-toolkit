import { expect, test, describe } from "bun:test";
import { getLineLength, computeMaxWidth, padLine, stripAnsi } from "./utils";
import { resolveColorToAnsi, RESET } from "./style";
import { line, segment } from "./builders";

const lineA = line([segment("Hello")]);
const lineB = line([segment("World!!")]);

describe("Line Utilities", () => {
	test("getLineLength calculates correctly", () => {
		expect(getLineLength(lineA)).toBe(5);
		expect(getLineLength(lineB)).toBe(7);
	});

	test("computeMaxWidth finds the longest line", () => {
		expect(computeMaxWidth([lineA, lineB])).toBe(7);
		expect(computeMaxWidth([])).toBe(0);
	});

	test("padLine adds padding when needed", () => {
		const padded = padLine(lineA, 10, { color: "red" });

		expect(getLineLength(padded)).toBe(10);
		expect(padded.segments[1].style).toEqual({ color: "red" });
		expect(padded.segments[1].text).toBe("     ");
	});

	test("padLine does nothing if line is already wide enough", () => {
		const ignored = padLine(lineB, 5, { color: "red" });

		expect(getLineLength(ignored)).toBe(7);
		expect(ignored.segments.length).toBe(1);
	});
});

describe("stripAnsi", () => {
	test("strips foreground color codes", () => {
		expect(stripAnsi("\x1b[38;2;255;0;0mHello\x1b[0m")).toBe("Hello");
	});

	test("strips modifier codes", () => {
		expect(stripAnsi("\x1b[1m\x1b[3mBold Italic\x1b[0m")).toBe("Bold Italic");
	});

	test("handles text with no ANSI codes", () => {
		expect(stripAnsi("plain text")).toBe("plain text");
	});

	test("handles empty string", () => {
		expect(stripAnsi("")).toBe("");
	});

	test("strips multiple color sequences in one string", () => {
		const styled = `${resolveColorToAnsi("red")}Red${RESET} and ${resolveColorToAnsi("blue")}Blue${RESET}`;
		expect(stripAnsi(styled)).toBe("Red and Blue");
	});
});
