import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
  });
  it("renders the product name", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Math Drill" })).toBeDefined();
  });
});
