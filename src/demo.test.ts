import { expect, test, describe, spyOn, afterEach, beforeEach } from "bun:test";
import { runDemo } from "./demo";

describe("Demo Script", () => {
	const logSpy = spyOn(console, "log").mockImplementation(() => undefined);
	const clearSpy = spyOn(console, "clear").mockImplementation(() => undefined);
	const stdoutSpy = spyOn(process.stdout, "write").mockImplementation(() => true);

	const originalTimeout = global.setTimeout;

	beforeEach(() => {
		// Mocking setTimeout requires unknown casting due to return type mismatch in Bun (void vs Timer)
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
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Basic Styling"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Builder Functions"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Horizontal Gradients"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Vertical Gradients"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Multi-Column Layouts"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Live Progress Bar Demo"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Spinners Demo"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("ASCII Presets"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Demo Complete!"));
		expect(stdoutSpy).toHaveBeenCalled();
	});
});
