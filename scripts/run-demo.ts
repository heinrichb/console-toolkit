import { runDemo } from "../src/demo";

// Check if this module is being run directly
if (import.meta.main) {
	void runDemo();
}
