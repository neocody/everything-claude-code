import { tool } from "@opencode-ai/plugin/tool"
import { authorize, run } from "../lib/command.js"

export default tool({
  description: "Read git branch, status, recent log and diff statistics in the project directory.",
  args: {
    depth: tool.schema.number().int().min(1).max(100).optional(),
    includeDiff: tool.schema.boolean().optional(),
    baseBranch: tool.schema.string().min(1).optional(),
  },
  async execute({ depth = 5, includeDiff = true, baseBranch = "main" }, context) {
    if (!Number.isInteger(depth) || depth < 1 || depth > 100) throw new Error("Invalid log depth")
    if (!/^[A-Za-z0-9_][A-Za-z0-9._/-]*$/.test(baseBranch) || baseBranch.includes("..")) {
      throw new Error("Invalid base branch")
    }
    const results: Record<string, string> = {}
    const commands: [string, string[], string][] = [
      ["branch", ["branch", "--show-current"], "unknown"],
      ["status", ["status", "--short"], "unable to get status"],
      ["log", ["log", "--oneline", `-${depth}`], "unable to get log"],
    ]
    if (includeDiff) commands.push(
      ["stagedDiff", ["diff", "--cached", "--stat"], ""],
      ["branchDiff", ["diff", "--stat", `${baseBranch}...HEAD`, "--"], `unable to diff against ${baseBranch}`],
    )
    for (const [key, args, fallback] of commands) {
      await authorize(context, "git", args)
      try { results[key] = (await run(context, "git", args)).trim() }
      catch { results[key] = fallback }
    }
    return JSON.stringify(results)
  },
})
