import { tool } from "@opencode-ai/plugin/tool"
import { existsSync } from "node:fs"
import * as path from "node:path"
import { authorize, projectDirectory, projectPath, run } from "../lib/command.js"

export default tool({
  description: "Format a project file with an installed Biome, Prettier, Black, gofmt, or rustfmt. Requests edit and command permission; never downloads a formatter.",
  args: {
    filePath: tool.schema.string().min(1).describe("Project-relative file to format"),
    formatter: tool.schema.enum(["biome", "prettier", "black", "gofmt", "rustfmt"]).optional(),
  },
  async execute({ filePath, formatter }, context) {
    const target = projectPath(context, filePath)
    const cwd = projectDirectory(context)
    const ext = path.extname(target).slice(1).toLowerCase()
    const detected = formatter || (
      ["ts", "tsx", "js", "jsx", "json", "css", "scss"].includes(ext)
        ? (["biome.json", "biome.jsonc"].some(config => existsSync(path.join(cwd, config))) ? "biome" : "prettier")
        : ({ py: "black", pyi: "black", go: "gofmt", rs: "rustfmt" } as const)[ext as "py" | "pyi" | "go" | "rs"]
    )
    if (!detected) return JSON.stringify({ formatted: false, message: `No formatter detected for .${ext} files` })
    const commands = {
      biome: ["npx", "--no-install", "@biomejs/biome", "format", "--write", target],
      prettier: ["npx", "--no-install", "prettier", "--write", target],
      black: ["black", target], gofmt: ["gofmt", "-w", target], rustfmt: ["rustfmt", target],
    }
    const [executable, ...args] = commands[detected]
    await context.ask({ permission: "edit", patterns: [target], always: [], metadata: { filePath: target } })
    await authorize(context, executable, args)
    try {
      return JSON.stringify({ formatted: true, formatter: detected, output: await run(context, executable, args) })
    } catch (error) {
      return JSON.stringify({ formatted: false, formatter: detected, error: error instanceof Error ? error.message : "Format failed" })
    }
  },
})
