import { PrintLine, PrintStyle } from "./types";
import { line as createLine, segment } from "./builders";

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
	return lines.length > 0 ? Math.max(...lines.map(getLineLength)) : 0;
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
		return createLine([...inputLine.segments, segment(" ".repeat(targetWidth - currentLength), padStyle)], inputLine.style);
	}
	return inputLine;
}
