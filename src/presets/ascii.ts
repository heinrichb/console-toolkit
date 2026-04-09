import { PrintLine, Color } from "../core/types";
import { interpolateGradient } from "../core/style";
import { line, segment } from "../core/builders";

// -----------------
// Presets
// -----------------

/**
 * Returns the classic Dragon ASCII art as PrintLines with a vertical color gradient.
 *
 * @param colorsOrStart - A Color array for multi-stop gradients, or a single start color. Defaults to red.
 * @param endColor - End color when using the two-argument form. Defaults to amber.
 */
export function getDragon(colorsOrStart: Color | Color[] = "#EF4444", endColor?: Color): PrintLine[] {
	const rawDragon = [
		"                ^    ^",
		"               / \\  //\\",
		" |\\___/|      /   \\//  .\\",
		" /O  O  \\__  /    //  | \\ \\",
		"/     /  \\_/_/    //   |  \\  \\",
		"@___@'    \\_//   //    |   \\   \\ ",
		"   |       \\_// //     |    \\    \\ ",
		"   |        \\///      |     \\     \\ ",
		"  _|_ /   )  //       |      \\     _\\",
		" '/,_ _ _/  ( ; -.    |    _ _\\.-~        .-~~~^-.",
		" ,-{        _      `-.|.-~-.           .~         `.",
		"  '/\\      /                 ~-. _ .-~      .-~^-.  \\",
		"     `.   {            }                   /      \\  \\",
		"   .----~-\\.        \\-'                 .~         \\  `. \\^-.",
		"  ///.----..>    c   \\             _ -~             `.  ^-`   ^-_",
		"    ///-._ _ _ _ _ _ _}^ - - - - ~                     ~--,   .-~",
		"                                                          /.-'"
	];

	const colors: Color[] = Array.isArray(colorsOrStart) ? colorsOrStart : [colorsOrStart, endColor ?? "#F59E0B"];
	return rawDragon.map((text, i) => {
		const factor = rawDragon.length <= 1 ? 0 : i / (rawDragon.length - 1);
		const color = interpolateGradient(colors, factor);
		return line([segment(text, { color })]);
	});
}
