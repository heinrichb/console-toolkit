/**
 * Core types for styled console output.
 */
export interface StyledSegment {
	text: string;
	/** ANSI escape sequence or terminal-compatible style string */
	style: string;
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
	/** The default ANSI style to apply to padding or separators. */
	defaultStyle?: string;
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
 * Interpolates between two hex colors based on a factor (0 to 1) and returns an ANSI escape sequence.
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
	const f = Math.max(0, Math.min(1, factor));
	const c1 = hexToRgb(color1);
	const c2 = hexToRgb(color2);
	const r = Math.round(c1.r + f * (c2.r - c1.r));
	const g = Math.round(c1.g + f * (c2.g - c1.g));
	const b = Math.round(c1.b + f * (c2.b - c1.b));
	return rgbToAnsi(r, g, b);
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
export function padLine(line: StyledLine, targetWidth: number, padStyle: string): StyledLine {
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
	 * Moves cursor and clears previously rendered lines in interactive mode.
	 */
	private clear(): void {
		if (!this.isInteractive || this.linesRendered === 0) return;

		for (let i = 0; i < this.linesRendered; i++) {
			process.stdout.write(`${ESC}[1A${ESC}[2K\r`);
		}
		this.linesRendered = 0;
	}

	/**
	 * Renders an array of StyledLines to the standard output.
	 */
	public print(lines: StyledLine[]): void {
		this.clear();
		let output = "";
		lines.forEach((line) => {
			line.segments.forEach((seg) => {
				output += `${seg.style}${seg.text}${RESET}`;
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
	defaultStyle: string
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
