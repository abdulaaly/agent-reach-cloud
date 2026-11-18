import { execFile } from "child_process";
import path from "path";
import fs from "fs";

export interface NativeExecutionResult {
  ok: boolean;
  channel: string;
  action?: string;
  items?: any[];
  data?: any;
  error?: any;
  meta?: any;
}

export function isServerlessEnvironment(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
}

// Locate virtualenv python or system python
function getPythonExecutable(): string | null {
  if (isServerlessEnvironment()) {
    return null;
  }

  const venvWin = path.join(process.cwd(), ".venv", "Scripts", "python.exe");
  const venvUnix = path.join(process.cwd(), ".venv", "bin", "python");

  if (fs.existsSync(venvWin)) return venvWin;
  if (fs.existsSync(venvUnix)) return venvUnix;
  return null;
}

export function runAgentReachCli(
  args: string[],
  timeoutMs: number = 30000
): Promise<NativeExecutionResult> {
  return new Promise((resolve) => {
    const pythonExe = getPythonExecutable();
    if (!pythonExe) {
      return resolve({
        ok: false,
        channel: args[0] || "reach",
        error: {
          code: "SERVERLESS_FALLBACK",
          message: "Native CLI not present in serverless environment; using cloud edge extractors.",
        },
      });
    }

    const cmdArgs = ["-m", "agent_reach.cli", ...args];

    const child = execFile(
      pythonExe,
      cmdArgs,
      {
        cwd: process.cwd(),
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024,
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
        },
      },
      (error, stdout, stderr) => {
        if (stdout && stdout.trim()) {
          try {
            // Find last JSON line from stdout
            const lines = stdout.trim().split("\n");
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim();
              if (line.startsWith("{") && line.endsWith("}")) {
                const parsed = JSON.parse(line);
                return resolve(parsed);
              }
            }
          } catch (e) {
            // fallback
          }
        }

        if (error) {
          return resolve({
            ok: false,
            channel: args[0] || "reach",
            error: {
              code: "CLI_ERROR",
              message: error.message || stderr || "Execution failed",
            },
          });
        }

        resolve({
          ok: true,
          channel: args[0] || "reach",
          data: { raw_output: stdout.trim() },
        });
      }
    );
  });
}
