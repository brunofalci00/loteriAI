#!/usr/bin/env node
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["scripts/shadcn-mcp-wrapper.mjs"],
  cwd: "/mnt/c/Users/bruno/Documents/Black/Loter.IA/Prod",
  env: {
    SHADCN_MCP_PROJECT_CWD:
      "/mnt/c/Users/bruno/Documents/Black/Loter.IA/Prod/App/app",
    SHADCN_MCP_DEBUG_LOG: "/tmp/shadcn-mcp.log",
  },
  stderr: "pipe",
});

const client = new Client({ name: "debug", version: "0.0.0" });

try {
  await client.connect(transport);
  const resources = await client.listResources();
  console.log("resources/list:", resources);
  const read = await client.readResource({ uri: "shadcn://status" });
  console.log("read:", read);
  const tools = await client.listTools();
  console.log("tools:", tools.tools.map((t) => t.name));
  await client.close();
} catch (error) {
  console.error("client error:", error);
  await transport.close();
  process.exit(1);
}

