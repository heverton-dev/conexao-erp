import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { spawn } from "child_process";

function testRunnerPlugin(): Plugin {
  return {
    name: "test-runner",
    configureServer(server) {
      server.middlewares.use("/api/testes", async (req, res) => {
        if (req.method !== "POST" && req.method !== "OPTIONS") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          res.end();
          return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const { testFiles } = JSON.parse(body || "{}");
            if (
              !testFiles ||
              !Array.isArray(testFiles) ||
              testFiles.length === 0
            ) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "testFiles array required" }));
              return;
            }

            // Security: validate each path against safe pattern (only test file paths)
            const SAFE_PATH_PATTERN = /^[a-zA-Z0-9_\.\-\/\.]+$/;
            const safeFiles = testFiles.filter((f: string) =>
              typeof f === "string" &&
              f.length > 0 &&
              f.length < 200 &&
              SAFE_PATH_PATTERN.test(f) &&
              (f.endsWith(".test.ts") ||
                f.endsWith(".test.tsx") ||
                f.endsWith(".test.js") ||
                f.endsWith(".spec.ts") ||
                f.endsWith(".spec.tsx") ||
                f.endsWith(".spec.js") ||
                f.endsWith(".smoke.js"))
            );
            if (safeFiles.length === 0) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "No valid test file paths provided" }));
              return;
            }

            const cwd = process.cwd();

            const child = spawn(
              "npx",
              [
                "vitest",
                "run",
                ...safeFiles,
                "--reporter=json",
                "--reporter=verbose",
                "--no-file-parallelism",
              ],
              {
                cwd,
                env: { ...process.env, FORCE_COLOR: "0" },
              },
            );

            let stdout = "";
            let stderr = "";

            child.stdout.on("data", (data: Buffer) => {
              stdout += data.toString();
            });

            child.stderr.on("data", (data: Buffer) => {
              stderr += data.toString();
            });

            child.on("close", (code) => {
              const output = stdout || stderr;
              res.end(
                JSON.stringify({
                  success: code === 0,
                  output,
                  exitCode: code,
                }),
              );
            });

            child.on("error", (err) => {
              res.end(
                JSON.stringify({
                  success: false,
                  output: err.message,
                  exitCode: 1,
                }),
              );
            });
          } catch (err: any) {
            res.end(JSON.stringify({ success: false, output: err.message }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), testRunnerPlugin()],
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Função (não objeto) para pegar também "react/jsx-runtime", que o objeto anterior
          // não capturava — por isso o react-vendor gerado ficava com ~1 byte e o React
          // acabava vazando pro chunk principal.
          if (/node_modules\/(react|react-dom)\//.test(id) || id.includes("react/jsx-runtime")) {
            return "react-vendor";
          }
          if (/node_modules\/@tanstack\/(react-router|react-query)\//.test(id)) {
            return "tanstack";
          }
          if (/node_modules\/@radix-ui\//.test(id)) {
            return "radix";
          }
          if (id.includes("node_modules/recharts")) {
            return "charts";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "lucide";
          }
        },
      },
    },
  },
});
