import { PrintSegment, PrintLine, PrintBlock, PrintStyle } from "./types";

/**
 * Creates a PrintSegment object.
 *
 * @param text - The text content of the segment.
 * @param style - The optional style to apply to the text.
 * @returns A PrintSegment object.
 */
export function segment(text: string, style?: PrintStyle): PrintSegment {
	return { text, style };
}

/**
 * Creates a PrintLine object.
 *
 * @param segments - An array of PrintSegments that make up the line.
 * @param style - The optional style to apply to the entire line (overrides block style, overridden by segment style).
 * @returns A PrintLine object.
 */
export function line(segments: PrintSegment[], style?: PrintStyle): PrintLine {
	return { segments, style };
}

/**
 * Creates a PrintBlock object.
 *
 * @param lines - An array of PrintLines that make up the block.
 * @param style - The optional style to apply to the entire block (base style).
 * @returns A PrintBlock object.
 */
export function block(lines: PrintLine[], style?: PrintStyle): PrintBlock {
	return { lines, style };
}
