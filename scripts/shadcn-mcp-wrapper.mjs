#!/usr/bin/env node
import { server as shadcnServer } from "shadcn/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs";
import path from "node:path";

const debugLogPath = process.env.SHADCN_MCP_DEBUG_LOG;
const debug = (...args) => {
  if (!debugLogPath) {
    return;
  }
  const line = `[${new Date().toISOString()}] ${args.join(" ")}\n`;
  try {
    fs.appendFileSync(debugLogPath, line);
  } catch {
    // ignore fs errors to avoid crashing the MCP server
  }
};

const targetCwd = process.env.SHADCN_MCP_PROJECT_CWD;
if (targetCwd && targetCwd.trim().length > 0) {
  try {
    process.chdir(targetCwd);
  } catch (error) {
    console.error(
      `[shadcn-mcp-wrapper] Unable to switch to ${targetCwd}:`,
      error
    );
    debug("Failed to switch cwd", targetCwd, error?.message ?? String(error));
  }
}
debug("Wrapper booted", `cwd=${process.cwd()}`);

const STATUS_RESOURCE = {
  uri: "shadcn://status",
  name: "Shadcn MCP status",
  mimeType: "text/markdown",
  description:
    "Reports integration details so Codex can call the shadcn MCP tools.",
};

function findComponentsJson(startDir) {
  let current = path.resolve(startDir);
  while (true) {
    const candidate = path.join(current, "components.json");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function readComponentsSummary(filePath) {
  if (!filePath) {
    return {
      message:
        "Nenhum components.json encontrado. Rode `npx shadcn@latest init` no diretório correto.",
    };
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const registries = parsed?.registries
      ? Object.keys(parsed.registries)
      : [];
    return {
      filePath,
      registries,
    };
  } catch (error) {
    return {
      filePath,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

shadcnServer.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [STATUS_RESOURCE],
}));

shadcnServer.setRequestHandler(
  ReadResourceRequestSchema,
  async (request) => {
    const requestedUri = request.params.uri;
    if (requestedUri !== STATUS_RESOURCE.uri) {
      return {
        contents: [
          {
            uri: requestedUri,
            mimeType: "text/plain",
            text: `Resource ${requestedUri} não existe.`,
          },
        ],
        isError: true,
      };
    }

    const cwd = process.cwd();
    const componentsFile = findComponentsJson(cwd);
    const summary = readComponentsSummary(componentsFile);

    const lines = [
      "# Shadcn MCP Wrapper",
      "",
      `- Diretório atual: \`${cwd}\``,
      componentsFile
        ? `- components.json: \`${componentsFile}\``
        : "- components.json: não encontrado",
      summary?.registries
        ? `- Registries carregados: ${summary.registries.join(", ") || "nenhum"}`
        : "- Registries carregados: desconhecido",
      summary?.error ? `- Erro ao ler components.json: ${summary.error}` : "",
      "",
      "Este recurso existe apenas para satisfazer o método `resources/list` exigido pelo Codex. Use as ferramentas MCP do shadcn normalmente (`list_items_in_registries`, `view_items_in_registries`, etc.).",