import { Color, PrintBlock, PrinterOptions, PrintLine, PrintStyle } from "./types";
import {
	ESC,
	getGradientColorFromRgb,
	getGradientBgColorFromRgb,
	rgbToBgAnsi,
	resolveColorToRgb,
	mergeStyles,
	resolveStyle,
	RESET,
	interpolateGradient,
	resolveModifiersToAnsi
} from "./style";

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
	 * Renders a PrintBlock to a string without writing to stdout or affecting live mode state.
	 * Useful for capturing output, testing, or composing before display.
	 *
	 * @param data - Optional data to update the printer with.
	 * @returns The rendered ANSI string.
	 */
	public renderToString(data?: PrintBlock): string {
		if (data) {
			this.data = data;
		}
		if (!this.data) return "";
		return this.renderBlock(this.data);
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
			return;
		}

		const output = this.getClearSequence() + this.renderBlock(this.data);
		process.stdout.write(output);
		this.linesRendered = this.data.lines.length;
	}

	/**
	 * Shared rendering core — builds the ANSI output string for a PrintBlock.
	 */
	private renderBlock(blockData: PrintBlock): string {
		let output = "";
		const lines = blockData.lines;
		const blockStyle = blockData.style ?? {};
		lines.forEach((ln, lineIndex) => {
			output += this.renderLine(ln, lineIndex, lines.length, blockStyle);
			output += "\n";
		});
		return output;
	}

	/**
	 * Resolves the block's vertical gradients (color and bgColor) to solid colors for a specific line.
	 */
	private resolveBlockStyleForLine(blockStyle: PrintStyle, lineIndex: number, totalLines: number): PrintStyle {
		return {
			modifiers: blockStyle.modifiers,
			color: this.resolveGradientForLine(blockStyle.color, lineIndex, totalLines),
			bgColor: this.resolveGradientForLine(blockStyle.bgColor, lineIndex, totalLines)
		};
	}

	/**
	 * Resolves a single color/gradient value to a solid color for a specific line position.
	 */
	private resolveGradientForLine(color: Color | Color[] | undefined, lineIndex: number, totalLines: number): Color | undefined {
		if (!color) return undefined;
		if (Array.isArray(color)) {
			if (totalLines <= 1) return color[0];
			return interpolateGradient(color, lineIndex / (totalLines - 1));
		}
		return color;
	}

	/**
	 * Renders a single line.
	 */
	private renderLine(line: PrintLine, lineIndex: number, totalLines: number, parentBlockStyle: PrintStyle): string {
		const baseLineStyle = this.resolveBlockStyleForLine(parentBlockStyle, lineIndex, totalLines);
		const effectiveLineStyle = mergeStyles(baseLineStyle, line.style);

		const totalChars = line.segments.reduce((acc, seg) => acc + seg.text.length, 0);
		let currentCharIndex = 0;
		let lineOutput = "";

		line.segments.forEach((seg) => {
			const effectiveSegmentStyle = mergeStyles(effectiveLineStyle, seg.style);
			const hasFgGradient = Array.isArray(effectiveSegmentStyle.color);
			const hasBgGradient = Array.isArray(effectiveSegmentStyle.bgColor);

			if (hasFgGradient || hasBgGradient) {
				// Per-character gradient path — handles any combination of fg/bg gradients
				const text = seg.text;
				const isGlobalGradient = effectiveSegmentStyle.color === effectiveLineStyle.color;

				// Pre-resolve foreground colors
				const fgRgbColors = hasFgGradient ? (effectiveSegmentStyle.color as Color[]).map(resolveColorToRgb) : undefined;
				const solidFgAnsi =
					!hasFgGradient && effectiveSegmentStyle.color
						? (() => {
								const { r, g, b } = resolveColorToRgb(effectiveSegmentStyle.color as Color);
								return `\x1b[38;2;${r};${g};${b}m`;
							})()
						: "";

				// Pre-resolve background colors
				const bgRgbColors = hasBgGradient ? (effectiveSegmentStyle.bgColor as Color[]).map(resolveColorToRgb) : undefined;
				const solidBgAnsi =
					!hasBgGradient && effectiveSegmentStyle.bgColor
						? (() => {
								const { r, g, b } = resolveColorToRgb(effectiveSegmentStyle.bgColor as Color);
								return rgbToBgAnsi(r, g, b);
							})()
						: "";

				const modifiersAnsi = resolveModifiersToAnsi(effectiveSegmentStyle.modifiers);

				for (let i = 0; i < text.length; i++) {
					let factor = 0;
					if (isGlobalGradient && totalChars > 1) {
						factor = (currentCharIndex + i) / (totalChars - 1);
					} else if (!isGlobalGradient && text.length > 1) {
						factor = i / (text.length - 1);
					}

					const fgAnsi = fgRgbColors ? getGradientColorFromRgb(fgRgbColors, factor) : solidFgAnsi;
					const bgAnsi = bgRgbColors ? getGradientBgColorFromRgb(bgRgbColors, factor) : solidBgAnsi;
					lineOutput += `${modifiersAnsi}${fgAnsi}${bgAnsi}${text[i]}`;
				}
				lineOutput += RESET;
			} else {
				// Solid path — resolveStyle handles both color and bgColor
				const ansi = resolveStyle(effectiveSegmentStyle);
				lineOutput += `${ansi}${seg.text}${RESET}`;
			}

			currentCharIndex += seg.text.length;
		});

		return lineOutput;
	}
}
