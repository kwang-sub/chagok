import { mkdir, readdir, symlink } from "node:fs/promises";
import { resolve } from "node:path";

// tsc preserves @/* imports. Mirror the alias only inside disposable test output.
const source = resolve(".test-build/src");
const scope = resolve(".test-build/node_modules/@");
await mkdir(scope, { recursive: true });
for (const entry of await readdir(source, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  try {
    await symlink(resolve(source, entry.name), resolve(scope, entry.name), "junction");
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
}
