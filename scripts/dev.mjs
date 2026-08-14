import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteBin = path.join(rootDir, "node_modules", "vite", "bin", "vite.js");
const serverEntry = path.join(rootDir, "server", "server.js");

const children = [
  spawn(process.execPath, ["--watch", serverEntry], { cwd: rootDir, stdio: "inherit" }),
  spawn(process.execPath, [viteBin], { cwd: rootDir, stdio: "inherit" }),
];

let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

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

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
