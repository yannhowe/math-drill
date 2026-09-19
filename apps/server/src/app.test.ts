import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "./app.js";
import { Store } from "./store.js";

const rootStore = new Store(":memory:");
const app = buildApp(rootStore);

afterAll(async () => { await app.close(); rootStore.close(); });

describe("server foundation", () => {
  it("reports its local health", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "ok" });
  });

  it("persists append-only attempt evidence for a child session", async () => {
    const memory = new Store(":memory:");
    const local = buildApp(memory);
    const access = (await local.inject({ method: "POST", url: "/api/v1/parent/setup", payload: { pin: "1234" } })).json();
    const auth = { authorization: `Bearer ${access.token}` };
    const child = (await local.inject({ method: "POST", url: "/api/v1/children", headers: auth, payload: { name: "Ada", schoolYear: "P4" } })).json();
    const session = (await local.inject({ method: "POST", url: "/api/v1/sessions", payload: { childId: child.id, mode: "DAILY", seed: 17 } })).json();
    const response = await local.inject({ method: "POST", url: `/api/v1/sessions/${session.id}/attempts`, payload: { childId: child.id, question: session.question, response: String(session.question.expectedResponse.value), latencyMs: 900, activityType: session.activityType, reason: session.reason } });
    expect(response.statusCode).toBe(201);
    const dashboard = (await local.inject({ method: "GET", url: `/api/v1/children/${child.id}/dashboard`, headers: auth })).json();
    expect(dashboard).toMatchObject({ attempts: 1, correct: 1, accuracy: 100 });
    await local.close(); memory.close();
  });
});
