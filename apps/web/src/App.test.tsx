import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
  });
  it("offers parent mode from the child chooser", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Who is practising?" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Parent mode" })).toBeDefined();
  });
});
