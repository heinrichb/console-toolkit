import { expect, test, describe } from "bun:test";
import { createTable } from "./table";
import { PrintStyle } from "../core/types";

describe("createTable", () => {
	test("renders basic table with headers and rows", () => {
		const lines = createTable({
			headers: ["Name", "Age"],
			rows: [
				["Alice", "30"],
				["Bob", "25"]
			]
		});

		const text = lines.map((l) => l.segments.map((s) => s.text).join("")).join("\n");
		expect(text).toContain("┌");
		expect(text).toContain("│");
		expect(text).toContain("└");
		expect(text).toContain("Name");
		expect(text).toContain("Alice");
		expect(text).toContain("Bob");
	});

	test("renders table without headers", () => {
		const lines = createTable({
			rows: [
				["A", "B"],
				["C", "D"]
			]
		});

		const text = lines.map((l) => l.segments.map((s) => s.text).join("")).join("\n");
		expect(text).toContain("A");
		expect(text).toContain("D");
		// No header separator (├) since no headers — only top, data rows, bottom
		const fullText = lines.map((l) => l.segments.map((s) => s.text).join("")).join("");
		expect(fullText).not.toContain("├");
	});

	test("auto-computes column widths from content", () => {
		const lines = createTable({
			headers: ["X", "LongHeader"],
			rows: [["Short", "Y"]]
		});

		// Column 1 width should be max("X".length, "Short".length) = 5
		// Column 2 width should be max("LongHeader".length, "Y".length) = 10
		const topBorder = lines[0].segments.map((s) => s.text).join("");
		// With padding 1: col1 = 5+2 = 7 chars, col2 = 10+2 = 12 chars
		expect(topBorder).toContain("─".repeat(7));
		expect(topBorder).toContain("─".repeat(12));
	});

	test("respects fixed columnWidths", () => {
		const lines = createTable({
			rows: [["A", "B"]],
			columnWidths: [10, 20]
		});

		const topBorder = lines[0].segments.map((s) => s.text).join("");
		// With padding 1: 10+2=12, 20+2=22
		expect(topBorder).toContain("─".repeat(12));
		expect(topBorder).toContain("─".repeat(22));
	});

	test("handles rows with fewer columns than headers", () => {
		const lines = createTable({
			headers: ["A", "B", "C"],
			rows: [["1"]]
		});

		const text = lines.map((l) => l.segments.map((s) => s.text).join("")).join("\n");
		expect(text).toContain("A");
		expect(text).toContain("1");
		// Should have 3 columns even though row only has 1
		const topBorder = lines[0].segments.map((s) => s.text).join("");
		expect((topBorder.match(/┬/g) || []).length).toBe(2); // 2 junctions = 3 columns
	});

	test("handles rows with more columns than headers", () => {
		const lines = createTable({
			headers: ["A"],
			rows: [["1", "2", "3"]]
		});

		const text = lines.map((l) => l.segments.map((s) => s.text).join("")).join("\n");
		expect(text).toContain("1");
		expect(text).toContain("2");
		expect(text).toContain("3");
	});

	test("applies headerStyle to header cells", () => {
		const headerStyle: PrintStyle = { color: "red" };
		const lines = createTable({
			headers: ["Name"],
			rows: [["Alice"]],
			headerStyle
		});

		// Header row is line index 1 (after top border)
		const headerRow = lines[1];
		const headerCell = headerRow.segments.find((s) => s.text.includes("Name"));
		expect(headerCell?.style).toEqual(headerStyle);
	});

	test("applies borderStyle to border characters", () => {
		const borderStyle: PrintStyle = { color: "gray" };
		const lines = createTable({
			rows: [["A"]],
			borderStyle
		});

		// Top border line should have borderStyle
		expect(lines[0].segments[0].style).toEqual(borderStyle);
	});

	test("renders with double border style", () => {
		const lines = createTable({
			rows: [["A"]],
			border: "double"
		});

		const text = lines.map((l) => l.segments.map((s) => s.text).join("")).join("\n");
		expect(text).toContain("╔");
		expect(text).toContain("║");
		expect(text).toContain("╚");
	});

	test("renders with rounded border style", () => {
		const lines = createTable({
			rows: [["A"]],
			border: "rounded"
		});

		const text = lines.map((l) => l.segments.map((s) => s.text).join("")).join("\n");
		expect(text).toContain("╭");
		expect(text).toContain("╰");
	});

	test("renders with no border", () => {
		const lines = createTable({
			headers: ["Name"],
			rows: [["Alice"]],
			border: "none"
		});

		const text = lines.map((l) => l.segments.map((s) => s.text).join("")).join("\n");
		expect(text).toContain("Name");
		expect(text).toContain("Alice");
		expect(text).not.toContain("│");
		expect(text).not.toContain("─");
	});

	test("handles empty rows array", () => {
		const lines = createTable({ rows: [] });
		expect(lines.length).toBe(0);
	});

	test("handles single-column table", () => {
		const lines = createTable({
			headers: ["Title"],
			rows: [["Row 1"]]
		});

		const topBorder = lines[0].segments.map((s) => s.text).join("");
		expect(topBorder).not.toContain("┬"); // No junction for single column
	});

	test("respects cellPadding option", () => {
		const lines = createTable({
			rows: [["A"]],
			cellPadding: 3
		});

		const dataRow = lines[1]; // After top border
		const cellContent = dataRow.segments.find((s) => s.text.includes("A"));
		// Should have 3 spaces on each side of "A"
		expect(cellContent?.text).toContain("   A");
	});

	test("applies style to data cells", () => {
		const style: PrintStyle = { color: "blue" };
		const lines = createTable({
			rows: [["A"]],
			style
		});

		const dataRow = lines[1];
		const cellContent = dataRow.segments.find((s) => s.text.includes("A"));
		expect(cellContent?.style).toEqual(style);
	});
});
