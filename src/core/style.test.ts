import { expect, test, describe } from "bun:test";
import {
	colorToHex,
	hexToRgb,
	rgbToAnsi,
	resolveColorToAnsi,
	resolveColorToRgb,
	resolveModifiersToAnsi,
	resolveStyle,
	mergeStyles,
	interpolateColor,
	getGradientColor
} from "./style";
import { Color, PrintStyle } from "./types";

const ESC = "\x1b";

describe("Color Utilities", () => {
	test("hexToRgb converts correctly", () => {
		expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
		expect(hexToRgb("#00FF00")).toEqual({ r: 0, g: 255, b: 0 });
		expect(hexToRgb("#0000FF")).toEqual({ r: 0, g: 0, b: 255 });
	});

	test("hexToRgb handles invalid hex gracefully", () => {
		expect(hexToRgb("invalid")).toEqual({ r: 255, g: 255, b: 255 }); // Fallback
		expect(hexToRgb("#FFF")).toEqual({ r: 255, g: 255, b: 255 }); // Fallback
	});

	test("rgbToAnsi converts correctly", () => {
		expect(rgbToAnsi(255, 0, 0)).toBe(`${ESC}[38;2;255;0;0m`);
	});

	test("resolveColorToAnsi converts hex and standard colors", () => {
		expect(resolveColorToAnsi("#000000")).toBe(`${ESC}[38;2;0;0;0m`);
		expect(resolveColorToAnsi("red")).toBe(`${ESC}[38;2;239;68;68m`); // Updated to Tailwind value
	});

	test("resolveColorToRgb converts color to RGB object", () => {
		expect(resolveColorToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
		expect(resolveColorToRgb("green")).toEqual({ r: 16, g: 185, b: 129 }); // Tailwind value
	});

	test("interpolateColor returns hex string for hex inputs", () => {
		expect(interpolateColor("#000000", "#FFFFFF", 0.5)).toBe("#808080");
	});

	test("interpolateColor handles standard color names", () => {
		expect(interpolateColor("black", "white", 0.5)).toBe("#808080");
	});

	test("interpolateColor clamps factors", () => {
		expect(interpolateColor("black", "white", -1)).toBe("#000000");
		expect(interpolateColor("black", "white", 2)).toBe("#ffffff");
	});
});

describe("Style Resolution", () => {
	test("resolveModifiersToAnsi handles modifiers", () => {
		expect(resolveModifiersToAnsi(["bold", "underline"])).toBe(`${ESC}[1m${ESC}[4m`);
	});

	test("resolveStyle handles modifiers only", () => {
		const style: PrintStyle = { modifiers: ["dim"] };
		expect(resolveStyle(style)).toBe(`${ESC}[2m`);
	});

	test("resolveStyle handles solid color", () => {
		const style: PrintStyle = { color: "blue" };
		expect(resolveStyle(style)).toContain("38;2;");
	});

	test("resolveStyle handles modifiers and solid color", () => {
		const style: PrintStyle = { modifiers: ["bold"], color: "red" };
		expect(resolveStyle(style)).toContain(`${ESC}[1m`);
		expect(resolveStyle(style)).toContain("38;2;");
	});

	test("resolveStyle handles gradient (uses factor 0 by default)", () => {
		const style: PrintStyle = { color: ["#000000", "#FFFFFF"] };
		expect(resolveStyle(style)).toBe(`${ESC}[38;2;0;0;0m`); // Factor 0 is black
	});

	test("resolveStyle handles gradient with explicit factor", () => {
		const style: PrintStyle = { color: ["#000000", "#FFFFFF"] };
		expect(resolveStyle(style, 1)).toBe(`${ESC}[38;2;255;255;255m`); // Factor 1 is white
	});
});

describe("Gradient Utilities", () => {
	test("getGradientColor handles 2 colors", () => {
		const colors: Color[] = ["#000000", "#FFFFFF"];
		// 0 -> black
		// 0.5 -> middle color (gray)
		// 1 -> white
		expect(getGradientColor(colors, 0)).toBe(`${ESC}[38;2;0;0;0m`);
		expect(getGradientColor(colors, 0.5)).toBe(`${ESC}[38;2;128;128;128m`);
		expect(getGradientColor(colors, 1)).toBe(`${ESC}[38;2;255;255;255m`);
	});

	test("getGradientColor handles 3 colors", () => {
		const colors: Color[] = ["#000000", "#808080", "#FFFFFF"];
		// 0 -> black
		// 0.5 -> middle color (gray)
		// 1 -> white
		// 0.25 -> between black and gray
		expect(getGradientColor(colors, 0)).toBe(`${ESC}[38;2;0;0;0m`);
		expect(getGradientColor(colors, 0.5)).toBe(`${ESC}[38;2;128;128;128m`);
		expect(getGradientColor(colors, 1)).toBe(`${ESC}[38;2;255;255;255m`);
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
	});

	test("mergeStyles handles null/undefined inputs", () => {
		const p: PrintStyle = { color: "red" };
		expect(mergeStyles(p, undefined)).toEqual(p);
		expect(mergeStyles(undefined, p)).toEqual(p);
		expect(mergeStyles(undefined, undefined)).toEqual({});
	});
});

describe("Style Security", () => {
	test("colorToHex should not crash with 'constructor'", () => {
		// Verify prevention of prototype pollution crashes (DoS).
		// colorToHex uses dictionary lookups that must safely handle "constructor".
		const dangerousInput = "constructor";
		const result = colorToHex(dangerousInput as unknown as Color);
		// Should return fallback white (#FFFFFF), not crash or return a function.
		expect(result).toBe("#FFFFFF");
	});

	test("resolveColorToAnsi should not crash with 'constructor'", () => {
		const dangerousInput = "constructor";
		// Verify full resolution pipeline is safe against property masking.
		expect(() => resolveColorToAnsi(dangerousInput as unknown as Color)).not.toThrow();
	});
});
