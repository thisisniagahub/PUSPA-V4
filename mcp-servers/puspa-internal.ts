import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { prisma } from "../src/lib/prisma";

const server = new McpServer({ name: "puspa-internal", version: "1.0.0" });

server.tool(
  "verify_ekyc_status",
  "Semak status eKYC & risk score asnaf berdasarkan IC masked",
  { ic_masked: z.string().min(8) },
  async ({ ic_masked }) => {
    try {
      const record = await prisma.ekyc.findFirst({
        where: { icMasked: ic_masked },
        select: { status: true, riskScore: true, verifiedAt: true },
      });
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(record || { status: "NOT_FOUND", message: "Rekod eKYC tidak dijumpai" }) 
        }] 
      };
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify({ status: "ERROR", message: "Gagal mengakses database", error: String(error) }) 
        }] 
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server puspa-internal started");
}

main().catch(console.error);
