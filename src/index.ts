/**
 * Core types for styled console output.
 */

// -----------------
// Style Types
// -----------------

/**
 * Standard colors supported by most terminals.
 */
export type StandardColor = "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray" | "grey"; // Support both spellings

/**
 * Text style modifiers.
 */
export type StyleModifier = "bold" | "dim" | "italic" | "underline" | "default" | "hidden" | "inverse" | "strikethrough";

/**
 * A valid Hex color string (e.g., "#FF0000").
 */
export type HexColor = `#${string}`;

/**
 * A style can be a standard color name, a hex color string, or a style modifier.
 * It can also be a raw ANSI string (though discouraged) for backward compatibility or special cases.
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type Style = StandardColor | StyleModifier | HexColor | string;

/**
 * Represents a segment of text with applied styles.
 */
export interface StyledSegment {
	/** The text content of the segment. */
	text: string;
	/** Style or array of styles to apply to the text. */
	style?: Style | Style[];
}

/**
 * Represents a line of text composed of multiple styled segments.
 */
export interface StyledLine {
	/** Array of segments that make up the line. */
	segments: StyledSegment[];
}

/**
 * Configuration for the Printer engine.
 */
export interface PrinterOptions {
	/** If true, the printer will overwrite previous lines instead of appending new ones. */
	interactive?: boolean;
	/** The default style to apply to padding or separators. */
	defaultStyle?: Style | Style[];
}

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

// -----------------
// Line Manipulation Helpers
// -----------------

/**
 * Gets the plain text length of a StyledLine (ignoring ANSI codes).
 *
 * @param line - The StyledLine to measure.
 * @returns The length of the text content.
 */
export function getLineLength(line: StyledLine): number {
	return line.segments.reduce((acc, seg) => acc + seg.text.length, 0);
}

/**
 * Computes the maximum width among an array of StyledLines.
 * Useful for aligning columns.
 *
 * @param lines - Array of StyledLines.
 * @returns The maximum line length found.
 */
export function computeMaxWidth(lines: StyledLine[]): number {
	return lines.length > 0 ? Math.max(...lines.map(getLineLength)) : 0;
}

/**
 * Pads a StyledLine to a target width by adding an empty segment at the end.
 *
 * @param line - The line to pad.
 * @param targetWidth - The desired minimum width.
 * @param padStyle - The style to apply to the padding spaces.
 * @returns A new StyledLine with padding added if necessary.
 */
export function padLine(line: StyledLine, targetWidth: number, padStyle: Style | Style[]): StyledLine {
	const currentLength = getLineLength(line);
	if (currentLength < targetWidth) {
		return {
			segments: [...line.segments, { text: " ".repeat(targetWidth - currentLength), style: padStyle }]
		};
	}
	return line;
}

// -----------------
// Printer Class
// -----------------

/**
 * Handles rendering StyledLines to the terminal with support for interactive overwriting.
 */
export class Printer {
	private linesRendered = 0;
	private isInteractive: boolean;

	constructor(options: PrinterOptions = {}) {
		this.isInteractive = options.interactive ?? false;
	}

	/**
	 * Generates the clear sequence to move cursor and clear previously rendered lines.
	 */
	private getClearSequence(): string {
		if (!this.isInteractive || this.linesRendered === 0) return "";
		return `${ESC}[1A${ESC}[2K\r`.repeat(this.linesRendered);
	}

	/**
	 * Renders an array of StyledLines to the standard output.
	 * If interactive mode is enabled, it clears the previously printed lines first.
	 *
	 * @param lines - The lines to print.
	 */
	public print(lines: StyledLine[]): void {
		let output = this.getClearSequence();
		lines.forEach((line) => {
			line.segments.forEach((seg) => {
				const ansiStyle = resolveStyle(seg.style);
				output += `${ansiStyle}${seg.text}${RESET}`;
			});
			output += "\n";
		});
		process.stdout.write(output);
		this.linesRendered = lines.length;
	}
}

