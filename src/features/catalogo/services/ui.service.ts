import { useSyncExternalStore } from "react"
import type { ProductSheetTipo } from "../types"

interface UIState {
  cartDrawerOpen: boolean;
  navDrawerOpen: boolean;
  imageViewer: {
    isOpen: boolean;
    src: string;
    alt: string;
  };
  productSheet: {
    isOpen: boolean;
    sku: string;
    tipo: ProductSheetTipo | null;
  };
}

let state: UIState = {
  cartDrawerOpen: false,
  navDrawerOpen: false,
  imageViewer: { isOpen: false, src: "", alt: "" },
  productSheet: { isOpen: false, sku: "", tipo: null },
}
let listeners: Array<() => void> = []

function notify() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener)
  return () => { listeners = listeners.filter((l) => l !== listener) }
}

function getSnapshot(): UIState {
  return state
}

export function useUIState(): UIState {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function toggleCartDrawer(open?: boolean) {
  state = { ...state, cartDrawerOpen: open ?? !state.cartDrawerOpen }
  notify()
}

export function toggleNavDrawer(open?: boolean) {
  state = { ...state, navDrawerOpen: open ?? !state.navDrawerOpen }
  notify()
}

export function openImageViewer(src: string, alt: string) {
  state = { ...state, imageViewer: { isOpen: true, src, alt } }
  notify()
}

export function closeImageViewer() {
  state = { ...state, imageViewer: { isOpen: false, src: "", alt: "" } }
  notify()
}

export function openProductSheet(sku: string, tipo: ProductSheetTipo) {
  state = { ...state, productSheet: { isOpen: true, sku, tipo } }
  notify()
}

export function closeProductSheet() {
  state = { ...state, productSheet: { isOpen: false, sku: "", tipo: null } }
  notify()
}
