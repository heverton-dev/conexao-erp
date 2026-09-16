import React from 'react';
import { Eye, EyeOff, Edit3 } from 'lucide-react';
import '../styles/theme.css';

interface Props {
  title?: string;
  headers: string[];
  rows: any[];
  onToggle: (id: string, state: boolean) => void;
}

export function DataTable({ title, headers, rows, onToggle }: Props) {
  return (
    <div className="catalogo-theme bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
      {title && (
        <div className="p-6 border-b border-[var(--color-border-subtle)] flex justify-between">
          <h3 className="text-xl font-bold text-gradient-gold">{title}</h3>
          <button className="px-5 py-2.5 rounded-lg bg-gradient-gold text-[#0f172a] font-bold text-sm">+ Novo</button>
        </div>
      )}
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[var(--color-bg)]/50">
            {headers.map((h, i) => (
              <th
                key={i}
                className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase border-b border-[var(--color-border-subtle)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.sku}
              className={`hover:bg-[var(--color-surface-hover)]/40 border-b border-[var(--color-border-subtle)] ${!row.ativo ? 'opacity-40 bg-red-950/5' : ''}`}
            >
              <td className="p-4 font-mono text-sm">{row.sku}</td>
              <td className="p-4 font-semibold">{row.nome}</td>
              <td className="p-4">
                <button
                  onClick={() => onToggle(row.sku, !row.ativo)}
                  className={`p-2 rounded-lg ${row.ativo ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-error-bg)] text-[var(--color-error)]'}`}
                >
                  {row.ativo ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
