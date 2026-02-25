import { PrintLine, PrintSegment, PrintStyle } from "../core/types";
import { line, segment } from "../core/builders";

export interface ProgressBarOptions {
	/**
	 * Progress value between 0.0 and 1.0.
	 */
	progress: number;

	/**
	 * Width of the progress bar (excluding brackets and percentage).
	 * Defaults to 20.
	 */
	width?: number;

	/**
	 * Base style for the entire progress bar.
	 */
	style?: PrintStyle;

	/**
	 * Style for the brackets (start and end characters).
	 * Defaults to `style`.
	 */
	bracketStyle?: PrintStyle;

	/**
	 * Specific style for the start bracket. Overrides `bracketStyle`.
	 */
	startStyle?: PrintStyle;

	/**
	 * Specific style for the end bracket. Overrides `bracketStyle`.
	 */
	endStyle?: PrintStyle;

	/**
	 * Style for the bar (filled and empty parts).
	 * Defaults to `style`.
	 */
	barStyle?: PrintStyle;

	/**
	 * Specific style for the filled part. Overrides `barStyle`.
	 */
	fillStyle?: PrintStyle;

	/**
	 * Specific style for the empty part. Overrides `barStyle`.
	 */
	emptyStyle?: PrintStyle;

	/**
	 * Style for the percentage text.
	 * Defaults to `style`.
	 */
	percentageStyle?: PrintStyle;

	/**
	 * Character to use for the start bracket. Defaults to `[`.
	 */
	startChar?: string;

	/**
	 * Character to use for the end bracket. Defaults to `]`.
	 */
	endChar?: string;

	/**
	 * Character to use for the filled part. Defaults to `█`.
	 */
	fillChar?: string;

	/**
	 * Character to use for the empty part. Defaults to `░`.
	 */
	emptyChar?: string;

	/**
	 * Whether to show the percentage text. Defaults to `true`.
	 */
	showPercentage?: boolean;

	/**
	 * Custom formatter for the percentage text.
	 */
	formatPercentage?: (progress: number) => string;
}

/**
 * Creates a PrintLine representing a progress bar.
 */
export function createProgressBar(options: ProgressBarOptions): PrintLine {
	const {
		progress,
		width = 20,
		style,
		bracketStyle,
		startStyle,
		endStyle,
		barStyle,
		fillStyle,
		emptyStyle,
		percentageStyle,
		startChar = "[",
		endChar = "]",
		fillChar = "█",
		emptyChar = "░",
		showPercentage = true,
		formatPercentage
	} = options;

	// Clamp progress
	const p = Math.max(0, Math.min(1, progress));

	// Calculate filled width
	const filledWidth = Math.round(p * width);
	const emptyWidth = width - filledWidth;

	// Resolve styles (Defaults)
	const resolvedBracketStyle = bracketStyle ?? style;
	const resolvedStartStyle = startStyle ?? resolvedBracketStyle;
	const resolvedEndStyle = endStyle ?? resolvedBracketStyle;

	const resolvedBarStyle = barStyle ?? style;
	const resolvedFillStyle = fillStyle ?? resolvedBarStyle;
	const resolvedEmptyStyle = emptyStyle ?? resolvedBarStyle;

	const resolvedPercentageStyle = percentageStyle ?? style;

	const segments: PrintSegment[] = [];

	// Start Bracket
	if (startChar) {
		segments.push(segment(startChar, resolvedStartStyle));
	}

	// Filled Part
	if (filledWidth > 0) {
		segments.push(segment(fillChar.repeat(filledWidth), resolvedFillStyle));
	}

	// Empty Part
	if (emptyWidth > 0) {
		segments.push(segment(emptyChar.repeat(emptyWidth), resolvedEmptyStyle));
	}

	// End Bracket
	if (endChar) {
		segments.push(segment(endChar, resolvedEndStyle));
	}

	// Percentage
	if (showPercentage) {
		const percentageText = formatPercentage ? formatPercentage(p) : ` ${Math.round(p * 100)}%`;
		segments.push(segment(percentageText, resolvedPercentageStyle));
	}

	return line(segments);
}
