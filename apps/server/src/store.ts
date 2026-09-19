import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type ActivityType = "PRACTICE" | "DIAGNOSTIC" | "PLACEMENT" | "MASTERY_CHECK" | "REVIEW" | "TEST" | "PROBE";
export type MasteryState = "NEW" | "LEARNING" | "FLUENT" | "AUTOMATIC";
export interface AttemptInput { question: unknown; response: string; expected: number; correct: boolean; latencyMs: number; activityType: ActivityType; reason: string; }

export class Store {
  readonly db: DatabaseSync;
  constructor(path = process.env.DATABASE_URL?.replace(/^file:/, "") ?? "data/math-drill.db") {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS children (id TEXT PRIMARY KEY, name TEXT NOT NULL, school_year TEXT NOT NULL DEFAULT 'P4', created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, child_id TEXT NOT NULL REFERENCES children(id), mode TEXT NOT NULL, seed INTEGER NOT NULL, started_at TEXT NOT NULL, completed_at TEXT, target_questions INTEGER NOT NULL DEFAULT 10);
      CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, child_id TEXT NOT NULL REFERENCES children(id), session_id TEXT NOT NULL REFERENCES sessions(id), occurred_at TEXT NOT NULL, activity_type TEXT NOT NULL, question_json TEXT NOT NULL, response_json TEXT NOT NULL, expected_json TEXT NOT NULL, correct INTEGER NOT NULL, latency_ms INTEGER NOT NULL, attempt_number INTEGER NOT NULL DEFAULT 1, hints_json TEXT NOT NULL DEFAULT '[]', retries INTEGER NOT NULL DEFAULT 0, answer_revealed INTEGER NOT NULL DEFAULT 0, difficulty_json TEXT NOT NULL, selection_reason TEXT NOT NULL, scorer_version TEXT NOT NULL DEFAULT 'numeric-exact-v1', mastery_version TEXT NOT NULL DEFAULT 'heuristic-v1');
      CREATE TABLE IF NOT EXISTS skill_state (child_id TEXT NOT NULL REFERENCES children(id), skill_id TEXT NOT NULL, state TEXT NOT NULL, score REAL NOT NULL, due_at TEXT, successful_retrievals INTEGER NOT NULL, updated_at TEXT NOT NULL, model_version TEXT NOT NULL, explanation TEXT NOT NULL, PRIMARY KEY(child_id, skill_id));`);
    this.db.exec("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);");
  }
  createChild(name: string, schoolYear: string) { const id = crypto.randomUUID(); this.db.prepare("INSERT INTO children VALUES (?, ?, ?, ?)").run(id, name, schoolYear, new Date().toISOString()); return this.getChild(id)!; }
  listChildren() { return this.db.prepare("SELECT id, name, school_year AS schoolYear, created_at AS createdAt FROM children ORDER BY created_at").all() as Array<{id:string;name:string;schoolYear:string;createdAt:string}>; }
  getChild(id: string) { return this.db.prepare("SELECT id, name, school_year AS schoolYear, created_at AS createdAt FROM children WHERE id=?").get(id) as {id:string;name:string;schoolYear:string;createdAt:string}|undefined; }
  getSetting(key: string) { return (this.db.prepare("SELECT value FROM settings WHERE key=?").get(key) as {value:string}|undefined)?.value; }
  setSetting(key: string, value: string) { this.db.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(key,value); }
  startSession(childId: string, mode: string, seed: number, targetQuestions = 10) { const id = crypto.randomUUID(); this.db.prepare("INSERT INTO sessions(id,child_id,mode,seed,started_at,target_questions) VALUES (?,?,?,?,?,?)").run(id,childId,mode,seed,new Date().toISOString(),targetQuestions); return { id, childId, mode, seed, targetQuestions }; }
  addAttempt(sessionId: string, childId: string, input: AttemptInput) { const id=crypto.randomUUID(); this.db.prepare("INSERT INTO attempts(id,child_id,session_id,occurred_at,activity_type,question_json,response_json,expected_json,correct,latency_ms,difficulty_json,selection_reason) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(id,childId,sessionId,new Date().toISOString(),input.activityType,JSON.stringify(input.question),JSON.stringify({kind:"numeric",value:input.response}),JSON.stringify({kind:"numeric",value:input.expected}),input.correct?1:0,input.latencyMs,JSON.stringify((input.question as {difficultyFeatures?:unknown}).difficultyFeatures ?? {}),input.reason); return id; }
  childAttempts(childId: string) { return this.db.prepare("SELECT * FROM attempts WHERE child_id=? ORDER BY occurred_at DESC").all(childId) as Array<Record<string, unknown>>; }
  dashboard(childId: string) { const totals=this.db.prepare("SELECT COUNT(*) attempts, COALESCE(SUM(correct),0) correct, COALESCE(ROUND(AVG(latency_ms)),0) latency FROM attempts WHERE child_id=?").get(childId) as {attempts:number;correct:number;latency:number}; const recent=this.db.prepare("SELECT occurred_at occurredAt, correct, latency_ms latencyMs, selection_reason reason FROM attempts WHERE child_id=? ORDER BY occurred_at DESC LIMIT 12").all(childId); return {...totals, accuracy: totals.attempts ? Math.round(totals.correct/totals.attempts*100):0, recent}; }
  close() { this.db.close(); }
}
