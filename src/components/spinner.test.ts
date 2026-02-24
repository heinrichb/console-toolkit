import { expect, test, describe, spyOn, afterEach, beforeEach } from "bun:test";
import { Spinner, SPINNERS } from "./spinner";

describe("Spinner Class", () => {
	let now = 1000;
	// Mock Date.now() to control time
	const dateSpy = spyOn(Date, "now").mockImplementation(() => now);

	beforeEach(() => {
		now = 1000;
		dateSpy.mockClear();
		dateSpy.mockImplementation(() => now);
	});

	afterEach(() => {
		dateSpy.mockClear();
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
		now = 1050;
		expect(spinner.getFrame()).toBe("a");

		// t=100 (1100) -> frame 1
		now = 1100;
		expect(spinner.getFrame()).toBe("b");

		// t=200 (1200) -> frame 2
		now = 1200;
		expect(spinner.getFrame()).toBe("c");

		// t=300 (1300) -> frame 0 (loop)
		now = 1300;
		expect(spinner.getFrame()).toBe("a");
	});

	test("uses custom interval", () => {
		const spinner = new Spinner({ frames: ["a", "b"], interval: 50 });

		// t=0
		expect(spinner.getFrame()).toBe("a");

		// t=50 -> frame 1
		now = 1050;
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
	});
});
