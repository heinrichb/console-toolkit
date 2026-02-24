import { expect, test, describe } from "bun:test";
import { getLineLength, computeMaxWidth, padLine } from "./utils";
import { PrintLine } from "./types";

const lineA: PrintLine = { segments: [{ text: "Hello", style: {} }] };
const lineB: PrintLine = { segments: [{ text: "World!!", style: {} }] };

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
