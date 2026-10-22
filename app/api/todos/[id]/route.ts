import { NextResponse } from "next/server";
import { getTodoById, updateTodo, deleteTodo, checkDbConnection } from "@/lib/db";
import { UpdateTodoInput, Priority } from "@/lib/types";
import { checkRateLimit } from "@/lib/rateLimit";

interface RouteProps {
  params: Promise<{ id: string }>;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

// Validate ID format (Alphanumeric with hyphens/underscores, 1-64 chars)
function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

// GET /api/todos/:id - Retrieve single todo item
export async function GET(request: Request, { params }: RouteProps) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 120, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const { id } = await params;
    if (!id || !isValidId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const todo = await getTodoById(id);
    if (!todo) {
      return NextResponse.json(
        { success: false, error: `Todo with id '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: todo },
      { status: 200 }
    );
  } catch (error) {
    console.error("API GET /api/todos/:id Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error: Unable to retrieve todo" },
      { status: 500 }
    );
  }
}

// PUT /api/todos/:id - Update todo item with validation
export async function PUT(request: Request, { params }: RouteProps) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 60, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const { id } = await params;
    if (!id || !isValidId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Request payload must be a JSON object" },
        { status: 400 }
      );
    }

    const updatePayload: UpdateTodoInput = {};

    // Validate title if provided
    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          { success: false, error: "Field 'title' cannot be empty" },
          { status: 400 }
        );
      }
      if (body.title.trim().length > 200) {
        return NextResponse.json(
          { success: false, error: "Field 'title' exceeds 200 characters" },
          { status: 400 }
        );
      }
      updatePayload.title = body.title.trim();
    }

    // Validate description if provided
    if (body.description !== undefined && body.description !== null) {
      if (typeof body.description !== "string") {
        return NextResponse.json(
          { success: false, error: "Field 'description' must be a string" },
          { status: 400 }
        );
      }
      if (body.description.trim().length > 1000) {
        return NextResponse.json(
          { success: false, error: "Field 'description' exceeds 1000 characters" },
          { status: 400 }
        );
      }
      updatePayload.description = body.description.trim();
    }

    // Validate completed
    if (body.completed !== undefined) {
      updatePayload.completed = Boolean(body.completed);
    }

    // Validate priority
    if (body.priority !== undefined) {
      const allowed: Priority[] = ["low", "medium", "high"];
      if (!allowed.includes(body.priority)) {
        return NextResponse.json(
          { success: false, error: "Field 'priority' must be 'low', 'medium', or 'high'" },
          { status: 400 }
        );
      }
      updatePayload.priority = body.priority;
    }

    // Validate category
    if (body.category !== undefined && body.category !== null) {
      if (typeof body.category !== "string") {
        return NextResponse.json(
          { success: false, error: "Field 'category' must be a string" },
          { status: 400 }
        );
      }
      if (body.category.trim().length > 50) {
        return NextResponse.json(
          { success: false, error: "Field 'category' exceeds 50 characters" },
          { status: 400 }
        );
      }
      updatePayload.category = body.category.trim();
    }

    const updated = await updateTodo(id, updatePayload);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Todo with id '${id}' not found` },
        { status: 404 }
      );
    }

    const dbInfo = await checkDbConnection(false);
    return NextResponse.json(
      {
        success: true,
        message: "Todo updated successfully",
        data: updated,
        databaseStatus: dbInfo.connected ? "connected" : "fallback_memory",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API PUT /api/todos/:id Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error: Unable to update todo" },
      { status: 500 }
    );
  }
}

// PATCH /api/todos/:id - Partial update
export async function PATCH(request: Request, context: RouteProps) {
  return PUT(request, context);
}

// DELETE /api/todos/:id - Delete todo item
export async function DELETE(request: Request, { params }: RouteProps) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 60, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const { id } = await params;
    if (!id || !isValidId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const success = await deleteTodo(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Todo with id '${id}' not found` },
        { status: 404 }
      );
    }

    const dbInfo = await checkDbConnection(false);
    return NextResponse.json(
      {
        success: true,
        message: `Todo with id '${id}' deleted successfully`,
        databaseStatus: dbInfo.connected ? "connected" : "fallback_memory",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API DELETE /api/todos/:id Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error: Unable to delete todo" },
      { status: 500 }
    );
  }
}
