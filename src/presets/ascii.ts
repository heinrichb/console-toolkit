import { StyledLine } from "../core/types";
import { interpolateColor } from "../core/style";

// -----------------
// Presets
// -----------------

/**
 * Returns the classic Dragon ASCII art as StyledLines with a vertical color gradient.
 */
export function getDragonLines(startColor = "#EF4444", endColor = "#F59E0B"): StyledLine[] {
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
		const colorStyle = interpolateColor(startColor, endColor, factor);
		return { segments: [{ text, style: colorStyle }] };
	});
}
