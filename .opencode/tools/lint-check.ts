import { tool } from "@opencode-ai/plugin/tool"
import { existsSync, readFileSync } from "node:fs"
import * as path from "node:path"
import { authorize, projectDirectory, projectPath, run } from "../lib/command.js"

export default tool({
  description: "Lint project files with an installed ESLint, Biome, Ruff, Pylint, or golangci-lint. Requests edit permission for fixes; never downloads a linter.",
  args: {
    target: tool.schema.string().min(1).optional(),
    fix: tool.schema.boolean().optional(),
    linter: tool.schema.enum(["eslint", "biome", "ruff", "pylint", "golangci-lint"]).optional(),
  },
  async execute({ target = ".", fix = false, linter }, context) {
    const resolved = projectPath(context, target)
    const cwd = projectDirectory(context)
    const has = (names: string[]) => names.some(name => existsSync(path.join(cwd, name)))
    const usesRuff = () => {
      try { return readFileSync(path.join(cwd, "pyproject.toml"), "utf8").includes("ruff") }
      catch { return false }
    }
    const detected = linter || (
      has(["biome.json", "biome.jsonc"]) ? "biome" :
      has([".eslintrc.json", ".eslintrc.js", ".eslintrc.cjs", "eslint.config.js", "eslint.config.mjs"]) ? "eslint" :
      usesRuff() ? "ruff" :
      has([".golangci.yml", ".golangci.yaml"]) ? "golangci-lint" : "eslint"
    )
    const commands = {
      biome: ["npx", "--no-install", "@biomejs/biome", "lint", ...(fix ? ["--write"] : []), resolved],
      eslint: ["npx", "--no-install", "eslint", ...(fix ? ["--fix"] : []), resolved],
      ruff: ["ruff", "check", ...(fix ? ["--fix"] : []), resolved],
      pylint: ["pylint", resolved],
      "golangci-lint": ["golangci-lint", "run", ...(fix ? ["--fix"] : []), resolved],
    }
    const [executable, ...args] = commands[detected]
    if (fix) await context.ask({ permission: "edit", patterns: [resolved], always: [], metadata: { filePath: resolved } })
    await authorize(context, executable, args)
    try {
      projectPath(context, resolved)
      return JSON.stringify({ success: true, linter: detected, output: await run(context, executable, args), issues: 0 })
    } catch (error) {
      const failure = error as { stdout?: string; stderr?: string; message?: string }
      return JSON.stringify({ success: false, linter: detected, output: failure.stdout || "", errors: failure.stderr || failure.message || "Lint failed" })
    }
  },
})
