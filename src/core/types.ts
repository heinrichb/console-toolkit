// -----------------
// Style Types
// -----------------

/**
 * Standard colors supported by most terminals.
 */
export type StandardColor = "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray" | "grey";

/**
 * Text style modifiers.
 */
export type StyleModifier = "bold" | "dim" | "italic" | "underline" | "hidden" | "inverse" | "strikethrough";

/**
 * A valid Hex color string (e.g., "#FF0000").
 */
export type HexColor = `#${string}`;

/**
 * A color can be a standard color name or a hex color string.
 */
export type Color = StandardColor | HexColor;

/**
 * Represents an RGB color value.
 */
export interface RGB {
	r: number;
	g: number;
	b: number;
}

/**
 * Represents the style configuration for a text segment, line, or block.
 */
export interface PrintStyle {
	/**
	 * The color to apply.
	 * - A single color (string) applies a solid color.
	 * - An array of colors applies a gradient.
	 */
	color?: Color | Color[];

	/**
	 * The background color to apply.
	 * - A single color (string) applies a solid background.
	 * - An array of colors applies a background gradient.
	 */
	bgColor?: Color | Color[];

	/**
	 * A list of style modifiers (e.g., bold, italic) to apply.
	 */
	modifiers?: StyleModifier[];
}

/**
 * Represents a segment of text with applied styles.
 */
export interface PrintSegment {
	/** The text content of the segment. */
	text: string;
	/** The style specific to this segment. Merges with parent styles. */
	style?: PrintStyle;
}

/**
 * Represents a line of text composed of multiple styled segments.
 */
export interface PrintLine {
	/** Array of segments that make up the line. */
	segments: PrintSegment[];
	/** The style specific to this line. Merges with parent block style and applies to all children. */
	style?: PrintStyle;
}

/**
 * Represents a block of lines managed by the printer.
 */
export interface PrintBlock {
	/** Array of lines that make up the block. */
	lines: PrintLine[];
	/** The style specific to this block. Applies to all children. */
	style?: PrintStyle;
}

/**
 * Configuration for the Printer engine.
 */
export interface PrinterOptions {
	/**
	 * If true, the printer will overwrite previous output on subsequent print calls.
	 * Useful for live-updating displays (spinners, progress bars).
	 */
	live?: boolean;

	/**
	 * Initial data to load into the printer.
	 */
	data?: PrintBlock;
}
