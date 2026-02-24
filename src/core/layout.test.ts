import { expect, test, describe, spyOn, afterEach } from "bun:test";
import { mergeMultipleColumns, printColumns } from "./layout";
import { StyledLine } from "./types";
import { getLineLength } from "./utils";

const lineA: StyledLine = { segments: [{ text: "Hello", style: [] }] };
const lineB: StyledLine = { segments: [{ text: "World!!", style: [] }] };

describe("Layout Utilities", () => {
	const stdoutSpy = spyOn(process.stdout, "write").mockImplementation(() => true);

	afterEach(() => {
		stdoutSpy.mockClear();
	});

	test("mergeMultipleColumns handles asymmetric column lengths", () => {
		const merged = mergeMultipleColumns([[lineA], [lineB, lineB]], " | ", "", [10]);

		expect(merged.length).toBe(2);
		expect(getLineLength(merged[1])).toBe(10 + 3 + 7);
	});

	test("printColumns executes correctly", () => {
		printColumns([[lineA], [lineB]]);

		expect(stdoutSpy).toHaveBeenCalled();

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("Hello");
		expect(output).toContain("World!!");
	});

	test("printColumns handles undefined style in segments", () => {
		const lineNoStyle: StyledLine = { segments: [{ text: "NoStyle" }] };
		printColumns([[lineNoStyle]]);

		expect(stdoutSpy).toHaveBeenCalled();
		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("NoStyle");
	});

	test("printColumns handles empty columns", () => {
		printColumns([]);
		expect(stdoutSpy).toHaveBeenCalled(); // Should clear lines if interactive, or do nothing.
	});

	test("printColumns handles 3 columns", () => {
		printColumns([[lineA], [lineA], [lineB]]);

		expect(stdoutSpy).toHaveBeenCalled();

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("Hello");
		expect(output).toContain("World!!");
	});
});
