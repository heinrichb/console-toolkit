import { expect, test, describe, spyOn, afterEach } from "bun:test";
import { mergeColumns, printColumns } from "./layout";
import { getLineLength } from "./utils";
import { line, segment } from "./builders";

const lineA = line([segment("Hello")]);
const lineB = line([segment("World!!")]);

describe("Layout Utilities", () => {
	const stdoutSpy = spyOn(process.stdout, "write").mockImplementation(() => true);

	afterEach(() => {
		stdoutSpy.mockClear();
	});

	test("mergeColumns handles asymmetric column lengths", () => {
		// Column 1: [lineA]
		// Column 2: [lineB, lineB]
		// Separator: " | "
		// Widths: [10] (first col width 10)
		const merged = mergeColumns([[lineA], [lineB, lineB]], " | ", undefined, [10]);

		expect(merged.length).toBe(2);

		// Second merged line:
		// Col 1 is empty (pad to 10) + " | " + Col 2 (lineB, length 7)
		// 10 + 3 + 7 = 20
		expect(getLineLength(merged[1])).toBe(20);
	});

	test("printColumns executes correctly", () => {
		printColumns([[lineA], [lineB]]);

		expect(stdoutSpy).toHaveBeenCalled();

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("Hello");
		expect(output).toContain("World!!");
	});

	test("printColumns handles undefined style in segments", () => {
		const lineNoStyle = line([segment("NoStyle")]);
		printColumns([[lineNoStyle]]);

		expect(stdoutSpy).toHaveBeenCalled();
		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("NoStyle");
	});

	test("printColumns handles empty columns", () => {
		printColumns([]);
		expect(stdoutSpy).toHaveBeenCalled();
	});

	test("printColumns handles 3 columns", () => {
		printColumns([[lineA], [lineA], [lineB]]);

		expect(stdoutSpy).toHaveBeenCalled();

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("Hello");
		expect(output).toContain("World!!");
	});
});
