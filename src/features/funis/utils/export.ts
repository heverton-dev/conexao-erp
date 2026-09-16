import type { Funil } from "../types";

export function exportToCSV(funil: Funil): string {
  const tarefas = funil.tarefas ?? [];
  const colunas = funil.colunas ?? [];
  const colunaMap = new Map(colunas.map((c) => [c.id, c.titulo]));
  const headers = [
    "Título",
    "Descrição",
    "Prioridade",
    "Coluna",
    "Responsável",
    "Data Início",
    "Data Fim",
    "Status",
    "Criado em",
  ];
  const rows = tarefas
    .filter((t) => !t.parent_task_id)
    .map((t) => [
      esc(t.titulo),
      esc(t.descricao ?? ""),
      esc(t.prioridade),
      esc(colunaMap.get(t.coluna_id) ?? ""),
      esc(t.atribuido_para ?? ""),
      esc(
        t.data_inicio
          ? new Date(t.data_inicio).toLocaleDateString("pt-BR")
          : "",
      ),
      esc(t.data_fim ? new Date(t.data_fim).toLocaleDateString("pt-BR") : ""),
      esc(t.completed_at ? "Concluída" : "Em andamento"),
      esc(new Date(t.created_at).toLocaleDateString("pt-BR")),
    ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function esc(v: string): string {
  return v.includes(",") || v.includes('"') || v.includes("\n")
    ? `"${v.replace(/"/g, '""')}"`
    : v;
}

export function exportToJSON(funil: Funil): string {
  return JSON.stringify(
    {
      funil: {
        id: funil.id,
        titulo: funil.titulo,
        descricao: funil.descricao,
        created_at: funil.created_at,
      },
      colunas: funil.colunas?.map((c) => ({
        id: c.id,
        titulo: c.titulo,
        posicao: c.posicao,
      })),
      tarefas: funil.tarefas?.map((t) => ({
        id: t.id,
        titulo: t.titulo,
        descricao: t.descricao,
        prioridade: t.prioridade,
        coluna_id: t.coluna_id,
        atribuido_para: t.atribuido_para,
        data_inicio: t.data_inicio,
        data_fim: t.data_fim,
        completed_at: t.completed_at,
        tools: t.tools,
      })),
    },
    null,
    2,
  );
}

export function exportToPDF(funil: Funil): void {
  const tarefas = funil.tarefas ?? [];
  const colunas = funil.colunas ?? [];
  const parentTarefas = tarefas.filter((t) => !t.parent_task_id);
  const done = parentTarefas.filter((t) => !!t.completed_at).length;
  const total = parentTarefas.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${funil.titulo}</title><style>
    body{font-family:Arial,sans-serif;padding:40px;color:#333}h1{color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:10px}
    .meta{color:#64748b;font-size:14px;margin-bottom:30px}.progress{background:#e2e8f0;border-radius:8px;height:20px;margin:20px 0}
    .progress-bar{background:#10b981;height:100%;border-radius:8px}.stats{display:flex;gap:30px;margin:20px 0}.stat{text-align:center}
    .stat-value{font-size:24px;font-weight:bold;color:#0f172a}.stat-label{font-size:12px;color:#64748b}
    table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0;font-size:13px}
    th{background:#f8fafc;font-weight:600;color:#475569}.completed{text-decoration:line-through;color:#94a3b8}@media print{body{padding:20px}}
  </style></head><body>
    <h1>${funil.titulo}</h1><div class="meta">${funil.descricao ? `<p>${funil.descricao}</p>` : ""}<p>Gerado em: ${new Date().toLocaleDateString("pt-BR")}</p></div>
    <div class="stats"><div class="stat"><div class="stat-value">${total}</div><div class="stat-label">Total</div></div><div class="stat"><div class="stat-value">${done}</div><div class="stat-label">Concluídas</div></div><div class="stat"><div class="stat-value">${pct}%</div><div class="stat-label">Progresso</div></div></div>
    <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
    ${colunas
      .map(
        (col) =>
          `<h3>${col.titulo}</h3><table><thead><tr><th>Tarefa</th><th>Prioridade</th><th>Status</th><th>Prazo</th></tr></thead><tbody>${tarefas
            .filter((t) => t.coluna_id === col.id && !t.parent_task_id)
            .map(
              (t) =>
                `<tr class="${t.completed_at ? "completed" : ""}"><td>${t.titulo}</td><td>${t.prioridade}</td><td>${t.completed_at ? "Concluída" : "Em andamento"}</td><td>${t.data_fim ? new Date(t.data_fim).toLocaleDateString("pt-BR") : "—"}</td></tr>`,
            )
            .join("")}</tbody></table>`,
      )
      .join("")}
    <script>window.print();</script></body></html>`;
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
