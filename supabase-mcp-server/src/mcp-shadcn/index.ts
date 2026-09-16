import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { execSync } from "child_process";

const SAFE_PATH_PATTERN = /^[a-zA-Z0-9_\-\/]+$/;
const ALLOWED_COMPONENTS = new Set([
  "accordion", "alert", "alert-dialog", "avatar", "badge", "button",
  "calendar", "card", "carousel", "chart", "checkbox", "collapsible",
  "command", "context-menu", "dialog", "drawer", "dropdown-menu", "form",
  "hover-card", "input", "input-otp", "label", "menubar",
  "navigation-menu", "pagination", "popover", "progress", "radio-group",
  "resizable", "scroll-area", "select", "separator", "sheet", "sidebar",
  "skeleton", "slider", "sonner", "switch", "table", "tabs", "textarea",
  "toast", "toggle", "toggle-group", "tooltip",
]);

const server = new Server(
  { name: "mcp-shadcn", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "shadcn_add",
      description: "Adiciona componente shadcn/ui ao projeto",
      inputSchema: {
        type: "object",
        properties: {
          component: { type: "string", description: "Nome do componente" },
          path: { type: "string", description: "Caminho de destino" },
        },
        required: ["component"],
      },
    },
    {
      name: "shadcn_list",
      description: "Lista componentes shadcn/ui disponíveis",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "shadcn_add": {
      const component = args?.component as string;
      const path = (args?.path as string) || "src/components/ui";
      if (!ALLOWED_COMPONENTS.has(component)) {
        return { content: [{ type: "text", text: `Componente '${component}' não é válido. Use shadcn_list para ver opções.` }] };
      }
      if (!SAFE_PATH_PATTERN.test(path) || path.length > 200) {
        return { content: [{ type: "text", text: `Path inválido: ${path}` }] };
      }
      try {
        execSync(`npx shadcn-ui@latest add ${component} --path ${path}`, {
          stdio: "pipe",
        });
        return {
          content: [
            {
              type: "text",
              text: `Componente ${component} adicionado em ${path}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Erro ao adicionar componente: ${error}` },
          ],
        };
      }
    }
    case "shadcn_list": {
      const available = [
        "accordion",
        "alert",
        "alert-dialog",
        "avatar",
        "badge",
        "button",
        "calendar",
        "card",
        "carousel",
        "chart",
        "checkbox",
        "collapsible",
        "command",
        "context-menu",
        "dialog",
        "drawer",
        "dropdown-menu",
        "form",
        "hover-card",
        "input",
        "input-otp",
        "label",
        "menubar",
        "navigation-menu",
        "pagination",
        "popover",
        "progress",
        "radio-group",
        "resizable",
        "scroll-area",
        "select",
        "separator",
        "sheet",
        "sidebar",
        "skeleton",
        "slider",
        "sonner",
        "switch",
        "table",
        "tabs",
        "textarea",
        "toast",
        "toggle",
        "toggle-group",
        "tooltip",
      ];
      return {
        content: [
          {
            type: "text",
            text: `Componentes disponíveis: ${available.join(", ")}`,
          },
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
