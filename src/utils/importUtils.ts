import { pathToFileURL } from "url";

/**
 * Dynamically imports a file and returns its default export.
 * @param filePath Absolute or relative path to the module
 * @param fallback Optional fallback value if import fails
 */
export const importFile = async <T = any>(filePath: string, fallback?: T): Promise<T> => {
  try {
    const url = pathToFileURL(filePath).href;
    const module = await import(url);
    if (!module || module.default === undefined) {
      if (fallback !== undefined) return fallback;
      throw new Error(`Module loaded but default export is undefined: ${filePath}`);
    }
    return module.default as T;
  } catch (err) {
    console.error(`[importFile] Failed to import module: ${filePath}`, err);
    if (fallback !== undefined) return fallback;
    throw err;
  }
};
