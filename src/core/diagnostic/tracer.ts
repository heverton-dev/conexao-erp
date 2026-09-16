import { supabase } from "~/core/supabase";
import type { LogEntry } from "./tipos";

function gerarId() { return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2); }
function now() { return new Date().toISOString(); }

const FILTER_METHODS = new Set([
  "eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike",
  "is", "in", "not", "or", "match", "overlaps", "contains", "containedBy",
  "rangeGt", "rangeGte", "rangeLt", "rangeLte", "textSearch",
]);

class QueryTracker {
  table: string;
  op: string = "";
  data: any = null;
  filters: string[] = [];
  start: number;

  constructor(table: string) {
    this.table = table;
    this.start = performance.now();
  }

  makeEntry(result?: any, error?: any): LogEntry {
    let msg = `${this.op} ${this.table}`;
    if (this.data) {
      const d = JSON.stringify(this.data);
      msg += `\n  dados: ${d.length > 300 ? d.slice(0, 300) + "..." : d}`;
    }
    if (this.filters.length) {
      msg += `\n  filtros: ${this.filters.join(" | ")}`;
    }
    if (result !== undefined) {
      const r = JSON.stringify(result);
      msg += `\n  resultado: ${r.length > 500 ? r.slice(0, 500) + "..." : r}`;
    }
    return {
      id: gerarId(),
      timestamp: now(),
      level: error ? "error" : "sql",
      message: msg,
      duration: Math.round(performance.now() - this.start),
    };
  }
}

const opMethods = new Set(["select", "insert", "update", "delete", "upsert"]);

function wrapProxy(builder: any, t: QueryTracker, onLog: (e: LogEntry) => void): any {
  return new Proxy(builder, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);

      if (prop === "then" && typeof val === "function") {
        return (onOk?: any, onErr?: any) =>
          val.call(
            target,
            (r: any) => { onLog(t.makeEntry(r)); return onOk?.(r); },
            (e: any) => { onLog(t.makeEntry(undefined, e)); return onErr?.(e); },
          );
      }

      if (typeof val !== "function") return val;

      return (...args: any[]) => {
        if (opMethods.has(prop as string)) {
          t.op = (prop as string).toUpperCase();
          if (args[0] !== undefined) t.data = args[0];
        }
        if (FILTER_METHODS.has(prop as string)) {
          t.filters.push(`${String(prop)}(${args.map((a: any) => JSON.stringify(a)).join(", ")})`);
        }
        if (prop === "single" || prop === "maybeSingle") {
          t.filters.push(prop as string);
        }
        const result = val.apply(target, args);
        if (result && typeof result === "object" && result !== target) {
          return wrapProxy(result, t, onLog);
        }
        return result;
      };
    },
  });
}

let originalFrom: ((...args: any[]) => any) | null = null;

export function ativarTracer(onLog: (e: LogEntry) => void) {
  if (originalFrom) return;
  originalFrom = (supabase as any).from.bind(supabase);

  (supabase as any).from = (table: string) => {
    const builder = originalFrom!(table);
    const tracker = new QueryTracker(table);
    return wrapProxy(builder, tracker, onLog);
  };
}

export function desativarTracer() {
  if (!originalFrom) return;
  (supabase as any).from = originalFrom;
  originalFrom = null;
}
