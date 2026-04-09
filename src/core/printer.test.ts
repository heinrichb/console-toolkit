import { expect, test, describe, spyOn, afterEach } from "bun:test";
import { Printer } from "./printer";
import { resolveColorToAnsi } from "./style";
import { line, segment, block } from "./builders";

const ESC = "\x1b";

describe("Printer", () => {
	const stdoutSpy = spyOn(process.stdout, "write").mockImplementation(() => true);

	afterEach(() => {
		stdoutSpy.mockClear();
	});

	test("Printer.print outputs basic text with solid styles", () => {
		const printer = new Printer();
		const testBlock = block([line([segment("Hello", { color: "red" })])]);
		printer.print(testBlock);

		expect(stdoutSpy).toHaveBeenCalledTimes(1);
		const output = stdoutSpy.mock.calls[0][0] as string;
		// Check for Red ANSI + Text + Reset
		expect(output).toContain(`${ESC}[38;2;239;68;68mHello${ESC}[0m`);
	});

	test("Printer.print applies Block style to lines (inheritance)", () => {
		const printer = new Printer();
		const testBlock = block([line([segment("Line 1")]), line([segment("Line 2")])], {
			color: "blue",
			modifiers: ["bold"]
		});
		printer.print(testBlock);

		const output = stdoutSpy.mock.calls[0][0] as string;
		const blueAnsi = resolveColorToAnsi("blue");
		const boldAnsi = `${ESC}[1m`;

		// Matches: Bold + Blue + Text + Reset
		expect(output).toContain(`${boldAnsi}${blueAnsi}Line 1${ESC}[0m`);
		expect(output).toContain(`${boldAnsi}${blueAnsi}Line 2${ESC}[0m`);
	});

	test("Printer handles Block Vertical Gradient (Lines inherit solid colors)", () => {
		const printer = new Printer();
		const testBlock = block(
			[
				line([segment("Start")]), // Should be Black
				line([segment("Middle")]), // Should be Gray
				line([segment("End")]) // Should be White
			],
			{ color: ["#000000", "#FFFFFF"] }
		);
		printer.print(testBlock);

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
		const testBlock = block([
			line([segment("GB")], { color: ["#FF0000", "#0000FF"] }) // Gradient applies to these 2 chars
		]);
		printer.print(testBlock);

		const output = stdoutSpy.mock.calls[0][0] as string;

		const redAnsi = resolveColorToAnsi("#FF0000");
		const blueAnsi = resolveColorToAnsi("#0000FF");

		expect(output).toContain(`${redAnsi}G`);
		expect(output).toContain(`${blueAnsi}B`);
	});

	test("Printer handles Segment Override (Solid overrides Line Gradient)", () => {
		const printer = new Printer();
		const testBlock = block([
			line(
				[
					segment("A"), // Inherits Gradient (Red)
					segment("B", { color: "green" }) // Override Solid (Green)
				],
				{ color: ["#FF0000", "#0000FF"] }
			)
		]);
		printer.print(testBlock);
		const output = stdoutSpy.mock.calls[0][0] as string;

		const redAnsi = resolveColorToAnsi("#FF0000");
		const greenAnsi = resolveColorToAnsi("green");

		expect(output).toContain(`${redAnsi}A`);
		expect(output).toContain(`${greenAnsi}B`);
	});

	test("Printer handles live clearing", () => {
		const printer = new Printer({ live: true });
		// Print 2 lines
		printer.print(block([line([segment("1")]), line([segment("2")])]));

		// Print again (should clear 2 lines)
		printer.print(block([line([segment("New")])]));

		const clearSeq = `${ESC}[1A${ESC}[2K\r`;
		const expectedClear = clearSeq.repeat(2);

		const secondCallOutput = stdoutSpy.mock.calls[1][0] as string;
		expect(secondCallOutput.startsWith(expectedClear)).toBe(true);
	});

	test("renderToString returns rendered output as string", () => {
		const printer = new Printer();
		const testBlock = block([line([segment("Hello", { color: "red" })])]);

		stdoutSpy.mockClear();
		const result = printer.renderToString(testBlock);

		expect(result).toContain(`${ESC}[38;2;239;68;68mHello${ESC}[0m`);
		expect(stdoutSpy).not.toHaveBeenCalled();
	});

	test("renderToString does not include clear sequences in live mode", () => {
		const printer = new Printer({ live: true });
		printer.print(block([line([segment("1")]), line([segment("2")])]));
		stdoutSpy.mockClear();

		const result = printer.renderToString(block([line([segment("New")])]));

		expect(result).not.toContain(`${ESC}[1A`);
		expect(result).not.toContain(`${ESC}[2K`);
	});

	test("renderToString does not affect linesRendered", () => {
		const printer = new Printer({ live: true });
		printer.renderToString(block([line([segment("Ghost")])]));

		// Now print — should NOT clear any lines since renderToString didn't update linesRendered
		printer.print(block([line([segment("Real")])]));
		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output.startsWith(`${ESC}[1A`)).toBe(false);
	});

	test("renderToString returns empty string when no data", () => {
		const printer = new Printer();
		expect(printer.renderToString()).toBe("");
	});

	test("Printer handles solid bgColor on block", () => {
		const printer = new Printer();
		const testBlock = block([line([segment("Hello")])], { bgColor: "blue" });
		printer.print(testBlock);

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("48;2;");
	});

	test("Printer handles vertical bgColor gradient", () => {
		const printer = new Printer();
		const testBlock = block([line([segment("Start")]), line([segment("Middle")]), line([segment("End")])], {
			bgColor: ["#000000", "#FFFFFF"]
		});
		printer.print(testBlock);

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("48;2;0;0;0"); // black bg
		expect(output).toContain("48;2;255;255;255"); // white bg
	});

	test("Printer handles horizontal bgColor gradient", () => {
		const printer = new Printer();
		const testBlock = block([line([segment("AB", { bgColor: ["#FF0000", "#0000FF"] })])]);
		printer.print(testBlock);

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("48;2;255;0;0"); // red bg
		expect(output).toContain("48;2;0;0;255"); // blue bg
	});

	test("Printer handles bg gradient + solid fg together", () => {
		const printer = new Printer();
		const testBlock = block([line([segment("AB", { color: "red", bgColor: ["#000000", "#FFFFFF"] })])]);
		printer.print(testBlock);

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("38;2;"); // solid fg red
		expect(output).toContain("48;2;0;0;0"); // bg gradient start
		expect(output).toContain("48;2;255;255;255"); // bg gradient end
	});

	test("Printer handles fg gradient + solid bg together", () => {
		const printer = new Printer();
		const testBlock = block([line([segment("AB", { color: ["#000000", "#FFFFFF"], bgColor: "blue" })])]);
		printer.print(testBlock);

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("38;2;"); // fg gradient
		expect(output).toContain("48;2;"); // bg solid
	});

	test("Printer handles fg gradient + bg gradient together", () => {
		const printer = new Printer();
		const testBlock = block([line([segment("AB", { color: ["#000000", "#FFFFFF"], bgColor: ["#FF0000", "#0000FF"] })])]);
		printer.print(testBlock);

		const output = stdoutSpy.mock.calls[0][0] as string;
		expect(output).toContain("38;2;0;0;0"); // fg black
		expect(output).toContain("48;2;255;0;0"); // bg red
		expect(output).toContain("38;2;255;255;255"); // fg white
		expect(output).toContain("48;2;0;0;255"); // bg blue
	});

	test("Printer.clear() manually clears the output", () => {
		const printer = new Printer({ live: true });
		printer.print(block([line([segment("Line 1")])]));

		expect(stdoutSpy).toHaveBeenCalledTimes(1);

		printer.clear();

		expect(stdoutSpy).toHaveBeenCalledTimes(2);
		const clearSeq = `${ESC}[1A${ESC}[2K\r`;
		const expectedClear = clearSeq.repeat(1);
		const clearOutput = stdoutSpy.mock.calls[1][0] as string;

		expect(clearOutput).toBe(expectedClear);
	});
});
