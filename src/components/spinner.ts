export type SpinnerFrames = string[];

export interface SpinnerOptions {
	/**
	 * The array of frames to cycle through.
	 */
	frames: SpinnerFrames;
	/**
	 * The interval in milliseconds between frames.
	 * Defaults to 80ms.
	 */
	interval?: number;
}

/**
 * Common spinner frame presets.
 */
export const SPINNERS = {
	dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
	lines: ["-", "\\", "|", "/"],
	arrows: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
	circle: ["◐", "◓", "◑", "◒"],
	square: ["▖", "▘", "▝", "▗"]
};

/**
 * A stateful spinner that calculates the current frame based on elapsed time.
 * Designed to be used within a render loop (e.g. Printer.print loop).
 */
export class Spinner {
	private frames: SpinnerFrames;
	private interval: number;
	private startTime: number;

	constructor(options: SpinnerOptions) {
		this.frames = options.frames;
		this.interval = options.interval ?? 80;
		this.startTime = Date.now();
	}

	/**
	 * Returns the current frame based on the elapsed time.
	 */
	public getFrame(): string {
		const now = Date.now();
		const elapsed = now - this.startTime;
		const index = Math.floor(elapsed / this.interval) % this.frames.length;
		return this.frames[index];
	}
}
