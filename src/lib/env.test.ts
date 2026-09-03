import { describe, expect, it } from "vitest";
import { apiUrl, API_VERSION } from "./env";

describe("apiUrl", () => {
  it("builds a versioned backend URL", () => {
    expect(apiUrl("topics")).toBe(`http://localhost:4000/api/${API_VERSION}/topics`);
  });

  it("does not double up slashes", () => {
    expect(apiUrl("/topics")).toBe(apiUrl("topics"));
  });

  it("handles paths already having /api/v1/ prefix without doubling", () => {
    expect(apiUrl("/api/v1/roles")).toBe("http://localhost:4000/api/v1/roles");
  });

  it("returns absolute URLs untouched", () => {
    expect(apiUrl("https://api.example.com/v1/test")).toBe("https://api.example.com/v1/test");
  });
});
