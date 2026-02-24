import { Style, StyledLine, StyledSegment } from "./types";
import { computeMaxWidth, padLine } from "./utils";
import { Printer } from "./printer";
import { RESET } from "./style";

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
