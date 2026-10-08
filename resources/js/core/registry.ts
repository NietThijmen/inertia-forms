export type ComponentMap<T> = Partial<Record<string, T>>;

export function resolveComponent<T>(
	type: string,
	custom: ComponentMap<T> | undefined,
	builtins: ComponentMap<T>,
	fallback: T,
): T {
	return custom?.[type] ?? builtins[type] ?? fallback;
}
