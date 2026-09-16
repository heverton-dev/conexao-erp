export {
  type Permissoes,
  type Ambiente,
  type ModulosAcesso,
  type ModuloAcesso,
} from "./types";
export {
  type PermGroup,
  registerCorePermissions,
  getAllPermissions,
  getPermGroups,
  getPermLabel,
  getPermDesc,
  getPermissoesPadrao,
} from "./constants";
export {
  getPermissoes,
  setPermissoes,
  getModulosAcesso,
  setModulosAcesso,
  listarPermissoesUsuarios,
} from "./services";

import { getAllPermissionDefs } from "~/registry";
import { getPermGroups, getPermLabel, getPermDesc } from "./constants";

export const PERMISSOES_GROUPS = new Proxy([] as any[], {
  get(_, prop) {
    if (prop === Symbol.iterator)
      return getPermGroups()[Symbol.iterator].bind(getPermGroups());
    const target = getPermGroups();
    return (target as any)[prop];
  },
});

export const PERMISSOES_LABEL = new Proxy({} as Record<string, string>, {
  get(_, prop: string) {
    return getPermLabel(prop);
  },
});

export const PERMISSOES_DESC = new Proxy({} as Record<string, string>, {
  get(_, prop: string) {
    return getPermDesc(prop);
  },
});

export const ALL_PERMISSIONS = new Proxy([] as any[], {
  get(_, prop) {
    if (prop === Symbol.iterator)
      return getAllPermissionDefs()[Symbol.iterator].bind(
        getAllPermissionDefs(),
      );
    const target = getAllPermissionDefs();
    return (target as any)[prop];
  },
});
