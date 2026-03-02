import { Color, HexColor, PrintStyle, StandardColor, StyleModifier, RGB } from "./types";

// -----------------
// Color Utilities
// -----------------

const ESC = "\x1b";
/**
 * ANSI escape sequence to reset all styles.
 */
export const RESET = `${ESC}[0m`;

/**
 * Standard ANSI color codes.
 * Initialized with Object.create(null) to prevent prototype pollution.
 */
const STANDARD_COLORS: Record<StandardColor, string> = Object.assign(Object.create(null), {
	black: "#000000",
	red: "#EF4444", // Tailwind Red-500
	green: "#10B981", // Tailwind Emerald-500
	yellow: "#F59E0B", // Tailwind Amber-500
	blue: "#3B82F6", // Tailwind Blue-500
	magenta: "#EC4899", // Tailwind Pink-500
	cyan: "#06B6D4", // Tailwind Cyan-500
	white: "#FFFFFF",
	gray: "#6B7280", // Tailwind Gray-500
	grey: "#6B7280"
});

/**
 * ANSI codes for text modifiers.
 * Initialized with Object.create(null) to prevent prototype pollution.
 */
const MODIFIER_CODES: Record<StyleModifier, string> = Object.assign(Object.create(null), {
	default: "0",
	bold: "1",
	dim: "2",
	italic: "3",
	underline: "4",
	inverse: "7",
	hidden: "8",
	strikethrough: "9"
});

/**
 * Converts any Color (hex or standard name) to a Hex string.
 */
export function colorToHex(color: Color): string {
	if (color.startsWith("#")) return color;
	const hex = STANDARD_COLORS[color.toLowerCase() as StandardColor];
	if (!hex) return "#FFFFFF"; // Fallback
	return hex;
}

/**
 * Converts a hex color string to an RGB object.
 */
export function hexToRgb(hex: string): RGB {
	const h = hex.replace(/^#/, "");
	if (h.length !== 6) return { r: 255, g: 255, b: 255 }; // Fallback for invalid hex
	return {
		r: parseInt(h.substring(0, 2), 16),
		g: parseInt(h.substring(2, 4), 16),
		b: parseInt(h.substring(4, 6), 16)
	};
}

/**
 * Converts RGB to a 24-bit ANSI foreground color escape sequence.
 */
export function rgbToAnsi(r: number, g: number, b: number): string {
	return `${ESC}[38;2;${r};${g};${b}m`;
}

/**
 * Converts any Color to an ANSI escape sequence.
 */
export function resolveColorToAnsi(color: Color): string {
	const hex = colorToHex(color);
	const { r, g, b } = hexToRgb(hex);
	return rgbToAnsi(r, g, b);
}

/**
 * Resolves a Color (Standard or Hex) to an RGB object.
 */
export function resolveColorToRgb(color: Color): RGB {
	const hex = colorToHex(color);
	return hexToRgb(hex);
}

/**
 * Converts a list of modifiers to an ANSI escape sequence.
 */
export function resolveModifiersToAnsi(modifiers?: StyleModifier[]): string {
	if (!modifiers || modifiers.length === 0) return "";
	return modifiers
		.map((m) => {
			const code = MODIFIER_CODES[m];
			return code ? `${ESC}[${code}m` : "";
		})
		.join("");
}

/**
 * Helper to convert number to 2-digit hex.
 */
function toHex(c: number): string {
	const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Interpolates between two hex colors.
 */
export function interpolateHex(color1: string, color2: string, factor: number): string {
	const f = Math.max(0, Math.min(1, factor));
	const c1 = hexToRgb(color1);
	const c2 = hexToRgb(color2);
	const r = c1.r + f * (c2.r - c1.r);
	const g = c1.g + f * (c2.g - c1.g);
	const b = c1.b + f * (c2.b - c1.b);
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Public interpolation function that accepts any Color type.
 */
export function interpolateColor(color1: Color, color2: Color, factor: number): HexColor {
	return interpolateHex(colorToHex(color1), colorToHex(color2), factor) as HexColor;
}

/**
 * logic to get a specific color from a multi-stop gradient array at a specific factor (0-1).
 */
export function getGradientColor(colors: Color[], factor: number): string {
	if (colors.length === 0) return "";
	if (colors.length === 1) return resolveColorToAnsi(colors[0]);

	return getGradientColorFromRgb(colors.map(resolveColorToRgb), factor);
}

/**
 * logic to get a specific color from a multi-stop gradient array of RGB values at a specific factor (0-1).
 */
export function getGradientColorFromRgb(colors: RGB[], factor: number): string {
	if (colors.length === 0) return "";
	if (colors.length === 1) return rgbToAnsi(colors[0].r, colors[0].g, colors[0].b);

	const f = Math.max(0, Math.min(1, factor));
	// Map factor to segments between colors
	// e.g. 3 colors: [0, 0.5, 1]. factor 0.25 is in first segment (0.5 of way through)
	const segmentLength = 1 / (colors.length - 1);

	const segmentIndex = Math.min(Math.floor(f / segmentLength), colors.length - 2);
	const segmentFactor = (f - segmentIndex * segmentLength) / segmentLength;

	const c1 = colors[segmentIndex];
	const c2 = colors[segmentIndex + 1];

	const r = Math.round(c1.r + segmentFactor * (c2.r - c1.r));
	const g = Math.round(c1.g + segmentFactor * (c2.g - c1.g));
	const b = Math.round(c1.b + segmentFactor * (c2.b - c1.b));

	return rgbToAnsi(r, g, b);
}

// -----------------
// Style Merging
// -----------------

/**
 * Merges a child style into a parent style.
 * - Modifiers are combined (union).
 * - Child color overrides parent color.
 */
export function mergeStyles(parent?: PrintStyle, child?: PrintStyle): PrintStyle {
	if (!parent && !child) return {};
	if (!parent) return child ?? {};
	if (!child) return parent;

	const mergedModifiers = Array.from(new Set([...(parent.modifiers ?? []), ...(child.modifiers ?? [])]));

	return {
		modifiers: mergedModifiers,
		color: child.color ?? parent.color
	};
}

/**
 * Resolves a style object into an ANSI string.
 * If the color is a gradient (array), it uses the provided factor (0-1) to pick the color.
 * Defaults to factor 0 if not provided.
 */
export function resolveStyle(style?: PrintStyle, gradientFactor = 0): string {
	if (!style) return "";

	let ansi = "";

	if (style.modifiers) {
		ansi += resolveModifiersToAnsi(style.modifiers);
	}

	if (style.color) {
		if (Array.isArray(style.color)) {
			// Gradient
			const hex = getGradientColor(style.color, gradientFactor);
			ansi += hex;
		} else {
			// Solid
			ansi += resolveColorToAnsi(style.color);
		}
	}

	return ansi;
}
