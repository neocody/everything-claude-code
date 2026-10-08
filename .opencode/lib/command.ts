import { execFile } from "node:child_process"
import { realpathSync } from "node:fs"
import * as path from "node:path"
import { promisify } from "node:util"
import type { ToolContext } from "@opencode-ai/plugin/tool"

const execute = promisify(execFile)

export function projectDirectory(context: ToolContext): string {
  return realpathSync(context.worktree || context.directory)
}

export function projectPath(context: ToolContext, target: string): string {
  const root = projectDirectory(context)
  const resolved = realpathSync(path.resolve(root, target))
  const relative = path.relative(root, resolved)
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error("Target is outside the project directory")
  }
  return resolved
}

export async function authorize(context: ToolContext, executable: string, args: string[]): Promise<void> {
  const command = [executable, ...args].map(arg => JSON.stringify(arg)).join(" ")
  await context.ask({
    permission: "bash", patterns: [command], always: [],
    metadata: { command, cwd: projectDirectory(context) },
  })
}

export async function run(context: ToolContext, executable: string, args: string[]): Promise<string> {
  const result = await execute(executable, args, {
    cwd: projectDirectory(context), signal: context.abort,
    timeout: 120000, maxBuffer: 1024 * 1024, encoding: "utf8",
  })
  return result.stdout
}
