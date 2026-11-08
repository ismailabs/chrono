import { build } from "esbuild";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const testDir = "test";
const outDir = ".test-build";

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const entries = readdirSync(testDir)
  .filter((file) => file.endsWith(".test.ts"))
  .map((file) => path.join(testDir, file));

await build({
  entryPoints: entries,
  outdir: outDir,
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  logLevel: "warning",
});

const outputs = readdirSync(outDir)
  .filter((file) => file.endsWith(".test.js"))
  .map((file) => path.join(outDir, file));

const result = spawnSync(process.execPath, ["--test", ...outputs], {
  stdio: "inherit",
});
rmSync(outDir, { recursive: true, force: true });
process.exit(result.status ?? 1);
