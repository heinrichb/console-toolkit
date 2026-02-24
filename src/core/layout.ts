import { PrintLine, PrintSegment, PrintStyle } from "./types";
import { computeMaxWidth, padLine } from "./utils";
import { Printer } from "./printer";

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
export function mergeMultipleColumns(
	columns: PrintLine[][],
	separator = "     ",
	defaultStyle?: PrintStyle,
	widths?: number[]
): PrintLine[] {
	if (columns.length === 0) return [];

	const maxLines = Math.max(...columns.map((c) => c.length));
	const colWidths = columns.map((col, i) => {
		if (widths?.[i] !== undefined) return widths[i];
		return computeMaxWidth(col);
	});

	const output: PrintLine[] = [];

	for (let i = 0; i < maxLines; i++) {
		let segments: PrintSegment[] = [];
		for (let j = 0; j < columns.length; j++) {
			const line = columns[j][i] || { segments: [] };

			// If not the last column, pad it
			if (j < columns.length - 1) {
				const padded = padLine(line, colWidths[j], defaultStyle);
				segments = [...segments, ...padded.segments, { text: separator, style: defaultStyle }];
			} else {
				// Last column, just add segments
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
	columns: PrintLine[][],
	options: { widths?: number[]; separator?: string; printer?: Printer } = {}
): void {
	const { widths, separator = "     ", printer = new Printer() } = options;
	const mergedLines = mergeMultipleColumns(columns, separator, undefined, widths);
	printer.print({ lines: mergedLines });
}
