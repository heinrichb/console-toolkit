import { expect, test, describe } from "bun:test";
import { segment, line, block } from "./builders";
import { PrintStyle, PrintSegment, PrintLine, PrintBlock } from "./types";

describe("Builders", () => {
	test("segment creates a PrintSegment with text only", () => {
		const result = segment("Hello");
		const expected: PrintSegment = { text: "Hello" };
		expect(result).toEqual(expected);
	});

	test("segment creates a PrintSegment with style", () => {
		const style: PrintStyle = { color: "red", modifiers: ["bold"] };
		const result = segment("Hello", style);
		const expected: PrintSegment = { text: "Hello", style };
		expect(result).toEqual(expected);
	});

	test("line creates a PrintLine with segments only", () => {
		const seg1 = segment("Hello");
		const seg2 = segment("World");
		const result = line([seg1, seg2]);
		const expected: PrintLine = { segments: [seg1, seg2] };
		expect(result).toEqual(expected);
	});

	test("line creates a PrintLine with style", () => {
		const seg1 = segment("Hello");
		const style: PrintStyle = { color: "blue" };
		const result = line([seg1], style);
		const expected: PrintLine = { segments: [seg1], style };
		expect(result).toEqual(expected);
	});

	test("block creates a PrintBlock with lines only", () => {
		const l1 = line([segment("Line 1")]);
		const result = block([l1]);
		const expected: PrintBlock = { lines: [l1] };
		expect(result).toEqual(expected);
	});

	test("block creates a PrintBlock with style", () => {
		const l1 = line([segment("Line 1")]);
		const style: PrintStyle = { color: "green" };
		const result = block([l1], style);
		const expected: PrintBlock = { lines: [l1], style };
		expect(result).toEqual(expected);
	});
});
