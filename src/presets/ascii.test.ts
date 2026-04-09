import { expect, test, describe } from "bun:test";
import { getDragon } from "./ascii";

describe("Presets", () => {
	test("getDragon returns valid array with default colors", () => {
		const dragon = getDragon();
		expect(Array.isArray(dragon)).toBe(true);
		expect(dragon.length).toBeGreaterThan(0);

		const firstLine = dragon[0];
		expect(firstLine.segments[0].style?.color).toBeDefined();

		const color = firstLine.segments[0].style?.color as string;
		expect(typeof color).toBe("string");
		expect(color.startsWith("#")).toBe(true);
	});

	test("getDragon with two colors (backwards compat)", () => {
		const dragon = getDragon("#000000", "#FFFFFF");
		expect(dragon.length).toBe(17);

		const firstColor = dragon[0].segments[0].style?.color as string;
		const lastColor = dragon[16].segments[0].style?.color as string;
		expect(firstColor).toBe("#000000");
		expect(lastColor.startsWith("#")).toBe(true);
	});

	test("getDragon with Color array (multi-stop)", () => {
		const dragon = getDragon(["#FF0000", "#00FF00", "#0000FF"]);
		expect(dragon.length).toBe(17);

		// Each line should have a hex color
		for (const ln of dragon) {
			const color = ln.segments[0].style?.color as string;
			expect(typeof color).toBe("string");
			expect(color.startsWith("#")).toBe(true);
		}
	});

	test("getDragon with single color uses default end color", () => {
		const dragon = getDragon("#FF0000");
		expect(dragon.length).toBe(17);

		const firstColor = dragon[0].segments[0].style?.color as string;
		expect(firstColor).toBe("#ff0000");
	});
});
