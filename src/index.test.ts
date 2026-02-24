import { expect, test, describe, spyOn, afterEach } from "bun:test";
import {
	hexToRgb,
	rgbToAnsi,
	hexToAnsi,
	interpolateColor,
	getLineLength,
	computeMaxWidth,
	padLine,
	Printer,
	printDualColumn,
	getDragonLines,
	mergeColumns,
	resolveStyle,
	StyledLine
} from "./index";

const lineA: StyledLine = { segments: [{ text: "Hello", style: [] }] };
const lineB: StyledLine = { segments: [{ text: "World!!", style: [] }] };

describe("Color Utilities", () => {
	test("hexToRgb converts correctly", () => {
		expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
		expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
	});

	test("hexToRgb throws on invalid hex", () => {
		expect(() => hexToRgb("invalid")).toThrow("Invalid hex color.");
		expect(() => hexToRgb("#FFF")).toThrow("Invalid hex color.");
	});

	test("rgbToAnsi converts correctly", () => {
		expect(rgbToAnsi(255, 255, 255)).toBe("\x1b[38;2;255;255;255m");
		expect(rgbToAnsi(0, 0, 0)).toBe("\x1b[38;2;0;0;0m");
	});

	test("hexToAnsi converts hex string directly to ANSI", () => {
		expect(hexToAnsi("#FFFFFF")).toBe("\x1b[38;2;255;255;255m");
		expect(hexToAnsi("#000000")).toBe("\x1b[38;2;0;0;0m");
		expect(hexToAnsi("#FF0000")).toBe("\x1b[38;2;255;0;0m");
	});

	test("interpolateColor returns hex string", () => {
		const start = "#000000";
		const end = "#ffffff";

		expect(interpolateColor(start, end, 0.5)).toBe("#808080");
	});

	test("interpolateColor clamps factors", () => {
		expect(interpolateColor("#000000", "#ffffff", -1)).toBe("#000000");
		expect(interpolateColor("#000000", "#ffffff", 2)).toBe("#ffffff");
	});
});

describe("Style Resolution", () => {
	test("resolveStyle handles standard colors", () => {
		expect(resolveStyle("red")).toBe("\x1b[31m");
		expect(resolveStyle("blue")).toBe("\x1b[34m");
	});

	test("resolveStyle handles modifiers", () => {
		expect(resolveStyle("bold")).toBe("\x1b[1m");
		expect(resolveStyle("reset")).toBe("\x1b[0m");
	});

	test("resolveStyle handles hex colors", () => {
		expect(resolveStyle("#FF0000")).toBe("\x1b[38;2;255;0;0m");
	});

	test("resolveStyle handles arrays of styles", () => {
		expect(resolveStyle(["bold", "red"])).toBe("\x1b[1m\x1b[31m");
	});

	test("resolveStyle passes through raw strings", () => {
		const raw = "\x1b[31m";
		expect(resolveStyle(raw)).toBe(raw);
		expect(resolveStyle("unknown")).toBe("unknown");
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
		const padded = padLine(lineA, 10, "red");

		expect(getLineLength(padded)).toBe(10);
		expect(padded.segments[1].style).toBe("red");
		expect(padded.segments[1].text).toBe("     ");
	});

	test("padLine does nothing if line is already wide enough", () => {
		const ignored = padLine(lineB, 5, "red");

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

	afterEach(() => {
		stdoutSpy.mockClear();
	});

	test("Printer.print outputs to console with resolved styles", () => {
		const printer = new Printer();
		printer.print([{ segments: [{ text: "Test", style: "red" }] }]);

		expect(stdoutSpy).toHaveBeenCalled();

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("\x1b[31mTest");
	});

	test("Printer handles interactive clearing", () => {
		const printer = new Printer({ interactive: true });
		printer.print([{ segments: [{ text: "L1", style: "" }] }]);
		printer.print([{ segments: [{ text: "L2", style: "" }] }]);

		expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("\x1b[1A\x1b[2K\r"));
	});

	test("Printer optimizes clearing of multiple lines", () => {
		const printer = new Printer({ interactive: true });

		printer.print([
			{ segments: [{ text: "L1", style: "" }] },
			{ segments: [{ text: "L2", style: "" }] },
			{ segments: [{ text: "L3", style: "" }] }
		]);

		stdoutSpy.mockClear();

		printer.print([{ segments: [{ text: "New", style: "" }] }]);

		const clearSeq = "\x1b[1A\x1b[2K\r";
		const expectedClear = clearSeq.repeat(3);

		expect(stdoutSpy).toHaveBeenCalledTimes(1);

		const callArg = stdoutSpy.mock.calls[0][0] as string;
		expect(callArg.startsWith(expectedClear)).toBe(true);
	});

	test("printDualColumn executes correctly", () => {
		printDualColumn([lineA], [lineB]);
		expect(stdoutSpy).toHaveBeenCalled();
	});

	test("getDragonLines returns valid array", () => {
		const lines = getDragonLines();
		expect(lines.length).toBeGreaterThan(0);

		const firstSegmentStyle = lines[0].segments[0].style as string;
		expect(firstSegmentStyle.startsWith("#")).toBe(true);
	});
});
