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
 * @param segments - An optional array of PrintSegments that make up the line. Defaults to [].
 * @param style - The optional style to apply to the entire line.
 * @returns A PrintLine object.
 */
export function line(segments: PrintSegment[] = [], style?: PrintStyle): PrintLine {
	return { segments, style };
}

/**
 * Creates a PrintBlock object.
 *
 * @param lines - An optional array of PrintLines that make up the block. Defaults to [].
 * @param style - The optional style to apply to the entire block.
 * @returns A PrintBlock object.
 */
export function block(lines: PrintLine[] = [], style?: PrintStyle): PrintBlock {
	return { lines, style };
}
