import { HexColor, Style } from "./types";

// -----------------
// Color Utilities
// -----------------

const ESC = "\x1b";
/**
 * ANSI escape sequence to reset all styles.
 */
export const RESET = `${ESC}[0m`;

/**
 * Converts a hex color string to an RGB object.
 * Validates the hex string format.
 *
 * @param hex - Hex color in the form "#RRGGBB".
 * @returns Object with r, g, b components (0-255).
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const h = hex.replace(/^#/, "");
	if (h.length !== 6) throw new Error("Invalid hex color.");
	return {
		r: parseInt(h.substring(0, 2), 16),
		g: parseInt(h.substring(2, 4), 16),
		b: parseInt(h.substring(4, 6), 16)
	};
}

/**
 * Converts RGB to a 24-bit ANSI foreground color escape sequence.
 *
 * @param r - Red component (0-255).
 * @param g - Green component (0-255).
 * @param b - Blue component (0-255).
 * @returns ANSI escape sequence string.
 */
export function rgbToAnsi(r: number, g: number, b: number): string {
	return `${ESC}[38;2;${r};${g};${b}m`;
}

/**
 * Converts a hex color string directly to an ANSI escape sequence.
 *
 * @param hex - Hex color string.
 * @returns ANSI escape sequence string.
 */
export function hexToAnsi(hex: string): string {
	const { r, g, b } = hexToRgb(hex);
	return rgbToAnsi(r, g, b);
}

/**
 * Converts a single RGB component to a 2-digit hex string.
 * Helper for interpolation.
 */
function toHex(c: number): string {
	const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Interpolates between two hex colors based on a factor (0 to 1) and returns a Hex color string.
 * Used for gradients.
 *
 * @param color1 - Start color (hex).
 * @param color2 - End color (hex).
 * @param factor - Interpolation factor (0.0 to 1.0).
 * @returns Interpolated Hex color.
 */
export function interpolateColor(color1: string, color2: string, factor: number): HexColor {
	const f = Math.max(0, Math.min(1, factor));
	const c1 = hexToRgb(color1);
	const c2 = hexToRgb(color2);
	const r = c1.r + f * (c2.r - c1.r);
	const g = c1.g + f * (c2.g - c1.g);
	const b = c1.b + f * (c2.b - c1.b);
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// -----------------
// Style Resolution
// -----------------

const STYLE_CODES: Record<string, string> = {
	default: "0",
	bold: "1",
	dim: "2",
	italic: "3",
	underline: "4",
	inverse: "7",
	hidden: "8",
	strikethrough: "9",
	black: "30",
	red: "31",
	green: "32",
	yellow: "33",
	blue: "34",
	magenta: "35",
	cyan: "36",
	white: "37",
	gray: "90",
	grey: "90"
};

/**
 * Resolves a single Style or array of Styles into an ANSI escape sequence.
 * Handles hex colors, standard colors, and modifiers.
 *
 * @param style - The style or array of styles to resolve.
 * @returns The resulting ANSI escape sequence string.
 */
export function resolveStyle(style?: Style | Style[]): string {
	if (Array.isArray(style)) {
		return style.map(resolveStyle).join("");
	}

	if (typeof style !== "string") {
		return "";
	}

	// Check for hex color
	if (style.startsWith("#")) {
		try {
			return hexToAnsi(style);
		} catch {
			return ""; // Invalid hex, ignore
		}
	}

	// Check for standard styles/colors
	const code = STYLE_CODES[style.toLowerCase()];
	if (code) {
		return `${ESC}[${code}m`;
	}

	// Fallback: return as raw string if it looks like ANSI or just text
	// Ideally we would validate ANSI here, but for flexibility we return it.
	return style;
}
