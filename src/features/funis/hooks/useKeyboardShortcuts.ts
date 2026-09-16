import { useEffect, useCallback } from "react";

type ShortcutHandlers = {
  onNewTask?: () => void;
  onFocusSearch?: () => void;
  onSwitchView?: (viewIndex: number) => void;
  onEscape?: () => void;
  onSelectAll?: () => void;
  onDelete?: () => void;
  onShowHelp?: () => void;
};

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (e.key === "Escape") {
        handlers.onEscape?.();
        return;
      }

      if (isInput) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        handlers.onNewTask?.();
        return;
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        handlers.onFocusSearch?.();
        return;
      }

      if (e.key === "1") {
        e.preventDefault();
        handlers.onSwitchView?.(0);
        return;
      }

      if (e.key === "2") {
        e.preventDefault();
        handlers.onSwitchView?.(1);
        return;
      }

      if (e.key === "3") {
        e.preventDefault();
        handlers.onSwitchView?.(2);
        return;
      }

      if (e.key === "4") {
        e.preventDefault();
        handlers.onSwitchView?.(3);
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        handlers.onShowHelp?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        handlers.onSelectAll?.();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (!isInput) {
          e.preventDefault();
          handlers.onDelete?.();
        }
      }
    },
    [handlers],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
