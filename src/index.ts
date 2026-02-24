/**
 * Core types for styled console output.
 */

// -----------------
// Style Types
// -----------------

export type StandardColor = "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray" | "grey"; // Support both spellings

export type StyleModifier = "bold" | "dim" | "italic" | "underline" | "reset" | "hidden" | "inverse" | "strikethrough";

export type HexColor = `#${string}`;

/**
 * A style can be a standard color name, a hex color string, or a style modifier.
 * It can also be a raw ANSI string (though discouraged) for backward compatibility or special cases.
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type Style = StandardColor | StyleModifier | HexColor | string;

export interface StyledSegment {
	text: string;
	/** Style or array of styles to apply to the text */
	style: Style | Style[];
}

export interface StyledLine {
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
export const RESET = `${ESC}[0m`;

/**
 * Converts a hex color string to an RGB object.
 * @param hex - Hex color in the form "#RRGGBB".
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
 */
export function rgbToAnsi(r: number, g: number, b: number): string {
	return `${ESC}[38;2;${r};${g};${b}m`;
}

/**
 * Converts a hex color string directly to an ANSI escape sequence.
 */
export function hexToAnsi(hex: string): string {
	const { r, g, b } = hexToRgb(hex);
	return rgbToAnsi(r, g, b);
}

/**
 * Converts a single RGB component to a 2-digit hex string.
 */
function toHex(c: number): string {
	const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Interpolates between two hex colors based on a factor (0 to 1) and returns a Hex color string.
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
	reset: "0",
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
 */
export function resolveStyle(style: Style | Style[]): string {
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
 * Gets the plain text length of a StyledLine.
 */
export function getLineLength(line: StyledLine): number {
	return line.segments.reduce((acc, seg) => acc + seg.text.length, 0);
}

/**
 * Computes the maximum width among an array of StyledLines.
 */
export function computeMaxWidth(lines: StyledLine[]): number {
	return lines.length > 0 ? Math.max(...lines.map(getLineLength)) : 0;
}

/**
 * Pads a StyledLine to a target width by adding an empty segment at the end.
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
 * Merges two columns of StyledLines into a single layout.
 */
export function mergeColumns(
	leftColumn: StyledLine[],
	rightColumn: StyledLine[],
	leftWidth: number,
	separator: string,
	defaultStyle: Style | Style[]
): StyledLine[] {
	const maxLines = Math.max(leftColumn.length, rightColumn.length);
	const output: StyledLine[] = [];

	for (let i = 0; i < maxLines; i++) {
		const left = padLine(leftColumn[i] || { segments: [] }, leftWidth, defaultStyle);
		const right = rightColumn[i] || { segments: [] };
		output.push({
			segments: [...left.segments, { text: separator, style: defaultStyle }, ...right.segments]
		});
	}
	return output;
}

/**
 * Prints two columns of styled content to the console.
 */
export function printDualColumn(
	left: StyledLine[],
	right: StyledLine[],
	options: { leftWidth?: number; separator?: string; printer?: Printer } = {}
): void {
	const { leftWidth, separator = "     ", printer = defaultPrinter } = options;
	const defaultStyle = RESET;
	const finalLeftWidth = leftWidth ?? computeMaxWidth(left);
	const mergedLines = mergeColumns(left, right, finalLeftWidth, separator, defaultStyle);
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
