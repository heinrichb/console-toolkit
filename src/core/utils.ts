import { PrintLine, PrintStyle } from "./types";
import { line, segment } from "./builders";

/**
 * Gets the plain text length of a PrintLine (ignoring ANSI codes).
 *
 * @param line - The PrintLine to measure.
 * @returns The length of the text content.
 */
export function getLineLength(line: PrintLine): number {
	return line.segments.reduce((acc, seg) => acc + seg.text.length, 0);
}

/**
 * Computes the maximum width among an array of PrintLines.
 * Useful for aligning columns.
 *
 * @param lines - Array of PrintLines.
 * @returns The maximum line length found.
 */
export function computeMaxWidth(lines: PrintLine[]): number {
	return lines.reduce((max, l) => Math.max(max, getLineLength(l)), 0);
}

/**
 * Pads a PrintLine to a target width by adding an empty segment at the end.
 *
 * @param inputLine - The line to pad.
 * @param targetWidth - The desired minimum width.
 * @param padStyle - The style to apply to the padding spaces.
 * @returns A new PrintLine with padding added if necessary.
 */
export function padLine(inputLine: PrintLine, targetWidth: number, padStyle?: PrintStyle): PrintLine {
	const currentLength = getLineLength(inputLine);
	if (currentLength < targetWidth) {
		return line([...inputLine.segments, segment(" ".repeat(targetWidth - currentLength), padStyle)], inputLine.style);
	}
	return inputLine;
}

/**
 * Regex matching all ANSI SGR (Select Graphic Rendition) escape sequences.
 * Covers color codes (38;2;R;G;B), modifiers (1m, 2m, etc.), and reset (0m).
 * Uses RegExp constructor to avoid eslint no-control-regex on the ESC literal.
 */
// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

/**
 * Strips all ANSI escape sequences from a string, returning plain text.
 *
 * @param text - The string potentially containing ANSI codes.
 * @returns The plain text with all ANSI sequences removed.
 */
export function stripAnsi(text: string): string {
	return text.replace(ANSI_REGEX, "");
}
