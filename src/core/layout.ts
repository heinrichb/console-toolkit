import { PrintLine, PrintSegment, PrintStyle } from "./types";
import { computeMaxWidth, padLine } from "./utils";
import { Printer } from "./printer";
import { line, segment, block } from "./builders";

// -----------------
// Core Layout & Printing
// -----------------

/**
 * Merges multiple columns of PrintLines into a single layout.
 * Ensures proper alignment by padding shorter lines.
 *
 * @param columns - Array of columns, where each column is an array of PrintLines.
 * @param separator - String used to separate columns.
 * @param defaultStyle - Style to apply to the separator and padding.
 * @param widths - Optional fixed widths for each column.
 * @returns A single array of PrintLines representing the merged output.
 */
export function mergeColumns(
	columns: PrintLine[][],
	separator = "     ",
	defaultStyle?: PrintStyle,
	widths?: number[]
): PrintLine[] {
	if (columns.length === 0) return [];

	const maxLines = columns.reduce((max, c) => Math.max(max, c.length), 0);
	const colWidths = columns.map((col, i) => {
		if (widths?.[i] !== undefined) return widths[i];
		return computeMaxWidth(col);
	});

	const output: PrintLine[] = [];

	for (let i = 0; i < maxLines; i++) {
		const segments: PrintSegment[] = [];
		for (let j = 0; j < columns.length; j++) {
			const currentLine = columns[j][i] || line();

			if (j < columns.length - 1) {
				const padded = padLine(currentLine, colWidths[j], defaultStyle);
				segments.push(...padded.segments, segment(separator, defaultStyle));
			} else {
				segments.push(...currentLine.segments);
			}
		}
		output.push(line(segments));
	}
	return output;
}

/**
 * Prints multiple columns of styled content to the console.
 * A convenience wrapper around `mergeColumns` and `Printer.print`.
 *
 * @param columns - Array of columns to print.
 * @param options - Layout options (widths, separator, custom printer).
 */
export function printColumns(
	columns: PrintLine[][],
	options: { widths?: number[]; separator?: string; defaultStyle?: PrintStyle; printer?: Printer } = {}
): void {
	const { widths, separator = "     ", defaultStyle, printer = new Printer() } = options;
	const mergedLines = mergeColumns(columns, separator, defaultStyle, widths);
	printer.print(block(mergedLines));
}
