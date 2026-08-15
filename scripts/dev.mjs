import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "../server/db.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteBin = path.join(rootDir, "node_modules", "vite", "bin", "vite.js");
const serverEntry = path.join(rootDir, "server", "server.js");

const children = [];

async function apiAlreadyRunning() {
  try {
    const response = await fetch(`http://127.0.0.1:${process.env.PORT || 4000}/api/health`, { signal: AbortSignal.timeout(800) });
    if (!response.ok) return false;
    const body = await response.json().catch(() => null);
    return body?.ok === true;
  } catch {
    return false;
  }
}

async function start() {
  // Development demos always start signed out. Production sessions remain
  // persistent because this reset exists only in the dev launcher.
  const cleared = sql.prepare("DELETE FROM sessions").run().changes;
  if (cleared > 0) console.log(`Cleared ${cleared} development session(s); starting signed out.`);
  if (await apiAlreadyRunning()) {
    console.log("CivicAI API is already running; reusing it for the frontend.");
  } else {
    children.push(spawn(process.execPath, ["--watch", serverEntry], { cwd: rootDir, stdio: "inherit" }));
  }
  children.push(spawn(process.execPath, [viteBin], { cwd: rootDir, stdio: "inherit" }));

  for (const child of children) {
    child.on("error", (error) => {
      console.error(`Unable to start CivicAI: ${error.message}`);
      stop(1);
    });
    child.on("exit", (code, signal) => {
      if (stopping) return;
      if (code !== 0) {
        console.error(`A CivicAI development process stopped unexpectedly (${signal ?? code}).`);
      }
      stop(code ?? 1);
    });
  }
}

let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

start().catch((error) => {
  console.error(`Unable to start CivicAI: ${error.message}`);
  stop(1);
});
