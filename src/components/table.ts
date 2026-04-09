import { PrintLine, PrintStyle } from "../core/types";
import { line, segment } from "../core/builders";

/**
 * Border drawing style for tables.
 */
export type BorderStyle = "single" | "double" | "rounded" | "none";

/**
 * Configuration options for creating a styled table.
 */
export interface TableOptions {
	/** Column headers. If omitted, no header row is rendered. */
	headers?: string[];
	/** Row data. Each row is an array of cell strings. */
	rows: string[][];
	/** Base style for all table cell content. */
	style?: PrintStyle;
	/** Style override for header cells. */
	headerStyle?: PrintStyle;
	/** Style for border characters. */
	borderStyle?: PrintStyle;
	/** Border drawing style. Defaults to "single". */
	border?: BorderStyle;
	/** Fixed column widths (content area, excluding padding). Auto-computed from content if omitted. */
	columnWidths?: number[];
	/** Padding inside each cell (spaces on each side). Defaults to 1. */
	cellPadding?: number;
}

interface BorderChars {
	tl: string;
	t: string;
	tr: string;
	l: string;
	r: string;
	bl: string;
	b: string;
	br: string;
	ml: string;
	m: string;
	mr: string;
	tj: string;
	bj: string;
	mj: string;
}

const BORDERS: Record<Exclude<BorderStyle, "none">, BorderChars> = {
	single: {
		tl: "┌",
		t: "─",
		tr: "┐",
		l: "│",
		r: "│",
		bl: "└",
		b: "─",
		br: "┘",
		ml: "├",
		m: "─",
		mr: "┤",
		tj: "┬",
		bj: "┴",
		mj: "┼"
	},
	double: {
		tl: "╔",
		t: "═",
		tr: "╗",
		l: "║",
		r: "║",
		bl: "╚",
		b: "═",
		br: "╝",
		ml: "╠",
		m: "═",
		mr: "╣",
		tj: "╦",
		bj: "╩",
		mj: "╬"
	},
	rounded: {
		tl: "╭",
		t: "─",
		tr: "╮",
		l: "│",
		r: "│",
		bl: "╰",
		b: "─",
		br: "╯",
		ml: "├",
		m: "─",
		mr: "┤",
		tj: "┬",
		bj: "┴",
		mj: "┼"
	}
};

/**
 * Builds a horizontal border line (top, middle, or bottom).
 */
function buildBorderLine(
	chars: BorderChars,
	left: string,
	fill: string,
	junction: string,
	right: string,
	colWidths: number[],
	padding: number,
	borderStyle?: PrintStyle
): PrintLine {
	const parts: string[] = [left];
	for (let i = 0; i < colWidths.length; i++) {
		parts.push(fill.repeat(colWidths[i] + padding * 2));
		if (i < colWidths.length - 1) parts.push(junction);
	}
	parts.push(right);
	return line([segment(parts.join(""), borderStyle)]);
}

/**
 * Builds a data row with cell content and borders.
 */
function buildDataRow(
	cells: string[],
	colWidths: number[],
	padding: number,
	colCount: number,
	borderChar: string,
	cellStyle?: PrintStyle,
	borderStyle?: PrintStyle
): PrintLine {
	const segments = [];
	segments.push(segment(borderChar, borderStyle));
	for (let i = 0; i < colCount; i++) {
		const cellText = cells[i] ?? "";
		const padded = " ".repeat(padding) + cellText.padEnd(colWidths[i]) + " ".repeat(padding);
		segments.push(segment(padded, cellStyle));
		if (i < colCount - 1) {
			segments.push(segment(borderChar, borderStyle));
		}
	}
	segments.push(segment(borderChar, borderStyle));
	return line(segments);
}

/**
 * Creates a styled table as an array of PrintLines.
 * Composable with Printer: `printer.print(block(createTable(options)))`.
 */
export function createTable(options: TableOptions): PrintLine[] {
	const { headers, rows, style, headerStyle, borderStyle, border = "single", columnWidths, cellPadding = 1 } = options;

	const colCount = Math.max(headers?.length ?? 0, ...rows.map((r) => r.length), 0);
	if (colCount === 0) return [];

	// Compute column widths from content if not provided
	const colWidths: number[] = [];
	for (let i = 0; i < colCount; i++) {
		if (columnWidths?.[i] !== undefined) {
			colWidths.push(columnWidths[i]);
		} else {
			const headerWidth = headers?.[i]?.length ?? 0;
			const maxRowWidth = rows.reduce((max, row) => Math.max(max, row[i]?.length ?? 0), 0);
			colWidths.push(Math.max(headerWidth, maxRowWidth));
		}
	}

	if (border === "none") {
		return buildNoBorderTable(headers, rows, colWidths, cellPadding, colCount, style, headerStyle);
	}

	const chars = BORDERS[border];
	const output: PrintLine[] = [];

	// Top border
	output.push(buildBorderLine(chars, chars.tl, chars.t, chars.tj, chars.tr, colWidths, cellPadding, borderStyle));

	// Header row
	if (headers) {
		output.push(buildDataRow(headers, colWidths, cellPadding, colCount, chars.l, headerStyle ?? style, borderStyle));
		output.push(buildBorderLine(chars, chars.ml, chars.m, chars.mj, chars.mr, colWidths, cellPadding, borderStyle));
	}

	// Data rows
	for (const row of rows) {
		output.push(buildDataRow(row, colWidths, cellPadding, colCount, chars.l, style, borderStyle));
	}

	// Bottom border
	output.push(buildBorderLine(chars, chars.bl, chars.b, chars.bj, chars.br, colWidths, cellPadding, borderStyle));

	return output;
}

/**
 * Builds a table without borders — cells separated by padding only.
 */
function buildNoBorderTable(
	headers: string[] | undefined,
	rows: string[][],
	colWidths: number[],
	padding: number,
	colCount: number,
	style?: PrintStyle,
	headerStyle?: PrintStyle
): PrintLine[] {
	const output: PrintLine[] = [];
	const space = " ".repeat(padding);

	function buildRow(cells: string[], cellStyle?: PrintStyle): PrintLine {
		const segments = [];
		for (let i = 0; i < colCount; i++) {
			const cellText = cells[i] ?? "";
			segments.push(segment(space + cellText.padEnd(colWidths[i]) + space, cellStyle));
		}
		return line(segments);
	}

	if (headers) {
		output.push(buildRow(headers, headerStyle ?? style));
	}
	for (const row of rows) {
		output.push(buildRow(row, style));
	}
	return output;
}
