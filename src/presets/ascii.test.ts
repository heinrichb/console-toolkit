import { expect, test, describe } from "bun:test";
import { getDragonLines } from "./ascii";

describe("Presets", () => {
	test("getDragonLines returns valid array", () => {
		const lines = getDragonLines();
		expect(lines.length).toBeGreaterThan(0);

		const firstSegmentStyle = lines[0].segments[0].style as string;
		expect(firstSegmentStyle.startsWith("#")).toBe(true);
	});
});
