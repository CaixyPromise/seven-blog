import Database from "better-sqlite3"
import { mkdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { config } from "./config.js"

const databasePath = path.resolve(process.cwd(), config.databasePath)
mkdirSync(path.dirname(databasePath), { recursive: true })

export const db = new Database(databasePath)
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

const migrationPath = path.resolve(process.cwd(), "migrations/001_init.sql")
db.exec(readFileSync(migrationPath, "utf8"))

export function nowIso(): string {
  return new Date().toISOString()
}
