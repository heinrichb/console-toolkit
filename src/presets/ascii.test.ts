import { expect, test, describe } from "bun:test";
import { getDragon } from "./ascii";

describe("Presets", () => {
	test("getDragon returns valid array", () => {
		const dragon = getDragon();
		expect(Array.isArray(dragon)).toBe(true);
		expect(dragon.length).toBeGreaterThan(0);

		// Check that color is defined and is hex
		const firstLine = dragon[0];
		expect(firstLine.segments[0].style?.color).toBeDefined();

		const color = firstLine.segments[0].style?.color as string;
		// Fail if it's not a string (e.g. array)
		expect(typeof color).toBe("string");
		expect(color.startsWith("#")).toBe(true);
	});
});
