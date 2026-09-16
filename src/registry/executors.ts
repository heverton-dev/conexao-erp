type ActionExecutor = (
  id: string,
  payload: Record<string, any>,
) => Promise<any>;

const executors = new Map<string, ActionExecutor>();

export function registerActionExecutor(type: string, fn: ActionExecutor): void {
  executors.set(type, fn);
}

export function getActionExecutor(type: string): ActionExecutor | undefined {
  return executors.get(type);
}
