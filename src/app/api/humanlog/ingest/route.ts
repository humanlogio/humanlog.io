import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(request: NextRequest) {
  try {
    const logData = await request.text();

    // Send log to humanlog via ingest command
    const humanlogProcess = spawn("humanlog", ["ingest"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        // Configure to connect to local humanlog instance
        HUMANLOG_API_BASE_URL: "http://localhost:8080",
      },
    });

    let stdout = "";
    let stderr = "";

    humanlogProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    humanlogProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Send log data to humanlog
    humanlogProcess.stdin.write(logData + "\n");
    humanlogProcess.stdin.end();

    return new Promise((resolve) => {
      humanlogProcess.on("close", (code) => {
        resolve(
          NextResponse.json({
            success: code === 0,
            code,
            stdout,
            stderr,
          }),
        );
      });
    });
  } catch (error) {
    console.error("❌ Failed to send log to humanlog:", error);
    return NextResponse.json(
      { error: "Failed to ingest log" },
      { status: 500 },
    );
  }
}
