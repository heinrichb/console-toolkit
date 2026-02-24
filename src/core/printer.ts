import { PrinterOptions, StyledLine } from "./types";
import { resolveStyle, RESET } from "./style";

const ESC = "\x1b";

// -----------------
// Printer Class
// -----------------

/**
 * Handles rendering StyledLines to the terminal with support for interactive overwriting.
 */
export class Printer {
	private linesRendered = 0;
	private isInteractive: boolean;

	constructor(options: PrinterOptions = {}) {
		this.isInteractive = options.interactive ?? false;
	}

	/**
	 * Generates the clear sequence to move cursor and clear previously rendered lines.
	 */
	private getClearSequence(): string {
		if (!this.isInteractive || this.linesRendered === 0) return "";
		return `${ESC}[1A${ESC}[2K\r`.repeat(this.linesRendered);
	}

	/**
	 * Renders an array of StyledLines to the standard output.
	 * If interactive mode is enabled, it clears the previously printed lines first.
	 *
	 * @param lines - The lines to print.
	 */
	public print(lines: StyledLine[]): void {
		let output = this.getClearSequence();
		lines.forEach((line) => {
			line.segments.forEach((seg) => {
				const ansiStyle = resolveStyle(seg.style);
				output += `${ansiStyle}${seg.text}${RESET}`;
			});
			output += "\n";
		});
		process.stdout.write(output);
		this.linesRendered = lines.length;
	}
}
