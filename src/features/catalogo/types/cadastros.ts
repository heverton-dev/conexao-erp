export type FieldType = "text" | "number" | "color" | "toggle" | "select"

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: { value: string; label: string }[]
}

export interface CadastroSubTabConfig {
  headers: string[]
  rows: any[]
  fields: FieldConfig[]
  table: string
  pk: string
}

export interface DeleteItem {
  id: string
  label: string
  table: string
}
