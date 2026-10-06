import { spawnSync } from "node:child_process";
const result = spawnSync("pnpm", ["--dir", "ai-empire", "demo"], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(result.status ?? 1);
