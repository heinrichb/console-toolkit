import { PrintLine, Color } from "../core/types";
import { interpolateGradient } from "../core/style";
import { line, segment } from "../core/builders";

// -----------------
// Presets
// -----------------

/**
 * Returns the classic Dragon ASCII art as PrintLines with a vertical color gradient.
 *
 * @param colors - Array of gradient stops. Defaults to red-to-amber `["#EF4444", "#F59E0B"]`.
 */
export function getDragon(colors: Color[] = ["#EF4444", "#F59E0B"]): PrintLine[] {
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

	return rawDragon.map((text, i) => {
		const factor = rawDragon.length <= 1 ? 0 : i / (rawDragon.length - 1);
		const color = interpolateGradient(colors, factor);
		return line([segment(text, { color })]);
	});
}
