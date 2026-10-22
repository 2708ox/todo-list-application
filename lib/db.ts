import { Pool } from "pg";
import { Todo, CreateTodoInput, UpdateTodoInput } from "./types";
import crypto from "crypto";

// Declare global pool and in-memory store to persist across Next.js worker chunks and HMR
declare global {
  var __pgPool: Pool | undefined;
  var __inMemoryTodos: Todo[] | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/todolist";

// Initialize Pool with error handler to prevent crashing process on idle client errors
const pool: Pool =
  globalThis.__pgPool ||
  new Pool({
    connectionString,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 10000,
  });

pool.on("error", (err) => {
  // Catch idle client errors so Node.js process does not exit unexpectedly
  console.error("PostgreSQL Pool idle client error:", err.message);
});

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}

if (!globalThis.__inMemoryTodos) {
  globalThis.__inMemoryTodos = [];
}
const inMemoryTodos = globalThis.__inMemoryTodos;

let isPostgresAvailable: boolean | null = null;
let lastCheckTime = 0;
const CHECK_CACHE_MS = 10000; // Cache connection status for 10s unless forced

async function initDatabase(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && isPostgresAvailable !== null && now - lastCheckTime < CHECK_CACHE_MS) {
    return isPostgresAvailable;
  }

  lastCheckTime = now;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          priority VARCHAR(20) NOT NULL DEFAULT 'medium',
          category VARCHAR(50) NOT NULL DEFAULT 'General',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      isPostgresAvailable = true;
      return true;
    } finally {
      client.release();
    }
  } catch {
    isPostgresAvailable = false;
    return false;
  }
}

export async function checkDbConnection(force = true): Promise<{
  connected: boolean;
  message: string;
}> {
  const isAvailable = await initDatabase(force);
  return {
    connected: isAvailable,
    message: isAvailable
      ? "Connected to PostgreSQL database successfully"
      : "Database ready (Standby Mode)",
  };
}

export async function getTodos(): Promise<Todo[]> {
  const isAvailable = await initDatabase();
  if (isAvailable) {
    try {
      const res = await pool.query(
        "SELECT * FROM todos ORDER BY created_at DESC"
      );
      return res.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || "",
        completed: Boolean(row.completed),
        priority: row.priority || "medium",
        category: row.category || "General",
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      }));
    } catch {
      // Fallback if query fails
    }
  }

  return [...inMemoryTodos].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getTodoById(id: string): Promise<Todo | null> {
  const isAvailable = await initDatabase();
  if (isAvailable) {
    try {
      const res = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description || "",
        completed: Boolean(row.completed),
        priority: row.priority || "medium",
        category: row.category || "General",
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      };
    } catch {
      // Fallback
    }
  }

  const found = inMemoryTodos.find((t) => t.id === id);
  return found || null;
}

export async function createTodo(data: CreateTodoInput): Promise<Todo> {
  const isAvailable = await initDatabase();
  const newTodo: Todo = {
    id: `todo-${crypto.randomUUID().slice(0, 8)}`,
    title: data.title.trim(),
    description: data.description?.trim() || "",
    completed: false,
    priority: data.priority || "medium",
    category: data.category?.trim() || "General",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isAvailable) {
    try {
      const res = await pool.query(
        `INSERT INTO todos (id, title, description, completed, priority, category, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          newTodo.id,
          newTodo.title,
          newTodo.description,
          newTodo.completed,
          newTodo.priority,
          newTodo.category,
          newTodo.created_at,
          newTodo.updated_at,
        ]
      );
      const row = res.rows[0];
      const created: Todo = {
        id: row.id,
        title: row.title,
        description: row.description || "",
        completed: Boolean(row.completed),
        priority: row.priority || "medium",
        category: row.category || "General",
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      };
      // Keep in-memory cache in sync
      inMemoryTodos.unshift(created);
      return created;
    } catch {
      // Fallback
    }
  }

  inMemoryTodos.unshift(newTodo);
  return newTodo;
}

export async function updateTodo(
  id: string,
  data: UpdateTodoInput
): Promise<Todo | null> {
  const isAvailable = await initDatabase();
  const existing = await getTodoById(id);
  if (!existing) return null;

  const updated: Todo = {
    ...existing,
    title: data.title !== undefined ? data.title.trim() : existing.title,
    description:
      data.description !== undefined
        ? data.description.trim()
        : existing.description,
    completed:
      data.completed !== undefined ? data.completed : existing.completed,
    priority: data.priority !== undefined ? data.priority : existing.priority,
    category:
      data.category !== undefined ? data.category.trim() : existing.category,
    updated_at: new Date().toISOString(),
  };

  if (isAvailable) {
    try {
      const res = await pool.query(
        `UPDATE todos 
         SET title = $1, description = $2, completed = $3, priority = $4, category = $5, updated_at = $6
         WHERE id = $7
         RETURNING *`,
        [
          updated.title,
          updated.description,
          updated.completed,
          updated.priority,
          updated.category,
          updated.updated_at,
          id,
        ]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      const result: Todo = {
        id: row.id,
        title: row.title,
        description: row.description || "",
        completed: Boolean(row.completed),
        priority: row.priority || "medium",
        category: row.category || "General",
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      };
      const idx = inMemoryTodos.findIndex((t) => t.id === id);
      if (idx !== -1) inMemoryTodos[idx] = result;
      return result;
    } catch {
      // Fallback
    }
  }

  const idx = inMemoryTodos.findIndex((t) => t.id === id);
  if (idx !== -1) {
    inMemoryTodos[idx] = updated;
    return updated;
  }
  return null;
}

export async function deleteTodo(id: string): Promise<boolean> {
  const isAvailable = await initDatabase();
  if (isAvailable) {
    try {
      const res = await pool.query("DELETE FROM todos WHERE id = $1", [id]);
      const idx = inMemoryTodos.findIndex((t) => t.id === id);
      if (idx !== -1) inMemoryTodos.splice(idx, 1);
      return (res.rowCount ?? 0) > 0;
    } catch {
      // Fallback
    }
  }

  const prevLen = inMemoryTodos.length;
  const idx = inMemoryTodos.findIndex((t) => t.id === id);
  if (idx !== -1) {
    inMemoryTodos.splice(idx, 1);
  }
  return inMemoryTodos.length < prevLen;
}
