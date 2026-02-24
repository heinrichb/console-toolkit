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

	test("runDemo executes correctly", async () => {
		// Just await the function call; we expect it not to throw.
		await runDemo();

		expect(clearSpy).toHaveBeenCalled();
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Static Dual Column Demo"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Demo Complete!"));
		expect(stdoutSpy).toHaveBeenCalled();
	});
});
