import { expect, test, describe, spyOn, afterEach } from "bun:test";
import { Printer } from "./printer";
import { PrintBlock } from "./types";
import { resolveColorToAnsi } from "./style";

const ESC = "\x1b";

describe("Printer", () => {
	// Mock process.stdout.write to prevent actual output during tests
	const stdoutSpy = spyOn(process.stdout, "write").mockImplementation(() => true);

	afterEach(() => {
		stdoutSpy.mockClear();
	});

	test("Printer.print outputs basic text with solid styles", () => {
		const printer = new Printer();
		const block: PrintBlock = {
			lines: [{ segments: [{ text: "Hello", style: { color: "red" } }] }]
		};
		printer.print(block);

		expect(stdoutSpy).toHaveBeenCalledTimes(1);
		const output = stdoutSpy.mock.calls[0][0] as string;
		// Check for Red ANSI + Text + Reset
		expect(output).toContain(`${ESC}[38;2;239;68;68mHello${ESC}[0m`);
	});

	test("Printer.print applies Block style to lines (inheritance)", () => {
		const printer = new Printer();
		const block: PrintBlock = {
			style: { color: "blue", modifiers: ["bold"] },
			lines: [{ segments: [{ text: "Line 1" }] }, { segments: [{ text: "Line 2" }] }]
		};
		printer.print(block);

		const output = stdoutSpy.mock.calls[0][0] as string;
		const blueAnsi = resolveColorToAnsi("blue");
		const boldAnsi = `${ESC}[1m`;

		// Both lines should be Blue + Bold
		// Matches: Bold + Blue + Text + Reset
		expect(output).toContain(`${boldAnsi}${blueAnsi}Line 1${ESC}[0m`);
		expect(output).toContain(`${boldAnsi}${blueAnsi}Line 2${ESC}[0m`);
	});

	test("Printer handles Block Vertical Gradient (Lines inherit solid colors)", () => {
		const printer = new Printer();
		const block: PrintBlock = {
			style: { color: ["#000000", "#FFFFFF"] }, // Black to White
			lines: [
				{ segments: [{ text: "Start" }] }, // Should be Black
				{ segments: [{ text: "Middle" }] }, // Should be Gray
				{ segments: [{ text: "End" }] } // Should be White
			]
		};
		printer.print(block);

		const output = stdoutSpy.mock.calls[0][0] as string;

		const blackAnsi = resolveColorToAnsi("#000000");
		const whiteAnsi = resolveColorToAnsi("#FFFFFF");
		const grayAnsi = resolveColorToAnsi("#808080");

		expect(output).toContain(`${blackAnsi}Start${ESC}[0m`);
		expect(output).toContain(`${grayAnsi}Middle${ESC}[0m`);
		expect(output).toContain(`${whiteAnsi}End${ESC}[0m`);
	});

	test("Printer handles Line Override (Horizontal Gradient)", () => {
		const printer = new Printer();
		const block: PrintBlock = {
			lines: [
				{
					style: { color: ["#FF0000", "#0000FF"] }, // Red to Blue
					segments: [{ text: "GB" }] // Gradient applies to these 2 chars
				}
			]
		};
		printer.print(block);

		const output = stdoutSpy.mock.calls[0][0] as string;

		// First char 'G' should be Red (start)
		// Second char 'B' should be Blue (end) - wait, factor logic?
		// Length 2. index 0 -> factor 0. index 1 -> factor 1.

		const redAnsi = resolveColorToAnsi("#FF0000");
		const blueAnsi = resolveColorToAnsi("#0000FF");

		expect(output).toContain(`${redAnsi}G`);
		expect(output).toContain(`${blueAnsi}B`);
	});

	test("Printer handles Segment Override (Solid overrides Line Gradient)", () => {
		const printer = new Printer();
		const block: PrintBlock = {
			lines: [
				{
					style: { color: ["#FF0000", "#0000FF"] }, // Line Gradient
					segments: [
						{ text: "A" }, // Inherits Gradient (Red)
						{ text: "B", style: { color: "green" } } // Override Solid (Green)
					]
				}
			]
		};
		printer.print(block);
		const output = stdoutSpy.mock.calls[0][0] as string;

		const redAnsi = resolveColorToAnsi("#FF0000");
		const greenAnsi = resolveColorToAnsi("green");

		expect(output).toContain(`${redAnsi}A`);
		expect(output).toContain(`${greenAnsi}B`);
	});

	test("Printer handles live clearing", () => {
		const printer = new Printer({ live: true });
		// Print 2 lines
		printer.print({
			lines: [{ segments: [{ text: "1" }] }, { segments: [{ text: "2" }] }]
		});

		// Print again (should clear 2 lines)
		printer.print({
			lines: [{ segments: [{ text: "New" }] }]
		});

		const clearSeq = `${ESC}[1A${ESC}[2K\r`;
		const expectedClear = clearSeq.repeat(2);

		const secondCallOutput = stdoutSpy.mock.calls[1][0] as string;
		expect(secondCallOutput.startsWith(expectedClear)).toBe(true);
	});
});
