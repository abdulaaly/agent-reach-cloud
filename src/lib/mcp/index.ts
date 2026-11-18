import { db, User, ApiToken } from "../db";
import { executeTool } from "../tools";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_TOOLS: McpToolDefinition[] = [
  // 1. Core Universal Readers
  {
    name: "reach_read",
    description: "Official Agent Reach universal content extractor. Automatically identifies any URL platform (YouTube, Reddit, Twitter, Xueqiu, Bilibili, GitHub, Xiaohongshu, etc.) and extracts clean structured content.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Public URL or platform resource link to extract and read" },
      },
      required: ["url"],
    },
  },
  {
    name: "reach_cli",
    description: "Direct invocation of the native Agent Reach CLI engine across any registered channel and action with custom flags.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel name (e.g. github, twitter, youtube, reddit, xueqiu, bilibili, xiaohongshu, v2ex, web)" },
        action: { type: "string", description: "Channel action (e.g. search, read, quote, hot, subtitle)" },
        args: { type: "array", items: { type: "string" }, description: "Positional arguments and optional flags" },
      },
      required: ["channel", "action"],
    },
  },
  {
    name: "reach_doctor",
    description: "Check the operational health, installed platform backends, and browser sandboxes of Agent Reach Cloud.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // 2. GitHub
  {
    name: "github_search",
    description: "Search GitHub repositories with real-time stars, forks, and descriptions.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Repository search query" },
        limit: { type: "number", description: "Maximum results (default 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "github_read",
    description: "Read a GitHub repository README, release details, or inspect an issue/PR with discussion comments.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "owner/repo name, or a repo / issue / PR link" },
      },
      required: ["target"],
    },
  },

  // 3. YouTube
  {
    name: "youtube_read",
    description: "Extract video title, creator channel, upload date, and full description.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "YouTube video URL or 11-char video ID" },
      },
      required: ["target"],
    },
  },
  {
    name: "youtube_search",
    description: "Search YouTube videos by keywords with view counts and durations.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords or topic to search" },
        limit: { type: "number", description: "Max videos (default 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "youtube_subtitle",
    description: "Fetch full subtitle/captions text of a YouTube video (supports manual & auto captions).",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Video URL or ID" },
        lang: { type: "string", description: "Comma-separated language preferences (e.g. 'en,zh-Hans,es')" },
      },
      required: ["target"],
    },
  },
  {
    name: "youtube_transcribe",
    description: "Audio transcription for YouTube videos using Whisper AI speech-to-text.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Video URL or ID" },
      },
      required: ["target"],
    },
  },

  // 4. Reddit
  {
    name: "reddit_search",
    description: "Search public Reddit posts, discussions, and AMA threads.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Topic or query" },
        limit: { type: "number", description: "Max posts (default 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "reddit_read",
    description: "Read a complete Reddit post along with top community comments and upvote metrics.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Reddit post link or ID" },
      },
      required: ["target"],
    },
  },
  {
    name: "reddit_subreddit",
    description: "Get the latest trending posts from a specific subreddit.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Subreddit name without r/ (e.g. 'technology', 'artificial')" },
        limit: { type: "number", description: "Max posts (default 5)" },
      },
      required: ["name"],
    },
  },

  // 5. Xueqiu (Snowball Financial Data)
  {
    name: "xueqiu_quote",
    description: "Query real-time stock quote (US stocks, HK stocks, and A-shares) with current price, change %, high/low, and market volume.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g. 'AAPL', 'NVDA', 'TSLA', 'SH600519', '00700')" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "xueqiu_search",
    description: "Find stock symbols and corporate listings by company name or ticker.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Company name or ticker" },
        limit: { type: "number", description: "Max results (default 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "xueqiu_hot_stocks",
    description: "Retrieve currently trending and most-watched stocks on Xueqiu.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max items (default 10)" },
      },
    },
  },
  {
    name: "xueqiu_hot_posts",
    description: "Retrieve trending market analysis and investor discussions on Xueqiu.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max items (default 10)" },
      },
    },
  },

  // 6. Twitter / X
  {
    name: "twitter_search",
    description: "Search public tweets and trends on X / Twitter.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query or hashtag" },
        limit: { type: "number", description: "Max tweets (default 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "twitter_profile",
    description: "Read a Twitter/X user profile, bio, followers count, and status.",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string", description: "Twitter handle without @" },
      },
      required: ["username"],
    },
  },
  {
    name: "twitter_tweets",
    description: "Read recent tweets posted by a Twitter user.",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string", description: "Twitter handle without @" },
        limit: { type: "number", description: "Max tweets (default 5)" },
      },
      required: ["username"],
    },
  },
  {
    name: "twitter_thread",
    description: "Read a full tweet conversation thread with replies.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Tweet URL or status ID" },
      },
      required: ["target"],
    },
  },

  // 7. Xiaohongshu (RED)
  {
    name: "xiaohongshu_search",
    description: "Search Xiaohongshu notes, travel guides, lifestyle reviews, and product recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords" },
        limit: { type: "number", description: "Max notes (default 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "xiaohongshu_read",
    description: "Read textual content, tags, and creator info of a Xiaohongshu note.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Xiaohongshu note link or ID" },
      },
      required: ["target"],
    },
  },
  {
    name: "xiaohongshu_comments",
    description: "Read top comments on a Xiaohongshu note.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Note link or ID" },
        limit: { type: "number", description: "Max comments (default 10)" },
      },
      required: ["target"],
    },
  },

  // 8. Bilibili
  {
    name: "bilibili_search",
    description: "Search Bilibili videos, anime, and tech presentations.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "number", description: "Max videos (default 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "bilibili_read",
    description: "Read Bilibili video description, play statistics, and metadata.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Bilibili URL or BV id" },
      },
      required: ["target"],
    },
  },
  {
    name: "bilibili_hot",
    description: "Get today's trending hot videos on Bilibili.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max items (default 10)" },
      },
    },
  },
  {
    name: "bilibili_subtitle",
    description: "Extract subtitle text from a Bilibili video.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Bilibili URL or BV id" },
      },
      required: ["target"],
    },
  },

  // 9. Career & Jobs (LinkedIn & BOSS Zhipin)
  {
    name: "linkedin_jobs",
    description: "Search LinkedIn job postings by title, keywords, and geographic location.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Job title or skill (e.g. 'Software Engineer')" },
        location: { type: "string", description: "City or region (e.g. 'San Francisco', 'Remote')" },
        limit: { type: "number", description: "Max postings (default 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "linkedin_read",
    description: "Read a full LinkedIn job posting description and requirements.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Full LinkedIn job URL" },
      },
      required: ["target"],
    },
  },
  {
    name: "boss_search",
    description: "Search tech job postings on BOSS Zhipin.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Job title or technology keywords" },
        city: { type: "string", description: "Target city (e.g. '北京', '上海', '深圳')" },
        limit: { type: "number", description: "Max results (default 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "boss_read",
    description: "Read full job specification and salary details from a BOSS Zhipin posting link.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Full BOSS job posting URL" },
      },
      required: ["target"],
    },
  },

  // 10. V2EX
  {
    name: "v2ex_hot",
    description: "Read today's most discussed topics on V2EX developer community.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max items (default 10)" },
      },
    },
  },
  {
    name: "v2ex_node",
    description: "Read latest topics in a specific V2EX node (e.g. 'python', 'programmer', 'jobs').",
    inputSchema: {
      type: "object",
      properties: {
        node_name: { type: "string", description: "Node identifier" },
        limit: { type: "number", description: "Max items (default 10)" },
      },
      required: ["node_name"],
    },
  },
  {
    name: "v2ex_read",
    description: "Read a V2EX discussion thread and all its replies.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Topic URL or ID" },
      },
      required: ["target"],
    },
  },
  {
    name: "v2ex_user",
    description: "Inspect a V2EX member profile and public activity.",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string", description: "V2EX username" },
      },
      required: ["username"],
    },
  },

  // 11. Podcasts & Audio (Xiaoyuzhou)
  {
    name: "xiaoyuzhou_transcribe",
    description: "Extract full transcript of a podcast episode from Xiaoyuzhou FM.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Xiaoyuzhou podcast episode URL" },
      },
      required: ["target"],
    },
  },

  // 12. Public Web (Exa & Jina)
  {
    name: "web_search",
    description: "High-accuracy web semantic search powered by Exa.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "number", description: "Max results (default 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "web_read",
    description: "Read clean, readable markdown from any public web URL.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Page URL to parse" },
      },
      required: ["target"],
    },
  },

  // Backward-compatible aliases
  {
    name: "search_web",
    description: "Alias for web_search: Search the web using semantic search.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query string" },
        limit: { type: "number", description: "Maximum results" },
      },
      required: ["query"],
    },
  },
  {
    name: "read_url",
    description: "Alias for web_read: Extract clean markdown from a URL.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "The public HTTP(S) URL to read" },
      },
      required: ["url"],
    },
  },
  {
    name: "get_video_transcript",
    description: "Alias for youtube_subtitle: Fetch video transcripts.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "YouTube or Bilibili URL" },
        language: { type: "string", description: "Language code" },
      },
      required: ["url"],
    },
  },
  {
    name: "read_social_feed",
    description: "Alias for reading social networks (reddit, twitter, xiaohongshu).",
    inputSchema: {
      type: "object",
      properties: {
        platform: { type: "string", enum: ["reddit", "twitter", "xiaohongshu"] },
        query: { type: "string" },
        limit: { type: "number" },
      },
      required: ["platform", "query"],
    },
  },
  {
    name: "get_finance_quote",
    description: "Alias for xueqiu_quote: Real-time stock quotes.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "inspect_github",
    description: "Alias for github_read: Inspect a repository.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string" },
      },
      required: ["target"],
    },
  },
  {
    name: "search_career",
    description: "Alias for career search on LinkedIn or BOSS.",
    inputSchema: {
      type: "object",
      properties: {
        keyword: { type: "string" },
        platform: { type: "string", enum: ["linkedin", "boss"] },
        city: { type: "string" },
      },
      required: ["keyword"],
    },
  },
];

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export async function processMcpMessage(
  req: JsonRpcRequest,
  userOrContext: User | { user: User; token: ApiToken },
  maybeToken?: ApiToken
): Promise<JsonRpcResponse> {
  const user = "user" in userOrContext ? userOrContext.user : userOrContext;
  const token = "token" in userOrContext ? userOrContext.token : (maybeToken as ApiToken);
  const reqId = req.id ?? null;

  try {
    switch (req.method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id: reqId,
          result: {
            protocolVersion: "2024-11-05",
            serverInfo: {
              name: "agent-reach-cloud",
              version: "1.0.0",
              vendor: "Agent Reach",
            },
            capabilities: {
              tools: { listChanged: false },
              logging: {},
            },
            instructions: "Official Agent-Reach Cloud MCP server. Access real-time YouTube subtitles, Xueqiu quotes, Reddit threads, Xiaohongshu notes, GitHub code, and 14 web platforms.",
          },
        };

      case "notifications/initialized":
      case "ping":
        return {
          jsonrpc: "2.0",
          id: reqId,
          result: {},
        };

      case "tools/list":
        return {
          jsonrpc: "2.0",
          id: reqId,
          result: {
            tools: MCP_TOOLS,
          },
        };

      case "tools/call": {
        const { name, arguments: toolArgs } = req.params || {};

        if (!name) {
          return {
            jsonrpc: "2.0",
            id: reqId,
            error: {
              code: -32602,
              message: "Invalid params: 'name' is required for tools/call.",
            },
          };
        }

        // Quota check: deduct compute credits (1 unit per tool call)
        const creditCost = 1;
        const deduction = db.deductQuota(user.id, token.id, creditCost);

        if (!deduction.success) {
          db.recordAuditLog({
            userId: user.id,
            tokenId: token.id,
            toolName: name,
            unitsCharged: 0,
            status: "rejected_quota",
            metadata: { reason: "Insufficient compute units" },
          });

          return {
            jsonrpc: "2.0",
            id: reqId,
            error: {
              code: -32000,
              message: "Compute quota exceeded. Please top up credits at https://agent-reach.cloud/dashboard to continue using remote MCP tools.",
              data: {
                currentBalance: deduction.remaining,
                required: creditCost,
                topupUrl: "https://agent-reach.cloud/dashboard#billing",
              },
            },
          };
        }

        // Execute tool
        const startTime = Date.now();
        const toolResult = await executeTool(name, toolArgs || {});
        const latencyMs = Date.now() - startTime;

        db.recordAuditLog({
          userId: user.id,
          tokenId: token.id,
          toolName: name,
          unitsCharged: creditCost,
          status: toolResult.ok ? "success" : "error",
          latencyMs,
          metadata: {
            channel: toolResult.channel,
            error: toolResult.error,
          },
        });

        return {
          jsonrpc: "2.0",
          id: reqId,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(toolResult, null, 2),
              },
            ],
            isError: !toolResult.ok,
          },
        };
      }

      default:
        return {
          jsonrpc: "2.0",
          id: reqId,
          error: {
            code: -32601,
            message: `Method not found: ${req.method}`,
          },
        };
    }
  } catch (err: any) {
    return {
      jsonrpc: "2.0",
      id: reqId,
      error: {
        code: -32603,
        message: err.message || "Internal error in MCP handler.",
      },
    };
  }
}

export const handleJsonRpcRequest = processMcpMessage;
