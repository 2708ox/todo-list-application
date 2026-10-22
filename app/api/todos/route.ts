import { NextResponse } from "next/server";
import { getTodos, createTodo, checkDbConnection } from "@/lib/db";
import { CreateTodoInput, Priority } from "@/lib/types";
import { checkRateLimit } from "@/lib/rateLimit";

// Helper to get client IP for rate limiting
function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

// GET /api/todos - Retrieve all todo items
export async function GET(request: Request) {
  // Apply rate limiting (e.g., max 100 requests per minute)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 120, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const todos = await getTodos();
    const dbInfo = await checkDbConnection(false);

    return NextResponse.json(
      {
        success: true,
        count: todos.length,
        data: todos,
        databaseStatus: dbInfo.connected ? "connected" : "fallback_memory",
        message: dbInfo.message,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    console.error("API GET /api/todos Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error: Unable to fetch todos",
      },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo item with strict validation
export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 60, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await request.json();

    // 1. Validate title (Required, String, 1-200 chars)
    if (!body || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Field 'title' is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const title = body.title.trim();
    if (title.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: "Field 'title' exceeds maximum length of 200 characters",
        },
        { status: 400 }
      );
    }

    // 2. Validate description (Optional, String, max 1000 chars)
    let description: string | undefined = undefined;
    if (body.description !== undefined && body.description !== null) {
      if (typeof body.description !== "string") {
        return NextResponse.json(
          { success: false, error: "Field 'description' must be a string" },
          { status: 400 }
        );
      }
      const trimmedDesc = body.description.trim();
      if (trimmedDesc.length > 1000) {
        return NextResponse.json(
          {
            success: false,
            error: "Field 'description' exceeds maximum length of 1000 characters",
          },
          { status: 400 }
        );
      }
      description = trimmedDesc;
    }

    // 3. Validate Priority (Whitelist enum)
    const allowedPriorities: Priority[] = ["low", "medium", "high"];
    const priority: Priority = allowedPriorities.includes(body.priority)
      ? body.priority
      : "medium";

    // 4. Validate Category (Optional, String, max 50 chars)
    let category = "General";
    if (body.category !== undefined && body.category !== null) {
      if (typeof body.category !== "string") {
        return NextResponse.json(
          { success: false, error: "Field 'category' must be a string" },
          { status: 400 }
        );
      }
      category = body.category.trim() || "General";
      if (category.length > 50) {
        return NextResponse.json(
          {
            success: false,
            error: "Field 'category' exceeds maximum length of 50 characters",
          },
          { status: 400 }
        );
      }
    }

    const payload: CreateTodoInput = {
      title,
      description,
      priority,
      category,
    };

    const newTodo = await createTodo(payload);
    const dbInfo = await checkDbConnection(false);

    return NextResponse.json(
      {
        success: true,
        message: "Todo created successfully",
        data: newTodo,
        databaseStatus: dbInfo.connected ? "connected" : "fallback_memory",
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    console.error("API POST /api/todos Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request payload or internal server error",
      },
      { status: 500 }
    );
  }
}
