import { StyledLine, StyledSegment, Style } from "./index";

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
	style?: Style | Style[];

	/**
	 * Style for the brackets (start and end characters).
	 * Defaults to `style` or gray.
	 */
	bracketStyle?: Style | Style[];

	/**
	 * Specific style for the start bracket. Overrides `bracketStyle`.
	 */
	startStyle?: Style | Style[];

	/**
	 * Specific style for the end bracket. Overrides `bracketStyle`.
	 */
	endStyle?: Style | Style[];

	/**
	 * Style for the bar (filled and empty parts).
	 * Defaults to `style`.
	 */
	barStyle?: Style | Style[];

	/**
	 * Specific style for the filled part. Overrides `barStyle`.
	 */
	fillStyle?: Style | Style[];

	/**
	 * Specific style for the empty part. Overrides `barStyle`.
	 */
	emptyStyle?: Style | Style[];

	/**
	 * Style for the percentage text.
	 * Defaults to `style`.
	 */
	percentageStyle?: Style | Style[];

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
 * Creates a StyledLine representing a progress bar.
 */
export function createProgressBar(options: ProgressBarOptions): StyledLine {
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

	// Resolve styles
	const baseStyle = style ?? [];
	const resolvedBracketStyle = bracketStyle ?? baseStyle;
	const resolvedStartStyle = startStyle ?? resolvedBracketStyle;
	const resolvedEndStyle = endStyle ?? resolvedBracketStyle;

	const resolvedBarStyle = barStyle ?? baseStyle;
	const resolvedFillStyle = fillStyle ?? resolvedBarStyle;
	const resolvedEmptyStyle = emptyStyle ?? resolvedBarStyle;

	const resolvedPercentageStyle = percentageStyle ?? baseStyle;

	const segments: StyledSegment[] = [];

	// Start Bracket
	if (startChar) {
		segments.push({ text: startChar, style: resolvedStartStyle });
	}

	// Filled Part
	if (filledWidth > 0) {
		segments.push({ text: fillChar.repeat(filledWidth), style: resolvedFillStyle });
	}

	// Empty Part
	if (emptyWidth > 0) {
		segments.push({ text: emptyChar.repeat(emptyWidth), style: resolvedEmptyStyle });
	}

	// End Bracket
	if (endChar) {
		segments.push({ text: endChar, style: resolvedEndStyle });
	}

	// Percentage
	if (showPercentage) {
		const percentageText = formatPercentage ? formatPercentage(p) : ` ${Math.round(p * 100)}%`;
		segments.push({ text: percentageText, style: resolvedPercentageStyle });
	}

	return { segments };
}