// -----------------
// Core Layout & Printing
// -----------------

const defaultPrinter = new Printer();

/**
 * Merges multiple columns of StyledLines into a single layout.
 * Ensures proper alignment by padding shorter lines.
 *
 * @param columns - Array of columns, where each column is an array of StyledLines.
 * @param separator - String used to separate columns.
 * @param defaultStyle - Style to apply to the separator and padding.
 * @param widths - Optional fixed widths for each column.
 * @returns A single array of StyledLines representing the merged output.
 */
export function mergeMultipleColumns(
	columns: StyledLine[][],
	separator: string,
	defaultStyle: Style | Style[],
	widths?: number[]
): StyledLine[] {
	if (columns.length === 0) return [];

	const maxLines = Math.max(...columns.map((c) => c.length));
	const colWidths = columns.map((col, i) => {
		if (widths?.[i] !== undefined) return widths[i];
		return computeMaxWidth(col);
	});

	const output: StyledLine[] = [];

	for (let i = 0; i < maxLines; i++) {
		let segments: StyledSegment[] = [];
		for (let j = 0; j < columns.length; j++) {
			const line = columns[j][i] || { segments: [] };
			// Pad if not the last column
			if (j < columns.length - 1) {
				const padded = padLine(line, colWidths[j], defaultStyle);
				segments = [...segments, ...padded.segments, { text: separator, style: defaultStyle }];
			} else {
				segments = [...segments, ...line.segments];
			}
		}
		output.push({ segments });
	}
	return output;
}

/**
 * Prints multiple columns of styled content to the console.
 * A convenience wrapper around `mergeMultipleColumns` and `Printer.print`.
 *
 * @param columns - Array of columns to print.
 * @param options - Layout options (widths, separator, custom printer).
 */
export function printColumns(
	columns: StyledLine[][],
	options: { widths?: number[]; separator?: string; printer?: Printer } = {}
): void {
	const { widths, separator = "     ", printer = defaultPrinter } = options;
	const defaultStyle = RESET;
	const mergedLines = mergeMultipleColumns(columns, separator, defaultStyle, widths);
	printer.print(mergedLines);
}

// -----------------
// Presets
// -----------------

/**
 * Returns the classic Dragon ASCII art as StyledLines with a vertical color gradient.
 */
export function getDragonLines(startColor = "#EF4444", endColor = "#F59E0B"): StyledLine[] {
	const rawDragon = [
		"                ^    ^",
		"               / \\  //\\",
		" |\\___/|      /   \\//  .\\",
		" /O  O  \\__  /    //  | \\ \\",
		"/     /  \\_/_/    //   |  \\  \\",
		"@___@'    \\_//   //    |   \\   \\ ",
		"   |       \\_// //     |    \\    \\ ",
		"   |        \\///      |     \\     \\ ",
		"  _|_ /   )  //       |      \\     _\\",
		" '/,_ _ _/  ( ; -.    |    _ _\\.-~        .-~~~^-.",
		" ,-{        _      `-.|.-~-.           .~         `.",
		"  '/\\      /                 ~-. _ .-~      .-~^-.  \\",
		"     `.   {            }                   /      \\  \\",
		"   .----~-\\.        \\-'                 .~         \\  `. \\^-.",
		"  ///.----..>    c   \\             _ -~             `.  ^-`   ^-_",
		"    ///-._ _ _ _ _ _ _}^ - - - - ~                     ~--,   .-~",
		"                                                          /.-'"
	];

	return rawDragon.map((text, i) => {
		const factor = rawDragon.length <= 1 ? 0 : i / (rawDragon.length - 1);
		const colorStyle = interpolateColor(startColor, endColor, factor);
		return { segments: [{ text, style: colorStyle }] };
	});
}

// -----------------
// Progress Bar
// -----------------

export * from "./progress";
export * from "./spinner";
