import * as XLSX from "xlsx"
import type { ParsedFile, ParsedSheet, RawRow } from "../types"
import { IMPORT_FIELD_CONFIGS, IMPORT_TYPES } from "../constants"
import type { ImportType } from "../types"

const SHEET_NAME_MAX = 31 // limite do Excel para nomes de aba

// Faixa Unicode de marcas diacríticas combinantes (U+0300-U+036F), construída via
// charcode para evitar problemas de codificação ao gravar o arquivo com escapes \u literais.
const DIACRITICS_REGEX = new RegExp(
  String.fromCharCode(0x5b, 0x5c, 0x75, 0x30, 0x33, 0x30, 0x30, 0x2d, 0x5c, 0x75, 0x30, 0x33, 0x36, 0x66, 0x5d),
  "g",
)

/** Normaliza texto para comparação tolerante a acento/caixa (remove diacríticos, minúsculas, trim). */
export function normalizeText(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "").trim()
}

export async function parseImportFile(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    raw: false,
  })

  const sheets: ParsedSheet[] = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name]
    const jsonData = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
      header: 1,
      blankrows: false,
    })

    if (jsonData.length === 0) {
      return { name, headers: [], rows: [], totalRows: 0 }
    }

    const rawHeaders = jsonData[0]
    const headers = rawHeaders.map((h, i) =>
      String(h ?? `col_${i}`).trim()
    )

    const rows: RawRow[] = jsonData.slice(1).map((row) => {
      const obj: RawRow = {}
      headers.forEach((h, i) => {
        const val = row[i]
        obj[h] = val === undefined ? null : (val as string | number | boolean | null)
      })
      return obj
    })

    return { name, headers, rows, totalRows: rows.length }
  })

  return {
    fileName: file.name,
    fileSize: file.size,
    sheets,
  }
}

export function generateTemplateXLSX(importType: ImportType): void {
  const config = IMPORT_FIELD_CONFIGS[importType]
  if (!config) return

  const headerRow = config.targetFields.map((h) => h.label)
  const exampleRow = config.targetFields.map((h) => h.example)
  const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow])

  ws["!cols"] = config.targetFields.map((h) => ({
    wch: Math.max(h.label.length, h.example.length, 15),
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Dados")
  XLSX.writeFile(wb, `template_${importType}.xlsx`)
}

/** Nome da aba usada no template GLOBAL para identificar cada tipo (limitado a 31 chars pelo Excel). */
export function sheetNameForType(type: ImportType): string {
  return IMPORT_FIELD_CONFIGS[type].label.slice(0, SHEET_NAME_MAX)
}

/** Identifica a que ImportType uma aba do arquivo GLOBAL corresponde, pelo nome da aba. */
export function matchSheetNameToImportType(sheetName: string): ImportType | null {
  const target = normalizeText(sheetName)
  return IMPORT_TYPES.find((type) => normalizeText(sheetNameForType(type)) === target) ?? null
}

/** Gera 1 arquivo XLSX com 1 aba por entidade do catálogo (modo GLOBAL). */
export function generateGlobalTemplateXLSX(): void {
  const wb = XLSX.utils.book_new()

  for (const type of IMPORT_TYPES) {
    const config = IMPORT_FIELD_CONFIGS[type]
    const headerRow = config.targetFields.map((h) => h.label)
    const exampleRow = config.targetFields.map((h) => h.example)
    const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow])
    ws["!cols"] = config.targetFields.map((h) => ({
      wch: Math.max(h.label.length, h.example.length, 15),
    }))
    XLSX.utils.book_append_sheet(wb, ws, sheetNameForType(type))
  }

  XLSX.writeFile(wb, "template_catalogo_global.xlsx")
}

export function autoDetectImportType(headers: string[]): ImportType | null {
  const headerSet = new Set(headers.map(normalizeText))

  let bestType: ImportType | null = null
  let bestScore = 0

  for (const type of IMPORT_TYPES) {
    const config = IMPORT_FIELD_CONFIGS[type]
    const requiredFields = config.targetFields.filter((f) => f.required)
    const requiredMatched = requiredFields.every(
      (f) => headerSet.has(normalizeText(f.key)) || headerSet.has(normalizeText(f.label)),
    )
    if (!requiredMatched) continue

    const score = config.targetFields.filter(
      (f) => headerSet.has(normalizeText(f.key)) || headerSet.has(normalizeText(f.label)),
    ).length

    if (score > bestScore) {
      bestScore = score
      bestType = type
    }
  }

  return bestType
}
