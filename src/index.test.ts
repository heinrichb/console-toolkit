import { expect, test, describe, spyOn, afterEach } from "bun:test";
import {
	hexToRgb,
	rgbToHex,
	interpolateColor,
	getLineLength,
	computeMaxWidth,
	padLine,
	Printer,
	printDualColumn,
	getDragonLines,
	mergeColumns
} from "./index";

const lineA = { segments: [{ text: "Hello", style: "" }] };
const lineB = { segments: [{ text: "World!!", style: "" }] };

describe("Color Utilities", () => {
	test("hexToRgb converts correctly", () => {
		expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
		expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
	});

	test("hexToRgb throws on invalid hex", () => {
		expect(() => hexToRgb("invalid")).toThrow("Invalid hex color.");
		expect(() => hexToRgb("#FFF")).toThrow("Invalid hex color.");
	});

	test("rgbToHex converts correctly", () => {
		expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
		expect(rgbToHex(0, 0, 0)).toBe("#000000");
	});

	test("interpolateColor finds the midpoint", () => {
		const start = "#000000";
		const end = "#ffffff";
		expect(interpolateColor(start, end, 0.5)).toBe("#808080");
	});

	test("interpolateColor clamps factors", () => {
		expect(interpolateColor("#000000", "#ffffff", -1)).toBe("#000000");
		expect(interpolateColor("#000000", "#ffffff", 2)).toBe("#ffffff");
	});
});

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
		const padded = padLine(lineA, 10, "style");
		expect(getLineLength(padded)).toBe(10);
		expect(padded.segments[1].text).toBe("     ");
	});

	test("padLine does nothing if line is already wide enough", () => {
		const ignored = padLine(lineB, 5, "style");
		expect(getLineLength(ignored)).toBe(7);
		expect(ignored.segments.length).toBe(1);
	});

	test("mergeColumns handles asymmetric column lengths", () => {
		const merged = mergeColumns([lineA], [lineB, lineB], 10, " | ", "");
		expect(merged.length).toBe(2);
		expect(getLineLength(merged[1])).toBe(10 + 3 + 7);
	});
});

describe("Printer & Layout", () => {
	const stdoutSpy = spyOn(process.stdout, "write").mockImplementation(() => true);
	const logSpy = spyOn(console, "log").mockImplementation(() => {});

	afterEach(() => {
		stdoutSpy.mockClear();
		logSpy.mockClear();
	});

	test("Printer.print outputs to console", () => {
		const printer = new Printer();
		printer.print([{ segments: [{ text: "Test", style: "color: red" }] }]);
		expect(logSpy).toHaveBeenCalled();
	});

	test("Printer handles interactive clearing", () => {
		const printer = new Printer({ interactive: true });
		printer.print([{ segments: [{ text: "L1", style: "" }] }]);
		printer.print([{ segments: [{ text: "L2", style: "" }] }]);
		expect(stdoutSpy).toHaveBeenCalledWith("\x1b[1A\x1b[2K\r");
	});

	test("printDualColumn executes correctly", () => {
		printDualColumn([lineA], [lineB]);
		expect(logSpy).toHaveBeenCalled();
	});

	test("getDragonLines returns valid array", () => {
		const lines = getDragonLines();
		expect(lines.length).toBeGreaterThan(0);
		expect(getDragonLines("#FF0000", "#00FF00").length).toBe(lines.length);
	});
});
