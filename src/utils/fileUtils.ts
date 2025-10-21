import { promises as fs } from "fs";
import path from "path";

/**
 * Safe file existence check
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Recursively get files with optional extension filter
 */
export const getAllFiles = async (dir: string, exts: string[] = [".ts", ".js"]): Promise<string[]> => {
  const extSet = new Set(exts);
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(entries.map(async entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return getAllFiles(fullPath, exts);
    if (entry.isFile() && extSet.has(path.extname(entry.name))) return [fullPath];
    return [];
  }));

  return files.flat();
};

/**
 * Read file as string with optional fallback
 */
export const readFileSafe = async (filePath: string, fallback: string = ""): Promise<string> => {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (err) {
    console.error(`Failed to read file: ${filePath}`, err);
    return fallback;
  }
};

/**
 * Read JSON file with type safety and optional fallback
 */
export const readJSON = async <T = any>(filePath: string, fallback?: T): Promise<T> => {
  try {
    const content = await readFileSafe(filePath);
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Failed to parse JSON: ${filePath}`, err);
    if (fallback !== undefined) return fallback;
    throw err;
  }
};

/**
 * Write JSON to file with formatting and optional overwrite protection
 */
export const writeJSON = async (filePath: string, data: any, overwrite: boolean = true): Promise<void> => {
  if (!overwrite && await fileExists(filePath)) {
    throw new Error(`File already exists: ${filePath}`);
  }
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, json, "utf-8");
};

/**
 * Ensure directory exists
 */
export const ensureDir = async (dirPath: string): Promise<void> => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error(`Failed to create directory: ${dirPath}`, err);
    throw err;
  }
};

/**
 * Copy file with optional overwrite
 */
export const copyFile = async (src: string, dest: string, overwrite = true): Promise<void> => {
  if (!overwrite && await fileExists(dest)) {
    throw new Error(`Destination file already exists: ${dest}`);
  }
  await fs.copyFile(src, dest);
};
