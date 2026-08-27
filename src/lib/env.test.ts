import { describe, expect, it } from "vitest";
import { apiUrl, API_VERSION } from "./env";

describe("apiUrl", () => {
  it("builds a versioned backend URL", () => {
    expect(apiUrl("topics")).toBe(`http://localhost:4000/api/${API_VERSION}/topics`);
  });

  it("does not double up slashes", () => {
    expect(apiUrl("/topics")).toBe(apiUrl("topics"));
  });
});
