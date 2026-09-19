import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { scoreNumericResponse } from "@math-drill/drill-engine";
import { nextQuestion } from "./adaptive.js";
import { Store } from "./store.js";

export function buildApp(store = new Store()) {
  const app = Fastify({ logger: true });
  const parentTokens = new Set<string>();
  const pinSchema = z.string().regex(/^\d{4,12}$/, "Use a 4–12 digit PIN.");
  const pinHash = (pin: string) => { const salt=randomBytes(16).toString("hex"); return `${salt}:${scryptSync(pin,salt,32).toString("hex")}`; };
  const pinMatches = (pin: string, stored: string) => { const [salt, hash]=stored.split(":"); if(!salt||!hash)return false; const candidate=scryptSync(pin,salt,32).toString("hex"); return candidate.length===hash.length && timingSafeEqual(Buffer.from(candidate),Buffer.from(hash)); };
  const parentOnly = (request: {headers: {authorization?: string}}, reply: {code: (status:number)=>{send: (body:unknown)=>unknown}}) => { const token=request.headers.authorization?.replace("Bearer ",""); if(!token || !parentTokens.has(token)){ reply.code(401).send({message:"Parent access required"}); return false; } return true; };

  app.register(cors, { origin: true });

  app.get("/health", async () => ({ status: "ok", service: "math-drill-server" }));
  app.get("/api/v1/status", async () => ({
    name: "Math Drill",
    version: "0.1.0",
    mode: "local",
  }));
  app.get("/api/v1/children", async () => store.listChildren());
  app.get("/api/v1/parent/access", async () => ({ configured: Boolean(store.getSetting("parent_pin")) }));
  app.post("/api/v1/parent/setup", async (request, reply) => {
    if(store.getSetting("parent_pin")) return reply.code(409).send({message:"Parent PIN already configured"});
    const {pin}=z.object({pin:pinSchema}).parse(request.body); store.setSetting("parent_pin",pinHash(pin)); const token=randomBytes(24).toString("hex"); parentTokens.add(token); return reply.code(201).send({token});
  });
  app.post("/api/v1/parent/login", async (request, reply) => {
    const {pin}=z.object({pin:pinSchema}).parse(request.body); const stored=store.getSetting("parent_pin"); if(!stored || !pinMatches(pin,stored)) return reply.code(401).send({message:"That PIN did not match."}); const token=randomBytes(24).toString("hex"); parentTokens.add(token); return {token};
  });
  app.post("/api/v1/children", async (request, reply) => {
    if(!parentOnly(request,reply)) return;
    const data=z.object({name:z.string().trim().min(1).max(80),schoolYear:z.enum(["P1","P2","P3","P4","P5","P6"]).default("P4")}).parse(request.body);
    return reply.code(201).send(store.createChild(data.name,data.schoolYear));
  });
  app.post("/api/v1/sessions", async (request, reply) => {
    const data=z.object({childId:z.string().uuid(),mode:z.enum(["DAILY","MANUAL"]).default("DAILY"),seed:z.number().int().optional(),targetQuestions:z.number().int().min(1).max(50).default(10)}).parse(request.body);
    if (!store.getChild(data.childId)) return reply.code(404).send({message:"Child not found"});
    const session=store.startSession(data.childId,data.mode,data.seed ?? Math.floor(Math.random()*2**31),data.targetQuestions);
    return reply.code(201).send({...session,...nextQuestion(store,data.childId,session.seed)});
  });
  app.post("/api/v1/sessions/:sessionId/attempts", async (request, reply) => {
    const data=z.object({childId:z.string().uuid(),question:z.any(),response:z.string(),latencyMs:z.number().int().min(0).max(3_600_000),activityType:z.enum(["PRACTICE","DIAGNOSTIC","PLACEMENT","MASTERY_CHECK","REVIEW","TEST","PROBE"]),reason:z.string()}).parse(request.body);
    const score=scoreNumericResponse(data.question,{kind:"numeric",value:data.response});
    const {sessionId}=z.object({sessionId:z.string().uuid()}).parse(request.params);
    store.addAttempt(sessionId, data.childId, {question:data.question,response:data.response,expected:score.expectedValue,correct:score.correct,latencyMs:data.latencyMs,activityType:data.activityType,reason:data.reason});
    const seed=data.question.generation.seed+1;
    return reply.code(201).send({score,...nextQuestion(store,data.childId,seed)});
  });
  app.get("/api/v1/children/:childId/dashboard", async (request, reply) => {
    if(!parentOnly(request,reply)) return;
    const {childId}=z.object({childId:z.string().uuid()}).parse(request.params); if(!store.getChild(childId)) return reply.code(404).send({message:"Child not found"}); return store.dashboard(childId);
  });
  app.get("/api/v1/children/:childId/export", async (request, reply) => { if(!parentOnly(request,reply)) return; const {childId}=z.object({childId:z.string().uuid()}).parse(request.params); return {child:store.getChild(childId),attempts:store.childAttempts(childId),exportedAt:new Date().toISOString(),schemaVersion:1}; });

  const webDist = join(import.meta.dirname, "../../web/dist");
  if (existsSync(webDist)) {
    app.register(fastifyStatic, { root: webDist, wildcard: false });
    app.setNotFoundHandler((request, reply) => {
      if (request.raw.url?.startsWith("/api/")) return reply.code(404).send();
      return reply.sendFile("index.html");
    });
  }

  return app;
}
