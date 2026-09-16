#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pg from "pg";

const { Client } = pg;

const DB_URL = process.env.SUPABASE_DB_URL;
if (!DB_URL) {
  console.error("ERROR: SUPABASE_DB_URL environment variable is required");
  console.error(
    "Format: postgresql://postgres:password@db.project.supabase.co:5432/postgres",
  );
  process.exit(1);
}

const CHARACTER_LIMIT = 50000;

async function getClient() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

function truncate(text: string, limit = CHARACTER_LIMIT): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + `\n\n... [truncated at ${limit} characters]`;
}

const server = new McpServer({
  name: "supabase-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "supabase_execute_sql",
  {
    title: "Execute SQL Query",
    description: `Execute SQL statements on the Supabase PostgreSQL database.
Use this for SELECT queries, DDL operations, and data modifications.
For semantic queries (natural language about schema/content), use supabase_list_tables or supabase_describe_table first.

Args:
  - sql (string): SQL statement(s) to execute. Multiple statements separated by semicolons.
  - max_rows (number, optional): Maximum rows to return for SELECT queries (default: 100, max: 1000)

Returns:
  For SELECT: Array of result rows as JSON.
  For INSERT/UPDATE/DELETE: Affected row count.
  For DDL: Success confirmation.

Examples:
  - "SELECT * FROM profiles LIMIT 5"
  - "UPDATE profiles SET is_super_admin = true WHERE email = 'user@example.com'"
  - "INSERT INTO app_config (key, value) VALUES ('TEST_KEY', 'test_value')"

Error Handling:
  - Returns error details if SQL syntax is invalid or permission is denied.`,
    inputSchema: z
      .object({
        sql: z
          .string()
          .min(1, "SQL query is required")
          .max(100000)
          .describe("SQL statement(s) to execute"),
        max_rows: z
          .number()
          .int()
          .min(1)
          .max(1000)
          .default(100)
          .describe("Maximum rows to return"),
      })
      .strict(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (params) => {
    const client = await getClient();
    try {
      const isSelect = params.sql.trim().toUpperCase().startsWith("SELECT");
      const result = await client.query(params.sql);
      await client.end();

      if (isSelect) {
        const rows = result.rows.slice(0, params.max_rows);
        const output = {
          row_count: result.rows.length,
          returned: rows.length,
          truncated: result.rows.length > params.max_rows,
          columns: result.fields?.map((f: any) => f.name) || [],
          rows,
        };
        return {
          content: [
            { type: "text", text: truncate(JSON.stringify(output, null, 2)) },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                affected_rows: result.rowCount ?? 0,
                command: result.command,
                success: true,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (e: any) {
      await client.end();
      return {
        content: [{ type: "text", text: `Error: ${e.message || String(e)}` }],
      };
    }
  },
);

server.registerTool(
  "supabase_list_tables",
  {
    title: "List Database Tables",
    description: `List all tables in the Supabase PostgreSQL database with their schema names.

Use this first to discover available tables before querying or describing them.

Returns:
  Array of { schema, name, type, owner } objects.

Examples:
  - Use when: "What tables are in the database?" or "Show me all available tables"`,
    inputSchema: z
      .object({
        schema: z
          .string()
          .default("public")
          .describe("Schema to list tables from (default: public)"),
      })
      .strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async (params) => {
    const client = await getClient();
    try {
      const result = await client.query(
        `
        SELECT table_schema, table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = $1
        ORDER BY table_name
      `,
        [params.schema],
      );
      await client.end();

      const output = {
        schema: params.schema,
        tables: result.rows.map((r: any) => ({
          name: r.table_name,
          type: r.table_type,
        })),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      };
    } catch (e: any) {
      await client.end();
      return {
        content: [{ type: "text", text: `Error: ${e.message || String(e)}` }],
      };
    }
  },
);

server.registerTool(
  "supabase_describe_table",
  {
    title: "Describe Table Schema",
    description: `Get the column definitions, types, constraints, and policies for a specific table.

Use this before querying a table to understand its schema, foreign keys, and RLS policies.

Args:
  - table (string): Table name to describe
  - schema (string, optional): Schema name (default: public)

Returns:
  Columns with name, type, nullable, default, and constraint information.
  Also shows row-level security (RLS) policies if any.

Examples:
  - "Describe the profiles table" → params with table="profiles"
  - "Show schema of cadastros" → params with table="cadastros"`,
    inputSchema: z
      .object({
        table: z.string().min(1).max(200).describe("Table name"),
        schema: z
          .string()
          .default("public")
          .describe("Schema name (default: public)"),
      })
      .strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async (params) => {
    const client = await getClient();
    try {
      const [columns, policies] = await Promise.all([
        client.query(
          `
          SELECT
            c.column_name, c.data_type, c.is_nullable, c.column_default,
            c.character_maximum_length, c.ordinal_position,
            tc.constraint_type,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.columns c
          LEFT JOIN information_schema.key_column_usage kcu
            ON c.column_name = kcu.column_name
            AND c.table_name = kcu.table_name
            AND c.table_schema = kcu.table_schema
          LEFT JOIN information_schema.table_constraints tc
            ON kcu.constraint_name = tc.constraint_name
            AND kcu.table_schema = tc.table_schema
          LEFT JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
            AND tc.table_schema = ccu.table_schema
            AND tc.constraint_type = 'FOREIGN KEY'
          WHERE c.table_name = $1 AND c.table_schema = $2
          ORDER BY c.ordinal_position
        `,
          [params.table, params.schema],
        ),
        client.query(
          `
          SELECT policyname, permissive, roles, cmd, qual, with_check
          FROM pg_policies
          WHERE tablename = $1 AND schemaname = $2
          ORDER BY policyname
        `,
          [params.table, params.schema],
        ),
      ]);
      await client.end();

      const output = {
        table: `${params.schema}.${params.table}`,
        columns: columns.rows.map((r: any) => ({
          name: r.column_name,
          type: r.data_type,
          nullable: r.is_nullable === "YES",
          default: r.column_default || null,
          constraint: r.constraint_type || null,
          references: r.foreign_table_name
            ? `${r.foreign_table_name}(${r.foreign_column_name})`
            : null,
        })),
        row_level_security:
          policies.rows.length > 0
            ? policies.rows.map((r: any) => ({
                name: r.policyname,
                command: r.cmd,
                roles: r.roles,
                using: r.qual,
                with_check: r.with_check,
              }))
            : [],
      };

      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      };
    } catch (e: any) {
      await client.end();
      return {
        content: [{ type: "text", text: `Error: ${e.message || String(e)}` }],
      };
    }
  },
);

server.registerTool(
  "supabase_apply_migration",
  {
    title: "Apply SQL Migration File",
    description: `Read and execute a SQL migration file from the project's supabase/migrations directory.

Use this to apply pending migrations, seed data, or run schema changes.

Args:
  - filename (string): Name of the migration file (e.g., "00006_admin.sql") or full relative path.
    The file must exist inside the supabase/migrations/ directory.

Returns:
  Confirmation with execution results.

Examples:
  - "Apply the admin migration" → params with filename="00006_admin.sql"
  - "Run the latest migration" → params with filename="00006_admin.sql"

Error Handling:
  - Returns error if file not found or SQL execution fails.`,
    inputSchema: z
      .object({
        filename: z
          .string()
          .min(1)
          .max(500)
          .describe("Migration filename (e.g., 00006_admin.sql)"),
      })
      .strict(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async (params) => {
    const fs = await import("fs");
    const path = await import("path");
    const cwd = process.cwd();
    const possiblePaths = [
      path.join(cwd, "supabase", "migrations", params.filename),
      path.join(cwd, params.filename),
    ];

    let sql: string | null = null;
    let usedPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        sql = fs.readFileSync(p, "utf8");
        usedPath = p;
        break;
      }
    }

    if (!sql) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Migration file '${params.filename}' not found in supabase/migrations/ or project root.`,
          },
        ],
      };
    }

    const client = await getClient();
    try {
      await client.query(sql);
      await client.end();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                file: usedPath,
                message: `Migration '${params.filename}' applied successfully.`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (e: any) {
      await client.end();
      return {
        content: [
          {
            type: "text",
            text: `Error applying migration '${params.filename}': ${e.message || String(e)}`,
          },
        ],
      };
    }
  },
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("supabase-mcp-server running via stdio");
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
