import { useContext } from "react";
import { EmpresaContext } from "./EmpresaContext";

export function useEmpresa() {
  return useContext(EmpresaContext);
}
