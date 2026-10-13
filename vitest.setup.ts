import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

if (typeof window !== "undefined") {
  // Prevent jsdom "Error: Not implemented: navigation" when test files trigger a.click() downloads
  HTMLAnchorElement.prototype.click = function () {
    // no-op for jsdom download links
  };
}

afterEach(() => {
  cleanup();
});
