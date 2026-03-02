
## 2024-05-24 - Pre-resolve Gradient Colors to RGB Arrays
**Learning:** In text-based terminal utilities, computing multi-stop gradients per character is a major performance bottleneck due to redundant regex and string parsing inside `resolveColorToRgb` (e.g., `hexToRgb`).
**Action:** Always hoist color-to-RGB resolution out of character loops. Pre-resolve colors to an array of `RGB` objects (`{r,g,b}`), then pass the pre-computed array into the interpolation function (`getGradientColorFromRgb`). This changes the operation from O(C * N) to O(C) + O(N).
