import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readdirSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const server = new Server(
  { name: "mcp-tanstack", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "tanstack_create_route",
      description: "Cria rota TanStack Router",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path da rota (ex: /modulo/page)",
          },
          component: { type: "string", description: "Nome do componente" },
          protected: {
            type: "boolean",
            description: "Se a rota é protegida",
            default: true,
          },
        },
        required: ["path", "component"],
      },
    },
    {
      name: "tanstack_list_routes",
      description: "Lista rotas existentes",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "tanstack_create_route": {
      const path = args?.path as string;
      const component = args?.component as string;

      const routeDir = join(
        process.cwd(),
        "src",
        "routes",
        ...path.split("/").filter(Boolean),
      );
      if (!existsSync(routeDir)) {
        mkdirSync(routeDir, { recursive: true });
      }

      const routeContent = `import { createFileRoute } from '@tanstack/react-router'
import { ${component} } from '~/features/${path.split("/")[1]}/pages/${component}'

export const Route = createFileRoute('${path}')({
  component: ${component},
})
`;
      writeFileSync(join(routeDir, "index.tsx"), routeContent);

      return {
        content: [
          {
            type: "text",
            text: `Rota ${path} criada com componente ${component}`,
          },
        ],
      };
    }
    case "tanstack_list_routes": {
      const routesDir = join(process.cwd(), "src", "routes");
      const listRoutes = (dir: string, prefix = ""): string[] => {
        const entries = readdirSync(dir, { withFileTypes: true });
        const routes: string[] = [];
        for (const entry of entries) {
          if (entry.isDirectory()) {
            routes.push(
              ...listRoutes(join(dir, entry.name), `${prefix}/${entry.name}`),
            );
          } else if (
            entry.name.endsWith(".tsx") &&
            entry.name !== "_auth.tsx" &&
            entry.name !== "__root.tsx"
          ) {
            routes.push(prefix || "/");
          }
        }
        return routes;
      };
      const routes = listRoutes(routesDir);
      return {
        content: [
          { type: "text", text: `Rotas existentes: ${routes.join(", ")}` },
        ],
      };
    }
    default:
      throw new Error(`Tool desconhecida: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
