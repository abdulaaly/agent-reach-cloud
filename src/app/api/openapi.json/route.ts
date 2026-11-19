import { MCP_TOOLS } from "@/lib/mcp";

export const dynamic = "force-dynamic";

export async function GET() {
  const paths: Record<string, any> = {};

  MCP_TOOLS.forEach((tool) => {
    paths[`/api/tools/${tool.name}`] = {
      post: {
        summary: tool.name,
        description: tool.description,
        operationId: tool.name,
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: {
          required: Boolean(tool.inputSchema.required && tool.inputSchema.required.length > 0),
          content: {
            "application/json": {
              schema: tool.inputSchema,
            },
          },
        },
        responses: {
          "200": {
            description: "Successful response with extracted structured content and remaining credits.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean" },
                    tool: { type: "string" },
                    channel: { type: "string" },
                    result: { description: "Structured data or list of items extracted" },
                    remainingCredits: { type: "number" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - Invalid or missing API key.",
          },
          "402": {
            description: "Payment Required - Compute quota exhausted.",
          },
        },
      },
    };
  });

  const openapiSpec = {
    openapi: "3.1.0",
    info: {
      title: "Agent-Reach Cloud Tools API",
      version: "1.0.0",
      description:
        "Official Remote API and MCP bridge for Agent-Reach Cloud. Connect ChatGPT, Claude, Cursor, and custom autonomous agents to extract structured data from YouTube, GitHub, Reddit, Xueqiu, Twitter, and 16+ web platforms.",
      contact: {
        name: "Agent Reach Support",
        email: "100xdigitizer@gmail.com",
        url: "https://agent-reach-cloud.vercel.app",
      },
    },
    servers: [
      {
        url: "https://agent-reach-cloud.vercel.app",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT/HMAC",
          description: "Enter your Agent-Reach API Key (e.g. ar_live_...)",
        },
        ApiKeyAuth: {
          type: "apiKey",
          in: "query",
          name: "token",
          description: "Pass your API token as ?token=ar_live_...",
        },
      },
    },
    security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
    paths,
  };

  return new Response(JSON.stringify(openapiSpec, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
