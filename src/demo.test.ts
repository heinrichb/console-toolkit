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
		}) as any;
	});

	afterEach(() => {
		logSpy.mockClear();
		clearSpy.mockClear();
		stdoutSpy.mockClear();
		global.setTimeout = originalTimeout;
	});

	test("runDemo executes correctly", async () => {
		expect(runDemo()).resolves.toBeUndefined();

		expect(clearSpy).toHaveBeenCalled();
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Static Dual Column Demo"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Demo Complete!"));
		expect(stdoutSpy).toHaveBeenCalled();
	});
});
