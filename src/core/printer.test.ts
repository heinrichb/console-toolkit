import { expect, test, describe, spyOn, afterEach } from "bun:test";
import { Printer } from "./printer";

describe("Printer", () => {
	const stdoutSpy = spyOn(process.stdout, "write").mockImplementation(() => true);

	afterEach(() => {
		stdoutSpy.mockClear();
	});

	test("Printer.print outputs to console with resolved styles", () => {
		const printer = new Printer();
		printer.print([{ segments: [{ text: "Test", style: "red" }] }]);

		expect(stdoutSpy).toHaveBeenCalled();

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("\x1b[31mTest");
	});

	test("Printer handles interactive clearing", () => {
		const printer = new Printer({ interactive: true });
		printer.print([{ segments: [{ text: "L1", style: "" }] }]);
		printer.print([{ segments: [{ text: "L2", style: "" }] }]);

		expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("\x1b[1A\x1b[2K\r"));
	});

	test("Printer optimizes clearing of multiple lines", () => {
		const printer = new Printer({ interactive: true });

		printer.print([
			{ segments: [{ text: "L1", style: "" }] },
			{ segments: [{ text: "L2", style: "" }] },
			{ segments: [{ text: "L3", style: "" }] }
		]);

		stdoutSpy.mockClear();

		printer.print([{ segments: [{ text: "New", style: "" }] }]);

		const clearSeq = "\x1b[1A\x1b[2K\r";
		const expectedClear = clearSeq.repeat(3);

		expect(stdoutSpy).toHaveBeenCalledTimes(1);

		const callArg = stdoutSpy.mock.calls[0][0] as string;
		expect(callArg.startsWith(expectedClear)).toBe(true);
	});
});
