import { Style, StyledLine } from "./types";

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
