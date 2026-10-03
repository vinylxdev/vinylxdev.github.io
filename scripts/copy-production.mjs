import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const build = fileURLToPath(new URL("../build/client/", import.meta.url));
const production = fileURLToPath(new URL("../production/", import.meta.url));
const preserved = new Set([
  ".git",
  ".gitignore",
  ".nojekyll",
  "CNAME",
  "404.html",
  "LICENSE",
  "README.md",
]);

// Read the completed build before removing any previous output.
const files = readdirSync(build);
mkdirSync(production, { recursive: true });

for (const file of readdirSync(production)) {
  if (!preserved.has(file)) {
    rmSync(join(production, file), { recursive: true, force: true });
  }
}

for (const file of files) {
  if (file === ".git") continue;
  cpSync(join(build, file), join(production, file), { recursive: true });
}
