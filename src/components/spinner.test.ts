import { expect, test, describe, spyOn, afterEach } from "bun:test";
import { Spinner, SPINNERS } from "./spinner";

describe("Spinner Class", () => {
	// Mock Date.now() to control time
	let currentTime = 1000;
	const dateSpy = spyOn(Date, "now").mockImplementation(() => currentTime);

	afterEach(() => {
		dateSpy.mockClear();
		currentTime = 1000;
	});

	test("initializes with correct defaults", () => {
		const spinner = new Spinner({ frames: ["a", "b"] });
		expect(spinner.getFrame()).toBe("a");
	});

	test("advances frames over time", () => {
		const spinner = new Spinner({ frames: ["a", "b", "c"], interval: 100 });

		// t=0 (1000)
		expect(spinner.getFrame()).toBe("a");

		// t=50 (1050) -> still frame 0
		currentTime = 1050;
		expect(spinner.getFrame()).toBe("a");

		// t=100 (1100) -> frame 1
		currentTime = 1100;
		expect(spinner.getFrame()).toBe("b");

		// t=200 (1200) -> frame 2
		currentTime = 1200;
		expect(spinner.getFrame()).toBe("c");

		// t=300 (1300) -> frame 0 (loop)
		currentTime = 1300;
		expect(spinner.getFrame()).toBe("a");
	});

	test("uses custom interval", () => {
		const spinner = new Spinner({ frames: ["a", "b"], interval: 50 });

		// t=0
		expect(spinner.getFrame()).toBe("a");

		// t=50 -> frame 1
		currentTime = 1050;
		expect(spinner.getFrame()).toBe("b");
	});
});

describe("Spinner Presets", () => {
	test("dots preset exists and has frames", () => {
		expect(SPINNERS.dots).toBeDefined();
		expect(SPINNERS.dots.length).toBeGreaterThan(0);
	});

	test("lines preset exists", () => {
		expect(SPINNERS.lines).toBeDefined();
		expect(SPINNERS.lines.length).toBe(4);
	});
});
