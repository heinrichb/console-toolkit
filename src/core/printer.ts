import { Color, PrintBlock, PrinterOptions, PrintLine, PrintStyle } from "./types";
import {
	mergeStyles,
	resolveStyle,
	RESET,
	interpolateColor,
	resolveModifiersToAnsi,
	resolveColorToRgb,
	getGradientColorFromRgb
} from "./style";

const ESC = "\x1b";

/**
 * Handles rendering PrintBlocks to the terminal with support for interactive/live overwriting.
 */
export class Printer {
	private linesRendered = 0;
	private isLive: boolean;
	private data?: PrintBlock;

	constructor(options: PrinterOptions = {}) {
		this.isLive = options.live ?? false;
		this.data = options.data;
	}

	/**
	 * Generates the clear sequence to move cursor and clear previously rendered lines.
	 */
	private getClearSequence(): string {
		if (!this.isLive || this.linesRendered === 0) return "";
		return `${ESC}[1A${ESC}[2K\r`.repeat(this.linesRendered);
	}

	/**
	 * Clears the console using the stored line count.
	 */
	public clear(): void {
		if (this.linesRendered > 0) {
			process.stdout.write(this.getClearSequence());
			this.linesRendered = 0;
		}
	}

	/**
	 * Renders the PrintBlock to the standard output.
	 * If data is provided, updates the internal state.
	 *
	 * @param data - Optional data to update the printer with.
	 */
	public print(data?: PrintBlock): void {
		if (data) {
			this.data = data;
		}

		if (!this.data) {
			return; // Nothing to print
		}

		let output = this.getClearSequence();
		const lines = this.data.lines;
		const blockStyle = this.data.style ?? {};

		lines.forEach((line, lineIndex) => {
			output += this.renderLine(line, lineIndex, lines.length, blockStyle);
			output += "\n";
		});

		process.stdout.write(output);
		this.linesRendered = lines.length;
	}

	/**
	 * Resolves the block's vertical gradient (if any) to a solid color for the specific line.
	 */
	private resolveBlockColorForLine(blockStyle: PrintStyle, lineIndex: number, totalLines: number): Color | undefined {
		if (!blockStyle.color) return undefined;

		if (Array.isArray(blockStyle.color)) {
			// Vertical Gradient
			if (totalLines <= 1) return blockStyle.color[0]; // Single line, use first color

			const colors = blockStyle.color;
			const factor = lineIndex / (totalLines - 1);

			// Interpolate manually to obtain Hex Color
			const f = Math.max(0, Math.min(1, factor));
			const segmentLength = 1 / (colors.length - 1);
			const segmentIndex = Math.min(Math.floor(f / segmentLength), colors.length - 2);
			const segmentFactor = (f - segmentIndex * segmentLength) / segmentLength;

			const c1 = colors[segmentIndex];
			const c2 = colors[segmentIndex + 1];

			return interpolateColor(c1, c2, segmentFactor);
		}

		return blockStyle.color;
	}

	/**
	 * Renders a single line.
	 */
	private renderLine(line: PrintLine, lineIndex: number, totalLines: number, parentBlockStyle: PrintStyle): string {
		// 1. Resolve Block Gradient to Solid Color for this line
		const blockColorForLine = this.resolveBlockColorForLine(parentBlockStyle, lineIndex, totalLines);

		// 2. Create Base Line Style (Block Modifiers + Resolved Block Color)
		const baseLineStyle: PrintStyle = {
			modifiers: parentBlockStyle.modifiers,
			color: blockColorForLine
		};

		// 3. Merge with Line's own style
		// If line.style has color, it overrides baseLineStyle.color
		const effectiveLineStyle = mergeStyles(baseLineStyle, line.style);

		// 4. Pre-calculate total chars for horizontal gradients
		const totalChars = line.segments.reduce((acc, seg) => acc + seg.text.length, 0);
		let currentCharIndex = 0;
		const lineOutput: string[] = [];

		line.segments.forEach((seg) => {
			const effectiveSegmentStyle = mergeStyles(effectiveLineStyle, seg.style);

			if (Array.isArray(effectiveSegmentStyle.color)) {
				// Gradient Handling (Horizontal)
				const colors = effectiveSegmentStyle.color;
				const text = seg.text;

				// Determine if we are using the Line's gradient (Global) or Segment's gradient (Local)
				// If effectiveSegmentStyle.color === effectiveLineStyle.color, it's inherited (Global)
				// Otherwise it's the segment's own gradient (Local)
				const isGlobalGradient = effectiveSegmentStyle.color === effectiveLineStyle.color;

				// Iterate characters to apply gradient
				const modifiersAnsi = resolveModifiersToAnsi(effectiveSegmentStyle.modifiers);
				const rgbColors = colors.map(resolveColorToRgb);

				for (let i = 0; i < text.length; i++) {
					let factor = 0;
					if (isGlobalGradient && totalChars > 1) {
						factor = (currentCharIndex + i) / (totalChars - 1);
					} else if (!isGlobalGradient && text.length > 1) {
						factor = i / (text.length - 1);
					}

					const colorAnsi = getGradientColorFromRgb(rgbColors, factor); // Returns ANSI Color Code
					lineOutput.push(`${modifiersAnsi}${colorAnsi}${text[i]}`);
				}
				lineOutput.push(RESET);
			} else {
				// Solid Color Handling
				const ansi = resolveStyle(effectiveSegmentStyle);
				lineOutput.push(`${ansi}${seg.text}${RESET}`);
			}

			currentCharIndex += seg.text.length;
		});

		return lineOutput.join("");
	}
}
