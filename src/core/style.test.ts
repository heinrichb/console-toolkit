import { expect, test, describe } from "bun:test";
import {
	hexToRgb,
	rgbToAnsi,
	interpolateColor,
	resolveStyle,
	resolveColorToAnsi,
	resolveModifiersToAnsi,
	getGradientColor,
	mergeStyles
} from "./style";
import { PrintStyle, Color } from "./types";

const ESC = "\x1b";

describe("Color Utilities", () => {
	test("hexToRgb converts correctly", () => {
		expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
		expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
	});

	test("hexToRgb handles invalid hex gracefully", () => {
		expect(hexToRgb("invalid")).toEqual({ r: 255, g: 255, b: 255 }); // Fallback
		expect(hexToRgb("#FFF")).toEqual({ r: 255, g: 255, b: 255 }); // Fallback
	});

	test("rgbToAnsi converts correctly", () => {
		expect(rgbToAnsi(255, 255, 255)).toBe(`${ESC}[38;2;255;255;255m`);
		expect(rgbToAnsi(0, 0, 0)).toBe(`${ESC}[38;2;0;0;0m`);
	});

	test("resolveColorToAnsi converts hex and standard colors", () => {
		expect(resolveColorToAnsi("#FFFFFF")).toBe(`${ESC}[38;2;255;255;255m`);
		expect(resolveColorToAnsi("red")).toBe(`${ESC}[38;2;239;68;68m`); // Updated to Tailwind value
	});

	test("interpolateColor returns hex string for hex inputs", () => {
		const start = "#000000";
		const end = "#ffffff";
		expect(interpolateColor(start, end, 0.5)).toBe("#808080");
	});

	test("interpolateColor handles standard color names", () => {
		expect(interpolateColor("black", "white", 0.5)).toBe("#808080");
	});

	test("interpolateColor clamps factors", () => {
		expect(interpolateColor("#000000", "#ffffff", -1)).toBe("#000000");
		expect(interpolateColor("#000000", "#ffffff", 2)).toBe("#ffffff");
	});
});

describe("Style Resolution", () => {
	test("resolveModifiersToAnsi handles modifiers", () => {
		expect(resolveModifiersToAnsi(["bold"])).toBe(`${ESC}[1m`);
		expect(resolveModifiersToAnsi(["bold", "italic"])).toBe(`${ESC}[1m${ESC}[3m`);
		expect(resolveModifiersToAnsi([])).toBe("");
	});

	test("resolveStyle handles modifiers only", () => {
		expect(resolveStyle({ modifiers: ["bold"] })).toBe(`${ESC}[1m`);
	});

	test("resolveStyle handles solid color", () => {
		const style: PrintStyle = { color: "#FF0000" };
		expect(resolveStyle(style)).toBe(`${ESC}[38;2;255;0;0m`);
	});

	test("resolveStyle handles modifiers and solid color", () => {
		const style: PrintStyle = { modifiers: ["bold"], color: "#FF0000" };
		expect(resolveStyle(style)).toBe(`${ESC}[1m${ESC}[38;2;255;0;0m`);
	});

	test("resolveStyle handles gradient (uses factor 0 by default)", () => {
		const colors: Color[] = ["#000000", "#FFFFFF"];
		const style: PrintStyle = { color: colors };
		expect(resolveStyle(style)).toBe(`${ESC}[38;2;0;0;0m`); // Factor 0 is black
	});

	test("resolveStyle handles gradient with explicit factor", () => {
		const colors: Color[] = ["#000000", "#FFFFFF"];
		const style: PrintStyle = { color: colors };
		expect(resolveStyle(style, 1)).toBe(`${ESC}[38;2;255;255;255m`); // Factor 1 is white
	});
});

describe("Gradient Utilities", () => {
	test("getGradientColor handles 2 colors", () => {
		const colors: Color[] = ["#000000", "#FFFFFF"];
		expect(getGradientColor(colors, 0)).toBe(`${ESC}[38;2;0;0;0m`);
		expect(getGradientColor(colors, 0.5)).toBe(`${ESC}[38;2;128;128;128m`);
		expect(getGradientColor(colors, 1)).toBe(`${ESC}[38;2;255;255;255m`);
	});

	test("getGradientColor handles 3 colors", () => {
		const colors: Color[] = ["#000000", "#808080", "#FFFFFF"];
		// 0 -> black
		expect(getGradientColor(colors, 0)).toBe(`${ESC}[38;2;0;0;0m`);
		// 0.5 -> middle color (gray)
		expect(getGradientColor(colors, 0.5)).toBe(`${ESC}[38;2;128;128;128m`);
		// 1 -> white
		expect(getGradientColor(colors, 1)).toBe(`${ESC}[38;2;255;255;255m`);
		// 0.25 -> between black and gray
		expect(getGradientColor(colors, 0.25)).toBe(`${ESC}[38;2;64;64;64m`);
	});
});

describe("Style Merging", () => {
	test("mergeStyles combines modifiers", () => {
		const p: PrintStyle = { modifiers: ["bold"] };
		const c: PrintStyle = { modifiers: ["italic"] };
		const merged = mergeStyles(p, c);
		expect(merged.modifiers).toContain("bold");
		expect(merged.modifiers).toContain("italic");
	});

	test("mergeStyles overrides color (Child wins)", () => {
		const p: PrintStyle = { color: "red" };
		const c: PrintStyle = { color: "blue" };
		const merged = mergeStyles(p, c);
		expect(merged.color).toBe("blue");
	});

	test("mergeStyles inherits parent color if child has none", () => {
		const p: PrintStyle = { color: "red" };
		const c: PrintStyle = { modifiers: ["bold"] };
		const merged = mergeStyles(p, c);
		expect(merged.color).toBe("red");
		expect(merged.modifiers).toContain("bold");
	});

	test("mergeStyles handles null/undefined inputs", () => {
		const p: PrintStyle = { color: "red" };
		expect(mergeStyles(p, undefined)).toEqual(p);
		expect(mergeStyles(undefined, p)).toEqual(p);
		expect(mergeStyles(undefined, undefined)).toEqual({});
	});
});
