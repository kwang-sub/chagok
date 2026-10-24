// Ephemeral fixture app only. Production routes and auth are never modified.
// Run through node_runtime.py; stop with SIGINT/SIGTERM to remove the harness.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const root = process.cwd();
if (!root.startsWith("/opt/data/node/workspaces/")) throw new Error("Use the Linux isolated Node runtime.");
const require = createRequire(join(root, "package.json"));
const directory = mkdtempSync(join(root, ".account-card-harness-"));
const save = (path, content) => { const target = join(directory, path); mkdirSync(target.substring(0, target.lastIndexOf("/")), { recursive: true }); writeFileSync(target, content); };
cpSync(join(root, "src/features/account-card-management"), join(directory, "src/features/account-card-management"), { recursive: true });
cpSync(join(root, "src/styles"), join(directory, "src/styles"), { recursive: true });
save("src/components/app-shell.tsx", readFileSync(join(root, "src/components/app-shell.tsx"), "utf8"));
save("src/features/auth/sign-out-button.tsx", 'export function SignOutButton() { return <p className="muted">브라우저 검증용 샘플 · 인증 미연결</p>; }\n');
save("src/app/globals.css", readFileSync(join(root, "src/app/globals.css"), "utf8"));
save("src/app/layout.tsx", readFileSync(join(root, "src/app/layout.tsx"), "utf8"));
save("tsconfig.json", readFileSync(join(root, "tsconfig.json"), "utf8"));
save("package.json", readFileSync(join(root, "package.json"), "utf8"));
symlinkSync(join(root, "node_modules"), join(directory, "node_modules"), "dir");
save("src/app/[[...segments]]/page.tsx", `import { AppShell } from "@/components/app-shell";
import { ResourceList } from "@/features/account-card-management/resource-list";
import { ResourceDetail } from "@/features/account-card-management/resource-detail";
import { ResourceForm } from "@/features/account-card-management/resource-form";
import { readFilters } from "@/features/account-card-management/model";
export default async function Page({ params, searchParams }: { params: Promise<{ segments?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { segments = [] } = await params;
  const kind = segments[0] === "cards" ? "cards" : "accounts";
  const id = segments[1];
  const filters = readFilters(await searchParams);
  const view = !id ? <ResourceList kind={kind} initialFilters={filters} /> : id === "new" ? <ResourceForm kind={kind} filters={filters} /> : segments[2] === "edit" ? <ResourceForm kind={kind} id={id} filters={filters} /> : <ResourceDetail kind={kind} id={id} filters={filters} />;
  return <AppShell>{view}</AppShell>;
}
`);
const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", directory, "--webpack", "--hostname", "0.0.0.0", "--port", "3107"], { stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
const cleanup = () => { rmSync(directory, { recursive: true, force: true }); console.log("HARNESS_CLEANUP=PASS"); };
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));
server.on("error", (error) => { cleanup(); console.error(error.message); process.exitCode = 1; });
server.on("exit", (code) => { cleanup(); process.exitCode = code ?? 0; });
console.log(`HARNESS_DIRECTORY=${directory}`);
