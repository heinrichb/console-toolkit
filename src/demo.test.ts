import { expect, test, describe, spyOn, afterEach, beforeEach } from "bun:test";
import { runDemo } from "./demo";

describe("Demo Script", () => {
	const logSpy = spyOn(console, "log").mockImplementation(() => {});
	const clearSpy = spyOn(console, "clear").mockImplementation(() => {});
	const stdoutSpy = spyOn(process.stdout, "write").mockImplementation(() => true);

	const originalTimeout = global.setTimeout;

	beforeEach(() => {
		// Mock setTimeout to execute immediately
		// @ts-ignore
		global.setTimeout = (fn: Function) => fn();
	});

	afterEach(() => {
		logSpy.mockClear();
		clearSpy.mockClear();
		stdoutSpy.mockClear();
		global.setTimeout = originalTimeout;
	});

	test("runDemo executes correctly", async () => {
		await expect(runDemo()).resolves.toBeUndefined();

		expect(clearSpy).toHaveBeenCalled();
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Static Dual Column Demo"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Demo Complete!"));

		// Ensure stdout.write was called for the interactive portion
		expect(stdoutSpy).toHaveBeenCalled();
	});
});
