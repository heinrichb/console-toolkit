// -----------------
// Style Types
// -----------------

/**
 * Standard colors supported by most terminals.
 */
export type StandardColor = "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray" | "grey"; // Support both spellings

/**
 * Text style modifiers.
 */
export type StyleModifier = "bold" | "dim" | "italic" | "underline" | "default" | "hidden" | "inverse" | "strikethrough";

/**
 * A valid Hex color string (e.g., "#FF0000").
 */
export type HexColor = `#${string}`;

/**
 * A style can be a standard color name, a hex color string, or a style modifier.
 * It can also be a raw ANSI string (though discouraged) for backward compatibility or special cases.
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type Style = StandardColor | StyleModifier | HexColor | string;

/**
 * Represents a segment of text with applied styles.
 */
export interface StyledSegment {
	/** The text content of the segment. */
	text: string;
	/** Style or array of styles to apply to the text. */
	style?: Style | Style[];
}

/**
 * Represents a line of text composed of multiple styled segments.
 */
export interface StyledLine {
	/** Array of segments that make up the line. */
	segments: StyledSegment[];
}

/**
 * Configuration for the Printer engine.
 */
export interface PrinterOptions {
	/** If true, the printer will overwrite previous lines instead of appending new ones. */
	interactive?: boolean;
	/** The default style to apply to padding or separators. */
	defaultStyle?: Style | Style[];
}
