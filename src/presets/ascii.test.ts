import { expect, test, describe } from "bun:test";
import { getDragonLines } from "./ascii";

describe("Presets", () => {
	test("getDragonLines returns valid array", () => {
		const lines = getDragonLines();
		expect(lines.length).toBeGreaterThan(0);

		const firstSegmentStyle = lines[0].segments[0].style;
		expect(firstSegmentStyle).toBeDefined();

		if (firstSegmentStyle) {
			// Check that color is defined and is hex
			expect(firstSegmentStyle.color).toBeDefined();
			if (typeof firstSegmentStyle.color === "string") {
				expect(firstSegmentStyle.color.startsWith("#")).toBe(true);
			} else {
				// Fail if it's not a string (e.g. array)
				expect(typeof firstSegmentStyle.color).toBe("string");
			}
		}
	});
});
