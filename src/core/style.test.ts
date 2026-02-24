import { expect, test, describe } from "bun:test";
import { hexToRgb, rgbToAnsi, hexToAnsi, interpolateColor, resolveStyle } from "./style";

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
	});

	test("resolveStyle handles hex colors", () => {
		expect(resolveStyle("#FF0000")).toBe("\x1b[38;2;255;0;0m");
	});

	test("resolveStyle handles arrays of styles", () => {
		expect(resolveStyle(["bold", "red"])).toBe("\x1b[1m\x1b[31m");
	});

	test("resolveStyle handles undefined style", () => {
		expect(resolveStyle(undefined)).toBe("");
	});

	test("resolveStyle passes through raw strings", () => {
		const raw = "\x1b[31m";
		expect(resolveStyle(raw)).toBe(raw);
		expect(resolveStyle("unknown")).toBe("unknown");
	});

	test("resolveStyle gracefully handles invalid hex strings", () => {
		// This should trigger the try/catch block in resolveStyle
		expect(resolveStyle("#ZZZ")).toBe("");
		expect(resolveStyle("#1234567")).toBe("");
	});
});
