import { expect, test, describe, spyOn, afterEach, beforeEach } from "bun:test";
import { runDemo } from "./demo";

describe("Demo Script", () => {
	const logSpy = spyOn(console, "log").mockImplementation(() => undefined);
	const clearSpy = spyOn(console, "clear").mockImplementation(() => undefined);
	const stdoutSpy = spyOn(process.stdout, "write").mockImplementation(() => true);

	const originalTimeout = global.setTimeout;

	beforeEach(() => {
		global.setTimeout = ((fn: () => void) => {
			fn();
		}) as unknown as typeof setTimeout;
	});

	afterEach(() => {
		logSpy.mockClear();
		clearSpy.mockClear();
		stdoutSpy.mockClear();
		global.setTimeout = originalTimeout;
	});

	test("runDemo executes all sections without errors", async () => {
		await runDemo();

		expect(clearSpy).toHaveBeenCalled();
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Colors & Modifiers"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Gradients"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Multi-Column Layouts"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Tables"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Gradient Presets"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("ASCII Presets"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Render to String"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Live Demo"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Demo complete!"));
		expect(stdoutSpy).toHaveBeenCalled();
	});
});
