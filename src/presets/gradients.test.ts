import { expect, test, describe } from "bun:test";
import { GRADIENTS } from "./gradients";

describe("Gradient Presets", () => {
	test("all presets are defined and non-empty", () => {
		const keys = Object.keys(GRADIENTS);
		expect(keys.length).toBeGreaterThanOrEqual(6);
		for (const key of keys) {
			expect(GRADIENTS[key].length).toBeGreaterThanOrEqual(2);
		}
	});

	test("all colors are valid hex format", () => {
		for (const [, colors] of Object.entries(GRADIENTS)) {
			for (const color of colors) {
				expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
			}
		}
	});

	test("specific presets exist", () => {
		expect(GRADIENTS.rainbow).toBeDefined();
		expect(GRADIENTS.ocean).toBeDefined();
		expect(GRADIENTS.fire).toBeDefined();
		expect(GRADIENTS.sunset).toBeDefined();
		expect(GRADIENTS.forest).toBeDefined();
		expect(GRADIENTS.monochrome).toBeDefined();
	});
});
