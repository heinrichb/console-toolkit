import { Color } from "../core/types";

/**
 * Pre-defined gradient color arrays for common use cases.
 * Use with any style's `color` or `bgColor` property that accepts `Color[]`.
 */
export const GRADIENTS: Record<string, Color[]> = {
	rainbow: ["#EF4444", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6"],
	ocean: ["#1E3A5F", "#0E7490", "#06B6D4", "#67E8F9"],
	fire: ["#7F1D1D", "#EF4444", "#F59E0B", "#FDE047"],
	sunset: ["#7C3AED", "#EC4899", "#F97316", "#FBBF24"],
	forest: ["#064E3B", "#10B981", "#84CC16", "#BEF264"],
	monochrome: ["#000000", "#6B7280", "#FFFFFF"]
};
