import "dotenv/config";
import { sql } from "./db.js";
import { seedIfEmpty } from "./auth.js";

seedIfEmpty();

const tables = sql.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").get();
const users = sql.prepare("SELECT COUNT(*) AS count FROM users").get();

console.log(`CivicAI database is ready (${tables.count} tables, ${users.count} users).`);
console.log("Start the application with: npm run dev");
